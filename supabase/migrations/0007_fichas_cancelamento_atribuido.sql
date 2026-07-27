-- Atribuição de quem cancelou uma ficha e por quê (hub Fichas > Cancelar).
-- Rode isto no SQL Editor do Supabase.

alter table fichas add column cancelada_por text;
alter table fichas add column motivo_cancelamento text;
