import { Drawer } from "@/shared/components/ui-kit/ui";
import { ReportDetailPanel } from "@/features/reports/components/ReportDetailPanel";

export function ReportDetailDrawer({
  reportId,
  open,
  onClose,
}: {
  reportId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Report detail"
      subtitle={reportId ?? undefined}
      width="w-[520px]"
    >
      {reportId ? <ReportDetailPanel reportId={reportId} /> : null}
    </Drawer>
  );
}
