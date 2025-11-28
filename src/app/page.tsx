"use client"

import { useRouter } from 'next/navigation'
import { 
  Brain, Heart, Shield, Sparkles, Users, CheckCircle, ArrowRight, Menu, X, 
  Stethoscope, ClipboardList, Video, MessageCircle, Instagram, MapPin, User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase' // Importando o supabase

// Interface para os dados públicos do médico
interface PublicDoctor {
  id: string;
  name: string;
  specialty: string;
  city: string;
  photo_url?: string;
  bio?: string;
}

export default function LandingPage() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [doctors, setDoctors] = useState<PublicDoctor[]>([])
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true)

  // Busca os médicos para exibir na vitrine
  useEffect(() => {
    async function fetchFeaturedDoctors() {
      try {
        // 1. Busca perfis configurados para aparecer na landing page
        const { data: profiles, error: profileError } = await supabase
          .from('doctor_profiles')
          .select('*')
          .eq('show_on_landing', true)
          .limit(4) // Limita a 4 médicos na home para não ficar gigante

        if (profileError || !profiles || profiles.length === 0) {
          setIsLoadingDoctors(false)
          return
        }

        const doctorIds = profiles.map(p => p.doctor_id)

        // 2. Busca dados técnicos (especialidade)
        const { data: docsData } = await supabase
          .from('doctors')
          .select('id, specialty')
          .in('id', doctorIds)

        // 3. Busca dados de contato (nome, cidade)
        const { data: contactsData } = await supabase
          .from('doctor_contact_info')
          .select('doctor_id, name, city')
          .in('doctor_id', doctorIds)

        // 4. Mescla todas as informações
        const mergedDoctors: PublicDoctor[] = profiles.map(profile => {
          const doc = docsData?.find(d => d.id === profile.doctor_id)
          const contact = contactsData?.find(c => c.doctor_id === profile.doctor_id)

          return {
            id: profile.doctor_id,
            name: contact?.name || 'Venha ser um Especialista Zentia Mind',
            specialty: doc?.specialty || 'Para psicólogos e psiquiatras',
            city: contact?.city || 'Atendimento Online e presencial',
            photo_url: profile.photo_url,
            bio: profile.bio
          }
        })

        setDoctors(mergedDoctors)
      } catch (error) {
        console.error('Erro ao carregar médicos:', error)
      } finally {
        setIsLoadingDoctors(false)
      }
    }

    fetchFeaturedDoctors()
  }, [])

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
            <nav className="hidden md:flex items-center gap-4">
              <Button 
                variant="outline"
                onClick={() => router.push('/login')}
              >
                Login Usuário
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('https://www.instagram.com', '_blank')}
              >
                <Instagram className="w-4 h-4 mr-2" />
                Suporte
              </Button>
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => router.push('/quiz')}
              >
                Fazer Quiz
                <ArrowRight className="w-4 h-4 ml-2" />
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
              <Button 
                variant="outline"
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Login Usuário
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('https://www.instagram.com', '_blank')}
                className="w-full"
              >
                <Instagram className="w-4 h-4 mr-2" />
                Suporte
              </Button>
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => router.push('/quiz')}
              >
                Fazer Quiz
                <ArrowRight className="w-4 h-4 ml-2" />
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
              Plataforma completa de apoio à ansiedade
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Bem-vindo ao{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ZentiaMind
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uma plataforma inovadora que conecta você a profissionais especializados, oferece ferramentas de autoajuda e acompanhamento personalizado para gerenciar sua ansiedade.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8"
              onClick={() => router.push('/quiz')}
            >
              Começar com o Quiz
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8"
              onClick={() => router.push('/login')}
            >
              Fazer Login
            </Button>
          </div>
        </div>
      </section>

      {/* --- NOVA SEÇÃO: NOSSOS ESPECIALISTAS --- */}
      {doctors.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Conheça nossos Especialistas
              </h2>
              <p className="text-xl text-muted-foreground">
                Profissionais qualificados prontos para te ajudar na sua jornada
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {doctors.map((doctor) => (
                <Card key={doctor.id} className="hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden border-t-4 border-t-purple-500">
                  <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-800 relative group">
                    {doctor.photo_url ? (
                      <img 
                        src={doctor.photo_url} 
                        alt={doctor.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-50 dark:bg-purple-900/20">
                        <User className="w-20 h-20 text-purple-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-sm font-medium">Ver perfil completo</p>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{doctor.name}</CardTitle>
                    <CardDescription className="text-purple-600 dark:text-purple-400 font-medium">
                      {doctor.specialty}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      {doctor.city}
                    </div>
                    {doctor.bio && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {doctor.bio}
                      </p>
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:hover:bg-purple-900/60"
                      onClick={() => router.push('/quiz')}
                    >
                      Agendar Consulta
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Platform Features */}
      <section className="container mx-auto px-4 py-20 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Como funciona a plataforma ZentiaMind
            </h2>
            <p className="text-xl text-muted-foreground">
              Uma jornada completa de apoio e acompanhamento profissional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
                <CardTitle>1. Quiz Inicial</CardTitle>
                <CardDescription>
                  Responda nosso questionário completo para avaliarmos seu nível de ansiedade e necessidades específicas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                  <Stethoscope className="w-7 h-7 text-white" />
                </div>
                <CardTitle>2. Conexão com Doutor</CardTitle>
                <CardDescription>
                  Conectamos você com um profissional especializado que analisará seus resultados e criará um plano personalizado
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-green-200 dark:border-green-800 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <Video className="w-7 h-7 text-white" />
                </div>
                <CardTitle>3. Conteúdo Personalizado</CardTitle>
                <CardDescription>
                  Acesse vídeos, exercícios e técnicas recomendadas especificamente para seu perfil e necessidades
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-orange-200 dark:border-orange-800 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <CardTitle>4. Acompanhamento</CardTitle>
                <CardDescription>
                  Receba suporte contínuo através do chat, atualizações de progresso e ajustes no seu plano de tratamento
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Doctor Panel Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Para Profissionais
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold">
                Painel do Doutor
              </h2>
              
              <p className="text-lg text-muted-foreground">
                Uma ferramenta completa para profissionais de saúde mental gerenciarem seus pacientes de forma eficiente e personalizada.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Análise de Resultados</h3>
                    <p className="text-muted-foreground">Visualize e analise os resultados dos quizzes dos seus pacientes em tempo real</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Gestão de Pacientes</h3>
                    <p className="text-muted-foreground">Acompanhe o progresso de cada paciente e ajuste os planos de tratamento</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Biblioteca de Conteúdo</h3>
                    <p className="text-muted-foreground">Recomende vídeos, exercícios e técnicas personalizadas para cada caso</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Comunicação Direta</h3>
                    <p className="text-muted-foreground">Chat integrado para manter contato constante com seus pacientes</p>
                  </div>
                </div>
              </div>

              <Button 
                size="lg"
                variant="outline"
                className="text-lg px-8"
                onClick={() => router.push('/doctor/login')}
              >
                Acessar Painel do Doutor
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
                <CardContent className="pt-6">
                  <Users className="w-8 h-8 mb-3" />
                  <p className="text-3xl font-bold mb-2">500+</p>
                  <p className="text-purple-100">Pacientes Atendidos</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
                <CardContent className="pt-6">
                  <Video className="w-8 h-8 mb-3" />
                  <p className="text-3xl font-bold mb-2">200+</p>
                  <p className="text-blue-100">Vídeos Disponíveis</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0">
                <CardContent className="pt-6">
                  <Stethoscope className="w-8 h-8 mb-3" />
                  <p className="text-3xl font-bold mb-2">50+</p>
                  <p className="text-green-100">Profissionais</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
                <CardContent className="pt-6">
                  <Heart className="w-8 h-8 mb-3" />
                  <p className="text-3xl font-bold mb-2">98%</p>
                  <p className="text-orange-100">Satisfação</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Por que escolher o ZentiaMind?
            </h2>
            <p className="text-xl text-muted-foreground">
              Uma plataforma completa desenvolvida com base em evidências científicas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <CardTitle>Baseado em Ciência</CardTitle>
                <CardDescription>
                  Técnicas e métodos validados por pesquisas em psicologia e psiquiatria moderna
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <CardTitle>100% Seguro e Privado</CardTitle>
                <CardDescription>
                  Seus dados são criptografados e protegidos. Privacidade e confidencialidade garantidas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-green-200 dark:border-green-800 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <CardTitle>Suporte Humanizado</CardTitle>
                <CardDescription>
                  Profissionais qualificados e uma comunidade acolhedora para apoiar sua jornada
                </CardDescription>
              </CardHeader>
            </Card>
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
              Faça nosso quiz inicial e descubra como podemos ajudá-lo a gerenciar melhor sua ansiedade
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                variant="secondary"
                className="text-lg px-8"
                onClick={() => router.push('/quiz')}
              >
                Fazer Quiz Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-white/10 hover:bg-white/20 text-white border-white/30"
                onClick={() => window.open('https://www.instagram.com', '_blank')}
              >
                <Instagram className="w-5 h-5 mr-2" />
                Falar com Suporte
              </Button>
            </div>
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
                Plataforma completa de apoio à ansiedade com acompanhamento profissional
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Plataforma</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" onClick={() => router.push('/quiz')} className="hover:text-purple-600 transition-colors">Fazer Quiz</a></li>
                <li><a href="#" onClick={() => router.push('/login')} className="hover:text-purple-600 transition-colors">Login Usuário</a></li>
                <li><a href="#" onClick={() => router.push('/doctor/login')} className="hover:text-purple-600 transition-colors">Painel do Doutor</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Biblioteca de Vídeos</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a 
                    href="#" 
                    onClick={() => window.open('https://www.instagram.com', '_blank')} 
                    className="hover:text-purple-600 transition-colors flex items-center gap-2"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                </li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Contato</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-purple-600 transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Termos de Uso</a></li>
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
