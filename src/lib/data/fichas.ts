import { supabase } from '@/lib/supabase/client';
import type { Ficha, StatusFicha } from './types';

interface ItemVendaBasico {
  produtoId: string;
  nome: string;
  quantidade: number;
  alcoolico: boolean;
}

interface FichaRow {
  id: string;
  venda_id: string;
  produto_id: string;
  cliente_id: string;
  nome_produto: string;
  codigo: string;
  status: StatusFicha;
  produto_alcoolico: boolean;
  emitida_em: string;
  resgatada_em: string | null;
  resgatada_por: string | null;
}

function rowToFicha(row: FichaRow): Ficha {
  return {
    id: row.id,
    vendaId: row.venda_id,
    produtoId: row.produto_id,
    clienteId: row.cliente_id,
    nomeProduto: row.nome_produto,
    codigo: row.codigo,
    status: row.status,
    produtoAlcoolico: row.produto_alcoolico,
    emitidaEm: row.emitida_em,
    resgatadaEm: row.resgatada_em,
    resgatadaPor: row.resgatada_por,
  };
}

// Sem 0/O, 1/I/L — evita confusão na hora de digitar o código no balcão.
const ALFABETO_CODIGO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function gerarCodigo(): string {
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)];
  }
  return codigo;
}

export async function gerarFichasParaVenda(vendaId: string, clienteId: string): Promise<Ficha[]> {
  const { data: itensData, error: itensError } = await supabase
    .from('venda_itens')
    .select('produto_id, nome, quantidade, produtos(alcoolico)')
    .eq('venda_id', vendaId);
  if (itensError) throw itensError;
  const itens = (
    itensData as {
      produto_id: string;
      nome: string;
      quantidade: number;
      produtos: { alcoolico: boolean } | { alcoolico: boolean }[] | null;
    }[]
  ).map((row): ItemVendaBasico => {
    const produto = Array.isArray(row.produtos) ? row.produtos[0] : row.produtos;
    return {
      produtoId: row.produto_id,
      nome: row.nome,
      quantidade: row.quantidade,
      alcoolico: produto?.alcoolico ?? false,
    };
  });

  const fichas: Ficha[] = [];

  for (const item of itens) {
    for (let unidade = 0; unidade < item.quantidade; unidade++) {
      let inserida: Ficha | null = null;
      for (let tentativa = 0; tentativa < 5 && !inserida; tentativa++) {
        const { data, error } = await supabase
          .from('fichas')
          .insert({
            venda_id: vendaId,
            produto_id: item.produtoId,
            cliente_id: clienteId,
            nome_produto: item.nome,
            codigo: gerarCodigo(),
            status: 'emitida',
            produto_alcoolico: item.alcoolico,
          })
          .select('*')
          .single();
        if (!error) {
          inserida = rowToFicha(data as FichaRow);
        } else if (error.code !== '23505') {
          // 23505 = colisão de código único; qualquer outro erro não deve ser engolido.
          throw error;
        }
      }
      if (!inserida) throw new Error('Não foi possível gerar um código de ficha único.');
      fichas.push(inserida);
    }
  }

  return fichas;
}

export async function listFichasPorVenda(vendaId: string): Promise<Ficha[]> {
  const { data, error } = await supabase
    .from('fichas')
    .select('*')
    .eq('venda_id', vendaId)
    .order('emitida_em');
  if (error) throw error;
  return (data as FichaRow[]).map(rowToFicha);
}

export async function buscarFichaPorCodigo(
  clienteId: string,
  codigo: string
): Promise<Ficha | undefined> {
  const { data, error } = await supabase
    .from('fichas')
    .select('*')
    .eq('cliente_id', clienteId)
    .eq('codigo', codigo.trim().toUpperCase())
    .maybeSingle();
  if (error) throw error;
  return data ? rowToFicha(data as FichaRow) : undefined;
}

export async function resgatarFicha(fichaId: string, resgatadoPor: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('fichas')
    .update({
      status: 'resgatada',
      resgatada_em: new Date().toISOString(),
      resgatada_por: resgatadoPor,
    })
    .eq('id', fichaId)
    .eq('status', 'emitida')
    .select('id');
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function cancelarFichasDaVenda(vendaId: string): Promise<void> {
  const { error } = await supabase
    .from('fichas')
    .update({ status: 'cancelada' })
    .eq('venda_id', vendaId)
    .eq('status', 'emitida');
  if (error) throw error;
}
