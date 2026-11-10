-- ============================================================================
-- SEGURPRO - Gestão de Corretora de Seguros
-- Migração inicial do banco de dados (PostgreSQL / Supabase)
-- ============================================================================

-- Habilitar extensões
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. profiles (extende auth.users do Supabase Auth)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  email text,
  role text check (role in ('admin', 'corretor')) not null default 'corretor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. clients
-- ---------------------------------------------------------------------------
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  cpf_cnpj text not null unique,
  birth_date date,
  phone text,
  whatsapp text,
  email text,
  cep text,
  address text,
  number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  observations text,
  corretor_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. vehicles
-- ---------------------------------------------------------------------------
create table public.vehicles (
  id uuid default gen_random_uuid() primary key,
  client_id uuid not null references public.clients(id) on delete cascade,
  type text check (type in ('car', 'motorcycle')) not null,
  brand text not null,
  model text not null,
  year_manufacture integer,
  year_model integer,
  plate text,
  renavam text,
  chassis text,
  color text,
  fuel text,
  mileage text,
  fipe_code text,
  fipe_value text,
  declared_value text,
  usage text,
  sleep_cep text,
  observations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. insurers
-- ---------------------------------------------------------------------------
create table public.insurers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  cnpj text unique,
  phone text,
  email text,
  website text,
  commercial_contact text,
  observations text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. quotes
-- ---------------------------------------------------------------------------
create table public.quotes (
  id uuid default gen_random_uuid() primary key,
  client_id uuid not null references public.clients(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  insurer_id uuid not null references public.insurers(id) on delete cascade,
  quote_date date not null default current_date,
  premium_value text not null,
  franchise_value text,
  payment_method text,
  installments integer,
  coverage text,
  third_party_coverage boolean default false,
  assistance_24h boolean default false,
  replacement_car boolean default false,
  theft_protection boolean default false,
  observations text,
  status text not null default 'Nova cotação',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 6. quote_coverages
-- ---------------------------------------------------------------------------
create table public.quote_coverages (
  id uuid default gen_random_uuid() primary key,
  quote_id uuid not null references public.quotes(id) on delete cascade,
  coverage_type text not null,
  included boolean not null default false,
  value text
);

-- ---------------------------------------------------------------------------
-- 7. policies
-- ---------------------------------------------------------------------------
create table public.policies (
  id uuid default gen_random_uuid() primary key,
  policy_number text not null unique,
  client_id uuid not null references public.clients(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  insurer_id uuid not null references public.insurers(id) on delete cascade,
  corretor_id uuid references public.profiles(id),
  contract_date date not null default current_date,
  start_date date not null,
  end_date date not null,
  premium_value text not null,
  franchise_value text,
  commission_percent text,
  commission_value text,
  payment_method text,
  installments integer,
  status text not null default 'Ativa',
  pdf_url text,
  observations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 8. renewals
-- ---------------------------------------------------------------------------
create table public.renewals (
  id uuid default gen_random_uuid() primary key,
  policy_id uuid references public.policies(id) on delete set null,
  old_policy_id uuid references public.policies(id) on delete set null,
  new_policy_id uuid references public.policies(id) on delete set null,
  client_id uuid not null references public.clients(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  insurer_id uuid not null references public.insurers(id) on delete cascade,
  corretor_id uuid references public.profiles(id),
  old_premium_value text,
  new_premium_value text,
  renewed boolean not null default false,
  renewal_date date not null default current_date,
  observations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 9. renewal_contacts
-- ---------------------------------------------------------------------------
create table public.renewal_contacts (
  id uuid default gen_random_uuid() primary key,
  renewal_id uuid not null references public.renewals(id) on delete cascade,
  contact_date date not null default current_date,
  contact_type text,
  observations text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 10. commissions
-- ---------------------------------------------------------------------------
create table public.commissions (
  id uuid default gen_random_uuid() primary key,
  policy_id uuid not null references public.policies(id) on delete cascade,
  percent text,
  value text,
  expected_date date,
  received_date date,
  status text not null default 'Pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 11. payments
-- ---------------------------------------------------------------------------
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  commission_id uuid not null references public.commissions(id) on delete cascade,
  amount text,
  payment_date date,
  status text not null default 'Pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 12. documents
-- ---------------------------------------------------------------------------
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  entity_type text not null,
  entity_id uuid not null,
  file_url text,
  file_name text,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 13. audit_logs
-- ---------------------------------------------------------------------------
create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  action text not null,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Índices
-- ============================================================================
create index idx_clients_cpf_cnpj on public.clients(cpf_cnpj);
create index idx_clients_corretor on public.clients(corretor_id);
create index idx_vehicles_client on public.vehicles(client_id);
create index idx_vehicles_type on public.vehicles(type);
create index idx_vehicles_plate on public.vehicles(plate);
create index idx_insurers_cnpj on public.insurers(cnpj);
create index idx_insurers_active on public.insurers(is_active);
create index idx_quotes_client on public.quotes(client_id);
create index idx_quotes_vehicle on public.quotes(vehicle_id);
create index idx_quotes_insurer on public.quotes(insurer_id);
create index idx_quotes_status on public.quotes(status);
create index idx_policies_client on public.policies(client_id);
create index idx_policies_vehicle on public.policies(vehicle_id);
create index idx_policies_insurer on public.policies(insurer_id);
create index idx_policies_corretor on public.policies(corretor_id);
create index idx_policies_status on public.policies(status);
create index idx_policies_end_date on public.policies(end_date);
create index idx_renewals_policy on public.renewals(policy_id);
create index idx_renewals_client on public.renewals(client_id);
create index idx_renewals_date on public.renewals(renewal_date);
create index idx_commissions_policy on public.commissions(policy_id);
create index idx_commissions_status on public.commissions(status);
create index idx_audit_logs_user on public.audit_logs(user_id);
create index idx_audit_logs_created_at on public.audit_logs(created_at);

-- ============================================================================
-- Funções auxiliares
-- ============================================================================

-- Verifica se o usuário logado é admin (security definer evita recursão no RLS)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Cria o profile automaticamente ao cadastrar um usuário no Auth.
-- O primeiro usuário do sistema vira admin; os demais entram como corretor
-- (um admin pode promover depois pela tela de Usuários).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    case when exists (select 1 from public.profiles) then 'corretor' else 'admin' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Impede que um não-admin altere o próprio role
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Apenas administradores podem alterar o perfil de acesso';
  end if;
  return new;
end;
$$;

create trigger trg_profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.vehicles enable row level security;
alter table public.insurers enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_coverages enable row level security;
alter table public.policies enable row level security;
alter table public.renewals enable row level security;
alter table public.renewal_contacts enable row level security;
alter table public.commissions enable row level security;
alter table public.payments enable row level security;
alter table public.documents enable row level security;
alter table public.audit_logs enable row level security;

-- profiles: admin vê tudo, usuário vê o próprio
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin());

-- clients: admin tudo; corretor vê e edita apenas seus clientes
create policy "clients_all_admin" on public.clients
  for all using (
    public.is_admin()
  );
create policy "clients_select_own" on public.clients
  for select using (corretor_id = auth.uid());
create policy "clients_insert_own" on public.clients
  for insert with check (corretor_id = auth.uid());
create policy "clients_update_own" on public.clients
  for update using (corretor_id = auth.uid());
create policy "clients_delete_own" on public.clients
  for delete using (
    corretor_id = auth.uid()
    and not exists (select 1 from public.vehicles where client_id = clients.id)
    and not exists (select 1 from public.policies where client_id = clients.id)
  );

-- vehicles: via cliente
create policy "vehicles_all_admin" on public.vehicles
  for all using (
    public.is_admin()
  );
create policy "vehicles_select_own" on public.vehicles
  for select using (
    exists (select 1 from public.clients where clients.id = vehicles.client_id and clients.corretor_id = auth.uid())
  );
create policy "vehicles_insert_own" on public.vehicles
  for insert with check (
    exists (select 1 from public.clients where clients.id = vehicles.client_id and clients.corretor_id = auth.uid())
  );
create policy "vehicles_update_own" on public.vehicles
  for update using (
    exists (select 1 from public.clients where clients.id = vehicles.client_id and clients.corretor_id = auth.uid())
  );
create policy "vehicles_delete_own" on public.vehicles
  for delete using (
    exists (select 1 from public.clients where clients.id = vehicles.client_id and clients.corretor_id = auth.uid())
  );

-- insurers: todos leem; admin escreve
create policy "insurers_select_all" on public.insurers for select using (true);
create policy "insurers_all_admin" on public.insurers
  for all using (
    public.is_admin()
  );

-- quotes: via cliente
create policy "quotes_all_admin" on public.quotes
  for all using (
    public.is_admin()
  );
create policy "quotes_select_own" on public.quotes
  for select using (
    exists (select 1 from public.clients where clients.id = quotes.client_id and clients.corretor_id = auth.uid())
  );
create policy "quotes_insert_own" on public.quotes
  for insert with check (
    exists (select 1 from public.clients where clients.id = quotes.client_id and clients.corretor_id = auth.uid())
  );
create policy "quotes_update_own" on public.quotes
  for update using (
    exists (select 1 from public.clients where clients.id = quotes.client_id and clients.corretor_id = auth.uid())
  );

-- quote_coverages: via cotação -> cliente
create policy "quote_coverages_all_admin" on public.quote_coverages
  for all using (public.is_admin());
create policy "quote_coverages_all_own" on public.quote_coverages
  for all using (
    exists (select 1 from public.quotes
      join public.clients on clients.id = quotes.client_id
      where quotes.id = quote_coverages.quote_id and clients.corretor_id = auth.uid())
  );

-- policies: via cliente/corretor
create policy "policies_all_admin" on public.policies
  for all using (
    public.is_admin()
  );
create policy "policies_select_own" on public.policies
  for select using (
    corretor_id = auth.uid()
    or exists (select 1 from public.clients where clients.id = policies.client_id and clients.corretor_id = auth.uid())
  );
create policy "policies_insert_own" on public.policies
  for insert with check (
    corretor_id = auth.uid()
    or exists (select 1 from public.clients where clients.id = policies.client_id and clients.corretor_id = auth.uid())
  );
create policy "policies_update_own" on public.policies
  for update using (
    corretor_id = auth.uid()
    or exists (select 1 from public.clients where clients.id = policies.client_id and clients.corretor_id = auth.uid())
  );

-- renewals: admin tudo; corretor vê e edita as suas
create policy "renewals_all_admin" on public.renewals
  for all using (
    public.is_admin()
  );
create policy "renewals_select_own" on public.renewals
  for select using (
    corretor_id = auth.uid()
    or exists (select 1 from public.clients where clients.id = renewals.client_id and clients.corretor_id = auth.uid())
  );
create policy "renewals_insert_own" on public.renewals
  for insert with check (
    corretor_id = auth.uid()
    or exists (select 1 from public.clients where clients.id = renewals.client_id and clients.corretor_id = auth.uid())
  );
create policy "renewals_update_own" on public.renewals
  for update using (corretor_id = auth.uid());

-- renewal_contacts: ligado à renewal
create policy "renewal_contacts_all_admin" on public.renewal_contacts
  for all using (
    public.is_admin()
  );
create policy "renewal_contacts_select_own" on public.renewal_contacts
  for select using (
    exists (select 1 from public.renewals where renewals.id = renewal_contacts.renewal_id and renewals.corretor_id = auth.uid())
  );
create policy "renewal_contacts_insert_own" on public.renewal_contacts
  for insert with check (
    exists (select 1 from public.renewals where renewals.id = renewal_contacts.renewal_id and renewals.corretor_id = auth.uid())
  );

-- commissions: admin tudo; corretor vê as suas
create policy "commissions_all_admin" on public.commissions
  for all using (
    public.is_admin()
  );
create policy "commissions_select_own" on public.commissions
  for select using (
    exists (select 1 from public.policies where policies.id = commissions.policy_id and policies.corretor_id = auth.uid())
  );
create policy "commissions_insert_own" on public.commissions
  for insert with check (
    exists (select 1 from public.policies where policies.id = commissions.policy_id and policies.corretor_id = auth.uid())
  );
create policy "commissions_update_own" on public.commissions
  for update using (
    exists (select 1 from public.policies where policies.id = commissions.policy_id and policies.corretor_id = auth.uid())
  );

-- payments: ligado à commission
create policy "payments_all_admin" on public.payments
  for all using (
    public.is_admin()
  );
create policy "payments_select_own" on public.payments
  for select using (
    exists (select 1 from public.commissions
      join public.policies on policies.id = commissions.policy_id
      where commissions.id = payments.commission_id and policies.corretor_id = auth.uid())
  );
create policy "payments_insert_own" on public.payments
  for insert with check (
    exists (select 1 from public.commissions
      join public.policies on policies.id = commissions.policy_id
      where commissions.id = payments.commission_id and policies.corretor_id = auth.uid())
  );

-- documents
create policy "documents_all_admin" on public.documents
  for all using (
    public.is_admin()
  );
create policy "documents_select_own" on public.documents
  for select using (uploaded_by = auth.uid());
create policy "documents_insert_own" on public.documents
  for insert with check (uploaded_by = auth.uid());

-- audit_logs: admin lê tudo; usuário lê os próprios
create policy "audit_logs_select_admin" on public.audit_logs
  for select using (
    public.is_admin()
  );
create policy "audit_logs_select_own" on public.audit_logs
  for select using (user_id = auth.uid());
create policy "audit_logs_insert" on public.audit_logs
  for insert with check (user_id = auth.uid());

-- ============================================================================
-- Trigger de updated_at
-- ============================================================================
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare tbl text;
begin
  for tbl in (
    select tablename from pg_tables where schemaname = 'public'
    and tablename in ('profiles','clients','vehicles','insurers','quotes',
      'policies','renewals','commissions','payments')
  ) loop
    execute format('create trigger trg_%I_updated_at before update on public.%I for each row execute function public.update_updated_at_column()', tbl, tbl);
  end loop;
end $$;

-- ============================================================================
-- Função segura para excluir clientes com integridade (usada pelo frontend)
-- ============================================================================
-- security invoker: respeita o RLS de quem chama (corretor só exclui os seus)
create or replace function public.safe_delete_client(p_client_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if exists (select 1 from public.vehicles v where v.client_id = p_client_id)
     or exists (select 1 from public.policies p where p.client_id = p_client_id) then
    return false;
  end if;
  delete from public.clients c where c.id = p_client_id;
  return found;
end;
$$;

-- Funções internas não devem ser chamadas via API (/rest/v1/rpc)
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.prevent_role_escalation() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Comentários
comment on table public.profiles is 'Perfis de usuários (extende auth.users)';
comment on table public.clients is 'Clientes da corretora';
comment on table public.vehicles is 'Veículos (automóveis e motocicletas)';
comment on table public.insurers is 'Seguradoras parceiras';
comment on table public.quotes is 'Cotações de seguros';
comment on table public.policies is 'Apólices emitidas';
comment on table public.renewals is 'Renovações de apólices';
comment on table public.commissions is 'Comissões dos corretores';
comment on table public.audit_logs is 'Trilha de auditoria';
