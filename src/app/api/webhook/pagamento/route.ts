import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import crypto from 'crypto'; // Usaremos o crypto nativo do Node.js para gerar strings aleatórias

// 1. Configurar Supabase com permissão de ADMIN (Service Role)
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

// 2. Configurar o envio de e-mail
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
  try {
    const body = await req.json();
    
    console.log('Webhook Keoto Recebido:', body);

    // --- LÓGICA DE EXTRAÇÃO DE DADOS (KEOTO) ---
    // Ajuste conforme o payload real da Keoto se necessário. 
    // Geralmente vem em body.status e body.customer.email
    const status = body.status || body.payment_status; 
    
    // O Email REAL (onde o cliente recebe notificação e comprou)
    const realEmail = body.email || body.customer?.email || body.payer_email;
    const nome = body.name || body.customer?.name || 'Cliente';

    if (!realEmail) {
        return NextResponse.json({ message: 'Email do cliente não encontrado no webhook' }, { status: 400 });
    }

    // Só processa se estiver pago
    if (status !== 'paid' && status !== 'approved' && status !== 'completed') {
      return NextResponse.json({ message: 'Pedido não aprovado ainda.' });
    }

    // 3. Gerar credenciais temporárias (Login e Senha)
    const randomId = crypto.randomBytes(4).toString('hex');
    const tempEmail = `acesso_${randomId}@portal.interno`; // Email Falso/Interno para login inicial
    const tempPassword = crypto.randomBytes(6).toString('hex'); // Senha aleatória

    // 4. Criar o usuário no Supabase Auth (Com o Email TEMPORÁRIO)
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true, // Já cria confirmado
      user_metadata: { full_name: nome }
    });

    if (createError) {
      console.error('Erro ao criar usuário Auth:', createError);
      return NextResponse.json({ error: 'Erro ao criar usuário: ' + createError.message }, { status: 400 });
    }

    if (!authData.user) {
        return NextResponse.json({ error: 'Usuário não retornado pelo Supabase' }, { status: 500 });
    }

    // 5. CRUCIAL: Salvar o vínculo na tabela 'profiles'
    // Aqui amarramos o ID do usuário ao Email REAL da compra
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,                // ID gerado no passo anterior
        email_login: tempEmail,              // O email temporário atual
        email_compra_original: realEmail,    // O email da Keoto (que nunca muda)
        full_name: nome
      });

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
      // Nota: Mesmo se der erro aqui, o usuário foi criado no Auth. 
      // Idealmente, você trataria isso, mas vamos prosseguir para enviar o email.
    }

    // 6. Enviar o E-mail para o endereço REAL
    const mailOptions = {
      from: `"Suporte ZentiaMind" <${process.env.SMTP_USER}>`,
      to: realEmail, // Envia para o email verdadeiro do cliente
      subject: 'Acesso Liberado - ZentiaMind',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
          <h2 style="color: #8b5cf6;">Pagamento Confirmado, ${nome}!</h2>
          <p>Sua conta foi criada automaticamente. Como medida de segurança, geramos um acesso provisório para você.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
            <p style="margin: 5px 0;"><strong>📧 Login Provisório:</strong> ${tempEmail}</p>
            <p style="margin: 5px 0;"><strong>🔑 Senha Provisória:</strong> ${tempPassword}</p>
          </div>

          <p><strong>⚠️ Importante:</strong></p>
          <ol>
             <li>Acesse a plataforma com os dados acima.</li>
             <li>Vá até seu Perfil.</li>
             <li>Troque o email para este seu email atual (${realEmail}) ou outro de sua preferência.</li>
          </ol>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://zentiamind.com.br/login" style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Acessar Plataforma Agora
            </a>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Conta criada e enviada com sucesso' });

  } catch (error: any) {
    console.error('Erro no Webhook:', error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
