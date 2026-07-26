import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error('Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SECRET_KEY no .env.local.');
}

/**
 * Cliente server-only (chave secreta, ignora RLS). Nunca importar isso em
 * código que roda no navegador — não há checagem de sessão/autorização aqui,
 * a confiança é no fato de que só código de servidor tem acesso a esse módulo.
 */
export const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { persistSession: false },
});
