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
  secure: true, // true para porta 465 (ou false para 587 com tls)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
  },
});

export async function POST(req: Request) {
  console.log('\n--- 🚀 INICIANDO WEBHOOK (KEOTO) ---');
  
  try {
    // PASSO 1: Recebimento dos dados
    const body = await req.json();
    console.log('📦 Payload Bruto Keoto:', JSON.stringify(body, null, 2));

    // --- ESTRATÉGIA DE EXTRAÇÃO KEOTO ---
    
    // 1. Tenta achar o EMAIL (Geralmente vem em customer.email)
    const realEmail = 
      body.customer?.email || 
      body.email || 
      body.data?.customer?.email;

    // 2. Tenta achar o STATUS (Geralmente status ou payment_status)
    const rawStatus = 
      body.status || 
      body.payment_status || 
      body.data?.status || 
      'UNKNOWN';

    // 3. Tenta achar o NOME
    const nome = 
      body.customer?.name || 
      body.customer?.full_name || 
      body.name || 
      'Cliente Keoto';

    const phone = 
      body.customer?.phone || 
      body.customer?.mobile || 
      '';

    console.log(`🔎 Dados Extraídos -> Email: ${realEmail} | Status: ${rawStatus} | Nome: ${nome}`);

    // PASSO 2: Validações básicas
    if (!realEmail) {
      console.log('❌ FALHA NO PASSO 2: Email do comprador não encontrado.');
      return NextResponse.json({ message: 'Email não encontrado, ignorado.' });
    }

    // Lista de status aceitos na Keoto
    // A Keoto costuma enviar 'paid', 'approved', 'completed'.
    const successKeywords = ['PAID', 'APPROVED', 'COMPLETED', 'CONFIRMED'];
    
    const isApproved = successKeywords.some(keyword => 
      String(rawStatus).toUpperCase().includes(keyword)
    );
    
    if (!isApproved) {
      console.log(`⚠️ Status não é de aprovação de compra: "${rawStatus}". Ignorando criação de conta.`);
      return NextResponse.json({ message: 'Status ignorado (não é compra aprovada)' });
    }
    
    console.log(`2️⃣ Validação OK. Compra Aprovada para: ${realEmail}`);

    // PASSO 3: Gerar credenciais temporárias (Lógica Mantida)
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
      user_metadata: { full_name: nome, phone: phone }
    });

    if (createError) {
      console.error('❌ ERRO NO PASSO 4 (Auth):', createError.message);
      // Se der erro aqui (ex: email temp duplicado, o que é raro), paramos.
      return NextResponse.json({ error: 'Erro Auth: ' + createError.message }, { status: 400 });
    }
    console.log('✅ Usuário Auth criado ID:', authData.user?.id);

    // PASSO 5: Salvar no Banco de Dados (user_profiles ou profiles)
    console.log('5️⃣ Salvando vínculo em user_profiles...');
    
    // ATENÇÃO: Verifique se o nome da sua tabela é 'user_profiles' ou 'profiles'
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles') // <--- Confirme se esse é o nome da tabela no seu Supabase
      .insert({
        id: authData.user?.id,
        name: nome,
        email: tempEmail, // Email de login (interno)
        email_compra_original: realEmail, // Email real do cliente
        plano: 'premium', // Opcional: marcar qual plano
        created_at: new Date()
      });

    if (profileError) {
      console.error('⚠️ ERRO NO PASSO 5 (Tabela Profile):', profileError.message);
      // Não interrompemos o fluxo, pois o Auth já foi criado, tentamos enviar o email mesmo assim
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
      console.log('✅ Email enviado para:', realEmail);
    } catch (emailError: any) {
      console.error('❌ ERRO NO PASSO 6 (SMTP):', emailError.message);
    }

    console.log('--- 🏁 FIM DO PROCESSO ---\n');
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('❌ ERRO GERAL:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
