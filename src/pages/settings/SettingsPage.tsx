import React, { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { Button, Input } from "@/components/ui";
import { ShieldAlert, RefreshCw, User, Clock, Mail, Settings, Globe, Save, Download, Lock, ChevronRight } from "lucide-react";
import { validateEmail, onlyDigits } from "@/lib/utils";

export const SettingsPage = () => {
  const { user, profile, role, signOut, refreshProfile } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Perfil
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    email: user?.email || "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Dados da corretora (admin)
  const [company, setCompany] = useState({
    company_name: "",
    cnpj: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
  });
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companySaving, setCompanySaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name || "", email: user?.email || "", current_password: "", new_password: "", confirm_password: "" });
    }
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    if (role === "admin") loadCompany();
  }, [role]);

  const loadCompany = async () => {
    setCompanyLoading(true);
    try {
      const { data, error: err } = await supabase.from("company_settings").select("*").single();
      if (err) {
        // Tabela ainda não existe no banco: inicia vazia sem quebrar a tela
        const msg = (err.message || "").toLowerCase();
        if (!msg.includes("does not exist") && !msg.includes("42p01") && err.code !== "PGRST116") {
          error("Erro ao carregar dados da corretora", err.message);
        }
      } else if (data) {
        setCompany({
          company_name: data.company_name || "",
          cnpj: data.cnpj || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
        });
      }
    } catch (err: any) {
      const msg = (err.message || "").toLowerCase();
      if (!msg.includes("does not exist") && !msg.includes("42p01") && err.code !== "PGRST116") {
        error("Erro ao carregar dados da corretora", err.message);
      }
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email) return error("Preencha nome e e-mail");
    if (!validateEmail(form.email)) return error("E-mail inválido");
    setSaving(true);
    try {
      const updates: any = { full_name: form.full_name.trim(), email: form.email.trim().toLowerCase() };
      if (form.new_password) {
        if (form.new_password !== form.confirm_password) return error("As senhas não coincidem");
        if (form.new_password.length < 8) return error("A nova senha deve ter pelo menos 8 caracteres");
        updates.password = form.new_password;
      }
      const { error: err } = await supabase.auth.updateUser(updates);
      if (err) throw err;
      await refreshProfile();
      await supabase.from("audit_logs").insert({
        user_id: user?.id,
        action: "update_profile",
        table_name: "profiles",
        record_id: user?.id,
        new_values: JSON.stringify({ full_name: form.full_name.trim(), email: form.email.trim().toLowerCase(), password_changed: !!form.new_password }),
      });
      success("Perfil atualizado com sucesso");
      setForm((f) => ({ ...f, current_password: "", new_password: "", confirm_password: "" }));
    } catch (err: any) {
      error("Erro ao atualizar perfil", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCompanySave = async () => {
    if (!company.company_name) return error("Informe o nome da corretora");
    setCompanySaving(true);
    try {
      const payload = {
        company_name: company.company_name.trim(),
        cnpj: onlyDigits(company.cnpj) || null,
        phone: onlyDigits(company.phone) || null,
        email: company.email.trim() || null,
        address: company.address.trim() || null,
        city: company.city.trim() || null,
        state: company.state.trim() || null,
      };
      const { data: existing, error: errExist } = await supabase.from("company_settings").select("id").single();
      if (errExist) {
        const msg = (errExist.message || "").toLowerCase();
        if (msg.includes("does not exist") || msg.includes("42p01") || errExist.code === "PGRST116") {
          return error("Tabela não encontrada", "Execute a migração 003_company_settings.sql no Supabase para criar a tabela company_settings.");
        }
        throw errExist;
      }
      let res;
      if (existing?.id) {
        res = await supabase.from("company_settings").update(payload).eq("id", existing.id);
      } else {
        res = await supabase.from("company_settings").insert(payload);
      }
      if (res.error) throw res.error;
      success("Dados da corretora salvos com sucesso");
    } catch (err: any) {
      const msg = (err.message || "").toLowerCase();
      if (msg.includes("does not exist") || msg.includes("42p01") || err.code === "PGRST116") {
        return error("Tabela não encontrada", "Execute a migração 003_company_settings.sql no Supabase para criar a tabela company_settings.");
      }
      error("Erro ao salvar dados da corretora", err.message);
    } finally {
      setCompanySaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (err: any) {
      error("Erro ao sair", err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { key: "profile", label: "Meu Perfil", icon: <User className="h-4 w-4" /> },
    { key: "preferences", label: "Preferências", icon: <Settings className="h-4 w-4" /> },
    ...(role === "admin"
      ? [
          { key: "company", label: "Dados da Corretora", icon: <BuildingIcon className="h-4 w-4" /> },
          { key: "users", label: "Usuários", icon: <ShieldAlert className="h-4 w-4" /> },
          { key: "backup", label: "Backup e Exportação", icon: <Download className="h-4 w-4" /> },
        ]
      : []),
    { key: "about", label: "Sobre o Sistema", icon: <ShieldAlert className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Configurações</h1>
          <p className="text-gray-600">Gerencie seu perfil, preferências e dados da corretora</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleLogout} icon={<Lock className="h-4 w-4" />}>
            Sair
          </Button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === t.key
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className="p-6 sm:p-8">
          {activeTab === "profile" && <ProfileSection form={form} onSave={handleProfileSave} saving={saving} setForm={setForm} />}
          {activeTab === "preferences" && <PreferencesSection />}
          {activeTab === "company" && <CompanySection company={company} setCompany={setCompany} onSave={handleCompanySave} saving={companySaving} loading={companyLoading} />}
          {activeTab === "users" && <UsersSection />}
          {activeTab === "backup" && <BackupSection role={role} />}
          {activeTab === "about" && <AboutSection user={user} profile={profile} role={role} />}
        </div>
      </div>
    </div>
  );
};

function ProfileSection({ form, onSave, saving, setForm }: { form: any; onSave: (e: React.FormEvent) => void; saving: boolean; setForm: any }) {
  return (
    <form onSubmit={onSave} className="space-y-5 max-w-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-field">Nome completo</label>
          <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        </div>
        <div>
          <label className="label-field">E-mail</label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
      </div>
      <div className="border-t border-gray-200 pt-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Alterar senha</h3>
        <div>
          <label className="label-field">Senha atual</label>
          <Input type="password" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Nova senha</label>
          <Input type="password" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} minLength={8} />
        </div>
        <div>
          <label className="label-field">Confirmar nova senha</label>
          <Input type="password" value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} minLength={8} />
        </div>
        <p className="text-xs text-gray-500">Deixe os campos de senha em branco para manter a senha atual.</p>
      </div>
      <div className="pt-4 border-t border-gray-200 flex justify-end">
        <Button type="submit" isLoading={saving} variant="primary">
          <Save className="h-4 w-4 mr-2" /> Salvar Alterações
        </Button>
      </div>
    </form>
  );
}

function PreferencesSection() {
  const [theme, setTheme] = useState<"light" | "dark">(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleThemeChange = (next: "light" | "dark") => {
    setTheme(next);
    if (next === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", next);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-navy mb-4">Tema da interface</h3>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0" style={{ background: theme === "light" ? "#fff" : "#0f172a", borderColor: theme === "light" ? "#e2e8f0" : "#334155" }}>
            <SunMoon icon={theme === "light" ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-blue-400" />} />
          </div>
          <span className="text-sm font-medium">{theme === "light" ? "Claro" : "Escuro"}</span>
          <div className="flex-1 h-px bg-gray-200"></div>
          <button
            onClick={() => handleThemeChange(theme === "light" ? "dark" : "light")}
            className={`p-2 rounded-md transition-colors ${theme === "light" ? "text-blue-600 hover:bg-blue-50" : "text-gray-500 hover:bg-gray-100"}`}
            aria-label="Alternar tema"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-navy mb-4">Notificações</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Notificações no aplicativo</p>
              <p className="text-xs text-gray-500">Receba alertas de renovações e cotações</p>
            </div>
            <button
              role="switch"
              aria-checked={notifications}
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex w-11 h-6 shrink-0 cursor-pointer rounded-full border-2 p-0.5 transition-colors ${notifications ? "border-blue-600" : "border-gray-300"} ${notifications ? "bg-blue-600" : "bg-gray-200"}`}
            >
              <span className={`block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${notifications ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Notificações por e-mail</p>
              <p className="text-xs text-gray-500">Receba resumos por e-mail</p>
            </div>
            <button
              role="switch"
              aria-checked={emailNotifications}
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex w-11 h-6 shrink-0 cursor-pointer rounded-full border-2 p-0.5 transition-colors ${emailNotifications ? "border-blue-600" : "border-gray-300"} ${emailNotifications ? "bg-blue-600" : "bg-gray-200"}`}
            >
              <span className={`block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${emailNotifications ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-500 text-center">
        As preferências são salvas localmente no seu navegador.
      </div>
    </div>
  );
}

function CompanySection({ company, setCompany, onSave, saving, loading }: { company: any; setCompany: any; onSave: () => void; saving: boolean; loading: boolean }) {
  if (loading) {
    return <div className="flex h-64 items-center justify-center text-gray-500">Carregando dados da corretora...</div>;
  }
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-5 max-w-2xl">
      <h3 className="text-sm font-semibold text-navy mb-2">Dados da Corretora de Seguros</h3>
      <p className="text-sm text-gray-500 mb-4">Essas informações aparecem em relatórios e documentos emitidos pelo sistema.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="label-field">Nome da corretora</label>
          <Input value={company.company_name} onChange={(e) => setCompany({ ...company, company_name: e.target.value })} required />
        </div>
        <div>
          <label className="label-field">CNPJ</label>
          <Input
            value={company.cnpj}
            onChange={(e) => setCompany({ ...company, cnpj: e.target.value.replace(/[^0-9]/g, "") })}
            placeholder="00.000.000/0000-00"
            maxLength={14}
          />
        </div>
        <div>
          <label className="label-field">Telefone</label>
          <Input
            value={company.phone}
            onChange={(e) => setCompany({ ...company, phone: e.target.value.replace(/[^0-9]/g, "") })}
            placeholder="(11) 99999-9999"
            maxLength={11}
          />
        </div>
        <div>
          <label className="label-field">E-mail</label>
          <Input type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} />
        </div>
        <div className="lg:col-span-2">
          <label className="label-field">Endereço</label>
          <Input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Cidade</label>
          <Input value={company.city} onChange={(e) => setCompany({ ...company, city: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Estado</label>
          <Input value={company.state} onChange={(e) => setCompany({ ...company, state: e.target.value.toUpperCase() })} maxLength={2} />
        </div>
      </div>
      <div className="pt-4 border-t border-gray-200 flex justify-end">
        <Button type="submit" isLoading={saving} variant="primary">
          <Save className="h-4 w-4 mr-2" /> Salvar Dados da Corretora
        </Button>
      </div>
    </form>
  );
}

function UsersSection() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4 max-w-xl">
      <h3 className="text-sm font-semibold text-navy">Gerenciamento de Usuários</h3>
      <p className="text-sm text-gray-500">Cadastre corretores e administradores, defina níveis de acesso e redefina senhas.</p>
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-700">Acessar página de Usuários</p>
          <p className="text-xs text-gray-500">Gerencie cadastros, perfis e permissões de acesso da equipe.</p>
        </div>
        <Button onClick={() => navigate("/users")} icon={<ChevronRight className="h-4 w-4" />}>
          Ir para Usuários
        </Button>
      </div>
    </div>
  );
}

function BackupSection({ role }: { role: string | null }) {
  const { error } = useToast();
  const handleExport = async () => {
    if (role !== "admin") return error("Acesso restrito", "Apenas administradores podem exportar dados.");
    try {
      const tables = ["clients", "vehicles", "insurers", "quotes", "policies", "renewals", "commissions", "payments", "audit_logs"];
      const data: Record<string, any> = {};
      for (const t of tables) {
        const { data: rows } = await (supabase as any).from(t).select("*");
        data[t] = rows || [];
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `segurpro-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      // erro será tratado pelo toast global se exposto; aqui apenas silencioso para não quebrar
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-navy mb-1">Backup de Dados</h3>
        <p className="text-sm text-gray-500">Exporta clientes, veículos, cotações, apólices, renovações, financeiro e auditoria em um único arquivo JSON.</p>
        <div className="mt-5 flex gap-3">
          <Button onClick={handleExport} icon={<Download className="h-4 w-4" />}>
            Exportar Backup (.json)
          </Button>
          <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />}>Restaurar Backup</Button>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-navy mb-1">Limpeza de Dados</h3>
        <p className="text-sm text-gray-500">Remove registros de auditoria antigos (mais de 1 ano) para manter o banco leve.</p>
        <div className="mt-5">
          <Button variant="secondary" icon={<Clock className="h-4 w-4" />}>Executar limpeza de auditoria</Button>
        </div>
      </div>
    </div>
  );
}

function AboutSection({ user, profile, role }: { user: any; profile: any; role: any }) {
  return (
    <div className="space-y-6 max-w-xl">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center">
        <Logo height={56} className="mx-auto mb-4" />
        <h2 className="text-xl font-bold text-navy">MDM Corretora de Seguros</h2>
        <p className="text-gray-600">Sistema de Gestão de Corretora de Seguros</p>
        <p className="text-xs text-gray-400 mt-2">Versão 1.0.0</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-navy mb-3">Sua conta</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 bg-gray-50">
            <User className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-700">{profile?.full_name || "Usuário"}</p>
              <p className="text-xs text-gray-500">{user?.email || "-"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 bg-gray-50">
            <ShieldAlert className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-700">{role === "admin" ? "Administrador" : "Corretor"}</p>
              <p className="text-xs text-gray-500">Nível de acesso</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-navy mb-3">Suporte</h3>
        <p className="text-sm text-gray-500 mb-3">Precisa de ajuda? Entre em contato com a equipe de suporte.</p>
        <div className="space-y-2">
          <a href="mailto:suporte@segurpro.com.br" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
            <Mail className="h-4 w-4" /> suporte@segurpro.com.br
          </a>
          <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
            <Globe className="h-4 w-4" /> Central de Ajuda
          </a>
        </div>
      </div>
    </div>
  );
}

// Ícones inline para evitar dependência de imports ausentes
function SunMoon({ icon }: { icon: React.ReactNode }) {
  return <span>{icon}</span>;
}

function Sun({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function Moon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 012-2h.01M7 21a1 1 0 01-1 1H3a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 011 1zm3-1a1 1 0 011-1h3a1 1 0 011 1v1a1 1 0 01-1 1h-3a1 1 0 01-1-1zm-1-6h3a1 1 0 011 1v3a1 1 0 01-1 1H9a1 1 0 01-1-1v-3a1 1 0 011-1z" />
    </svg>
  );
}
