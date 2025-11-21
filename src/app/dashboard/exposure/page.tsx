"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Brain, Plus, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function ExposurePage() {
  const router = useRouter()
  const [exposures, setExposures] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    situation: '',
    anxietyLevel: 5,
    notes: ''
  })

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const userData = JSON.parse(userStr)
    setUserId(userData.id)
    loadExposures(userData.id)
  }, [router])

  const loadExposures = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('exposure_steps')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })

      if (error) throw error
      setExposures(data || [])
    } catch (error) {
      console.error('Erro ao carregar exposições:', error)
      toast.error('Erro ao carregar exposições')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('exposure_steps')
        .insert([{
          user_id: userId,
          description: formData.situation,
          anxiety_level: formData.anxietyLevel,
          completed: false,
          date: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      setExposures([data[0], ...exposures])
      setFormData({ situation: '', anxietyLevel: 5, notes: '' })
      setShowForm(false)
      toast.success('Exposição adicionada com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar exposição:', error)
      toast.error('Erro ao salvar exposição')
    }
  }

  const markAsCompleted = async (id: string) => {
    try {
      const { error } = await supabase
        .from('exposure_steps')
        .update({ completed: true })
        .eq('id', id)

      if (error) throw error

      setExposures(exposures.map(exp => 
        exp.id === id ? { ...exp, completed: true } : exp
      ))
      toast.success('Parabéns! Exposição concluída!')
    } catch (error) {
      console.error('Erro ao atualizar exposição:', error)
      toast.error('Erro ao atualizar exposição')
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
      <div className="max-w-4xl mx-auto">
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
              <Brain className="w-8 h-8 text-orange-600" />
              Exposição Gradual
            </h1>
            <p className="text-muted-foreground mt-1">
              Enfrente seus medos de forma progressiva e controlada
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-6 border-orange-200">
            <CardHeader>
              <CardTitle>Nova Exposição</CardTitle>
              <CardDescription>Planeje uma situação de exposição gradual</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="situation">Situação</Label>
                  <Input
                    id="situation"
                    value={formData.situation}
                    onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                    placeholder="Ex: Conversar com desconhecido"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="anxiety">Nível de Ansiedade Esperado (1-10)</Label>
                  <Input
                    id="anxiety"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.anxietyLevel}
                    onChange={(e) => setFormData({ ...formData, anxietyLevel: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Salvar</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Exposures List */}
        {exposures.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma exposição planejada</h3>
              <p className="text-muted-foreground mb-4">
                Comece planejando situações de exposição gradual
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Exposição
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {exposures.map((exp) => (
              <Card key={exp.id} className={`hover:shadow-lg transition-shadow ${exp.completed ? 'border-green-200 bg-green-50/50' : ''}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{exp.description}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          <span>Nível de ansiedade: {exp.anxiety_level}/10</span>
                        </div>
                        <p className="text-xs">
                          {new Date(exp.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!exp.completed && (
                        <Button
                          size="sm"
                          onClick={() => markAsCompleted(exp.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          Concluir
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
