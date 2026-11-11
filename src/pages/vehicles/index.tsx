import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { Button, Input, Badge, Modal, Select, Table, Pagination } from "@/components/ui";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { onlyDigits, cleanPayload, missingFields, textMatch } from "@/lib/utils";

const VEHICLE_TYPES = [
  { value: "car", label: "Automóvel" },
  { value: "motorcycle", label: "Motocicleta" },
];

const FUEL_TYPES = ["Gasolina", "Etanol", "Diesel", "Flex", "Elétrico", "Híbrido", "Outro"];

const USAGE_TYPES = ["Pessoal", "Comercial", "Misto", "Aluguel", "Transporte de carga", "Outro"];

export const VehiclesList = () => {
  const { profile, role } = useAuth();
  const { success, error } = useToast();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const PAGE_SIZE = 10;

  const loadClients = async () => {
    let q = supabase.from("clients").select("id, full_name");
    if (role === "corretor") q = q.eq("corretor_id", profile?.id ?? "");
    const { data } = await q.order("full_name");
    setClients(data || []);
  };

  const loadVehicles = async () => {
    setLoading(true);
    // o RLS já restringe o corretor aos veículos dos seus clientes
    let q = supabase.from("vehicles").select("*, clients(full_name, cpf_cnpj)", { count: "exact" }).order("created_at", { ascending: false });
    const from = (page - 1) * PAGE_SIZE;
    // busca inclui o nome do cliente (tabela relacionada), então filtra no navegador
    if (!search) q = q.range(from, from + PAGE_SIZE - 1);
    const { data, count, error: err } = await q;
    if (err) error("Erro ao carregar veículos", err.message);
    else if (search) {
      const found = (data || []).filter((v: any) => textMatch(search, v.plate, v.brand, v.model, v.clients?.full_name, v.chassis));
      setVehicles(found.slice(from, from + PAGE_SIZE));
      setTotal(found.length);
    } else {
      setVehicles(data || []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadClients();
    loadVehicles();
  }, [search, page, role, profile?.id]);

  const handleSave = async (raw: any) => {
    const values = cleanPayload(raw);
    const missing = missingFields(values, { client_id: "Cliente proprietário", type: "Tipo", brand: "Marca", model: "Modelo" });
    if (missing.length) { error("Preencha os campos obrigatórios", missing.join(", ")); return; }
    try {
      if (editing && selected) {
        const { error: err } = await supabase.from("vehicles").update(values).eq("id", selected.id);
        if (err) throw err;
        success("Veículo atualizado com sucesso");
      } else {
        const { error: err } = await supabase.from("vehicles").insert(values);
        if (err) throw err;
        success("Veículo cadastrado com sucesso");
      }
      setFormOpen(false);
      setSelected(null);
      setEditing(false);
      loadVehicles();
    } catch (err: any) {
      error("Erro ao salvar veículo", err.message);
    }
  };

  const handleEdit = (v: any) => {
    setSelected(v);
    setEditing(true);
    setFormOpen(true);
  };

  const handleDelete = (v: any) => {
    setSelected(v);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      const { error: err } = await supabase.from("vehicles").delete().eq("id", selected.id);
      if (err) throw err;
      success("Veículo excluído com sucesso");
      setDeleteOpen(false);
      setSelected(null);
      loadVehicles();
    } catch (err: any) {
      error("Erro ao excluir veículo", err.message || "Não é possível excluir um veículo que possui apólices.");
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Veículos</h1>
          <p className="text-gray-600">Cadastro de automóveis e motocicletas</p>
        </div>
        <Button onClick={() => { setEditing(false); setSelected(null); setFormOpen(true); }} icon={<Plus className="h-4 w-4" />}>
          Novo Veículo
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="pointer-events-none z-10 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Pesquisar por placa, marca, modelo ou cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table
            columns={["Cliente", "Tipo", "Marca / Modelo", "Placa", "Ano", "Cor", "Ações"]}
            data={vehicles.map((v) => [
              <span key="1" className="text-sm">{v.clients?.full_name || "-"}</span>,
              <Badge key="2" variant={v.type === "car" ? "info" : "secondary"}>{v.type === "car" ? "Automóvel" : "Motocicleta"}</Badge>,
              <div key="3" className="flex flex-col"><span className="text-sm font-medium text-navy">{v.brand} {v.model}</span><span className="text-xs text-gray-500">{v.year_manufacture}/{v.year_model}</span></div>,
              <span key="4" className="text-sm font-mono">{v.plate || "-"}</span>,
              <span key="5" className="text-sm">{v.year_manufacture || "-"}</span>,
              <span key="6" className="text-sm">{v.color || "-"}</span>,
              <div key="7" className="flex items-center gap-2"><Button variant="secondary" size="sm" onClick={() => handleEdit(v)} icon={<Edit2 className="h-4 w-4" />}>Editar</Button><Button variant="secondary" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={() => handleDelete(v)} /></div>,
            ])}
          />
        </div>
        <div className="border-t border-gray-200 bg-gray-50 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          <span className="text-sm text-gray-600">{total} registro(s)</span>
        </div>
      </div>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Editar Veículo" : "Novo Veículo"} size="lg">
        <VehicleForm clients={clients} onSave={handleSave} initialData={selected} />
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Excluir Veículo" size="sm">
        <div className="text-gray-700">
          <p>Tem certeza que deseja excluir o veículo <strong>{selected?.brand} {selected?.model} ({selected?.plate})</strong>?</p>
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

function VehicleForm({ clients, onSave, initialData }: { clients: any[]; onSave: (values: any) => void; initialData?: any }) {
  const [form, setForm] = useState({
    client_id: initialData?.client_id || "",
    type: initialData?.type || "car",
    brand: initialData?.brand || "",
    model: initialData?.model || "",
    year_manufacture: initialData?.year_manufacture || "",
    year_model: initialData?.year_model || "",
    plate: initialData?.plate || "",
    renavam: initialData?.renavam || "",
    chassis: initialData?.chassis || "",
    color: initialData?.color || "",
    fuel: initialData?.fuel || "",
    mileage: initialData?.mileage || "",
    fipe_code: initialData?.fipe_code || "",
    fipe_value: initialData?.fipe_value || "",
    declared_value: initialData?.declared_value || "",
    usage: initialData?.usage || "",
    sleep_cep: initialData?.sleep_cep || "",
    observations: initialData?.observations || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave({
      ...form,
      year_manufacture: form.year_manufacture ? parseInt(form.year_manufacture, 10) : null,
      year_model: form.year_model ? parseInt(form.year_model, 10) : null,
    });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="label-field">Cliente proprietário</label>
          <Select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} options={clients.map((c) => ({ label: c.full_name, value: c.id }))} />
        </div>
        <div>
          <label className="label-field">Tipo de veículo</label>
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={VEHICLE_TYPES} />
        </div>
        <div>
          <label className="label-field">Marca</label>
          <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Modelo</label>
          <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Ano de fabricação</label>
          <Input type="number" value={form.year_manufacture} onChange={(e) => setForm({ ...form, year_manufacture: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Ano do modelo</label>
          <Input type="number" value={form.year_model} onChange={(e) => setForm({ ...form, year_model: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Placa</label>
          <Input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })} placeholder="ABC-1234" maxLength={7} />
        </div>
        <div>
          <label className="label-field">RENAVAM</label>
          <Input value={form.renavam} onChange={(e) => setForm({ ...form, renavam: onlyDigits(e.target.value) })} />
        </div>
        <div>
          <label className="label-field">Chassi</label>
          <Input value={form.chassis} onChange={(e) => setForm({ ...form, chassis: e.target.value })} maxLength={17} />
        </div>
        <div>
          <label className="label-field">Cor</label>
          <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Combustível</label>
          <Select value={form.fuel} onChange={(e) => setForm({ ...form, fuel: e.target.value })} options={FUEL_TYPES.map((f) => ({ label: f, value: f }))} />
        </div>
        <div>
          <label className="label-field">Quilometragem</label>
          <Input value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Código FIPE</label>
          <Input value={form.fipe_code} onChange={(e) => setForm({ ...form, fipe_code: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Valor FIPE</label>
          <Input type="number" value={form.fipe_value} onChange={(e) => setForm({ ...form, fipe_value: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Valor declarado</label>
          <Input type="number" value={form.declared_value} onChange={(e) => setForm({ ...form, declared_value: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Utilização</label>
          <Select value={form.usage} onChange={(e) => setForm({ ...form, usage: e.target.value })} options={USAGE_TYPES.map((u) => ({ label: u, value: u }))} />
        </div>
        <div>
          <label className="label-field">CEP de pernoite</label>
          <Input value={form.sleep_cep} onChange={(e) => setForm({ ...form, sleep_cep: e.target.value.replace(/\D/g, "") })} placeholder="00000-000" maxLength={8} />
        </div>
        <div className="col-span-full">
          <label className="label-field">Observações</label>
          <textarea value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} className="input-field w-full min-h-[80px]" placeholder="Observações..." />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="secondary" type="button">Cancelar</Button>
        <Button type="submit" isLoading={loading}>Salvar Veículo</Button>
      </div>
    </form>
  );
};
