import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { 
  validateHottok, 
  isPurchaseApproved, 
  extractBuyerData,
  generateSecurePassword,
  type HotmartWebhookData 
} from '@/lib/hotmart'

/**
 * Webhook da Hotmart para processar compras
 * POST /api/webhook/hotmart
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validar Hottok de segurança
    const hottok = request.headers.get('x-hotmart-hottok')
    
    if (!validateHottok(hottok)) {
      console.error('❌ Hottok inválido:', hottok)
      return NextResponse.json(
        { error: 'Unauthorized - Invalid Hottok' },
        { status: 401 }
      )
    }

    // 2. Parsear dados do webhook
    const webhookData: HotmartWebhookData = await request.json()
    
    console.log('📩 Webhook recebido:', {
      event: webhookData.event,
      transaction: webhookData.data.purchase.transaction,
      buyer: webhookData.data.buyer.email
    })

    // 3. Verificar se é compra aprovada
    if (!isPurchaseApproved(webhookData)) {
      console.log('ℹ️ Evento ignorado (não é compra aprovada):', webhookData.event)
      return NextResponse.json({ 
        message: 'Event received but not processed',
        event: webhookData.event 
      })
    }

    // 4. Extrair dados do comprador
    const buyerData = extractBuyerData(webhookData)
    
    console.log('👤 Dados do comprador:', {
      email: buyerData.email,
      name: buyerData.name,
      transaction: buyerData.transaction
    })

    // 5. Conectar ao Supabase Admin
    const supabase = getSupabaseAdmin()

    // 6. Verificar se usuário já existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, is_premium')
      .eq('email', buyerData.email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar usuário:', checkError)
      throw checkError
    }

    // 7. Criar ou atualizar usuário
    if (existingUser) {
      // Atualizar usuário existente para premium
      const { error: updateError } = await supabase
        .from('users')
        .update({
          is_premium: true,
          premium_since: new Date().toISOString(),
          hotmart_transaction: buyerData.transaction,
          hotmart_subscription_code: buyerData.subscriptionCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)

      if (updateError) {
        console.error('❌ Erro ao atualizar usuário:', updateError)
        throw updateError
      }

      console.log('✅ Usuário atualizado para premium:', existingUser.email)
    } else {
      // Criar novo usuário premium
      const tempPassword = generateSecurePassword()
      
      // Criar usuário no Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: buyerData.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          name: buyerData.name,
          phone: buyerData.phone
        }
      })

      if (authError) {
        console.error('❌ Erro ao criar usuário no Auth:', authError)
        throw authError
      }

      // Criar registro na tabela users
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id,
          email: buyerData.email,
          name: buyerData.name,
          phone: buyerData.phone,
          is_premium: true,
          premium_since: new Date().toISOString(),
          hotmart_transaction: buyerData.transaction,
          hotmart_subscription_code: buyerData.subscriptionCode,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('❌ Erro ao inserir usuário na tabela:', insertError)
        throw insertError
      }

      console.log('✅ Novo usuário premium criado:', buyerData.email)
      
      // TODO: Enviar email com credenciais de acesso
      console.log('📧 Email de boas-vindas deve ser enviado para:', buyerData.email)
    }

    // 8. Registrar transação
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        email: buyerData.email,
        transaction_id: buyerData.transaction,
        product_id: buyerData.productId,
        product_name: buyerData.productName,
        price: buyerData.price,
        currency: buyerData.currency,
        status: 'approved',
        approved_at: new Date(buyerData.approvedDate).toISOString(),
        subscription_code: buyerData.subscriptionCode,
        webhook_event: webhookData.event,
        created_at: new Date().toISOString()
      })

    if (transactionError) {
      console.error('⚠️ Erro ao registrar transação (não crítico):', transactionError)
    }

    // 9. Retornar sucesso
    return NextResponse.json({
      success: true,
      message: 'Purchase processed successfully',
      email: buyerData.email,
      transaction: buyerData.transaction
    })

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET para verificar se o endpoint está funcionando
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Hotmart webhook endpoint is ready',
    timestamp: new Date().toISOString()
  })
}
