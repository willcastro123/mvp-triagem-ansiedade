interface SendPulseConfig {
  userId: string
  secret: string
}

interface SendPulseEmailParams {
  to: string
  subject: string
  html: string
  from?: {
    name: string
    email: string
  }
}

class SendPulseClient {
  private userId: string
  private secret: string
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor(config: SendPulseConfig) {
    this.userId = config.userId
    this.secret = config.secret
  }

  private async getAccessToken(): Promise<string> {
    // Se já temos um token válido, retornar
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    // Obter novo token
    const response = await fetch('https://api.sendpulse.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: this.userId,
        client_secret: this.secret,
      }),
    })

    if (!response.ok) {
      throw new Error(`Erro ao obter token SendPulse: ${response.statusText}`)
    }

    const data = await response.json()
    this.accessToken = data.access_token
    // Token expira em 1 hora, vamos renovar 5 minutos antes
    this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000

    return this.accessToken
  }

  async sendEmail(params: SendPulseEmailParams): Promise<boolean> {
    try {
      const token = await this.getAccessToken()

      const emailData = {
        email: {
          html: params.html,
          text: params.html.replace(/<[^>]*>/g, ''), // Remove HTML tags para versão texto
          subject: params.subject,
          from: params.from || {
            name: 'Seu App',
            email: 'noreply@seuapp.com',
          },
          to: [
            {
              email: params.to,
            },
          ],
        },
      }

      const response = await fetch('https://api.sendpulse.com/smtp/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emailData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Erro SendPulse:', errorData)
        throw new Error(`Erro ao enviar e-mail: ${response.statusText}`)
      }

      return true
    } catch (error) {
      console.error('Erro ao enviar e-mail via SendPulse:', error)
      throw error
    }
  }
}

// Instância singleton do cliente SendPulse
let sendPulseClient: SendPulseClient | null = null

export function getSendPulseClient(): SendPulseClient {
  if (!sendPulseClient) {
    const userId = process.env.SENDPULSE_USER_ID
    const secret = process.env.SENDPULSE_SECRET

    if (!userId || !secret) {
      throw new Error('Credenciais SendPulse não configuradas')
    }

    sendPulseClient = new SendPulseClient({ userId, secret })
  }

  return sendPulseClient
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetLink: string
): Promise<boolean> {
  const client = getSendPulseClient()

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .button {
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Redefinição de Senha</h1>
          </div>
          <div class="content">
            <h2>Olá, ${name}!</h2>
            <p>Você solicitou a redefinição de senha da sua conta.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Redefinir Senha</a>
            </div>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #4F46E5;">${resetLink}</p>
            <p><strong>Este link expira em 1 hora.</strong></p>
            <p>Se você não solicitou esta alteração, ignore este e-mail. Sua senha permanecerá inalterada.</p>
          </div>
          <div class="footer">
            <p>Este é um e-mail automático, por favor não responda.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return await client.sendEmail({
    to: email,
    subject: 'Redefinição de Senha',
    html,
    from: {
      name: 'Seu App',
      email: 'noreply@seuapp.com',
    },
  })
}
