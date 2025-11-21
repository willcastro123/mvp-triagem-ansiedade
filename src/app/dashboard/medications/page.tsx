"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pill, Plus, Clock, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function MedicationsPage() {
  const router = useRouter()
  const [medications, setMedications] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    time: ''
  })

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const userData = JSON.parse(userStr)
    setUserId(userData.id)
    loadMedications(userData.id)
  }, [router])

  const loadMedications = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMedications(data || [])
    } catch (error) {
      console.error('Erro ao carregar medicamentos:', error)
      toast.error('Erro ao carregar medicamentos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('medications')
        .insert([{
          user_id: userId,
          name: formData.name,
          dosage: formData.dosage,
          frequency: formData.frequency,
          time: formData.time
        }])
        .select()

      if (error) throw error

      setMedications([data[0], ...medications])
      setFormData({ name: '', dosage: '', frequency: '', time: '' })
      setShowForm(false)
      toast.success('Medicamento adicionado com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar medicamento:', error)
      toast.error('Erro ao salvar medicamento')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id)

      if (error) throw error

      setMedications(medications.filter(m => m.id !== id))
      toast.success('Medicamento removido')
    } catch (error) {
      console.error('Erro ao remover medicamento:', error)
      toast.error('Erro ao remover medicamento')
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
              <Pill className="w-8 h-8 text-blue-600" />
              Medicamentos
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus medicamentos e lembretes
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-6 border-blue-200">
            <CardHeader>
              <CardTitle>Novo Medicamento</CardTitle>
              <CardDescription>Adicione informações sobre seu medicamento</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Medicamento</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Sertralina"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dosage">Dosagem</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="Ex: 50mg"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequência</Label>
                  <Input
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    placeholder="Ex: 1x ao dia"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Horário</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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

        {/* Medications List */}
        {medications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Pill className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum medicamento cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Adicione seus medicamentos para receber lembretes
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Medicamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {medications.map((med) => (
              <Card key={med.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{med.name}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4" />
                          <span>Dosagem: {med.dosage}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Frequência: {med.frequency}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Horário: {med.time}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(med.id)}
                    >
                      Remover
                    </Button>
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
