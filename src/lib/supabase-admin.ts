import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase Admin para operações de servidor
 * Usa a Service Role Key para bypass de RLS
 */
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variáveis de ambiente do Supabase Admin não configuradas')
    throw new Error('Supabase Admin não configurado')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
