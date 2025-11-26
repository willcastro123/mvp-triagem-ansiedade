/**
 * Utilitários para integração com Hotmart
 */

export interface HotmartWebhookData {
  id: string
  event: string
  version: string
  date: number
  data: {
    product: {
      id: number
      name: string
    }
    buyer: {
      email: string
      name: string
      checkout_phone?: string
    }
    purchase: {
      transaction: string
      status: string
      approved_date?: number
      order_date: number
      price: {
        value: number
        currency_code: string
      }
    }
    subscription?: {
      subscriber: {
        code: string
      }
      status: string
    }
  }
}

/**
 * Valida o Hottok de segurança da Hotmart
 */
export function validateHottok(hottok: string | null): boolean {
  const expectedHottok = process.env.HOTMART_HOTTOK
  
  if (!expectedHottok) {
    console.error('❌ HOTMART_HOTTOK não configurado')
    return false
  }

  return hottok === expectedHottok
}

/**
 * Verifica se o evento é de compra aprovada
 */
export function isPurchaseApproved(data: HotmartWebhookData): boolean {
  const approvedEvents = [
    'PURCHASE_APPROVED',
    'PURCHASE_COMPLETE',
    'SUBSCRIPTION_PAYMENT_APPROVED'
  ]
  
  return approvedEvents.includes(data.event)
}

/**
 * Extrai dados do comprador do webhook
 */
export function extractBuyerData(data: HotmartWebhookData) {
  return {
    email: data.data.buyer.email,
    name: data.data.buyer.name,
    phone: data.data.buyer.checkout_phone || null,
    transaction: data.data.purchase.transaction,
    productId: data.data.product.id,
    productName: data.data.product.name,
    price: data.data.purchase.price.value,
    currency: data.data.purchase.price.currency_code,
    approvedDate: data.data.purchase.approved_date || data.data.purchase.order_date,
    subscriptionCode: data.data.subscription?.subscriber.code || null
  }
}

/**
 * Gera senha aleatória segura
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }
  
  return password
}
