"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Heart, Pill, Clock, Wind, Anchor, Phone, AlertTriangle, ShoppingCart, LogIn, Star, CheckCircle, Users, TrendingUp, Mail, MessageSquare, CheckSquare, Target, Dumbbell, Brain, Sparkles, LogOut, Trash2, ArrowRight, Shield, Zap, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

type AnxietyType = 'social' | 'panic' | 'general' | null

interface UserProfile {
  name: string
  email: string
  phone: string
  age: string
  gender: string
  city: string
  anxietyType: AnxietyType
  triageCompleted: boolean
  isPremium: boolean
}

interface TriageAnswer {
  question: string
  answer: number | string
}

interface Testimonial {
  name: string
  age: number
  anxietyType: string
  result: string
  rating: number
}

interface PurchaseNotification {
  id: string
  name: string
  city: string
  time: string
}

const triageQuestions = [
  // Dados Pessoais
  { id: 1, text: 'Qual é o seu nome completo?', category: 'personal', type: 'text' },
  { id: 2, text: 'Qual é o seu e-mail?', category: 'personal', type: 'email' },
  { id: 3, text: 'Qual é o seu telefone/WhatsApp?', category: 'personal', type: 'tel' },
  { id: 4, text: 'Qual é a sua idade?', category: 'personal', type: 'number' },
  { id: 5, text: 'Qual é o seu gênero?', category: 'personal', type: 'select', options: ['Masculino', 'Feminino', 'Não-binário', 'Prefiro não dizer'] },
  { id: 6, text: 'Em qual cidade você mora?', category: 'personal', type: 'text' },
  { id: 7, text: 'Você já foi diagnosticado com algum transtorno de ansiedade?', category: 'personal', type: 'select', options: ['Sim', 'Não', 'Não tenho certeza'] },
  { id: 8, text: 'Você está atualmente em tratamento psicológico ou psiquiátrico?', category: 'personal', type: 'select', options: ['Sim', 'Não', 'Já fiz no passado'] },
  
  // Perguntas sobre Ansiedade
  { id: 9, text: 'Com que frequência você se sente nervoso ou ansioso em situações sociais?', category: 'social', type: 'scale' },
  { id: 10, text: 'Você evita lugares ou situações por medo de ter um ataque de pânico?', category: 'panic', type: 'scale' },
  { id: 11, text: 'Você tem dificuldade em controlar suas preocupações?', category: 'general', type: 'scale' },
  { id: 12, text: 'Você sente medo de ser julgado por outras pessoas?', category: 'social', type: 'scale' },
  { id: 13, text: 'Você já teve episódios de coração acelerado, suor ou tremores repentinos?', category: 'panic', type: 'scale' },
  { id: 14, text: 'Você se preocupa excessivamente com várias coisas do dia a dia?', category: 'general', type: 'scale' },
  { id: 15, text: 'Você tem dificuldade para dormir devido a pensamentos ansiosos?', category: 'general', type: 'scale' },
  { id: 16, text: 'Você sente tensão muscular ou dores físicas relacionadas à ansiedade?', category: 'general', type: 'scale' },
  { id: 17, text: 'Você evita falar em público ou participar de reuniões?', category: 'social', type: 'scale' },
  { id: 18, text: 'Você já sentiu que ia desmaiar ou perder o controle durante um episódio de ansiedade?', category: 'panic', type: 'scale' },
  { id: 19, text: 'Você tem medo de lugares fechados ou multidões?', category: 'panic', type: 'scale' },
  { id: 20, text: 'Você se sente constantemente cansado ou esgotado mentalmente?', category: 'general', type: 'scale' },
  { id: 21, text: 'Você tem dificuldade em se concentrar nas tarefas diárias?', category: 'general', type: 'scale' },
  { id: 22, text: 'Você evita contato visual ou conversas com desconhecidos?', category: 'social', type: 'scale' },
  { id: 23, text: 'Você sente que precisa sempre estar em controle de tudo?', category: 'general', type: 'scale' },
  { id: 24, text: 'Com que frequência você sente sintomas físicos de ansiedade (náusea, tontura, falta de ar)?', category: 'panic', type: 'scale' },
  { id: 25, text: 'Você tem pensamentos intrusivos ou preocupações que não consegue controlar?', category: 'general', type: 'scale' },
]

const testimonials: Testimonial[] = [
  {
    name: 'Maria Silva',
    age: 32,
    anxietyType: 'Ansiedade Social',
    result: 'Consegui voltar a sair com amigos e participar de reuniões no trabalho sem medo. Em 3 meses, minha qualidade de vida mudou completamente!',
    rating: 5
  },
  {
    name: 'João Santos',
    age: 28,
    anxietyType: 'Transtorno do Pânico',
    result: 'Os ataques de pânico diminuíram 80% em apenas 2 meses. As técnicas de respiração me salvaram em momentos críticos.',
    rating: 5
  },
  {
    name: 'Ana Costa',
    age: 45,
    anxietyType: 'Ansiedade Generalizada',
    result: 'Finalmente consigo dormir bem e não fico mais ruminando preocupações o dia todo. O acompanhamento personalizado fez toda diferença.',
    rating: 5
  },
  {
    name: 'Pedro Oliveira',
    age: 35,
    anxietyType: 'Ansiedade Social',
    result: 'Voltei a ter vida social! Antes evitava qualquer evento, hoje consigo até fazer apresentações no trabalho.',
    rating: 5
  },
  {
    name: 'Carla Mendes',
    age: 29,
    anxietyType: 'Transtorno do Pânico',
    result: 'Não tomo mais medicação de emergência. Aprendi a controlar os sintomas antes que se tornem um ataque completo.',
    rating: 5
  }
]

const purchaseNotifications: PurchaseNotification[] = [
  { id: '1', name: 'Juliana M.', city: 'São Paulo - SP', time: '2 minutos atrás' },
  { id: '2', name: 'Roberto S.', city: 'Rio de Janeiro - RJ', time: '5 minutos atrás' },
  { id: '3', name: 'Fernanda L.', city: 'Belo Horizonte - MG', time: '8 minutos atrás' },
  { id: '4', name: 'Carlos P.', city: 'Curitiba - PR', time: '12 minutos atrás' },
  { id: '5', name: 'Patrícia R.', city: 'Porto Alegre - RS', time: '15 minutos atrás' },
  { id: '6', name: 'Lucas M.', city: 'Brasília - DF', time: '18 minutos atrás' },
]

export default function AnxietyApp() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<TriageAnswer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState<string | number>('')
  const [showResult, setShowResult] = useState(false)
  const [anxietyType, setAnxietyType] = useState<AnxietyType>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [currentNotification, setCurrentNotification] = useState(0)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setShowNotification(true)
      setCurrentNotification((prev) => (prev + 1) % purchaseNotifications.length)
      setTimeout(() => setShowNotification(false), 5000)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const handleAnswer = () => {
    const question = triageQuestions[currentStep]
    setAnswers([...answers, { question: question.text, answer: currentAnswer }])
    
    if (currentStep < triageQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
      setCurrentAnswer('')
    } else {
      calculateResult()
    }
  }

  const calculateResult = () => {
    const scores = {
      social: 0,
      panic: 0,
      general: 0
    }

    answers.forEach((answer, index) => {
      const question = triageQuestions[index]
      if (question.category !== 'personal' && typeof answer.answer === 'number') {
        scores[question.category as keyof typeof scores] += answer.answer
      }
    })

    const maxScore = Math.max(scores.social, scores.panic, scores.general)
    let detectedType: AnxietyType = 'general'
    
    if (maxScore === scores.social) detectedType = 'social'
    else if (maxScore === scores.panic) detectedType = 'panic'
    else detectedType = 'general'

    setAnxietyType(detectedType)
    
    const profile: UserProfile = {
      name: answers[0].answer as string,
      email: answers[1].answer as string,
      phone: answers[2].answer as string,
      age: answers[3].answer as string,
      gender: answers[4].answer as string,
      city: answers[5].answer as string,
      anxietyType: detectedType,
      triageCompleted: true,
      isPremium: false
    }
    
    setUserProfile(profile)
    setShowResult(true)
  }

  const handleHotmartCheckout = () => {
    // Redireciona para o link de checkout da Hotmart
    window.open('https://pay.hotmart.com/P103056552X?sck=HOTMART_PRODUCT_PAGE&off=xfu3cyhr&hotfeature=32&_gl=1*1m9tg0l*_ga*MTE0NzcyODYwNS4xNzYzNzE3MDM5*_ga_GQH2V1F11Q*czE3NjM3MTcwMzckbzEkZzEkdDE3NjM3MjA1MzQkajYwJGwwJGgw*_gcl_au*MTI0NDM4ODg1MC4xNzYzNzE3MDM5LjE1Mzg3OTcyMDMuMTc2MzcxNzA4MS4xNzYzNzIwMzY1*FPAU*MTI0NDM4ODg1MC4xNzYzNzE3MDM5&bid=1763720540240', '_blank')
  }

  const getAnxietyTypeInfo = (type: AnxietyType) => {
    switch (type) {
      case 'social':
        return {
          title: 'Ansiedade Social',
          description: 'Você apresenta sinais de ansiedade social, caracterizada por medo intenso de situações sociais e julgamento.',
          icon: Users,
          color: 'from-blue-500 to-cyan-500'
        }
      case 'panic':
        return {
          title: 'Transtorno do Pânico',
          description: 'Você apresenta sinais de transtorno do pânico, com episódios súbitos de medo intenso e sintomas físicos.',
          icon: AlertCircle,
          color: 'from-red-500 to-pink-500'
        }
      case 'general':
        return {
          title: 'Ansiedade Generalizada',
          description: 'Você apresenta sinais de ansiedade generalizada, com preocupações excessivas sobre diversos aspectos da vida.',
          icon: Brain,
          color: 'from-purple-500 to-indigo-500'
        }
      default:
        return {
          title: 'Avaliação Incompleta',
          description: 'Complete a triagem para receber seu diagnóstico.',
          icon: AlertCircle,
          color: 'from-gray-500 to-gray-600'
        }
    }
  }

  const renderQuestion = () => {
    const question = triageQuestions[currentStep]
    
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Pergunta {currentStep + 1} de {triageQuestions.length}
            </span>
            <span className="text-sm font-medium text-purple-600">
              {Math.round(((currentStep + 1) / triageQuestions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / triageQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        <h3 className="text-xl font-semibold">{question.text}</h3>

        {question.type === 'text' && (
          <Input
            type="text"
            value={currentAnswer as string}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Digite sua resposta"
            className="w-full"
          />
        )}

        {question.type === 'email' && (
          <Input
            type="email"
            value={currentAnswer as string}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="seu@email.com"
            className="w-full"
          />
        )}

        {question.type === 'tel' && (
          <Input
            type="tel"
            value={currentAnswer as string}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="(00) 00000-0000"
            className="w-full"
          />
        )}

        {question.type === 'number' && (
          <Input
            type="number"
            value={currentAnswer as string}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Digite sua idade"
            className="w-full"
          />
        )}

        {question.type === 'select' && (
          <RadioGroup value={currentAnswer as string} onValueChange={setCurrentAnswer}>
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className="flex-1 cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === 'scale' && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Nunca</span>
              <span>Sempre</span>
            </div>
            <RadioGroup value={currentAnswer.toString()} onValueChange={(val) => setCurrentAnswer(parseInt(val))}>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center">
                    <RadioGroupItem value={value.toString()} id={`scale-${value}`} className="mb-2" />
                    <Label htmlFor={`scale-${value}`} className="text-xs cursor-pointer">{value}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep(currentStep - 1)
                setCurrentAnswer(answers[currentStep - 1]?.answer || '')
              }}
              className="flex-1"
            >
              Voltar
            </Button>
          )}
          <Button
            onClick={handleAnswer}
            disabled={!currentAnswer}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {currentStep === triageQuestions.length - 1 ? 'Finalizar' : 'Próxima'}
          </Button>
        </div>
      </div>
    )
  }

  const renderResult = () => {
    if (!anxietyType || !userProfile) return null
    
    const info = getAnxietyTypeInfo(anxietyType)
    const Icon = info.icon

    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${info.color} rounded-full flex items-center justify-center`}>
            <Icon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold">{info.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{info.description}</p>
        </div>

        <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
          <AlertCircle className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-900 dark:text-purple-100">
            <strong>Olá, {userProfile.name}!</strong> Baseado nas suas respostas, identificamos padrões de {info.title.toLowerCase()}. 
            Nosso programa personalizado pode ajudá-lo(a) a gerenciar esses sintomas de forma eficaz.
          </AlertDescription>
        </Alert>

        <Card className="border-2 border-purple-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardTitle className="text-2xl">Plano de Tratamento Personalizado</CardTitle>
            <CardDescription className="text-purple-100">
              Desenvolvido especialmente para {info.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Exercícios Personalizados</h4>
                  <p className="text-sm text-muted-foreground">Técnicas específicas para seu tipo de ansiedade</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Brain className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">TCC Guiada</h4>
                  <p className="text-sm text-muted-foreground">Terapia Cognitivo-Comportamental adaptada</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <Target className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Metas Progressivas</h4>
                  <p className="text-sm text-muted-foreground">Acompanhamento do seu progresso diário</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Suporte 24/7</h4>
                  <p className="text-sm text-muted-foreground">Assistente virtual sempre disponível</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground line-through">De R$ 197,00</p>
                  <p className="text-3xl font-bold text-green-600">R$ 97,00</p>
                  <p className="text-sm text-muted-foreground">Oferta por tempo limitado</p>
                </div>
                <div className="text-right">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-2">
                    50% OFF
                  </div>
                  <p className="text-xs text-muted-foreground">Apenas hoje</p>
                </div>
              </div>

              <Button 
                onClick={handleHotmartCheckout}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg py-6"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Começar Tratamento Agora
              </Button>

              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Garantia de 7 dias - Satisfação garantida</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">+10.000</p>
              <p className="text-sm text-muted-foreground">Pessoas tratadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">87%</p>
              <p className="text-sm text-muted-foreground">Taxa de melhora</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold">4.9/5</p>
              <p className="text-sm text-muted-foreground">Avaliação média</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Depoimentos de Quem Já Superou</CardTitle>
            <CardDescription>Veja os resultados reais de pessoas como você</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{testimonial.name}, {testimonial.age} anos</p>
                    <p className="text-sm text-muted-foreground">{testimonial.anxietyType}</p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm">{testimonial.result}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Purchase Notification */}
      {showNotification && (
        <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-left">
          <Card className="w-80 shadow-2xl border-green-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{purchaseNotifications[currentNotification].name}</p>
                  <p className="text-xs text-muted-foreground">{purchaseNotifications[currentNotification].city}</p>
                  <p className="text-xs text-green-600 mt-1">Acabou de adquirir o tratamento</p>
                  <p className="text-xs text-muted-foreground">{purchaseNotifications[currentNotification].time}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
              <Button variant="outline" className="gap-2">
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Suporte</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!showResult ? (
          <Card className="shadow-2xl">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl md:text-3xl">Avaliação Gratuita de Ansiedade</CardTitle>
              <CardDescription className="text-base">
                Responda às perguntas abaixo para receber um diagnóstico personalizado e um plano de tratamento específico para você
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {renderQuestion()}
            </CardContent>
          </Card>
        ) : (
          renderResult()
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 ZentiaMind. Todos os direitos reservados.</p>
          <p className="mt-2">Este não é um substituto para tratamento médico profissional.</p>
        </div>
      </footer>
    </div>
  )
}
