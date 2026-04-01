"use client";

import { PR_STATUS_LABELS, PR_STATUS_COLORS } from "@/types/pr";

export function StatusBadge({ status }: { status: string }) {
  const label = PR_STATUS_LABELS[status] || status;
  const colors = PR_STATUS_COLORS[status] || "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors}`}
    >
      {label}
    </span>
  );
}
