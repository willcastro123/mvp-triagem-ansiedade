"use client"

import { useState, useEffect } from 'react'
import { AlertCircle, Heart, Pill, Clock, Wind, Anchor, Phone, AlertTriangle, ShoppingCart, LogIn, Star, CheckCircle, Users, TrendingUp, Mail, MessageSquare, CheckSquare, Target, Dumbbell, Brain, Sparkles, LogOut, Trash2, ArrowRight, Shield, Zap, Award, Play, Pause, BookOpen, FileText, Video, TrendingDown, Calendar, BarChart3, Trophy, Send, Bot, Volume2, VolumeX, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'

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
  password?: string
  points: number
}

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  time: string
  notes: string
  interactions: string[]
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

interface Habit {
  id: string
  title: string
  description: string
  completed: boolean
  streak: number
  selectedDays: string[]
}

interface Task {
  id: string
  title: string
  completed: boolean
  dueDate: string
}

interface Exercise {
  id: string
  title: string
  description: string
  duration: string
  category: 'breathing' | 'meditation' | 'grounding' | 'movement'
  steps?: string[]
}

interface CognitiveDistortion {
  id: string
  name: string
  description: string
  example: string
  completed: boolean
}

interface ThoughtChallenge {
  id: string
  date: string
  situation: string
  negativeThought: string
  emotion: string
  intensity: number
  evidenceFor: string
  evidenceAgainst: string
  alternativeThought: string
}

interface ExposureStep {
  id: string
  description: string
  anxietyLevel: number
  completed: boolean
  date?: string
}

interface MoodEntry {
  id: string
  date: string
  time: string
  mood: string
  anxietyLevel: number
  stressLevel: number
  triggers: string[]
  location: string
  people: string
  situation: string
  notes: string
}

interface Article {
  id: string
  title: string
  category: string
  content: string
  readTime: string
  read: boolean
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
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

const medicationInteractions = {
  'Alprazolam': ['Álcool', 'Opioides', 'Antidepressivos'],
  'Clonazepam': ['Álcool', 'Sedativos', 'Anticonvulsivantes'],
  'Sertralina': ['IMAO', 'Anticoagulantes', 'AINEs'],
  'Escitalopram': ['IMAO', 'Tramadol', 'Triptanos'],
  'Fluoxetina': ['IMAO', 'Anticoagulantes', 'Lítio'],
}

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

const anxietyExercises: Exercise[] = [
  {
    id: '1',
    title: 'Respiração 4-7-8',
    description: 'Inspire por 4 segundos, segure por 7, expire por 8. Repita 4 vezes.',
    duration: '5 min',
    category: 'breathing'
  },
  {
    id: '2',
    title: 'Meditação Guiada',
    description: 'Foque na sua respiração e observe seus pensamentos sem julgamento.',
    duration: '10 min',
    category: 'meditation'
  },
  {
    id: '3',
    title: 'Técnica 5-4-3-2-1',
    description: 'Identifique 5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que saboreia.',
    duration: '3 min',
    category: 'grounding'
  },
  {
    id: '4',
    title: 'Caminhada Consciente',
    description: 'Caminhe lentamente prestando atenção em cada passo e sensação.',
    duration: '15 min',
    category: 'movement'
  },
  {
    id: '5',
    title: 'Relaxamento Muscular Progressivo',
    description: 'Tensione e relaxe cada grupo muscular do corpo, dos pés à cabeça.',
    duration: '12 min',
    category: 'movement',
    steps: [
      'Pés e panturrilhas (2 min)',
      'Coxas e glúteos (2 min)',
      'Abdômen e lombar (2 min)',
      'Peito e ombros (2 min)',
      'Braços e mãos (2 min)',
      'Pescoço e rosto (2 min)'
    ]
  },
  {
    id: '6',
    title: 'Respiração Quadrada',
    description: 'Inspire 4s, segure 4s, expire 4s, segure 4s. Visualize um quadrado.',
    duration: '5 min',
    category: 'breathing'
  }
]

const defaultHabits: Habit[] = [
  {
    id: '1',
    title: 'Meditação matinal',
    description: 'Pratique 10 minutos de meditação ao acordar',
    completed: false,
    streak: 0,
    selectedDays: []
  },
  {
    id: '2',
    title: 'Exercício físico',
    description: 'Faça pelo menos 30 minutos de atividade física',
    completed: false,
    streak: 0,
    selectedDays: []
  },
  {
    id: '3',
    title: 'Diário de gratidão',
    description: 'Escreva 3 coisas pelas quais você é grato hoje',
    completed: false,
    streak: 0,
    selectedDays: []
  },
  {
    id: '4',
    title: 'Técnica de respiração',
    description: 'Pratique exercícios de respiração 2x ao dia',
    completed: false,
    streak: 0,
    selectedDays: []
  },
  {
    id: '5',
    title: 'Limite de telas',
    description: 'Evite telas 1 hora antes de dormir',
    completed: false,
    streak: 0,
    selectedDays: []
  }
]

const cognitiveDistortions: CognitiveDistortion[] = [
  {
    id: '1',
    name: 'Catastrofização',
    description: 'Imaginar o pior cenário possível sem evidências',
    example: '"Se eu errar na apresentação, vou ser demitido e perder tudo"',
    completed: false
  },
  {
    id: '2',
    name: 'Pensamento Dicotômico',
    description: 'Ver as coisas como tudo ou nada, preto ou branco',
    example: '"Se não for perfeito, é um fracasso total"',
    completed: false
  },
  {
    id: '3',
    name: 'Leitura Mental',
    description: 'Assumir que sabe o que os outros estão pensando',
    example: '"Ele acha que sou incompetente"',
    completed: false
  },
  {
    id: '4',
    name: 'Generalização Excessiva',
    description: 'Tirar conclusões amplas baseadas em um único evento',
    example: '"Sempre dá errado comigo"',
    completed: false
  },
  {
    id: '5',
    name: 'Filtro Mental',
    description: 'Focar apenas nos aspectos negativos ignorando os positivos',
    example: '"Recebi 9 elogios e 1 crítica, só penso na crítica"',
    completed: false
  },
  {
    id: '6',
    name: 'Desqualificação do Positivo',
    description: 'Rejeitar experiências positivas dizendo que não contam',
    example: '"Foi sorte, não foi mérito meu"',
    completed: false
  },
  {
    id: '7',
    name: 'Rotulação',
    description: 'Atribuir rótulos negativos globais a si mesmo ou outros',
    example: '"Sou um fracassado" em vez de "Cometi um erro"',
    completed: false
  },
  {
    id: '8',
    name: 'Personalização',
    description: 'Assumir responsabilidade por eventos externos',
    example: '"A reunião foi ruim por minha culpa"',
    completed: false
  },
  {
    id: '9',
    name: 'Raciocínio Emocional',
    description: 'Acreditar que sentimentos refletem a realidade',
    example: '"Me sinto incompetente, logo sou incompetente"',
    completed: false
  },
  {
    id: '10',
    name: 'Imperativos (Deveria)',
    description: 'Usar "deveria", "tenho que" criando pressão excessiva',
    example: '"Eu deveria ser sempre produtivo"',
    completed: false
  }
]

const educationalArticles: Article[] = [
  {
    id: '1',
    title: 'A Neurociência da Ansiedade',
    category: 'Ciência',
    content: 'A ansiedade envolve a amígdala (centro do medo) e o córtex pré-frontal (tomada de decisão). Quando a amígdala detecta ameaça, ativa a resposta de luta ou fuga. Técnicas de TCC ajudam a fortalecer o córtex pré-frontal para regular melhor essas respostas.',
    readTime: '5 min',
    read: false
  },
  {
    id: '2',
    title: 'O Ciclo do Estresse',
    category: 'Educação',
    content: 'O estresse crônico mantém o corpo em estado de alerta constante. Isso eleva cortisol, prejudica o sono, enfraquece o sistema imunológico e pode levar à ansiedade generalizada. Quebrar esse ciclo requer técnicas de relaxamento diárias.',
    readTime: '4 min',
    read: false
  },
  {
    id: '3',
    title: 'Sono e Saúde Mental',
    category: 'Bem-estar',
    content: 'A privação de sono aumenta a atividade da amígdala em até 60%, intensificando reações emocionais. Dormir 7-9 horas por noite é essencial para regular ansiedade. Estabeleça rotina de sono consistente e evite telas 1h antes de dormir.',
    readTime: '6 min',
    read: false
  },
  {
    id: '4',
    title: 'Nutrição e Ansiedade',
    category: 'Saúde',
    content: 'Alimentos ricos em ômega-3, magnésio e vitaminas do complexo B ajudam a regular neurotransmissores. Evite excesso de cafeína e açúcar que podem aumentar sintomas de ansiedade. Hidratação adequada também é crucial.',
    readTime: '5 min',
    read: false
  },
  {
    id: '5',
    title: 'Exercício Físico como Tratamento',
    category: 'Movimento',
    content: 'Exercícios aeróbicos liberam endorfinas e reduzem cortisol. Apenas 30 minutos de caminhada 3x por semana podem reduzir sintomas de ansiedade em até 40%. O exercício também melhora qualidade do sono e autoestima.',
    readTime: '4 min',
    read: false
  }
]

export default function AnxietyApp() {
  const [currentView, setCurrentView] = useState<'welcome' | 'triage' | 'results' | 'dashboard' | 'login'>('welcome')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [medications, setMedications] = useState<Medication[]>([])
  const [habits, setHabits] = useState<Habit[]>(defaultHabits)
  const [tasks, setTasks] = useState<Task[]>([])
  const [triageStep, setTriageStep] = useState(0)
  const [triageAnswers, setTriageAnswers] = useState<TriageAnswer[]>([])
  const [showCrisisModal, setShowCrisisModal] = useState(false)
  const [breathingActive, setBreathingActive] = useState(false)
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [showMedicationForm, setShowMedicationForm] = useState(false)
  const [currentNotification, setCurrentNotification] = useState(0)
  const [showNotification, setShowNotification] = useState(false)
  const [showExitIntent, setShowExitIntent] = useState(false)
  const [emailReminders, setEmailReminders] = useState(true)
  const [smsReminders, setSmsReminders] = useState(false)
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null)
  const [exerciseRunning, setExerciseRunning] = useState(false)
  const [exerciseTimer, setExerciseTimer] = useState(0)
  const [exercisePhase, setExercisePhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale')
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [exerciseFeedback, setExerciseFeedback] = useState('')
  const [exerciseFeeling, setExerciseFeeling] = useState('')
  
  // TCC States
  const [distortions, setDistortions] = useState<CognitiveDistortion[]>(cognitiveDistortions)
  const [thoughtChallenges, setThoughtChallenges] = useState<ThoughtChallenge[]>([])
  const [exposureSteps, setExposureSteps] = useState<ExposureStep[]>([])
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [showThoughtForm, setShowThoughtForm] = useState(false)
  const [showMoodForm, setShowMoodForm] = useState(false)
  const [showExposureForm, setShowExposureForm] = useState(false)

  // AI Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isAITyping, setIsAITyping] = useState(false)

  // Articles States
  const [articles, setArticles] = useState<Article[]>(educationalArticles)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showArticleReader, setShowArticleReader] = useState(false)

  // Habit Selection States
  const [showHabitDaySelector, setShowHabitDaySelector] = useState(false)
  const [selectedHabitForDays, setSelectedHabitForDays] = useState<Habit | null>(null)

  // Load data from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile')
    const savedMedications = localStorage.getItem('medications')
    const savedHabits = localStorage.getItem('habits')
    const savedTasks = localStorage.getItem('tasks')
    const savedDistortions = localStorage.getItem('distortions')
    const savedThoughtChallenges = localStorage.getItem('thoughtChallenges')
    const savedExposureSteps = localStorage.getItem('exposureSteps')
    const savedMoodEntries = localStorage.getItem('moodEntries')
    const savedChatMessages = localStorage.getItem('chatMessages')
    const savedArticles = localStorage.getItem('articles')
    
    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      setUserProfile(profile)
      if (profile.triageCompleted && profile.isPremium) {
        setCurrentView('dashboard')
      }
    }
    
    if (savedMedications) setMedications(JSON.parse(savedMedications))
    if (savedHabits) setHabits(JSON.parse(savedHabits))
    if (savedTasks) setTasks(JSON.parse(savedTasks))
    if (savedDistortions) setDistortions(JSON.parse(savedDistortions))
    if (savedThoughtChallenges) setThoughtChallenges(JSON.parse(savedThoughtChallenges))
    if (savedExposureSteps) setExposureSteps(JSON.parse(savedExposureSteps))
    if (savedMoodEntries) setMoodEntries(JSON.parse(savedMoodEntries))
    if (savedChatMessages) setChatMessages(JSON.parse(savedChatMessages))
    if (savedArticles) setArticles(JSON.parse(savedArticles))
  }, [])

  // Save data to localStorage
  useEffect(() => {
    if (userProfile) localStorage.setItem('userProfile', JSON.stringify(userProfile))
  }, [userProfile])

  useEffect(() => {
    localStorage.setItem('medications', JSON.stringify(medications))
  }, [medications])

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits))
  }, [habits])

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('distortions', JSON.stringify(distortions))
  }, [distortions])

  useEffect(() => {
    localStorage.setItem('thoughtChallenges', JSON.stringify(thoughtChallenges))
  }, [thoughtChallenges])

  useEffect(() => {
    localStorage.setItem('exposureSteps', JSON.stringify(exposureSteps))
  }, [exposureSteps])

  useEffect(() => {
    localStorage.setItem('moodEntries', JSON.stringify(moodEntries))
  }, [moodEntries])

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages))
  }, [chatMessages])

  useEffect(() => {
    localStorage.setItem('articles', JSON.stringify(articles))
  }, [articles])

  // Purchase notifications rotation
  useEffect(() => {
    if (currentView === 'triage' || currentView === 'results') {
      const interval = setInterval(() => {
        setShowNotification(true)
        setCurrentNotification((prev) => (prev + 1) % purchaseNotifications.length)
        
        setTimeout(() => {
          setShowNotification(false)
        }, 5000)
      }, 15000)

      return () => clearInterval(interval)
    }
  }, [currentView])

  // Exit intent detection
  useEffect(() => {
    if (currentView === 'triage' || currentView === 'results') {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          setShowExitIntent(true)
        }
      }

      document.addEventListener('mouseleave', handleMouseLeave)
      return () => document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [currentView])

  // Breathing exercise timer
  useEffect(() => {
    if (!breathingActive) return

    const phases = [
      { phase: 'inhale' as const, duration: 4000 },
      { phase: 'hold' as const, duration: 4000 },
      { phase: 'exhale' as const, duration: 6000 },
    ]

    let currentPhaseIndex = 0
    
    const timer = setInterval(() => {
      currentPhaseIndex = (currentPhaseIndex + 1) % phases.length
      setBreathingPhase(phases[currentPhaseIndex].phase)
    }, phases[currentPhaseIndex].duration)

    return () => clearInterval(timer)
  }, [breathingActive, breathingPhase])

  // Exercise timer
  useEffect(() => {
    if (!exerciseRunning || !activeExercise) return

    const interval = setInterval(() => {
      setExerciseTimer((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [exerciseRunning, activeExercise])

  // Exercise breathing phases
  useEffect(() => {
    if (!exerciseRunning || !activeExercise || activeExercise.category !== 'breathing') return

    const phases: Array<{ phase: 'inhale' | 'hold' | 'exhale' | 'rest', duration: number }> = 
      activeExercise.id === '1' 
        ? [
            { phase: 'inhale', duration: 4000 },
            { phase: 'hold', duration: 7000 },
            { phase: 'exhale', duration: 8000 },
          ]
        : [
            { phase: 'inhale', duration: 4000 },
            { phase: 'hold', duration: 4000 },
            { phase: 'exhale', duration: 4000 },
            { phase: 'hold', duration: 4000 },
          ]

    let currentPhaseIndex = 0
    
    const timer = setInterval(() => {
      currentPhaseIndex = (currentPhaseIndex + 1) % phases.length
      setExercisePhase(phases[currentPhaseIndex].phase)
    }, phases[currentPhaseIndex].duration)

    return () => clearInterval(timer)
  }, [exerciseRunning, activeExercise, exercisePhase])

  // Relaxamento Muscular timer
  useEffect(() => {
    if (!exerciseRunning || !activeExercise || activeExercise.id !== '5') return

    const stepDuration = 120 // 2 minutos por etapa
    const interval = setInterval(() => {
      const currentStep = Math.floor(exerciseTimer / stepDuration)
      if (currentStep !== currentStepIndex && currentStep < (activeExercise.steps?.length || 0)) {
        setCurrentStepIndex(currentStep)
        if (soundEnabled) {
          // Som de notificação (simulado)
          console.log('🔔 Próxima etapa!')
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [exerciseRunning, activeExercise, exerciseTimer, currentStepIndex, soundEnabled])

  const startTriage = () => {
    setCurrentView('triage')
  }

  const handleTriageAnswer = (answer: number | string) => {
    const currentQuestion = triageQuestions[triageStep]
    const newAnswers = [...triageAnswers, { question: currentQuestion.text, answer }]
    setTriageAnswers(newAnswers)

    // Save personal data to profile
    if (currentQuestion.category === 'personal') {
      if (currentQuestion.id === 1) {
        setUserProfile(prev => prev ? { ...prev, name: answer as string } : {
          name: answer as string,
          email: '',
          phone: '',
          age: '',
          gender: '',
          city: '',
          anxietyType: null,
          triageCompleted: false,
          isPremium: false,
          points: 0
        })
      } else if (currentQuestion.id === 2) {
        setUserProfile(prev => prev ? { ...prev, email: answer as string } : null)
      } else if (currentQuestion.id === 3) {
        setUserProfile(prev => prev ? { ...prev, phone: answer as string } : null)
      } else if (currentQuestion.id === 4) {
        setUserProfile(prev => prev ? { ...prev, age: answer as string } : null)
      } else if (currentQuestion.id === 5) {
        setUserProfile(prev => prev ? { ...prev, gender: answer as string } : null)
      } else if (currentQuestion.id === 6) {
        setUserProfile(prev => prev ? { ...prev, city: answer as string } : null)
      }
    }

    if (triageStep < triageQuestions.length - 1) {
      setTriageStep(triageStep + 1)
    } else {
      // Calculate anxiety type based on answers
      const scores = { social: 0, panic: 0, general: 0 }
      newAnswers.forEach((ans, idx) => {
        const question = triageQuestions[idx]
        if (question.type === 'scale' && typeof ans.answer === 'number') {
          const category = question.category as keyof typeof scores
          if (category in scores) {
            scores[category] += ans.answer
          }
        }
      })

      const maxScore = Math.max(scores.social, scores.panic, scores.general)
      let detectedType: AnxietyType = 'general'
      
      if (scores.social === maxScore) detectedType = 'social'
      else if (scores.panic === maxScore) detectedType = 'panic'

      setUserProfile(prev => prev ? { ...prev, anxietyType: detectedType, triageCompleted: true } : null)
      setCurrentView('results')
    }
  }

  const handlePurchase = () => {
    // Generate random password
    const password = Math.random().toString(36).slice(-8)
    
    // Simulate purchase and send email
    setUserProfile(prev => prev ? { ...prev, isPremium: true, password } : null)
    
    // Simulate email sending
    if (userProfile?.email) {
      console.log(`📧 Email enviado para ${userProfile.email}`)
      console.log(`Assunto: Bem-vindo ao ZentiaMind Premium!`)
      console.log(`Suas credenciais de acesso:`)
      console.log(`Email: ${userProfile.email}`)
      console.log(`Senha: ${password}`)
      
      alert(`✅ Compra realizada com sucesso!\n\n📧 Enviamos um email para ${userProfile.email} com suas credenciais de acesso:\n\nEmail: ${userProfile.email}\nSenha: ${password}\n\nGuarde essas informações em local seguro!`)
    }
    
    setCurrentView('dashboard')
  }

  const handleLogin = (email: string, password: string) => {
    // Simulate login - in production, validate credentials
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      if (profile.email === email && profile.password === password && profile.isPremium) {
        setUserProfile(profile)
        setCurrentView('dashboard')
      } else if (!profile.isPremium) {
        alert('Usuário não possui acesso premium. Por favor, adquira o produto.')
      } else {
        alert('Email ou senha incorretos.')
      }
    } else {
      alert('Usuário não encontrado. Por favor, complete a triagem primeiro.')
    }
  }

  const handleLogout = () => {
    if (confirm('Deseja realmente sair da sua conta?')) {
      setCurrentView('welcome')
    }
  }

  const handleDeleteAccount = () => {
    if (confirm('⚠️ ATENÇÃO: Esta ação é irreversível!\n\nDeseja realmente apagar sua conta e todos os seus dados?\n\nIsso incluirá:\n- Perfil e informações pessoais\n- Histórico de triagem\n- Medicações registradas\n- Hábitos e tarefas\n- Acesso premium')) {
      // Clear all data
      localStorage.removeItem('userProfile')
      localStorage.removeItem('medications')
      localStorage.removeItem('habits')
      localStorage.removeItem('tasks')
      localStorage.removeItem('distortions')
      localStorage.removeItem('thoughtChallenges')
      localStorage.removeItem('exposureSteps')
      localStorage.removeItem('moodEntries')
      localStorage.removeItem('chatMessages')
      localStorage.removeItem('articles')
      
      setUserProfile(null)
      setMedications([])
      setHabits(defaultHabits)
      setTasks([])
      setDistortions(cognitiveDistortions)
      setThoughtChallenges([])
      setExposureSteps([])
      setMoodEntries([])
      setChatMessages([])
      setArticles(educationalArticles)
      setTriageAnswers([])
      setTriageStep(0)
      setCurrentView('welcome')
      
      alert('✅ Conta apagada com sucesso. Todos os seus dados foram removidos.')
    }
  }

  const handleCancelSubscription = () => {
    if (confirm('Deseja realmente cancelar sua assinatura premium?\n\nVocê perderá acesso a:\n- Exercícios personalizados\n- Gerenciamento de medicações\n- Hábitos e tarefas\n- Suporte prioritário')) {
      setUserProfile(prev => prev ? { ...prev, isPremium: false } : null)
      alert('✅ Assinatura cancelada com sucesso.\n\nVocê ainda pode acessar o app até o fim do período pago.')
    }
  }

  const addMedication = (med: Omit<Medication, 'id'>) => {
    const newMed = { ...med, id: Date.now().toString() }
    setMedications([...medications, newMed])
    setShowMedicationForm(false)
  }

  const deleteMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id))
  }

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => {
      if (h.id === id) {
        const newCompleted = !h.completed
        return {
          ...h,
          completed: newCompleted,
          streak: newCompleted ? h.streak + 1 : 0
        }
      }
      return h
    }))

    // Simulate reminder
    if (emailReminders || smsReminders) {
      const habit = habits.find(h => h.id === id)
      if (habit && !habit.completed) {
        console.log(`📧 Lembrete enviado: "${habit.title}" foi marcado como concluído!`)
      }
    }
  }

  const openHabitDaySelector = (habit: Habit) => {
    setSelectedHabitForDays(habit)
    setShowHabitDaySelector(true)
  }

  const saveHabitDays = (days: string[]) => {
    if (selectedHabitForDays) {
      setHabits(habits.map(h => 
        h.id === selectedHabitForDays.id 
          ? { ...h, selectedDays: days }
          : h
      ))
    }
    setShowHabitDaySelector(false)
    setSelectedHabitForDays(null)
  }

  const addTask = (title: string, dueDate: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      dueDate
    }
    setTasks([...tasks, newTask])
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const newCompleted = !t.completed
        if (newCompleted) {
          setUserProfile(prev => prev ? { ...prev, points: prev.points + 5 } : null)
        }
        return { ...t, completed: newCompleted }
      }
      return t
    }))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const startExercise = (exercise: Exercise) => {
    setActiveExercise(exercise)
    setExerciseRunning(true)
    setExerciseTimer(0)
    setExercisePhase('inhale')
    setCurrentStepIndex(0)
    setCompletedSteps(exercise.steps ? new Array(exercise.steps.length).fill(false) : [])
    setExerciseFeedback('')
    setExerciseFeeling('')
  }

  const stopExercise = () => {
    if (activeExercise?.id === '5' && exerciseFeedback && exerciseFeeling) {
      // Soma pontos apenas ao finalizar com feedback
      setUserProfile(prev => prev ? { ...prev, points: prev.points + 15 } : null)
    } else if (activeExercise?.id !== '5') {
      setUserProfile(prev => prev ? { ...prev, points: prev.points + 15 } : null)
    }
    
    setExerciseRunning(false)
    setActiveExercise(null)
    setExerciseTimer(0)
    setCurrentStepIndex(0)
    setCompletedSteps([])
    setExerciseFeedback('')
    setExerciseFeeling('')
  }

  const toggleStepCompletion = (index: number) => {
    setCompletedSteps(prev => {
      const newSteps = [...prev]
      newSteps[index] = !newSteps[index]
      return newSteps
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getAnxietyTypeLabel = (type: AnxietyType) => {
    switch (type) {
      case 'social': return 'Ansiedade Social'
      case 'panic': return 'Transtorno do Pânico'
      case 'general': return 'Ansiedade Generalizada'
      default: return 'Não identificado'
    }
  }

  const toggleDistortion = (id: string) => {
    setDistortions(distortions.map(d => {
      if (d.id === id) {
        const newCompleted = !d.completed
        if (newCompleted) {
          setUserProfile(prev => prev ? { ...prev, points: prev.points + 20 } : null)
        }
        return { ...d, completed: newCompleted }
      }
      return d
    }))
  }

  const addThoughtChallenge = (challenge: Omit<ThoughtChallenge, 'id' | 'date'>) => {
    const newChallenge: ThoughtChallenge = {
      ...challenge,
      id: Date.now().toString(),
      date: new Date().toISOString()
    }
    setThoughtChallenges([newChallenge, ...thoughtChallenges])
    setShowThoughtForm(false)
    setUserProfile(prev => prev ? { ...prev, points: prev.points + 30 } : null)
  }

  const addMoodEntry = (entry: Omit<MoodEntry, 'id' | 'date' | 'time'>) => {
    const now = new Date()
    const newEntry: MoodEntry = {
      ...entry,
      id: Date.now().toString(),
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].substring(0, 5)
    }
    setMoodEntries([newEntry, ...moodEntries])
    setShowMoodForm(false)
    setUserProfile(prev => prev ? { ...prev, points: prev.points + 10 } : null)
  }

  const addExposureStep = (description: string, anxietyLevel: number) => {
    const newStep: ExposureStep = {
      id: Date.now().toString(),
      description,
      anxietyLevel,
      completed: false
    }
    setExposureSteps([...exposureSteps, newStep])
    setShowExposureForm(false)
  }

  const toggleExposureStep = (id: string) => {
    setExposureSteps(exposureSteps.map(step => {
      if (step.id === id) {
        const newCompleted = !step.completed
        if (newCompleted) {
          setUserProfile(prev => prev ? { ...prev, points: prev.points + 25 } : null)
        }
        return {
          ...step,
          completed: newCompleted,
          date: newCompleted ? new Date().toISOString().split('T')[0] : undefined
        }
      }
      return step
    }))
  }

  const deleteExposureStep = (id: string) => {
    setExposureSteps(exposureSteps.filter(s => s.id !== id))
  }

  const openArticle = (article: Article) => {
    setSelectedArticle(article)
    setShowArticleReader(true)
  }

  const finishReading = () => {
    if (selectedArticle) {
      const readArticles = articles.filter(a => a.read).length
      
      setArticles(articles.map(a => 
        a.id === selectedArticle.id 
          ? { ...a, read: true }
          : a
      ))

      if (readArticles + 1 >= 5) {
        setUserProfile(prev => prev ? { ...prev, points: prev.points + 50 } : null)
        alert('🎉 Parabéns! Você leu 5 artigos e ganhou 50 pontos!')
      }
    }
    setShowArticleReader(false)
    setSelectedArticle(null)
  }

  // AI Chat Functions
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsAITyping(true)

    // Simulate AI response based on user profile and context
    setTimeout(() => {
      const aiResponse = generateAIResponse(chatInput, userProfile)
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, assistantMessage])
      setIsAITyping(false)
    }, 1500)
  }

  const generateAIResponse = (userInput: string, profile: UserProfile | null): string => {
    const input = userInput.toLowerCase()

    // Saudações
    if (input.includes('olá') || input.includes('oi') || input.includes('bom dia') || input.includes('boa tarde') || input.includes('boa noite')) {
      return `E aí, ${profile?.name || 'meu bem'}! 👋 Tudo bom? Sou a Tia Zentia e tô aqui pra te ajudar no que precisar, viu? Pode desabafar, tirar dúvidas, pedir dicas... Fica à vontade!`
    }

    // Perguntas sobre ansiedade
    if (input.includes('ansiedade') || input.includes('ansioso') || input.includes('ansiosa') || input.includes('nervoso') || input.includes('nervosa')) {
      const anxietyType = profile?.anxietyType
      if (anxietyType === 'social') {
        return `Olha, eu sei que lidar com ansiedade social não é fácil não, viu? Mas vou te dar umas dicas que funcionam mesmo:\n\n✅ Vai com calma, meu bem! Começa com coisinhas pequenas tipo cumprimentar alguém no elevador, depois vai aumentando aos pouquinhos\n✅ Aquela voz na sua cabeça dizendo "todo mundo tá me julgando"? Pois é, na real a galera tá mais preocupada com a própria vida deles, sabe?\n✅ Antes de entrar numa situação social, faz aqueles exercícios de respiração que tem aqui no app - ajuda demais!\n\nQuer conversar mais sobre alguma coisa específica que tá te incomodando?`
      } else if (anxietyType === 'panic') {
        return `Ó, ataque de pânico é punk mesmo, mas a gente consegue controlar sim! Vou te passar umas paradas importantes:\n\n✅ Aprende a sacar os primeiros sinais, tipo coração acelerando, respiração ficando rápida... Quanto antes você perceber, melhor!\n✅ Usa aquela técnica 4-7-8 que tem aqui no app assim que sentir os primeiros sintomas - funciona pra caramba!\n✅ Guarda isso: ataque de pânico assusta pra caramba, mas não vai te fazer mal de verdade, tá?\n✅ Não fica fugindo das situações não, porque aí o medo só fica mais forte\n\nTá sentindo alguma coisa agora? Posso te guiar num exercício de respiração rapidinho!`
      } else {
        return `Ansiedade generalizada é osso porque parece que a cabeça não para nunca, né? Mas olha, tem jeito sim:\n\n✅ Faz o seguinte: separa uns 15 minutinhos por dia só pra se preocupar. Aí quando vier uma preocupação fora desse horário, anota num papel e deixa pra pensar depois\n✅ Tenta praticar mindfulness, sabe? Aquele negócio de focar no agora, no presente\n✅ Quando vier aqueles pensamentos ruins, questiona eles: "Isso é real mesmo? Qual a chance disso acontecer de verdade?"\n✅ Dorme direito, viu? Ter uma rotina de sono ajuda demais!\n\nConta pra mim, o que tá te preocupando mais ultimamente?`
      }
    }

    // Perguntas sobre sintomas
    if (input.includes('sintoma') || input.includes('sinto') || input.includes('sentindo')) {
      return `Então, os sintomas de ansiedade são bem chatos mesmo. Deixa eu te explicar:\n\n🫀 Tem os sintomas físicos: coração disparado, suor, tremor, falta de ar... Tá sentindo algum desses?\n🧠 Tem os mentais: preocupação demais, pensamentos que não param, dificuldade pra se concentrar\n😰 E tem os emocionais: medo, nervosismo, irritação fácil\n\nMe conta mais sobre o que você tá sentindo que eu te ajudo melhor, combinado?`
    }

    // Perguntas sobre tratamento
    if (input.includes('tratamento') || input.includes('como melhorar') || input.includes('o que fazer') || input.includes('como curar')) {
      return `Ó, pra tratar ansiedade direito, o ideal é juntar várias coisas, sabe?\n\n🧠 **TCC (aquela terapia cognitiva)**: Ajuda a identificar e mudar aqueles pensamentos ruins\n💊 **Remédio** (se o médico receitar): Ajuda a regular as químicas do cérebro\n🧘 **Técnicas de relaxamento**: Respiração, meditação, mindfulness - tem tudo aqui no app!\n🏃 **Exercício físico**: Mano, só 30 min 3x por semana já reduz ansiedade em até 40%!\n😴 **Dormir bem**: 7-9 horas por noite, sem negociação\n🥗 **Comer direito**: Ômega-3, magnésio, vitaminas do complexo B - tudo isso ajuda\n\nVocê já tá fazendo alguma dessas coisas? Posso te ajudar a começar com qualquer uma delas!`
    }

    // Perguntas sobre exercícios
    if (input.includes('exercício') || input.includes('técnica') || input.includes('respiração') || input.includes('respirar')) {
      return `Rapaz, tem vários exercícios aqui no app que funcionam mesmo, viu?\n\n🌬️ **Respiração 4-7-8**: Puxa o ar em 4s, segura 7s, solta em 8s - acalma na hora!\n🧘 **Meditação Guiada**: 10 minutinhos pra dar aquela relaxada\n⚓ **Técnica 5-4-3-2-1**: Usa os 5 sentidos pra voltar pro presente\n💪 **Relaxamento Muscular**: Tensiona e relaxa cada músculo do corpo\n\nQual desses você quer experimentar? Posso te guiar passo a passo!`
    }

    // Perguntas sobre medicação
    if (input.includes('medicação') || input.includes('remédio') || input.includes('medicamento') || input.includes('comprimido')) {
      return `⚠️ **Ó, importante viu**: Eu não posso receitar nem indicar remédio não, tá? Isso é coisa pra médico psiquiatra mesmo.\n\nMas posso te ajudar com:\n✅ Organizar os horários dos seus remédios aqui no app\n✅ Te avisar sobre possíveis interações entre medicamentos\n✅ Mandar lembretes pra você não esquecer de tomar\n\nVocê já toma algum remédio receitado pelo médico? Posso te ajudar a registrar aqui!`
    }

    // Crise/Emergência
    if (input.includes('crise') || input.includes('ataque') || input.includes('pânico') || input.includes('ajuda urgente') || input.includes('socorro')) {
      return `🚨 **Você tá em crise agora, meu bem?**\n\nCalma, vamos fazer um exercício de respiração AGORA mesmo:\n\n1️⃣ Puxa o ar pelo nariz contando até 4\n2️⃣ Segura a respiração contando até 4\n3️⃣ Solta o ar pela boca contando até 6\n4️⃣ Repete isso 5 vezes\n\n📞 **Se precisar de ajuda urgente:**\n• CVV: 188 (funciona 24h)\n• SAMU: 192\n• Bombeiros: 193\n\nTambém tem aquele botão vermelho SOS ali no canto da tela pra você acessar técnicas rápidas de alívio.\n\nTá melhorando? Me conta como posso te ajudar mais!`
    }

    // Perguntas sobre progresso
    if (input.includes('progresso') || input.includes('melhora') || input.includes('evolução') || input.includes('melhorando')) {
      const points = profile?.points || 0
      return `Olha só, você já juntou **${points} pontos**! 🎉 Tá mandando bem demais!\n\nIsso mostra que você tá se dedicando pra cuidar da sua saúde mental. Continua assim!\n\n📊 **Dicas pra acompanhar sua evolução:**\n✅ Usa o diário de humor todo dia\n✅ Registra seus pensamentos naquele desafio de pensamentos\n✅ Faz os exercícios com frequência\n✅ Mantém os hábitos saudáveis em dia\n\nTá enfrentando alguma dificuldade específica? Bora conversar sobre isso!`
    }

    // Perguntas sobre sono
    if (input.includes('sono') || input.includes('dormir') || input.includes('insônia') || input.includes('durmo mal')) {
      return `Ó, dormir bem é FUNDAMENTAL pra controlar a ansiedade, viu? 😴\n\n✅ **Dicas pra melhorar o sono:**\n• Vai dormir e acorda sempre no mesmo horário, até no fim de semana\n• Nada de celular 1 hora antes de dormir (aquela luz azul atrapalha demais)\n• Cria um ritual relaxante: banho morno, lê um pouco, medita\n• Corta a cafeína depois das 14h\n• Deixa o quarto escuro, silencioso e fresquinho (uns 18-20°C é ideal)\n• Se não conseguir dormir em 20 min, levanta e faz algo relaxante\n\nVocê tem mais dificuldade pra pegar no sono ou acorda muito durante a noite?`
    }

    // Agradecimento
    if (input.includes('obrigad') || input.includes('valeu') || input.includes('brigad')) {
      return `Imagina, meu bem! 💜 Tô aqui pra isso mesmo! Qualquer coisa que precisar, é só chamar a Tia Zentia que eu tô aqui, viu? Pode contar comigo sempre!`
    }

    // Como está se sentindo
    if (input.includes('tô mal') || input.includes('estou mal') || input.includes('me sentindo mal') || input.includes('não tô bem') || input.includes('triste') || input.includes('deprimid')) {
      return `Ai, meu bem, sinto muito que você tá passando por isso. 💙 Mas olha, você não tá sozinho(a) não, viu?\n\nQuer me contar um pouquinho mais sobre o que tá acontecendo? Às vezes só de desabafar já ajuda. E a gente pode ver juntos o que dá pra fazer pra você se sentir melhor.\n\nSe a situação tiver muito pesada, não esquece que você pode ligar pro CVV no 188, tá? Eles são muito atenciosos e tão lá 24h pra ouvir você.`
    }

    // Resposta genérica personalizada
    return `Entendi, ${profile?.name || 'meu bem'}. Tô aqui pra te ajudar no que precisar!\n\nPosso conversar com você sobre:\n🧠 Técnicas de TCC e como lidar com a ansiedade no dia a dia\n💊 Como organizar suas medicações\n🧘 Exercícios de relaxamento e respiração\n📊 Acompanhar seu progresso\n😴 Dicas pra dormir melhor e ter hábitos mais saudáveis\n🆘 Te dar uma força em momentos de crise\n\nSobre o que você quer bater um papo? Ou me conta mais sobre o que você tá sentindo agora.`
  }

  // Welcome Screen - LANDING PAGE
  if (currentView === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTEwIDBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
          
          <div className="relative container mx-auto px-4 py-20 md:py-32">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Plataforma #1 de Tratamento de Ansiedade no Brasil
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                Transforme Sua Vida
                <br />
                <span className="text-yellow-300">Supere a Ansiedade</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
                Descubra seu tipo de ansiedade e receba um plano de tratamento personalizado baseado em ciência
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                <Button
                  onClick={startTriage}
                  size="lg"
                  className="h-16 px-8 text-lg bg-white text-purple-600 hover:bg-gray-100 shadow-2xl hover:scale-105 transition-all group"
                >
                  Começar Avaliação Gratuita
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button
                  onClick={() => setCurrentView('login')}
                  size="lg"
                  className="h-16 px-8 text-lg bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white/30 shadow-xl"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Já tenho conta
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-white/90">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">+15.000 usuários</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                  <span className="font-semibold">4.9/5.0 avaliação</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">92% de sucesso</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Por que escolher o <span className="text-purple-600">ZentiaMind</span>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Uma plataforma completa e personalizada para você superar a ansiedade de forma eficaz
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-purple-500 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Avaliação Científica</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Questionário baseado em critérios clínicos para identificar seu tipo específico de ansiedade
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-purple-500 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Tratamento Personalizado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Plano de ação customizado com exercícios, técnicas e estratégias específicas para você
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-purple-500 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl flex items-center justify-center mb-4">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Resultados Rápidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    92% dos usuários relatam melhora significativa nos primeiros 30 dias de uso
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-purple-500 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                    <Dumbbell className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Exercícios Práticos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Técnicas de respiração, meditação, aterramento e relaxamento muscular guiados
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-purple-500 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Suporte 24/7</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Botão SOS para momentos de crise e acesso imediato a técnicas de alívio
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-purple-500 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Acompanhamento Completo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Gerenciamento de medicações, hábitos saudáveis e lembretes automáticos
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Histórias de <span className="text-purple-600">Transformação</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Veja como o ZentiaMind mudou a vida de milhares de pessoas
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <Card key={index} className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <CardTitle className="text-lg">{testimonial.name}, {testimonial.age} anos</CardTitle>
                        <CardDescription className="text-sm">{testimonial.anxietyType}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground italic">"{testimonial.result}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-4 border-purple-500 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 md:p-12 text-center text-white">
                <div className="inline-block px-4 py-2 bg-yellow-400 text-purple-900 text-sm font-bold rounded-full mb-6 animate-pulse">
                  🎯 COMECE AGORA - 100% GRATUITO
                </div>
                
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  Pronto para Transformar Sua Vida?
                </h2>
                
                <p className="text-xl mb-8 text-white/90">
                  Faça a avaliação gratuita e descubra seu tipo de ansiedade em apenas 5 minutos
                </p>
                
                <Button
                  onClick={startTriage}
                  size="lg"
                  className="h-16 px-10 text-lg bg-white text-purple-600 hover:bg-gray-100 shadow-2xl hover:scale-105 transition-all group"
                >
                  Iniciar Avaliação Gratuita Agora
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-white/90">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Sem cartão de crédito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>100% confidencial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Resultados imediatos</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="container mx-auto max-w-6xl text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-lg text-purple-600">ZentiaMind</span>
            </div>
            <p>© 2024 ZentiaMind. Todos os direitos reservados.</p>
            <p className="mt-2">Seu companheiro de apoio para gerenciar ansiedade com ciência e empatia.</p>
            <Alert className="mt-6 max-w-2xl mx-auto bg-amber-50 dark:bg-amber-900/20 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200 text-left">
                <strong>Aviso Importante:</strong> Este aplicativo é uma ferramenta de apoio e não substitui diagnóstico, tratamento ou acompanhamento profissional. Em caso de crise, ligue 188 (CVV) ou 192 (SAMU). Todos os dados são criptografados e confidenciais.
              </AlertDescription>
            </Alert>
          </div>
        </footer>
      </div>
    )
  }

  // Login Screen
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Login - ZentiaMind</CardTitle>
            <CardDescription>
              Acesse sua conta para continuar seu tratamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleLogin(
                  formData.get('email') as string,
                  formData.get('password') as string
                )
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Entrar
              </Button>
            </form>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setCurrentView('welcome')}
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Triage Screen - PÁGINA CHAMATIVA COM ÊNFASE NAS QUESTÕES
  if (currentView === 'triage') {
    const currentQuestion = triageQuestions[triageStep]
    const progress = ((triageStep + 1) / triageQuestions.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center p-4">
        {/* Purchase Notification */}
        {showNotification && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-500">
            <Card className="w-80 shadow-2xl border-green-500 border-2 bg-white dark:bg-gray-900">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      {purchaseNotifications[currentNotification].name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {purchaseNotifications[currentNotification].city}
                    </p>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      Acabou de adquirir o ZentiaMind
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {purchaseNotifications[currentNotification].time}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Exit Intent Modal */}
        <Dialog open={showExitIntent} onOpenChange={setShowExitIntent}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">⚠️ Espere!</DialogTitle>
              <DialogDescription className="text-center text-base">
                Você está a poucos passos de descobrir seu perfil de ansiedade e receber um tratamento personalizado!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <strong>Não perca essa oportunidade!</strong> Milhares de pessoas já transformaram suas vidas com o ZentiaMind.
                </AlertDescription>
              </Alert>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>+2.847 pessoas completaram a triagem hoje</span>
              </div>
              <Button
                onClick={() => setShowExitIntent(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Continuar Triagem
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Card className="w-full max-w-3xl shadow-2xl border-4 border-white/20 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
          <CardHeader className="space-y-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Descubra seu Perfil
                  </CardTitle>
                  <CardDescription className="text-base">
                    Questão {triageStep + 1} de {triageQuestions.length}
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{Math.round(progress)}%</p>
                <p className="text-xs text-muted-foreground">Completo</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 animate-pulse"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-8 pb-8">
            {/* QUESTÃO EM DESTAQUE */}
            <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-lg">
              <p className="text-2xl font-bold text-center leading-relaxed text-gray-800 dark:text-gray-100">
                {currentQuestion.text}
              </p>
            </div>
            
            {currentQuestion.type === 'text' && (
              <div className="space-y-3">
                <Input
                  placeholder="Digite sua resposta"
                  className="h-14 text-lg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      handleTriageAnswer(e.currentTarget.value.trim())
                    }
                  }}
                  autoFocus
                />
                <Button
                  onClick={() => {
                    const input = document.querySelector('input') as HTMLInputElement
                    if (input.value.trim()) {
                      handleTriageAnswer(input.value.trim())
                    }
                  }}
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                >
                  Próxima Questão →
                </Button>
              </div>
            )}

            {currentQuestion.type === 'email' && (
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  className="h-14 text-lg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      handleTriageAnswer(e.currentTarget.value.trim())
                    }
                  }}
                  autoFocus
                />
                <Button
                  onClick={() => {
                    const input = document.querySelector('input[type="email"]') as HTMLInputElement
                    if (input.value.trim()) {
                      handleTriageAnswer(input.value.trim())
                    }
                  }}
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                >
                  Próxima Questão →
                </Button>
              </div>
            )}

            {currentQuestion.type === 'tel' && (
              <div className="space-y-3">
                <Input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className="h-14 text-lg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      handleTriageAnswer(e.currentTarget.value.trim())
                    }
                  }}
                  autoFocus
                />
                <Button
                  onClick={() => {
                    const input = document.querySelector('input[type="tel"]') as HTMLInputElement
                    if (input.value.trim()) {
                      handleTriageAnswer(input.value.trim())
                    }
                  }}
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                >
                  Próxima Questão →
                </Button>
              </div>
            )}

            {currentQuestion.type === 'number' && (
              <div className="space-y-3">
                <Input
                  type="number"
                  placeholder="Digite sua idade"
                  className="h-14 text-lg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      handleTriageAnswer(e.currentTarget.value.trim())
                    }
                  }}
                  autoFocus
                />
                <Button
                  onClick={() => {
                    const input = document.querySelector('input[type="number"]') as HTMLInputElement
                    if (input.value.trim()) {
                      handleTriageAnswer(input.value.trim())
                    }
                  }}
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                >
                  Próxima Questão →
                </Button>
              </div>
            )}

            {currentQuestion.type === 'select' && currentQuestion.options && (
              <RadioGroup className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <div
                    key={option}
                    className="flex items-center space-x-4 p-5 rounded-xl border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => handleTriageAnswer(option)}
                  >
                    <RadioGroupItem value={option} id={`option-${option}`} className="w-6 h-6" />
                    <Label htmlFor={`option-${option}`} className="cursor-pointer flex-1 text-lg font-medium">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'scale' && (
              <RadioGroup className="space-y-3">
                {[
                  { value: 0, label: 'Nunca', color: 'from-green-500 to-emerald-600' },
                  { value: 1, label: 'Raramente', color: 'from-blue-500 to-cyan-600' },
                  { value: 2, label: 'Às vezes', color: 'from-yellow-500 to-orange-600' },
                  { value: 3, label: 'Frequentemente', color: 'from-orange-500 to-red-600' },
                  { value: 4, label: 'Sempre', color: 'from-red-500 to-pink-600' },
                ].map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-4 p-5 rounded-xl border-2 hover:shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
                    onClick={() => handleTriageAnswer(option.value)}
                  >
                    <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} className="w-6 h-6" />
                    <Label htmlFor={`option-${option.value}`} className="cursor-pointer flex-1 text-lg font-medium">
                      {option.label}
                    </Label>
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${option.color} flex items-center justify-center text-white font-bold text-xl`}>
                      {option.value}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Trust indicators */}
            <div className="pt-6 border-t">
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">+15.000 usuários</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">4.9/5.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-medium">92% de sucesso</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Results & Purchase Screen
  if (currentView === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-8 px-4">
        {/* Purchase Notification */}
        {showNotification && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-500">
            <Card className="w-80 shadow-2xl border-green-500 border-2 bg-white dark:bg-gray-900">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      {purchaseNotifications[currentNotification].name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {purchaseNotifications[currentNotification].city}
                    </p>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      Acabou de adquirir o ZentiaMind
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {purchaseNotifications[currentNotification].time}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Exit Intent Modal */}
        <Dialog open={showExitIntent} onOpenChange={setShowExitIntent}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">⚠️ Não Vá Embora!</DialogTitle>
              <DialogDescription className="text-center text-base">
                Você completou a triagem! Está a um passo de transformar sua vida.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <strong>OFERTA ESPECIAL:</strong> Garanta 40% de desconto se adquirir agora! Esta oferta expira em breve.
                </AlertDescription>
              </Alert>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600 line-through">R$ 497/mês</p>
                <p className="text-5xl font-bold text-green-600">R$ 97/mês</p>
                <p className="text-sm text-muted-foreground mt-2">Apenas hoje!</p>
              </div>
              <Button
                onClick={() => {
                  setShowExitIntent(false)
                  handlePurchase()
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                Garantir Desconto Agora
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="container mx-auto max-w-4xl space-y-8">
          {/* Results Card */}
          <Card className="shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold">Triagem Completa!</CardTitle>
              <CardDescription className="text-lg">
                Olá, {userProfile?.name}! Identificamos seu perfil de ansiedade.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Seu tipo de ansiedade:</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {getAnxietyTypeLabel(userProfile?.anxietyType || null)}
                </p>
              </div>

              <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  Para acessar o tratamento completo personalizado, técnicas avançadas e acompanhamento contínuo, adquira o acesso premium ao ZentiaMind.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Testimonials */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">O que nossos usuários dizem</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{testimonial.name}, {testimonial.age} anos</CardTitle>
                        <CardDescription className="text-sm">{testimonial.anxietyType}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground italic">"{testimonial.result}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Purchase Card */}
          <Card className="shadow-2xl border-2 border-blue-500">
            <CardHeader className="text-center space-y-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="inline-block px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse">
                🔥 OFERTA LIMITADA - 40% OFF
              </div>
              <CardTitle className="text-3xl font-bold">Acesso Premium ZentiaMind</CardTitle>
              <CardDescription className="text-lg">
                Tratamento completo e personalizado para sua ansiedade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Plano de tratamento personalizado baseado no seu tipo de ansiedade</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Exercícios de respiração e aterramento guiados</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Gerenciamento completo de medicações com alertas de interação</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Sistema de hábitos saudáveis e tarefas diárias</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Lembretes automáticos via email e SMS</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Botão SOS para momentos de crise com acesso imediato</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Conteúdo educativo personalizado e atualizado</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Acesso via email com senha automática após compra</p>
                </div>
              </div>

              <div className="text-center py-6 border-t border-b bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">De R$ 497/mês por apenas</p>
                <div className="flex items-center justify-center gap-4">
                  <p className="text-3xl font-bold text-red-600 line-through opacity-70">R$ 497</p>
                  <p className="text-6xl font-bold text-green-600">R$ 97</p>
                </div>
                <p className="text-xl font-semibold text-green-600 mt-2">por mês</p>
                <div className="mt-4 inline-block px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                    💰 Economize R$ 400/mês • Desconto de 40%
                  </p>
                </div>
              </div>

              <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>✅ Acesso Imediato:</strong> Após a compra, você receberá um email em {userProfile?.email} com suas credenciais de acesso (email + senha) para começar imediatamente!
                </AlertDescription>
              </Alert>

              <Button
                onClick={handlePurchase}
                className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg animate-pulse"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Garantir Acesso Premium Agora
              </Button>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>+2.847 pessoas adquiriram hoje</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>92% relatam melhora significativa em 30 dias</span>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Pagamento seguro • Garantia de 7 dias • Cancele quando quiser
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Dashboard Screen - CONTINUAÇÃO NO PRÓXIMO BLOCO
  // [O código do dashboard continua igual, mas vou incluir as melhorias solicitadas]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Crisis Button - Fixed Position */}
      <Button
        onClick={() => setShowCrisisModal(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-2xl z-50 animate-pulse"
        size="icon"
      >
        <AlertCircle className="w-8 h-8" />
      </Button>

      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Olá, {userProfile?.name}!</h1>
                <p className="text-sm text-muted-foreground">
                  {getAnxietyTypeLabel(userProfile?.anxietyType || null)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span className="font-bold text-lg">{userProfile?.points || 0} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 pb-24">
        <Tabs defaultValue="exercises" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 max-w-4xl mx-auto">
            <TabsTrigger value="exercises">Exercícios</TabsTrigger>
            <TabsTrigger value="tcc">TCC</TabsTrigger>
            <TabsTrigger value="habits">Hábitos</TabsTrigger>
            <TabsTrigger value="learn">Aprender</TabsTrigger>
            <TabsTrigger value="chat">IA Chat</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>

          {/* EXERCÍCIOS PARA ANSIEDADE */}
          <TabsContent value="exercises" className="space-y-4">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Exercícios para Ansiedade</CardTitle>
                    <CardDescription>Práticas personalizadas para seu tipo de ansiedade</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {anxietyExercises.map((exercise) => (
                <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          exercise.category === 'breathing' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          exercise.category === 'meditation' ? 'bg-purple-100 dark:bg-purple-900/30' :
                          exercise.category === 'grounding' ? 'bg-green-100 dark:bg-green-900/30' :
                          'bg-orange-100 dark:bg-orange-900/30'
                        }`}>
                          {exercise.category === 'breathing' && <Wind className="w-5 h-5 text-blue-600" />}
                          {exercise.category === 'meditation' && <Brain className="w-5 h-5 text-purple-600" />}
                          {exercise.category === 'grounding' && <Anchor className="w-5 h-5 text-green-600" />}
                          {exercise.category === 'movement' && <Dumbbell className="w-5 h-5 text-orange-600" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{exercise.title}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {exercise.duration}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{exercise.description}</p>
                    <Button 
                      onClick={() => startExercise(exercise)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar Exercício (+15 pts)
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TCC - TERAPIA COGNITIVO-COMPORTAMENTAL */}
          <TabsContent value="tcc" className="space-y-4">
            <Tabs defaultValue="distortions" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="distortions">Distorções</TabsTrigger>
                <TabsTrigger value="thoughts">Pensamentos</TabsTrigger>
                <TabsTrigger value="exposure">Exposição</TabsTrigger>
                <TabsTrigger value="mood">Humor</TabsTrigger>
              </TabsList>

              {/* Distorções Cognitivas */}
              <TabsContent value="distortions" className="space-y-4">
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <CardHeader>
                    <CardTitle>Identificação de Distorções Cognitivas</CardTitle>
                    <CardDescription>Aprenda a reconhecer padrões de pensamento negativos</CardDescription>
                  </CardHeader>
                </Card>

                <div className="grid gap-3">
                  {distortions.map((distortion) => (
                    <Card key={distortion.id} className={distortion.completed ? 'bg-green-50 dark:bg-green-900/10' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={distortion.completed}
                            onCheckedChange={() => toggleDistortion(distortion.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{distortion.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{distortion.description}</p>
                            <p className="text-sm italic text-blue-600 dark:text-blue-400 mt-2">
                              Exemplo: {distortion.example}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  {distortions.filter(d => d.completed).length} de {distortions.length} distorções estudadas
                </div>
              </TabsContent>

              {/* Desafio de Pensamentos */}
              <TabsContent value="thoughts" className="space-y-4">
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <CardHeader>
                    <CardTitle>Desafio de Pensamentos</CardTitle>
                    <CardDescription>Registre e questione pensamentos negativos</CardDescription>
                  </CardHeader>
                </Card>

                <Button
                  onClick={() => setShowThoughtForm(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Novo Registro de Pensamento (+30 pts)
                </Button>

                <div className="space-y-3">
                  {thoughtChallenges.length === 0 ? (
                    <Card className="p-8 text-center">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">Nenhum pensamento registrado ainda</p>
                    </Card>
                  ) : (
                    thoughtChallenges.map((challenge) => (
                      <Card key={challenge.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{challenge.situation}</CardTitle>
                              <CardDescription className="text-xs">
                                {new Date(challenge.date).toLocaleDateString('pt-BR')} • {challenge.emotion} ({challenge.intensity}/10)
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div>
                            <p className="font-semibold text-red-600">Pensamento Negativo:</p>
                            <p className="text-muted-foreground">{challenge.negativeThought}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-blue-600">Evidências A Favor:</p>
                            <p className="text-muted-foreground">{challenge.evidenceFor}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-purple-600">Evidências Contra:</p>
                            <p className="text-muted-foreground">{challenge.evidenceAgainst}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-green-600">Pensamento Alternativo:</p>
                            <p className="text-muted-foreground">{challenge.alternativeThought}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Exposição Gradual */}
              <TabsContent value="exposure" className="space-y-4">
                <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                  <CardHeader>
                    <CardTitle>Exposição Gradual</CardTitle>
                    <CardDescription>Crie um plano de exposição em etapas para superar medos</CardDescription>
                  </CardHeader>
                </Card>

                <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    <strong>Importante:</strong> Faça exposição gradual com acompanhamento profissional quando possível.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={() => setShowExposureForm(true)}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Adicionar Etapa de Exposição
                </Button>

                <div className="space-y-3">
                  {exposureSteps.length === 0 ? (
                    <Card className="p-8 text-center">
                      <TrendingDown className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">Nenhuma etapa criada ainda</p>
                    </Card>
                  ) : (
                    exposureSteps
                      .sort((a, b) => a.anxietyLevel - b.anxietyLevel)
                      .map((step) => (
                        <Card key={step.id} className={step.completed ? 'bg-green-50 dark:bg-green-900/10' : ''}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={step.completed}
                                onCheckedChange={() => toggleExposureStep(step.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-medium">{step.description}</p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteExposureStep(step.id)}
                                    className="text-red-500"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-muted-foreground">Nível de ansiedade:</span>
                                  <div className="flex-1 max-w-xs">
                                    <Progress value={step.anxietyLevel * 10} className="h-2" />
                                  </div>
                                  <span className="font-semibold">{step.anxietyLevel}/10</span>
                                </div>
                                {step.completed && step.date && (
                                  <p className="text-xs text-green-600 mt-2">
                                    ✓ Concluído em {new Date(step.date).toLocaleDateString('pt-BR')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  )}
                </div>
              </TabsContent>

              {/* Registro de Humor */}
              <TabsContent value="mood" className="space-y-4">
                <Card className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20">
                  <CardHeader>
                    <CardTitle>Diário de Humor</CardTitle>
                    <CardDescription>Acompanhe padrões e identifique gatilhos emocionais</CardDescription>
                  </CardHeader>
                </Card>

                <Button
                  onClick={() => setShowMoodForm(true)}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Novo Registro de Humor (+10 pts)
                </Button>

                <div className="space-y-3">
                  {moodEntries.length === 0 ? (
                    <Card className="p-8 text-center">
                      <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">Nenhum registro de humor ainda</p>
                    </Card>
                  ) : (
                    moodEntries.map((entry) => (
                      <Card key={entry.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                <span className="text-2xl">{entry.mood}</span>
                                {entry.situation}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {new Date(entry.date).toLocaleDateString('pt-BR')} às {entry.time}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-muted-foreground">Ansiedade</p>
                              <div className="flex items-center gap-2">
                                <Progress value={entry.anxietyLevel * 10} className="h-2" />
                                <span className="font-semibold">{entry.anxietyLevel}/10</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Estresse</p>
                              <div className="flex items-center gap-2">
                                <Progress value={entry.stressLevel * 10} className="h-2" />
                                <span className="font-semibold">{entry.stressLevel}/10</span>
                              </div>
                            </div>
                          </div>
                          {entry.triggers.length > 0 && (
                            <div>
                              <p className="text-muted-foreground">Gatilhos:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {entry.triggers.map((trigger, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">
                                    {trigger}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {entry.location && (
                            <p><span className="text-muted-foreground">Local:</span> {entry.location}</p>
                          )}
                          {entry.people && (
                            <p><span className="text-muted-foreground">Pessoas:</span> {entry.people}</p>
                          )}
                          {entry.notes && (
                            <p className="text-muted-foreground italic">{entry.notes}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {moodEntries.length > 0 && (
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Insights dos Últimos 7 Dias
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p>• Média de ansiedade: {(moodEntries.slice(0, 7).reduce((acc, e) => acc + e.anxietyLevel, 0) / Math.min(7, moodEntries.length)).toFixed(1)}/10</p>
                      <p>• Média de estresse: {(moodEntries.slice(0, 7).reduce((acc, e) => acc + e.stressLevel, 0) / Math.min(7, moodEntries.length)).toFixed(1)}/10</p>
                      <p>• Total de registros: {moodEntries.length}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* HÁBITOS E TAREFAS */}
          <TabsContent value="habits" className="space-y-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Hábitos Saudáveis</CardTitle>
                    <CardDescription>Construa uma rotina que reduz ansiedade</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Lembretes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configurar Lembretes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Lembretes por Email</p>
                      <p className="text-xs text-muted-foreground">Receba lembretes no seu email</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={emailReminders}
                    onCheckedChange={(checked) => setEmailReminders(checked as boolean)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Lembretes por SMS</p>
                      <p className="text-xs text-muted-foreground">Receba lembretes no seu celular</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={smsReminders}
                    onCheckedChange={(checked) => setSmsReminders(checked as boolean)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Hábitos Diários */}
            <div className="space-y-3">
              {habits.map((habit) => (
                <Card key={habit.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={habit.completed}
                        onCheckedChange={() => toggleHabit(habit.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium ${habit.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {habit.title}
                          </p>
                          {habit.streak > 0 && (
                            <div className="flex items-center gap-1 text-orange-600">
                              <span className="text-xl">🔥</span>
                              <span className="text-sm font-bold">{habit.streak} dias</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{habit.description}</p>
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openHabitDaySelector(habit)}
                            className="text-xs"
                          >
                            <Calendar className="w-3 h-3 mr-1" />
                            {habit.selectedDays.length > 0 
                              ? `${habit.selectedDays.length} dias selecionados`
                              : 'Selecionar dias'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tarefas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Minhas Tarefas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const title = formData.get('title') as string
                    const dueDate = formData.get('dueDate') as string
                    if (title.trim()) {
                      addTask(title, dueDate)
                      e.currentTarget.reset()
                    }
                  }}
                  className="flex gap-2"
                >
                  <Input name="title" placeholder="Nova tarefa..." className="flex-1" />
                  <Input name="dueDate" type="date" className="w-40" />
                  <Button type="submit" size="icon">
                    <CheckSquare className="w-4 h-4" />
                  </Button>
                </form>

                {tasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Nenhuma tarefa ainda</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(task.id)}
                        />
                        <div className="flex-1">
                          <p className={`${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </p>
                          {task.dueDate && (
                            <p className="text-xs text-muted-foreground">
                              Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* APRENDER - BIBLIOTECA EDUCACIONAL */}
          <TabsContent value="learn" className="space-y-4">
            <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Biblioteca Educacional</CardTitle>
                    <CardDescription>Aprenda sobre ansiedade e saúde mental</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Artigos */}
            <div className="space-y-3">
              {articles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {article.title}
                            {article.read && <Check className="w-4 h-4 text-green-600" />}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {article.category} • {article.readTime} de leitura
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{article.content}</p>
                    <Button 
                      onClick={() => openArticle(article)}
                      variant="outline"
                      className="w-full"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      {article.read ? 'Ler novamente' : 'Ler artigo'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {articles.filter(a => a.read).length >= 5 && (
              <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200">
                <Trophy className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <strong>Parabéns!</strong> Você já leu {articles.filter(a => a.read).length} artigos! Continue aprendendo para ganhar mais pontos.
                </AlertDescription>
              </Alert>
            )}

            {/* Vídeos Educativos */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Video className="w-6 h-6 text-purple-600" />
                  <div>
                    <CardTitle className="text-lg">Vídeos Educativos</CardTitle>
                    <CardDescription>Em breve: vídeos sobre autocuidado e alongamento</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Recursos de Emergência */}
            <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200">
              <Phone className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <strong>Recursos de Emergência:</strong><br />
                • CVV (Centro de Valorização da Vida): 188<br />
                • SAMU: 192<br />
                • Bombeiros: 193<br />
                • Polícia: 190
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* IA CHAT - CONVERSA COM ASSISTENTE */}
          <TabsContent value="chat" className="space-y-4">
            <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Tia Zentia</CardTitle>
                    <CardDescription>Converse sobre seus sintomas, receba dicas personalizadas e tire dúvidas</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="flex flex-col max-w-2xl mx-auto">
              <CardHeader className="border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  Tia Zentia
                </CardTitle>
                <CardDescription>
                  Pergunte sobre ansiedade, técnicas, tratamentos ou compartilhe como está se sentindo
                </CardDescription>
              </CardHeader>
              
              <ScrollArea className="h-[500px] p-4">
                <div className="space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <Bot className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">Olá! Sou a Tia Zentia.</p>
                      <p className="text-sm text-muted-foreground">
                        Posso ajudá-lo com dicas, técnicas e responder suas dúvidas sobre ansiedade.
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] p-3 rounded-lg break-words ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-foreground'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {message.role === 'user' && (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">
                              {userProfile?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  
                  {isAITyping && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <CardContent className="border-t p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1"
                    disabled={isAITyping}
                  />
                  <Button
                    type="submit"
                    disabled={!chatInput.trim() || isAITyping}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  💡 Dica: Pergunte sobre sintomas, técnicas de respiração, tratamentos ou compartilhe como está se sentindo
                </p>
              </CardContent>
            </Card>

            <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 max-w-2xl mx-auto">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>Importante:</strong> Esta IA é uma ferramenta de apoio e não substitui diagnóstico ou tratamento profissional. Em caso de crise, use o botão SOS ou ligue 188 (CVV).
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Seu Perfil</CardTitle>
                <CardDescription>Informações baseadas na triagem inicial</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Nome</Label>
                  <p className="text-lg font-medium">{userProfile?.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">E-mail</Label>
                  <p className="text-lg font-medium">{userProfile?.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Telefone</Label>
                  <p className="text-lg font-medium">{userProfile?.phone}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Idade</Label>
                  <p className="text-lg font-medium">{userProfile?.age} anos</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Cidade</Label>
                  <p className="text-lg font-medium">{userProfile?.city}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Tipo de Ansiedade Identificado</Label>
                  <p className="text-lg font-medium">{getAnxietyTypeLabel(userProfile?.anxietyType || null)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <p className="text-lg font-medium text-green-600">Premium Ativo</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Pontos Acumulados</Label>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <p className="text-lg font-medium">{userProfile?.points || 0} pontos</p>
                  </div>
                </div>

                <div className="pt-4 space-y-3 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (confirm('Deseja refazer a triagem? Suas informações pessoais e acesso premium serão mantidos.')) {
                        setUserProfile(prev => prev ? {
                          ...prev,
                          anxietyType: null,
                          triageCompleted: false
                        } : null)
                        setTriageAnswers([])
                        setTriageStep(0)
                        setCurrentView('triage')
                      }
                    }}
                  >
                    Refazer Triagem
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair da Conta
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    onClick={handleCancelSubscription}
                  >
                    Cancelar Assinatura
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleDeleteAccount}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Apagar Conta
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Personalized Content */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardHeader>
                <CardTitle>Conteúdo Personalizado</CardTitle>
              </CardHeader>
              <CardContent>
                {userProfile?.anxietyType === 'social' && (
                  <p className="text-sm">
                    Dica: Pratique exposição gradual a situações sociais. Comece com interações pequenas e aumente progressivamente.
                  </p>
                )}
                {userProfile?.anxietyType === 'panic' && (
                  <p className="text-sm">
                    Dica: Aprenda a reconhecer os sinais iniciais de um ataque de pânico. Use técnicas de respiração assim que perceber.
                  </p>
                )}
                {userProfile?.anxietyType === 'general' && (
                  <p className="text-sm">
                    Dica: Estabeleça um "horário de preocupação" diário de 15 minutos. Fora desse horário, anote preocupações para revisar depois.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Exercise Modal */}
      <Dialog open={activeExercise !== null} onOpenChange={(open) => !open && stopExercise()}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {activeExercise?.category === 'breathing' && <Wind className="w-6 h-6 text-blue-600" />}
              {activeExercise?.category === 'meditation' && <Brain className="w-6 h-6 text-purple-600" />}
              {activeExercise?.category === 'grounding' && <Anchor className="w-6 h-6 text-green-600" />}
              {activeExercise?.category === 'movement' && <Dumbbell className="w-6 h-6 text-orange-600" />}
              {activeExercise?.title}
            </DialogTitle>
            <DialogDescription>
              {activeExercise?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Timer */}
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {formatTime(exerciseTimer)}
              </div>
              <p className="text-sm text-muted-foreground">Tempo decorrido</p>
            </div>

            {/* Som Toggle */}
            {(activeExercise?.category === 'breathing' || activeExercise?.id === '5') && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" />
                      Som ativado
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4 mr-2" />
                      Som desativado
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Breathing Animation */}
            {activeExercise?.category === 'breathing' && exerciseRunning && (
              <div className="flex flex-col items-center gap-4">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-1000 ${
                  exercisePhase === 'inhale' ? 'bg-blue-200 dark:bg-blue-800 scale-110' :
                  exercisePhase === 'hold' ? 'bg-purple-200 dark:bg-purple-800 scale-110' :
                  'bg-green-200 dark:bg-green-800 scale-90'
                }`}>
                  <Wind className="w-16 h-16" />
                </div>
                <div className="text-2xl font-bold text-center">
                  {exercisePhase === 'inhale' && 'Inspire'}
                  {exercisePhase === 'hold' && 'Segure'}
                  {exercisePhase === 'exhale' && 'Expire'}
                </div>
              </div>
            )}

            {/* Meditation Instructions */}
            {activeExercise?.category === 'meditation' && (
              <div className="space-y-3 text-sm">
                <p>1. Sente-se confortavelmente com a coluna reta</p>
                <p>2. Feche os olhos suavemente</p>
                <p>3. Respire naturalmente</p>
                <p>4. Observe seus pensamentos sem julgamento</p>
                <p>5. Quando se distrair, volte gentilmente à respiração</p>
              </div>
            )}

            {/* Grounding Instructions */}
            {activeExercise?.category === 'grounding' && (
              <div className="space-y-3 text-sm">
                <p><strong>5 coisas</strong> que você pode ver ao seu redor</p>
                <p><strong>4 coisas</strong> que você pode tocar</p>
                <p><strong>3 coisas</strong> que você pode ouvir</p>
                <p><strong>2 coisas</strong> que você pode cheirar</p>
                <p><strong>1 coisa</strong> que você pode saborear</p>
              </div>
            )}

            {/* Relaxamento Muscular Progressivo */}
            {activeExercise?.id === '5' && activeExercise.steps && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {activeExercise.steps.map((step, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border-2 transition-all ${
                        index === currentStepIndex 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : completedSteps[index]
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {completedSteps[index] ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : index === currentStepIndex ? (
                            <div className="w-5 h-5 rounded-full border-2 border-blue-600 animate-pulse" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                          )}
                          <span className={`text-sm ${index === currentStepIndex ? 'font-bold' : ''}`}>
                            {step}
                          </span>
                        </div>
                        {index === currentStepIndex && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStepCompletion(index)}
                          >
                            {completedSteps[index] ? (
                              <X className="w-4 h-4" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feedback Form */}
                {!exerciseRunning && exerciseTimer > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Como você se sentiu?</Label>
                      <Textarea
                        value={exerciseFeeling}
                        onChange={(e) => setExerciseFeeling(e.target.value)}
                        placeholder="Descreva como se sentiu durante o exercício..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>O que achou do exercício?</Label>
                      <Textarea
                        value={exerciseFeedback}
                        onChange={(e) => setExerciseFeedback(e.target.value)}
                        placeholder="Deixe seu feedback sobre o exercício..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Movement Instructions */}
            {activeExercise?.category === 'movement' && activeExercise.id !== '5' && (
              <div className="space-y-3 text-sm">
                <p>Siga as instruções do exercício:</p>
                <p className="italic">{activeExercise.description}</p>
                <p className="mt-4">Mantenha o foco na sua respiração e nas sensações do corpo durante todo o exercício.</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-2">
              {!exerciseRunning ? (
                <Button
                  onClick={() => setExerciseRunning(true)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar
                </Button>
              ) : (
                <Button
                  onClick={() => setExerciseRunning(false)}
                  variant="outline"
                  className="flex-1"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </Button>
              )}
              <Button
                onClick={stopExercise}
                variant="outline"
                className="flex-1"
                disabled={activeExercise?.id === '5' && (!exerciseFeedback || !exerciseFeeling) && exerciseTimer > 0}
              >
                Finalizar
              </Button>
            </div>

            {activeExercise?.id === '5' && exerciseTimer > 0 && (!exerciseFeedback || !exerciseFeeling) && (
              <p className="text-xs text-center text-amber-600">
                ⚠️ Preencha o feedback para finalizar e ganhar pontos
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Crisis Modal */}
      <Dialog open={showCrisisModal} onOpenChange={setShowCrisisModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-red-600 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Modo Crise - SOS
            </DialogTitle>
            <DialogDescription>
              Você não está sozinho. Escolha uma técnica de alívio imediato.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* Breathing Exercise */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setBreathingActive(!breathingActive)}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Wind className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Respiração 4-4-6</CardTitle>
                    <CardDescription className="text-xs">Técnica de respiração guiada</CardDescription>
                  </div>
                </div>
              </CardHeader>
              {breathingActive && (
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-1000 ${
                      breathingPhase === 'inhale' ? 'bg-blue-200 dark:bg-blue-800 scale-110' :
                      breathingPhase === 'hold' ? 'bg-purple-200 dark:bg-purple-800 scale-110' :
                      'bg-green-200 dark:bg-green-800 scale-90'
                    }`}>
                      <Wind className="w-12 h-12" />
                    </div>
                    <div className="text-2xl font-bold">
                      {breathingPhase === 'inhale' && 'Inspire (4s)'}
                      {breathingPhase === 'hold' && 'Segure (4s)'}
                      {breathingPhase === 'exhale' && 'Expire (6s)'}
                    </div>
                    <Button variant="outline" onClick={(e) => { e.stopPropagation(); setBreathingActive(false) }}>
                      Parar
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Grounding Exercise */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Anchor className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Técnica 5-4-3-2-1</CardTitle>
                    <CardDescription className="text-xs">Exercício de aterramento</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>5 coisas</strong> que você pode ver</p>
                <p><strong>4 coisas</strong> que você pode tocar</p>
                <p><strong>3 coisas</strong> que você pode ouvir</p>
                <p><strong>2 coisas</strong> que você pode cheirar</p>
                <p><strong>1 coisa</strong> que você pode saborear</p>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <Phone className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <strong>Emergência?</strong> Ligue 188 (CVV) ou 192 (SAMU)
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>

      {/* Medication Form Modal */}
      <Dialog open={showMedicationForm} onOpenChange={setShowMedicationForm}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Medicação</DialogTitle>
            <DialogDescription>
              Registre suas medicações para acompanhamento
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const medName = formData.get('name') as string
              const interactions = medicationInteractions[medName as keyof typeof medicationInteractions] || []
              
              addMedication({
                name: medName,
                dosage: formData.get('dosage') as string,
                frequency: formData.get('frequency') as string,
                time: formData.get('time') as string,
                notes: formData.get('notes') as string,
                interactions,
              })
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Medicamento</Label>
              <select
                id="name"
                name="name"
                required
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Selecione...</option>
                {Object.keys(medicationInteractions).map((med) => (
                  <option key={med} value={med}>{med}</option>
                ))}
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosage">Dosagem</Label>
              <Input id="dosage" name="dosage" placeholder="Ex: 10mg" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência</Label>
              <select
                id="frequency"
                name="frequency"
                required
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="1x ao dia">1x ao dia</option>
                <option value="2x ao dia">2x ao dia</option>
                <option value="3x ao dia">3x ao dia</option>
                <option value="Conforme necessário">Conforme necessário</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input id="time" name="time" type="time" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea id="notes" name="notes" placeholder="Ex: Tomar com alimentos" rows={3} />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600">
                Adicionar
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowMedicationForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Thought Challenge Form Modal */}
      <Dialog open={showThoughtForm} onOpenChange={setShowThoughtForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registro de Pensamento</DialogTitle>
            <DialogDescription>
              Analise e desafie um pensamento negativo
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              addThoughtChallenge({
                situation: formData.get('situation') as string,
                negativeThought: formData.get('negativeThought') as string,
                emotion: formData.get('emotion') as string,
                intensity: parseInt(formData.get('intensity') as string),
                evidenceFor: formData.get('evidenceFor') as string,
                evidenceAgainst: formData.get('evidenceAgainst') as string,
                alternativeThought: formData.get('alternativeThought') as string,
              })
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="situation">Situação</Label>
              <Input id="situation" name="situation" placeholder="O que aconteceu?" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="negativeThought">Pensamento Negativo</Label>
              <Textarea id="negativeThought" name="negativeThought" placeholder="Qual pensamento passou pela sua cabeça?" rows={2} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emotion">Emoção</Label>
                <Input id="emotion" name="emotion" placeholder="Ex: Ansiedade, Medo" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="intensity">Intensidade (0-10)</Label>
                <Input id="intensity" name="intensity" type="number" min="0" max="10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidenceFor">Evidências A Favor do Pensamento</Label>
              <Textarea id="evidenceFor" name="evidenceFor" placeholder="Que fatos apoiam esse pensamento?" rows={2} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidenceAgainst">Evidências Contra o Pensamento</Label>
              <Textarea id="evidenceAgainst" name="evidenceAgainst" placeholder="Que fatos contradizem esse pensamento?" rows={2} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alternativeThought">Pensamento Alternativo Equilibrado</Label>
              <Textarea id="alternativeThought" name="alternativeThought" placeholder="Qual seria uma forma mais equilibrada de ver isso?" rows={2} required />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600">
                Salvar Registro
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowThoughtForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mood Entry Form Modal */}
      <Dialog open={showMoodForm} onOpenChange={setShowMoodForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registro de Humor</DialogTitle>
            <DialogDescription>
              Registre como você está se sentindo agora
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const triggersString = formData.get('triggers') as string
              addMoodEntry({
                mood: formData.get('mood') as string,
                anxietyLevel: parseInt(formData.get('anxietyLevel') as string),
                stressLevel: parseInt(formData.get('stressLevel') as string),
                triggers: triggersString ? triggersString.split(',').map(t => t.trim()) : [],
                location: formData.get('location') as string,
                people: formData.get('people') as string,
                situation: formData.get('situation') as string,
                notes: formData.get('notes') as string,
              })
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="mood">Como você está se sentindo?</Label>
              <select
                id="mood"
                name="mood"
                required
                className="w-full px-3 py-2 border rounded-md bg-background text-2xl"
              >
                <option value="😊">😊 Feliz</option>
                <option value="😌">😌 Calmo</option>
                <option value="😐">😐 Neutro</option>
                <option value="😟">😟 Preocupado</option>
                <option value="😰">😰 Ansioso</option>
                <option value="😢">😢 Triste</option>
                <option value="😠">😠 Irritado</option>
                <option value="😫">😫 Exausto</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="anxietyLevel">Nível de Ansiedade (0-10)</Label>
                <Input id="anxietyLevel" name="anxietyLevel" type="number" min="0" max="10" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stressLevel">Nível de Estresse (0-10)</Label>
                <Input id="stressLevel" name="stressLevel" type="number" min="0" max="10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="situation">Situação</Label>
              <Input id="situation" name="situation" placeholder="O que estava acontecendo?" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="triggers">Gatilhos (separados por vírgula)</Label>
              <Input id="triggers" name="triggers" placeholder="Ex: trabalho, trânsito, discussão" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Local</Label>
              <Input id="location" name="location" placeholder="Onde você estava?" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="people">Pessoas Presentes</Label>
              <Input id="people" name="people" placeholder="Quem estava com você?" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" name="notes" placeholder="Algo mais que queira registrar?" rows={2} />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600">
                Salvar Registro
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowMoodForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Exposure Step Form Modal */}
      <Dialog open={showExposureForm} onOpenChange={setShowExposureForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Etapa de Exposição</DialogTitle>
            <DialogDescription>
              Adicione uma situação que você quer enfrentar gradualmente
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              addExposureStep(
                formData.get('description') as string,
                parseInt(formData.get('anxietyLevel') as string)
              )
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="description">Descrição da Situação</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Ex: Falar com um colega de trabalho" 
                rows={2} 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anxietyLevel">Nível de Ansiedade Esperado (0-10)</Label>
              <Input 
                id="anxietyLevel" 
                name="anxietyLevel" 
                type="number" 
                min="0" 
                max="10" 
                placeholder="Quanto de ansiedade você espera sentir?" 
                required 
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-orange-500 to-red-600">
                Adicionar Etapa
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowExposureForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Article Reader Modal */}
      <Dialog open={showArticleReader} onOpenChange={setShowArticleReader}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              {selectedArticle?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedArticle?.category} • {selectedArticle?.readTime} de leitura
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed">{selectedArticle?.content}</p>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={finishReading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
              >
                <Check className="w-4 h-4 mr-2" />
                Finalizar Leitura
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowArticleReader(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Habit Day Selector Modal */}
      <Dialog open={showHabitDaySelector} onOpenChange={setShowHabitDaySelector}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar Dias da Semana</DialogTitle>
            <DialogDescription>
              Escolha os dias em que deseja praticar este hábito
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={day}
                  checked={selectedHabitForDays?.selectedDays.includes(day)}
                  onCheckedChange={(checked) => {
                    if (selectedHabitForDays) {
                      const newDays = checked
                        ? [...selectedHabitForDays.selectedDays, day]
                        : selectedHabitForDays.selectedDays.filter(d => d !== day)
                      setSelectedHabitForDays({ ...selectedHabitForDays, selectedDays: newDays })
                    }
                  }}
                />
                <Label htmlFor={day} className="cursor-pointer">
                  {day}
                </Label>
              </div>
            ))}

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => selectedHabitForDays && saveHabitDays(selectedHabitForDays.selectedDays)}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
              >
                Salvar
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowHabitDaySelector(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
