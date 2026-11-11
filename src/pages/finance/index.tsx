import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { Button, Input, Card, Badge, Modal, Select, Table } from "@/components/ui";
import { CreditCard, Search, Plus, RefreshCw, TrendingUp, BarChart3, PieChart, Edit2, Trash2 } from "lucide-react";
import { formatCurrency, formatDate, cleanPayload, missingFields , toDecimal, toInputDecimal , parseDate } from "@/lib/utils";

export const FinancePage = () => {
  const { profile, role } = useAuth();
  const { success, error } = useToast();
  const [commissions, setCommissions] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    loadData();
  }, [period, role, profile?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      let pq = supabase.from("policies").select("*, clients(full_name), insurers(name), profiles(full_name)");
      // commissions não tem corretor próprio: o corretor vem da apólice (commissions -> policies -> profiles)
      let cq = supabase.from("commissions").select("*, policies!inner(policy_number, premium_value, corretor_id, profiles(full_name))");
      if (role === "corretor") {
        pq = pq.eq("corretor_id", profile?.id ?? "");
        cq = cq.eq("policies.corretor_id", profile?.id ?? "");
      }
      const [pr, cr] = await Promise.all([pq, cq]);
      if (pr.error) throw pr.error;
      if (cr.error) throw cr.error;
      setPolicies(pr.data || []);
      setCommissions(cr.data || []);
    } catch (err: any) {
      error("Erro ao carregar financeiro", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = policies.filter((p) => {
    if (period === "month") {
      const d = parseDate(p.contract_date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalPremium = filteredPolicies.reduce((acc, p) => acc + parseFloat(p.premium_value || 0), 0);
  const totalCommission = commissions.reduce((acc, c) => acc + parseFloat(c.value || 0), 0);
  const receivedCommission = commissions.filter((c) => c.status === "Recebido").reduce((acc, c) => acc + parseFloat(c.value || 0), 0);
  const pendingCommission = commissions.filter((c) => c.status !== "Recebido").reduce((acc, c) => acc + parseFloat(c.value || 0), 0);

  const salesByBroker = Object.values(
    policies.reduce((acc: any, p) => {
      const b = p.profiles?.full_name || "Não definido";
      if (!acc[b]) acc[b] = { name: b, premium: 0, count: 0 };
      acc[b].premium += parseFloat(p.premium_value || 0);
      acc[b].count += 1;
      return acc;
    }, {})
  );

  const salesByInsurer = Object.values(
    policies.reduce((acc: any, p) => {
      const i = p.insurers?.name || "Não definido";
      if (!acc[i]) acc[i] = { name: i, premium: 0, count: 0 };
      acc[i].premium += parseFloat(p.premium_value || 0);
      acc[i].count += 1;
      return acc;
    }, {})
  );

  const handleSave = async (raw: any) => {
    const values = cleanPayload(raw);
    const missing = missingFields(values, { policy_id: "Apólice" });
    if (missing.length) { error("Preencha os campos obrigatórios", missing.join(", ")); return; }
    try {
      if (editing && selected) {
        const { error: err } = await supabase.from("commissions").update(values).eq("id", selected.id);
        if (err) throw err;
        success("Comissão atualizada com sucesso");
      } else {
        const { error: err } = await supabase.from("commissions").insert(values);
        if (err) throw err;
        success("Comissão cadastrada com sucesso");
      }
      setFormOpen(false); setSelected(null); setEditing(false); loadData();
    } catch (err: any) { error("Erro ao salvar comissão", err.message); }
  };

  const handleEdit = (c: any) => { setSelected(c); setEditing(true); setFormOpen(true); };

  const handleDelete = (c: any) => {
    setSelected(c);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      const { error: err } = await supabase.from("commissions").delete().eq("id", selected.id);
      if (err) throw err;
      success("Comissão excluída com sucesso");
      setDeleteOpen(false);
      setSelected(null);
      loadData();
    } catch (err: any) {
      error("Erro ao excluir comissão", err.message || "Não é possível excluir esta comissão.");
    }
  };

  const handleReceive = async (id: string) => {
    const { error: err } = await supabase.from("commissions").update({ status: "Recebido", received_date: new Date().toISOString().split("T")[0] }).eq("id", id);
    if (err) error("Erro", err.message);
    else { success("Comissão marcada como recebida"); loadData(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Financeiro e Comissões</h1>
          <p className="text-gray-600">Acompanhamento de prêmios, comissões e recebimentos</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" onClick={loadData} icon={<RefreshCw className="h-4 w-4" />}>Atualizar</Button>
          <Button onClick={() => { setEditing(false); setSelected(null); setFormOpen(true); }} icon={<Plus className="h-4 w-4" />}>Nova Comissão</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Prêmios vendidos (período)" value={formatCurrency(totalPremium)} icon={<CreditCard className="h-5 w-5" />} color="bg-blue-500" />
        <StatCard title="Comissões previstas" value={formatCurrency(totalCommission)} icon={<TrendingUp className="h-5 w-5" />} color="bg-indigo-500" />
        <StatCard title="Comissões recebidas" value={formatCurrency(receivedCommission)} icon={<CheckCircle2Fallback className="h-5 w-5" />} color="bg-green-500" />
        <StatCard title="Comissões pendentes" value={formatCurrency(pendingCommission)} icon={<ClockFallback className="h-5 w-5" />} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
            <h3 className="text-sm font-semibold text-navy flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Vendas por Corretor</h3>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {salesByBroker.slice(0, 5).map((s: any) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-20 sm:w-28 shrink-0 truncate">{s.name}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-blue-600" style={{ width: `${totalPremium ? Math.min((s.premium / totalPremium) * 100, 100) : 0}%` }} /></div>
                  <span className="text-sm font-medium text-navy shrink-0 text-right min-w-[84px]">{formatCurrency(s.premium)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
            <h3 className="text-sm font-semibold text-navy flex items-center gap-2"><PieChart className="h-4 w-4" /> Vendas por Seguradora</h3>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {salesByInsurer.slice(0, 5).map((s: any) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-20 sm:w-28 shrink-0 truncate">{s.name}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${totalPremium ? Math.min((s.premium / totalPremium) * 100, 100) : 0}%` }} /></div>
                  <span className="text-sm font-medium text-navy shrink-0 text-right min-w-[84px]">{formatCurrency(s.premium)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="pointer-events-none z-10 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Pesquisar apólice ou corretor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex flex-wrap gap-2">
            {["month", "quarter", "year"].map((p) => (
              <Button key={p} variant={period === p ? "primary" : "secondary"} size="sm" onClick={() => setPeriod(p)}>{p === "month" ? "Mês" : p === "quarter" ? "Trimestre" : "Ano"}</Button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table
            columns={["Apólice", "Corretor", "Prêmio", "Comissão %", "Comissão R$", "Previsão", "Recebido", "Status", "Ação"]}
            data={commissions.slice(0, 30).map((c) => {
              const isReceived = c.status === "Recebido";
              return [
                <span key="1" className="text-sm font-mono">{c.policies?.policy_number || "-"}</span>,
                <span key="2" className="text-sm">{c.policies?.profiles?.full_name || "-"}</span>,
                <span key="3" className="text-sm">{formatCurrency(c.policies?.premium_value || 0)}</span>,
                <span key="4" className="text-sm">{c.percent ? `${toInputDecimal(c.percent).replace(/,00$/, "")}%` : "-"}</span>,
                <span key="5" className="text-sm font-medium">{formatCurrency(c.value || 0)}</span>,
                <span key="6" className="text-sm text-gray-500">{formatDate(c.expected_date)}</span>,
                <span key="7" className="text-sm text-gray-500">{formatDate(c.received_date) || "-"}</span>,
                <Badge key="8" variant={isReceived ? "success" : "warning"}>{isReceived ? "Recebido" : "Pendente"}</Badge>,
                <div key="9" className="flex items-center gap-2">
                  {!isReceived && <Button variant="secondary" size="sm" onClick={() => handleReceive(c.id)}>Receber</Button>}
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(c)} icon={<Edit2 className="h-4 w-4" />}>Editar</Button>
                  <Button variant="secondary" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={() => handleDelete(c)} />
                </div>,
              ];
            })}
          />
        </div>
      </div>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Editar Comissão" : "Nova Comissão"} size="md">
        <CommissionForm policies={policies} onSave={handleSave} initialData={selected} />
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Excluir Comissão" size="sm">
        <div className="text-gray-700">
          <p>Tem certeza que deseja excluir esta comissão?</p>
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

function StatCard({ title, value, icon, color }: { title: string; value: React.ReactNode; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <div className="p-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xl font-bold text-navy">{value}</p>
        </div>
        <div className={`w-10 h-10 shrink-0 rounded-lg ${color} flex items-center justify-center text-white`}>{icon}</div>
      </div>
    </Card>
  );
}

function CheckCircle2Fallback({ className = "h-5 w-5" }: { className?: string }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>; }
function ClockFallback({ className = "h-5 w-5" }: { className?: string }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }

function CommissionForm({ policies, onSave, initialData }: { policies: any[]; onSave: (values: any) => void; initialData?: any }) {
  const [form, setForm] = useState({
    policy_id: initialData?.policy_id || "",
    percent: toInputDecimal(initialData?.percent),
    value: toInputDecimal(initialData?.value),
    expected_date: initialData?.expected_date || new Date().toISOString().split("T")[0],
    received_date: initialData?.received_date || "",
    status: initialData?.status || "Pendente",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave({
      ...form,
      percent: toDecimal(form.percent),
      value: toDecimal(form.value),
      received_date: form.received_date || null,
    });
    setLoading(false);
  };

  const handleCalc = () => {
    const pol = policies.find((p) => p.id === form.policy_id);
    if (!pol) return;
    const premium = parseFloat(pol.premium_value || 0);
    const percent = parseFloat(toDecimal(form.percent) || "0") || 0;
    const value = (premium * percent) / 100;
    setForm({ ...form, value: toInputDecimal(value) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-field">Apólice</label>
          <Select value={form.policy_id} onChange={(e) => setForm({ ...form, policy_id: e.target.value })} options={policies.map((p) => ({ label: `#${p.policy_number} - ${p.clients?.full_name}`, value: p.id }))} />
        </div>
        <div>
          <label className="label-field">Percentual de comissão (%)</label>
          <Input type="text" value={form.percent} onChange={(e) => setForm({ ...form, percent: e.target.value.replace(/[^0-9,]/g, "") })} placeholder="0,00" />
        </div>
        <div>
          <label className="label-field">Valor da comissão (R$)</label>
          <Input type="text" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value.replace(/[^0-9,]/g, "") })} placeholder="0,00" />
        </div>
        <div className="flex items-end gap-2">
          <Button variant="secondary" size="sm" onClick={handleCalc}>Calcular com base no prêmio</Button>
        </div>
        <div>
          <label className="label-field">Data prevista de recebimento</label>
          <Input type="date" value={form.expected_date} onChange={(e) => setForm({ ...form, expected_date: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Data efetiva de recebimento</label>
          <Input type="date" value={form.received_date} onChange={(e) => setForm({ ...form, received_date: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Status do pagamento</label>
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[
            { label: "Pendente", value: "Pendente" },
            { label: "Recebido", value: "Recebido" },
            { label: "Cancelado", value: "Cancelado" },
          ]} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="secondary" type="button">Cancelar</Button>
        <Button type="submit" isLoading={loading}>Salvar Comissão</Button>
      </div>
    </form>
  );
}
