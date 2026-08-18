"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { computeLinePrice } from "@/lib/domain/pricing";
import { computeDisplayedAllergens } from "@/lib/domain/ingredients";
import type { CatalogProductDetail } from "@/lib/content/public-catalog";
import { getPublicImageUrl } from "@/lib/content/image-url";

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
      quantity,
      unitPriceCents: price.unitPriceCents,
      selectedOptions: product.option_groups.flatMap((g) =>
        g.option_values
          .filter((v) => selected[g.id]?.includes(v.id))
          .map((v) => ({
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
    <main className="mx-auto max-w-3xl p-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          {product.images.length > 0 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- see PLAN.md's Deployment section (no optimizer on Cloudflare) */}
              <img
                src={getPublicImageUrl(product.images[activeImage].storage_path)}
                alt={product.images[activeImage].alt_text}
                className="aspect-square w-full rounded object-cover"
              />
              {product.images.length > 1 ? (
                <div className="mt-2 flex gap-2">
                  {product.images.map((image, i) => (
                    // eslint-disable-next-line @next/next/no-img-element -- see PLAN.md's Deployment section
                    <img
                      key={image.storage_path}
                      src={getPublicImageUrl(image.storage_path)}
                      alt={image.alt_text}
                      onClick={() => setActiveImage(i)}
                      className={`h-16 w-16 cursor-pointer rounded object-cover ${i === activeImage ? "ring-2 ring-black" : ""}`}
                    />
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="aspect-square w-full rounded bg-gray-100" />
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold">{product.name_i18n.en}</h1>
          {product.highlight_note_i18n.en ? (
            <p className="mt-1 rounded bg-amber-100 px-2 py-1 text-xs text-amber-900">
              {product.highlight_note_i18n.en}
            </p>
          ) : null}
          {product.description_i18n.en ? (
            <p className="mt-2 text-sm text-gray-600">{product.description_i18n.en}</p>
          ) : null}
          {product.min_prep_days != null ? (
            <p className="mt-2 text-xs text-gray-500">
              Requires at least {product.min_prep_days} day{product.min_prep_days === 1 ? "" : "s"}{" "}
              notice
            </p>
          ) : null}

          {allergens.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1">
              {allergens.map((a) => (
                <span key={a.id} className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-700">
                  {a.code}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setMode("quick")}
              className={`rounded px-3 py-1 text-sm ${mode === "quick" ? "bg-black text-white" : "border"}`}
            >
              Order as pictured
            </button>
            <button
              type="button"
              onClick={() => setMode("customize")}
              className={`rounded px-3 py-1 text-sm ${mode === "customize" ? "bg-black text-white" : "border"}`}
            >
              Customize
            </button>
          </div>

          {mode === "customize" ? (
            <div className="mt-4 space-y-4">
              {product.option_groups.map((group) => (
                <div key={group.id}>
                  <p className="text-sm font-medium">
                    {group.name}
                    {group.is_required ? " *" : ""}
                  </p>
                  <div className="mt-1 space-y-1">
                    {group.option_values.map((value) => (
                      <label key={value.id} className="flex items-center gap-2 text-sm">
                        <input
                          type={group.selection_type === "single" ? "radio" : "checkbox"}
                          name={group.id}
                          checked={selected[group.id]?.includes(value.id) ?? false}
                          onChange={() => toggleValue(group.id, value.id, group.selection_type)}
                        />
                        {value.label}
                        {value.price_delta_cents !== 0
                          ? ` (${value.price_delta_cents > 0 ? "+" : ""}${(value.price_delta_cents / 100).toFixed(2)} €)`
                          : ""}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <label htmlFor="customNote" className="block text-sm font-medium">
                  Note (optional)
                </label>
                <textarea
                  id="customNote"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded border px-2 py-1 text-sm"
                />
              </div>

              {product.supports_message ? (
                <div>
                  <label htmlFor="cakeMessage" className="block text-sm font-medium">
                    Message on the cake (optional, free)
                  </label>
                  <input
                    id="cakeMessage"
                    value={cakeMessage}
                    onChange={(e) => setCakeMessage(e.target.value)}
                    placeholder="e.g. Happy Birthday Maya"
                    className="mt-1 w-full rounded border px-2 py-1 text-sm"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 flex items-center gap-2">
            <label htmlFor="quantity" className="text-sm font-medium">
              Quantity ({product.unit.code})
            </label>
            <input
              id="quantity"
              type="number"
              min={product.unit.default_step}
              step={product.unit.default_step}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || product.unit.default_step)}
              className="w-20 rounded border px-2 py-1 text-sm"
            />
          </div>

          <p className="mt-4 text-lg font-semibold">{(price.lineTotalCents / 100).toFixed(2)} €</p>

          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-2 w-full rounded bg-black px-4 py-2 text-sm text-white"
          >
            {added ? "Added!" : "Add to cart"}
          </button>
        </div>
      </div>
    </main>
  );
}
