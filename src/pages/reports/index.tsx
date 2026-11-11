import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { Button, Input, Badge, Select, Table } from "@/components/ui";
import { FileText, RefreshCw, FileText as FileCsv, FileSpreadsheet } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const ReportsPage = () => {
  const { profile, role } = useAuth();
  const { success, error } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    client_id: "",
    corretor_id: "",
    insurer_id: "",
    vehicle_type: "",
    policy_status: "",
    min_value: "",
    max_value: "",
  });
  const [clients, setClients] = useState<any[]>([]);
  const [insurers, setInsurers] = useState<any[]>([]);
  const [corretores, setCorretores] = useState<any[]>([]);

  useEffect(() => {
    loadLookups();
  }, []);

  const loadLookups = async () => {
    let cq = supabase.from("clients").select("id, full_name");
    let iq = supabase.from("insurers").select("id, name");
    let uq = supabase.from("profiles").select("id, full_name").eq("role", "corretor");
    if (role === "corretor") {
      cq = cq.eq("corretor_id", profile?.id ?? "");
      uq = uq.eq("id", profile?.id ?? "");
    }
    const [cr, ir, ur] = await Promise.all([cq, iq, uq]);
    setClients(cr.data || []);
    setInsurers(ir.data || []);
    setCorretores(ur.data || []);
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      let q = supabase.from("policies").select("*, clients(full_name, cpf_cnpj), vehicles(type, brand, model, plate), insurers(name), profiles(full_name)");
      if (role === "corretor") q = q.eq("corretor_id", profile?.id ?? "");
      if (filters.start_date) q = q.gte("start_date", filters.start_date);
      if (filters.end_date) q = q.lte("start_date", filters.end_date);
      if (filters.client_id) q = q.eq("client_id", filters.client_id);
      if (filters.corretor_id) q = q.eq("corretor_id", filters.corretor_id);
      if (filters.insurer_id) q = q.eq("insurer_id", filters.insurer_id);
      if (filters.vehicle_type) q = eqVehicleType(q, filters.vehicle_type);
      if (filters.policy_status) q = q.eq("status", filters.policy_status);
      if (filters.min_value) q = q.gte("premium_value", filters.min_value);
      if (filters.max_value) q = q.lte("premium_value", filters.max_value);
      const { data, error: err } = await q.order("start_date", { ascending: false });
      if (err) throw err;
      setData(data || []);
      success(`Relatório gerado com ${data?.length || 0} registro(s)`);
    } catch (err: any) {
      error("Erro ao gerar relatório", err.message);
    } finally {
      setLoading(false);
    }
  };

  const eqVehicleType = (q: any, type: string) => q.eq("vehicles.type", type);

  const exportCSV = () => {
    const headers = ["Nº Apólice", "Cliente", "Veículo", "Tipo", "Seguradora", "Vigência Início", "Vigência Fim", "Prêmio", "Status", "Corretor"];
    const rows = data.map((p) => [
      p.policy_number,
      p.clients?.full_name,
      p.vehicles?.brand + " " + p.vehicles?.model,
      p.vehicles?.type === "car" ? "Automóvel" : "Motocicleta",
      p.insurers?.name,
      formatDate(p.start_date),
      formatDate(p.end_date),
      formatCurrency(p.premium_value),
      p.status,
      p.profiles?.full_name,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio-seguru-${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    success(`CSV exportado com ${data.length} registro(s)`);
  };

  const exportXLS = () => {
    const headers = ["Nº Apólice", "Cliente", "Veículo", "Tipo", "Seguradora", "Vigência Início", "Vigência Fim", "Prêmio", "Status", "Corretor"];
    const rows = data.map((p) => [
      p.policy_number,
      p.clients?.full_name,
      p.vehicles?.brand + " " + p.vehicles?.model,
      p.vehicles?.type === "car" ? "Automóvel" : "Motocicleta",
      p.insurers?.name,
      formatDate(p.start_date),
      formatDate(p.end_date),
      formatCurrency(p.premium_value),
      p.status,
      p.profiles?.full_name,
    ]);
    const tableHtml = `
      <html>
        <head><meta charset="utf-8"><title>Relatório SEGURPRO</title></head>
        <body>
          <h2>Relatório de Apólices - SEGURPRO</h2>
          <p>Gerado em: ${new Date().toLocaleString("pt-BR")}</p>
          <table border="1" cellspacing="0" cellpadding="5">
            <thead>
              <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${rows.map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join("")}</tr>`).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio-seguru-${new Date().toISOString().slice(0,10)}.xls`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    success(`XLS exportado com ${data.length} registro(s)`);
  };

  const exportPDF = () => {
    if (data.length === 0) {
      error("Não há dados para exportar");
      return;
    }
    const headers = ["Nº Apólice", "Cliente", "Veículo", "Tipo", "Seguradora", "Vigência Início", "Vigência Fim", "Prêmio", "Status", "Corretor"];
    const rows = data.map((p) => [
      p.policy_number,
      p.clients?.full_name,
      p.vehicles?.brand + " " + p.vehicles?.model,
      p.vehicles?.type === "car" ? "Automóvel" : "Motocicleta",
      p.insurers?.name,
      formatDate(p.start_date),
      formatDate(p.end_date),
      formatCurrency(p.premium_value),
      p.status,
      p.profiles?.full_name,
    ]);
    const printHtml = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Relatório SEGURPRO</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; color: #0f172a; padding: 20px; }
            h2 { text-align: center; margin-bottom: 10px; }
            .subtitle { text-align: center; font-size: 11px; color: #64748b; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #0f172a; color: #fff; padding: 6px 8px; text-align: left; border: 1px solid #0f172a; font-size: 11px; }
            td { padding: 5px 8px; border: 1px solid #cbd5e1; font-size: 11px; }
            tr:nth-child(even) td { background: #f8fafc; }
            @media print { body { padding: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <h2>Relatório de Apólices - SEGURPRO</h2>
          <p class="subtitle">Gerado em: ${new Date().toLocaleString("pt-BR")} &nbsp;|&nbsp; Total: ${data.length} registro(s)</p>
          <table>
            <thead>
              <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${rows.map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join("")}</tr>`).join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `;
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) {
      error("Não foi possível abrir a janela de impressão. Desabilite o bloqueador de pop-ups.");
      return;
    }
    win.document.write(printHtml);
    win.document.close();
    success("PDF enviado para impressão");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Relatórios</h1>
          <p className="text-gray-600">Filtros avançados e exportação de dados</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" onClick={generateReport} icon={<RefreshCw className="h-4 w-4" />}>Gerar</Button>
          <Button variant="secondary" size="sm" onClick={exportCSV} icon={<FileCsv className="h-4 w-4" />}>Exportar CSV</Button>
          <Button variant="secondary" size="sm" onClick={exportPDF} icon={<FileText className="h-4 w-4" />}>Exportar PDF</Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div>
              <label className="label-field">Período de</label>
              <Input type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Período até</label>
              <Input type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Cliente</label>
              <Select value={filters.client_id} onChange={(e) => setFilters({ ...filters, client_id: e.target.value })} options={clients.map((c) => ({ label: c.full_name, value: c.id }))} />
            </div>
            <div>
              <label className="label-field">Corretor</label>
              <Select value={filters.corretor_id} onChange={(e) => setFilters({ ...filters, corretor_id: e.target.value })} options={corretores.map((c) => ({ label: c.full_name, value: c.id }))} />
            </div>
            <div>
              <label className="label-field">Seguradora</label>
              <Select value={filters.insurer_id} onChange={(e) => setFilters({ ...filters, insurer_id: e.target.value })} options={insurers.map((i) => ({ label: i.name, value: i.id }))} />
            </div>
            <div>
              <label className="label-field">Tipo de veículo</label>
              <Select value={filters.vehicle_type} onChange={(e) => setFilters({ ...filters, vehicle_type: e.target.value })} options={[
                { label: "Automóvel", value: "car" },
                { label: "Motocicleta", value: "motorcycle" },
              ]} />
            </div>
            <div>
              <label className="label-field">Status da apólice</label>
              <Select value={filters.policy_status} onChange={(e) => setFilters({ ...filters, policy_status: e.target.value })} options={[
                { label: "Ativa", value: "Ativa" },
                { label: "Vencida", value: "Vencida" },
                { label: "Cancelada", value: "Cancelada" },
                { label: "Em renovação", value: "Em renovação" },
              ]} />
            </div>
            <div>
              <label className="label-field">Valor mínimo (R$)</label>
              <Input type="text" value={filters.min_value} onChange={(e) => setFilters({ ...filters, min_value: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Valor máximo (R$)</label>
              <Input type="text" value={filters.max_value} onChange={(e) => setFilters({ ...filters, max_value: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table
            columns={["Nº Apólice", "Cliente", "Veículo", "Seguradora", "Vigência", "Prêmio", "Status", "Corretor"]}
            data={data.map((p) => [
              <span key="1" className="text-sm font-mono">#{p.policy_number}</span>,
              <span key="2" className="text-sm">{p.clients?.full_name || "-"}</span>,
              <span key="3" className="text-sm">{p.vehicles?.brand || "-"} {p.vehicles?.model || "-"}</span>,
              <span key="4" className="text-sm">{p.insurers?.name || "-"}</span>,
              <span key="5" className="text-sm text-gray-500">{formatDate(p.start_date)} a {formatDate(p.end_date)}</span>,
              <span key="6" className="text-sm font-medium">{formatCurrency(p.premium_value)}</span>,
              <Badge key="7" variant={statusVariant(p.status)}>{p.status}</Badge>,
              <span key="8" className="text-sm text-gray-600">{p.profiles?.full_name || "-"}</span>,
            ])}
          />
        </div>
        <div className="border-t border-gray-200 bg-gray-50 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-gray-600">{data.length} registro(s) encontrado(s)</span>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={exportCSV} icon={<FileCsv className="h-3 w-3" />}>CSV</Button>
            <Button variant="secondary" size="sm" onClick={exportXLS} icon={<FileSpreadsheet className="h-3 w-3" />}>XLS</Button>
            <Button variant="secondary" size="sm" onClick={exportPDF} icon={<FileText className="h-3 w-3" />}>PDF</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

function statusVariant(s: string) {
  if (s === "Ativa") return "success";
  if (s === "Vencida") return "danger";
  if (s === "Em renovação") return "warning";
  return "secondary";
}
