import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Validação das variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (ou SUPABASE_SERVICE_ROLE_KEY) no Vercel.');
}

// Cliente Supabase com service role (bypassa RLS)
const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, age, gender, city, anxiety_type, password } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Verifica se o email já existe
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('user_profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'E-mail já cadastrado' },
        { status: 409 }
      );
    }

    // Cria o perfil do usuário usando service role (bypassa RLS)
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .insert([{
        name,
        email,
        phone: phone || '',
        age: age || '',
        gender: gender || '',
        city: city || '',
        anxiety_type: anxiety_type || null,
        triage_completed: true,
        is_premium: true,
        password: password || '',
        points: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return NextResponse.json(
        { error: error.message || 'Erro ao criar usuário' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: data
    });
  } catch (error: any) {
    console.error('Erro na API de criação de usuário:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}
