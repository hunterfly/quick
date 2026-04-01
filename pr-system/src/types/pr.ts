export interface PRItemInput {
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  requiredDate: string;
}

export const PR_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const PR_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};
