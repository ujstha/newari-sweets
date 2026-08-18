export type OrderStatus =
  "pending_review" | "approved" | "declined" | "ready" | "completed" | "cancelled";

const ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending_review: ["approved", "declined"],
  approved: ["ready", "cancelled"],
  declined: [],
  ready: ["completed"],
  completed: [],
  cancelled: [],
};

export function canTransition(current: OrderStatus, next: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[current].includes(next);
}

export function assertTransition(current: OrderStatus, next: OrderStatus): void {
  if (!canTransition(current, next)) {
    throw new Error(`Illegal order status transition: ${current} -> ${next}`);
  }
}
