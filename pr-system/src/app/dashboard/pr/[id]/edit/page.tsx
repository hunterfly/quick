import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PRForm } from "@/components/forms/PRForm";

export default async function EditPRPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const headersList = await headers();
  const userId = headersList.get("x-user-id");

  if (!userId) {
    redirect("/auth/login");
  }

  const pr = await prisma.pRRequest.findUnique({
    where: { id: Number(id) },
    include: { items: true },
  });

  if (!pr || pr.requesterId !== Number(userId)) {
    redirect("/dashboard/pr");
  }

  if (pr.status !== "DRAFT") {
    redirect(`/dashboard/pr/${id}`);
  }

  const initialData = {
    id: pr.id,
    note: pr.note ?? "",
    items: pr.items.map((item) => ({
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      requiredDate: item.requiredDate.toISOString(),
    })),
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Edit Purchase Requisition — {pr.prNumber}
      </h1>
      <PRForm initialData={initialData} />
    </div>
  );
}
