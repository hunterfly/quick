import { prisma } from "@/lib/prisma";

/**
 * Determine required approval levels for a given amount.
 * Queries ApprovalRule table; falls back to hardcoded logic if no rules found.
 */
export async function getRequiredLevels(totalAmount: number): Promise<number> {
  const rule = await prisma.approvalRule.findFirst({
    where: {
      minAmount: { lte: totalAmount },
      maxAmount: { gte: totalAmount },
    },
  });

  if (rule) {
    return rule.requiredLevels;
  }

  // Fallback: hardcoded logic if no rules in DB
  if (totalAmount > 20000) return 2;
  if (totalAmount >= 3000) return 1;
  return 0;
}

export function getApprovalLevelForRole(role: string): number[] {
  switch (role) {
    case "MANAGER":
      return [1];
    case "FINANCE":
      return [2];
    case "ADMIN":
      return [1, 2];
    default:
      return [];
  }
}
