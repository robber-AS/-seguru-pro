import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { Button, Input, Card, CardHeader, CardBody, Badge, Modal, Table, Pagination } from "@/components/ui";
import { Search, Plus, Edit2, Trash2, ChevronRight, Car as Vehicle, FileText, RefreshCw } from "lucide-react";
import { formatCPF, formatCNPJ, formatDate, formatPhone, validateCPF, validateCNPJ, validateEmail, maskCPF, maskPhone, onlyDigits, cleanPayload, orSafe } from "@/lib/utils";

export const ClientsList = () => {
  const { profile, role } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const PAGE_SIZE = 10;

  const loadClients = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("clients").select("*, vehicles(count)", { count: "exact" });

    if (!role || role === "corretor") {
      query = query.eq("corretor_id", profile?.id ?? "");
    }

    if (search) {
      const s = orSafe(search);
      const digits = onlyDigits(search);
      query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%` + (digits ? `,cpf_cnpj.ilike.%${digits}%,phone.ilike.%${digits}%` : ""));
    }

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to).order("created_at", { ascending: false });

    const { data, count, error: err } = await query;
    if (err) {
      error("Erro ao carregar clientes", err.message);
    } else {
      setClients(data || []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [search, page, role, profile?.id]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleCreate = () => {
    setEditing(false);
    setFormOpen(true);
  };

  const handleEdit = (client: any) => {
    setSelectedClient(client);
    setEditing(true);
    setFormOpen(true);
  };

  const handleDelete = (client: any) => {
    setSelectedClient(client);
    setDeleteOpen(true);
  };

  const handleSave = async (raw: any) => {
    const values = cleanPayload(raw);
    try {
      if (editing && selectedClient) {
        const { error: err } = await supabase
          .from("clients")
          .update(values)
          .eq("id", selectedClient.id);
        if (err) throw err;
        success("Cliente atualizado com sucesso");
      } else {
        const { error: err } = await supabase.from("clients").insert({ ...values, corretor_id: profile?.id });
        if (err) throw err;
        success("Cliente cadastrado com sucesso");
      }
      setFormOpen(false);
      setSelectedClient(null);
      setEditing(false);
      loadClients();
    } catch (err: any) {
      error("Erro ao salvar cliente", err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedClient) return;
    try {
      const { error: err } = await supabase.from("clients").delete().eq("id", selectedClient.id);
      if (err) throw err;
      success("Cliente excluído com sucesso");
      setDeleteOpen(false);
      setSelectedClient(null);
      loadClients();
    } catch (err: any) {
      error("Erro ao excluir cliente", err.message || "Não é possível excluir um cliente que possui veículos ou apólices.");
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Clientes</h1>
          <p className="text-gray-600">Cadastro e gestão de clientes da corretora</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleCreate} icon={<Plus className="h-4 w-4" />}>
            Novo Cliente
          </Button>
          <Button variant="secondary" size="sm" onClick={loadClients} icon={<RefreshCw className="h-4 w-4" />} />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none z-10 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar por nome, CPF/CNPJ, telefone ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={["Nome", "CPF/CNPJ", "E-mail", "Telefone", "Veículos", "Criado em", "Ações"]}
            data={clients.map((c) => [
              <div key="1" className="flex flex-col">
                <span className="font-medium text-navy">{c.full_name}</span>
                <span className="text-xs text-gray-500">{c.email || "-"}</span>
              </div>,
              <div key="2" className="font-mono text-sm">{c.cpf_cnpj.length > 11 ? formatCNPJ(c.cpf_cnpj) : formatCPF(c.cpf_cnpj)}</div>,
              <span key="3">{c.email || "-"}</span>,
              <span key="4">{formatPhone(c.phone || "-")}</span>,
              <span key="5" className="text-sm">{c.vehicles?.[0]?.count ?? 0}</span>,
              <span key="6" className="text-sm text-gray-500">{formatDate(c.created_at)}</span>,
              <div key="7" className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleEdit(c)} icon={<Edit2 className="h-4 w-4" />} />Editar
                <Button variant="secondary" size="sm" onClick={() => navigate(`/clients/${c.id}`)} icon={<ChevronRight className="h-4 w-4" />} />
                <Button variant="secondary" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={() => handleDelete(c)} />
              </div>,
            ])}
          />
        </div>

        <div className="border-t border-gray-200 bg-gray-50 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          <span className="text-sm text-gray-600">{total} registro(s)</span>
        </div>
      </div>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Editar Cliente" : "Novo Cliente"} size="lg">
        <ClientForm onSave={handleSave} initialData={editing ? selectedClient : undefined} />
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Excluir Cliente" size="sm">
        <div className="text-gray-700">
          <p>Tem certeza que deseja excluir o cliente <strong>{selectedClient?.full_name}</strong>?</p>
          <p className="mt-2 text-sm text-gray-500">Esta ação não pode ser desfeita.</p>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
};

function ClientForm({ onSave, initialData }: { onSave: (values: any) => void; initialData?: any }) {
  const [form, setForm] = useState({
    full_name: initialData?.full_name || "",
    cpf_cnpj: initialData?.cpf_cnpj || "",
    birth_date: initialData?.birth_date || "",
    phone: initialData?.phone || "",
    whatsapp: initialData?.whatsapp || "",
    email: initialData?.email || "",
    cep: initialData?.cep || "",
    address: initialData?.address || "",
    number: initialData?.number || "",
    complement: initialData?.complement || "",
    neighborhood: initialData?.neighborhood || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    observations: initialData?.observations || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = "Nome completo é obrigatório";
    if (!form.cpf_cnpj.trim()) e.cpf_cnpj = "CPF/CNPJ é obrigatório";
    else {
      const digits = onlyDigits(form.cpf_cnpj);
      if (digits.length === 11 && !validateCPF(form.cpf_cnpj)) e.cpf_cnpj = "CPF inválido";
      if (digits.length === 14 && !validateCNPJ(form.cpf_cnpj)) e.cpf_cnpj = "CNPJ inválido";
    }
    if (form.email && !validateEmail(form.email)) e.email = "E-mail inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await onSave({ ...form, cpf_cnpj: onlyDigits(form.cpf_cnpj), phone: onlyDigits(form.phone), whatsapp: onlyDigits(form.whatsapp) });
    setLoading(false);
  };

  const isCNPJ = onlyDigits(form.cpf_cnpj).length > 11;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="col-span-full">
          <label className="label-field">Nome completo</label>
          <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} error={errors.full_name} />
          {errors.full_name && <p className="text-xs text-red-600 mt-1">{errors.full_name}</p>}
        </div>

        <div>
          <label className="label-field">CPF / CNPJ</label>
          <Input
            value={form.cpf_cnpj}
            onChange={(e) => setForm({ ...form, cpf_cnpj: isCNPJ ? maskCPF(e.target.value) : maskCPF(e.target.value) })}
            placeholder={isCNPJ ? "00.000.000/0000-00" : "000.000.000-00"}
            error={errors.cpf_cnpj}
          />
          {errors.cpf_cnpj && <p className="text-xs text-red-600 mt-1">{errors.cpf_cnpj}</p>}
        </div>

        <div>
          <label className="label-field">Data de nascimento</label>
          <Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
        </div>

        <div>
          <label className="label-field">Telefone</label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })} placeholder="(00) 00000-0000" />
        </div>

        <div>
          <label className="label-field">WhatsApp</label>
          <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: maskPhone(e.target.value) })} placeholder="(00) 00000-0000" />
        </div>

        <div>
          <label className="label-field">E-mail</label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="label-field">CEP</label>
          <Input value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value.replace(/\D/g, "") })} placeholder="00000-000" maxLength={8} />
        </div>

        <div className="col-span-full">
          <label className="label-field">Endereço</label>
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>

        <div>
          <label className="label-field">Número</label>
          <Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
        </div>

        <div>
          <label className="label-field">Complemento</label>
          <Input value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} />
        </div>

        <div>
          <label className="label-field">Bairro</label>
          <Input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
        </div>

        <div>
          <label className="label-field">Cidade</label>
          <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>

        <div>
          <label className="label-field">Estado</label>
          <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} maxLength={2} />
        </div>

        <div className="col-span-full">
          <label className="label-field">Observações</label>
          <textarea
            value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
            className="input-field w-full min-h-[80px] resize-y"
            placeholder="Observações sobre o cliente..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="secondary" type="button" onClick={() => {}}>Cancelar</Button>
        <Button type="submit" isLoading={loading}>Salvar Cliente</Button>
      </div>
    </form>
  );
};

export const ClientDetail = () => {
  const { id } = useParams();
  const { profile, role } = useAuth();
  const { error } = useToast();
  const [client, setClient] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      let q = supabase.from("clients").select("*").eq("id", id ?? "");
      if (role === "corretor") q = q.eq("corretor_id", profile?.id ?? "");
      const { data, error: err } = await q.single();
      if (err) throw err;
      setClient(data);

      const { data: v, error: verr } = await supabase.from("vehicles").select("*").eq("client_id", id ?? "");
      if (!verr) setVehicles(v || []);

      const { data: p, error: perr } = await supabase.from("policies").select("*").eq("client_id", id ?? "");
      if (!perr) setPolicies(p || []);
    } catch (err: any) {
      error("Erro ao carregar cliente", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (<div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>);
  if (!client) return (<div className="text-center py-20">Cliente não encontrado.</div>);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">{client.full_name}</h1>
          <p className="text-gray-600">Histórico do cliente</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => {}}>Editar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><span className="text-sm font-medium text-gray-500 uppercase">CPF / CNPJ</span></CardHeader>
          <CardBody><div className="font-mono text-lg">{client.cpf_cnpj.length > 11 ? formatCNPJ(client.cpf_cnpj) : formatCPF(client.cpf_cnpj)}</div></CardBody>
        </Card>
        <Card>
          <CardHeader><span className="text-sm font-medium text-gray-500 uppercase">E-mail</span></CardHeader>
          <CardBody>{client.email || "-"},</CardBody>
        </Card>
        <Card>
          <CardHeader><span className="text-sm font-medium text-gray-500 uppercase">Telefone</span></CardHeader>
          <CardBody>{formatPhone(client.phone || "-")}</CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-navy flex items-center gap-2"><Vehicle className="h-4 w-4" /> Veículos ({vehicles.length})</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {vehicles.length > 0 ? (
                vehicles.map((v) => (
                  <div key={v.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50 flex items-center gap-3">
                    <span className="text-sm font-medium text-navy">{v.brand} {v.model}</span>
                    <span className="ml-auto text-sm text-gray-600">{v.plate || "-"}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Nenhum veículo cadastrado.</p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-navy flex items-center gap-2"><FileText className="h-4 w-4" /> Apólices ({policies.length})</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {policies.length > 0 ? (
                policies.map((p) => (
                  <div key={p.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50 flex items-center gap-3">
                    <span className="text-sm font-medium text-navy">Apólice #{p.policy_number}</span>
                    <Badge variant={p.status === "Ativa" ? "success" : "secondary"}>{p.status}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Nenhuma apólice cadastrada.</p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
