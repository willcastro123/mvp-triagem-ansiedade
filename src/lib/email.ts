import nodemailer from 'nodemailer'
import { getSupabaseClient } from './supabase'

// Configuração do transporte SMTP com Titan Email
const transporter = nodemailer.createTransport({
  host: 'smtp.titan.email',
  port: 465,
  secure: true, // SSL/TLS
  auth: {
    user: process.env.SMTP_USER || 'suporte@zentiamind.com.br',
    pass: process.env.SMTP_PASSWORD || '09111964Wc!@',
  },
  tls: {
    rejectUnauthorized: false // Aceita certificados auto-assinados
  }
})

// Verificar conexão SMTP
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erro na configuração SMTP:', error)
  } else {
    console.log('✅ Servidor SMTP pronto para enviar e-mails')
  }
})

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    console.log('📧 Enviando e-mail para:', to)
    
    const info = await transporter.sendMail({
      from: `"Zentia Mind" <${process.env.SMTP_USER || 'suporte@zentiamind.com.br'}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Remove HTML tags para versão texto
    })

    console.log('✅ E-mail enviado com sucesso:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error)
    throw error
  }
}

/**
 * Busca um template de e-mail do banco de dados e substitui as variáveis
 */
async function getEmailTemplate(
  type: string,
  variables: Record<string, string>
): Promise<{ subject: string; html: string } | null> {
  try {
    const supabase = getSupabaseClient()
    
    const { data: template, error } = await supabase
      .from('email_templates')
      .select('subject, html_content')
      .eq('type', type)
      .eq('is_active', true)
      .single()

    if (error || !template) {
      console.error('❌ Template não encontrado:', type, error)
      return null
    }

    let { subject, html_content: html } = template

    // Substituir variáveis no assunto e no HTML
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      subject = subject.replace(regex, value)
      html = html.replace(regex, value)
    })

    return { subject, html }
  } catch (error) {
    console.error('❌ Erro ao buscar template:', error)
    return null
  }
}

/**
 * Envia e-mail de redefinição de senha usando template do banco
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetLink: string
) {
  const template = await getEmailTemplate('password_reset', {
    name,
    resetLink
  })

  if (!template) {
    // Fallback para template hardcoded se não encontrar no banco
    console.warn('⚠️ Usando template fallback para password_reset')
    const subject = 'Redefinição de Senha - Zentia Mind'
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redefinição de Senha</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Zentia Mind</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Olá, ${name}!</h2>
                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      Recebemos uma solicitação para redefinir a senha da sua conta.
                    </p>
                    <table role="presentation" style="margin: 0 auto;">
                      <tr>
                        <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                          <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
                            Redefinir Senha
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; color: #999999; font-size: 14px;">
                      © ${new Date().getFullYear()} Zentia Mind. Todos os direitos reservados.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
    return sendEmail({ to: email, subject, html })
  }

  return sendEmail({ to: email, subject: template.subject, html: template.html })
}

/**
 * Envia e-mail de boas-vindas usando template do banco
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
) {
  const template = await getEmailTemplate('welcome', { name })

  if (!template) {
    console.error('❌ Template de boas-vindas não encontrado')
    return
  }

  return sendEmail({ to: email, subject: template.subject, html: template.html })
}

/**
 * Envia e-mail de confirmação de compra usando template do banco
 */
export async function sendPurchaseConfirmationEmail(
  email: string,
  name: string,
  productName: string,
  amount: string,
  date: string
) {
  const template = await getEmailTemplate('purchase_confirmation', {
    name,
    productName,
    amount,
    date
  })

  if (!template) {
    console.error('❌ Template de confirmação de compra não encontrado')
    return
  }

  return sendEmail({ to: email, subject: template.subject, html: template.html })
}

/**
 * Envia e-mail de fatura em aberto usando template do banco
 */
export async function sendInvoicePendingEmail(
  email: string,
  name: string,
  amount: string,
  dueDate: string,
  paymentLink: string
) {
  const template = await getEmailTemplate('invoice_pending', {
    name,
    amount,
    dueDate,
    paymentLink
  })

  if (!template) {
    console.error('❌ Template de fatura em aberto não encontrado')
    return
  }

  return sendEmail({ to: email, subject: template.subject, html: template.html })
}

/**
 * Envia notificação geral usando template do banco
 */
export async function sendNotificationEmail(
  email: string,
  name: string,
  title: string,
  message: string,
  subject: string
) {
  const template = await getEmailTemplate('notification', {
    name,
    title,
    message,
    subject
  })

  if (!template) {
    console.error('❌ Template de notificação não encontrado')
    return
  }

  return sendEmail({ to: email, subject: template.subject, html: template.html })
}

/**
 * Envia e-mail usando qualquer template personalizado
 */
export async function sendTemplateEmail(
  templateType: string,
  email: string,
  variables: Record<string, string>
) {
  const template = await getEmailTemplate(templateType, variables)

  if (!template) {
    console.error(`❌ Template ${templateType} não encontrado`)
    throw new Error(`Template ${templateType} não encontrado`)
  }

  return sendEmail({ to: email, subject: template.subject, html: template.html })
}
