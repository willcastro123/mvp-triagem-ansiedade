'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PremiumLock, PremiumButton } from '@/components/custom/premium-lock'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity, Brain, Target, Pill, Music, MessageSquare, ArrowLeft } from 'lucide-react'
import { supabase, type UserProfile } from '@/lib/supabase'

export default function ExampleLockedPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(userStr)
    setUser(userData)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">Exemplo de Página com Bloqueio Premium</h1>
          <p className="text-muted-foreground">
            Esta página demonstra como o sistema de bloqueio funciona para usuários não-premium
          </p>
        </div>

        {/* Status do Usuário */}
        <Card className="mb-8 border-2 border-purple-200">
          <CardHeader>
            <CardTitle>Status da Conta</CardTitle>
            <CardDescription>Informações sobre seu acesso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-semibold">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${user.is_premium ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <p className="font-semibold">{user.is_premium ? 'Premium Ativo' : 'Aguardando Pagamento'}</p>
                </div>
              </div>
            </div>
            {!user.is_premium && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>⏳ Aguardando confirmação:</strong> Assim que o pagamento da sua fatura for confirmado, 
                  todos os recursos abaixo serão desbloqueados automaticamente.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exemplo 1: Card Completo Bloqueado */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Exemplo 1: Card Completo Bloqueado</h2>
          <PremiumLock
            feature="Registro de Humor Avançado"
            description="Acompanhe suas emoções com análises detalhadas e insights personalizados"
            isPremium={user.is_premium}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Registro de Humor Avançado
                </CardTitle>
                <CardDescription>
                  Análise completa das suas emoções com gráficos e relatórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">85%</p>
                      <p className="text-sm text-muted-foreground">Humor Positivo</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">12</p>
                      <p className="text-sm text-muted-foreground">Dias de Sequência</p>
                    </div>
                  </div>
                  <Button className="w-full">Ver Relatório Completo</Button>
                </div>
              </CardContent>
            </Card>
          </PremiumLock>
        </div>

        {/* Exemplo 2: Grid de Cards Bloqueados */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Exemplo 2: Múltiplos Recursos Bloqueados</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <PremiumLock
              feature="Chat IA Ilimitado"
              isPremium={user.is_premium}
              showUpgradeButton={false}
            >
              <Card>
                <CardContent className="pt-6 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-pink-600" />
                  <h3 className="font-semibold mb-2">Chat IA Ilimitado</h3>
                  <p className="text-sm text-muted-foreground">Converse sem limites com nosso assistente</p>
                </CardContent>
              </Card>
            </PremiumLock>

            <PremiumLock
              feature="Meditações Exclusivas"
              isPremium={user.is_premium}
              showUpgradeButton={false}
            >
              <Card>
                <CardContent className="pt-6 text-center">
                  <Music className="w-12 h-12 mx-auto mb-3 text-indigo-600" />
                  <h3 className="font-semibold mb-2">Meditações Exclusivas</h3>
                  <p className="text-sm text-muted-foreground">Acesso a biblioteca completa de meditações</p>
                </CardContent>
              </Card>
            </PremiumLock>

            <PremiumLock
              feature="Análise Avançada"
              isPremium={user.is_premium}
              showUpgradeButton={false}
            >
              <Card>
                <CardContent className="pt-6 text-center">
                  <Brain className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold mb-2">Análise Avançada</h3>
                  <p className="text-sm text-muted-foreground">Insights profundos sobre seu progresso</p>
                </CardContent>
              </Card>
            </PremiumLock>
          </div>
        </div>

        {/* Exemplo 3: Botões Individuais Bloqueados */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Exemplo 3: Botões Bloqueados</h2>
          <Card>
            <CardHeader>
              <CardTitle>Ações Disponíveis</CardTitle>
              <CardDescription>Alguns recursos requerem acesso premium</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline">
                  Ação Gratuita
                </Button>
                
                <PremiumButton
                  isPremium={user.is_premium}
                  onClick={() => alert('Recurso desbloqueado!')}
                  variant="default"
                >
                  Ação Premium 1
                </PremiumButton>

                <PremiumButton
                  isPremium={user.is_premium}
                  onClick={() => alert('Recurso desbloqueado!')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  Ação Premium 2
                </PremiumButton>

                <PremiumButton
                  isPremium={user.is_premium}
                  onClick={() => alert('Recurso desbloqueado!')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500"
                >
                  Ação Premium 3
                </PremiumButton>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instruções para Implementação */}
        <Card className="border-2 border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              Como Implementar o Bloqueio
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Guia rápido para desenvolvedores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">1. Bloquear um card completo:</p>
              <pre className="bg-slate-900 text-white p-3 rounded-lg overflow-x-auto">
{`<PremiumLock
  feature="Nome do Recurso"
  description="Descrição opcional"
  isPremium={user.is_premium}
>
  <Card>
    {/* Seu conteúdo aqui */}
  </Card>
</PremiumLock>`}
              </pre>
            </div>

            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">2. Bloquear um botão:</p>
              <pre className="bg-slate-900 text-white p-3 rounded-lg overflow-x-auto">
{`<PremiumButton
  isPremium={user.is_premium}
  onClick={() => alert('Ação')}
>
  Texto do Botão
</PremiumButton>`}
              </pre>
            </div>

            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">3. Verificar status no código:</p>
              <pre className="bg-slate-900 text-white p-3 rounded-lg overflow-x-auto">
{`if (!user.is_premium) {
  // Mostrar mensagem ou bloquear ação
  return
}
// Executar ação premium`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
