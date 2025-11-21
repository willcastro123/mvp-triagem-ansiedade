"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { XCircle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PaymentFailurePage() {
  const router = useRouter()

  useEffect(() => {
    // Registrar falha do pagamento
    const urlParams = new URLSearchParams(window.location.search)
    const paymentId = urlParams.get('payment_id')
    const status = urlParams.get('status')

    console.log('Pagamento falhou:', { paymentId, status })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900/20 dark:to-orange-900/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-red-200 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl text-red-700 dark:text-red-400">
            Pagamento Não Aprovado
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Houve um problema ao processar seu pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300 text-center">
              ❌ Não foi possível concluir a transação
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 text-center mt-2">
              Verifique seus dados de pagamento e tente novamente
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="w-full gap-2"
            >
              <Home className="w-4 h-4" />
              Voltar ao Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
