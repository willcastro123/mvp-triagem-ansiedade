"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button' // Se der erro aqui, use <button> normal html

export default function TesteWebhookPage() {
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<string>('')

  const simularVenda = async () => {
    setLoading(true)
    setResultado('Iniciando teste...')

    try {
      // Estamos enviando os dados exatamente como a Keoto enviaria
      const response = await fetch('/api/webhook/pagamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'paid',
          email: 'willcastrobvo@gmail.com', // <--- COLOQUE SEU EMAIL REAL AQUI PARA RECEBER
          name: 'Teste Comprador Manual',
          amount: 10000
        }),
      })

      const data = await response.json()
      
      // Mostra na tela o que o Backend respondeu
      setResultado(JSON.stringify(data, null, 2))

    } catch (error: any) {
      setResultado('Erro na requisição: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-10 flex flex-col items-center justify-center space-y-4">
      <h1 className="text-2xl font-bold">Simulador de Venda (Webhook)</h1>
      <p className="text-gray-500">Isso vai criar uma conta fake e enviar um email para você.</p>
      
      <Button 
        onClick={simularVenda} 
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
      >
        {loading ? 'Processando...' : 'SIMULAR VENDA APROVADA'}
      </Button>

      <div className="w-full max-w-lg mt-4 p-4 bg-gray-100 rounded border border-gray-300">
        <p className="font-bold mb-2">Resultado do Servidor:</p>
        <pre className="whitespace-pre-wrap text-sm text-blue-800">
          {resultado || 'Aguardando clique...'}
        </pre>
      </div>
    </div>
  )
}
