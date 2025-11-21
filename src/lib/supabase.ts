import { createClient } from '@supabase/supabase-js'

// Função para obter variáveis de ambiente de forma segura
function getEnvVars() {
  // No cliente (browser), usa variáveis públicas
  if (typeof window !== 'undefined') {
    return {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    }
  }
  
  // No servidor, pode usar qualquer variável
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
  }
}

// Função para criar cliente Supabase em runtime
export function getSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = getEnvVars()
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // Em vez de lançar erro, retorna um cliente mock para desenvolvimento
    console.warn('⚠️ Variáveis de ambiente do Supabase não configuradas')
    
    // Retorna um cliente mock que não quebra a aplicação
    return createClient(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'
    )
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Cliente lazy - só inicializa quando usado
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    if (!supabaseInstance) {
      supabaseInstance = getSupabaseClient()
    }
    return (supabaseInstance as any)[prop]
  }
})

// Types
export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  age: string
  gender: string
  city: string
  anxiety_type: 'social' | 'panic' | 'general' | null
  triage_completed: boolean
  is_premium: boolean
  password: string
  points: number
  created_at: string
  updated_at: string
}

export interface Medication {
  id: string
  user_id: string
  name: string
  dosage: string
  frequency: string
  time: string
  notes: string
  interactions: string[]
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  title: string
  description: string
  completed: boolean
  streak: number
  selected_days: string[]
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  completed: boolean
  due_date: string
  created_at: string
}

export interface MoodEntry {
  id: string
  user_id: string
  date: string
  time: string
  mood: string
  anxiety_level: number
  stress_level: number
  triggers: string[]
  location: string
  people: string
  situation: string
  notes: string
  created_at: string
}

export interface ExposureStep {
  id: string
  user_id: string
  description: string
  anxiety_level: number
  completed: boolean
  date?: string
  created_at: string
}

export interface Article {
  id: string
  user_id: string
  title: string
  category: string
  content: string
  read_time: string
  read: boolean
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  created_at: string
}

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// User Profile Functions
export async function createUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('user_profiles')
    .insert([profile])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserProfile(email: string) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateUserProfile(id: string, updates: Partial<UserProfile>) {
  // Valida se é um UUID válido
  if (!isValidUUID(id)) {
    throw new Error('ID de usuário inválido. Por favor, faça login novamente.')
  }

  const client = getSupabaseClient()
  const { data, error } = await client
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteUserAccount(userId: string) {
  // Valida se é um UUID válido antes de tentar deletar
  if (!isValidUUID(userId)) {
    throw new Error('Não é possível deletar conta de usuário demo. Por favor, crie uma conta real primeiro.')
  }

  const client = getSupabaseClient()
  
  // Deleta todos os dados relacionados ao usuário
  const tables = [
    'chat_messages',
    'articles',
    'exposure_steps',
    'mood_entries',
    'tasks',
    'habits',
    'medications',
    'user_profiles'
  ]

  for (const table of tables) {
    const { error } = await client
      .from(table)
      .delete()
      .eq(table === 'user_profiles' ? 'id' : 'user_id', userId)

    if (error) {
      console.error(`Erro ao deletar dados da tabela ${table}:`, error)
      throw error
    }
  }

  return { success: true }
}

export async function cancelSubscription(userId: string) {
  // Valida se é um UUID válido
  if (!isValidUUID(userId)) {
    throw new Error('Não é possível cancelar assinatura de usuário demo. Por favor, faça login com uma conta real.')
  }

  const client = getSupabaseClient()
  const { data, error } = await client
    .from('user_profiles')
    .update({ 
      is_premium: false,
      updated_at: new Date().toISOString() 
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Medications Functions
export async function getMedications(userId: string) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('medications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createMedication(medication: Omit<Medication, 'id' | 'created_at'>) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('medications')
    .insert([medication])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMedication(id: string) {
  const client = getSupabaseClient()
  const { error } = await client
    .from('medications')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Habits Functions
export async function getHabits(userId: string) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createHabit(habit: Omit<Habit, 'id' | 'created_at'>) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('habits')
    .insert([habit])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateHabit(id: string, updates: Partial<Habit>) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('habits')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteHabit(id: string) {
  const client = getSupabaseClient()
  const { error } = await client
    .from('habits')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Tasks Functions
export async function getTasks(userId: string) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createTask(task: Omit<Task, 'id' | 'created_at'>) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('tasks')
    .insert([task])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTask(id: string) {
  const client = getSupabaseClient()
  const { error } = await client
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Mood Entries Functions
export async function getMoodEntries(userId: string) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createMoodEntry(entry: Omit<MoodEntry, 'id' | 'created_at'>) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('mood_entries')
    .insert([entry])
    .select()
    .single()

  if (error) throw error
  return data
}

// Exposure Steps Functions
export async function getExposureSteps(userId: string) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('exposure_steps')
    .select('*')
    .eq('user_id', userId)
    .order('anxiety_level', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createExposureStep(step: Omit<ExposureStep, 'id' | 'created_at'>) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('exposure_steps')
    .insert([step])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateExposureStep(id: string, updates: Partial<ExposureStep>) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('exposure_steps')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteExposureStep(id: string) {
  const client = getSupabaseClient()
  const { error } = await client
    .from('exposure_steps')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Articles Functions
export async function getArticles(userId: string) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('articles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function updateArticle(id: string, updates: Partial<Article>) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Chat Messages Functions
export async function getChatMessages(userId: string) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createChatMessage(message: Omit<ChatMessage, 'id' | 'created_at'>) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('chat_messages')
    .insert([message])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function sendWelcomeEmail(email: string, password: string, name: string) {
  const client = getSupabaseClient()
  
  // Chama Edge Function do Supabase para enviar email
  const { data, error } = await client.functions.invoke('send-welcome-email', {
    body: {
      email,
      password,
      name
    }
  })

  if (error) {
    console.error('Erro ao enviar email:', error)
    // Fallback: log no console se Edge Function não estiver configurada
    console.log(`📧 Email para ${email}:`)
    console.log(`Assunto: Bem-vindo ao ZentiaMind Premium!`)
    console.log(`Olá ${name},`)
    console.log(`Suas credenciais de acesso:`)
    console.log(`Email: ${email}`)
    console.log(`Senha: ${password}`)
    return { success: false, fallback: true }
  }

  return { success: true, data }
}
