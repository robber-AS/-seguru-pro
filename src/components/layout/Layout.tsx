import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-body)] dark:bg-[var(--color-bg-body-dark)]">
      <Sidebar />
      <div className="lg:pl-64 min-w-0">
        <Navbar />
        <main className="min-w-0 p-4 sm:p-6 lg:p-8 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};
