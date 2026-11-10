import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { Button, Input } from "@/components/ui";
import { Mail, ArrowLeft } from "lucide-react";
import { validateEmail } from "@/lib/utils";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { success, error } = useToast();
  const [form, setForm] = React.useState({ email: "", password: "", full_name: "", role: "corretor" as const });
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(form.email)) { error("E-mail inválido", "Informe um e-mail válido."); return; }
    if (!form.password || form.password.length < 6) { error("Senha fraca", "A senha deve ter pelo menos 6 caracteres."); return; }
    setLoading(true);
    const { error: err } = await signUp(form.email, form.password, form.full_name, form.role);
    setLoading(false);
    if (err) { error("Erro ao cadastrar", err.message || "Não foi possível criar a conta."); return; }
    success("Conta criada com sucesso", "Faça login para acessar o sistema.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate("/login")} className="text-gray-400 hover:text-gray-600 transition-colors"><ArrowLeft className="h-5 w-5" /></button>
            <h2 className="text-xl font-bold text-navy">Criar conta</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-field">Nome completo</label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Nome completo" required />
            </div>
            <div>
              <label className="label-field">E-mail</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" /><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="seu@email.com" className="pl-10" required /></div>
            </div>
            <div>
              <label className="label-field">Senha</label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-sm text-blue-800">Contas criadas aqui têm acesso de <strong>Corretor</strong>. Apenas administradores podem criar contas de administrador na área de gerenciamento de usuários.</p>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Criando..." : "Criar conta"}</button>
          </form>
          <p className="mt-8 text-center text-sm text-gray-600">Já tem uma conta?{" "} <button onClick={() => navigate("/login")} className="text-blue-600 hover:text-blue-700 font-medium">Entrar</button></p>
        </div>
      </div>
    </div>
  );
};
