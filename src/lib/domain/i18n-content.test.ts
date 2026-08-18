import { describe, expect, it } from "vitest";
import { pickLocalized } from "./i18n-content";

describe("pickLocalized", () => {
  it("returns the requested locale when present", () => {
    expect(pickLocalized({ en: "Hello", fi: "Hei" }, "fi")).toBe("Hei");
  });

  it("falls back to English when the requested locale is missing", () => {
    expect(pickLocalized({ en: "Hello" }, "fi")).toBe("Hello");
  });

  it("falls back to English when the requested locale is an empty string", () => {
    expect(pickLocalized({ en: "Hello", fi: "" }, "fi")).toBe("Hello");
  });

  it("returns an empty string when nothing is populated", () => {
    expect(pickLocalized({}, "en")).toBe("");
    expect(pickLocalized(null, "en")).toBe("");
    expect(pickLocalized(undefined, "en")).toBe("");
  });
});
