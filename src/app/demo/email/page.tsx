"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Send, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function EmailDemoPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState<string | null>(null)

  const sendDemoEmail = async (type: string, variables: Record<string, string>) => {
    if (!email) {
      toast.error('Digite um e-mail para teste')
      return
    }

    setIsSending(type)
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType: type,
          email,
          variables
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar e-mail')
      }

      toast.success(`E-mail de ${type} enviado com sucesso!`)
    } catch (error: any) {
      console.error('Erro ao enviar e-mail:', error)
      toast.error(error.message || 'Erro ao enviar e-mail')
    } finally {
      setIsSending(null)
    }
  }

  const demoScenarios = [
    {
      type: 'password_reset',
      title: 'Redefinição de Senha',
      description: 'Enviado quando usuário solicita recuperação de senha',
      icon: '🔐',
      color: 'from-purple-500 to-pink-500',
      variables: {
        name: 'João Silva',
        resetLink: `${window.location.origin}/reset-password?token=demo123`
      }
    },
    {
      type: 'welcome',
      title: 'Boas-vindas',
      description: 'Enviado quando novo usuário se cadastra',
      icon: '🎉',
      color: 'from-green-500 to-emerald-500',
      variables: {
        name: 'Maria Santos'
      }
    },
    {
      type: 'purchase_confirmation',
      title: 'Confirmação de Compra',
      description: 'Enviado após compra bem-sucedida',
      icon: '✅',
      color: 'from-blue-500 to-cyan-500',
      variables: {
        name: 'Carlos Oliveira',
        productName: 'Plano Premium',
        amount: '99,90',
        date: new Date().toLocaleDateString('pt-BR')
      }
    },
    {
      type: 'invoice_pending',
      title: 'Fatura em Aberto',
      description: 'Enviado quando há fatura pendente',
      icon: '⚠️',
      color: 'from-orange-500 to-red-500',
      variables: {
        name: 'Ana Costa',
        amount: '149,90',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        paymentLink: `${window.location.origin}/payment/demo`
      }
    },
    {
      type: 'notification',
      title: 'Notificação Geral',
      description: 'Enviado para notificações diversas',
      icon: '🔔',
      color: 'from-indigo-500 to-purple-500',
      variables: {
        name: 'Pedro Alves',
        title: 'Nova Atualização Disponível',
        message: 'Temos novidades incríveis para você! Acesse sua conta para conferir.',
        subject: 'Nova Atualização - Zentia Mind'
      }
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Mail className="w-8 h-8 text-purple-600" />
              Demonstração de E-mails
            </h1>
            <p className="text-muted-foreground mt-1">
              Teste os templates de e-mail configurados no sistema
            </p>
          </div>
        </div>

        {/* Email Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>E-mail de Teste</CardTitle>
            <CardDescription>
              Digite seu e-mail para receber os exemplos de templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => setEmail('suporte@zentiamind.com.br')}
              >
                Usar E-mail Padrão
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Scenarios */}
        <div className="grid md:grid-cols-2 gap-6">
          {demoScenarios.map((scenario) => (
            <Card key={scenario.type} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-14 h-14 bg-gradient-to-br ${scenario.color} rounded-full flex items-center justify-center mb-3 text-2xl`}>
                  {scenario.icon}
                </div>
                <CardTitle>{scenario.title}</CardTitle>
                <CardDescription>{scenario.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Variáveis:</p>
                    <div className="space-y-1">
                      {Object.entries(scenario.variables).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-purple-600">{{key}}</span>
                          <span className="text-muted-foreground">=</span>
                          <span className="truncate">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    className={`w-full bg-gradient-to-r ${scenario.color} hover:opacity-90`}
                    onClick={() => sendDemoEmail(scenario.type, scenario.variables)}
                    disabled={isSending === scenario.type || !email}
                  >
                    {isSending === scenario.type ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Exemplo
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Como Funciona?</h3>
                <ul className="space-y-2 text-purple-100">
                  <li>• Os templates são carregados do banco de dados</li>
                  <li>• As variáveis são substituídas automaticamente</li>
                  <li>• Os e-mails são enviados via SMTP configurado</li>
                  <li>• Você pode editar os templates no painel administrativo</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
