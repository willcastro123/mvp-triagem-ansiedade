"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Smile, Meh, Frown, Heart, Cloud, Sun, Moon, Zap, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { supabase, type UserProfile } from '@/lib/supabase'
import { toast } from 'sonner'

type MoodType = 'great' | 'good' | 'neutral' | 'bad' | 'terrible'

interface MoodOption {
  type: MoodType
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

interface SavedMoodEntry {
  id: string
  mood: MoodType
  mood_label: string
  notes: string | null
  created_at: string
}

export default function MoodPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedEntries, setSavedEntries] = useState<SavedMoodEntry[]>([])
  const [isLoadingSaved, setIsLoadingSaved] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const userData = JSON.parse(userStr)
    setUser(userData)
    loadSavedEntries(userData.id)
  }, [router])

  const loadSavedEntries = async (userId: string) => {
    try {
      setIsLoadingSaved(true)
      const { data, error } = await supabase
        .from('saved_mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      setSavedEntries(data || [])
    } catch (error) {
      console.error('Erro ao carregar registros salvos:', error)
    } finally {
      setIsLoadingSaved(false)
    }
  }

  const moodOptions: MoodOption[] = [
    {
      type: 'great',
      label: 'Ótimo',
      icon: <Sun className="w-8 h-8" />,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
    },
    {
      type: 'good',
      label: 'Bom',
      icon: <Smile className="w-8 h-8" />,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50'
    },
    {
      type: 'neutral',
      label: 'Neutro',
      icon: <Meh className="w-8 h-8" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50'
    },
    {
      type: 'bad',
      label: 'Ruim',
      icon: <Cloud className="w-8 h-8" />,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50'
    },
    {
      type: 'terrible',
      label: 'Péssimo',
      icon: <Frown className="w-8 h-8" />,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50'
    }
  ]

  const getMoodLabel = (moodType: MoodType | null) => {
    if (!moodType) return ''
    return moodOptions.find(m => m.type === moodType)?.label || ''
  }

  const getMoodIcon = (moodType: MoodType) => {
    return moodOptions.find(m => m.type === moodType)?.icon || null
  }

  const getMoodColor = (moodType: MoodType) => {
    return moodOptions.find(m => m.type === moodType)?.color || 'text-gray-500'
  }

  const handleSaveEntry = async () => {
    if (!selectedMood) {
      toast.error('Por favor, selecione um humor')
      return
    }

    if (!user) {
      toast.error('Usuário não encontrado')
      return
    }

    setIsSubmitting(true)

    try {
      // Salvar na tabela saved_mood_entries
      const { data, error } = await supabase
        .from('saved_mood_entries')
        .insert([{
          user_id: user.id,
          mood: selectedMood,
          mood_label: getMoodLabel(selectedMood),
          notes: notes || null
        }])
        .select()

      if (error) {
        console.error('Erro do Supabase:', error)
        throw error
      }

      console.log('Registro salvo com sucesso:', data)

      toast.success('Registro salvo com sucesso! 🎉')
      
      // Recarregar lista de registros salvos
      await loadSavedEntries(user.id)
      
      // Limpar formulário
      setSelectedMood(null)
      setNotes('')
    } catch (error: any) {
      console.error('Erro ao salvar registro:', error)
      toast.error(`Erro ao salvar registro: ${error.message || 'Tente novamente'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast.error('Por favor, selecione um humor')
      return
    }

    if (!user) {
      toast.error('Usuário não encontrado')
      return
    }

    setIsSubmitting(true)

    try {
      const now = new Date()
      const date = now.toISOString().split('T')[0] // YYYY-MM-DD
      const time = now.toTimeString().split(' ')[0] // HH:MM:SS

      console.log('Tentando registrar humor:', {
        user_id: user.id,
        date,
        time,
        mood: selectedMood,
        anxiety_level: 5,
        stress_level: 5,
        situation: notes || 'Sem descrição',
        notes: notes || null
      })

      // Salvar registro de humor com as colunas corretas da tabela
      const { data, error } = await supabase
        .from('mood_entries')
        .insert([{
          user_id: user.id,
          date: date,
          time: time,
          mood: selectedMood,
          anxiety_level: 5,
          stress_level: 5,
          situation: notes || 'Sem descrição',
          notes: notes || null
        }])
        .select()

      if (error) {
        console.error('Erro do Supabase:', error)
        throw error
      }

      console.log('Humor registrado com sucesso:', data)

      // Adicionar pontos ao usuário
      const newPoints = (user.points || 0) + 10
      await supabase
        .from('user_profiles')
        .update({ points: newPoints })
        .eq('id', user.id)

      // Atualizar estado local
      setUser({ ...user, points: newPoints })

      // Registrar atividade (não bloqueia se falhar)
      try {
        await supabase
          .from('user_activity_logs')
          .insert([{
            user_id: user.id,
            activity_type: 'mood_log',
            activity_description: `Registrou humor: ${selectedMood}`,
            metadata: { mood: selectedMood, has_notes: !!notes }
          }])
      } catch (activityError) {
        console.warn('Erro ao registrar atividade (não crítico):', activityError)
      }

      toast.success('Humor registrado com sucesso! 🎉 +10 pontos!')
      
      // Limpar formulário
      setSelectedMood(null)
      setNotes('')
      
      // Voltar ao dashboard após 1.5s
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error: any) {
      console.error('Erro ao registrar humor:', error)
      toast.error(`Erro ao registrar humor: ${error.message || 'Tente novamente'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container max-w-4xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Registro de Humor</h1>
              <p className="text-muted-foreground">Como você está se sentindo hoje?</p>
            </div>
          </div>
        </div>

        {/* Mood Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selecione seu humor atual</CardTitle>
            <CardDescription>Escolha a opção que melhor representa como você se sente agora</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {moodOptions.map((mood) => (
                <button
                  key={mood.type}
                  onClick={() => setSelectedMood(mood.type)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedMood === mood.type
                      ? 'border-purple-500 shadow-lg scale-105'
                      : 'border-gray-200 dark:border-gray-700'
                  } ${mood.bgColor} flex flex-col items-center gap-2`}
                >
                  <div className={mood.color}>
                    {mood.icon}
                  </div>
                  <span className="font-medium text-sm">{mood.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notas (opcional)</CardTitle>
            <CardDescription>Adicione detalhes sobre como você está se sentindo</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="O que está acontecendo? Como foi seu dia? Algum gatilho específico?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button
            onClick={handleSaveEntry}
            disabled={!selectedMood || isSubmitting}
            variant="outline"
            className="flex-1 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold py-6 text-lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Heart className="w-5 h-5 mr-2" />
                Salvar Registro
              </>
            )}
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!selectedMood || isSubmitting}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 text-lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Registrando...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Registrar Humor
              </>
            )}
          </Button>
        </div>

        {/* Current Mood and Notes Display */}
        {(selectedMood || notes) && (
          <Card className="mb-6 border-purple-200 bg-purple-50 dark:bg-purple-900/20">
            <CardHeader>
              <CardTitle className="text-lg">Resumo do Registro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedMood && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Humor Atual:</p>
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                    {getMoodLabel(selectedMood)}
                  </p>
                </div>
              )}
              {notes && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Suas Notas:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                    {notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Saved Entries */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Registros Salvos</CardTitle>
            <CardDescription>Seus últimos registros de humor salvos</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSaved ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : savedEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum registro salvo ainda</p>
                <p className="text-sm">Salve seu primeiro registro acima!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`${getMoodColor(entry.mood)} mt-1`}>
                        {getMoodIcon(entry.mood)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-lg">{entry.mood_label}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(entry.created_at)}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground mt-2 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Moon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-semibold mb-1">Dica:</p>
                <p>Registrar seu humor diariamente ajuda a identificar padrões e gatilhos emocionais. Seja honesto consigo mesmo!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
