import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { Button, Input, Card, Badge, Modal, Select, Table, Pagination } from "@/components/ui";
import { FileText, Search, Plus, RefreshCw, Truck, ShieldCheck, Car, User, CreditCard, Edit2, Trash2 } from "lucide-react";
import { formatDate, formatCurrency, onlyDigits, cleanPayload, missingFields, textMatch , toDecimal, toInputDecimal } from "@/lib/utils";

const QUOTE_STATUSES = ["Nova cotação", "Em análise", "Aguardando cliente", "Aprovada", "Recusada", "Convertida em apólice"];
const PAYMENT_METHODS = ["À vista", "Cartão de crédito", "Boleto", "Pix", "Financiamento"];

export const QuotesList = () => {
  const { profile, role } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [insurers, setInsurers] = useState<any[]>([]);
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
    const [cr, vr, ir] = await Promise.all([cq, vq, iq]);
    setClients(cr.data || []);
    setVehicles(vr.data || []);
    setInsurers(ir.data || []);
  };

  const loadQuotes = async () => {
    setLoading(true);
    // o RLS já restringe o corretor às cotações dos seus clientes
    let q = supabase.from("quotes").select("*, clients(full_name), vehicles(plate, brand, model), insurers(name)", { count: "exact" }).order("created_at", { ascending: false });
    const from = (page - 1) * PAGE_SIZE;
    if (!search) q = q.range(from, from + PAGE_SIZE - 1);
    const { data, count, error: err } = await q;
    if (err) error("Erro ao carregar cotações", err.message);
    else if (search) {
      const found = (data || []).filter((x: any) => textMatch(search, x.clients?.full_name, x.vehicles?.plate, x.vehicles?.model, x.insurers?.name, x.status));
      setQuotes(found.slice(from, from + PAGE_SIZE)); setTotal(found.length);
    } else { setQuotes(data || []); setTotal(count ?? 0); }
    setLoading(false);
  };

  useEffect(() => { loadLookups(); loadQuotes(); }, [search, page, role, profile?.id]);

  const handleSave = async (raw: any) => {
    const values = cleanPayload(raw);
    const missing = missingFields(values, { client_id: "Cliente", vehicle_id: "Veículo", insurer_id: "Seguradora", premium_value: "Valor do prêmio" });
    if (missing.length) { error("Preencha os campos obrigatórios", missing.join(", ")); return; }
    try {
      if (editing && selected) {
        const { error: err } = await supabase.from("quotes").update(values).eq("id", selected.id);
        if (err) throw err;
        success("Cotação atualizada com sucesso");
      } else {
        const { error: err } = await supabase.from("quotes").insert(values);
        if (err) throw err;
        success("Cotação registrada com sucesso");
      }
      setFormOpen(false); setSelected(null); setEditing(false); loadQuotes();
    } catch (err: any) { error("Erro ao salvar cotação", err.message); }
  };

  const handleEdit = (q: any) => { setSelected(q); setEditing(true); setFormOpen(true); };
  const handleDelete = (q: any) => {
    setSelected(q);
    setDeleteOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      const { error: err } = await supabase.from("quotes").delete().eq("id", selected.id);
      if (err) throw err;
      success("Cotação excluída com sucesso");
      setDeleteOpen(false);
      setSelected(null);
      loadQuotes();
    } catch (err: any) {
      error("Erro ao excluir cotação", err.message || "Não é possível excluir esta cotação.");
    }
  };
  const handleConvert = (q: any) => {
    navigate("/policies");
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Cotações</h1>
          <p className="text-gray-600">Registro e comparação de cotações de seguros</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => { setEditing(false); setSelected(null); setFormOpen(true); }} icon={<Plus className="h-4 w-4" />}>
            Nova Cotação
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="pointer-events-none z-10 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Pesquisar por cliente, veículo ou seguradora..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table
            columns={["Cliente", "Veículo", "Seguradora", "Valor", "Status", "Data", "Ações"]}
            data={quotes.map((q) => [
              <span key="1" className="text-sm">{q.clients?.full_name || "-"}</span>,
              <div key="2" className="flex flex-col"><span className="text-sm font-medium text-navy">{q.vehicles?.brand || "-"} {q.vehicles?.model || "-"}</span><span className="text-xs text-gray-500">{q.vehicles?.plate || "-"}</span></div>,
              <span key="3" className="text-sm">{q.insurers?.name || "-"}</span>,
              <span key="4" className="text-sm font-medium text-navy">{formatCurrency(q.premium_value)}</span>,
              <Badge key="5" variant={statusVariant(q.status)}>{q.status}</Badge>,
              <span key="6" className="text-sm text-gray-500">{formatDate(q.quote_date)}</span>,
              <div key="7" className="flex items-center gap-2">
                <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(q); }} icon={<Edit2 className="h-4 w-4" />}>Editar</Button>
                {q.status !== "Convertida em apólice" && <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleConvert(q); }}>Converter</Button>}
                <Button variant="secondary" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); handleDelete(q); }} />
              </div>,
            ])}
            rowOnClick={(i) => handleEdit(quotes[i])}
          />
        </div>
        <div className="border-t border-gray-200 bg-gray-50 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          <span className="text-sm text-gray-600">{total} registro(s)</span>
        </div>
      </div>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Editar Cotação" : "Nova Cotação"} size="lg">
        <QuoteForm clients={clients} vehicles={vehicles} insurers={insurers} onSave={handleSave} initialData={selected} />
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Excluir Cotação" size="sm">
        <div className="text-gray-700">
          <p>Tem certeza que deseja excluir esta cotação?</p>
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
  if (s === "Aprovada") return "success";
  if (s === "Recusada") return "danger";
  if (s === "Convertida em apólice") return "info";
  return "warning";
}

function QuoteForm({ clients, vehicles, insurers, onSave, initialData }: { clients: any[]; vehicles: any[]; insurers: any[]; onSave: (values: any) => void; initialData?: any }) {
  const clientVehicles = initialData ? vehicles.filter((v: any) => v.client_id === initialData.client_id) : [];
  const [form, setForm] = useState({
    client_id: initialData?.client_id || "",
    vehicle_id: initialData?.vehicle_id || "",
    insurer_id: initialData?.insurer_id || "",
    quote_date: initialData?.quote_date || new Date().toISOString().split("T")[0],
    premium_value: toInputDecimal(initialData?.premium_value),
    franchise_value: toInputDecimal(initialData?.franchise_value),
    payment_method: initialData?.payment_method || "",
    installments: initialData?.installments || "",
    coverage: initialData?.coverage || "",
    third_party_coverage: initialData?.third_party_coverage ?? false,
    assistance_24h: initialData?.assistance_24h ?? false,
    replacement_car: initialData?.replacement_car ?? false,
    theft_protection: initialData?.theft_protection ?? false,
    observations: initialData?.observations || "",
    status: initialData?.status || "Nova cotação",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave({
      ...form,
      premium_value: toDecimal(form.premium_value),
      franchise_value: toDecimal(form.franchise_value),
      installments: form.installments ? parseInt(form.installments, 10) : null,
      third_party_coverage: form.third_party_coverage === "true" || form.third_party_coverage === true,
      assistance_24h: form.assistance_24h === "true" || form.assistance_24h === true,
      replacement_car: form.replacement_car === "true" || form.replacement_car === true,
      theft_protection: form.theft_protection === "true" || form.theft_protection === true,
    });
    setLoading(false);
  };

  // só mostra os veículos do cliente escolhido
  const filteredVehicles = form.client_id ? vehicles.filter((v: any) => v.client_id === form.client_id) : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <label className="label-field">Data da cotação</label>
          <Input type="date" value={form.quote_date} onChange={(e) => setForm({ ...form, quote_date: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Valor do seguro (prêmio)</label>
          <Input type="text" value={form.premium_value} onChange={(e) => setForm({ ...form, premium_value: e.target.value.replace(/[^0-9,]/g, "") })} placeholder="0,00" />
        </div>
        <div>
          <label className="label-field">Valor da franquia</label>
          <Input type="text" value={form.franchise_value} onChange={(e) => setForm({ ...form, franchise_value: e.target.value.replace(/[^0-9,]/g, "") })} placeholder="0,00" />
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
          <label className="label-field">Cobertura contratada</label>
          <Input value={form.coverage} onChange={(e) => setForm({ ...form, coverage: e.target.value })} />
        </div>
        <div className="flex items-center gap-2"><Checkbox label="Cobertura para terceiros" checked={form.third_party_coverage === true} onChange={(v) => setForm({ ...form, third_party_coverage: v })} /></div>
        <div className="flex items-center gap-2"><Checkbox label="Assistência 24 horas" checked={form.assistance_24h === true} onChange={(v) => setForm({ ...form, assistance_24h: v })} /></div>
        <div className="flex items-center gap-2"><Checkbox label="Carro reserva" checked={form.replacement_car === true} onChange={(v) => setForm({ ...form, replacement_car: v })} /></div>
        <div className="flex items-center gap-2"><Checkbox label="Proteção roubo/furto" checked={form.theft_protection === true} onChange={(v) => setForm({ ...form, theft_protection: v })} /></div>
        <div>
          <label className="label-field">Status da cotação</label>
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={QUOTE_STATUSES.map((s) => ({ label: s, value: s }))} />
        </div>
        <div className="col-span-full">
          <label className="label-field">Observações</label>
          <textarea value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} className="input-field w-full min-h-[80px]" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="secondary" type="button">Cancelar</Button>
        <Button type="submit" isLoading={loading}>Salvar Cotação</Button>
      </div>
    </form>
  );
};

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
