import { useParams } from "@tanstack/react-router";
import { DirectoryBreadcrumb } from "@/features/directory/components/DirectoryBreadcrumb";
import { DirectoryListLayout } from "@/features/directory/components/DirectoryListLayout";

export function PropertiesPage() {
  const { customerId } = useParams({ from: "/_authenticated/_shell/directory/$customerId/" });

  return (
    <DirectoryListLayout
      breadcrumb={
        <DirectoryBreadcrumb
          items={[
            { label: "Directory", to: "/directory" },
            { label: customerId },
          ]}
        />
      }
      addLabel="Add property"
      onAdd={() => {}}
    >
      <div className="flex flex-1 items-center justify-center px-6 py-16 text-center">
        <div className="max-w-sm space-y-2">
          <p className="text-[15px] font-semibold text-text-primary">Properties</p>
          <p className="text-[13px] text-text-secondary">
            Properties for this customer will appear here.
          </p>
        </div>
      </div>
    </DirectoryListLayout>
  );
}
