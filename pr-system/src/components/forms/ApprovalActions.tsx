"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ApprovalActions({ prId }: { prId: number }) {
  const router = useRouter();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDecision(action: "APPROVED" | "REJECTED") {
    if (action === "REJECTED" && !comment.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/approvals/${prId}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          comment: comment.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Something went wrong");
        return;
      }

      router.push("/dashboard/approvals");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Approval Decision
      </h2>

      {showRejectForm && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for rejection
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Please provide a reason..."
          />
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => handleDecision("APPROVED")}
          disabled={loading}
          className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Approve"}
        </button>
        {showRejectForm ? (
          <button
            onClick={() => handleDecision("REJECTED")}
            disabled={loading}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm Reject"}
          </button>
        ) : (
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={loading}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Reject
          </button>
        )}
        {showRejectForm && (
          <button
            onClick={() => {
              setShowRejectForm(false);
              setComment("");
            }}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
