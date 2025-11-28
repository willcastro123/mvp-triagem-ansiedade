import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // IMPORTANTE: Aqui precisamos da chave SERVICE_ROLE para criar usuários no Auth
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Configuração do Supabase (Service Role) não encontrada' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const body = await request.json();
    // Adicionei access_code e is_premium que vêm do seu painel admin
    const { name, email, password, phone, city, anxiety_type, is_premium, access_code } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // --- PASSO 1: Criar usuário no Sistema de Autenticação (Login) ---
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Já cria confirmado para poder logar direto
      user_metadata: { name: name }
    });

    if (authError) {
      console.error('Erro no Auth:', authError);
      return NextResponse.json({ error: 'Erro ao criar login: ' + authError.message }, { status: 400 });
    }

    if (!authUser.user) {
      return NextResponse.json({ error: 'Erro inesperado: Usuário não retornado.' }, { status: 500 });
    }

    // --- PASSO 2: Criar o perfil vinculado ao ID do Login ---
    const { data, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert([{
        id: authUser.user.id, // <--- O PULO DO GATO: Vincula ao ID do Auth
        name,
        email,
        phone: phone || '',
        city: city || '',
        anxiety_type: anxiety_type || null,
        triage_completed: false, // Padrão false ao criar pelo admin
        is_premium: is_premium || false,
        access_code: access_code || null,
        email_compra_original: email, // Mantém consistência
        points: 0
        // Não salvamos 'password' aqui por segurança, ela já está no Auth criptografada
      }])
      .select()
      .single();

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
      
      // Se falhar no perfil, deletamos o login para não ficar uma conta "fantasma"
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);

      return NextResponse.json(
        { error: 'Erro ao criar perfil: ' + profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: data
    });

  } catch (error: any) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}
