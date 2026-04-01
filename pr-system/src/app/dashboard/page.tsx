import { headers } from "next/headers";
import Link from "next/link";
import { ROLE_LABELS } from "@/lib/rbac";

export default async function DashboardPage() {
  const headersList = await headers();
  const userName = headersList.get("x-user-email") || "User";
  const userRole = headersList.get("x-user-role") || "EMPLOYEE";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Welcome back! Role: {ROLE_LABELS[userRole as keyof typeof ROLE_LABELS] || userRole}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/pr"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            My PR Requests
          </h2>
          <p className="text-sm text-gray-600">
            Create and manage your purchase requisitions
          </p>
        </Link>

        <Link
          href="/dashboard/approvals"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Pending Approvals
          </h2>
          <p className="text-sm text-gray-600">
            Review and approve PR requests
          </p>
        </Link>

        <Link
          href="/dashboard/admin"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Admin Settings
          </h2>
          <p className="text-sm text-gray-600">
            Configure approval rules and users
          </p>
        </Link>
      </div>
    </div>
  );
}
