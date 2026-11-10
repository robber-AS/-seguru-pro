import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { Button, Input, Card, Badge, Modal, Select, Table, Pagination } from "@/components/ui";
import { Building2, Search, Plus, RefreshCw, Phone, Mail, Link2, ToggleRight, ToggleLeft, Edit2, Trash2 } from "lucide-react";
import { formatDate, maskCPF, maskCNPJ, validateCNPJ, onlyDigits, cleanPayload, missingFields, orSafe } from "@/lib/utils";

export const InsurersList = () => {
  const { role } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
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

  const loadInsurers = async () => {
    setLoading(true);
    let q = supabase.from("insurers").select("*", { count: "exact" });
    if (search) { const s = orSafe(search); const d = onlyDigits(search); q = q.or(`name.ilike.%${s}%,email.ilike.%${s}%` + (d ? `,cnpj.ilike.%${d}%` : "")); }
    const from = (page - 1) * PAGE_SIZE;
    q = q.range(from, from + PAGE_SIZE - 1).order("created_at", { ascending: false });
    const { data, count, error: err } = await q;
    if (err) error("Erro ao carregar seguradoras", err.message);
    else {
      setInsurers(data || []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => { loadInsurers(); }, [search, page]);

  const handleSave = async (raw: any) => {
    const values = cleanPayload(raw);
    const missing = missingFields(values, { name: "Nome da seguradora" });
    if (missing.length) { error("Preencha os campos obrigatórios", missing.join(", ")); return; }
    try {
      if (editing && selected) {
        const { error: err } = await supabase.from("insurers").update(values).eq("id", selected.id);
        if (err) throw err;
        success("Seguradora atualizada com sucesso");
      } else {
        const { error: err } = await supabase.from("insurers").insert(values);
        if (err) throw err;
        success("Seguradora cadastrada com sucesso");
      }
      setFormOpen(false);
      setSelected(null);
      setEditing(false);
      loadInsurers();
    } catch (err: any) {
      error("Erro ao salvar seguradora", err.message);
    }
  };

  const handleEdit = (i: any) => { setSelected(i); setEditing(true); setFormOpen(true); };

  const handleDelete = (i: any) => {
    setSelected(i);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      const { error: err } = await supabase.from("insurers").delete().eq("id", selected.id);
      if (err) throw err;
      success("Seguradora excluída com sucesso");
      setDeleteOpen(false);
      setSelected(null);
      loadInsurers();
    } catch (err: any) {
      error("Erro ao excluir seguradora", err.message || "Não é possível excluir uma seguradora que possui apólices.");
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Seguradoras</h1>
          <p className="text-gray-600">Cadastro de seguradoras parceiras</p>
        </div>
        <Button onClick={() => { setEditing(false); setSelected(null); setFormOpen(true); }} icon={<Plus className="h-4 w-4" />}>
          Nova Seguradora
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="pointer-events-none z-10 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Pesquisar por nome, CNPJ ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table
            columns={["Nome", "CNPJ", "Telefone", "E-mail", "Contato", "Status", "Ações"]}
            data={insurers.map((i) => [
              <span key="1" className="text-sm font-medium text-navy">{i.name}</span>,
              <span key="2" className="text-sm font-mono">{i.cnpj ? maskCNPJ(i.cnpj) : "-"}</span>,
              <span key="3" className="text-sm">{i.phone || "-"}</span>,
              <span key="4" className="text-sm">{i.email || "-"}</span>,
              <span key="5" className="text-sm text-gray-600">{i.commercial_contact || "-"}</span>,
              <Badge key="6" variant={i.is_active ? "success" : "secondary"}>{i.is_active ? "Ativa" : "Inativa"}</Badge>,
              <div key="7" className="flex items-center gap-2"><Button variant="secondary" size="sm" onClick={() => handleEdit(i)} icon={<Edit2 className="h-4 w-4" />}>Editar</Button><Button variant="secondary" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={() => handleDelete(i)} /></div>,
            ])}
          />
        </div>
        <div className="border-t border-gray-200 bg-gray-50 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          <span className="text-sm text-gray-600">{total} registro(s)</span>
        </div>
      </div>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Editar Seguradora" : "Nova Seguradora"} size="md">
        <InsurerForm onSave={handleSave} initialData={selected} />
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Excluir Seguradora" size="sm">
        <div className="text-gray-700">
          <p>Tem certeza que deseja excluir a seguradora <strong>{selected?.name}</strong>?</p>
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

function InsurerForm({ onSave, initialData }: { onSave: (values: any) => void; initialData?: any }) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    cnpj: initialData?.cnpj || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    website: initialData?.website || "",
    commercial_contact: initialData?.commercial_contact || "",
    observations: initialData?.observations || "",
    is_active: initialData?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave({ ...form, cnpj: onlyDigits(form.cnpj), phone: onlyDigits(form.phone) });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-field">Nome da seguradora</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label-field">CNPJ</label>
          <Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: maskCNPJ(e.target.value) })} placeholder="00.000.000/0000-00" />
        </div>
        <div>
          <label className="label-field">Telefone</label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} />
        </div>
        <div>
          <label className="label-field">E-mail</label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Site</label>
          <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Contato comercial</label>
          <Input value={form.commercial_contact} onChange={(e) => setForm({ ...form, commercial_contact: e.target.value })} />
        </div>
        <div className="col-span-full">
          <label className="label-field">Observações</label>
          <textarea value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} className="input-field w-full min-h-[80px]" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <label className="text-sm">Seguradora ativa</label>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="secondary" type="button">Cancelar</Button>
        <Button type="submit" isLoading={loading}>Salvar Seguradora</Button>
      </div>
    </form>
  );
};
