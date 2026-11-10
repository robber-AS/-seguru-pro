import { Toaster } from "sonner";

export function Toast() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "bg-white border border-gray-200 shadow-lg rounded-lg",
          title: "text-navy font-semibold",
          description: "text-gray-600 text-sm",
        },
      }}
    />
  );
}
