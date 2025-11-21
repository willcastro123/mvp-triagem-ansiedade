"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, LogOut, Shield, User, Activity, TrendingUp, Calendar, MessageSquare, Pill, Target, Brain, Settings, Menu, X, Home, BarChart3, Sparkles, Music, DollarSign, CreditCard, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase, type UserProfile } from '@/lib/supabase'
import { toast } from 'sonner'
import Script from 'next/script'

interface DoctorInfo {
  id: string;
  user_id: string;
  specialty: string;
  crm: string;
}

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null)
  const [showDoctorSell, setShowDoctorSell] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [sellData, setSellData] = useState({
    originalPrice: 100,
    discountedPrice: 90,
    buyerEmail: '',
    buyerName: ''
  })

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

    // Verifica se usuário é doutor
    checkIfDoctor(userData.id)

    // Registra o Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado com sucesso:', registration)
        })
        .catch((error) => {
          console.log('Erro ao registrar Service Worker:', error)
        })
    }

    // Verifica se o app já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Listener para evento de instalação PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listener para detectar quando o app é instalado
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      toast.success('App instalado com sucesso! 🎉')
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [router])

  const checkIfDoctor = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!error && data) {
        setDoctorInfo(data)
      }
    } catch (error) {
      console.log('Usuário não é doutor')
    }
  }

  const handleInstallPWA = async () => {
    if (isInstalled) {
      toast.info('App já está instalado! ✅')
      return
    }

    if (!deferredPrompt) {
      // Instruções para instalação manual
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isAndroid = /Android/.test(navigator.userAgent)
      
      if (isIOS) {
        toast.info('Para instalar no iOS: toque no ícone de compartilhar e selecione "Adicionar à Tela de Início"', {
          duration: 6000
        })
      } else if (isAndroid) {
        toast.info('Para instalar no Android: abra o menu do navegador (⋮) e selecione "Instalar app" ou "Adicionar à tela inicial"', {
          duration: 6000
        })
      } else {
        toast.info('Para instalar: use o menu do navegador e selecione "Instalar aplicativo"', {
          duration: 5000
        })
      }
      return
    }

    // Mostra o prompt de instalação
    deferredPrompt.prompt()
    
    // Aguarda a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      toast.success('Instalando app... 🚀')
      setIsInstalled(true)
    } else {
      toast.info('Instalação cancelada')
    }
    
    // Limpa o prompt
    setDeferredPrompt(null)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    toast.success('Logout realizado com sucesso!')
    router.push('/login')
  }

  const handleAdminAccess = () => {
    router.push('/admin/login')
  }

  const openDoctorSell = () => {
    setSellData({
      originalPrice: 100,
      discountedPrice: 90,
      buyerEmail: '',
      buyerName: ''
    })
    setShowDoctorSell(true)
  }

  const handleDoctorSell = async () => {
    if (!user || !sellData.buyerEmail) {
      toast.error('Preencha o e-mail do comprador')
      return
    }

    if (!doctorInfo) {
      toast.error('Apenas doutores podem realizar vendas')
      return
    }

    setIsProcessingPayment(true)

    try {
      // Criar preferência de pagamento no Mercado Pago
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyerEmail: sellData.buyerEmail,
          buyerName: sellData.buyerName,
          amount: sellData.discountedPrice,
          title: 'Acesso Premium ZentiaMind - Desconto Doutor',
          doctorId: doctorInfo.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar preferência de pagamento')
      }

      // Redirecionar para o checkout do Mercado Pago
      if (data.initPoint) {
        window.location.href = data.initPoint
      } else {
        throw new Error('Link de pagamento não disponível')
      }
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error)
      toast.error(error.message || 'Erro ao processar pagamento. Tente novamente.')
      setIsProcessingPayment(false)
    }
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
    <>
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        strategy="lazyOnload"
      />
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
                {doctorInfo && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">👨‍⚕️ Doutor</p>
                    <p className="text-xs text-muted-foreground">{doctorInfo.specialty}</p>
                  </div>
                )}
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={handleInstallPWA}
                className={`w-full gap-2 ${isInstalled ? 'bg-gray-500 hover:bg-gray-600' : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'}`}
              >
                <Download className="w-4 h-4" />
                {isInstalled ? 'App Instalado ✓' : 'Instalar App'}
              </Button>
              {doctorInfo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openDoctorSell}
                  className="w-full gap-2 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20"
                >
                  <DollarSign className="w-4 h-4" />
                  Vender Acesso
                </Button>
              )}
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
                {doctorInfo && (
                  <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100">Painel do Doutor</h3>
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                      {doctorInfo.specialty} - {doctorInfo.crm}
                    </p>
                    <Button
                      onClick={openDoctorSell}
                      className="w-full sm:w-auto gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      <DollarSign className="w-4 h-4" />
                      Vender Acesso com Desconto
                    </Button>
                  </div>
                )}
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

        {/* Modal: Venda de Doutor com Gateway Mercado Pago */}
        <Dialog open={showDoctorSell} onOpenChange={setShowDoctorSell}>
          <DialogContent className="bg-white dark:bg-slate-800 border-purple-500/20">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                Vender Acesso Premium
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Registre uma venda com desconto de doutor via Mercado Pago
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Valor Original:</span>
                  <span className="text-gray-900 dark:text-white font-semibold line-through">R$ {sellData.originalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Desconto Doutor:</span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">- R$ 10,00</span>
                </div>
                <div className="flex justify-between pt-2 border-t-2 border-orange-300 dark:border-orange-700">
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">Valor Final:</span>
                  <span className="text-orange-600 dark:text-orange-400 font-bold text-2xl">R$ {sellData.discountedPrice.toFixed(2)}</span>
                </div>
              </div>
              <div>
                <Label htmlFor="buyer_name" className="text-gray-700 dark:text-gray-300">Nome do Comprador</Label>
                <Input
                  id="buyer_name"
                  type="text"
                  value={sellData.buyerName}
                  onChange={(e) => setSellData({ ...sellData, buyerName: e.target.value })}
                  placeholder="João Silva"
                  className="bg-white dark:bg-slate-900 border-gray-300 dark:border-purple-500/20 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="buyer_email" className="text-gray-700 dark:text-gray-300">E-mail do Comprador *</Label>
                <Input
                  id="buyer_email"
                  type="email"
                  value={sellData.buyerEmail}
                  onChange={(e) => setSellData({ ...sellData, buyerEmail: e.target.value })}
                  placeholder="comprador@email.com"
                  className="bg-white dark:bg-slate-900 border-gray-300 dark:border-purple-500/20 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  O comprador será redirecionado para o checkout seguro do Mercado Pago
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowDoctorSell(false)} 
                className="border-gray-300 dark:border-purple-500/20"
                disabled={isProcessingPayment}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleDoctorSell} 
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 gap-2"
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Ir para Pagamento
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
