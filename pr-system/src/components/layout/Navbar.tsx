"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/lib/auth";

export function Navbar({ user }: { user: AuthUser | null }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-xl font-bold text-gray-900">
            PR System
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/pr"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  My PRs
                </Link>
                {["MANAGER", "FINANCE", "ADMIN"].includes(user.role) && (
                  <Link
                    href="/dashboard/approvals"
                    className="text-sm text-gray-700 hover:text-gray-900"
                  >
                    Approvals
                  </Link>
                )}
                <span className="text-sm text-gray-500">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
