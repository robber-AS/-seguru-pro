import { toast } from "sonner";

type Variant = "success" | "error" | "warning" | "info";

export function useToast() {
  const show = (variant: Variant, title: string, description?: string) => {
    switch (variant) {
      case "success":
        toast.success(title, { description, action: { label: "Fechar", onClick: () => toast.dismiss() } });
        break;
      case "error":
        toast.error(title, { description, action: { label: "Fechar", onClick: () => toast.dismiss() } });
        break;
      case "warning":
        toast.warning(title, { description });
        break;
      case "info":
        toast.info(title, { description });
        break;
    }
  };

  return {
    success: (title: string, description?: string) => show("success", title, description),
    error: (title: string, description?: string) => show("error", title, description),
    warning: (title: string, description?: string) => show("warning", title, description),
    info: (title: string, description?: string) => show("info", title, description),
  };
}
