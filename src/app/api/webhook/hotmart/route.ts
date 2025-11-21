import { NextRequest, NextResponse } from 'next/server'
import { processHotmartPurchase, validateHotmartWebhook, HotmartWebhookData } from '@/lib/hotmart'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const webhookData: HotmartWebhookData = JSON.parse(body)

    // Valida o webhook (em produção, valide a assinatura da Hotmart)
    const isValid = validateHotmartWebhook(request.headers, body)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Webhook inválido' },
        { status: 401 }
      )
    }

    // Log do evento recebido
    console.log('Webhook Hotmart recebido:', {
      event: webhookData.event,
      email: webhookData.data.buyer.email,
      status: webhookData.data.purchase.status
    })

    // Processa apenas eventos de compra aprovada
    if (webhookData.event === 'PURCHASE_APPROVED' || 
        webhookData.event === 'PURCHASE_COMPLETE') {
      
      const result = await processHotmartPurchase(webhookData)

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: result.message,
          userId: result.userId
        })
      } else {
        return NextResponse.json(
          { error: result.message },
          { status: 400 }
        )
      }
    }

    // Outros eventos são apenas logados
    return NextResponse.json({
      success: true,
      message: 'Evento recebido mas não processado',
      event: webhookData.event
    })

  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}

// Permite requisições GET para teste
export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de webhook Hotmart ativo',
    url: '/api/webhook/hotmart'
  })
}
