"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, LogOut, Shield, User, Activity, TrendingUp, Calendar, MessageSquare, Pill, Target, Brain, Settings, Menu, X, Home, BarChart3, Sparkles, Music, DollarSign, CreditCard, Download, FileText, Send, Users, Key, Copy, Check, Clock, Video, MapPin, Phone, Mail, Building, Moon, ChevronDown, ChevronUp, ChevronLeft, Upload, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase, type UserProfile } from '@/lib/supabase'
import { toast } from 'sonner'
import Script from 'next/script'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface DoctorInfo {
  id: string;
  user_id: string;
  specialty: string;
  crm: string;
  name?: string;
  city?: string;
  address?: string;
  phone?: string;
  pix_key?: string;
  payment_link?: string;
}

interface DoctorProfile {
  id?: string;
  doctor_id: string;
  photo_url?: string;
  bio?: string;
  show_on_landing: boolean;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  anxiety_type: string;
  last_activity?: string;
  access_code?: string;
}

interface PatientReport {
  mood_entries: number;
  medications_taken: number;
  habits_completed: number;
  meditation_sessions: number;
  chat_messages: number;
  last_activity: string;
}

interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  date: string;
  time: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface ConsultationPlan {
  id: string;
  name: string;
  price: number;
  sessions: number;
  description: string;
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
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null)
  const [showDoctorSell, setShowDoctorSell] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isUserInfoExpanded, setIsUserInfoExpanded] = useState(true)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  
  // Estados para painel lateral
  const [sidePanelOpen, setSidePanelOpen] = useState(false)
  const [sidePanelContent, setSidePanelContent] = useState<'doctor' | 'meditation' | 'sleep' | 'chat' | null>(null)
  
  // Estados para painel do doutor
  const [showSendMedication, setShowSendMedication] = useState(false)
  const [showPatientChat, setShowPatientChat] = useState(false)
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false)
  const [showUserAccessCode, setShowUserAccessCode] = useState(false)
  const [showPatientReport, setShowPatientReport] = useState(false)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [showFinancialPanel, setShowFinancialPanel] = useState(false)
  const [showDoctorInfoModal, setShowDoctorInfoModal] = useState(false)
  const [accessCodeInput, setAccessCodeInput] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [authorizedPatients, setAuthorizedPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedPatientReport, setSelectedPatientReport] = useState<PatientReport | null>(null)
  const [userAccessCode, setUserAccessCode] = useState<string>('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [consultationPlans, setConsultationPlans] = useState<ConsultationPlan[]>([])
  const [medicationForm, setMedicationForm] = useState({
    patientId: '',
    medicationName: '',
    dosage: '',
    frequency: '',
    instructions: ''
  })
  const [appointmentForm, setAppointmentForm] = useState({
    patientId: '',
    date: '',
    time: '',
    notes: ''
  })
  const [financialForm, setFinancialForm] = useState({
    pixKey: doctorInfo?.pix_key || '',
    paymentLink: doctorInfo?.payment_link || ''
  })
  const [planForm, setPlanForm] = useState({
    name: '',
    price: 0,
    sessions: 1,
    description: ''
  })
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<any[]>([])
  
  const [sellData, setSellData] = useState({
    originalPrice: 24.90,
    discountedPrice: 24.90,
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
    
    // Carrega ou gera código de acesso do usuário
    loadOrGenerateAccessCode(userData.id)

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

  const generateAccessCode = () => {
    // Gera um código de 8 caracteres alfanuméricos
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const loadOrGenerateAccessCode = async (userId: string) => {
    try {
      setIsGeneratingCode(true)
      
      // PRIORIDADE 1: Buscar código do Supabase
      const { data: profileData, error: fetchError } = await supabase
        .from('user_profiles')
        .select('access_code')
        .eq('id', userId)
        .single()

      // Se encontrou no Supabase e tem código
      if (!fetchError && profileData?.access_code) {
        setUserAccessCode(profileData.access_code)
        // Sincroniza com localStorage (cache)
        localStorage.setItem(`access_code_${userId}`, profileData.access_code)
        console.log('✅ Código carregado do Supabase:', profileData.access_code)
        return
      }

      // PRIORIDADE 2: Verificar se existe no localStorage (migração)
      const savedCode = localStorage.getItem(`access_code_${userId}`)
      
      if (savedCode) {
        setUserAccessCode(savedCode)
        console.log('📦 Código encontrado no localStorage, sincronizando com Supabase...')
        
        // Tenta sincronizar com Supabase
        const { error: syncError } = await supabase
          .from('user_profiles')
          .update({ access_code: savedCode })
          .eq('id', userId)
        
        if (syncError) {
          console.warn('⚠️ Não foi possível sincronizar com Supabase:', syncError.message)
          toast.info('Código carregado localmente. Adicione a coluna access_code no Supabase para sincronizar.')
        } else {
          console.log('✅ Código sincronizado com Supabase com sucesso!')
          toast.success('Código sincronizado com o banco de dados!')
        }
        return
      }

      // PRIORIDADE 3: Gerar novo código
      const newCode = generateAccessCode()
      console.log('🔑 Gerando novo código:', newCode)
      setUserAccessCode(newCode)
      
      // Tenta salvar no Supabase primeiro
      const { error: saveError } = await supabase
        .from('user_profiles')
        .update({ access_code: newCode })
        .eq('id', userId)
      
      if (saveError) {
        console.warn('⚠️ Não foi possível salvar no Supabase:', saveError.message)
        console.log('💾 Salvando apenas no localStorage (temporário)')
        localStorage.setItem(`access_code_${userId}`, newCode)
        toast.success('Código gerado! Adicione a coluna access_code no Supabase para persistência.', {
          duration: 5000
        })
      } else {
        console.log('✅ Código salvo no Supabase com sucesso!')
        // Salva também no localStorage como cache
        localStorage.setItem(`access_code_${userId}`, newCode)
        toast.success('Código de acesso gerado e salvo com sucesso!')
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar/gerar código de acesso:', error)
      
      // Fallback: gera código local
      const fallbackCode = generateAccessCode()
      localStorage.setItem(`access_code_${userId}`, fallbackCode)
      setUserAccessCode(fallbackCode)
      toast.warning('Código gerado localmente. Verifique a conexão com o Supabase.')
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const checkIfDoctor = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!error && data) {
        setDoctorInfo(data)
        setFinancialForm({
          pixKey: data.pix_key || '',
          paymentLink: data.payment_link || ''
        })
        loadDoctorProfile(data.id)
        loadAuthorizedPatients(userId)
        loadAppointments(userId)
        loadConsultationPlans(userId)
      }
    } catch (error) {
      console.log('Usuário não é doutor')
    }
  }

  const loadDoctorProfile = async (doctorId: string) => {
    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('doctor_id', doctorId)
        .single()

      if (!error && data) {
        setDoctorProfile(data)
        if (data.photo_url) {
          setPhotoPreview(data.photo_url)
        }
      } else {
        // Criar perfil vazio se não existir
        setDoctorProfile({
          doctor_id: doctorId,
          show_on_landing: true
        })
      }
    } catch (error) {
      console.error('Erro ao carregar perfil do doutor:', error)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida')
      return
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB')
      return
    }

    setIsUploadingPhoto(true)

    try {
      // Criar preview local
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Aqui você pode implementar upload para Supabase Storage ou outro serviço
      // Por enquanto, vamos usar o preview local
      toast.success('Foto carregada! Clique em Salvar para confirmar.')
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error)
      toast.error('Erro ao fazer upload da foto')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const loadAuthorizedPatients = async (doctorUserId: string) => {
    try {
      console.log('🔄 Carregando pacientes autorizados para doutor:', doctorUserId)
      
      // Busca os IDs dos pacientes autorizados
      const { data: accessData, error: accessError } = await supabase
        .from('doctor_patient_access')
        .select('patient_id')
        .eq('doctor_user_id', doctorUserId)

      if (accessError) {
        console.error('❌ Erro ao buscar acessos:', accessError)
        return
      }

      if (!accessData || accessData.length === 0) {
        console.log('ℹ️ Nenhum paciente autorizado encontrado')
        setAuthorizedPatients([])
        return
      }

      const patientIds = accessData.map((item: any) => item.patient_id)
      console.log('📋 IDs dos pacientes:', patientIds)

      // Busca os dados completos dos pacientes
      const { data: patientsData, error: patientsError } = await supabase
        .from('user_profiles')
        .select('id, name, email, anxiety_type, access_code')
        .in('id', patientIds)

      if (patientsError) {
        console.error('❌ Erro ao buscar dados dos pacientes:', patientsError)
        return
      }

      console.log('✅ Pacientes carregados:', patientsData?.length || 0)
      setAuthorizedPatients(patientsData || [])
    } catch (error) {
      console.error('❌ Erro ao carregar pacientes autorizados:', error)
    }
  }

  const loadAppointments = async (doctorUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          user_profiles!appointments_patient_id_fkey (
            name
          )
        `)
        .eq('doctor_user_id', doctorUserId)
        .order('date', { ascending: true })

      if (!error && data) {
        const appointmentsData = data.map((apt: any) => ({
          ...apt,
          patient_name: apt.user_profiles?.name || 'Paciente'
        }))
        setAppointments(appointmentsData)
      }
    } catch (error) {
      console.error('Erro ao carregar consultas:', error)
    }
  }

  const loadConsultationPlans = async (doctorUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('consultation_plans')
        .select('*')
        .eq('doctor_user_id', doctorUserId)

      if (!error && data) {
        setConsultationPlans(data)
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
    }
  }

  const loadPatientReport = async (patientId: string) => {
    try {
      // Buscar dados de atividades do paciente
      const [moodData, medsData, habitsData, meditationData, chatData] = await Promise.all([
        supabase.from('mood_entries').select('*').eq('user_id', patientId),
        supabase.from('medication_logs').select('*').eq('user_id', patientId),
        supabase.from('habit_logs').select('*').eq('user_id', patientId),
        supabase.from('meditation_sessions').select('*').eq('user_id', patientId),
        supabase.from('chat_history').select('*').eq('user_id', patientId)
      ])

      const report: PatientReport = {
        mood_entries: moodData.data?.length || 0,
        medications_taken: medsData.data?.length || 0,
        habits_completed: habitsData.data?.length || 0,
        meditation_sessions: meditationData.data?.length || 0,
        chat_messages: chatData.data?.length || 0,
        last_activity: new Date().toISOString()
      }

      setSelectedPatientReport(report)
      setShowPatientReport(true)
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
      toast.error('Erro ao carregar relatório do paciente')
    }
  }

  const handleAccessCodeSubmit = async () => {
    if (!accessCodeInput.trim()) {
      toast.error('Digite o código de acesso')
      return
    }

    if (!user || !doctorInfo) {
      toast.error('Apenas doutores podem validar códigos')
      return
    }

    try {
      console.log('🔍 Iniciando validação do código:', accessCodeInput.toUpperCase())
      
      // PRIORIDADE 1: Buscar no Supabase
      const { data: profileWithCode, error: supabaseError } = await supabase
        .from('user_profiles')
        .select('id, name, email, anxiety_type, access_code')
        .eq('access_code', accessCodeInput.toUpperCase())
        .single()

      let patientData = null

      if (!supabaseError && profileWithCode) {
        // ✅ Encontrou no Supabase
        patientData = profileWithCode
        console.log('✅ Paciente encontrado no Supabase:', patientData.name)
      } else {
        // PRIORIDADE 2: Fallback para localStorage (migração)
        console.log('🔍 Código não encontrado no Supabase, buscando no localStorage...')
        
        const { data: allPatients, error: patientsError } = await supabase
          .from('user_profiles')
          .select('id, name, email, anxiety_type')

        if (patientsError) {
          console.error('❌ Erro ao buscar pacientes:', patientsError)
          throw patientsError
        }

        console.log(`📋 Verificando ${allPatients?.length || 0} pacientes no localStorage...`)

        // Procura o paciente com o código correspondente no localStorage
        for (const patient of allPatients || []) {
          const savedCode = localStorage.getItem(`access_code_${patient.id}`)
          console.log(`Verificando paciente ${patient.name}: código = ${savedCode}`)
          
          if (savedCode === accessCodeInput.toUpperCase()) {
            patientData = patient
            console.log('📦 Paciente encontrado via localStorage:', patient.name)
            
            // Tenta sincronizar o código com o Supabase
            const { error: syncError } = await supabase
              .from('user_profiles')
              .update({ access_code: savedCode })
              .eq('id', patient.id)
            
            if (syncError) {
              console.warn('⚠️ Não foi possível sincronizar código:', syncError)
            } else {
              console.log('✅ Código sincronizado com Supabase')
            }
            
            break
          }
        }
      }

      if (!patientData) {
        console.log('❌ Código não encontrado em nenhum local')
        toast.error('Código de acesso inválido')
        return
      }

      console.log('✅ Paciente identificado:', patientData.name)

      // Verifica se já tem acesso
      const { data: existingAccess } = await supabase
        .from('doctor_patient_access')
        .select('*')
        .eq('doctor_user_id', user.id)
        .eq('patient_id', patientData.id)
        .single()

      if (existingAccess) {
        console.log('ℹ️ Acesso já existe')
        toast.info('Você já tem acesso a este paciente')
        setShowAccessCodeModal(false)
        setAccessCodeInput('')
        return
      }

      console.log('💾 Registrando novo acesso...')

      // Registra o acesso (usando created_at em vez de granted_at)
      const { error: accessError } = await supabase
        .from('doctor_patient_access')
        .insert([{
          doctor_user_id: user.id,
          patient_id: patientData.id
        }])

      if (accessError) {
        console.error('❌ Erro ao registrar acesso:', accessError)
        throw accessError
      }

      console.log('✅ Acesso registrado com sucesso!')

      // Recarrega a lista de pacientes autorizados do banco de dados
      await loadAuthorizedPatients(user.id)
      
      toast.success(`Acesso concedido ao paciente ${patientData.name}!`)
      setShowAccessCodeModal(false)
      setAccessCodeInput('')
    } catch (error: any) {
      console.error('❌ Erro ao validar código:', error)
      toast.error('Erro ao validar código de acesso: ' + (error.message || 'Erro desconhecido'))
    }
  }

  const copyAccessCode = async () => {
    try {
      // Tenta usar a API moderna do Clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(userAccessCode)
        setCopiedCode(true)
        toast.success('Código copiado!')
        setTimeout(() => setCopiedCode(false), 2000)
      } else {
        // Fallback: método alternativo usando textarea temporário
        const textArea = document.createElement('textarea')
        textArea.value = userAccessCode
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        try {
          document.execCommand('copy')
          setCopiedCode(true)
          toast.success('Código copiado!')
          setTimeout(() => setCopiedCode(false), 2000)
        } catch (err) {
          console.error('Erro ao copiar:', err)
          toast.error('Não foi possível copiar. Copie manualmente: ' + userAccessCode)
        }
        
        textArea.remove()
      }
    } catch (err) {
      console.error('Erro ao copiar código:', err)
      toast.error('Não foi possível copiar. Copie manualmente: ' + userAccessCode)
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
      originalPrice: 24.90,
      discountedPrice: 24.90,
      buyerEmail: '',
      buyerName: ''
    })
    setShowDoctorSell(true)
  }

  const handleDoctorSell = async () => {
    try {
      // Redirecionar diretamente para o link do Hotmart
      const hotmartLink = 'https://pay.hotmart.com/P103056552X?sck=HOTMART_PRODUCT_PAGE&off=xfu3cyhr&hotfeature=32&_gl=1*1m9tg0l*_ga*MTE0NzcyODYwNS4xNzYzNzE3MDM5*_ga_GQH2V1F11Q*czE3NjM3MTcwMzckbzEkZzEkdDE3NjM3MjA1MzQkajYwJGwwJGgw*_gcl_au*MTI0NDM4ODg1MC4xNzYzNzE3MDM5LjE1Mzg3OTcyMDMuMTc2MzcxNzA4MS4xNzYzNzIwMzY1*FPAU*MTI0NDM4ODg1MC4xNzYzNzE3MDM5&bid=1763720540240'
      window.location.href = hotmartLink
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error)
      toast.error(error.message || 'Erro ao processar pagamento. Tente novamente.')
      setIsProcessingPayment(false)
    }
  }

  const handleSendMedication = async () => {
    if (!medicationForm.patientId || !medicationForm.medicationName) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    try {
      const { error } = await supabase
        .from('medications')
        .insert([{
          user_id: medicationForm.patientId,
          doctor_id: doctorInfo?.id,
          name: medicationForm.medicationName,
          dosage: medicationForm.dosage,
          frequency: medicationForm.frequency,
          instructions: medicationForm.instructions,
          prescribed_at: new Date().toISOString()
        }])

      if (error) throw error

      toast.success('Medicamento enviado com sucesso!')
      setShowSendMedication(false)
      setMedicationForm({
        patientId: '',
        medicationName: '',
        dosage: '',
        frequency: '',
        instructions: ''
      })
    } catch (error: any) {
      console.error('Erro ao enviar medicamento:', error)
      toast.error('Erro ao enviar medicamento')
    }
  }

  const handleScheduleAppointment = async () => {
    if (!appointmentForm.patientId || !appointmentForm.date || !appointmentForm.time) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .insert([{
          doctor_user_id: user?.id,
          patient_id: appointmentForm.patientId,
          date: appointmentForm.date,
          time: appointmentForm.time,
          notes: appointmentForm.notes,
          status: 'scheduled'
        }])

      if (error) throw error

      toast.success('Consulta agendada com sucesso!')
      setShowAppointmentModal(false)
      setAppointmentForm({
        patientId: '',
        date: '',
        time: '',
        notes: ''
      })
      if (user) loadAppointments(user.id)
    } catch (error: any) {
      console.error('Erro ao agendar consulta:', error)
      toast.error('Erro ao agendar consulta')
    }
  }

  const handleSaveFinancialInfo = async () => {
    if (!doctorInfo) return

    try {
      const { error } = await supabase
        .from('doctors')
        .update({
          pix_key: financialForm.pixKey,
          payment_link: financialForm.paymentLink
        })
        .eq('id', doctorInfo.id)

      if (error) throw error

      setDoctorInfo({ ...doctorInfo, pix_key: financialForm.pixKey, payment_link: financialForm.paymentLink })
      toast.success('Informações financeiras salvas!')
    } catch (error: any) {
      console.error('Erro ao salvar informações:', error)
      toast.error('Erro ao salvar informações financeiras')
    }
  }

  const handleCreatePlan = async () => {
    if (!planForm.name || planForm.price <= 0) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    try {
      const { error } = await supabase
        .from('consultation_plans')
        .insert([{
          doctor_user_id: user?.id,
          name: planForm.name,
          price: planForm.price,
          sessions: planForm.sessions,
          description: planForm.description
        }])

      if (error) throw error

      toast.success('Plano criado com sucesso!')
      setPlanForm({ name: '', price: 0, sessions: 1, description: '' })
      if (user) loadConsultationPlans(user.id)
    } catch (error: any) {
      console.error('Erro ao criar plano:', error)
      toast.error('Erro ao criar plano')
    }
  }

  const handleSaveDoctorInfo = async () => {
    if (!doctorInfo || !doctorProfile) return

    try {
      // Atualizar informações básicas do doutor
      const { error: doctorError } = await supabase
        .from('doctors')
        .update({
          name: doctorInfo.name,
          city: doctorInfo.city,
          address: doctorInfo.address,
          phone: doctorInfo.phone
        })
        .eq('id', doctorInfo.id)

      if (doctorError) throw doctorError

      // Atualizar ou criar perfil do doutor
      const profileData = {
        doctor_id: doctorInfo.id,
        photo_url: photoPreview || null,
        bio: doctorProfile.bio || null,
        show_on_landing: doctorProfile.show_on_landing,
        updated_at: new Date().toISOString()
      }

      if (doctorProfile.id) {
        // Atualizar perfil existente
        const { error: profileError } = await supabase
          .from('doctor_profiles')
          .update(profileData)
          .eq('id', doctorProfile.id)

        if (profileError) throw profileError
      } else {
        // Criar novo perfil
        const { data: newProfile, error: profileError } = await supabase
          .from('doctor_profiles')
          .insert([profileData])
          .select()
          .single()

        if (profileError) throw profileError
        setDoctorProfile(newProfile)
      }

      toast.success('Informações do doutor salvas!')
      setShowDoctorInfoModal(false)
    } catch (error: any) {
      console.error('Erro ao salvar informações:', error)
      toast.error('Erro ao salvar informações')
    }
  }

  const openPatientChat = async (patient: Patient) => {
    setSelectedPatient(patient)
    setShowPatientChat(true)
    
    // Carregar histórico de mensagens
    try {
      const { data, error } = await supabase
        .from('doctor_patient_messages')
        .select('*')
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .or(`sender_id.eq.${patient.id},receiver_id.eq.${patient.id}`)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setChatHistory(data)
      }
    } catch (error) {
      console.error('Erro ao carregar chat:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedPatient) return

    try {
      const { error } = await supabase
        .from('doctor_patient_messages')
        .insert([{
          sender_id: user?.id,
          receiver_id: selectedPatient.id,
          message: chatMessage,
          created_at: new Date().toISOString()
        }])

      if (error) throw error

      setChatMessage('')
      // Recarregar mensagens
      openPatientChat(selectedPatient)
      toast.success('Mensagem enviada!')
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem')
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
      'Meditação': '/meditation',
      'Regulação do Sono': '/sleep',
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

  const openSidePanel = (content: 'doctor' | 'meditation' | 'sleep' | 'chat') => {
    setSidePanelContent(content)
    setSidePanelOpen(true)
    setSidebarOpen(false) // Fecha o sidebar principal no mobile
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
        {/* Sidebar - mantém código existente */}
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
              
              {/* Painel do Doutor - Apenas para doutores */}
              {doctorInfo && (
                <Button 
                  onClick={() => openSidePanel('doctor')}
                  variant="ghost"
                  className="w-full justify-start gap-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                >
                  <Shield className="w-5 h-5" />
                  <span>Painel do Doutor</span>
                </Button>
              )}

              {/* Agendamento de Consultas - APENAS para doutores */}
              {doctorInfo && (
                <Button 
                  onClick={() => router.push('/scheduling')}
                  variant="ghost"
                  className="w-full justify-start gap-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Agendamento</span>
                </Button>
              )}
              
              <Button 
                onClick={() => handleNavigation('Registro de Humor')}
                variant="ghost"
                className="w-full justify-start gap-3"
              >
                <Activity className="w-5 h-5" />
                <span>Registro de Humor</span>
              </Button>
              <Button 
                onClick={() => openSidePanel('sleep')}
                variant="ghost"
                className="w-full justify-start gap-3"
              >
                <Moon className="w-5 h-5" />
                <span>Regulação do Sono</span>
              </Button>
              <Button 
                onClick={() => openSidePanel('meditation')}
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
                onClick={() => openSidePanel('chat')}
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

            {/* User Info & Actions - COM EXPANSÃO/CONTRAÇÃO */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
              {/* Header clicável para expandir/contrair */}
              <div 
                onClick={() => setIsUserInfoExpanded(!isUserInfoExpanded)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-2"
                  >
                    {isUserInfoExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                {/* Conteúdo expansível */}
                {isUserInfoExpanded && (
                  <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
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
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">👨‍⚕️ Doutor</p>
                        <p className="text-xs text-muted-foreground">{doctorInfo.specialty}</p>
                      </div>
                    )}
                    {/* Código de Acesso */}
                    {userAccessCode && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">🔑 Código de Acesso</p>
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                          <span className="text-sm font-bold text-blue-700 dark:text-blue-300 flex-1 tracking-wider">
                            {userAccessCode}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyAccessCode()
                            }}
                            className="h-6 w-6 p-0"
                          >
                            {copiedCode ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-blue-600" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Botões de ação */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUserAccessCode(true)}
                className="w-full gap-2 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20"
              >
                <Key className="w-4 h-4" />
                Ver Código Completo
              </Button>
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
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openDoctorSell}
                    className="w-full gap-2 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20"
                  >
                    <DollarSign className="w-4 h-4" />
                    Vender Acesso
                  </Button>
                </>
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

        {/* Main Content - mantém código existente */}
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

          {/* Main Content Area - mantém código existente, apenas adiciona seção de dados do doutor com foto */}
          <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              {/* Welcome Section */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Olá, {user.name}! 👋</h2>
                <p className="text-muted-foreground">
                  Bem-vindo ao seu painel de controle. Aqui você pode acompanhar seu progresso e gerenciar seu tratamento.
                </p>
                
                {/* Card de Código de Acesso - Destaque no topo */}
                {userAccessCode && (
                  <div className="mt-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Seu Código de Acesso</h3>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                          Compartilhe este código com seu doutor para que ele possa acessar seus relatórios e prescrever medicamentos.
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                              {userAccessCode}
                            </span>
                          </div>
                          <Button
                            onClick={copyAccessCode}
                            variant="outline"
                            className="gap-2 border-blue-300 hover:bg-blue-100 dark:border-blue-700 dark:hover:bg-blue-900/30"
                          >
                            {copiedCode ? (
                              <>
                                <Check className="w-4 h-4" />
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copiar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {doctorInfo && (
                  <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100">Painel do Doutor</h3>
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                      {doctorInfo.specialty} - {doctorInfo.crm}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => openSidePanel('doctor')}
                        className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        <Shield className="w-4 h-4" />
                        Acessar Painel
                      </Button>
                      <Button
                        onClick={openDoctorSell}
                        className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        <DollarSign className="w-4 h-4" />
                        Vender Acesso
                      </Button>
                      <Button
                        onClick={() => setShowDoctorInfoModal(true)}
                        className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                      >
                        <User className="w-4 h-4" />
                        Meus Dados
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Cards - mantém código existente */}
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

              {/* User Info Card - mantém código existente, adiciona foto do doutor */}
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

                  {/* Informações do Doutor - Exibido para todos os usuários */}
                  {doctorInfo && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-600" />
                        Dados do Doutor
                      </h3>
                      
                      {/* Foto do Doutor */}
                      {photoPreview && (
                        <div className="mb-4 flex justify-center">
                          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-200 dark:border-purple-800">
                            <img 
                              src={photoPreview} 
                              alt={doctorInfo.name || 'Foto do Doutor'} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-sm text-muted-foreground">Nome</p>
                            <p className="font-semibold">{doctorInfo.name || 'Não informado'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-sm text-muted-foreground">Cidade</p>
                            <p className="font-semibold">{doctorInfo.city || 'Não informado'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Building className="w-4 h-4 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-sm text-muted-foreground">Endereço</p>
                            <p className="font-semibold">{doctorInfo.address || 'Não informado'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-sm text-muted-foreground">Telefone</p>
                            <p className="font-semibold">{doctorInfo.phone || 'Não informado'}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowDoctorInfoModal(true)}
                        variant="outline"
                        className="mt-4 gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Editar Dados do Doutor
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Features Grid - mantém código existente */}
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
                      onClick={() => openSidePanel('meditation')}
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
                      onClick={() => openSidePanel('chat')}
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

        {/* Painel Lateral - mantém código existente */}
        {sidePanelOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setSidePanelOpen(false)}
            />
            
            {/* Painel - código existente mantido */}
            <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] lg:w-[600px] bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
              {/* Header do Painel */}
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidePanelOpen(false)}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="text-xl font-bold">
                    {sidePanelContent === 'doctor' && 'Painel do Doutor'}
                    {sidePanelContent === 'meditation' && 'Meditação'}
                    {sidePanelContent === 'sleep' && 'Regulação do Sono'}
                    {sidePanelContent === 'chat' && 'Chat IA'}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidePanelOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Conteúdo do Painel - mantém código existente */}
              <div className="p-6">
                {sidePanelContent === 'doctor' && doctorInfo && (
                  <Tabs defaultValue="patients" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="patients">Pacientes</TabsTrigger>
                      <TabsTrigger value="appointments">Consultas</TabsTrigger>
                      <TabsTrigger value="reports">Relatórios</TabsTrigger>
                    </TabsList>

                    {/* Aba: Pacientes - mantém código existente */}
                    <TabsContent value="patients" className="space-y-4">
                      <div className="grid gap-4">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowAccessCodeModal(true)}>
                          <CardContent className="pt-6 text-center">
                            <Key className="w-8 h-8 mx-auto mb-2 text-green-600" />
                            <p className="font-semibold">Adicionar Paciente</p>
                            <p className="text-xs text-muted-foreground mt-1">Usar código de acesso</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                          setSidePanelOpen(false)
                          setTimeout(() => setShowSendMedication(true), 300)
                        }}>
                          <CardContent className="pt-6 text-center">
                            <Pill className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                            <p className="font-semibold">Enviar Medicamento</p>
                            <p className="text-xs text-muted-foreground mt-1">Prescrever para paciente</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardContent className="pt-6 text-center">
                            <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                            <p className="font-semibold">{authorizedPatients.length}</p>
                            <p className="text-xs text-muted-foreground mt-1">Pacientes Autorizados</p>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Seus Pacientes</h3>
                        {authorizedPatients.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                            <Key className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p className="text-gray-600 dark:text-gray-400 mb-2">Nenhum paciente autorizado ainda</p>
                            <p className="text-sm text-muted-foreground mb-4">Solicite o código de acesso do paciente para começar</p>
                            <Button
                              onClick={() => setShowAccessCodeModal(true)}
                              className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            >
                              <Key className="w-4 h-4" />
                              Adicionar Primeiro Paciente
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {authorizedPatients.map((patient) => (
                              <div key={patient.id} className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900 dark:text-white">{patient.name}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{patient.email}</p>
                                  <p className="text-xs text-muted-foreground capitalize">
                                    {patient.anxiety_type === 'social' && 'Ansiedade Social'}
                                    {patient.anxiety_type === 'panic' && 'Transtorno do Pânico'}
                                    {patient.anxiety_type === 'general' && 'Ansiedade Generalizada'}
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedPatient(patient)
                                      loadPatientReport(patient.id)
                                    }}
                                    className="gap-1 flex-1"
                                  >
                                    <FileText className="w-4 h-4" />
                                    Relatório
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openPatientChat(patient)}
                                    className="gap-1 flex-1"
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                    Chat
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setMedicationForm({ ...medicationForm, patientId: patient.id })
                                      setSidePanelOpen(false)
                                      setTimeout(() => setShowSendMedication(true), 300)
                                    }}
                                    className="gap-1 bg-blue-600 hover:bg-blue-700 flex-1"
                                  >
                                    <Pill className="w-4 h-4" />
                                    Medicar
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Aba: Consultas - mantém código existente */}
                    <TabsContent value="appointments" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Agenda de Consultas</h3>
                        <Button
                          onClick={() => setShowAppointmentModal(true)}
                          size="sm"
                          className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                        >
                          <Calendar className="w-4 h-4" />
                          Agendar
                        </Button>
                      </div>

                      {appointments.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-gray-600 dark:text-gray-400 mb-2">Nenhuma consulta agendada</p>
                          <Button
                            onClick={() => setShowAppointmentModal(true)}
                            size="sm"
                            className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                          >
                            <Calendar className="w-4 h-4" />
                            Agendar Primeira Consulta
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {appointments.map((apt) => (
                            <div key={apt.id} className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{apt.patient_name}</p>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {new Date(apt.date).toLocaleDateString('pt-BR')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {apt.time}
                                    </span>
                                  </div>
                                  {apt.notes && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{apt.notes}</p>
                                  )}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  apt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                  apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {apt.status === 'scheduled' && 'Agendada'}
                                  {apt.status === 'completed' && 'Concluída'}
                                  {apt.status === 'cancelled' && 'Cancelada'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    {/* Aba: Relatórios - mantém código existente */}
                    <TabsContent value="reports" className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Relatórios de Pacientes</h3>
                      {authorizedPatients.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-gray-600 dark:text-gray-400">Adicione pacientes para visualizar relatórios</p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {authorizedPatients.map((patient) => (
                            <Card key={patient.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                              setSelectedPatient(patient)
                              loadPatientReport(patient.id)
                            }}>
                              <CardContent className="pt-6">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {patient.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{patient.name}</p>
                                    <p className="text-sm text-muted-foreground">{patient.email}</p>
                                  </div>
                                </div>
                                <Button className="w-full gap-2" variant="outline">
                                  <FileText className="w-4 h-4" />
                                  Ver Relatório Completo
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}

                {sidePanelContent === 'meditation' && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">Conteúdo de Meditação será exibido aqui</p>
                    <Button onClick={() => router.push('/meditation')} className="w-full">
                      Ir para Página Completa
                    </Button>
                  </div>
                )}

                {sidePanelContent === 'sleep' && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">Conteúdo de Regulação do Sono será exibido aqui</p>
                    <Button onClick={() => router.push('/sleep')} className="w-full">
                      Ir para Página Completa
                    </Button>
                  </div>
                )}

                {sidePanelContent === 'chat' && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">Conteúdo do Chat IA será exibido aqui</p>
                    <Button onClick={() => router.push('/dashboard/chat')} className="w-full">
                      Ir para Página Completa
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Modais existentes - mantém código, adiciona modal de dados do doutor com upload de foto */}
        {/* Modal: Código de Acesso do Usuário - mantém código existente */}
        <Dialog open={showUserAccessCode} onOpenChange={setShowUserAccessCode}>
          <DialogContent className="bg-white dark:bg-slate-800 border-blue-500/20">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                Seu Código de Acesso
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Compartilhe este código com seu doutor para que ele possa acessar seus relatórios
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800 text-center">
                <p className="text-sm text-muted-foreground mb-2">Seu código único:</p>
                {isGeneratingCode ? (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">Gerando código...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 tracking-wider mb-4">
                      {userAccessCode || 'Carregando...'}
                    </p>
                    <Button
                      onClick={copyAccessCode}
                      variant="outline"
                      className="gap-2"
                      disabled={!userAccessCode}
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar Código
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>⚠️ Importante:</strong> Compartilhe este código apenas com profissionais de saúde de sua confiança. 
                  Com este código, o doutor terá acesso aos seus relatórios e poderá prescrever medicamentos.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setShowUserAccessCode(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: Inserir Código de Acesso - mantém código existente */}
        <Dialog open={showAccessCodeModal} onOpenChange={setShowAccessCodeModal}>
          <DialogContent className="bg-white dark:bg-slate-800 border-green-500/20">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-green-600" />
                Adicionar Paciente
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Digite o código de acesso fornecido pelo paciente
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="access_code" className="text-gray-700 dark:text-gray-300">Código de Acesso</Label>
                <Input
                  id="access_code"
                  value={accessCodeInput}
                  onChange={(e) => setAccessCodeInput(e.target.value.toUpperCase())}
                  placeholder="Ex: ABC12345"
                  maxLength={8}
                  className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-center text-2xl font-bold tracking-wider"
                />
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>ℹ️ Como funciona:</strong> O paciente deve fornecer o código de acesso único dele. 
                  Com este código, você terá acesso aos relatórios e poderá prescrever medicamentos.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowAccessCodeModal(false)
                setAccessCodeInput('')
              }}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAccessCodeSubmit}
                className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Key className="w-4 h-4" />
                Validar Código
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: Enviar Medicamento - mantém código existente */}
        <Dialog open={showSendMedication} onOpenChange={setShowSendMedication}>
          <DialogContent className="bg-white dark:bg-slate-800 border-blue-500/20">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-600" />
                Enviar Medicamento
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Prescreva medicamento para o paciente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="patient" className="text-gray-700 dark:text-gray-300">Paciente *</Label>
                <select
                  id="patient"
                  value={medicationForm.patientId}
                  onChange={(e) => setMedicationForm({ ...medicationForm, patientId: e.target.value })}
                  className="w-full mt-1 p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white"
                >
                  <option value="">Selecione um paciente</option>
                  {authorizedPatients.map((patient) => (
                    <option key={patient.id} value={patient.id}>{patient.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="medication_name" className="text-gray-700 dark:text-gray-300">Nome do Medicamento *</Label>
                <Input
                  id="medication_name"
                  value={medicationForm.medicationName}
                  onChange={(e) => setMedicationForm({ ...medicationForm, medicationName: e.target.value })}
                  placeholder="Ex: Sertralina"
                  className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="dosage" className="text-gray-700 dark:text-gray-300">Dosagem</Label>
                <Input
                  id="dosage"
                  value={medicationForm.dosage}
                  onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                  placeholder="Ex: 50mg"
                  className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="frequency" className="text-gray-700 dark:text-gray-300">Frequência</Label>
                <Input
                  id="frequency"
                  value={medicationForm.frequency}
                  onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })}
                  placeholder="Ex: 1x ao dia"
                  className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="instructions" className="text-gray-700 dark:text-gray-300">Instruções</Label>
                <Textarea
                  id="instructions"
                  value={medicationForm.instructions}
                  onChange={(e) => setMedicationForm({ ...medicationForm, instructions: e.target.value })}
                  placeholder="Instruções adicionais para o paciente..."
                  className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSendMedication(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSendMedication} className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Send className="w-4 h-4" />
                Enviar Medicamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: Chat com Paciente - mantém código existente */}
        <Dialog open={showPatientChat} onOpenChange={setShowPatientChat}>
          <DialogContent className="bg-white dark:bg-slate-800 border-green-500/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                Chat com {selectedPatient?.name}
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                {selectedPatient?.email}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Histórico de mensagens */}
              <div className="h-96 overflow-y-auto bg-gray-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
                {chatHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground">Nenhuma mensagem ainda. Inicie a conversa!</p>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.sender_id === user?.id
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input de mensagem */}
              <div className="flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
                <Button onClick={handleSendMessage} className="bg-green-600 hover:bg-green-700 gap-2">
                  <Send className="w-4 h-4" />
                  Enviar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal: Relatório do Paciente - mantém código existente */}
        <Dialog open={showPatientReport} onOpenChange={setShowPatientReport}>
          <DialogContent className="bg-white dark:bg-slate-800 border-purple-500/20 max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Relatório de {selectedPatient?.name}
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Atividades do paciente na plataforma por categoria
              </DialogDescription>
            </DialogHeader>

            {selectedPatientReport && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Activity className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold">{selectedPatientReport.mood_entries}</p>
                      <p className="text-sm text-muted-foreground">Registros de Humor</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Pill className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold">{selectedPatientReport.medications_taken}</p>
                      <p className="text-sm text-muted-foreground">Medicamentos Tomados</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold">{selectedPatientReport.habits_completed}</p>
                      <p className="text-sm text-muted-foreground">Hábitos Completados</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Music className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
                      <p className="text-2xl font-bold">{selectedPatientReport.meditation_sessions}</p>
                      <p className="text-sm text-muted-foreground">Sessões de Meditação</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 text-pink-600" />
                      <p className="text-2xl font-bold">{selectedPatientReport.chat_messages}</p>
                      <p className="text-sm text-muted-foreground">Mensagens no Chat IA</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                      <p className="text-sm font-semibold">Última Atividade</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(selectedPatientReport.last_activity).toLocaleDateString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setShowPatientReport(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: Agendar Consulta - mantém código existente */}
        <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
          <DialogContent className="bg-white dark:bg-slate-800 border-blue-500/20">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Agendar Consulta
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Organize sua agenda de consultas com pacientes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="apt_patient" className="text-gray-700 dark:text-gray-300">Paciente *</Label>
                <select
                  id="apt_patient"
                  value={appointmentForm.patientId}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, patientId: e.target.value })}
                  className="w-full mt-1 p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white"
                >
                  <option value="">Selecione um paciente</option>
                  {authorizedPatients.map((patient) => (
                    <option key={patient.id} value={patient.id}>{patient.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="apt_date" className="text-gray-700 dark:text-gray-300">Data *</Label>
                  <Input
                    id="apt_date"
                    type="date"
                    value={appointmentForm.date}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                    className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="apt_time" className="text-gray-700 dark:text-gray-300">Horário *</Label>
                  <Input
                    id="apt_time"
                    type="time"
                    value={appointmentForm.time}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                    className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="apt_notes" className="text-gray-700 dark:text-gray-300">Observações</Label>
                <Textarea
                  id="apt_notes"
                  value={appointmentForm.notes}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                  placeholder="Anotações sobre a consulta..."
                  className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAppointmentModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleScheduleAppointment} className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Calendar className="w-4 h-4" />
                Agendar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: Painel Financeiro - mantém código existente */}
        <Dialog open={showFinancialPanel} onOpenChange={setShowFinancialPanel}>
          <DialogContent className="bg-white dark:bg-slate-800 border-green-500/20 max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                Painel Financeiro
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Gerencie suas informações de pagamento e planos de consulta
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="payment" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="payment">Dados de Pagamento</TabsTrigger>
                <TabsTrigger value="plans">Planos de Consulta</TabsTrigger>
              </TabsList>

              {/* Aba: Dados de Pagamento */}
              <TabsContent value="payment" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pix_key" className="text-gray-700 dark:text-gray-300">Chave PIX</Label>
                    <Input
                      id="pix_key"
                      value={financialForm.pixKey}
                      onChange={(e) => setFinancialForm({ ...financialForm, pixKey: e.target.value })}
                      placeholder="Digite sua chave PIX (CPF, e-mail, telefone ou chave aleatória)"
                      className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment_link" className="text-gray-700 dark:text-gray-300">Link de Pagamento</Label>
                    <Input
                      id="payment_link"
                      value={financialForm.paymentLink}
                      onChange={(e) => setFinancialForm({ ...financialForm, paymentLink: e.target.value })}
                      placeholder="Cole o link do seu gateway de pagamento (Mercado Pago, PagSeguro, etc.)"
                      className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <Button onClick={handleSaveFinancialInfo} className="w-full gap-2 bg-green-600 hover:bg-green-700">
                    <CreditCard className="w-4 h-4" />
                    Salvar Informações
                  </Button>
                </div>
              </TabsContent>

              {/* Aba: Planos de Consulta */}
              <TabsContent value="plans" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Criar Novo Plano</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plan_name" className="text-gray-700 dark:text-gray-300">Nome do Plano *</Label>
                      <Input
                        id="plan_name"
                        value={planForm.name}
                        onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                        placeholder="Ex: Pacote 5 Consultas"
                        className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="plan_price" className="text-gray-700 dark:text-gray-300">Preço (R$) *</Label>
                      <Input
                        id="plan_price"
                        type="number"
                        value={planForm.price}
                        onChange={(e) => setPlanForm({ ...planForm, price: parseFloat(e.target.value) })}
                        placeholder="0.00"
                        className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="plan_sessions" className="text-gray-700 dark:text-gray-300">Número de Sessões</Label>
                      <Input
                        id="plan_sessions"
                        type="number"
                        value={planForm.sessions}
                        onChange={(e) => setPlanForm({ ...planForm, sessions: parseInt(e.target.value) })}
                        placeholder="1"
                        className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="plan_description" className="text-gray-700 dark:text-gray-300">Descrição</Label>
                      <Textarea
                        id="plan_description"
                        value={planForm.description}
                        onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                        placeholder="Descreva o que está incluído neste plano..."
                        className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreatePlan} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                    <DollarSign className="w-4 h-4" />
                    Criar Plano
                  </Button>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Planos Cadastrados</h3>
                  {consultationPlans.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Nenhum plano cadastrado ainda</p>
                  ) : (
                    <div className="space-y-3">
                      {consultationPlans.map((plan) => (
                        <div key={plan.id} className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{plan.name}</p>
                              <p className="text-sm text-muted-foreground">{plan.sessions} sessões</p>
                              {plan.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{plan.description}</p>
                              )}
                            </div>
                            <p className="text-xl font-bold text-green-600">R$ {plan.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Modal: Dados do Doutor COM UPLOAD DE FOTO */}
        <Dialog open={showDoctorInfoModal} onOpenChange={setShowDoctorInfoModal}>
          <DialogContent className="bg-white dark:bg-slate-800 border-purple-500/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Dados do Doutor
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Informações de contato e foto exibidas para os pacientes e na landing page
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Upload de Foto */}
              <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <Label className="text-gray-700 dark:text-gray-300 font-semibold">Foto de Perfil</Label>
                {photoPreview ? (
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-200 dark:border-purple-800">
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPhotoPreview('')}
                      className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-dashed border-gray-300 dark:border-gray-600">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="flex gap-2">
                  <Label htmlFor="photo_upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
                      <Upload className="w-4 h-4" />
                      {photoPreview ? 'Trocar Foto' : 'Adicionar Foto'}
                    </div>
                  </Label>
                  <Input
                    id="photo_upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
                </p>
              </div>

              {/* Campos de informação */}
              <div>
                <Label htmlFor="doctor_name" className="text-gray-700 dark:text-gray-300">Nome Completo</Label>
                <Input
                  id="doctor_name"
                  value={doctorInfo?.name || ''}
                  onChange={(e) => setDoctorInfo({ ...doctorInfo!, name: e.target.value })}
                  placeholder="Dr. João Silva"
                  className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="doctor_city" className="text-gray-700 dark:text-gray-300">Cidade</Label>
                <Input
                  id="doctor_city"
                  value={doctorInfo?.city || ''}
                  onChange={(e) => setDoctorInfo({ ...doctorInfo!, city: e.target.value })}
                  placeholder="São Paulo - SP"
                  className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="doctor_address" className="text-gray-700 dark:text-gray-300">Endereço</Label>
                <Input
                  id="doctor_address"
                  value={doctorInfo?.address || ''}
                  onChange={(e) => setDoctorInfo({ ...doctorInfo!, address: e.target.value })}
                  placeholder="Rua Exemplo, 123 - Centro"
                  className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="doctor_phone" className="text-gray-700 dark:text-gray-300">Telefone para Contato</Label>
                <Input
                  id="doctor_phone"
                  value={doctorInfo?.phone || ''}
                  onChange={(e) => setDoctorInfo({ ...doctorInfo!, phone: e.target.value })}
                  placeholder="(11) 98765-4321"
                  className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="doctor_bio" className="text-gray-700 dark:text-gray-300">Biografia (opcional)</Label>
                <Textarea
                  id="doctor_bio"
                  value={doctorProfile?.bio || ''}
                  onChange={(e) => setDoctorProfile({ ...doctorProfile!, bio: e.target.value })}
                  placeholder="Conte um pouco sobre sua experiência e especialização..."
                  className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="show_on_landing"
                  checked={doctorProfile?.show_on_landing ?? true}
                  onChange={(e) => setDoctorProfile({ ...doctorProfile!, show_on_landing: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="show_on_landing" className="text-gray-700 dark:text-gray-300 cursor-pointer">
                  Exibir meu perfil na página de divulgação de médicos especialistas
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDoctorInfoModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveDoctorInfo} className="bg-purple-600 hover:bg-purple-700 gap-2" disabled={isUploadingPhoto}>
                {isUploadingPhoto ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    Salvar Dados
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: Venda de Doutor com Link Hotmart */}
        <Dialog open={showDoctorSell} onOpenChange={setShowDoctorSell}>
          <DialogContent className="bg-white dark:bg-slate-800 border-purple-500/20">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                Vender Acesso Premium
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Redirecionar para página de pagamento
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                <div className="flex justify-between pt-2">
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">Valor:</span>
                  <span className="text-orange-600 dark:text-orange-400 font-bold text-2xl">R$ {sellData.discountedPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Ao clicar em "Ir para Pagamento", você será redirecionado para o checkout seguro
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
