import { describe, expect, it } from "vitest";
import { computeDisplayedAllergens } from "./ingredients";

const dairy = { id: "a1", code: "dairy" };
const egg = { id: "a2", code: "egg" };
const nuts = { id: "a3", code: "nuts" };

describe("computeDisplayedAllergens", () => {
  it("returns only base allergens when nothing is selected", () => {
    expect(computeDisplayedAllergens([dairy], [])).toEqual([dairy]);
  });

  it("unions base allergens with linked-ingredient allergens", () => {
    const result = computeDisplayedAllergens(
      [dairy],
      [{ id: "ov1", ingredient: { id: "i1", allergens: [nuts] } }],
    );
    expect(result).toEqual([dairy, nuts]);
  });

  it("deduplicates allergens shared by base and an option's ingredient", () => {
    const result = computeDisplayedAllergens(
      [dairy],
      [{ id: "ov1", ingredient: { id: "i1", allergens: [dairy, egg] } }],
    );
    expect(result).toEqual([dairy, egg]);
  });

  it("sorts results by allergen code", () => {
    const result = computeDisplayedAllergens(
      [nuts],
      [{ id: "ov1", ingredient: { id: "i1", allergens: [dairy, egg] } }],
    );
    expect(result.map((a) => a.code)).toEqual(["dairy", "egg", "nuts"]);
  });

  it("ignores option values with no linked ingredient (custom fallback entries)", () => {
    const result = computeDisplayedAllergens([], [{ id: "ov1", ingredient: null }]);
    expect(result).toEqual([]);
  });
});
