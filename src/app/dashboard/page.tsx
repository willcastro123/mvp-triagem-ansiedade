"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, LogOut, Shield, User, Activity, TrendingUp, Calendar, MessageSquare, Pill, Target, Brain, Settings, Menu, X, Home, BarChart3, Sparkles, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase, type UserProfile } from '@/lib/supabase'
import { toast } from 'sonner'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Verifica se usuário está logado
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(userStr)
    setUser(userData)
    setIsLoading(false)

    // Registra atividade de acesso ao dashboard
    supabase
      .from('user_activity_logs')
      .insert([{
        user_id: userData.id,
        activity_type: 'dashboard_access',
        activity_description: 'Usuário acessou o dashboard',
        metadata: { timestamp: new Date().toISOString() }
      }])
  }, [router])

  const handleLogout = () => {
    if (user) {
      // Registra atividade de logout
      supabase
        .from('user_activity_logs')
        .insert([{
          user_id: user.id,
          activity_type: 'logout',
          activity_description: 'Usuário fez logout do sistema',
          metadata: { timestamp: new Date().toISOString() }
        }])
    }

    localStorage.removeItem('user')
    toast.success('Logout realizado com sucesso!')
    router.push('/login')
  }

  const handleAdminAccess = () => {
    router.push('/admin/login')
  }

  const handleNavigation = (section: string) => {
    // Mapeamento de seções para rotas
    const routeMap: { [key: string]: string } = {
      'Início': '/dashboard',
      'Registro de Humor': '/dashboard/mood',
      'Medicamentos': '/dashboard/medications',
      'Hábitos': '/dashboard/habits',
      'Exposição Gradual': '/dashboard/exposure',
      'Chat IA': '/dashboard/chat',
      'Meditação': '/dashboard/meditation',
      'Conhecimento Mental': '/dashboard/mind-insights',
      'Estatísticas': '/dashboard/stats',
      'Configurações': '/dashboard/settings'
    }

    const route = routeMap[section]
    
    if (route === '/dashboard') {
      // Já está no dashboard, apenas fecha o sidebar mobile
      setSidebarOpen(false)
      return
    }

    if (route && route !== '/dashboard') {
      // Navega para a rota específica
      router.push(route)
    } else {
      // Fallback para seções ainda não implementadas
      toast.info(`Navegando para: ${section}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ZentiaMind
                </h1>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Button 
              onClick={() => handleNavigation('Início')}
              variant="ghost"
              className="w-full justify-start gap-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30"
            >
              <Home className="w-5 h-5" />
              <span>Início</span>
            </Button>
            <Button 
              onClick={() => handleNavigation('Registro de Humor')}
              variant="ghost"
              className="w-full justify-start gap-3"
            >
              <Activity className="w-5 h-5" />
              <span>Registro de Humor</span>
            </Button>
            <Button 
              onClick={() => handleNavigation('Meditação')}
              variant="ghost"
              className="w-full justify-start gap-3"
            >
              <Music className="w-5 h-5" />
              <span>Meditação</span>
            </Button>
            <Button 
              onClick={() => handleNavigation('Conhecimento Mental')}
              variant="ghost"
              className="w-full justify-start gap-3"
            >
              <Brain className="w-5 h-5" />
              <span>Conhecimento Mental</span>
            </Button>
            <Button 
              onClick={() => handleNavigation('Medicamentos')}
              variant="ghost"
              className="w-full justify-start gap-3"
            >
              <Pill className="w-5 h-5" />
              <span>Medicamentos</span>
            </Button>
            <Button 
              onClick={() => handleNavigation('Hábitos')}
              variant="ghost"
              className="w-full justify-start gap-3"
            >
              <Target className="w-5 h-5" />
              <span>Hábitos</span>
            </Button>
            <Button 
              onClick={() => handleNavigation('Exposição Gradual')}
              variant="ghost"
              className="w-full justify-start gap-3"
            >
              <Sparkles className="w-5 h-5" />
              <span>Exposição Gradual</span>
            </Button>
            <Button 
              onClick={() => handleNavigation('Chat IA')}
              variant="ghost"
              className="w-full justify-start gap-3"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Chat IA</span>
            </Button>
            <Button 
              onClick={() => handleNavigation('Estatísticas')}
              variant="ghost"
              className="w-full justify-start gap-3"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Estatísticas</span>
            </Button>
            <Button 
              onClick={() => handleNavigation('Configurações')}
              variant="ghost"
              className="w-full justify-start gap-3"
            >
              <Settings className="w-5 h-5" />
              <span>Configurações</span>
            </Button>
          </nav>

          {/* User Info & Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${user.is_premium ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <p className="text-xs font-medium">{user.is_premium ? 'Premium' : 'Gratuito'}</p>
                </div>
                <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-xs font-bold">{user.points || 0}</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdminAccess}
              className="w-full gap-2 border-purple-200 hover:bg-purple-50"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header Mobile */}
        <header className="lg:hidden border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ZentiaMind
              </h1>
            </div>
            <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              <span className="text-xs font-bold">{user.points || 0}</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Olá, {user.name}! 👋</h2>
              <p className="text-muted-foreground">
                Bem-vindo ao seu painel de controle. Aqui você pode acompanhar seu progresso e gerenciar seu tratamento.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                <CardContent className="pt-6 text-center">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                  <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{user.points || 0}</p>
                  <p className="text-sm text-muted-foreground">Pontos Acumulados</p>
                  <p className="text-xs text-muted-foreground mt-1">Ganhe pontos em cada atividade!</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Dias de Sequência</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Atividades Completas</p>
                </CardContent>
              </Card>
            </div>

            {/* User Info Card */}
            <Card className="mb-8 border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-semibold">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-semibold">{user.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Idade</p>
                    <p className="font-semibold">{user.age} anos</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cidade</p>
                    <p className="font-semibold">{user.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Ansiedade</p>
                    <p className="font-semibold capitalize">
                      {user.anxiety_type === 'social' && 'Ansiedade Social'}
                      {user.anxiety_type === 'panic' && 'Transtorno do Pânico'}
                      {user.anxiety_type === 'general' && 'Ansiedade Generalizada'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.is_premium ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <p className="font-semibold">{user.is_premium ? 'Premium' : 'Gratuito'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Grid - Cards com botões */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-purple-600" />
                    Registro de Humor
                  </CardTitle>
                  <CardDescription>Acompanhe suas emoções diárias e identifique padrões</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleNavigation('Registro de Humor')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Acessar
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-shadow border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Music className="w-5 h-5 text-purple-600" />
                    Meditação
                  </CardTitle>
                  <CardDescription>Vídeos e sons relaxantes para acalmar sua mente</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleNavigation('Meditação')}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                  >
                    Acessar
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-shadow border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Conhecimento Mental
                  </CardTitle>
                  <CardDescription>IA analisa seu estado e sugere o que fazer</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleNavigation('Conhecimento Mental')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Acessar
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Pill className="w-5 h-5 text-blue-600" />
                    Medicamentos
                  </CardTitle>
                  <CardDescription>Gerencie seus medicamentos e lembretes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleNavigation('Medicamentos')}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    Acessar
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5 text-green-600" />
                    Hábitos
                  </CardTitle>
                  <CardDescription>Construa hábitos saudáveis para seu bem-estar</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleNavigation('Hábitos')}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    Acessar
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-orange-600" />
                    Exposição Gradual
                  </CardTitle>
                  <CardDescription>Enfrente seus medos de forma progressiva</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleNavigation('Exposição Gradual')}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    Acessar
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="w-5 h-5 text-pink-600" />
                    Chat IA
                  </CardTitle>
                  <CardDescription>Converse com assistente virtual de apoio</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleNavigation('Chat IA')}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  >
                    Acessar
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="w-5 h-5 text-gray-600" />
                    Configurações
                  </CardTitle>
                  <CardDescription>Ajuste suas preferências e notificações</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleNavigation('Configurações')}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                  >
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
