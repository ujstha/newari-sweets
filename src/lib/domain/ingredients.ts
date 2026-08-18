export interface AllergenRef {
  id: string;
  code: string;
}

export interface IngredientRef {
  id: string;
  allergens: AllergenRef[];
}

export interface OptionValueSelection {
  id: string;
  ingredient?: IngredientRef | null;
}

/**
 * Live allergen union for catalog display: product base allergens plus the
 * allergens of every currently-selected option value's linked ingredient.
 * Never snapshotted here -- order-time snapshotting happens separately when
 * an order is created, so historical orders stay accurate even if this
 * computation later returns something different.
 *
 * A custom option value with no linked ingredient (a one-off catalog entry
 * with only a free-text `custom_allergen_note`) contributes nothing here --
 * that note is manual/informational and isn't machine-readable allergen data.
 */
export function computeDisplayedAllergens(
  productBaseAllergens: AllergenRef[],
  selectedOptionValues: OptionValueSelection[],
): AllergenRef[] {
  const byId = new Map<string, AllergenRef>();

  for (const allergen of productBaseAllergens) {
    byId.set(allergen.id, allergen);
  }

  for (const optionValue of selectedOptionValues) {
    if (!optionValue.ingredient) continue;
    for (const allergen of optionValue.ingredient.allergens) {
      byId.set(allergen.id, allergen);
    }
  }

  return Array.from(byId.values()).sort((a, b) => a.code.localeCompare(b.code));
}
