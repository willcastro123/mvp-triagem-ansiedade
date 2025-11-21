"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Home, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PaymentPendingPage() {
  const router = useRouter()

  useEffect(() => {
    // Registrar pagamento pendente
    const urlParams = new URLSearchParams(window.location.search)
    const paymentId = urlParams.get('payment_id')
    const status = urlParams.get('status')

    console.log('Pagamento pendente:', { paymentId, status })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-gray-900 dark:via-yellow-900/20 dark:to-orange-900/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-yellow-200 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl text-yellow-700 dark:text-yellow-400">
            Pagamento Pendente
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Seu pagamento está sendo processado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-700 dark:text-yellow-300 text-center">
              ⏳ Aguardando confirmação do pagamento
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center mt-2">
              Você receberá um e-mail assim que o pagamento for confirmado
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Dica:</strong> Pagamentos via boleto ou PIX podem levar até 2 dias úteis para serem confirmados.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 gap-2"
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
              Verificar Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
