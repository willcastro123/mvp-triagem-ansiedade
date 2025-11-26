"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Moon, Sun, ArrowLeft, Plus, TrendingUp, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase, type UserProfile } from '@/lib/supabase'
import { toast } from 'sonner'

interface SleepLog {
  id: string
  sleep_time: string
  wake_time: string
  sleep_quality: number
  notes: string
  date: string
  created_at: string
}

export default function SleepPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [sleepForm, setSleepForm] = useState({
    sleep_time: '',
    wake_time: '',
    sleep_quality: 3,
    notes: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(userStr)
    setUser(userData)
    loadSleepLogs(userData.id)
  }, [router])

  const loadSleepLogs = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30)

      if (!error && data) {
        setSleepLogs(data)
      }
    } catch (error) {
      console.error('Erro ao carregar registros de sono:', error)
    }
  }

  const handleAddSleepLog = async () => {
    if (!sleepForm.sleep_time || !sleepForm.wake_time) {
      toast.error('Preencha os horários de sono e despertar')
      return
    }

    try {
      const { error } = await supabase
        .from('sleep_logs')
        .insert([{
          user_id: user?.id,
          sleep_time: sleepForm.sleep_time,
          wake_time: sleepForm.wake_time,
          sleep_quality: sleepForm.sleep_quality,
          notes: sleepForm.notes,
          date: sleepForm.date
        }])

      if (error) throw error

      toast.success('Registro de sono adicionado!')
      setShowAddModal(false)
      setSleepForm({
        sleep_time: '',
        wake_time: '',
        sleep_quality: 3,
        notes: '',
        date: new Date().toISOString().split('T')[0]
      })
      if (user) loadSleepLogs(user.id)
    } catch (error: any) {
      console.error('Erro ao adicionar registro:', error)
      toast.error('Erro ao adicionar registro de sono')
    }
  }

  const calculateSleepDuration = (sleepTime: string, wakeTime: string) => {
    const [sleepHour, sleepMin] = sleepTime.split(':').map(Number)
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number)
    
    let sleepMinutes = sleepHour * 60 + sleepMin
    let wakeMinutes = wakeHour * 60 + wakeMin
    
    if (wakeMinutes < sleepMinutes) {
      wakeMinutes += 24 * 60
    }
    
    const duration = wakeMinutes - sleepMinutes
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    
    return `${hours}h ${minutes}min`
  }

  const getAverageSleepQuality = () => {
    if (sleepLogs.length === 0) return 0
    const sum = sleepLogs.reduce((acc, log) => acc + log.sleep_quality, 0)
    return (sum / sleepLogs.length).toFixed(1)
  }

  const getQualityColor = (quality: number) => {
    if (quality >= 4) return 'text-green-600'
    if (quality >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getQualityLabel = (quality: number) => {
    if (quality === 5) return 'Excelente'
    if (quality === 4) return 'Bom'
    if (quality === 3) return 'Regular'
    if (quality === 2) return 'Ruim'
    return 'Muito Ruim'
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="px-4 py-4 flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-2">
              <Moon className="w-6 h-6 text-indigo-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Regulação do Sono
              </h1>
            </div>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-8 max-w-6xl mx-auto">
        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
            <CardContent className="pt-6 text-center">
              <Moon className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
              <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">{sleepLogs.length}</p>
              <p className="text-sm text-muted-foreground">Registros Totais</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{getAverageSleepQuality()}/5</p>
              <p className="text-sm text-muted-foreground">Qualidade Média</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold">
                {sleepLogs.length > 0 ? calculateSleepDuration(sleepLogs[0].sleep_time, sleepLogs[0].wake_time) : '0h 0min'}
              </p>
              <p className="text-sm text-muted-foreground">Última Noite</p>
            </CardContent>
          </Card>
        </div>

        {/* Sleep Tips */}
        <Card className="mb-8 border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <CardTitle>💡 Dicas para um Sono Melhor</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Moon className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Horário Regular</p>
                  <p className="text-sm text-muted-foreground">Durma e acorde no mesmo horário todos os dias</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sun className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Luz Natural</p>
                  <p className="text-sm text-muted-foreground">Exponha-se à luz solar durante o dia</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Evite Telas</p>
                  <p className="text-sm text-muted-foreground">Desligue dispositivos 1h antes de dormir</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Ambiente Confortável</p>
                  <p className="text-sm text-muted-foreground">Quarto escuro, silencioso e fresco</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sleep Logs */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Histórico de Sono</h2>
          {sleepLogs.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="text-center py-12">
                <Moon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Nenhum registro ainda</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Comece a registrar seu sono para acompanhar sua qualidade
                </p>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Primeiro Registro
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sleepLogs.map((log) => (
                <Card key={log.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Moon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <p className="font-semibold">
                              {new Date(log.date).toLocaleDateString('pt-BR', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long' 
                              })}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {calculateSleepDuration(log.sleep_time, log.wake_time)} de sono
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getQualityColor(log.sleep_quality)}`}>
                          {log.sleep_quality}/5
                        </p>
                        <p className="text-xs text-muted-foreground">{getQualityLabel(log.sleep_quality)}</p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <Moon className="w-5 h-5 text-indigo-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">Dormiu às</p>
                          <p className="font-semibold">{log.sleep_time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <Sun className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">Acordou às</p>
                          <p className="font-semibold">{log.wake_time}</p>
                        </div>
                      </div>
                    </div>
                    {log.notes && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{log.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal: Add Sleep Log */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-600" />
              Registrar Sono
            </DialogTitle>
            <DialogDescription>
              Adicione informações sobre sua noite de sono
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={sleepForm.date}
                onChange={(e) => setSleepForm({ ...sleepForm, date: e.target.value })}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sleep_time">Horário que Dormiu *</Label>
                <Input
                  id="sleep_time"
                  type="time"
                  value={sleepForm.sleep_time}
                  onChange={(e) => setSleepForm({ ...sleepForm, sleep_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="wake_time">Horário que Acordou *</Label>
                <Input
                  id="wake_time"
                  type="time"
                  value={sleepForm.wake_time}
                  onChange={(e) => setSleepForm({ ...sleepForm, wake_time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="quality">Qualidade do Sono: {sleepForm.sleep_quality}/5</Label>
              <div className="flex items-center gap-4 mt-2">
                <input
                  id="quality"
                  type="range"
                  min="1"
                  max="5"
                  value={sleepForm.sleep_quality}
                  onChange={(e) => setSleepForm({ ...sleepForm, sleep_quality: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className={`font-bold ${getQualityColor(sleepForm.sleep_quality)}`}>
                  {getQualityLabel(sleepForm.sleep_quality)}
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={sleepForm.notes}
                onChange={(e) => setSleepForm({ ...sleepForm, notes: e.target.value })}
                placeholder="Como foi sua noite? Teve pesadelos? Acordou durante a noite?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddSleepLog} className="gap-2">
              <Plus className="w-4 h-4" />
              Salvar Registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
