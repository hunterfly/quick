"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubmitButton({ prId }: { prId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pr/${prId}/submit`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to submit");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSubmit}
      disabled={loading}
      className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Submitting..." : "Submit PR"}
    </button>
  );
}
