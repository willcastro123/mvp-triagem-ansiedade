"use client"

import { useRouter } from 'next/navigation'
import { Mail, Settings, Users, LayoutDashboard, FileText, Bell, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ZentiaMind Admin
                </h1>
                <p className="text-xs text-muted-foreground">Sistema de Gerenciamento</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => router.push('/demo/email')}
              >
                <Send className="w-4 h-4 mr-2" />
                Demo
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/dashboard/settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Bem-vindo ao{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Painel Administrativo
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Gerencie templates de e-mail, usuários e configurações do sistema
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {/* Templates de E-mail */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-purple-200 dark:border-purple-800" onClick={() => router.push('/admin/email-templates')}>
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-3">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl">Templates de E-mail</CardTitle>
                <CardDescription>
                  Crie e gerencie templates personalizados para notificações automáticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Gerenciar Templates
                </Button>
              </CardContent>
            </Card>

            {/* Demonstração */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 dark:border-green-800" onClick={() => router.push('/demo/email')}>
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-3">
                  <Send className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl">Demonstração</CardTitle>
                <CardDescription>
                  Teste os templates de e-mail e veja exemplos de envio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                  Ver Demonstração
                </Button>
              </CardContent>
            </Card>

            {/* Configurações de E-mail */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/settings')}>
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-3">
                  <Settings className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl">Configurações SMTP</CardTitle>
                <CardDescription>
                  Configure servidor de e-mail e credenciais de envio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Configurar SMTP
                </Button>
              </CardContent>
            </Card>

            {/* Usuários */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer opacity-75">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-3">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl">Usuários</CardTitle>
                <CardDescription>
                  Gerencie usuários e permissões do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  Em Breve
                </Button>
              </CardContent>
            </Card>

            {/* Dashboard */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer opacity-75">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-3">
                  <LayoutDashboard className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl">Dashboard</CardTitle>
                <CardDescription>
                  Visualize estatísticas e métricas do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  Em Breve
                </Button>
              </CardContent>
            </Card>

            {/* Relatórios */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer opacity-75">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mb-3">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl">Relatórios</CardTitle>
                <CardDescription>
                  Gere relatórios de envios e performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  Em Breve
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold mb-2">5</p>
                  <p className="text-purple-100">Templates Ativos</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold mb-2">100%</p>
                  <p className="text-blue-100">Taxa de Entrega</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold mb-2">24/7</p>
                  <p className="text-green-100">Sistema Ativo</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Start Guide */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle className="text-2xl">🚀 Guia Rápido</CardTitle>
              <CardDescription>Comece a usar o sistema em 3 passos simples</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Configure o SMTP</h3>
                    <p className="text-sm text-muted-foreground">
                      Acesse as configurações e adicione suas credenciais de e-mail (Titan, Gmail, etc.)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Personalize Templates</h3>
                    <p className="text-sm text-muted-foreground">
                      Edite os templates de e-mail para cada tipo de notificação automática
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Teste e Ative</h3>
                    <p className="text-sm text-muted-foreground">
                      Use a demonstração para testar os envios e ative os templates
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-white/50 dark:bg-gray-900/50 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 ZentiaMind Admin. Sistema de Gerenciamento de E-mails.</p>
        </div>
      </footer>
    </div>
  )
}
