-- Suporte a "cortesia" (fichas emitidas sem cobrança, fora do relatório
-- de receita). Rode isto no SQL Editor do Supabase.

alter table vendas add column cortesia boolean not null default false;
