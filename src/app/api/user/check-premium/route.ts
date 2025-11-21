import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Inicializa cliente Supabase em runtime
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Configuração do Supabase ausente' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Busca o usuário no banco
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return NextResponse.json({
        isPremium: false,
        message: 'Usuário não encontrado'
      })
    }

    return NextResponse.json({
      isPremium: user.is_premium,
      user: {
        name: user.name,
        email: user.email,
        anxietyType: user.anxiety_type,
        premiumActivatedAt: user.premium_activated_at
      }
    })

  } catch (error) {
    console.error('Erro ao verificar premium:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status premium' },
      { status: 500 }
    )
  }
}
