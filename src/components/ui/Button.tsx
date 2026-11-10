import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, icon, children, disabled, type = "button", ...props }, ref) => {
    const iconOnly = !children && !!icon;
    const base = "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-1";
    const variants = {
      primary: "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:ring-blue-500",
      secondary: "border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-blue-500",
      danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-500",
      ghost: "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(base, variants[variant], iconOnly ? "p-2" : sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {!isLoading && icon}
        {isLoading && (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
