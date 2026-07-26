'use server';

import { revalidatePath } from 'next/cache';
import { createEspaco } from '@/lib/data/espacos';

export async function createEspacoAction(formData: FormData): Promise<void> {
  const nome = String(formData.get('nome') ?? '').trim();
  if (!nome) {
    throw new Error('Informe o nome do espaço.');
  }
  await createEspaco(nome);
  revalidatePath('/espacos');
  revalidatePath('/clientes');
}
