import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getApprovalLevelForRole } from "@/lib/approval";

const decideSchema = z.object({
  action: z.enum(["APPROVED", "REJECTED"]),
  comment: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prId: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const levels = getApprovalLevelForRole(user.role);
    if (levels.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { prId } = await params;
    const body = await request.json();
    const parsed = decideSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { action, comment } = parsed.data;

    if (action === "REJECTED" && (!comment || comment.trim() === "")) {
      return NextResponse.json(
        { error: "Comment is required when rejecting" },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const pr = await tx.pRRequest.findUnique({
        where: { id: Number(prId) },
        include: { approvals: { orderBy: { level: "asc" } } },
      });

      if (!pr) {
        throw new Error("NOT_FOUND");
      }
      if (pr.status !== "SUBMITTED") {
        throw new Error("INVALID_STATUS");
      }

      // Find the pending approval at a level this user can act on
      const pendingApproval = pr.approvals.find(
        (a) => a.action === "PENDING" && levels.includes(a.level),
      );

      if (!pendingApproval) {
        throw new Error("NO_PENDING_APPROVAL");
      }

      // Verify all lower levels are approved
      const lowerLevelsApproved = pr.approvals
        .filter((a) => a.level < pendingApproval.level)
        .every((a) => a.action === "APPROVED");

      if (!lowerLevelsApproved) {
        throw new Error("PREREQUISITES_NOT_MET");
      }

      // Update the approval record
      await tx.pRApproval.update({
        where: { id: pendingApproval.id },
        data: {
          action,
          approverId: user.id,
          comment: comment || null,
        },
      });

      // Determine new PR status
      if (action === "REJECTED") {
        await tx.pRRequest.update({
          where: { id: pr.id },
          data: { status: "REJECTED" },
        });
      } else {
        // Check if all levels are now approved
        const allApproved = pr.approvals.every((a) =>
          a.id === pendingApproval.id ? true : a.action === "APPROVED",
        );
        if (allApproved) {
          await tx.pRRequest.update({
            where: { id: pr.id },
            data: { status: "APPROVED" },
          });
        }
      }

      return tx.pRRequest.findUnique({
        where: { id: pr.id },
        include: {
          items: true,
          approvals: {
            orderBy: { level: "asc" },
            include: {
              approver: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });
    });

    return NextResponse.json({ success: true, pr: result });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "NOT_FOUND":
          return NextResponse.json(
            { error: "PR not found" },
            { status: 404 },
          );
        case "INVALID_STATUS":
          return NextResponse.json(
            { error: "PR is not in submitted status" },
            { status: 400 },
          );
        case "NO_PENDING_APPROVAL":
          return NextResponse.json(
            { error: "No pending approval found for your role" },
            { status: 400 },
          );
        case "PREREQUISITES_NOT_MET":
          return NextResponse.json(
            { error: "Previous approval levels not yet completed" },
            { status: 400 },
          );
      }
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
