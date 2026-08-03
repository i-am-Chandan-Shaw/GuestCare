import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      closeButton
      gap={10}
      offset={16}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "group toast !flex !items-center !gap-3 !rounded-xl !border !border-border-color !bg-card-bg !px-4 !py-3.5 !text-[13px] !font-medium !text-text-primary !shadow-[0_8px_30px_rgba(15,23,42,0.12)] !backdrop-blur-none",
          title: "!text-[13px] !font-semibold !text-text-primary",
          description: "!text-[12px] !font-normal !text-text-secondary",
          content: "!min-w-0 flex-1",
          actionButton:
            "!rounded-md !btn-primary-gradient !px-3 !py-1.5 !text-[12px] !font-semibold !text-white !shadow-sm",
          cancelButton:
            "!rounded-md !bg-app-bg !px-3 !py-1.5 !text-[12px] !font-semibold !text-text-secondary",
          success:
            "!border-success/30 !bg-[var(--kn-color-success-surface)] !text-text-primary [&_[data-icon]]:!text-success",
          error:
            "!border-danger/30 !bg-[var(--kn-color-danger-surface)] !text-text-primary [&_[data-icon]]:!text-danger",
          warning:
            "!border-warning/30 !bg-[var(--kn-color-warning-surface)] !text-text-primary [&_[data-icon]]:!text-warning",
          info:
            "!border-info/30 !bg-[var(--kn-color-info-surface)] !text-text-primary [&_[data-icon]]:!text-info",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
