"use client"

import { useState, useEffect } from 'react'
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  getMedications,
  createMedication,
  deleteMedication as deleteSupabaseMedication,
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit as deleteSupabaseHabit,
  getTasks,
  createTask,
  updateTask,
  deleteTask as deleteSupabaseTask,
  getMoodEntries,
  createMoodEntry,
  getExposureSteps,
  createExposureStep,
  updateExposureStep,
  deleteExposureStep as deleteSupabaseExposureStep,
  getArticles,
  updateArticle,
  getChatMessages,
  createChatMessage,
  sendWelcomeEmail,
  type UserProfile as SupabaseUserProfile,
  type Medication as SupabaseMedication,
  type Habit as SupabaseHabit,
  type Task as SupabaseTask,
  type MoodEntry as SupabaseMoodEntry,
  type ExposureStep as SupabaseExposureStep,
  type Article as SupabaseArticle,
  type ChatMessage as SupabaseChatMessage
} from '@/lib/supabase'

// Importar o componente original completo
import OriginalAnxietyApp from './page'

export default function AnxietyAppWithSupabase() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há usuário logado no localStorage (temporário)
    const savedEmail = localStorage.getItem('currentUserEmail')
    if (savedEmail) {
      loadUserData(savedEmail)
    } else {
      setLoading(false)
    }
  }, [])

  async function loadUserData(email: string) {
    try {
      const profile = await getUserProfile(email)
      if (profile) {
        setUserId(profile.id)
        setUserEmail(email)
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return <OriginalAnxietyApp userId={userId} userEmail={userEmail} />
}
