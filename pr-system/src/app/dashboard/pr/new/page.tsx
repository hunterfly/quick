import { PRForm } from "@/components/forms/PRForm";

export default function NewPRPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create Purchase Requisition
      </h1>
      <PRForm />
    </div>
  );
}
