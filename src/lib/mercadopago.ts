import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuração do cliente Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  options: { timeout: 5000 }
});

export const preferenceClient = new Preference(client);

// Tipos para criação de preferência
export interface PaymentItem {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

export interface PaymentPayer {
  email: string;
  name?: string;
}

export interface CreatePreferenceData {
  items: PaymentItem[];
  payer: PaymentPayer;
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: 'approved' | 'all';
  external_reference?: string;
  notification_url?: string;
}

// Função para criar preferência de pagamento
export async function createPaymentPreference(data: CreatePreferenceData) {
  try {
    const preference = await preferenceClient.create({
      body: {
        items: data.items,
        payer: data.payer,
        back_urls: data.back_urls,
        auto_return: data.auto_return,
        external_reference: data.external_reference,
        notification_url: data.notification_url,
      }
    });

    return {
      success: true,
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    };
  } catch (error: any) {
    console.error('Erro ao criar preferência de pagamento:', error);
    return {
      success: false,
      error: error.message || 'Erro ao criar preferência de pagamento',
    };
  }
}
