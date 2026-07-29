import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card-bg group-[.toaster]:text-text-primary group-[.toaster]:border-border-color group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-text-secondary",
          actionButton: "group-[.toast]:bg-brand-primary group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-app-bg group-[.toast]:text-text-secondary",
          success:
            "!bg-success/10 !text-success !border-success/20 [&_[data-icon]]:!text-success [&_[data-title]]:!text-success [&_[data-description]]:!text-success/80",
          error:
            "!bg-danger/10 !text-danger !border-danger/20 [&_[data-icon]]:!text-danger [&_[data-title]]:!text-danger",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
