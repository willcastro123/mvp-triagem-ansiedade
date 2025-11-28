import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos a chave ADMIN para ter poder de alterar sem confirmação de email antigo
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: Request) {
  try {
    const { userId, newEmail, newPassword, newName } = await req.json();

    console.log(`🔄 Atualizando perfil para ID: ${userId}`);

    // 1. Atualizar a Autenticação (Login)
    // Usamos admin.updateUserById para pular a confirmação do email antigo
    const authUpdateData: any = {
      email_confirm: true, // Confirma o novo email automaticamente
      user_metadata: { full_name: newName }
    };

    if (newEmail) authUpdateData.email = newEmail;
    if (newPassword) authUpdateData.password = newPassword;

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      authUpdateData
    );

    if (authError) {
      return NextResponse.json({ error: 'Erro ao atualizar Login: ' + authError.message }, { status: 400 });
    }

    // 2. Atualizar a tabela user_profiles (Dados visuais)
    const profileUpdateData: any = {};
    if (newEmail) {
        profileUpdateData.email = newEmail;
        profileUpdateData.email_compra_original = newEmail; // Atualiza para ficar igual
    }
    if (newName) profileUpdateData.name = newName;

    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update(profileUpdateData)
      .eq('id', userId);

    if (profileError) {
      return NextResponse.json({ error: 'Erro ao atualizar Tabela Profile: ' + profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Perfil atualizado com sucesso!' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
