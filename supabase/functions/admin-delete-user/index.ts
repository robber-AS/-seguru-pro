// Edge Function: exclui um usuário do SegurPro. Só pode ser chamada por um admin logado.
// Deleta do auth.users (service role), o que faz cascata em public.profiles via ON DELETE CASCADE.
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
  if (callerProfile?.role !== "admin") return json({ error: "Apenas administradores podem excluir usuários" }, 403);

  // 3) valida os dados
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Dados inválidos" }, 400); }
  const userId = String(body.user_id || "").trim();
  if (!userId) return json({ error: "Informe o usuário" }, 400);

  // não pode excluir a si mesmo
  if (userId === caller.user.id) return json({ error: "Você não pode excluir o próprio usuário" }, 400);

  // 4) busca o usuário alvo
  const { data: targetProfile } = await admin.from("profiles").select("id, full_name, email, role").eq("id", userId).single();
  if (!targetProfile) return json({ error: "Usuário não encontrado" }, 404);

  // 5) não deixa o sistema sem administrador
  if (targetProfile.role === "admin") {
    const { data: admins } = await admin.from("profiles").select("id").eq("role", "admin");
    if ((admins?.length ?? 0) <= 1) return json({ error: "Não é possível excluir o último administrador do sistema" }, 400);
  }

  // 6) exclui do Auth (cascata para profiles via ON DELETE CASCADE)
  const { error: delErr } = await admin.auth.admin.deleteUser(userId);
  if (delErr) return json({ error: delErr.message || "Não foi possível excluir o usuário" }, 400);

  // 7) registra na auditoria
  await admin.from("audit_logs").insert({
    user_id: caller.user.id,
    action: "delete_user",
    table_name: "profiles",
    record_id: userId,
    old_values: { email: targetProfile.email, full_name: targetProfile.full_name, role: targetProfile.role },
  });

  return json({ id: userId, email: targetProfile.email, full_name: targetProfile.full_name });
});
