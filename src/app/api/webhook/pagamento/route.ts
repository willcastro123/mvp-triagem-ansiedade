import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

// 1. Configurar Supabase com permissão de ADMIN (Service Role)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // <--- Importante: Use a chave Service Role aqui
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// 2. Configurar o envio de e-mail (usando seus dados SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // ex: smtp.titan.email
  port: Number(process.env.SMTP_PORT), // ex: 465
  secure: true, // true para 465, false para outras
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    console.log('Webhook recebido:', body); // Para você ver no Log da Vercel o que chegou

    // ADAPTE AQUI: Veja na documentação da Keoto como eles mandam o status e o email
    // Geralmente é algo assim:
    const status = body.status || body.payment_status; 
    const email = body.email || body.customer?.email;
    const nome = body.name || body.customer?.name || 'Cliente';

    // Só processa se estiver pago
    if (status !== 'paid' && status !== 'approved' && status !== 'completed') {
      return NextResponse.json({ message: 'Pedido não aprovado ainda.' });
    }

    // 3. Gerar uma senha provisória aleatória
    const tempPassword = uuidv4().slice(0, 8); // Pega os 8 primeiros caracteres

    // 4. Criar o usuário no Supabase
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true, // Já cria confirmado, pois ele pagou
      user_metadata: { full_name: nome }
    });

    if (createError) {
      console.error('Erro ao criar usuário:', createError);
      // Se o usuário já existe, talvez você queira apenas enviar um email de recuperação
      return NextResponse.json({ error: 'Erro ao criar usuário ou usuário já existe' }, { status: 400 });
    }

    // 5. Enviar o E-mail com a senha
    const mailOptions = {
      from: `"Suporte ZentiaMind" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Acesso Liberado - ZentiaMind',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Olá, ${nome}!</h2>
          <p>Seu pagamento foi confirmado e sua conta foi criada com sucesso.</p>
          <p>Aqui estão seus dados de acesso:</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
            <p><strong>E-mail:</strong> ${email}</p>
            <p><strong>Senha Provisória:</strong> ${tempPassword}</p>
          </div>
          <p>Recomendamos que você troque sua senha após o primeiro login.</p>
          <a href="https://zentiamind.com.br/login" style="background: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acessar Plataforma</a>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Usuário criado e e-mail enviado!' });

  } catch (error) {
    console.error('Erro no Webhook:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
