import { NextRequest, NextResponse } from 'next/server';
import { createPaymentPreference } from '@/lib/mercadopago';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { buyerEmail, buyerName, amount, title, doctorId } = body;

    if (!buyerEmail || !amount || !title) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Criar preferência de pagamento
    const result = await createPaymentPreference({
      items: [
        {
          title: title,
          quantity: 1,
          unit_price: amount,
          currency_id: 'BRL',
        },
      ],
      payer: {
        email: buyerEmail,
        name: buyerName || '',
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/pending`,
      },
      auto_return: 'approved',
      external_reference: `doctor_${doctorId}_${Date.now()}`,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      preferenceId: result.preferenceId,
      initPoint: result.initPoint,
      sandboxInitPoint: result.sandboxInitPoint,
    });
  } catch (error: any) {
    console.error('Erro na API de preferência:', error);
    return NextResponse.json(
      { error: 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
}
