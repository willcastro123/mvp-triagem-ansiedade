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

    // Buscar configurações SMTP do banco de dados
    const { data: smtpSettings, error: smtpError } = await supabase
      .from('smtp_settings')
      .select('*')
      .eq('is_active', true)
      .single()

    if (smtpError || !smtpSettings) {
      console.error('Erro ao buscar configurações SMTP:', smtpError)
      return NextResponse.json(
        { error: 'Configurações SMTP não encontradas. Configure o SMTP no painel administrativo.' },
        { status: 500 }
      )
    }

    // Validar configurações SMTP
    if (!smtpSettings.smtp_host || !smtpSettings.smtp_user || !smtpSettings.smtp_password) {
      return NextResponse.json(
        { error: 'Configurações SMTP incompletas. Verifique as configurações no painel administrativo.' },
        { status: 500 }
      )
    }

    // Criar transporter do nodemailer com as configurações do banco
    const transporter = nodemailer.createTransport({
      host: smtpSettings.smtp_host,
      port: smtpSettings.smtp_port,
      secure: smtpSettings.smtp_secure,
      auth: {
        user: smtpSettings.smtp_user,
        pass: smtpSettings.smtp_password,
      },
    })

    // Verificar conexão SMTP
    try {
      await transporter.verify()
      console.log('Conexão SMTP verificada com sucesso')
    } catch (verifyError) {
      console.error('Erro ao verificar conexão SMTP:', verifyError)
      return NextResponse.json(
        { error: 'Erro ao conectar com servidor de e-mail. Verifique as configurações SMTP no painel administrativo.' },
        { status: 500 }
      )
    }

    // Substituir variáveis no template
    let htmlContent = template.html_content
    htmlContent = htmlContent.replace(/\{\{name\}\}/g, userName || 'Usuário')
    htmlContent = htmlContent.replace(/\{\{resetLink\}\}/g, resetLink)

    // Enviar e-mail
    const mailOptions = {
      from: `"${smtpSettings.from_name}" <${smtpSettings.from_email}>`,
      to: email,
      subject: template.subject,
      html: htmlContent,
      text: `Olá${userName ? `, ${userName}` : ''}!\n\nRecebemos uma solicitação para redefinir a senha da sua conta no ZentiaMind.\n\nClique no link abaixo para criar uma nova senha:\n${resetLink}\n\nEste link expira em 1 hora por segurança.\n\nSe você não solicitou esta redefinição, ignore este e-mail.\n\n© ${new Date().getFullYear()} ZentiaMind. Todos os direitos reservados.`
    }

    await transporter.sendMail(mailOptions)
    console.log('E-mail de redefinição enviado com sucesso para:', email)

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
