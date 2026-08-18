import { describe, expect, it } from "vitest";
import { cartLeadDays, earliestRequestedDate, effectiveLeadDays } from "./lead-time";

describe("effectiveLeadDays", () => {
  it("uses the product override when set", () => {
    expect(effectiveLeadDays(7, 2)).toBe(7);
  });

  it("falls back to the site default when null", () => {
    expect(effectiveLeadDays(null, 2)).toBe(2);
  });

  it("respects an explicit zero override (same-day allowed)", () => {
    expect(effectiveLeadDays(0, 2)).toBe(0);
  });
});

describe("cartLeadDays", () => {
  it("returns the maximum effective lead time across items", () => {
    expect(
      cartLeadDays(
        [{ productMinPrepDays: 2 }, { productMinPrepDays: 7 }, { productMinPrepDays: null }],
        3,
      ),
    ).toBe(7);
  });

  it("falls back to the site default for an empty cart", () => {
    expect(cartLeadDays([], 3)).toBe(3);
  });
});

describe("earliestRequestedDate", () => {
  it("adds the lead days to today", () => {
    expect(earliestRequestedDate(5, new Date("2026-08-18T00:00:00Z"))).toBe("2026-08-23");
  });

  it("returns today unchanged for zero lead days", () => {
    expect(earliestRequestedDate(0, new Date("2026-08-18T00:00:00Z"))).toBe("2026-08-18");
  });
});
