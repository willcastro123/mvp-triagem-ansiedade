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
            name: contact?.name || 'Especialista ZentiaMind',
            specialty: doc?.specialty || 'Saúde Mental',
            city: contact?.city || 'Atendimento Online',
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
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify
