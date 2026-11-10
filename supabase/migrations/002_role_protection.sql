-- ============================================================================
-- 002 - Proteção de perfis de acesso
--  * SQL Editor / service role (auth.uid() nulo) podem alterar perfis
--    (necessário para recuperar acesso e para a Edge Function admin-create-user)
--  * usuários do app só alteram perfis se forem admin
--  * o sistema nunca fica sem nenhum administrador
-- ============================================================================
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role then
    if auth.uid() is not null and not public.is_admin() then
      raise exception 'Apenas administradores podem alterar o perfil de acesso';
    end if;
    if old.role = 'admin' and new.role <> 'admin'
       and not exists (select 1 from public.profiles where role = 'admin' and id <> old.id) then
      raise exception 'Não é possível remover o último administrador do sistema';
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function public.prevent_role_escalation() from public, anon, authenticated;
