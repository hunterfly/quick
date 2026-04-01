type Approval = {
  id: number;
  level: number;
  action: string;
  comment: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  approver: { id: number; name: string; email: string } | null;
};

const ACTION_STYLES: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  PENDING: "bg-yellow-100 text-yellow-800",
};

const LEVEL_LABELS: Record<number, string> = {
  1: "Manager",
  2: "Finance",
};

export function ApprovalHistory({ approvals }: { approvals: Approval[] }) {
  if (approvals.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Approval History
      </h2>
      <div className="space-y-3">
        {approvals.map((approval) => (
          <div
            key={approval.id}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-md"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Level {approval.level} — {LEVEL_LABELS[approval.level] ?? `Level ${approval.level}`}
                </span>
                <span
                  className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${ACTION_STYLES[approval.action] ?? "bg-gray-100 text-gray-800"}`}
                >
                  {approval.action}
                </span>
              </div>
              {approval.approver && (
                <p className="text-sm text-gray-500">
                  By {approval.approver.name} ({approval.approver.email})
                </p>
              )}
              {approval.comment && (
                <p className="text-sm text-gray-600 mt-1">
                  {approval.comment}
                </p>
              )}
              {approval.action !== "PENDING" && (
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(approval.updatedAt).toLocaleString("th-TH")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
