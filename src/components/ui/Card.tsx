import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ className, children, ...props }: CardProps) => (
  <div className={cn("rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden", className)} {...props}>
    {children}
  </div>
);

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader = ({ className, children, ...props }: CardHeaderProps) => (
  <div className={cn("border-b border-gray-200 bg-gray-50 px-5 py-4", className)} {...props}>
    {children}
  </div>
);

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardBody = ({ className, children, ...props }: CardBodyProps) => (
  <div className={cn("p-5", className)} {...props}>
    {children}
  </div>
);

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter = ({ className, children, ...props }: CardFooterProps) => (
  <div className={cn("border-t border-gray-200 bg-gray-50 px-5 py-4", className)} {...props}>
    {children}
  </div>
);
