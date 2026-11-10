import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Sun, Moon, Bell, Search } from "lucide-react";

export const Navbar = () => {
  const { user, signOut, profile } = useAuth();
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) setTheme(saved);
    else setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);

  React.useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <header className={`sticky top-0 z-30 flex h-16 items-center gap-2 sm:gap-4 pl-14 pr-3 sm:pr-4 lg:pl-6 backdrop-blur-md ${theme === "dark" ? "border-b border-gray-700 bg-gray-900/80" : "border-b border-gray-200 bg-white/80"}`}>
      {/* logo só no mobile: no desktop ela já aparece no menu lateral */}
      <div className="flex items-center gap-2 lg:hidden shrink-0">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
          S
        </div>
        <span className="font-bold text-lg tracking-tight text-navy hidden sm:block">SEGURPRO</span>
      </div>

      <div className="flex-1 min-w-0 hidden md:flex items-center justify-center">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="search"
            placeholder="Busca global (clientes, veículos, apólices...)"
            className="input-field w-full pl-10"
          />
        </div>
      </div>
      <div className="flex-1 md:hidden" />

      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "bg-gray-700 text-white" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}
          aria-label="Alternar tema"
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-navy transition-colors" aria-label="Notificações">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-gray-200 min-w-0">
          <div className="text-right hidden xl:block min-w-0">
            <p className="text-sm font-medium text-navy truncate max-w-[220px]">{profile?.full_name || user?.email || "-"}</p>
            <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
          </div>
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || user?.email || "U")}&background=2563eb&color=fff`}
            alt="Perfil"
            className="w-8 h-8 rounded-full border border-gray-200"
          />
        </div>
      </div>
    </header>
  );
};
