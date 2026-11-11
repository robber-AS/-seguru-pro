import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui";
import { Users, CreditCard, ShieldAlert, Clock, FileText, DollarSign, TrendingUp, RefreshCw, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";
import { formatCurrency, parseDate } from "@/lib/utils";

interface StatCard {
  title: string;
  value: React.ReactNode;
  delta: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}


export const Dashboard = () => {
  const { profile, role } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({
    total_clients: 0,
    total_vehicles: 0,
    active_policies: 0,
    expired_policies: 0,
    expiring_soon: 0,
    pending_quotes: 0,
    monthly_sales: 0,
    total_premiums: 0,
    expected_commissions: 0,
    received_commissions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [role, profile?.id]);

  const loadData = async () => {
    try {
      const isAdmin = role === "admin";
      const corretorId = profile?.id;

      const [cRes, vRes, pRes, qRes] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("vehicles").select("id, type", { count: "exact", head: true }),
        (() => {
          const q = supabase
            .from("policies")
            .select("id, status, premium_value, end_date, commission_value, contract_date, corretor_id");
          return isAdmin ? q : q.eq("corretor_id", corretorId ?? "");
        })(),
        supabase.from("quotes").select("id, status, client_id"),
      ]);

      let clientsCount = cRes.count ?? 0;
      let vehiclesCount = vRes.count ?? 0;
      let policies = pRes.data ?? [];
      let quotes = qRes.data ?? [];

      if (!isAdmin && corretorId) {
        const { data: myClients } = await supabase.from("clients").select("id").eq("corretor_id", corretorId);
        const myClientIds = new Set((myClients ?? []).map((c: any) => c.id));
        quotes = quotes.filter((q: any) => myClientIds.has(q.client_id));
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activePolicies = policies.filter((p: any) => p.status === "Ativa").length;
      const expiredPolicies = policies.filter((p: any) => parseDate(p.end_date) < today).length;
      const expiringSoon = policies.filter((p: any) => {
        const d = parseDate(p.end_date);
        const days = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return days >= 0 && days <= 30;
      }).length;
      const pendingQuotes = quotes.filter((q: any) => q.status !== "Convertida em apólice").length;

      const now = new Date();
      const monthlySales = policies.reduce((acc: number, p: any) => {
        const d = parseDate(p.contract_date);
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) return acc + parseFloat(p.premium_value || 0);
        return acc;
      }, 0);
      const totalPremiums = policies.reduce((acc: number, p: any) => acc + parseFloat(p.premium_value || 0), 0);
      const expectedCommissions = policies.reduce((acc: number, p: any) => acc + parseFloat(p.commission_value || 0), 0);

      setStats({
        total_clients: clientsCount,
        total_vehicles: vehiclesCount,
        active_policies: activePolicies,
        expired_policies: expiredPolicies,
        expiring_soon: expiringSoon,
        pending_quotes: pendingQuotes,
        monthly_sales: monthlySales,
        total_premiums: totalPremiums,
        expected_commissions: expectedCommissions,
        received_commissions: 0,
      });
    } catch (err: any) {
      error("Erro ao carregar dashboard", err.message);
    } finally {
      setLoading(false);
    }
  };

  const cards: StatCard[] = [
    { title: "Total de Clientes", value: stats.total_clients, delta: "+12 este mês", icon: Users, color: "text-blue-600 bg-blue-50" },
    { title: "Veículos Segurados", value: stats.total_vehicles, delta: "+8 este mês", icon: CreditCard, color: "text-indigo-600 bg-indigo-50" },
    { title: "Apólices Ativas", value: stats.active_policies, delta: "+5 esta semana", icon: ShieldAlert, color: "text-green-600 bg-green-50" },
    { title: "Apólices Vencidas", value: stats.expired_policies, delta: "Precisam atenção", icon: AlertTriangle, color: "text-red-600 bg-red-50" },
    { title: "Vencem em 30 dias", value: stats.expiring_soon, delta: "Ações pendentes", icon: Clock, color: "text-amber-600 bg-amber-50" },
    { title: "Cotações em Andamento", value: stats.pending_quotes, delta: "+4 hoje", icon: FileText, color: "text-purple-600 bg-purple-50" },
    { title: "Vendas do Mês", value: formatCurrency(stats.monthly_sales), delta: "+18% vs mês passado", icon: DollarSign, color: "text-green-600 bg-green-50" },
    { title: "Prêmios Comercializados", value: formatCurrency(stats.total_premiums), delta: "Total acumulado", icon: TrendingUp, color: "text-indigo-600 bg-indigo-50" },
    { title: "Comissões Previstas", value: formatCurrency(stats.expected_commissions), delta: "A receber", icon: RefreshCw, color: "text-blue-600 bg-blue-50" },
    { title: "Comissões Recebidas", value: formatCurrency(stats.received_commissions), delta: "Recebido", icon: CheckCircle2, color: "text-green-600 bg-green-50" },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
          <p className="text-gray-600">Bem-vindo, {profile?.full_name || "Usuário"}</p>
        </div>
        <Button variant="secondary" onClick={loadData}>
          <RefreshCw className="h-4 w-4" /> Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
        {cards.map((card, i) => (
          <StatCard key={i} card={card} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ChartCard title="Vendas por Mês" type="bar">
          <div className="h-64 flex items-end gap-2">
            {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"].map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-blue-600 rounded-t-sm" style={{ height: `${40 + i * 10}%` }} />
                <span className="text-xs text-gray-500">{m}</span>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard title="Seguros por Seguradora" type="list">
          <div className="space-y-3">
            {["Porto Seguro", "Allianz", "Bradesco", "SulAmérica", "Tokio Marine"].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-24 shrink-0 truncate">{s}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-blue-600" style={{ width: `${90 - i * 15}%` }} /></div>
                <span className="text-sm font-medium text-navy w-8 shrink-0 text-right">{45 - i * 5}</span>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard title="Distribuição: Carros vs Motos" type="donut">
          <div className="h-64 flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                <circle cx="60" cy="60" r="50" stroke="#e5e7eb" strokeWidth="10" fill="none" />
                <circle cx="60" cy="60" r="50" stroke="#2563eb" strokeWidth="10" fill="none" strokeDasharray="220" strokeDashoffset="66" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-navy">70%</span>
                <span className="text-xs text-gray-500">automóveis</span>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Apólices por Status">
          <div className="space-y-4">
            {[
              { label: "Ativa", value: stats.active_policies, variant: "success" },
              { label: "Vencida", value: stats.expired_policies, variant: "danger" },
              { label: "Cancelada", value: 3, variant: "secondary" },
              { label: "Em renovação", value: 5, variant: "warning" },
            ].map((s) => (
              <div key={s.label} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-gray-50">
                <span className="text-sm text-gray-600">{s.label}</span>
                <BadgeC variant={s.variant}>{s.value}</BadgeC>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Ações Rápidas">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickAction icon={<Users className="h-4 w-4" />} label="Novo Cliente" color="bg-blue-500" onClick={() => navigate("/clients/new")} />
            <QuickAction icon={<FileText className="h-4 w-4" />} label="Nova Cotação" color="bg-purple-500" onClick={() => navigate("/quotes")} />
            <QuickAction icon={<CreditCard className="h-4 w-4" />} label="Nova Apólice" color="bg-indigo-500" onClick={() => navigate("/policies")} />
            <QuickAction icon={<Clock className="h-4 w-4" />} label="Renovações" color="bg-amber-500" onClick={() => navigate("/renewals")} />
          </div>
        </Card>
      </div>
    </div>
  );
};

function StatCard({ card }: { card: StatCard }) {
  const Icon = card.icon;
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-600">{card.title}</p>
            <p className="text-2xl font-bold text-navy">{card.value}</p>
            <p className="text-xs mt-1 text-gray-500">{card.delta}</p>
          </div>
          <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${card.color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode; type: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
        <h3 className="text-sm font-semibold text-navy flex items-center gap-2">
          <BarChart3 className="h-4 w-4" /> {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function BadgeC({ variant, children }: { variant: string; children: React.ReactNode }) {
  const variants: Record<string, string> = {
    success: "bg-green-100 text-green-700",
    danger: "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700",
    secondary: "bg-gray-200 text-gray-600",
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>{children}</span>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
        <h3 className="text-sm font-semibold text-navy">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function QuickAction({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick?: () => void }) {
  return (
    <a
      className="flex items-center gap-2 px-4 py-3 min-w-0 cursor-pointer rounded-lg border border-gray-200 bg-white hover:bg-blue-50 text-sm text-gray-700 transition-colors"
      onClick={onClick}
    >
      <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-white ${color}`}>{icon}</div>
      <span>{label}</span>
    </a>
  );
}
