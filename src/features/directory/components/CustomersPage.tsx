import { DirectoryListLayout } from "@/features/directory/components/DirectoryListLayout";

export function CustomersPage() {
  return (
    <DirectoryListLayout
      title="Directory"
      subtitle="Customers, properties, and protocols"
      addLabel="Add customer"
      onAdd={() => {}}
    >
      <div className="flex flex-1 items-center justify-center px-6 py-16 text-center">
        <div className="max-w-sm space-y-2">
          <p className="text-[15px] font-semibold text-text-primary">Customers</p>
          <p className="text-[13px] text-text-secondary">
            Customers will appear here.
          </p>
        </div>
      </div>
    </DirectoryListLayout>
  );
}
