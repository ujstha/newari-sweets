"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { computeLinePrice } from "@/lib/domain/pricing";
import { computeDisplayedAllergens } from "@/lib/domain/ingredients";
import type { CatalogProductDetail } from "@/lib/content/public-catalog";
import { getPublicImageUrl } from "@/lib/content/image-url";
import { QuantityStepper } from "@/components/QuantityStepper";
import { FavoriteButton } from "@/components/FavoriteButton";

function defaultSelections(groups: CatalogProductDetail["option_groups"]) {
  const sel: Record<string, string[]> = {};
  for (const g of groups) {
    const defaults = g.option_values.filter((v) => v.is_default).map((v) => v.id);
    if (g.selection_type === "single") {
      // Only fall back to "first value" when the group is REQUIRED (it must
      // have something selected either way) and has no explicit default --
      // for an optional group (e.g. an add-on like "extra topping"),
      // auto-picking the first value would silently add a paid extra (and
      // its allergens) to every "order as pictured" quick-order, which is
      // not what "optional" means.
      if (defaults.length > 0) {
        sel[g.id] = [defaults[0]];
      } else if (g.is_required && g.option_values[0]) {
        sel[g.id] = [g.option_values[0].id];
      } else {
        sel[g.id] = [];
      }
    } else {
      sel[g.id] = defaults;
    }
  }
  return sel;
}

export function ProductDetail({ product }: { product: CatalogProductDetail }) {
  const { addItem } = useCart();
  const [mode, setMode] = useState<"quick" | "customize">("quick");
  const [selected, setSelected] = useState(() => defaultSelections(product.option_groups));
  const [quantity, setQuantity] = useState(1);
  const [customNote, setCustomNote] = useState("");
  const [cakeMessage, setCakeMessage] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  const selectedValues = useMemo(() => {
    return product.option_groups.flatMap((g) =>
      g.option_values.filter((v) => selected[g.id]?.includes(v.id)),
    );
  }, [product.option_groups, selected]);

  const price = useMemo(
    () =>
      computeLinePrice({
        product: { id: product.id, basePriceCents: product.base_price_cents },
        selectedOptionValues: selectedValues.map((v) => ({
          id: v.id,
          priceDeltaCents: v.price_delta_cents,
        })),
        quantity,
      }),
    [product.id, product.base_price_cents, selectedValues, quantity],
  );

  const allergens = useMemo(
    () =>
      computeDisplayedAllergens(
        product.base_allergens,
        selectedValues.map((v) => ({ id: v.id, ingredient: v.ingredient })),
      ),
    [product.base_allergens, selectedValues],
  );

  function toggleValue(groupId: string, valueId: string, selectionType: "single" | "multiple") {
    setSelected((prev) => {
      if (selectionType === "single") {
        return { ...prev, [groupId]: [valueId] };
      }
      const current = prev[groupId] ?? [];
      const next = current.includes(valueId)
        ? current.filter((id) => id !== valueId)
        : [...current, valueId];
      return { ...prev, [groupId]: next };
    });
  }

  function handleAddToCart() {
    addItem({
      productId: product.id,
      productSlug: product.slug,
      name: product.name_i18n.en ?? "",
      imagePath: product.images[0]?.storage_path ?? null,
      unitLabel: product.unit.code,
      minPrepDays: product.min_prep_days,
      quantity,
      unitPriceCents: price.unitPriceCents,
      selectedOptions: product.option_groups.flatMap((g) =>
        g.option_values
          .filter((v) => selected[g.id]?.includes(v.id))
          .map((v) => ({
            valueId: v.id,
            groupName: g.name,
            valueLabel: v.label,
            priceDeltaCents: v.price_delta_cents,
          })),
      ),
      customNote,
      cakeMessage,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pt-10 pb-28 sm:px-8 sm:py-14">
      <div className="grid gap-10 sm:grid-cols-2 sm:gap-14">
        <div>
          {product.images.length > 0 ? (
            <>
              <div className="aspect-square overflow-hidden rounded-2xl bg-brand-soft">
                {/* eslint-disable-next-line @next/next/no-img-element -- see PLAN.md's Deployment section (no optimizer on Cloudflare) */}
                <img
                  src={getPublicImageUrl(product.images[activeImage].storage_path)}
                  alt={product.images[activeImage].alt_text}
                  className="h-full w-full object-cover"
                />
              </div>
              {product.images.length > 1 ? (
                <div className="mt-3 flex gap-2">
                  {product.images.map((image, i) => (
                    <button
                      key={image.storage_path}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      aria-current={i === activeImage}
                      aria-label={`Show image ${i + 1} of ${product.images.length}`}
                      className={`overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-cream transition-colors ${i === activeImage ? "ring-brand" : "ring-transparent"}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- see PLAN.md's Deployment section */}
                      <img
                        src={getPublicImageUrl(image.storage_path)}
                        alt=""
                        className="h-16 w-16 object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="aspect-square rounded-2xl bg-brand-soft" />
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-3xl font-semibold text-ink">{product.name_i18n.en}</h1>
            <FavoriteButton
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name_i18n.en ?? "",
                imagePath: product.images[0]?.storage_path ?? null,
                priceCents: product.base_price_cents,
                unitCode: product.unit.code,
              }}
              className="mt-1 h-9 w-9 shrink-0 border border-border-warm bg-surface"
            />
          </div>
          {product.highlight_note_i18n.en ? (
            <p className="mt-2 inline-block rounded-full bg-gold-soft px-3 py-1 text-xs font-medium text-ink-soft">
              {product.highlight_note_i18n.en}
            </p>
          ) : null}
          {product.description_i18n.en ? (
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {product.description_i18n.en}
            </p>
          ) : null}
          {product.min_prep_days != null ? (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-faint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M12 7v5l3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Requires at least {product.min_prep_days} day{product.min_prep_days === 1 ? "" : "s"}{" "}
              notice
            </p>
          ) : null}

          {allergens.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {allergens.map((a) => (
                <span
                  key={a.id}
                  className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-dark capitalize"
                >
                  {a.code.replace("_", " ")}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-6 inline-flex rounded-full border border-border-warm bg-surface p-1">
            <button
              type="button"
              onClick={() => setMode("quick")}
              aria-pressed={mode === "quick"}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${mode === "quick" ? "bg-brand text-white" : "text-ink-soft hover:text-ink"}`}
            >
              Order as pictured
            </button>
            <button
              type="button"
              onClick={() => setMode("customize")}
              aria-pressed={mode === "customize"}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${mode === "customize" ? "bg-brand text-white" : "text-ink-soft hover:text-ink"}`}
            >
              Customize
            </button>
          </div>

          {mode === "customize" ? (
            <div className="mt-6 space-y-5">
              {product.option_groups.map((group) => (
                <fieldset key={group.id}>
                  <legend className="field-label mb-2">
                    {group.name}
                    {group.is_required ? " *" : ""}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {group.option_values.map((value) => (
                      <label key={value.id} className="chip-option">
                        <input
                          type={group.selection_type === "single" ? "radio" : "checkbox"}
                          name={group.id}
                          checked={selected[group.id]?.includes(value.id) ?? false}
                          onChange={() => toggleValue(group.id, value.id, group.selection_type)}
                          className="sr-only"
                        />
                        {value.label}
                        {value.price_delta_cents !== 0
                          ? ` (${value.price_delta_cents > 0 ? "+" : ""}${(value.price_delta_cents / 100).toFixed(2)} €)`
                          : ""}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}

              <div>
                <label htmlFor="customNote" className="field-label mb-1.5">
                  Note (optional)
                </label>
                <textarea
                  id="customNote"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  rows={2}
                  className="input-field"
                />
              </div>

              {product.supports_message ? (
                <div>
                  <label htmlFor="cakeMessage" className="field-label mb-1.5">
                    Message on the cake (optional, free)
                  </label>
                  <input
                    id="cakeMessage"
                    value={cakeMessage}
                    onChange={(e) => setCakeMessage(e.target.value)}
                    placeholder="e.g. Happy Birthday Maya"
                    className="input-field"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 flex items-center gap-3">
            <p className="field-label">Quantity ({product.unit.code})</p>
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              min={product.unit.default_step}
              step={product.unit.default_step}
              ariaLabel={product.name_i18n.en ?? "product"}
            />
          </div>

          <p className="mt-5 font-display text-2xl font-semibold text-brand">
            {(price.lineTotalCents / 100).toFixed(2)} €
          </p>

          {/* Hidden on mobile in favor of the sticky bar below -- avoids two
              competing Add to cart buttons on a small screen. Desktop keeps
              this one since it's already in easy reach there. */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="btn-primary mt-3 hidden w-full py-3 sm:flex"
          >
            {added ? "Added to cart ✓" : "Add to cart"}
          </button>
        </div>
      </div>

      {/* Sticky mobile "buy bar" -- price + Add to cart pinned to the
          viewport bottom, always in reach without scrolling back up. The
          highest-leverage mobile e-commerce pattern per the design research
          behind this change; desktop doesn't need it (button's already
          visible in normal flow there). */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border-warm bg-surface/95 px-4 py-3 backdrop-blur sm:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <p className="font-display text-lg font-semibold text-brand">
          {(price.lineTotalCents / 100).toFixed(2)} €
        </p>
        <button type="button" onClick={handleAddToCart} className="btn-primary flex-1 py-2.5">
          {added ? "Added ✓" : "Add to cart"}
        </button>
      </div>
    </main>
  );
}
