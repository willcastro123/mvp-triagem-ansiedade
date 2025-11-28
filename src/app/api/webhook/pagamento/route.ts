import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// 1. Configuração e Verificação das Variáveis
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log inicial para garantir que as chaves existem
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERRO CRÍTICO: Variáveis de ambiente do Supabase faltando!');
}

const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // true para porta 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
  },
});

export async function POST(req: Request) {
  console.log('\n--- 🚀 INICIANDO DEBUG DO WEBHOOK ---');
  
  try {
// PASSO 1: Recebimento dos dados
    const body = await req.json();
    console.log('1️⃣ JSON Recebido:', JSON.stringify(body, null, 2));

    // --- MUDANÇA PARA HOTMART ---
    const purchaseStatus = body.status; 
    const realEmail = body.email || body.buyer?.email || body.data?.buyer?.email;
    const nome = body.name || body.buyer_name || 'Cliente';
    // ----------------------------

    // PASSO 2: Validações básicas (Usando a lógica da Hotmart)
    if (!realEmail) {
      console.log('❌ FALHA NO PASSO 2: Email do comprador não encontrado no JSON.');
      return NextResponse.json({ error: 'Sem email do comprador' }, { status: 400 });
    }

    // Hotmart usa APROVADA, COMPLETA ou um status similar
    const successStatuses = ['APPROVED', 'COMPLETED', 'APROVADA', 'COMPLETA'];
    
    if (!purchaseStatus || !successStatuses.includes(purchaseStatus.toUpperCase())) {
      console.log(`❌ FALHA NO PASSO 2: Status inválido. Recebido: ${purchaseStatus}`);
      return NextResponse.json({ message: 'Pagamento não aprovado (Ignorado)' });
    }
    console.log(`2️⃣ Validação OK. Email: ${realEmail} | Status: ${purchaseStatus}`);

    // PASSO 3: Gerar credenciais
    const randomId = crypto.randomBytes(4).toString('hex');
    const tempEmail = `acesso_${randomId}@portal.interno`;
    const tempPassword = crypto.randomBytes(6).toString('hex');
    console.log(`3️⃣ Credenciais Geradas: ${tempEmail}`);

    // PASSO 4: Criar Usuário no Supabase (Auth)
    console.log('4️⃣ Tentando criar usuário no Supabase Auth...');
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: nome }
    });

    if (createError) {
      console.error('❌ ERRO CRÍTICO NO PASSO 4 (Supabase Auth):', createError.message);
      return NextResponse.json({ error: 'Erro Auth: ' + createError.message }, { status: 400 });
    }
    console.log('✅ Usuário Auth criado com ID:', authData.user?.id);

   // ... após o PASSO 4 (Criação de Usuário) ...

// PASSO 5: Salvar no Banco de Dados (Tabela user_profiles)
console.log('5️⃣ Tentando salvar vínculo na tabela user_profiles...');

// Inserimos o email temporário na coluna 'email' (que é o campo de login)
// E o email original na nova coluna 'email_compra_original'.
const { error: profileError } = await supabaseAdmin
  .from('user_profiles')
  .insert({
    id: authData.user?.id,
    name: nome,
    email: tempEmail, // O email temporário é usado como campo de login 'email'
    email_compra_original: realEmail, // ✅ CAMPO PERMANENTE SOLICITADO
    // Note que não precisamos do campo 'password' aqui, pois ele é gerenciado pela Auth.
  })
  .select('*')
  .maybeSingle();

if (profileError) {
  console.error('⚠️ ERRO NO PASSO 5 (Tabela Profile - VERIFIQUE AS COLUNAS!):', profileError.message);
} else {
  console.log('✅ Tabela user_profiles atualizada com sucesso. Vínculo permanente criado.');
}

// ... (O código continua com o Passo 6: Enviar Email) ...

    // PASSO 6: Enviar Email via SMTP
    console.log('6️⃣ Tentando conectar ao SMTP para enviar email...');
    try {
      // Tenta enviar
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: realEmail, // Envia para o email real
        subject: 'Teste de Acesso - Debug',
        html: `
          <h1>Acesso Liberado</h1>
          <p>Seu pagamento foi aprovado.</p>
          <p><strong>Login:</strong> ${tempEmail}</p>
          <p><strong>Senha:</strong> ${tempPassword}</p>
          <p>Acesse o perfil e troque seu email.</p>
        `
      });
      console.log('✅ SUCESSO! Email enviado para:', realEmail);
    } catch (emailError: any) {
      console.error('❌ ERRO NO PASSO 6 (SMTP):', emailError.message);
      return NextResponse.json({ error: 'Erro SMTP: ' + emailError.message }, { status: 500 });
    }

    console.log('--- 🏁 FIM DO PROCESSO COM SUCESSO ---\n');
    return NextResponse.json({ success: true, message: 'Processo concluído!' });

  } catch (error: any) {
    console.error('❌ ERRO GERAL NÃO TRATADO:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


