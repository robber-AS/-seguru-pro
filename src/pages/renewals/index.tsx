import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { Button, Input, Badge, Modal, Select, Table } from "@/components/ui";
import { RefreshCw, Search, Phone, FileText, Users } from "lucide-react";
import { formatDate, formatCurrency, textMatch , parseDate } from "@/lib/utils";

const RENEWAL_FILTERS = [
  { label: "Vencem em 7 dias", days: 7 },
  { label: "Vencem em 15 dias", days: 15 },
  { label: "Vencem em 30 dias", days: 30 },
  { label: "Vencem em 45 dias", days: 45 },
  { label: "Vencem em 60 dias", days: 60 },
  { label: "Já vencidas", days: -1 },
  { label: "Renovadas", days: -2 },
  { label: "Não renovadas", days: -3 },
];

export const RenewalsList = () => {
  const { profile, role } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<any[]>([]);
  const [renewals, setRenewals] = useState<any[]>([]);
  const [, setContacts] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [contactForm, setContactForm] = useState({ contact_date: new Date().toISOString().split("T")[0], contact_type: "Telefone", observations: "" });

  useEffect(() => {
    loadData();
  }, [filter, search, role, profile?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("policies")
        .select("*, clients(full_name, phone, whatsapp), vehicles(plate, brand, model), insurers(name), profiles(full_name)");
      if (role === "corretor") q = q.eq("corretor_id", profile?.id ?? "");
      const { data, error: err } = await q.order("end_date", { ascending: true });
      if (err) throw err;
      setPolicies((data || []).filter((p: any) => textMatch(search, p.clients?.full_name, p.vehicles?.plate, p.policy_number, p.insurers?.name)));

      // Load renewals history
      const { data: r } = await supabase.from("renewals").select("*, clients(full_name), vehicles(plate)").order("created_at", { ascending: false }).limit(50);
      setRenewals(r || []);

      // Load contacts
      const { data: c } = await supabase.from("renewal_contacts").select("*").order("contact_date", { ascending: false }).limit(50);
      setContacts(c || []);
    } catch (err: any) {
      error("Erro ao carregar renovações", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = policies.map((p) => {
    const end = parseDate(p.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let statusLabel = "Ativa";
    let variant: "success" | "warning" | "danger" | "secondary" = "success";
    if (days < 0) { statusLabel = "Vencida"; variant = "danger"; }
    else if (days <= 7) { statusLabel = "Vence em ≤7 dias"; variant = "danger"; }
    else if (days <= 30) { statusLabel = "Vence em ≤30 dias"; variant = "warning"; }
    return { ...p, days, statusLabel, variant };
  });

  const applyFilter = (items: any[]) => {
    if (filter === "all") return items;
    if (filter === "7") return items.filter((i) => i.days >= 0 && i.days <= 7);
    if (filter === "15") return items.filter((i) => i.days >= 0 && i.days <= 15);
    if (filter === "30") return items.filter((i) => i.days >= 0 && i.days <= 30);
    if (filter === "45") return items.filter((i) => i.days >= 0 && i.days <= 45);
    if (filter === "60") return items.filter((i) => i.days >= 0 && i.days <= 60);
    if (filter === "expired") return items.filter((i) => i.days < 0);
    return items;
  };

  const handleRenew = (p: any) => {
    setSelected(p);
    setContactForm({ contact_date: new Date().toISOString().split("T")[0], contact_type: "Telefone", observations: "" });
    setModalOpen(true);
  };

  const handleSaveContact = async () => {
    if (!selected) return;
    try {
      // Create renewal record
      const { data: renewal, error: rerr } = await supabase.from("renewals").insert({
        policy_id: selected.id,
        client_id: selected.client_id,
        vehicle_id: selected.vehicle_id,
        insurer_id: selected.insurer_id,
        corretor_id: selected.corretor_id || profile?.id,
        old_premium_value: selected.premium_value,
        renewed: false,
        renewal_date: new Date().toISOString().split("T")[0],
        observations: contactForm.observations || null,
      }).select().single();
      if (rerr) throw rerr;

      const { error: cerr } = await supabase.from("renewal_contacts").insert({
        renewal_id: renewal.id,
        contact_date: contactForm.contact_date,
        contact_type: contactForm.contact_type,
        observations: contactForm.observations,
      });
      if (cerr) throw cerr;

      success("Contato de renovação registrado");
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      error("Erro ao registrar contato", err.message);
    }
  };

  const handleCreateQuote = (_p: any) => {
    navigate("/quotes");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Central de Renovações</h1>
          <p className="text-gray-600">Acompanhe apólices próximas do vencimento e gerencie renovações</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" onClick={loadData} icon={<RefreshCw className="h-4 w-4" />}>
            Atualizar
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={filter === "all" ? "primary" : "secondary"} size="sm" onClick={() => setFilter("all")}>Todas</Button>
        {RENEWAL_FILTERS.map((f) => (
          <Button key={f.label} variant={filter === String(f.days) ? "primary" : "secondary"} size="sm" onClick={() => setFilter(String(f.days))}>{f.label}</Button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search className="h-4 w-4" /></div>
        <Input placeholder="Pesquisar cliente, placa ou apólice..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            columns={["Cliente", "Telefone/WhatsApp", "Veículo", "Placa", "Seguradora", "Nº Apólice", "Vencimento", "Valor", "Corretor", "Status", "Ação"]}
            data={applyFilter(filtered).map((p) => {
              const color = p.variant === "danger" ? "text-red-600" : p.variant === "warning" ? "text-amber-600" : "text-green-600";
              return [
                <span key="1" className="text-sm font-medium text-navy">{p.clients?.full_name || "-"}</span>,
                <span key="2" className="text-sm">{p.clients?.whatsapp || p.clients?.phone || "-"}</span>,
                <span key="3" className="text-sm">{p.vehicles?.brand || "-"} {p.vehicles?.model || "-"}</span>,
                <span key="4" className="text-sm font-mono">{p.vehicles?.plate || "-"}</span>,
                <span key="5" className="text-sm">{p.insurers?.name || "-"}</span>,
                <span key="6" className="text-sm font-mono">#{p.policy_number}</span>,
                <span key="7" className={`text-sm font-medium ${color}`}>{formatDate(p.end_date)}</span>,
                <span key="8" className="text-sm">{formatCurrency(p.premium_value)}</span>,
                <span key="9" className="text-sm text-gray-600">{p.profiles?.full_name || "-"}</span>,
                <Badge key="10" variant={p.variant === "danger" ? "danger" : p.variant === "warning" ? "warning" : "success"}>{p.statusLabel}</Badge>,
                <div key="11" className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleRenew(p)} icon={<Phone className="h-4 w-4" />}>Contato</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleCreateQuote(p)} icon={<FileText className="h-4 w-4" />}>Nova cotação</Button>
                </div>,
              ];
            })}
          />
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Renovação: #${selected?.policy_number}`} size="md">
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600"><strong>Cliente:</strong> {selected?.clients?.full_name}</p>
            <p className="text-sm text-gray-600"><strong>Veículo:</strong> {selected?.vehicles?.brand} {selected?.vehicles?.model} ({selected?.vehicles?.plate})</p>
            <p className="text-sm text-gray-600"><strong>Seguradora:</strong> {selected?.insurers?.name}</p>
            <p className="text-sm text-gray-600"><strong>Prêmio atual:</strong> {formatCurrency(selected?.premium_value)}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Data do contato</label>
              <Input type="date" value={contactForm.contact_date} onChange={(e) => setContactForm({ ...contactForm, contact_date: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Tipo de contato</label>
              <Select value={contactForm.contact_type} onChange={(e) => setContactForm({ ...contactForm, contact_type: e.target.value })} options={[
                { label: "Telefone", value: "Telefone" },
                { label: "WhatsApp", value: "WhatsApp" },
                { label: "E-mail", value: "E-mail" },
                { label: "Visita", value: "Visita" },
              ]} />
            </div>
          </div>
          <div>
            <label className="label-field">Observações</label>
            <textarea value={contactForm.observations} onChange={(e) => setContactForm({ ...contactForm, observations: e.target.value })} className="input-field w-full min-h-[100px]" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveContact} isLoading={false}>Registrar Contato</Button>
          </div>
        </div>
      </Modal>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
          <h3 className="text-sm font-semibold text-navy flex items-center gap-2"><Users className="h-4 w-4" /> Histórico de Renovações</h3>
        </div>
        <div className="overflow-x-auto">
          <Table
            columns={["Cliente", "Veículo", "Seguradora", "Prêmio Anterior", "Novo Prêmio", "Renovada?", "Data", "Observações"]}
            data={renewals.slice(0, 20).map((r) => [
              <span key="1" className="text-sm">{r.clients?.full_name || "-"}</span>,
              <span key="2" className="text-sm">{r.vehicles?.plate || "-"}</span>,
              <span key="3" className="text-sm text-gray-600">{r.insurers?.name || "-"}</span>,
              <span key="4" className="text-sm">{formatCurrency(r.old_premium_value)}</span>,
              <span key="5" className="text-sm">{formatCurrency(r.new_premium_value || 0)}</span>,
              <Badge key="6" variant={r.renewed ? "success" : "secondary"}>{r.renewed ? "Sim" : "Não"}</Badge>,
              <span key="7" className="text-sm text-gray-500">{formatDate(r.renewal_date)}</span>,
              <span key="8" className="text-sm text-gray-500">{r.observations || "-"}</span>,
            ])}
          />
        </div>
      </div>
    </div>
  );
};
