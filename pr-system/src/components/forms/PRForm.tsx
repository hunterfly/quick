"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRItemRow } from "./PRItemRow";
import type { PRItemInput } from "@/types/pr";

interface PRFormProps {
  initialData?: {
    id: number;
    note: string;
    items: {
      itemName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      requiredDate: string;
    }[];
  };
}

const emptyItem: PRItemInput = {
  itemName: "",
  quantity: 0,
  unitPrice: 0,
  totalPrice: 0,
  requiredDate: "",
};

export function PRForm({ initialData }: PRFormProps) {
  const router = useRouter();
  const [items, setItems] = useState<PRItemInput[]>(
    initialData?.items.map((item) => ({
      ...item,
      requiredDate: item.requiredDate.slice(0, 10),
    })) || [{ ...emptyItem }],
  );
  const [note, setNote] = useState(initialData?.note || "");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const grandTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  function handleItemChange(index: number, updated: PRItemInput) {
    const newItems = [...items];
    newItems[index] = updated;
    setItems(newItems);
  }

  function handleItemRemove(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function addItem() {
    setItems([...items, { ...emptyItem }]);
  }

  async function savePR(): Promise<number | null> {
    const payload = {
      note: note || null,
      items: items.map((item) => ({
        itemName: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        requiredDate: item.requiredDate,
      })),
    };

    const url = initialData
      ? `/api/pr/${initialData.id}`
      : "/api/pr";
    const method = initialData ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save PR");
    }

    const pr = await res.json();

    if (files && files.length > 0) {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }
      const attachRes = await fetch(`/api/pr/${pr.id}/attachments`, {
        method: "POST",
        body: formData,
      });
      if (!attachRes.ok) {
        const data = await attachRes.json();
        throw new Error(data.error || "Failed to upload attachments");
      }
    }

    return pr.id;
  }

  async function handleSaveDraft() {
    setLoading(true);
    setError("");
    try {
      await savePR();
      router.push("/dashboard/pr");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const prId = await savePR();
      if (!prId) return;

      const res = await fetch(`/api/pr/${prId}/submit`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit PR");
      }
      router.push("/dashboard/pr");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>

        <div className="space-y-3">
          {items.map((item, index) => (
            <PRItemRow
              key={index}
              index={index}
              item={item}
              onChange={handleItemChange}
              onRemove={handleItemRemove}
              canRemove={items.length > 1}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="mt-4 text-sm text-blue-600 hover:text-blue-800"
        >
          + Add Item
        </button>

        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
          <div className="text-right">
            <span className="text-sm text-gray-500">Grand Total: </span>
            <span className="text-lg font-semibold text-gray-900">
              {grandTotal.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
              })}{" "}
              THB
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Note (Optional)
        </h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Add a note to this PR..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Attachments (Optional)
        </h2>
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.push("/dashboard/pr")}
          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={loading}
          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Draft"}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit PR"}
        </button>
      </div>
    </div>
  );
}
