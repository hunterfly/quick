import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma before importing the module
vi.mock("@/lib/prisma", () => ({
  prisma: {
    pRRequest: {
      count: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { generatePRNumber } from "@/utils/pr-number";
import { prisma } from "@/lib/prisma";

const mockCount = vi.mocked(prisma.pRRequest.count);
const mockFindUnique = vi.mocked(prisma.pRRequest.findUnique);

describe("generatePRNumber", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01"));
  });

  it("should generate PR number with correct format PR-YYYYMMDD-NNN", async () => {
    mockCount.mockResolvedValue(0);
    mockFindUnique.mockResolvedValue(null);

    const result = await generatePRNumber();

    expect(result).toBe("PR-20260401-001");
  });

  it("should increment sequence number based on existing count", async () => {
    mockCount.mockResolvedValue(5);
    mockFindUnique.mockResolvedValue(null);

    const result = await generatePRNumber();

    expect(result).toBe("PR-20260401-006");
  });

  it("should pad sequence number to 3 digits", async () => {
    mockCount.mockResolvedValue(0);
    mockFindUnique.mockResolvedValue(null);

    const result = await generatePRNumber();

    expect(result).toMatch(/^PR-\d{8}-\d{3}$/);
  });

  it("should retry on collision and increment attempt offset", async () => {
    mockCount.mockResolvedValue(2);
    // First attempt: PR-...-003 already exists
    mockFindUnique.mockResolvedValueOnce({ id: 1 } as never);
    // Second attempt: PR-...-004 is free
    mockFindUnique.mockResolvedValueOnce(null);

    const result = await generatePRNumber();

    expect(result).toBe("PR-20260401-004");
    expect(mockFindUnique).toHaveBeenCalledTimes(2);
  });

  it("should throw error after 5 failed attempts", async () => {
    mockCount.mockResolvedValue(0);
    mockFindUnique.mockResolvedValue({ id: 1 } as never);

    await expect(generatePRNumber()).rejects.toThrow(
      "Failed to generate unique PR number",
    );
    expect(mockFindUnique).toHaveBeenCalledTimes(5);
  });

  it("should use today's date prefix for count query", async () => {
    mockCount.mockResolvedValue(0);
    mockFindUnique.mockResolvedValue(null);

    await generatePRNumber();

    expect(mockCount).toHaveBeenCalledWith({
      where: { prNumber: { startsWith: "PR-20260401-" } },
    });
  });
});
