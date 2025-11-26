import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Iniciando solicitação de redefinição de senha...')
    
    const { email } = await request.json()
    console.log('📧 E-mail recebido:', email)

    if (!email) {
      console.log('❌ E-mail não fornecido')
      return NextResponse.json(
        { error: 'E-mail é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    console.log('✅ Cliente Supabase obtido')

    // Verificar se o usuário existe
    console.log('🔍 Buscando usuário no banco...')
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .single()

    if (userError) {
      console.log('⚠️ Erro ao buscar usuário:', userError)
    }

    if (userError || !users) {
      console.log('⚠️ Usuário não encontrado, mas retornando mensagem genérica por segurança')
      // Por segurança, não revelamos se o e-mail existe ou não
      return NextResponse.json({
        message: 'Se o e-mail existir, você receberá instruções para redefinir sua senha.'
      })
    }

    console.log('✅ Usuário encontrado:', users.id)

    // Gerar token único
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Token válido por 1 hora

    console.log('🔑 Token gerado:', token.substring(0, 10) + '...')

    // Salvar token no banco
    console.log('💾 Salvando token no banco...')
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: users.id,
        token,
        expires_at: expiresAt.toISOString()
      })

    if (tokenError) {
      console.error('❌ Erro ao criar token:', tokenError)
      return NextResponse.json(
        { error: 'Erro ao processar solicitação' },
        { status: 500 }
      )
    }

    console.log('✅ Token salvo no banco')

    // Construir link de redefinição
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`
    console.log('🔗 Link de redefinição:', resetLink)

    // Enviar e-mail via SMTP Titan
    console.log('📨 Tentando enviar e-mail via SMTP Titan...')
    try {
      await sendPasswordResetEmail(email, users.name, resetLink)
      console.log('✅ E-mail de redefinição enviado com sucesso para:', email)
    } catch (emailError) {
      console.error('❌ Erro ao enviar e-mail:', emailError)
      // Em caso de erro no envio do e-mail, ainda retornamos sucesso por segurança
      // mas logamos o erro para investigação
    }

    console.log('🎉 Processo concluído com sucesso')

    return NextResponse.json({
      message: 'Se o e-mail existir, você receberá instruções para redefinir sua senha.',
      // Em desenvolvimento, retornamos o link
      ...(process.env.NODE_ENV === 'development' && { resetLink })
    })

  } catch (error) {
    console.error('💥 Erro geral ao solicitar redefinição de senha:', error)
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}
