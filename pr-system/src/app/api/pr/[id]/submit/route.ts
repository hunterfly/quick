import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getRequiredLevels } from "@/lib/approval";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const pr = await prisma.pRRequest.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    if (!pr) {
      return NextResponse.json({ error: "PR not found" }, { status: 404 });
    }
    if (pr.requesterId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (pr.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only draft PRs can be submitted" },
        { status: 400 },
      );
    }
    if (pr.items.length === 0) {
      return NextResponse.json(
        { error: "PR must have at least one item" },
        { status: 400 },
      );
    }

    // Recalculate totalAmount from items for safety
    const totalAmount = pr.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );
    if (totalAmount !== pr.totalAmount) {
      await prisma.pRRequest.update({
        where: { id: Number(id) },
        data: { totalAmount },
      });
    }

    const requiredLevels = await getRequiredLevels(totalAmount);

    const updated = await prisma.$transaction(async (tx) => {
      if (requiredLevels === 0) {
        // Auto-approve: amount below threshold
        const result = await tx.pRRequest.update({
          where: { id: Number(id) },
          data: {
            status: "APPROVED",
            submittedAt: new Date(),
          },
          include: { items: true },
        });

        await tx.pRApproval.create({
          data: {
            prId: Number(id),
            level: 0,
            action: "APPROVED",
            approverId: null,
            comment: "Auto-approved: amount below threshold",
          },
        });

        return result;
      }

      // Normal flow: requires human approval
      const result = await tx.pRRequest.update({
        where: { id: Number(id) },
        data: {
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
        include: { items: true },
      });

      const approvalRecords = Array.from(
        { length: requiredLevels },
        (_, i) => ({
          prId: Number(id),
          level: i + 1,
          action: "PENDING" as const,
        }),
      );

      await tx.pRApproval.createMany({ data: approvalRecords });

      return result;
    });

    const withApprovals = await prisma.pRRequest.findUnique({
      where: { id: Number(id) },
      include: { items: true, approvals: true },
    });

    return NextResponse.json(withApprovals);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
