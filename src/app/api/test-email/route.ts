import { NextRequest, NextResponse } from 'next/server'
import { sendTemplateEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { templateType, email, variables } = await request.json()

    if (!templateType || !email) {
      return NextResponse.json(
        { error: 'Template type e email são obrigatórios' },
        { status: 400 }
      )
    }

    // Enviar e-mail usando o template
    await sendTemplateEmail(templateType, email, variables || {})

    return NextResponse.json({ 
      success: true, 
      message: 'E-mail enviado com sucesso!' 
    })
  } catch (error: any) {
    console.error('❌ Erro ao enviar e-mail de teste:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao enviar e-mail' },
      { status: 500 }
    )
  }
}
