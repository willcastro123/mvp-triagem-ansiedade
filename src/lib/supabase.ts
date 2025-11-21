import { createClient } from '@supabase/supabase-js'

// Função para obter cliente Supabase com fallback
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Se as variáveis não estiverem configuradas, retorna um cliente mock
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Variáveis de ambiente do Supabase não configuradas. Usando cliente mock.')
    
    // Cliente mock que não faz nada mas não quebra a aplicação
    return {
      auth: {
        signInWithPassword: async () => ({ data: null, error: new Error('Supabase não configurado') }),
        signUp: async () => ({ data: null, error: new Error('Supabase não configurado') }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: new Error('Supabase não configurado') }),
        update: () => ({ data: null, error: new Error('Supabase não configurado') }),
        delete: () => ({ data: null, error: new Error('Supabase não configurado') }),
        eq: function() { return this },
        single: () => ({ data: null, error: new Error('Supabase não configurado') }),
      }),
    } as any
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Exporta uma instância padrão
export const supabase = getSupabaseClient()
