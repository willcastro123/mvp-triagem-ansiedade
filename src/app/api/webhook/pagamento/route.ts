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
  console.log('\n--- 🚀 INICIANDO WEBHOOK (HOTMART) ---');
  
  try {
    // PASSO 1: Recebimento dos dados
    const body = await req.json();
    console.log('1️⃣ JSON Recebido:', JSON.stringify(body, null, 2));

    // Extração de dados da Hotmart
    const purchaseStatus = body.status; 
    const realEmail = body.email || body.buyer?.email || body.data?.buyer?.email;
    const nome = body.name || body.buyer_name || 'Cliente';

    // PASSO 2: Validações básicas
    if (!realEmail) {
      console.log('❌ FALHA NO PASSO 2: Email do comprador não encontrado.');
      return NextResponse.json({ error: 'Sem email do comprador' }, { status: 400 });
    }

    // Hotmart usa APROVADA, COMPLETA, etc.
    const successStatuses = ['APPROVED', 'COMPLETED', 'APROVADA', 'COMPLETA'];
    
    if (!purchaseStatus || !successStatuses.includes(purchaseStatus.toUpperCase())) {
      console.log(`❌ FALHA NO PASSO 2: Status inválido (${purchaseStatus})`);
      return NextResponse.json({ message: 'Pagamento não aprovado (Ignorado)' });
    }
    console.log(`2️⃣ Validação OK. Email: ${realEmail} | Status: ${purchaseStatus}`);

    // PASSO 3: Gerar credenciais temporárias
    const randomId = crypto.randomBytes(4).toString('hex');
    const tempEmail = `acesso_${randomId}@portal.interno`;
    const tempPassword = crypto.randomBytes(6).toString('hex');
    console.log(`3️⃣ Credenciais Geradas: ${tempEmail}`);

    // PASSO 4: Criar Usuário no Supabase Auth (Login)
    console.log('4️⃣ Criando usuário no Auth...');
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: nome }
    });

    if (createError) {
      console.error('❌ ERRO NO PASSO 4 (Auth):', createError.message);
      return NextResponse.json({ error: 'Erro Auth: ' + createError.message }, { status: 400 });
    }
    console.log('✅ Usuário Auth criado ID:', authData.user?.id);

    // PASSO 5: Salvar no Banco de Dados (user_profiles)
    console.log('5️⃣ Salvando vínculo em user_profiles...');
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user?.id,
        name: nome,
        email: tempEmail, // Email de login
        email_compra_original: realEmail, // Email original da Hotmart
      });

    if (profileError) {
      console.error('⚠️ ERRO NO PASSO 5 (Tabela Profile):', profileError.message);
    } else {
      console.log('✅ Tabela user_profiles atualizada com sucesso.');
    }

    // PASSO 6: Enviar Email via SMTP
    console.log('6️⃣ Enviando email...');
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: realEmail, // Envia para o email real do cliente
        subject: 'Acesso Liberado - ZentiaMind',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
            <h2 style="color: #8b5cf6;">Pagamento Confirmado!</h2>
            <p>Olá, ${nome}. Sua conta foi criada com sucesso.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
              <p style="margin: 5px 0;"><strong>📧 Login:</strong> ${tempEmail}</p>
              <p style="margin: 5px 0;"><strong>🔑 Senha:</strong> ${tempPassword}</p>
            </div>

            <p>Acesse a plataforma e troque seu e-mail no perfil.</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://zentiamind.com.br/login" style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Acessar Agora</a>
            </div>
          </div>
        `,
      });
      console.log('✅ Email enviado para:', realEmail);
    } catch (emailError: any) {
      console.error('❌ ERRO NO PASSO 6 (SMTP):', emailError.message);
      // Não retornamos erro 500 aqui para não fazer a Hotmart reenviar o webhook, já que o usuário foi criado.
    }

    console.log('--- 🏁 FIM DO PROCESSO ---\n');
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('❌ ERRO GERAL:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
