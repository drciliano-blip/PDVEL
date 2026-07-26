'use server';

import { revalidatePath } from 'next/cache';
import { createCliente, getCliente, salvarSubcontaAsaas } from '@/lib/data/clientes';
import { createEvento } from '@/lib/data/eventos';
import { criarSubconta, type DadosSubconta } from '@/lib/asaas';

export async function createClienteAction(formData: FormData): Promise<void> {
  const nome = String(formData.get('nome') ?? '').trim();
  const comissaoPercentual = Number(formData.get('comissaoPercentual'));

  if (!nome || !Number.isFinite(comissaoPercentual) || comissaoPercentual < 0) {
    throw new Error('Preencha nome e uma comissão válida.');
  }

  await createCliente({ nome, comissaoPercentual });
  revalidatePath('/clientes');
}

export async function createEventoAction(formData: FormData): Promise<void> {
  const clienteId = String(formData.get('clienteId') ?? '');
  const nome = String(formData.get('nome') ?? '').trim();
  const data = String(formData.get('data') ?? '');

  if (!clienteId || !nome || !data) {
    throw new Error('Preencha nome e data do evento.');
  }

  await createEvento({ clienteId, nome, data });
  revalidatePath('/clientes');
}

export async function criarSubcontaAsaasAction(clienteId: string, formData: FormData): Promise<void> {
  const cliente = await getCliente(clienteId);
  if (!cliente) throw new Error('Cliente não encontrado.');

  const tipoPessoa = (String(formData.get('tipoPessoa') ?? 'juridica') as DadosSubconta['tipoPessoa']) || 'juridica';
  const email = String(formData.get('email') ?? '').trim();
  const cpfCnpj = String(formData.get('cpfCnpj') ?? '').replace(/\D/g, '');
  const mobilePhone = String(formData.get('mobilePhone') ?? '').replace(/\D/g, '');
  const incomeValue = Number(formData.get('incomeValue'));
  const address = String(formData.get('address') ?? '').trim();
  const addressNumber = String(formData.get('addressNumber') ?? '').trim();
  const province = String(formData.get('province') ?? '').trim();
  const postalCode = String(formData.get('postalCode') ?? '').replace(/\D/g, '');
  const birthDate = String(formData.get('birthDate') ?? '').trim();
  const companyType = String(formData.get('companyType') ?? '') as DadosSubconta['companyType'];

  if (
    !email ||
    !cpfCnpj ||
    !mobilePhone ||
    !Number.isFinite(incomeValue) ||
    !address ||
    !addressNumber ||
    !province ||
    !postalCode ||
    (tipoPessoa === 'fisica' && !birthDate) ||
    (tipoPessoa === 'juridica' && !companyType)
  ) {
    throw new Error('Preencha todos os campos obrigatórios do cadastro Asaas.');
  }

  const subconta = await criarSubconta({
    name: cliente.nome,
    email,
    cpfCnpj,
    mobilePhone,
    incomeValue,
    address,
    addressNumber,
    province,
    postalCode,
    tipoPessoa,
    birthDate: tipoPessoa === 'fisica' ? birthDate : undefined,
    companyType: tipoPessoa === 'juridica' ? companyType : undefined,
  });

  await salvarSubcontaAsaas(clienteId, {
    asaasSubcontaId: subconta.id,
    asaasWalletId: subconta.walletId,
    asaasStatusOnboarding: 'em_analise',
  });

  revalidatePath('/clientes');
}
