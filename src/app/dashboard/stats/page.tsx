"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BarChart3, TrendingUp, Calendar, Activity, Pill, Target, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function StatsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    moodRecords: 0,
    medications: 0,
    habitsCompleted: 0,
    exposuresCompleted: 0,
    totalHabits: 0,
    totalExposures: 0
  })

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const userData = JSON.parse(userStr)
    loadStats(userData.id)
  }, [router])

  const loadStats = async (userId: string) => {
    try {
      // Carregar registros de humor
      const { data: moodData, error: moodError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)

      if (moodError) throw moodError

      // Carregar medicamentos
      const { data: medicationsData, error: medicationsError } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId)

      if (medicationsError) throw medicationsError

      // Carregar hábitos
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)

      if (habitsError) throw habitsError

      // Carregar exposições
      const { data: exposuresData, error: exposuresError } = await supabase
        .from('exposure_steps')
        .select('*')
        .eq('user_id', userId)

      if (exposuresError) throw exposuresError

      // Calcular estatísticas
      const habitsCompleted = habitsData?.filter(h => h.completed).length || 0
      const exposuresCompleted = exposuresData?.filter(e => e.completed).length || 0

      setStats({
        moodRecords: moodData?.length || 0,
        medications: medicationsData?.length || 0,
        habitsCompleted,
        exposuresCompleted,
        totalHabits: habitsData?.length || 0,
        totalExposures: exposuresData?.length || 0
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      toast.error('Erro ao carregar estatísticas')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              Estatísticas
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe seu progresso e evolução
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardContent className="pt-6 text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">{stats.moodRecords}</p>
              <p className="text-sm text-muted-foreground">Registros de Humor</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
            <CardContent className="pt-6 text-center">
              <Pill className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{stats.medications}</p>
              <p className="text-sm text-muted-foreground">Medicamentos Cadastrados</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="pt-6 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.habitsCompleted}/{stats.totalHabits}</p>
              <p className="text-sm text-muted-foreground">Hábitos Completos</p>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
            <CardContent className="pt-6 text-center">
              <Brain className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">{stats.exposuresCompleted}/{stats.totalExposures}</p>
              <p className="text-sm text-muted-foreground">Exposições Realizadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Cards */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Progresso de Hábitos
              </CardTitle>
              <CardDescription>Taxa de conclusão dos seus hábitos</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.totalHabits > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taxa de Conclusão</span>
                    <span className="text-2xl font-bold text-green-600">
                      {Math.round((stats.habitsCompleted / stats.totalHabits) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.habitsCompleted / stats.totalHabits) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    {stats.habitsCompleted} de {stats.totalHabits} hábitos concluídos
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Adicione hábitos para ver seu progresso
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-orange-600" />
                Progresso de Exposições
              </CardTitle>
              <CardDescription>Exposições gradualmente concluídas</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.totalExposures > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taxa de Conclusão</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {Math.round((stats.exposuresCompleted / stats.totalExposures) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.exposuresCompleted / stats.totalExposures) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    {stats.exposuresCompleted} de {stats.totalExposures} exposições concluídas
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Adicione exposições para ver seu progresso
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Card */}
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Resumo Geral
            </CardTitle>
            <CardDescription>Visão geral do seu progresso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total de Registros</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.moodRecords + stats.medications + stats.totalHabits + stats.totalExposures}
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Atividades Concluídas</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.habitsCompleted + stats.exposuresCompleted}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
