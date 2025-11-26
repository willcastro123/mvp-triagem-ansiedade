import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, resetLink, userName } = await request.json()

    if (!email || !resetLink) {
      return NextResponse.json(
        { error: 'E-mail e link de redefinição são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar template de e-mail do banco de dados
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('type', 'password_reset')
      .eq('is_active', true)
      .single()

    if (templateError || !template) {
      console.error('Erro ao buscar template de e-mail:', templateError)
      return NextResponse.json(
        { error: 'Template de e-mail não encontrado.' },
        { status: 500 }
      )
    }

    // Buscar configurações SMTP do admin_users (primeiro usuário admin)
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('email')
      .limit(1)
      .single()

    if (adminError || !adminUser) {
      console.error('Erro ao buscar configurações de admin:', adminError)
      return NextResponse.json(
        { error: 'Configurações de e-mail não encontradas. Configure o SMTP no painel administrativo.' },
        { status: 500 }
      )
    }

    // Configurações SMTP padrão (você pode ajustar conforme necessário)
    // Estas configurações devem ser armazenadas de forma segura
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || adminUser.email,
      password: process.env.SMTP_PASSWORD || '',
    }

    if (!smtpConfig.password) {
      return NextResponse.json(
        { error: 'Configurações SMTP incompletas. Configure SMTP_PASSWORD nas variáveis de ambiente.' },
        { status: 500 }
      )
    }

    // Criar transporter do nodemailer
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.password,
      },
    })

    // Verificar conexão SMTP
    try {
      await transporter.verify()
    } catch (verifyError) {
      console.error('Erro ao verificar conexão SMTP:', verifyError)
      return NextResponse.json(
        { error: 'Erro ao conectar com servidor de e-mail. Verifique as configurações SMTP.' },
        { status: 500 }
      )
    }

    // Substituir variáveis no template
    let htmlContent = template.html_content
    htmlContent = htmlContent.replace(/\{\{name\}\}/g, userName || 'Usuário')
    htmlContent = htmlContent.replace(/\{\{resetLink\}\}/g, resetLink)

    // Enviar e-mail
    const mailOptions = {
      from: `"ZentiaMind" <${smtpConfig.user}>`,
      to: email,
      subject: template.subject,
      html: htmlContent,
      text: `Olá${userName ? `, ${userName}` : ''}!\n\nRecebemos uma solicitação para redefinir a senha da sua conta no ZentiaMind.\n\nClique no link abaixo para criar uma nova senha:\n${resetLink}\n\nEste link expira em 1 hora por segurança.\n\nSe você não solicitou esta redefinição, ignore este e-mail.\n\n© ${new Date().getFullYear()} ZentiaMind. Todos os direitos reservados.`
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json(
      { message: 'E-mail de redefinição enviado com sucesso!' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Erro ao enviar e-mail de redefinição:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao enviar e-mail' },
      { status: 500 }
    )
  }
}
