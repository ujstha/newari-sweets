import { describe, expect, it } from "vitest";
import { assertTransition, canTransition, type OrderStatus } from "./order-workflow";

describe("canTransition", () => {
  const validTransitions: [OrderStatus, OrderStatus][] = [
    ["pending_review", "approved"],
    ["pending_review", "declined"],
    ["approved", "ready"],
    ["approved", "cancelled"],
    ["ready", "completed"],
  ];

  it.each(validTransitions)("allows %s -> %s", (current, next) => {
    expect(canTransition(current, next)).toBe(true);
  });

  const invalidTransitions: [OrderStatus, OrderStatus][] = [
    ["pending_review", "ready"],
    ["pending_review", "completed"],
    ["approved", "declined"],
    ["approved", "completed"],
    ["ready", "declined"],
    ["ready", "cancelled"],
    ["declined", "approved"],
    ["completed", "ready"],
    ["cancelled", "approved"],
  ];

  it.each(invalidTransitions)("rejects %s -> %s", (current, next) => {
    expect(canTransition(current, next)).toBe(false);
  });
});

describe("assertTransition", () => {
  it("does not throw for a legal transition", () => {
    expect(() => assertTransition("pending_review", "approved")).not.toThrow();
  });

  it("throws for an illegal transition", () => {
    expect(() => assertTransition("declined", "approved")).toThrow(
      /Illegal order status transition/,
    );
  });
});
