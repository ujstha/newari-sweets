import { describe, expect, it } from "vitest";
import { computeLinePrice, computeOrderSubtotal } from "./pricing";

describe("computeLinePrice", () => {
  it("returns the base price when no options are selected", () => {
    const result = computeLinePrice({
      product: { id: "p1", basePriceCents: 1000 },
      selectedOptionValues: [],
      quantity: 1,
    });
    expect(result).toEqual({ unitPriceCents: 1000, lineTotalCents: 1000 });
  });

  it("adds positive option deltas", () => {
    const result = computeLinePrice({
      product: { id: "p1", basePriceCents: 1000 },
      selectedOptionValues: [
        { id: "o1", priceDeltaCents: 200 },
        { id: "o2", priceDeltaCents: 150 },
      ],
      quantity: 1,
    });
    expect(result.unitPriceCents).toBe(1350);
  });

  it("supports negative option deltas", () => {
    const result = computeLinePrice({
      product: { id: "p1", basePriceCents: 1000 },
      selectedOptionValues: [{ id: "o1", priceDeltaCents: -100 }],
      quantity: 1,
    });
    expect(result.unitPriceCents).toBe(900);
  });

  it("scales the line total by fractional (weight-based) quantity", () => {
    const result = computeLinePrice({
      product: { id: "cake", basePriceCents: 2000 },
      selectedOptionValues: [],
      quantity: 1.5,
    });
    expect(result).toEqual({ unitPriceCents: 2000, lineTotalCents: 3000 });
  });

  it("rounds fractional line totals to the nearest cent", () => {
    const result = computeLinePrice({
      product: { id: "p1", basePriceCents: 333 },
      selectedOptionValues: [],
      quantity: 0.1,
    });
    expect(result.lineTotalCents).toBe(33);
  });

  it("throws when quantity is zero or negative", () => {
    expect(() =>
      computeLinePrice({
        product: { id: "p1", basePriceCents: 1000 },
        selectedOptionValues: [],
        quantity: 0,
      }),
    ).toThrow(/Quantity must be greater than zero/);
  });

  it("throws when the computed unit price would go negative", () => {
    expect(() =>
      computeLinePrice({
        product: { id: "p1", basePriceCents: 100 },
        selectedOptionValues: [{ id: "o1", priceDeltaCents: -200 }],
        quantity: 1,
      }),
    ).toThrow(/cannot be negative/);
  });
});

describe("computeOrderSubtotal", () => {
  it("sums line totals across the order", () => {
    const subtotal = computeOrderSubtotal([
      { unitPriceCents: 1000, lineTotalCents: 1000 },
      { unitPriceCents: 500, lineTotalCents: 1500 },
    ]);
    expect(subtotal).toBe(2500);
  });

  it("returns zero for an empty order", () => {
    expect(computeOrderSubtotal([])).toBe(0);
  });
});
