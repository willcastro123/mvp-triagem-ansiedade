import type {
  UserProfile as SupabaseUserProfile,
  Medication as SupabaseMedication,
  Habit as SupabaseHabit,
  Task as SupabaseTask,
  MoodEntry as SupabaseMoodEntry,
  ExposureStep as SupabaseExposureStep,
  Article as SupabaseArticle,
  ChatMessage as SupabaseChatMessage
} from '@/lib/supabase'

// Tipos do app (formato original)
export interface AppUserProfile {
  name: string
  email: string
  phone: string
  age: string
  gender: string
  city: string
  anxietyType: 'social' | 'panic' | 'general' | null
  triageCompleted: boolean
  isPremium: boolean
  password?: string
  points: number
}

export interface AppMedication {
  id: string
  name: string
  dosage: string
  frequency: string
  time: string
  notes: string
  interactions: string[]
}

export interface AppHabit {
  id: string
  title: string
  description: string
  completed: boolean
  streak: number
  selectedDays: string[]
}

export interface AppTask {
  id: string
  title: string
  completed: boolean
  dueDate: string
}

export interface AppMoodEntry {
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

export interface AppExposureStep {
  id: string
  description: string
  anxietyLevel: number
  completed: boolean
  date?: string
}

export interface AppArticle {
  id: string
  title: string
  category: string
  content: string
  readTime: string
  read: boolean
}

export interface AppChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// Conversores: Supabase -> App
export function supabaseToAppProfile(profile: SupabaseUserProfile): AppUserProfile {
  return {
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    age: profile.age,
    gender: profile.gender,
    city: profile.city,
    anxietyType: profile.anxiety_type,
    triageCompleted: profile.triage_completed,
    isPremium: profile.is_premium,
    password: profile.password,
    points: profile.points
  }
}

export function supabaseToAppMedication(med: SupabaseMedication): AppMedication {
  return {
    id: med.id,
    name: med.name,
    dosage: med.dosage,
    frequency: med.frequency,
    time: med.time,
    notes: med.notes,
    interactions: med.interactions
  }
}

export function supabaseToAppHabit(habit: SupabaseHabit): AppHabit {
  return {
    id: habit.id,
    title: habit.title,
    description: habit.description || '',
    completed: habit.completed,
    streak: habit.streak,
    selectedDays: habit.selected_days || []
  }
}

export function supabaseToAppTask(task: SupabaseTask): AppTask {
  return {
    id: task.id,
    title: task.title,
    completed: task.completed,
    dueDate: task.due_date
  }
}

export function supabaseToAppMoodEntry(entry: SupabaseMoodEntry): AppMoodEntry {
  return {
    id: entry.id,
    date: entry.date,
    time: entry.time,
    mood: entry.mood,
    anxietyLevel: entry.anxiety_level,
    stressLevel: entry.stress_level,
    triggers: entry.triggers || [],
    location: entry.location,
    people: entry.people,
    situation: entry.situation,
    notes: entry.notes
  }
}

export function supabaseToAppExposureStep(step: SupabaseExposureStep): AppExposureStep {
  return {
    id: step.id,
    description: step.description,
    anxietyLevel: step.anxiety_level,
    completed: step.completed,
    date: step.date
  }
}

export function supabaseToAppArticle(article: SupabaseArticle): AppArticle {
  return {
    id: article.id,
    title: article.title,
    category: article.category,
    content: article.content,
    readTime: article.read_time,
    read: article.read
  }
}

export function supabaseToAppChatMessage(message: SupabaseChatMessage): AppChatMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp
  }
}

// Conversores: App -> Supabase
export function appToSupabaseProfile(profile: AppUserProfile, userId?: string): Partial<SupabaseUserProfile> {
  return {
    ...(userId && { id: userId }),
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    age: profile.age,
    gender: profile.gender,
    city: profile.city,
    anxiety_type: profile.anxietyType,
    triage_completed: profile.triageCompleted,
    is_premium: profile.isPremium,
    password: profile.password || '',
    points: profile.points
  }
}

export function appToSupabaseMedication(med: Omit<AppMedication, 'id'>, userId: string): Omit<SupabaseMedication, 'id' | 'created_at'> {
  return {
    user_id: userId,
    name: med.name,
    dosage: med.dosage,
    frequency: med.frequency,
    time: med.time,
    notes: med.notes,
    interactions: med.interactions
  }
}

export function appToSupabaseHabit(habit: Omit<AppHabit, 'id'>, userId: string): Omit<SupabaseHabit, 'id' | 'created_at'> {
  return {
    user_id: userId,
    title: habit.title,
    description: habit.description,
    completed: habit.completed,
    streak: habit.streak,
    selected_days: habit.selectedDays
  }
}

export function appToSupabaseTask(task: Omit<AppTask, 'id'>, userId: string): Omit<SupabaseTask, 'id' | 'created_at'> {
  return {
    user_id: userId,
    title: task.title,
    completed: task.completed,
    due_date: task.dueDate
  }
}

export function appToSupabaseMoodEntry(entry: Omit<AppMoodEntry, 'id'>, userId: string): Omit<SupabaseMoodEntry, 'id' | 'created_at'> {
  return {
    user_id: userId,
    date: entry.date,
    time: entry.time,
    mood: entry.mood,
    anxiety_level: entry.anxietyLevel,
    stress_level: entry.stressLevel,
    triggers: entry.triggers,
    location: entry.location,
    people: entry.people,
    situation: entry.situation,
    notes: entry.notes
  }
}

export function appToSupabaseExposureStep(step: Omit<AppExposureStep, 'id'>, userId: string): Omit<SupabaseExposureStep, 'id' | 'created_at'> {
  return {
    user_id: userId,
    description: step.description,
    anxiety_level: step.anxietyLevel,
    completed: step.completed,
    date: step.date
  }
}

export function appToSupabaseChatMessage(message: Omit<AppChatMessage, 'id'>, userId: string): Omit<SupabaseChatMessage, 'id' | 'created_at'> {
  return {
    user_id: userId,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp
  }
}
