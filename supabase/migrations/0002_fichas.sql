-- Adiciona a tabela de fichas (vale de retirada por unidade comprada).
-- Rode isto no SQL Editor do Supabase — o schema.sql base já foi aplicado antes.

create table fichas (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid not null references vendas (id) on delete cascade,
  produto_id uuid not null references produtos (id),
  cliente_id uuid not null references clientes (id) on delete cascade,
  nome_produto text not null,
  codigo text not null unique,
  status text not null check (status in ('emitida', 'resgatada', 'cancelada')),
  emitida_em timestamptz not null default now(),
  resgatada_em timestamptz,
  resgatada_por text
);
create index fichas_venda_id_idx on fichas (venda_id);
create index fichas_cliente_id_idx on fichas (cliente_id);

alter table fichas enable row level security;
