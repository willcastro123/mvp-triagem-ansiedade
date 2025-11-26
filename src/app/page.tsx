"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Phone, LogIn, CheckCircle, Users, TrendingUp, Star, Shield, Zap, Award, Brain, Target, Sparkles, ArrowRight, Stethoscope, FileText, MessageSquare, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ZentiaMind
                </h1>
                <p className="text-xs text-muted-foreground">Tratamento de Ansiedade</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => router.push('/login')}
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => window.open('https://www.instagram.com/zentiamind/', '_blank')}
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Suporte</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block">
            <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              ✨ Mais de 10.000 pessoas já transformaram suas vidas
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Supere a Ansiedade com o{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ZentiaMind
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Tratamento personalizado baseado em Terapia Cognitivo-Comportamental (TCC) 
            para ansiedade social, transtorno do pânico e ansiedade generalizada
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-6 w-full sm:w-auto"
              onClick={() => router.push('/quiz')}
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Fazer Avaliação Gratuita
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 w-full sm:w-auto"
              onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Saiba Mais
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 pt-8 max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-purple-600">87%</p>
              <p className="text-sm text-muted-foreground">Taxa de melhora</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-purple-600">10k+</p>
              <p className="text-sm text-muted-foreground">Pessoas tratadas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-purple-600">4.9/5</p>
              <p className="text-sm text-muted-foreground">Avaliação média</p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-16 bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona o ZentiaMind</h2>
              <p className="text-lg text-muted-foreground">
                Um método científico e comprovado em 3 etapas simples
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>1. Avaliação Personalizada</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Responda um questionário detalhado para identificarmos seu tipo específico de ansiedade
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>2. Plano Customizado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Receba um plano de tratamento baseado em TCC, adaptado às suas necessidades específicas
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>3. Acompanhamento Diário</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Pratique exercícios diários e acompanhe seu progresso com suporte 24/7
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Painel do Doutor */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-semibold">
                  🩺 Para Profissionais de Saúde
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Painel do Doutor</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Uma plataforma completa para profissionais de saúde gerenciarem seus pacientes 
                de forma eficiente e oferecerem um atendimento personalizado
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="border-2 border-green-200 dark:border-green-800">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-3">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Relatórios Detalhados</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Acompanhe o progresso dos seus pacientes com relatórios completos e atualizados em tempo real.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Histórico completo de sessões e exercícios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Gráficos de evolução e métricas de ansiedade</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Análise de padrões e comportamentos</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 dark:border-green-800">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-3">
                    <Stethoscope className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Prescrição de Medicamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Envie prescrições médicas diretamente pelo sistema de forma segura e prática.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Formulário completo com dosagem e instruções</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Histórico de medicamentos prescritos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Notificações automáticas para o paciente</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 dark:border-green-800">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-3">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Chat Online em Tempo Real</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Mantenha contato direto com seus pacientes através de um sistema de mensagens instantâneas.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Comunicação instantânea e segura</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Histórico completo de conversas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Suporte a anexos e documentos</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 dark:border-green-800">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-3">
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Gestão de Pacientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Organize e gerencie todos os seus pacientes em um único lugar de forma eficiente.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Lista completa de pacientes cadastrados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Acesso rápido a informações e histórico</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Ações rápidas para cada paciente</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">Você é um profissional de saúde?</h3>
                    <p className="text-green-50">
                      Cadastre-se como doutor e tenha acesso a todas essas ferramentas para 
                      oferecer o melhor atendimento aos seus pacientes.
                    </p>
                  </div>
                  <Button 
                    size="lg"
                    variant="secondary"
                    className="bg-white text-green-600 hover:bg-green-50 px-8 py-6 text-lg whitespace-nowrap"
                    onClick={() => router.push('/login')}
                  >
                    <Stethoscope className="w-5 h-5 mr-2" />
                    Acessar Painel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">O Que Você Vai Conquistar</h2>
              <p className="text-lg text-muted-foreground">
                Resultados comprovados que transformam vidas
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Controle dos Sintomas</h3>
                  <p className="text-muted-foreground">
                    Aprenda técnicas eficazes para gerenciar e reduzir crises de ansiedade
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Vida Social Ativa</h3>
                  <p className="text-muted-foreground">
                    Recupere sua confiança para interagir socialmente sem medo
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Clareza Mental</h3>
                  <p className="text-muted-foreground">
                    Reduza pensamentos intrusivos e preocupações excessivas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Mais Energia</h3>
                  <p className="text-muted-foreground">
                    Durma melhor e acorde com mais disposição para o dia
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Autoconfiança</h3>
                  <p className="text-muted-foreground">
                    Desenvolva autoestima e segurança para enfrentar desafios
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Crescimento Contínuo</h3>
                  <p className="text-muted-foreground">
                    Acompanhe sua evolução com métricas e relatórios detalhados
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Histórias de Transformação</h2>
              <p className="text-lg text-muted-foreground">
                Veja o que nossos usuários têm a dizer
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "Consegui voltar a sair com amigos e participar de reuniões no trabalho sem medo. 
                    Em 3 meses, minha qualidade de vida mudou completamente!"
                  </p>
                  <div>
                    <p className="font-semibold">Maria Silva, 32 anos</p>
                    <p className="text-sm text-muted-foreground">Ansiedade Social</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "Os ataques de pânico diminuíram 80% em apenas 2 meses. 
                    As técnicas de respiração me salvaram em momentos críticos."
                  </p>
                  <div>
                    <p className="font-semibold">João Santos, 28 anos</p>
                    <p className="text-sm text-muted-foreground">Transtorno do Pânico</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "Finalmente consigo dormir bem e não fico mais ruminando preocupações o dia todo. 
                    O acompanhamento personalizado fez toda diferença."
                  </p>
                  <div>
                    <p className="font-semibold">Ana Costa, 45 anos</p>
                    <p className="text-sm text-muted-foreground">Ansiedade Generalizada</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "Voltei a ter vida social! Antes evitava qualquer evento, 
                    hoje consigo até fazer apresentações no trabalho."
                  </p>
                  <div>
                    <p className="font-semibold">Pedro Oliveira, 35 anos</p>
                    <p className="text-sm text-muted-foreground">Ansiedade Social</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-purple-200 shadow-2xl">
              <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle className="text-3xl mb-2">Comece Sua Transformação Hoje</CardTitle>
                <CardDescription className="text-purple-100 text-lg">
                  Faça a avaliação gratuita e descubra seu caminho para uma vida sem ansiedade
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="font-semibold">Avaliação Gratuita</p>
                    <p className="text-sm text-muted-foreground">Sem compromisso</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="font-semibold">Garantia de 7 dias</p>
                    <p className="text-sm text-muted-foreground">100% reembolso</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-2">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="font-semibold">Suporte 24/7</p>
                    <p className="text-sm text-muted-foreground">Sempre disponível</p>
                  </div>
                </div>

                <Button 
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-6"
                  onClick={() => router.push('/quiz')}
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Iniciar Avaliação Gratuita Agora
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  ✨ Junte-se a mais de 10.000 pessoas que já transformaram suas vidas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 ZentiaMind. Todos os direitos reservados.</p>
          <p className="mt-2">Este não é um substituto para tratamento médico profissional.</p>
        </div>
      </footer>
    </div>
  )
}
