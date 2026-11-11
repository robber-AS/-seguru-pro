import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { Button, Input, Badge, Table, Modal } from "@/components/ui";
import { ShieldAlert, Search, RefreshCw, User, Plus, Trash2 } from "lucide-react";
import { formatDate, textMatch, validateEmail } from "@/lib/utils";

export const AuditPage = () => {
  const { role } = useAuth();
  const { error } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadLogs();
  }, [search]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      let q = supabase.from("audit_logs").select("*, profiles(full_name, email)").order("created_at", { ascending: false }).limit(100);
      if (search) q = q.ilike("action", `%${search}%`).or(`table_name.ilike.%${search}%`);
      const { data, error: err } = await q;
      if (err) throw err;
      setLogs(data || []);
    } catch (err: any) {
      error("Erro ao carregar auditoria", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (role !== "admin") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <ShieldAlertFallback className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-navy">Acesso restrito</h2>
          <p className="text-gray-600">Apenas administradores podem visualizar a auditoria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Auditoria</h1>
          <p className="text-gray-600">Trilha de auditoria de ações administrativas</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={loadLogs} icon={<RefreshCw className="h-4 w-4" />}>Atualizar</Button>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none z-10 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input placeholder="Pesquisar ação ou tabela..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            columns={["Usuário", "Ação", "Tabela", "Registro", "Antigo", "Novo", "Data"]}
            data={logs.map((l) => [
              <span key="1" className="text-sm">{l.profiles?.full_name || l.profiles?.email || "-"}</span>,
              <span key="2" className="text-sm font-medium text-navy">{l.action}</span>,
              <span key="3" className="text-sm text-gray-600">{l.table_name || "-"}</span>,
              <span key="4" className="text-sm font-mono">{l.record_id || "-"}</span>,
              <span key="5" className="text-sm text-gray-400">{l.old_values ? "✓" : "-"}</span>,
              <span key="6" className="text-sm text-gray-400">{l.new_values ? "✓" : "-"}</span>,
              <span key="7" className="text-sm text-gray-500">{formatDate(l.created_at)}</span>,
            ])}
          />
        </div>
      </div>
    </div>
  );
};

// Gera uma senha forte legível (sem caracteres ambíguos como 0/O, l/1)
function generatePassword(len = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => chars[n % chars.length]).join("");
}

const EMPTY_USER = { full_name: "", email: "", password: "", role: "corretor" as "corretor" | "admin" };

export const UsersPage = () => {
  const { role, profile } = useAuth();
  const { success, error } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_USER);
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string; full_name: string } | null>(null);
  const [roleChange, setRoleChange] = useState<{ user: any; newRole: "admin" | "corretor" } | null>(null);
  const [savingRole, setSavingRole] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (role === "admin") loadUsers();
  }, [role]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (err) throw err;
      setUsers(data || []);
    } catch (err: any) {
      error("Erro ao carregar usuários", err.message);
    } finally {
      setLoading(false);
    }
  };

  const admins = users.filter((u) => u.role === "admin").length;
  const filtered = users.filter((u) => textMatch(search, u.full_name, u.email));

  const openCreate = () => {
    setCreateForm({ ...EMPTY_USER, password: generatePassword() });
    setShowPassword(true);
    setCreated(null);
    setCreateOpen(true);
  };

  const handleCreateUser = async () => {
    const f = { ...createForm, full_name: createForm.full_name.trim(), email: createForm.email.trim().toLowerCase() };
    if (!f.full_name || !f.email || !f.password) return error("Preencha todos os campos");
    if (!validateEmail(f.email)) return error("E-mail inválido");
    if (f.password.length < 8) return error("Senha fraca", "A senha deve ter pelo menos 8 caracteres.");
    setCreating(true);
    try {
      // a criação roda no servidor (Edge Function), que confere se você é admin
      const { data, error: err } = await supabase.functions.invoke("admin-create-user", { body: f });
      if (err) {
        let msg = err.message;
        try { msg = (await (err as any).context?.json())?.error || msg; } catch { /* resposta sem JSON */ }
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);
      success("Usuário criado", `${f.full_name} já pode entrar no sistema.`);
      setCreated({ email: f.email, password: f.password, full_name: f.full_name });
      loadUsers();
    } catch (err: any) {
      error("Erro ao criar usuário", err.message || "Não foi possível criar a conta.");
    } finally {
      setCreating(false);
    }
  };

  const copyAccess = async () => {
    if (!created) return;
    const text = `Acesso ao SegurPro\nUsuário: ${created.email}\nSenha: ${created.password}\n(troque a senha no primeiro acesso)`;
    try { await navigator.clipboard.writeText(text); success("Dados de acesso copiados"); }
    catch { error("Não foi possível copiar", "Selecione e copie manualmente."); }
  };

  const confirmRoleChange = async () => {
    if (!roleChange) return;
    setSavingRole(true);
    try {
      const { error: err } = await supabase.from("profiles").update({ role: roleChange.newRole }).eq("id", roleChange.user.id);
      if (err) throw err;
      success("Perfil atualizado", `${roleChange.user.full_name || roleChange.user.email} agora é ${roleChange.newRole === "admin" ? "Administrador" : "Corretor"}.`);
      setRoleChange(null);
      loadUsers();
    } catch (err: any) {
      error("Erro ao atualizar perfil", err.message);
    } finally {
      setSavingRole(false);
    }
  };

  const handleDelete = (u: any) => {
    setSelectedUser(u);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setDeleting(true);
    try {
      const { data, error: err } = await supabase.functions.invoke("admin-delete-user", { body: { user_id: selectedUser.id } });
      if (err) {
        let msg = err.message;
        try { msg = (await (err as any).context?.json())?.error || msg; } catch { /* resposta sem JSON */ }
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);
      success("Usuário excluído", `${selectedUser.full_name || selectedUser.email} foi removido do sistema.`);
      setDeleteOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      error("Erro ao excluir usuário", err.message || "Não foi possível excluir o usuário.");
    } finally {
      setDeleting(false);
    }
  };

  if (role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-navy">Acesso restrito</h2>
          <p className="text-gray-600">Apenas administradores podem gerenciar usuários.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Usuários</h1>
          <p className="text-gray-600">Cadastre corretores e administradores e defina o nível de acesso</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={loadUsers} icon={<RefreshCw className="h-4 w-4" />}>Atualizar</Button>
          <Button onClick={openCreate} icon={<Plus className="h-4 w-4" />}>Novo Usuário</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total de usuários", value: users.length, icon: <User className="h-5 w-5" />, color: "bg-blue-50 text-blue-600" },
          { label: "Administradores", value: admins, icon: <ShieldAlert className="h-5 w-5" />, color: "bg-red-50 text-red-600" },
          { label: "Corretores", value: users.length - admins, icon: <User className="h-5 w-5" />, color: "bg-green-50 text-green-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-navy">{loading ? "…" : s.value}</p>
            </div>
            <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${s.color}`}>{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
          <div className="relative w-full sm:w-96">
            <Search className="pointer-events-none z-10 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Pesquisar por nome ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table
            columns={["Usuário", "E-mail", "Perfil", "Criado em", "Ações"]}
            data={filtered.map((u) => {
              const isMe = u.id === profile?.id;
              return [
                <span key="1" className="text-sm font-medium text-navy">{u.full_name || "-"}{isMe && <span className="ml-2 text-xs font-normal text-gray-500">(você)</span>}</span>,
                <span key="2" className="text-sm">{u.email || "-"}</span>,
                <Badge key="3" variant={u.role === "admin" ? "danger" : "success"}>{u.role === "admin" ? "Administrador" : "Corretor"}</Badge>,
                <span key="4" className="text-sm text-gray-500">{formatDate(u.created_at)}</span>,
                <div key="5" className="flex items-center gap-2 min-w-[220px]">
                  <select
                    value={u.role}
                    disabled={isMe}
                    title={isMe ? "Você não pode alterar o seu próprio perfil" : undefined}
                    onChange={(e) => setRoleChange({ user: u, newRole: e.target.value as "admin" | "corretor" })}
                    className="input-field text-sm disabled:cursor-not-allowed"
                  >
                    <option value="admin">Administrador</option>
                    <option value="corretor">Corretor</option>
                  </select>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isMe}
                    title={isMe ? "Você não pode excluir o próprio usuário" : undefined}
                    icon={<Trash2 className="h-4 w-4" />}
                    onClick={() => handleDelete(u)}
                  />
                </div>,
              ];
            })}
          />
          {!loading && filtered.length === 0 && <p className="px-5 py-8 text-center text-sm text-gray-500">Nenhum usuário encontrado.</p>}
        </div>
      </div>

      {/* Cadastro de usuário */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title={created ? "Usuário criado" : "Novo Usuário"} size="md">
        {created ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Envie estes dados para <strong>{created.full_name}</strong>. O login já está ativo, sem confirmação por e-mail.</p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm break-all space-y-1">
              <div><span className="text-gray-500">Usuário:</span> {created.email}</div>
              <div><span className="text-gray-500">Senha:</span> {created.password}</div>
            </div>
            <p className="text-xs text-amber-700">Esta senha não será mostrada de novo. Peça para a pessoa trocá-la no primeiro acesso.</p>
            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={copyAccess}>Copiar dados de acesso</Button>
              <Button variant="secondary" onClick={openCreate}>Cadastrar outro</Button>
              <Button onClick={() => setCreateOpen(false)}>Concluir</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }} className="space-y-4">
            <div>
              <label className="label-field">Nome completo</label>
              <Input value={createForm.full_name} onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })} placeholder="Nome completo" required autoFocus />
            </div>
            <div>
              <label className="label-field">E-mail (usado para entrar)</label>
              <Input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} placeholder="usuario@empresa.com" required />
            </div>
            <div>
              <label className="label-field">Senha inicial</label>
              <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <Input type={showPassword ? "text" : "password"} value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className="font-mono" required minLength={8} />
                </div>
                <Button variant="secondary" type="button" onClick={() => setShowPassword((s) => !s)}>{showPassword ? "Ocultar" : "Mostrar"}</Button>
                <Button variant="secondary" type="button" onClick={() => { setCreateForm({ ...createForm, password: generatePassword() }); setShowPassword(true); }}>Gerar</Button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Mínimo de 8 caracteres.</p>
            </div>
            <div>
              <label className="label-field">Nível de acesso</label>
              <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as "corretor" | "admin" })} className="input-field w-full">
                <option value="corretor">Corretor: vê e gerencia apenas os próprios clientes</option>
                <option value="admin">Administrador: acesso total, inclusive usuários e relatórios</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" type="button" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" isLoading={creating}>Criar Usuário</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Confirmação de troca de perfil */}
      <Modal isOpen={!!roleChange} onClose={() => setRoleChange(null)} title="Alterar perfil de acesso" size="sm">
        {roleChange && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Tornar <strong>{roleChange.user.full_name || roleChange.user.email}</strong>{" "}
              <strong>{roleChange.newRole === "admin" ? "Administrador" : "Corretor"}</strong>?
            </p>
            <p className="text-xs text-gray-500">
              {roleChange.newRole === "admin"
                ? "A pessoa passará a ver todos os clientes, apólices, relatórios e poderá gerenciar usuários."
                : "A pessoa passará a ver apenas os próprios clientes e perderá acesso a relatórios e usuários."}
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setRoleChange(null)}>Cancelar</Button>
              <Button variant={roleChange.newRole === "admin" ? "primary" : "danger"} onClick={confirmRoleChange} isLoading={savingRole}>Confirmar</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmação de exclusão de usuário */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Excluir Usuário" size="sm">
        <div className="text-gray-700">
          <p>Tem certeza que deseja excluir o usuário <strong>{selectedUser?.full_name || selectedUser?.email}</strong>?</p>
          <p className="mt-2 text-sm text-gray-500">O acesso será desativado imediatamente e não poderá ser desfeito.</p>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleConfirmDelete} isLoading={deleting}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
};

function ShieldAlertFallback({ className = "h-5 w-5" }: { className?: string }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>; }

