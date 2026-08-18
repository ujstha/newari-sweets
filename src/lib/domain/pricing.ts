export interface PriceableOptionValue {
  id: string;
  priceDeltaCents: number;
}

export interface PriceableProduct {
  id: string;
  basePriceCents: number;
}

export interface PriceLineInput {
  product: PriceableProduct;
  selectedOptionValues: PriceableOptionValue[];
  quantity: number;
}

export interface PriceLineResult {
  unitPriceCents: number;
  lineTotalCents: number;
}

/**
 * Authoritative price computation for one order line. Server Actions must
 * call this against live catalog data at order-creation time -- prices
 * submitted from the client are never trusted.
 */
export function computeLinePrice(input: PriceLineInput): PriceLineResult {
  if (input.quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  const unitPriceCents =
    input.product.basePriceCents +
    input.selectedOptionValues.reduce((sum, optionValue) => sum + optionValue.priceDeltaCents, 0);

  if (unitPriceCents < 0) {
    throw new Error("Computed unit price cannot be negative");
  }

  return {
    unitPriceCents,
    lineTotalCents: Math.round(unitPriceCents * input.quantity),
  };
}

export function computeOrderSubtotal(lines: PriceLineResult[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
}
