-- Adiciona espaços físicos (do próprio operador) e vincula eventos a um espaço.
-- Rode isto no SQL Editor do Supabase.

create table espacos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  criado_em timestamptz not null default now()
);

alter table eventos add column espaco_id uuid references espacos (id);

alter table espacos enable row level security;
