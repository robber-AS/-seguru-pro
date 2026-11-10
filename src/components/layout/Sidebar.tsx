import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Clock,
  ShieldAlert,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Search,
  Menu,
  Car,
  Bike as Motorcycle,
  Building2,
  FilePlus,
  RefreshCw,
  Smartphone,
  Phone,
  Mail,
  Home,
  FolderKanban,
  PieChart,
  TrendingUp,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles?: ("admin" | "corretor")[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clientes", href: "/clients", icon: Users, roles: ["admin", "corretor"] },
  { label: "Veículos", href: "/vehicles", icon: Car, roles: ["admin", "corretor"] },
  { label: "Seguradoras", href: "/insurers", icon: Building2, roles: ["admin", "corretor"] },
  { label: "Cotações", href: "/quotes", icon: FileText, roles: ["admin", "corretor"] },
  { label: "Apólices", href: "/policies", icon: FilePlus, roles: ["admin", "corretor"] },
  { label: "Renovações", href: "/renewals", icon: RefreshCw, roles: ["admin", "corretor"] },
  { label: "Financeiro", href: "/finance", icon: CreditCard, roles: ["admin", "corretor"] },
  { label: "Relatórios", href: "/reports", icon: BarChart3, roles: ["admin"] },
  { label: "Usuários", href: "/users", icon: ShieldAlert, roles: ["admin"] },
  { label: "Auditoria", href: "/audit", icon: FolderKanban, roles: ["admin"] },
  { label: "Configurações", href: "/settings", icon: Settings, roles: ["admin"] },
];

export const Sidebar = () => {
  const { user, signOut, profile, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  React.useEffect(() => {
    const check = () => setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const items = role
    ? navItems.filter((i) => !i.roles || i.roles.includes(role))
    : [];

  return (
    <>
      <button
        className={`lg:hidden fixed top-3 left-2 z-50 p-2 text-gray-500 hover:text-navy ${mobileOpen ? "hidden" : ""}`}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Abrir menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300
          ${collapsed ? "lg:translate-x-[-100%]" : "lg:translate-x-0"}
          ${theme === "dark" ? "bg-gray-900 border-r border-gray-700" : "bg-white border-r border-gray-200"}
          ${mobileOpen ? "transform translate-x-0" : "lg:translate-x-0 -translate-x-full"}
        `}
      >
        <div className={`flex items-center justify-between h-16 px-4 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <span className={`font-bold text-xl tracking-tight ${theme === "dark" ? "text-white" : "text-navy"} ${collapsed && "hidden"}`}>
              SEGURPRO
            </span>
          </div>
          {collapsed && (
            <button className={`text-gray-400 hover:text-white ${theme === "dark" ? "hover:text-blue-400" : "hover:text-navy"}`} onClick={() => setCollapsed(false)} aria-label="Expandir">
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);
            return (
              <button
                key={item.href}
                onClick={() => { navigate(item.href); setMobileOpen(false); }}
                className={`
                  sidebar-item w-full text-left ${isActive ? "sidebar-item-active" : "sidebar-item-hover text-gray-600 hover:bg-gray-100"}
                `}
              >
                <Icon className="h-5 w-5" />
                <span className={collapsed ? "hidden" : "block"}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="pb-4 border-b border-gray-200 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuário</p>
            <p className="text-sm font-medium text-navy truncate">{user?.email || "-"}</p>
            <p className="text-xs text-gray-500 capitalize">{role}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full sidebar-item text-left text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            <span className={collapsed ? "hidden" : "block"}>Sair</span>
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};

function cnClass(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}
