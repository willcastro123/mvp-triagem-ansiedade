import { createClient } from '@supabase/supabase-js'

export interface HotmartWebhookData {
  event: string
  data: {
    buyer: {
      email: string
      name: string
      phone?: string
    }
    product: {
      id: string
      name: string
    }
    purchase: {
      status: string
      transaction: string
      order_date: string
      approved_date?: string
    }
  }
}

// Função helper para criar cliente Supabase em runtime
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function processHotmartPurchase(webhookData: HotmartWebhookData) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { buyer, purchase } = webhookData.data

    // Verifica se o pagamento foi aprovado
    if (purchase.status !== 'approved' && purchase.status !== 'complete') {
      return {
        success: false,
        message: 'Pagamento ainda não aprovado'
      }
    }

    // Verifica se o usuário já existe
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', buyer.email)
      .single()

    if (existingUser) {
      // Atualiza para premium se já existe
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          is_premium: true,
          premium_activated_at: new Date().toISOString(),
          hotmart_transaction: purchase.transaction
        })
        .eq('email', buyer.email)

      if (updateError) {
        console.error('Erro ao atualizar usuário:', updateError)
        return {
          success: false,
          message: 'Erro ao atualizar conta'
        }
      }

      return {
        success: true,
        message: 'Acesso premium ativado para usuário existente',
        userId: existingUser.id
      }
    }

    // Cria novo usuário com acesso premium
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        email: buyer.email,
        name: buyer.name,
        phone: buyer.phone || null,
        is_premium: true,
        premium_activated_at: new Date().toISOString(),
        hotmart_transaction: purchase.transaction,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar usuário:', createError)
      return {
        success: false,
        message: 'Erro ao criar conta'
      }
    }

    // Aqui você pode adicionar lógica para enviar email de boas-vindas
    // await sendWelcomeEmail(buyer.email, buyer.name)

    return {
      success: true,
      message: 'Conta criada e acesso premium ativado',
      userId: newUser.id
    }
  } catch (error) {
    console.error('Erro ao processar compra:', error)
    return {
      success: false,
      message: 'Erro interno ao processar compra'
    }
  }
}

export function validateHotmartWebhook(headers: Headers, body: string): boolean {
  // Aqui você pode adicionar validação de assinatura da Hotmart
  // Por enquanto, retorna true (em produção, implemente a validação)
  return true
}
