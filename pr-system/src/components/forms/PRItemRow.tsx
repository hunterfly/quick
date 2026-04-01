"use client";

import type { PRItemInput } from "@/types/pr";

interface PRItemRowProps {
  index: number;
  item: PRItemInput;
  onChange: (index: number, item: PRItemInput) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export function PRItemRow({
  index,
  item,
  onChange,
  onRemove,
  canRemove,
}: PRItemRowProps) {
  function handleChange(field: keyof PRItemInput, value: string | number) {
    const updated = { ...item, [field]: value };
    if (field === "quantity" || field === "unitPrice") {
      updated.totalPrice = Number(updated.quantity) * Number(updated.unitPrice);
    }
    onChange(index, updated);
  }

  return (
    <div className="grid grid-cols-12 gap-3 items-end">
      <div className="col-span-3">
        {index === 0 && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item Name
          </label>
        )}
        <input
          type="text"
          value={item.itemName}
          onChange={(e) => handleChange("itemName", e.target.value)}
          placeholder="Item name"
          className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm"
        />
      </div>

      <div className="col-span-2">
        {index === 0 && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
        )}
        <input
          type="number"
          min="1"
          value={item.quantity || ""}
          onChange={(e) => handleChange("quantity", Number(e.target.value))}
          placeholder="Qty"
          className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm"
        />
      </div>

      <div className="col-span-2">
        {index === 0 && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit Price
          </label>
        )}
        <input
          type="number"
          min="0"
          step="0.01"
          value={item.unitPrice || ""}
          onChange={(e) => handleChange("unitPrice", Number(e.target.value))}
          placeholder="Price"
          className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm"
        />
      </div>

      <div className="col-span-2">
        {index === 0 && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total
          </label>
        )}
        <div className="w-full rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-600">
          {item.totalPrice.toLocaleString("th-TH", {
            minimumFractionDigits: 2,
          })}
        </div>
      </div>

      <div className="col-span-2">
        {index === 0 && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Required Date
          </label>
        )}
        <input
          type="date"
          value={item.requiredDate}
          onChange={(e) => handleChange("requiredDate", e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm"
        />
      </div>

      <div className="col-span-1">
        {index === 0 && (
          <label className="block text-sm font-medium text-transparent mb-1">
            Action
          </label>
        )}
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          className="w-full rounded-md border border-red-300 px-2 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
