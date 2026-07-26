import { NextRequest, NextResponse } from 'next/server';
import { confirmarPagamentoPorAsaasPaymentId } from '@/lib/data/vendas';

const EVENTOS_PAGAMENTO_CONFIRMADO = new Set(['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED']);

export async function POST(request: NextRequest) {
  const token = request.headers.get('asaas-access-token');
  if (!token || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const evento = body?.event as string | undefined;
  const paymentId = body?.payment?.id as string | undefined;

  if (evento && EVENTOS_PAGAMENTO_CONFIRMADO.has(evento) && paymentId) {
    await confirmarPagamentoPorAsaasPaymentId(paymentId);
  }

  return NextResponse.json({ recebido: true });
}
