import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    // Inicializa cliente Supabase em runtime
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Variáveis de ambiente do Supabase não configuradas'
        },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Buscar todos os usuários da tabela users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')

    if (usersError) {
      throw usersError
    }

    if (!usersData || usersData.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum usuário para migrar',
        migrated: 0
      })
    }

    let migratedCount = 0
    let skippedCount = 0

    // 2. Para cada usuário, verificar se já existe em user_profiles
    for (const user of usersData) {
      if (!user.email) {
        skippedCount++
        continue
      }

      // Verificar se já existe
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', user.email)
        .single()

      if (existingProfile) {
        skippedCount++
        continue
      }

      // Inserir em user_profiles
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          name: user.name || 'Usuário',
          email: user.email,
          phone: user.phone || null,
          age: user.age || null,
          gender: user.gender || null,
          city: user.city || null,
          anxiety_type: user.anxiety_type || null,
          triage_completed: user.triage_completed || false,
          is_premium: user.is_premium || false,
          password: null, // Senha será redefinida pelo usuário
          points: 0,
          created_at: user.created_at || new Date().toISOString(),
          updated_at: user.updated_at || new Date().toISOString()
        })

      if (insertError) {
        console.error(`Erro ao migrar usuário ${user.email}:`, insertError)
        skippedCount++
      } else {
        migratedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migração concluída: ${migratedCount} usuários migrados, ${skippedCount} ignorados`,
      migrated: migratedCount,
      skipped: skippedCount,
      total: usersData.length
    })

  } catch (error) {
    console.error('Erro na migração:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao migrar usuários',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
