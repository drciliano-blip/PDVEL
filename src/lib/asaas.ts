const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_API_BASE_URL = process.env.ASAAS_API_BASE_URL;

if (!ASAAS_API_KEY || !ASAAS_API_BASE_URL) {
  throw new Error('Faltam ASAAS_API_KEY ou ASAAS_API_BASE_URL no .env.local.');
}

async function asaasFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${ASAAS_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'PDVEventos',
      access_token: ASAAS_API_KEY as string,
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const mensagem =
      body?.errors?.map((e: { description?: string }) => e.description).join('; ') ||
      `Erro ${response.status} na API do Asaas.`;
    throw new Error(mensagem);
  }

  return body as T;
}

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface CustomerData {
  name: string;
  cpfCnpj?: string;
  email?: string;
  mobilePhone?: string;
}

export interface SplitConfig {
  walletId: string;
  percentualValue: number;
}

interface CriarCobrancaPixResponse {
  id: string;
}

export async function criarCobrancaPix(params: {
  valor: number;
  externalReference: string;
  customerData: CustomerData;
  split?: SplitConfig[];
}): Promise<CriarCobrancaPixResponse> {
  return asaasFetch<CriarCobrancaPixResponse>('/lean/payments', {
    method: 'POST',
    body: JSON.stringify({
      billingType: 'PIX',
      value: params.valor,
      dueDate: hoje(),
      externalReference: params.externalReference,
      customerData: params.customerData,
      ...(params.split && params.split.length > 0 ? { split: params.split } : {}),
    }),
  });
}

interface PixQrCodeResponse {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

export async function obterPixQrCode(paymentId: string): Promise<PixQrCodeResponse> {
  return asaasFetch<PixQrCodeResponse>(`/payments/${paymentId}/pixQrCode`);
}

export interface DadosSubconta {
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone: string;
  incomeValue: number;
  address: string;
  addressNumber: string;
  province: string;
  postalCode: string;
  tipoPessoa: 'fisica' | 'juridica';
  birthDate?: string;
  companyType?: 'MEI' | 'LIMITED' | 'INDIVIDUAL' | 'ASSOCIATION';
}

interface CriarSubcontaResponse {
  id: string;
  walletId: string;
}

export async function criarSubconta(dados: DadosSubconta): Promise<CriarSubcontaResponse> {
  return asaasFetch<CriarSubcontaResponse>('/accounts', {
    method: 'POST',
    body: JSON.stringify({
      name: dados.name,
      email: dados.email,
      cpfCnpj: dados.cpfCnpj,
      mobilePhone: dados.mobilePhone,
      incomeValue: dados.incomeValue,
      address: dados.address,
      addressNumber: dados.addressNumber,
      province: dados.province,
      postalCode: dados.postalCode,
      ...(dados.tipoPessoa === 'fisica'
        ? { birthDate: dados.birthDate }
        : { companyType: dados.companyType }),
    }),
  });
}
