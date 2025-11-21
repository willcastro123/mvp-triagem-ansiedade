"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Brain, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Lightbulb, Target, Heart, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase, type UserProfile } from '@/lib/supabase'
import { toast } from 'sonner'

interface MoodData {
  mood: string
  created_at: string
  notes: string | null
}

interface AIInsight {
  overall_status: 'excellent' | 'good' | 'moderate' | 'concerning'
  mood_trend: 'improving' | 'stable' | 'declining'
  main_message: string
  recommendations: string[]
  positive_aspects: string[]
  areas_of_concern: string[]
  next_steps: string[]
}

export default function MindInsightsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [insights, setInsights] = useState<AIInsight | null>(null)
  const [moodHistory, setMoodHistory] = useState<MoodData[]>([])

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const userData = JSON.parse(userStr)
    setUser(userData)
    loadMoodHistory(userData.id)
  }, [router])

  const loadMoodHistory = async (userId: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('mood_entries')
        .select('mood, created_at, notes')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30)

      if (error) throw error
      setMoodHistory(data || [])
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeWithAI = async () => {
    if (!user || moodHistory.length === 0) {
      toast.error('Você precisa ter registros de humor para análise')
      return
    }

    setIsAnalyzing(true)

    try {
      // Preparar dados para análise
      const moodSummary = moodHistory.map(m => ({
        mood: m.mood,
        date: new Date(m.created_at).toLocaleDateString('pt-BR'),
        notes: m.notes
      }))

      // Simular análise de IA (em produção, chamar API real)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Análise baseada nos dados reais
      const moodCounts = moodHistory.reduce((acc, m) => {
        acc[m.mood] = (acc[m.mood] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const totalMoods = moodHistory.length
      const positiveCount = (moodCounts['great'] || 0) + (moodCounts['good'] || 0)
      const negativeCount = (moodCounts['bad'] || 0) + (moodCounts['terrible'] || 0)
      const neutralCount = moodCounts['neutral'] || 0

      const positivePercentage = (positiveCount / totalMoods) * 100
      const negativePercentage = (negativeCount / totalMoods) * 100

      // Determinar status geral
      let overall_status: AIInsight['overall_status'] = 'moderate'
      if (positivePercentage > 60) overall_status = 'excellent'
      else if (positivePercentage > 40) overall_status = 'good'
      else if (negativePercentage > 50) overall_status = 'concerning'

      // Determinar tendência
      const recentMoods = moodHistory.slice(0, 7)
      const olderMoods = moodHistory.slice(7, 14)
      const recentPositive = recentMoods.filter(m => m.mood === 'great' || m.mood === 'good').length
      const olderPositive = olderMoods.filter(m => m.mood === 'great' || m.mood === 'good').length
      
      let mood_trend: AIInsight['mood_trend'] = 'stable'
      if (recentPositive > olderPositive + 1) mood_trend = 'improving'
      else if (recentPositive < olderPositive - 1) mood_trend = 'declining'

      const aiInsight: AIInsight = {
        overall_status,
        mood_trend,
        main_message: generateMainMessage(overall_status, mood_trend, positivePercentage),
        recommendations: generateRecommendations(overall_status, mood_trend),
        positive_aspects: generatePositiveAspects(positivePercentage, moodHistory),
        areas_of_concern: generateConcerns(negativePercentage, moodHistory),
        next_steps: generateNextSteps(overall_status, mood_trend)
      }

      setInsights(aiInsight)

      // Adicionar pontos pela análise
      const newPoints = (user.points || 0) + 10
      await supabase
        .from('user_profiles')
        .update({ points: newPoints })
        .eq('id', user.id)

      setUser({ ...user, points: newPoints })

      // Registrar atividade
      await supabase
        .from('user_activity_logs')
        .insert([{
          user_id: user.id,
          activity_type: 'ai_analysis',
          activity_description: 'Realizou análise de IA sobre saúde mental',
          metadata: { insights: aiInsight }
        }])

      toast.success('🎉 Análise completa! +10 pontos!')
    } catch (error) {
      console.error('Erro na análise:', error)
      toast.error('Erro ao analisar dados')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateMainMessage = (status: string, trend: string, positivePercentage: number) => {
    if (status === 'excellent') {
      return `Parabéns! Você está em um excelente momento emocional. ${positivePercentage.toFixed(0)}% dos seus registros são positivos. Continue assim!`
    } else if (status === 'good') {
      return `Você está indo bem! Seus registros mostram um equilíbrio emocional saudável com ${positivePercentage.toFixed(0)}% de momentos positivos.`
    } else if (status === 'concerning') {
      return `Notamos que você tem enfrentado desafios emocionais. É importante buscar apoio e praticar autocuidado.`
    }
    return `Seu estado emocional está moderado. Há espaço para melhorias através de práticas consistentes de bem-estar.`
  }

  const generateRecommendations = (status: string, trend: string) => {
    const recommendations = []
    
    if (status === 'concerning' || trend === 'declining') {
      recommendations.push('Considere conversar com um profissional de saúde mental')
      recommendations.push('Pratique meditação diariamente por pelo menos 10 minutos')
      recommendations.push('Mantenha uma rotina regular de sono (7-9 horas)')
    }
    
    recommendations.push('Continue registrando seu humor diariamente')
    recommendations.push('Pratique exercícios físicos leves 3x por semana')
    recommendations.push('Dedique tempo para atividades que você gosta')
    
    if (status === 'excellent' || status === 'good') {
      recommendations.push('Mantenha suas práticas atuais de autocuidado')
    }
    
    return recommendations
  }

  const generatePositiveAspects = (positivePercentage: number, history: MoodData[]) => {
    const aspects = []
    
    if (positivePercentage > 50) {
      aspects.push('Você tem mantido uma atitude positiva na maior parte do tempo')
    }
    
    if (history.length >= 7) {
      aspects.push('Você tem sido consistente em registrar seu humor')
    }
    
    const hasNotes = history.filter(m => m.notes && m.notes.length > 10).length
    if (hasNotes > 5) {
      aspects.push('Você tem refletido sobre suas emoções através das notas')
    }
    
    aspects.push('Você está comprometido com seu bem-estar mental')
    
    return aspects
  }

  const generateConcerns = (negativePercentage: number, history: MoodData[]) => {
    const concerns = []
    
    if (negativePercentage > 40) {
      concerns.push('Alta frequência de registros negativos nas últimas semanas')
    }
    
    const recentBad = history.slice(0, 7).filter(m => m.mood === 'bad' || m.mood === 'terrible').length
    if (recentBad >= 4) {
      concerns.push('Padrão de humor baixo nos últimos dias')
    }
    
    if (concerns.length === 0) {
      concerns.push('Nenhuma preocupação significativa identificada no momento')
    }
    
    return concerns
  }

  const generateNextSteps = (status: string, trend: string) => {
    const steps = []
    
    if (status === 'concerning') {
      steps.push('Agende uma consulta com um psicólogo ou psiquiatra')
      steps.push('Converse com alguém de confiança sobre como você está se sentindo')
    }
    
    steps.push('Estabeleça uma rotina diária de meditação')
    steps.push('Identifique e evite gatilhos emocionais quando possível')
    steps.push('Pratique gratidão diariamente')
    
    if (trend === 'improving' || status === 'excellent') {
      steps.push('Continue com suas práticas atuais - elas estão funcionando!')
    }
    
    return steps
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'good': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
      case 'moderate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      case 'concerning': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-6 h-6" />
      case 'good': return <TrendingUp className="w-6 h-6" />
      case 'moderate': return <Activity className="w-6 h-6" />
      case 'concerning': return <AlertCircle className="w-6 h-6" />
      default: return <Brain className="w-6 h-6" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'declining': return <TrendingDown className="w-5 h-5 text-red-600" />
      default: return <Activity className="w-5 h-5 text-blue-600" />
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container max-w-5xl mx-auto p-4 lg:p-8">
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
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Conhecimento sobre sua Mente</h1>
              <p className="text-muted-foreground">Análise inteligente do seu estado emocional</p>
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        {!insights && (
          <Card className="mb-8 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardContent className="pt-6 text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-purple-600" />
              <h3 className="text-xl font-bold mb-2">Análise de IA Disponível</h3>
              <p className="text-muted-foreground mb-6">
                {moodHistory.length === 0 
                  ? 'Você precisa registrar seu humor antes de fazer a análise'
                  : `Temos ${moodHistory.length} registros de humor para analisar`
                }
              </p>
              <Button
                onClick={analyzeWithAI}
                disabled={isAnalyzing || moodHistory.length === 0}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-6 text-lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-2" />
                    Analisar Minha Mente
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Insights Display */}
        {insights && (
          <div className="space-y-6">
            {/* Status Card */}
            <Card className={`border-2 ${getStatusColor(insights.overall_status)}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    {getStatusIcon(insights.overall_status)}
                    Status Geral
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(insights.mood_trend)}
                    <span className="text-sm font-medium capitalize">{insights.mood_trend === 'improving' ? 'Melhorando' : insights.mood_trend === 'declining' ? 'Declinando' : 'Estável'}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{insights.main_message}</p>
              </CardContent>
            </Card>

            {/* Positive Aspects */}
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="w-5 h-5" />
                  Aspectos Positivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.positive_aspects.map((aspect, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{aspect}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Areas of Concern */}
            {insights.areas_of_concern.length > 0 && (
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                    <AlertCircle className="w-5 h-5" />
                    Pontos de Atenção
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.areas_of_concern.map((concern, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{concern}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Lightbulb className="w-5 h-5" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Target className="w-5 h-5" />
                  Próximos Passos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.next_steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* New Analysis Button */}
            <div className="text-center">
              <Button
                onClick={() => {
                  setInsights(null)
                  loadMoodHistory(user.id)
                }}
                variant="outline"
                className="border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <Brain className="w-4 h-4 mr-2" />
                Nova Análise
              </Button>
            </div>
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-semibold mb-1">Sobre a Análise de IA</p>
                <p>Nossa IA analisa seus registros de humor dos últimos 30 dias para identificar padrões, tendências e fornecer recomendações personalizadas. Cada análise adiciona 10 pontos à sua conta!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
