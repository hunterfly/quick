import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function PRListPage() {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");

  if (!userId) {
    redirect("/auth/login");
  }

  const prs = await prisma.pRRequest.findMany({
    where: { requesterId: Number(userId) },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          My Purchase Requisitions
        </h1>
        <Link
          href="/dashboard/pr/new"
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Create New PR
        </Link>
      </div>

      {prs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <p className="text-gray-500">No purchase requisitions yet.</p>
          <Link
            href="/dashboard/pr/new"
            className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800"
          >
            Create your first PR
          </Link>
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
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prs.map((pr) => (
                <tr key={pr.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link
                      href={`/dashboard/pr/${pr.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {pr.prNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pr.items.length} item{pr.items.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pr.totalAmount.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    THB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={pr.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(pr.createdAt).toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/dashboard/pr/${pr.id}`}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      View
                    </Link>
                    {pr.status === "DRAFT" && (
                      <Link
                        href={`/dashboard/pr/${pr.id}/edit`}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Edit
                      </Link>
                    )}
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
