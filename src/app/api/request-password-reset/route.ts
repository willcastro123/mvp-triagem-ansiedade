import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { sendPasswordResetEmail } from '@/lib/sendpulse'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'E-mail é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // Verificar se o usuário existe
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .single()

    if (userError || !users) {
      // Por segurança, não revelamos se o e-mail existe ou não
      return NextResponse.json({
        message: 'Se o e-mail existir, você receberá instruções para redefinir sua senha.'
      })
    }

    // Gerar token único
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Token válido por 1 hora

    // Salvar token no banco
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: users.id,
        token,
        expires_at: expiresAt.toISOString()
      })

    if (tokenError) {
      console.error('Erro ao criar token:', tokenError)
      return NextResponse.json(
        { error: 'Erro ao processar solicitação' },
        { status: 500 }
      )
    }

    // Construir link de redefinição
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`

    // Enviar e-mail via SendPulse
    try {
      await sendPasswordResetEmail(email, users.name, resetLink)
      console.log('✅ E-mail de redefinição enviado com sucesso para:', email)
    } catch (emailError) {
      console.error('❌ Erro ao enviar e-mail:', emailError)
      // Em caso de erro no envio do e-mail, ainda retornamos sucesso por segurança
      // mas logamos o erro para investigação
    }

    return NextResponse.json({
      message: 'Se o e-mail existir, você receberá instruções para redefinir sua senha.',
      // Em desenvolvimento, retornamos o link
      ...(process.env.NODE_ENV === 'development' && { resetLink })
    })

  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error)
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}
