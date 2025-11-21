"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Home, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PaymentSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Registrar sucesso do pagamento
    const urlParams = new URLSearchParams(window.location.search)
    const paymentId = urlParams.get('payment_id')
    const status = urlParams.get('status')
    const externalReference = urlParams.get('external_reference')

    console.log('Pagamento aprovado:', { paymentId, status, externalReference })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-teal-900/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-green-200 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl text-green-700 dark:text-green-400">
            Pagamento Aprovado!
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Sua compra foi processada com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300 text-center">
              ✅ Acesso Premium ativado com sucesso!
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 text-center mt-2">
              Você receberá um e-mail de confirmação em breve
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 gap-2"
            >
              <Home className="w-4 h-4" />
              Voltar ao Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="w-full gap-2"
            >
              <Mail className="w-4 h-4" />
              Ver Detalhes do Pedido
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
