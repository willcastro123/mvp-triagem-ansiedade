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

    // Buscar configurações SMTP do banco de dados
    const { data: smtpConfig, error: smtpError } = await supabase
      .from('smtp_config')
      .select('*')
      .single()

    if (smtpError || !smtpConfig) {
      console.error('Erro ao buscar configurações SMTP:', smtpError)
      return NextResponse.json(
        { error: 'Configurações de e-mail não encontradas. Configure o SMTP no painel administrativo.' },
        { status: 500 }
      )
    }

    // Criar transporter do nodemailer com as configurações do banco
    const transporter = nodemailer.createTransport({
      host: smtpConfig.smtp_host,
      port: smtpConfig.smtp_port,
      secure: smtpConfig.smtp_port === 465, // true para porta 465, false para outras portas
      auth: {
        user: smtpConfig.smtp_user,
        pass: smtpConfig.smtp_password,
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

    // Template HTML do e-mail
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redefinição de Senha - ZentiaMind</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔐 ZentiaMind</h1>
                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Redefinição de Senha</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Olá${userName ? `, ${userName}` : ''}! 👋</h2>
                    
                    <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                      Recebemos uma solicitação para redefinir a senha da sua conta no ZentiaMind.
                    </p>
                    
                    <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                      Clique no botão abaixo para criar uma nova senha:
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
                            Redefinir Senha
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #999999; line-height: 1.6; margin: 30px 0 0 0; font-size: 14px;">
                      Ou copie e cole este link no seu navegador:
                    </p>
                    <p style="color: #667eea; line-height: 1.6; margin: 10px 0 0 0; font-size: 14px; word-break: break-all;">
                      ${resetLink}
                    </p>
                    
                    <!-- Warning Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                      <tr>
                        <td style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px;">
                          <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.6;">
                            <strong>⚠️ Importante:</strong> Este link expira em 1 hora por segurança. Se você não solicitou esta redefinição, ignore este e-mail.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                      Este é um e-mail automático, por favor não responda.
                    </p>
                    <p style="color: #999999; margin: 0; font-size: 12px;">
                      © ${new Date().getFullYear()} ZentiaMind. Todos os direitos reservados.
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

    // Enviar e-mail
    const mailOptions = {
      from: `"ZentiaMind" <${smtpConfig.smtp_user}>`,
      to: email,
      subject: '🔐 Redefinição de Senha - ZentiaMind',
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
