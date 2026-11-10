import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { Button, Input, Card, Badge, Modal, Select, Table, Pagination } from "@/components/ui";
import { FilePlus, Search, Plus, RefreshCw, FileText, CreditCard, ShieldAlert, Calendar, Clock, Edit2, Trash2 } from "lucide-react";
import { formatDate, formatCurrency, onlyDigits, cleanPayload, missingFields, textMatch , toDecimal, toInputDecimal } from "@/lib/utils";

const POLICY_STATUSES = ["Ativa", "Cancelada", "Vencida", "Em renovação"];
const PAYMENT_METHODS = ["À vista", "Cartão de crédito", "Boleto", "Pix", "Financiamento"];

export const PoliciesList = () => {
  const { profile, role } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [insurers, setInsurers] = useState<any[]>([]);
  const [corretores, setCorretores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const PAGE_SIZE = 10;

  const loadLookups = async () => {
    let cq = supabase.from("clients").select("id, full_name");
    let vq = supabase.from("vehicles").select("id, plate, brand, model, client_id");
    let iq = supabase.from("insurers").select("id, name").eq("is_active", true);
    if (role === "corretor") {
      cq = cq.eq("corretor_id", profile?.id);
    }
    // admin vê todos os perfis; corretor só enxerga o próprio (RLS)
    const pq = supabase.from("profiles").select("id, full_name, email").order("full_name");
    const [cr, vr, ir, pr] = await Promise.all([cq, vq, iq, pq]);
    setCorretores(pr.data || []);
    setClients(cr.data || []);
    setVehicles(vr.data || []);
    setInsurers(ir.data || []);
  };

  const loadPolicies = async () => {
    setLoading(true);
    let q = supabase.from("policies").select("*, clients(full_name), vehicles(plate, brand, model), insurers(name), profiles(full_name)", { count: "exact" });
    if (role === "corretor") q = q.eq("corretor_id", profile?.id);
    q = q.order("created_at", { ascending: false });
    const from = (page - 1) * PAGE_SIZE;
    if (!search) q = q.range(from, from + PAGE_SIZE - 1);
    const { data, count, error: err } = await q;
    if (err) error("Erro ao carregar apólices", err.message);
    else if (search) {
      const found = (data || []).filter((x: any) => textMatch(search, x.policy_number, x.clients?.full_name, x.vehicles?.plate, x.insurers?.name, x.status));
      setPolicies(found.slice(from, from + PAGE_SIZE)); setTotal(found.length);
    } else { setPolicies(data || []); setTotal(count ?? 0); }
    setLoading(false);
  };

  useEffect(() => { loadLookups(); loadPolicies(); }, [search, page, role, profile?.id]);

  const handleSave = async (raw: any) => {
    const values = cleanPayload({ ...raw, corretor_id: raw.corretor_id || profile?.id });
    const missing = missingFields(values, { policy_number: "Número da apólice", client_id: "Cliente", vehicle_id: "Veículo", insurer_id: "Seguradora", start_date: "Início da vigência", end_date: "Fim da vigência", premium_value: "Valor do prêmio" });
    if (missing.length) { error("Preencha os campos obrigatórios", missing.join(", ")); return; }
    try {
      if (editing && selected) {
        const { error: err } = await supabase.from("policies").update(values).eq("id", selected.id);
        if (err) throw err;
        success("Apólice atualizada com sucesso");
      } else {
        const { error: err } = await supabase.from("policies").insert(values);
        if (err) throw err;
        success("Apólice cadastrada com sucesso");
      }
      setFormOpen(false); setSelected(null); setEditing(false); loadPolicies();
    } catch (err: any) { error("Erro ao salvar apólice", err.message); }
  };

  const handleEdit = (p: any) => { setSelected(p); setEditing(true); setFormOpen(true); };

  const handleDelete = (p: any) => {
    setSelected(p);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      const { error: err } = await supabase.from("policies").delete().eq("id", selected.id);
      if (err) throw err;
      success("Apólice excluída com sucesso");
      setDeleteOpen(false);
      setSelected(null);
      loadPolicies();
    } catch (err: any) {
      error("Erro ao excluir apólice", err.message || "Não é possível excluir esta apólice.");
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Apólices</h1>
          <p className="text-gray-600">Cadastro e gestão de apólices de seguros</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => { setEditing(false); setSelected(null); setFormOpen(true); }} icon={<Plus className="h-4 w-4" />}>
            Nova Apólice
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="pointer-events-none z-10 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Pesquisar por número da apólice, cliente, veículo ou seguradora..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table
            columns={["Nº Apólice", "Cliente", "Veículo", "Seguradora", "Vigência", "Prêmio", "Status", "Ações"]}
            data={policies.map((p) => [
              <span key="1" className="text-sm font-mono font-medium text-navy">#{p.policy_number}</span>,
              <span key="2" className="text-sm">{p.clients?.full_name || "-"}</span>,
              <div key="3" className="flex flex-col"><span className="text-sm font-medium">{p.vehicles?.brand || "-"} {p.vehicles?.model || "-"}</span><span className="text-xs text-gray-500">{p.vehicles?.plate || "-"}</span></div>,
              <span key="4" className="text-sm">{p.insurers?.name || "-"}</span>,
              <span key="5" className="text-sm text-gray-500">{formatDate(p.start_date)} a {formatDate(p.end_date)}</span>,
              <span key="6" className="text-sm font-medium text-navy">{formatCurrency(p.premium_value)}</span>,
              <Badge key="7" variant={statusVariant(p.status)}>{p.status}</Badge>,
              <div key="8" className="flex items-center gap-2"><Button variant="secondary" size="sm" onClick={() => handleEdit(p)} icon={<Edit2 className="h-4 w-4" />}>Editar</Button><Button variant="secondary" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={() => handleDelete(p)} /></div>,
            ])}
          />
        </div>
        <div className="border-t border-gray-200 bg-gray-50 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          <span className="text-sm text-gray-600">{total} registro(s)</span>
        </div>
      </div>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Editar Apólice" : "Nova Apólice"} size="lg">
        <PolicyForm clients={clients} vehicles={vehicles} insurers={insurers} corretores={corretores} onSave={handleSave} initialData={selected} />
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Excluir Apólice" size="sm">
        <div className="text-gray-700">
          <p>Tem certeza que deseja excluir a apólice <strong>#{selected?.policy_number}</strong>?</p>
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

function statusVariant(s: string) {
  if (s === "Ativa") return "success";
  if (s === "Vencida") return "danger";
  if (s === "Em renovação") return "warning";
  return "secondary";
}

function PolicyForm({ clients, vehicles, insurers, corretores, onSave, initialData }: { clients: any[]; vehicles: any[]; insurers: any[]; corretores: any[]; onSave: (values: any) => void; initialData?: any }) {
  const [form, setForm] = useState({
    policy_number: initialData?.policy_number || "",
    client_id: initialData?.client_id || "",
    vehicle_id: initialData?.vehicle_id || "",
    insurer_id: initialData?.insurer_id || "",
    corretor_id: initialData?.corretor_id || "",
    contract_date: initialData?.contract_date || new Date().toISOString().split("T")[0],
    start_date: initialData?.start_date || new Date().toISOString().split("T")[0],
    end_date: initialData?.end_date || new Date().toISOString().split("T")[0],
    premium_value: toInputDecimal(initialData?.premium_value),
    franchise_value: toInputDecimal(initialData?.franchise_value),
    commission_percent: toInputDecimal(initialData?.commission_percent),
    commission_value: toInputDecimal(initialData?.commission_value),
    payment_method: initialData?.payment_method || "",
    installments: initialData?.installments || "",
    status: initialData?.status || "Ativa",
    pdf_url: initialData?.pdf_url || "",
    observations: initialData?.observations || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const values = {
      ...form,
      premium_value: toDecimal(form.premium_value),
      franchise_value: toDecimal(form.franchise_value),
      commission_percent: toDecimal(form.commission_percent),
      commission_value: toDecimal(form.commission_value),
      installments: form.installments ? parseInt(form.installments, 10) : null,
    };
    // se informou o % mas não clicou em "calcular", calcula a comissão aqui
    if (!values.commission_value && values.premium_value && values.commission_percent) {
      values.commission_value = ((parseFloat(values.premium_value) * parseFloat(values.commission_percent)) / 100).toFixed(2);
    }
    await onSave(values);
    setLoading(false);
  };

  const handleCalcCommission = () => {
    const premium = parseFloat(toDecimal(form.premium_value) || "0") || 0;
    const percent = parseFloat(toDecimal(form.commission_percent) || "0") || 0;
    const value = (premium * percent) / 100;
    setForm({ ...form, commission_value: toInputDecimal(value) });
  };

  // só mostra os veículos do cliente escolhido
  const filteredVehicles = form.client_id ? vehicles.filter((v: any) => v.client_id === form.client_id) : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="label-field">Número da apólice</label>
          <Input value={form.policy_number} onChange={(e) => setForm({ ...form, policy_number: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Cliente</label>
          <Select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value, vehicle_id: "" })} options={clients.map((c) => ({ label: c.full_name, value: c.id }))} />
        </div>
        <div>
          <label className="label-field">Veículo</label>
          <Select value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })} options={filteredVehicles.map((v: any) => ({ label: `${v.brand} ${v.model} - ${v.plate}`, value: v.id }))} />
        </div>
        <div>
          <label className="label-field">Seguradora</label>
          <Select value={form.insurer_id} onChange={(e) => setForm({ ...form, insurer_id: e.target.value })} options={insurers.map((i) => ({ label: i.name, value: i.id }))} />
        </div>
        <div>
          <label className="label-field">Corretor responsável</label>
          <Select value={form.corretor_id} onChange={(e) => setForm({ ...form, corretor_id: e.target.value })} placeholder="Eu mesmo" options={corretores.map((c) => ({ label: c.full_name || c.email, value: c.id }))} />
        </div>
        <div>
          <label className="label-field">Data de contratação</label>
          <Input type="date" value={form.contract_date} onChange={(e) => setForm({ ...form, contract_date: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Início da vigência</label>
          <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Final da vigência</label>
          <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Valor total do prêmio</label>
          <Input type="text" value={form.premium_value} onChange={(e) => setForm({ ...form, premium_value: e.target.value.replace(/[^0-9,]/g, "") })} placeholder="0,00" />
        </div>
        <div>
          <label className="label-field">Valor da franquia</label>
          <Input type="text" value={form.franchise_value} onChange={(e) => setForm({ ...form, franchise_value: e.target.value.replace(/[^0-9,]/g, "") })} placeholder="0,00" />
        </div>
        <div>
          <label className="label-field">Comissão percentual (%)</label>
          <Input type="text" value={form.commission_percent} onChange={(e) => setForm({ ...form, commission_percent: e.target.value.replace(/[^0-9,]/g, "") })} placeholder="0,00" />
        </div>
        <div className="flex items-center gap-2">
          <Input type="text" value={form.commission_value} onChange={(e) => setForm({ ...form, commission_value: e.target.value.replace(/[^0-9,]/g, "") })} placeholder="0,00" />
          <Button variant="secondary" size="sm" onClick={handleCalcCommission}>Calcular</Button>
        </div>
        <div>
          <label className="label-field">Forma de pagamento</label>
          <Select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} options={PAYMENT_METHODS.map((p) => ({ label: p, value: p }))} />
        </div>
        <div>
          <label className="label-field">Quantidade de parcelas</label>
          <Input type="number" value={form.installments} onChange={(e) => setForm({ ...form, installments: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Status da apólice</label>
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={POLICY_STATUSES.map((s) => ({ label: s, value: s }))} />
        </div>
        <div className="col-span-full">
          <label className="label-field">Observações</label>
          <textarea value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} className="input-field w-full min-h-[80px]" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="secondary" type="button">Cancelar</Button>
        <Button type="submit" isLoading={loading}>Salvar Apólice</Button>
      </div>
    </form>
  );
}
