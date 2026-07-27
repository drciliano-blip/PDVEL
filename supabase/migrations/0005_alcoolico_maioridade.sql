-- Marcação de produto alcoólico e confirmação de maioridade em vendas
-- self-service (sem operador presente pra conferir documento).
-- Rode isto no SQL Editor do Supabase.

alter table produtos add column alcoolico boolean not null default false;
alter table vendas add column confirmacao_maioridade_em timestamptz;
alter table fichas add column produto_alcoolico boolean not null default false;
