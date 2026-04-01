import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getApprovalLevelForRole } from "@/lib/approval";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const levels = getApprovalLevelForRole(user.role);
    if (levels.length === 0) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    const pendingPRs = await prisma.pRRequest.findMany({
      where: {
        status: "SUBMITTED",
        approvals: {
          some: {
            level: { in: levels },
            action: "PENDING",
          },
        },
      },
      include: {
        items: true,
        requester: { select: { id: true, name: true, email: true } },
        approvals: {
          orderBy: { level: "asc" },
          include: {
            approver: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    // Filter: for level 2, only show PRs where level 1 is already APPROVED
    const filtered = pendingPRs.filter((pr) => {
      for (const level of levels) {
        const approval = pr.approvals.find(
          (a) => a.level === level && a.action === "PENDING",
        );
        if (!approval) continue;

        // Check all lower levels are approved
        const lowerLevelsApproved = pr.approvals
          .filter((a) => a.level < level)
          .every((a) => a.action === "APPROVED");

        if (lowerLevelsApproved) return true;
      }
      return false;
    });

    return NextResponse.json({ approvals: filtered });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
