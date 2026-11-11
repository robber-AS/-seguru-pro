-- ============================================================================
-- 003 - Dados da corretora (configurações globais)
-- ============================================================================
create table public.company_settings (
  id uuid default gen_random_uuid() primary key,
  company_name text,
  cnpj text unique,
  phone text,
  email text,
  address text,
  city text,
  state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: apenas admin lê e escreve os dados da corretora
alter table public.company_settings enable row level security;

create policy "company_settings_all_admin" on public.company_settings
  for all using (
    public.is_admin()
  );

-- Trigger de updated_at
create trigger trg_company_settings_updated_at
  before update on public.company_settings
  for each row execute function public.update_updated_at_column();

comment on table public.company_settings is 'Dados cadastrais da corretora de seguros';
