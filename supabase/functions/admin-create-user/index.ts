// Edge Function: cria um usuário do SegurPro. Só pode ser chamada por um admin logado.
// Usa a service role (disponível só aqui no servidor) para criar o login já confirmado.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // 1) quem está chamando?
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Não autenticado" }, 401);
  const { data: caller, error: callerErr } = await admin.auth.getUser(token);
  if (callerErr || !caller?.user) return json({ error: "Sessão inválida. Entre novamente." }, 401);

  // 2) é admin?
  const { data: callerProfile } = await admin.from("profiles").select("role").eq("id", caller.user.id).single();
  if (callerProfile?.role !== "admin") return json({ error: "Apenas administradores podem cadastrar usuários" }, 403);

  // 3) valida os dados
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Dados inválidos" }, 400); }
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const full_name = String(body.full_name || "").trim();
  const role = body.role === "admin" ? "admin" : "corretor";

  if (!full_name) return json({ error: "Informe o nome completo" }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "E-mail inválido" }, 400);
  if (password.length < 8) return json({ error: "A senha precisa ter pelo menos 8 caracteres" }, 400);

  // 4) cria o login já confirmado (o trigger handle_new_user cria o profile como corretor)
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });
  if (createErr || !created?.user) {
    const msg = /already|registered|exists/i.test(createErr?.message || "")
      ? "Já existe um usuário com este e-mail"
      : createErr?.message || "Não foi possível criar o usuário";
    return json({ error: msg }, 400);
  }

  // 5) ajusta nome e perfil (service role pode alterar o role)
  const { error: profErr } = await admin
    .from("profiles")
    .update({ full_name, email, role })
    .eq("id", created.user.id);
  if (profErr) return json({ error: "Usuário criado, mas falhou ao definir o perfil: " + profErr.message }, 500);

  // 6) registra na auditoria
  await admin.from("audit_logs").insert({
    user_id: caller.user.id,
    action: "create_user",
    table_name: "profiles",
    record_id: created.user.id,
    new_values: { email, full_name, role },
  });

  return json({ id: created.user.id, email, full_name, role });
});
