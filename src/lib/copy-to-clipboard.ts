import { toast } from "sonner";

export async function copyText(value: string, message: string): Promise<boolean> {
  if (!value || value === "—") {
    toast.error("Nothing to copy");
    return false;
  }
  try {
    await navigator.clipboard.writeText(value);
    toast.success(message);
    return true;
  } catch {
    toast.error("Couldn't copy to clipboard");
    return false;
  }
}
