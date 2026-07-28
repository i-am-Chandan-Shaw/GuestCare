import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "!bg-[#E8F8EE] !text-[#0B7A3B] !border-[#A7E3BC] [&_[data-icon]]:!text-[#0B7A3B] [&_[data-title]]:!text-[#0B7A3B] [&_[data-description]]:!text-[#1A6B3C]",
          error:
            "!bg-[#FDECEC] !text-[#B42318] !border-[#F5C2C0] [&_[data-icon]]:!text-[#B42318] [&_[data-title]]:!text-[#B42318]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
