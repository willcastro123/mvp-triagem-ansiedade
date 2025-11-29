import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// 1. Configuração e Verificação das Variáveis
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
  secure: true, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
  },
});

export async function POST(req: Request) {
  console.log('\n--- 🔒 INICIANDO WEBHOOK SEGURO (KEOTO) ---');

  // ============================================================
  // 🛡️ BLOCO DE SEGURANÇA (NOVO)
  // ============================================================
  const { searchParams } = new URL(req.url);
  const secretRecebido = searchParams.get('secret'); 
  const secretCorreto = process.env.KEOTO_WEBHOOK_SECRET;

  // Se a senha não estiver no .env ou não bater com a URL: BLOQUEIA
  if (!secretCorreto || secretRecebido !== secretCorreto) {
    console.error(`⛔ ACESSO NEGADO! Secret inválido ou ausente.`);
    return NextResponse.json({ error: 'Acesso Negado: Token Inválido' }, { status: 401 });
  }
  // ============================================================
  
  try {
    const body = await req.json();
    console.log('📦 Payload Recebido e Autorizado'); 

    // 1. Email
    const realEmail = 
      body.customer?.email || 
      body.email || 
      '';

    // 2. Status
    const rawStatus = 
      body.status || 
      body.event || 
      'UNKNOWN';

    // 3. Nome
    const nome = 
      body.customer?.name || 
      body.name || 
      'Cliente Keoto';

    // 4. Telefone
    const phone = 
      body.customer?.phone_number || 
      body.customer?.phone || 
      '';

    console.log(`🔎 Dados: ${realEmail} | Status: ${rawStatus}`);

    if (!realEmail) {
      return NextResponse.json({ message: 'Email não encontrado.' });
    }

    // Validação de Status
    const successKeywords = ['PAID', 'APPROVED', 'COMPLETED', 'CONFIRMED'];
    const isApproved = successKeywords.some(keyword => 
      String(rawStatus).toUpperCase().includes(keyword)
    );
    
    if (!isApproved) {
      console.log(`⚠️ Status ignorado: "${rawStatus}"`);
      return NextResponse.json({ message: 'Status ignorado' });
    }
    
    console.log(`2️⃣ Compra Aprovada.`);

    // PASSO 3: Gerar credenciais
    const randomId = crypto.randomBytes(4).toString('hex');
    const tempEmail = `acesso_${randomId}@portal.interno`;
    const tempPassword = crypto.randomBytes(6).toString('hex');

    // PASSO 4: Criar Usuário no Auth
    console.log('4️⃣ Criando Auth...');
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: nome, phone: phone }
    });

    if (createError) {
      console.error('❌ ERRO Auth:', createError.message);
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // PASSO 5: Salvar no Banco
    console.log('5️⃣ Atualizando user_profiles...');
    
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles') 
      .insert({
        id: authData.user?.id,
        name: nome,
        email: tempEmail, 
        email_compra_original: realEmail,
        created_at: new Date()
      });

    if (profileError) {
      console.error('⚠️ ERRO Profile (Não crítico):', profileError.message);
    } else {
      console.log('✅ Profile salvo.');
    }

    // PASSO 6: Enviar Email
    console.log('6️⃣ Enviando email...');
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: realEmail,
        subject: 'Acesso Liberado - ZentiaMind',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
            <h2 style="color: #8b5cf6;">Pagamento Confirmado!</h2>
            <p>Olá, ${nome}. Sua conta foi criada com sucesso.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
              <p style="margin: 5px 0;"><strong>📧 Login Provisório:</strong> ${tempEmail}</p>
              <p style="margin: 5px 0;"><strong>🔑 Senha Provisória:</strong> ${tempPassword}</p>
            </div>

            <p><strong>Importante:</strong> Este é um acesso gerado automaticamente. Ao entrar, recomendamos que vá em "Perfil" e altere seu e-mail para o seu e-mail pessoal.</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://zentiamind.com.br/login" style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Acessar Agora</a>
            </div>
          </div>
        `,
      });
      console.log('✅ Email enviado.');
    } catch (emailError: any) {
      console.error('❌ ERRO SMTP:', emailError.message);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('❌ ERRO GERAL:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
