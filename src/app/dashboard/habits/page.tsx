"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Target, Plus, Check, Trash2, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function HabitsPage() {
  const router = useRouter()
  const [habits, setHabits] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [habitName, setHabitName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const userData = JSON.parse(userStr)
    setUserId(userData.id)
    loadHabits(userData.id)
  }, [router])

  const loadHabits = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })

      if (error) throw error
      setHabits(data || [])
    } catch (error) {
      console.error('Erro ao carregar hábitos:', error)
      toast.error('Erro ao carregar hábitos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert([{
          user_id: userId,
          title: habitName,
          completed: false,
          streak: 0
        }])
        .select()

      if (error) throw error

      setHabits([data[0], ...habits])
      setHabitName('')
      setShowForm(false)
      toast.success('Hábito adicionado com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar hábito:', error)
      toast.error('Erro ao salvar hábito')
    }
  }

  // Função para ajuste manual do contador
  const adjustStreak = async (id: string, currentStreak: number, amount: number, e: React.MouseEvent) => {
    e.stopPropagation() 
    
    const newStreak = Math.max(0, currentStreak + amount)

    try {
      const { error } = await supabase
        .from('habits')
        .update({ streak: newStreak })
        .eq('id', id)

      if (error) throw error

      setHabits(habits.map(habit => 
        habit.id === id 
          ? { ...habit, streak: newStreak }
          : habit
      ))
    } catch (error) {
      console.error('Erro ao ajustar dias:', error)
      toast.error('Erro ao atualizar contagem')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este hábito?")) return;

    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)

      if (error) throw error

      setHabits(habits.filter(habit => habit.id !== id))
      toast.success('Hábito excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir hábito:', error)
      toast.error('Erro ao excluir hábito')
    }
  }

  const toggleHabit = async (id: string, currentCompleted: boolean, currentStreak: number) => {
    try {
      const newCompleted = !currentCompleted
      
      const newStreak = newCompleted 
        ? currentStreak + 1 
        : Math.max(0, currentStreak - 1)

      const { error } = await supabase
        .from('habits')
        .update({ 
          completed: newCompleted,
          streak: newStreak
        })
        .eq('id', id)

      if (error) throw error

      setHabits(habits.map(habit => 
        habit.id === id 
          ? { ...habit, completed: newCompleted, streak: newStreak }
          : habit
      ))
      
      if (newCompleted) {
        toast.success('Hábito concluído! +1 dia na sequência')
      } else {
        toast.info('Hábito desmarcado')
      }
      
    } catch (error) {
      console.error('Erro ao atualizar hábito:', error)
      toast.error('Erro ao atualizar hábito')
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
              <Target className="w-8 h-8 text-green-600" />
              Hábitos Saudáveis
            </h1>
            <p className="text-muted-foreground mt-1">
              Construa hábitos positivos para seu bem-estar
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-6 border-green-200">
            <CardHeader>
              <CardTitle>Novo Hábito</CardTitle>
              <CardDescription>Adicione um hábito que deseja cultivar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="habit">Nome do Hábito</Label>
                  <Input
                    id="habit"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    placeholder="Ex: Meditar 10 minutos"
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

        {/* Habits List */}
        {habits.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum hábito cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando hábitos que deseja cultivar
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Hábito
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => (
              <Card key={habit.id} className="hover:shadow-lg transition-shadow group">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    
                    {/* Botão de Check Principal */}
                    <Button
                        size="icon"
                        variant={habit.completed ? "default" : "outline"}
                        onClick={() => toggleHabit(habit.id, habit.completed, habit.streak)}
                        className={`h-12 w-12 rounded-full shrink-0 ${
                          habit.completed 
                            ? "bg-green-500 hover:bg-green-600 border-green-600 shadow-md shadow-green-200" 
                            : "border-2 hover:border-green-500 hover:text-green-500"
                        }`}
                      >
                        {habit.completed && <Check className="w-6 h-6" />}
                    </Button>
                      
                    {/* Texto e Controles */}
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start">
                        <h3 className={`text-lg font-semibold transition-all ${
                          habit.completed ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {habit.title}
                        </h3>

                        {/* Botão de Excluir */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(habit.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Área da Sequência com Controles Manuais */}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-muted-foreground">Sequência:</span>
                        
                        <div className="flex items-center bg-secondary/50 rounded-lg p-1 gap-1">
                          {/* Botão Menos */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 hover:bg-white hover:shadow-sm"
                            onClick={(e) => adjustStreak(habit.id, habit.streak, -1, e)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          
                          {/* Número */}
                          <span className={`text-sm font-bold min-w-[20px] text-center ${habit.streak > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                            {habit.streak}
                          </span>
                          
                          {/* Botão Mais */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 hover:bg-white hover:shadow-sm"
                            onClick={(e) => adjustStreak(habit.id, habit.streak, 1, e)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <span className="text-sm text-muted-foreground">dias</span>
                      </div>
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
