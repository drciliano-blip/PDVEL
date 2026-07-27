-- PDV de Eventos — schema inicial
-- Rode este arquivo inteiro no SQL Editor do painel do Supabase (uma vez só).

create extension if not exists pgcrypto;

create table clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  comissao_percentual numeric not null default 0,
  asaas_subconta_id text,
  asaas_wallet_id text,
  asaas_status_onboarding text not null default 'nao_iniciado',
  criado_em timestamptz not null default now()
);

create table espacos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  criado_em timestamptz not null default now()
);

create table eventos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes (id) on delete cascade,
  espaco_id uuid references espacos (id),
  nome text not null,
  data date not null,
  fichas_habilitadas boolean not null default false,
  criado_em timestamptz not null default now()
);
create index eventos_cliente_id_idx on eventos (cliente_id);

create table produtos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes (id) on delete cascade,
  nome text not null,
  categoria text not null,
  preco numeric not null,
  ativo boolean not null default true,
  estoque integer,
  alcoolico boolean not null default false,
  criado_em timestamptz not null default now()
);
create index produtos_cliente_id_idx on produtos (cliente_id);

create table caixas (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references eventos (id) on delete cascade,
  operador text not null,
  status text not null check (status in ('aberto', 'fechado')),
  valor_abertura numeric not null,
  valor_fechamento numeric,
  aberto_em timestamptz not null default now(),
  fechado_em timestamptz
);
create index caixas_evento_id_idx on caixas (evento_id);

create table convidados (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes (id) on delete cascade,
  evento_id uuid not null references eventos (id) on delete cascade,
  nome text,
  cpf text,
  telefone text,
  email text,
  numero_cartao_consumo text,
  consentimento_lgpd_em timestamptz,
  criado_em timestamptz not null default now()
);
create unique index convidados_cliente_cpf_idx on convidados (cliente_id, cpf) where cpf is not null;
create unique index convidados_cliente_cartao_idx on convidados (cliente_id, numero_cartao_consumo) where numero_cartao_consumo is not null;

create table vendas (
  id uuid primary key,
  evento_id uuid not null references eventos (id) on delete cascade,
  caixa_id uuid not null references caixas (id) on delete cascade,
  cliente_id uuid not null references clientes (id) on delete cascade,
  convidado_id uuid references convidados (id) on delete set null,
  total numeric not null,
  forma_pagamento text not null check (forma_pagamento in ('pix', 'dinheiro', 'cartao')),
  status_pagamento text not null check (status_pagamento in ('pendente', 'pago', 'cancelado')),
  asaas_payment_id text,
  pix_payload text,
  pix_qr_code_base64 text,
  criado_em timestamptz not null default now(),
  pago_em timestamptz,
  cancelado_em timestamptz,
  cancelado_por text,
  confirmacao_maioridade_em timestamptz,
  cortesia boolean not null default false
);
create index vendas_caixa_id_idx on vendas (caixa_id);
create index vendas_cliente_id_idx on vendas (cliente_id);
create index vendas_asaas_payment_id_idx on vendas (asaas_payment_id);

create table venda_itens (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid not null references vendas (id) on delete cascade,
  produto_id uuid not null references produtos (id),
  nome text not null,
  preco_unit numeric not null,
  quantidade integer not null,
  subtotal numeric not null
);
create index venda_itens_venda_id_idx on venda_itens (venda_id);

create table fichas (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid not null references vendas (id) on delete cascade,
  produto_id uuid not null references produtos (id),
  cliente_id uuid not null references clientes (id) on delete cascade,
  nome_produto text not null,
  codigo text not null unique,
  status text not null check (status in ('emitida', 'resgatada', 'cancelada')),
  produto_alcoolico boolean not null default false,
  emitida_em timestamptz not null default now(),
  resgatada_em timestamptz,
  resgatada_por text,
  cancelada_por text,
  motivo_cancelamento text
);
create index fichas_venda_id_idx on fichas (venda_id);
create index fichas_cliente_id_idx on fichas (cliente_id);

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

-- RLS habilitado sem políticas: bloqueia qualquer acesso via chave pública (publishable).
-- O app usa a chave secreta (service role) no servidor, que ignora RLS.
alter table clientes enable row level security;
alter table espacos enable row level security;
alter table eventos enable row level security;
alter table produtos enable row level security;
alter table caixas enable row level security;
alter table convidados enable row level security;
alter table vendas enable row level security;
alter table venda_itens enable row level security;
alter table fichas enable row level security;
alter table contagens_estoque enable row level security;
