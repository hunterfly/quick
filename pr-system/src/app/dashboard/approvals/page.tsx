import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getApprovalLevelForRole } from "@/lib/approval";

export default async function PendingApprovalsPage() {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");
  const userRole = headersList.get("x-user-role");

  if (!userId) {
    redirect("/auth/login");
  }

  const levels = getApprovalLevelForRole(userRole ?? "");
  if (levels.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">You do not have approval permissions.</p>
      </div>
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
      approvals: { orderBy: { level: "asc" } },
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

      const lowerLevelsApproved = pr.approvals
        .filter((a) => a.level < level)
        .every((a) => a.action === "APPROVED");

      if (lowerLevelsApproved) return true;
    }
    return false;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Pending Approvals
      </h1>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <p className="text-gray-500">No pending approvals.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PR Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((pr) => (
                <tr key={pr.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {pr.prNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pr.requester.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pr.totalAmount.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    THB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pr.submittedAt
                      ? new Date(pr.submittedAt).toLocaleDateString("th-TH")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={pr.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/dashboard/approvals/${pr.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
