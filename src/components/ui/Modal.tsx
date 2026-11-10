import React from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizes: Record<string, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-3xl",
  xl: "max-w-4xl",
  full: "max-w-7xl",
};

export const Modal = ({ isOpen, onClose, title, children, size = "md" }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn("relative z-10 w-full p-2 sm:p-4 mx-auto", sizes[size])}>
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)]">
          {title && (
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 sm:px-6 py-4 shrink-0">
              <h3 className="text-lg font-semibold text-navy truncate">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fechar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="p-4 sm:p-6 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};
