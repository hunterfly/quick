import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    approvalRule: {
      findFirst: vi.fn(),
    },
  },
}));

import { getRequiredLevels, getApprovalLevelForRole } from "@/lib/approval";
import { prisma } from "@/lib/prisma";

const mockFindFirst = vi.mocked(prisma.approvalRule.findFirst);

describe("getRequiredLevels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("with DB rules", () => {
    it("should return 0 levels for amount below 3000 (auto-approve)", async () => {
      mockFindFirst.mockResolvedValue({
        id: 1,
        minAmount: 0,
        maxAmount: 2999.99,
        requiredLevels: 0,
      } as never);

      expect(await getRequiredLevels(1000)).toBe(0);
    });

    it("should return 1 level for amount 3000-20000 (manager approval)", async () => {
      mockFindFirst.mockResolvedValue({
        id: 2,
        minAmount: 3000,
        maxAmount: 20000,
        requiredLevels: 1,
      } as never);

      expect(await getRequiredLevels(5000)).toBe(1);
    });

    it("should return 2 levels for amount above 20000 (manager + finance)", async () => {
      mockFindFirst.mockResolvedValue({
        id: 3,
        minAmount: 20000.01,
        maxAmount: 999999999,
        requiredLevels: 2,
      } as never);

      expect(await getRequiredLevels(50000)).toBe(2);
    });
  });

  describe("fallback hardcoded logic (no DB rules)", () => {
    beforeEach(() => {
      mockFindFirst.mockResolvedValue(null);
    });

    it("should return 0 for amount below 3000", async () => {
      expect(await getRequiredLevels(2999)).toBe(0);
      expect(await getRequiredLevels(0)).toBe(0);
      expect(await getRequiredLevels(1500)).toBe(0);
    });

    it("should return 1 for amount 3000-20000", async () => {
      expect(await getRequiredLevels(3000)).toBe(1);
      expect(await getRequiredLevels(10000)).toBe(1);
      expect(await getRequiredLevels(20000)).toBe(1);
    });

    it("should return 2 for amount above 20000", async () => {
      expect(await getRequiredLevels(20001)).toBe(2);
      expect(await getRequiredLevels(100000)).toBe(2);
    });
  });

  it("should query DB with correct where clause", async () => {
    mockFindFirst.mockResolvedValue(null);

    await getRequiredLevels(5000);

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        minAmount: { lte: 5000 },
        maxAmount: { gte: 5000 },
      },
    });
  });
});

describe("getApprovalLevelForRole", () => {
  it("should return [1] for MANAGER", () => {
    expect(getApprovalLevelForRole("MANAGER")).toEqual([1]);
  });

  it("should return [2] for FINANCE", () => {
    expect(getApprovalLevelForRole("FINANCE")).toEqual([2]);
  });

  it("should return [1, 2] for ADMIN", () => {
    expect(getApprovalLevelForRole("ADMIN")).toEqual([1, 2]);
  });

  it("should return [] for EMPLOYEE", () => {
    expect(getApprovalLevelForRole("EMPLOYEE")).toEqual([]);
  });

  it("should return [] for unknown roles", () => {
    expect(getApprovalLevelForRole("UNKNOWN")).toEqual([]);
    expect(getApprovalLevelForRole("")).toEqual([]);
  });
});
