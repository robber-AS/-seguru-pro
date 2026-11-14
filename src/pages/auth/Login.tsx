import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { Logo } from "@/components/Logo";
import logoMdmBg from "@/assets/logo-mdm-bg.jpg";
import { Mail, Eye, EyeOff, Loader2, ArrowLeft, Mail as MailIcon } from "lucide-react";

export const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { error, success } = useToast();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error("Campos obrigatórios", "Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      error("Erro ao entrar", err.message || "Credenciais inválidas.");
    } else {
      success("Bem-vindo de volta!");
      navigate("/dashboard");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-black bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${logoMdmBg})` }}
    >
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm">
          <div className="mb-8 text-center">
            <Logo height={64} className="mx-auto mb-5" />
            <h2 className="text-2xl font-bold text-navy">Entrar</h2>
            <p className="text-gray-600">Acesse sua conta da MDM Corretora de Seguros</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-field">E-mail</label>
              <InputWithIcon icon={<Mail className="h-5 w-5" />} type="email" placeholder="seu@email.com" value={email} onChange={(e: { target: { value: string } }) => setEmail(e.target.value)} required />
            </div>

            <div className="relative">
              <label className="label-field">Senha</label>
              <input
                type={showPassword ? "text" : "password"}
                className="input-field w-full pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Mostrar senha"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Lembrar de mim
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : ""} Entrar
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Não tem uma conta?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

function InputWithIcon({ icon, ...props }: any) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
      <input {...props} className="input-field w-full pl-10" />
    </div>
  );
}

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { success, error } = useToast();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error: err } = await resetPassword(email);
    setLoading(false);
    if (err) {
      error("Erro", err.message || "Não foi possível enviar o link de recuperação.");
    } else {
      setSent(true);
      success("Link enviado", "Verifique seu e-mail para redefinir sua senha.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-black bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${logoMdmBg})` }}
    >
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate("/login")} className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-navy">Recuperar senha</h2>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label-field">E-mail</label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="email"
                    className="input-field w-full pl-10"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e: { target: { value: string } }) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : ""} Enviar link
              </button>
              <p className="text-center text-xs text-gray-500">
                O link de redefinição será enviado para seu e-mail.
              </p>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-navy mb-2">E-mail enviado</h3>
              <p className="text-gray-600 text-sm">Verifique sua caixa de entrada e clique no link para redefinir sua senha.</p>
              <button onClick={() => navigate("/login")} className="mt-6 text-sm text-blue-600 font-medium hover:text-blue-700">
                Voltar ao login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ResetPassword = () => {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-black bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${logoMdmBg})` }}
    >
      <div className="max-w-md mx-auto py-12 text-center">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm mx-auto">
          <h2 className="text-xl font-bold text-navy mb-2">Redefinição de senha</h2>
          <p className="text-gray-600 text-sm mb-6">
            Use o link enviado por e-mail para criar uma nova senha.
          </p>
          <button onClick={() => navigate("/login")} className="btn-primary">
            Voltar ao login
          </button>
        </div>
      </div>
    </div>
  );
};
