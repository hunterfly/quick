import { headers } from "next/headers";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApprovalHistory } from "@/components/ui/ApprovalHistory";
import { ApprovalActions } from "@/components/forms/ApprovalActions";
import { getApprovalLevelForRole } from "@/lib/approval";

export default async function ApprovalReviewPage({
  params,
}: {
  params: Promise<{ prId: string }>;
}) {
  const { prId } = await params;
  const headersList = await headers();
  const userId = headersList.get("x-user-id");
  const userRole = headersList.get("x-user-role");

  if (!userId) {
    redirect("/auth/login");
  }

  const levels = getApprovalLevelForRole(userRole ?? "");
  if (levels.length === 0) {
    notFound();
  }

  const pr = await prisma.pRRequest.findUnique({
    where: { id: Number(prId) },
    include: {
      items: true,
      attachments: true,
      requester: { select: { id: true, name: true, email: true } },
      approvals: {
        orderBy: { level: "asc" },
        include: {
          approver: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!pr) {
    notFound();
  }

  // Check if this user can act on this PR
  const canAct =
    pr.status === "SUBMITTED" &&
    pr.approvals.some((a) => {
      if (a.action !== "PENDING" || !levels.includes(a.level)) return false;
      const lowerApproved = pr.approvals
        .filter((lower) => lower.level < a.level)
        .every((lower) => lower.action === "APPROVED");
      return lowerApproved;
    });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pr.prNumber}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Requested by {pr.requester.name} ({pr.requester.email})
            {pr.submittedAt && (
              <>
                {" "}
                | Submitted on{" "}
                {new Date(pr.submittedAt).toLocaleDateString("th-TH")}
              </>
            )}
          </p>
        </div>
        <StatusBadge status={pr.status} />
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Item Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Unit Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Required Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pr.items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.itemName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.unitPrice.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.totalPrice.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(item.requiredDate).toLocaleDateString("th-TH")}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td
                colSpan={3}
                className="px-6 py-3 text-sm font-medium text-gray-900 text-right"
              >
                Grand Total
              </td>
              <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                {pr.totalAmount.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                })}{" "}
                THB
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {pr.attachments.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Attachments
          </h2>
          <ul className="space-y-2">
            {pr.attachments.map((att) => (
              <li key={att.id}>
                <a
                  href={att.filePath}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {att.fileName}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ApprovalHistory approvals={pr.approvals} />

      {canAct && <ApprovalActions prId={pr.id} />}

      <div className="mt-6">
        <Link
          href="/dashboard/approvals"
          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back to Approvals
        </Link>
      </div>
    </div>
  );
}
