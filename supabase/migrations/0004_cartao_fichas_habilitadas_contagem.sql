-- Adiciona forma de pagamento "cartão", autorização de fichas por evento,
-- e contagem física de estoque no fechamento de caixa.
-- Rode isto no SQL Editor do Supabase.

alter table vendas drop constraint if exists vendas_forma_pagamento_check;
alter table vendas add constraint vendas_forma_pagamento_check
  check (forma_pagamento in ('pix', 'dinheiro', 'cartao'));

alter table eventos add column fichas_habilitadas boolean not null default false;

create table contagens_estoque (
  id uuid primary key default gen_random_uuid(),
  caixa_id uuid not null references caixas (id) on delete cascade,
  produto_id uuid not null references produtos (id),
  categoria text not null,
  quantidade_esperada integer not null,
  quantidade_contada integer not null,
  diferenca integer not null,
  criado_em timestamptz not null default now()
);
create index contagens_estoque_caixa_id_idx on contagens_estoque (caixa_id);

alter table contagens_estoque enable row level security;
