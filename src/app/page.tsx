"use client"

import { useRouter } from 'next/navigation'
import { Brain, Heart, Shield, Sparkles, Users, CheckCircle, ArrowRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

export default function LandingPage() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Header/Navigation */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ZentiaMind
                </h1>
                <p className="text-xs text-muted-foreground">Apoio à Ansiedade</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium hover:text-purple-600 transition-colors">
                Recursos
              </a>
              <a href="#benefits" className="text-sm font-medium hover:text-purple-600 transition-colors">
                Benefícios
              </a>
              <a href="#about" className="text-sm font-medium hover:text-purple-600 transition-colors">
                Sobre
              </a>
              <Button 
                variant="outline"
                onClick={() => router.push('/admin/login')}
              >
                Login Admin
              </Button>
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => router.push('/register')}
              >
                Começar Agora
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 flex flex-col gap-3">
              <a href="#features" className="text-sm font-medium hover:text-purple-600 transition-colors">
                Recursos
              </a>
              <a href="#benefits" className="text-sm font-medium hover:text-purple-600 transition-colors">
                Benefícios
              </a>
              <a href="#about" className="text-sm font-medium hover:text-purple-600 transition-colors">
                Sobre
              </a>
              <Button 
                variant="outline"
                onClick={() => router.push('/admin/login')}
                className="w-full"
              >
                Login Admin
              </Button>
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => router.push('/register')}
              >
                Começar Agora
              </Button>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              Seu companheiro de apoio à ansiedade
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Gerencie sua ansiedade com{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              apoio personalizado
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Triagem personalizada, ferramentas de crise e acompanhamento profissional para ajudá-lo a viver melhor.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8"
              onClick={() => router.push('/register')}
            >
              Começar Gratuitamente
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8"
              onClick={() => router.push('/about')}
            >
              Saiba Mais
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">24/7</p>
              <p className="text-sm text-muted-foreground">Suporte Disponível</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">100%</p>
              <p className="text-sm text-muted-foreground">Confidencial</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">1000+</p>
              <p className="text-sm text-muted-foreground">Usuários Ativos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Recursos que fazem a diferença
            </h2>
            <p className="text-xl text-muted-foreground">
              Ferramentas desenvolvidas para apoiar você em cada momento
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <CardTitle>Triagem Personalizada</CardTitle>
                <CardDescription>
                  Avaliação inicial completa para entender seu tipo de ansiedade e criar um plano personalizado
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <CardTitle>Ferramentas de Crise</CardTitle>
                <CardDescription>
                  Acesso imediato a técnicas de respiração, meditação guiada e exercícios de grounding
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-green-200 dark:border-green-800 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <CardTitle>Acompanhamento Profissional</CardTitle>
                <CardDescription>
                  Conecte-se com psicólogos e psiquiatras especializados em ansiedade
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Por que escolher o ZentiaMind?
              </h2>
              <p className="text-lg text-muted-foreground">
                Uma plataforma completa desenvolvida com base em evidências científicas e feedback de profissionais de saúde mental.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Baseado em Ciência</h3>
                    <p className="text-muted-foreground">Técnicas validadas por pesquisas em psicologia e psiquiatria</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Privacidade Garantida</h3>
                    <p className="text-muted-foreground">Seus dados são criptografados e nunca compartilhados</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Suporte 24/7</h3>
                    <p className="text-muted-foreground">Ferramentas disponíveis a qualquer momento, onde você estiver</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Comunidade Acolhedora</h3>
                    <p className="text-muted-foreground">Conecte-se com outras pessoas que entendem sua jornada</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
                <CardContent className="pt-6">
                  <Users className="w-8 h-8 mb-3" />
                  <p className="text-3xl font-bold mb-2">1000+</p>
                  <p className="text-purple-100">Usuários Ativos</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
                <CardContent className="pt-6">
                  <Heart className="w-8 h-8 mb-3" />
                  <p className="text-3xl font-bold mb-2">95%</p>
                  <p className="text-blue-100">Satisfação</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0">
                <CardContent className="pt-6">
                  <Shield className="w-8 h-8 mb-3" />
                  <p className="text-3xl font-bold mb-2">100%</p>
                  <p className="text-green-100">Seguro</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
                <CardContent className="pt-6">
                  <Brain className="w-8 h-8 mb-3" />
                  <p className="text-3xl font-bold mb-2">24/7</p>
                  <p className="text-orange-100">Disponível</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-purple-500 to-pink-500 border-0 text-white">
          <CardContent className="pt-12 pb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para começar sua jornada?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de pessoas que já estão gerenciando melhor sua ansiedade com o ZentiaMind
            </p>
            <Button 
              size="lg"
              variant="secondary"
              className="text-lg px-8"
              onClick={() => router.push('/register')}
            >
              Criar Conta Gratuita
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">ZentiaMind</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Seu companheiro de apoio para gerenciar ansiedade
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-purple-600 transition-colors">Triagem</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Ferramentas de Crise</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Meditação</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Profissionais</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#about" className="hover:text-purple-600 transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Contato</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-purple-600 transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Termos</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Cookies</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Licenças</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 ZentiaMind. Todos os direitos reservados.</p>
            <p className="mt-2">
              <strong>Aviso:</strong> Esta plataforma não substitui tratamento médico profissional. 
              Em caso de emergência, procure ajuda imediata.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
