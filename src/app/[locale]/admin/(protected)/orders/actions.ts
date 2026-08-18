"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertTransition, type OrderStatus } from "@/lib/domain/order-workflow";

async function transitionOrder(
  id: string,
  from: OrderStatus,
  to: OrderStatus,
  extra: Record<string, unknown> = {},
) {
  // Primary guard -- see PLAN.md's Order Review workflow section. The DB
  // trigger (enforce_order_status_transition) is the defense-in-depth
  // backstop for the same rule, checked again regardless of this call.
  assertTransition(from, to);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("orders")
    .update({ status: to, reviewed_at: new Date().toISOString(), reviewed_by: user?.id, ...extra })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function approveOrder(id: string, formData: FormData) {
  const message = (formData.get("message") as string | null)?.trim() || null;
  await transitionOrder(id, "pending_review", "approved", { decision_reason: message });
}

export async function declineOrder(id: string, formData: FormData) {
  const reason = ((formData.get("reason") as string | null) ?? "").trim();
  if (!reason) throw new Error("A reason is required when declining an order.");
  await transitionOrder(id, "pending_review", "declined", { decision_reason: reason });
}

export async function markReady(id: string) {
  await transitionOrder(id, "approved", "ready");
}

export async function markCompleted(id: string) {
  await transitionOrder(id, "ready", "completed");
}

export async function cancelOrder(id: string) {
  await transitionOrder(id, "approved", "cancelled");
}

// GDPR erasure -- blanks customer PII while preserving order/item/price
// data (best-sellers aggregates, your own records). See PLAN.md's Admin/CMS
// "GDPR tools" row.
export async function anonymizeOrder(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({
      customer_name: "[deleted]",
      customer_phone: "[deleted]",
      customer_email: null,
      delivery_address: null,
      delivery_city: null,
      delivery_notes: null,
      customer_note: null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
