import { prisma } from "@/lib/prisma";

export async function generatePRNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `PR-${dateStr}-`;

  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await prisma.pRRequest.count({
      where: {
        prNumber: { startsWith: prefix },
      },
    });

    const nextNum = String(count + 1 + attempt).padStart(3, "0");
    const prNumber = `${prefix}${nextNum}`;

    const existing = await prisma.pRRequest.findUnique({
      where: { prNumber },
    });

    if (!existing) {
      return prNumber;
    }
  }

  throw new Error("Failed to generate unique PR number");
}
