import { describe, it, expect } from "vitest";

/**
 * Test the PR calculation logic used in PR creation and submission.
 * These are pure functions extracted from the API route logic.
 */

function calculateItemTotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

function calculatePRTotal(
  items: Array<{ quantity: number; unitPrice: number }>,
): number {
  return items.reduce(
    (sum, item) => sum + calculateItemTotal(item.quantity, item.unitPrice),
    0,
  );
}

describe("PR item total calculation (quantity × unitPrice)", () => {
  it("should calculate total for basic values", () => {
    expect(calculateItemTotal(5, 100)).toBe(500);
  });

  it("should handle single quantity", () => {
    expect(calculateItemTotal(1, 2500)).toBe(2500);
  });

  it("should handle large quantities", () => {
    expect(calculateItemTotal(1000, 50)).toBe(50000);
  });

  it("should handle decimal unit prices", () => {
    expect(calculateItemTotal(3, 99.99)).toBeCloseTo(299.97);
  });
});

describe("PR total amount calculation (sum of all items)", () => {
  it("should sum all item totals", () => {
    const items = [
      { quantity: 2, unitPrice: 100 },
      { quantity: 3, unitPrice: 200 },
      { quantity: 1, unitPrice: 500 },
    ];
    // 200 + 600 + 500 = 1300
    expect(calculatePRTotal(items)).toBe(1300);
  });

  it("should return 0 for empty items", () => {
    expect(calculatePRTotal([])).toBe(0);
  });

  it("should handle single item", () => {
    const items = [{ quantity: 10, unitPrice: 300 }];
    expect(calculatePRTotal(items)).toBe(3000);
  });

  it("should correctly calculate total that crosses approval thresholds", () => {
    // Items that total just under 3000 (auto-approve)
    const underThreshold = [
      { quantity: 2, unitPrice: 1000 },
      { quantity: 1, unitPrice: 999 },
    ];
    expect(calculatePRTotal(underThreshold)).toBe(2999);

    // Items that total exactly 3000 (needs manager)
    const atThreshold = [
      { quantity: 3, unitPrice: 1000 },
    ];
    expect(calculatePRTotal(atThreshold)).toBe(3000);

    // Items that total above 20000 (needs manager + finance)
    const aboveHighThreshold = [
      { quantity: 5, unitPrice: 5000 },
    ];
    expect(calculatePRTotal(aboveHighThreshold)).toBe(25000);
  });
});
