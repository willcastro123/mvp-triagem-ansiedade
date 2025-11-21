import { useState, useEffect } from 'react'
import {
  getUserProfile,
  getMedications,
  getHabits,
  getTasks,
  getMoodEntries,
  getExposureSteps,
  getArticles,
  getChatMessages,
  type UserProfile,
  type Medication,
  type Habit,
  type Task,
  type MoodEntry,
  type ExposureStep,
  type Article,
  type ChatMessage
} from '@/lib/supabase'

export function useSupabaseData(userEmail: string | null) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [medications, setMedications] = useState<Medication[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [exposureSteps, setExposureSteps] = useState<ExposureStep[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userEmail) {
      setLoading(false)
      return
    }

    loadUserData()
  }, [userEmail])

  async function loadUserData() {
    try {
      setLoading(true)
      setError(null)

      // Carregar perfil do usuário
      const profile = await getUserProfile(userEmail!)
      
      if (!profile) {
        setLoading(false)
        return
      }

      setUserProfile(profile)

      // Carregar todos os dados do usuário em paralelo
      const [
        medicationsData,
        habitsData,
        tasksData,
        moodEntriesData,
        exposureStepsData,
        articlesData,
        chatMessagesData
      ] = await Promise.all([
        getMedications(profile.id),
        getHabits(profile.id),
        getTasks(profile.id),
        getMoodEntries(profile.id),
        getExposureSteps(profile.id),
        getArticles(profile.id),
        getChatMessages(profile.id)
      ])

      setMedications(medicationsData)
      setHabits(habitsData)
      setTasks(tasksData)
      setMoodEntries(moodEntriesData)
      setExposureSteps(exposureStepsData)
      setArticles(articlesData)
      setChatMessages(chatMessagesData)

    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados do usuário')
    } finally {
      setLoading(false)
    }
  }

  return {
    userProfile,
    medications,
    habits,
    tasks,
    moodEntries,
    exposureSteps,
    articles,
    chatMessages,
    loading,
    error,
    refreshData: loadUserData,
    setUserProfile,
    setMedications,
    setHabits,
    setTasks,
    setMoodEntries,
    setExposureSteps,
    setArticles,
    setChatMessages
  }
}
