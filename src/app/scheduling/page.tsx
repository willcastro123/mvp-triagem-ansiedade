"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Plus, Edit2, Trash2, Check, X, Search, Filter, ChevronLeft, ChevronRight, User, Phone, Mail, FileText, Heart, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase, type UserProfile } from '@/lib/supabase'
import { toast } from 'sonner'

interface Appointment {
  id: string
  patient_id: string
  patient_name: string
  patient_email: string
  patient_phone: string
  appointment_date: string
  appointment_time: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'confirmed'
  notes: string
  type: string
  created_at: string
}

interface Patient {
  id: string
  name: string
  email: string
  phone?: string
  anxiety_type?: string
}

export default function SchedulingPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [doctorId, setDoctorId] = useState<string>('')

  const [formData, setFormData] = useState({
    patient_id: '',
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    date: '',
    time: '',
    type: 'Consulta Regular',
    notes: ''
  })

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(userStr)
    setUser(userData)
    
    // Verifica se é doutor
    checkIfDoctor(userData.id)
  }, [router])

  const checkIfDoctor = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error || !data) {
        toast.error('Acesso negado. Apenas doutores podem acessar esta página.')
        router.push('/dashboard')
        return
      }

      setDoctorId(data.id)
      setIsLoading(false)
      loadAppointments(data.id)
      loadPatients(userId)
    } catch (error) {
      console.error('Erro ao verificar doutor:', error)
      router.push('/dashboard')
    }
  }

  const loadAppointments = async (doctorIdParam: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          user_profiles!appointments_patient_id_fkey (
            name,
            email,
            phone
          )
        `)
        .eq('doctor_id', doctorIdParam)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

      if (!error && data) {
        const appointmentsData = data.map((apt: any) => ({
          ...apt,
          patient_name: apt.user_profiles?.name || 'Paciente',
          patient_email: apt.user_profiles?.email || '',
          patient_phone: apt.user_profiles?.phone || ''
        }))
        setAppointments(appointmentsData)
        setFilteredAppointments(appointmentsData)
      }
    } catch (error) {
      console.error('Erro ao carregar consultas:', error)
      toast.error('Erro ao carregar consultas')
    }
  }

  const loadPatients = async (doctorUserId: string) => {
    try {
      console.log('🔄 Carregando pacientes autorizados para agendamento...')
      
      // Busca os pacientes autorizados do painel do doutor
      const { data: accessData, error: accessError } = await supabase
        .from('doctor_patient_access')
        .select('patient_id')
        .eq('doctor_user_id', doctorUserId)

      if (accessError) {
        console.error('❌ Erro ao buscar acessos:', accessError)
        return
      }

      if (!accessData || accessData.length === 0) {
        console.log('ℹ️ Nenhum paciente autorizado encontrado')
        setPatients([])
        return
      }

      const patientIds = accessData.map((item: any) => item.patient_id)
      console.log('📋 IDs dos pacientes:', patientIds)

      // Busca os dados completos dos pacientes
      const { data: patientsData, error: patientsError } = await supabase
        .from('user_profiles')
        .select('id, name, email, phone, anxiety_type')
        .in('id', patientIds)

      if (patientsError) {
        console.error('❌ Erro ao buscar dados dos pacientes:', patientsError)
        return
      }

      console.log('✅ Pacientes carregados para agendamento:', patientsData?.length || 0)
      setPatients(patientsData || [])
    } catch (error) {
      console.error('❌ Erro ao carregar pacientes:', error)
    }
  }

  const handlePatientSelect = (patientId: string) => {
    const selectedPatient = patients.find(p => p.id === patientId)
    
    if (selectedPatient) {
      console.log('✅ Paciente selecionado:', selectedPatient.name)
      setFormData({
        ...formData,
        patient_id: patientId,
        patient_name: selectedPatient.name,
        patient_email: selectedPatient.email,
        patient_phone: selectedPatient.phone || ''
      })
      toast.success(`Paciente ${selectedPatient.name} selecionado!`)
    }
  }

  const handleAddAppointment = async () => {
    if (!formData.patient_id || !formData.date || !formData.time) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .insert([{
          doctor_id: doctorId,
          patient_id: formData.patient_id,
          appointment_date: formData.date,
          appointment_time: formData.time,
          type: formData.type,
          notes: formData.notes,
          status: 'scheduled'
        }])

      if (error) throw error

      toast.success('Consulta agendada com sucesso!')
      setShowAddModal(false)
      resetForm()
      if (doctorId) loadAppointments(doctorId)
    } catch (error: any) {
      console.error('Erro ao agendar consulta:', error)
      toast.error('Erro ao agendar consulta: ' + error.message)
    }
  }

  const handleEditAppointment = async () => {
    if (!selectedAppointment) return

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          appointment_date: formData.date,
          appointment_time: formData.time,
          type: formData.type,
          notes: formData.notes,
          status: formData.patient_id as any // status vem do formData.patient_id temporariamente
        })
        .eq('id', selectedAppointment.id)

      if (error) throw error

      toast.success('Consulta atualizada com sucesso!')
      setShowEditModal(false)
      setSelectedAppointment(null)
      resetForm()
      if (doctorId) loadAppointments(doctorId)
    } catch (error: any) {
      console.error('Erro ao atualizar consulta:', error)
      toast.error('Erro ao atualizar consulta')
    }
  }

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta consulta?')) return

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Consulta excluída com sucesso!')
      if (doctorId) loadAppointments(doctorId)
    } catch (error: any) {
      console.error('Erro ao excluir consulta:', error)
      toast.error('Erro ao excluir consulta')
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      toast.success('Status atualizado!')
      if (doctorId) loadAppointments(doctorId)
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error)
      toast.error('Erro ao atualizar status')
    }
  }

  const resetForm = () => {
    setFormData({
      patient_id: '',
      patient_name: '',
      patient_email: '',
      patient_phone: '',
      date: '',
      time: '',
      type: 'Consulta Regular',
      notes: ''
    })
  }

  const openEditModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setFormData({
      patient_id: appointment.status, // Temporariamente usando para status
      patient_name: appointment.patient_name,
      patient_email: appointment.patient_email,
      patient_phone: appointment.patient_phone,
      date: appointment.appointment_date,
      time: appointment.appointment_time,
      type: appointment.type,
      notes: appointment.notes
    })
    setShowEditModal(true)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterAppointments(term, statusFilter)
  }

  const handleFilterStatus = (status: string) => {
    setStatusFilter(status)
    filterAppointments(searchTerm, status)
  }

  const filterAppointments = (search: string, status: string) => {
    let filtered = appointments

    if (search) {
      filtered = filtered.filter(apt => 
        apt.patient_name.toLowerCase().includes(search.toLowerCase()) ||
        apt.patient_email.toLowerCase().includes(search.toLowerCase()) ||
        apt.type.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (status !== 'all') {
      filtered = filtered.filter(apt => apt.status === status)
    }

    setFilteredAppointments(filtered)
  }

  const getWeekDays = () => {
    const days = []
    const startOfWeek = new Date(currentWeek)
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay())

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }

    return days
  }

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return filteredAppointments.filter(apt => apt.appointment_date === dateStr)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-300'
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada'
      case 'confirmed': return 'Confirmada'
      case 'completed': return 'Concluída'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    toast.success('Logout realizado com sucesso!')
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
              className="lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Agendamento de Consultas
                </h1>
                <p className="text-xs text-muted-foreground">Gerencie sua agenda</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Toolbar */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por paciente, email ou tipo..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
                >
                  <option value="all">Todos os Status</option>
                  <option value="scheduled">Agendada</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="completed">Concluída</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                Nova Consulta
              </Button>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newWeek = new Date(currentWeek)
                  newWeek.setDate(currentWeek.getDate() - 7)
                  setCurrentWeek(newWeek)
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold">
                {currentWeek.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newWeek = new Date(currentWeek)
                  newWeek.setDate(currentWeek.getDate() + 7)
                  setCurrentWeek(newWeek)
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
              {getWeekDays().map((day, index) => {
                const dayAppointments = getAppointmentsForDay(day)
                const isToday = day.toDateString() === new Date().toDateString()

                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 min-h-[200px] ${
                      isToday ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <div className="text-center mb-3">
                      <p className="text-xs text-muted-foreground">
                        {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </p>
                      <p className={`text-lg font-bold ${isToday ? 'text-purple-600' : ''}`}>
                        {day.getDate()}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {dayAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className={`p-2 rounded border text-xs cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(apt.status)}`}
                          onClick={() => openEditModal(apt)}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <Clock className="w-3 h-3" />
                            <span className="font-semibold">{apt.appointment_time}</span>
                          </div>
                          <p className="font-medium truncate">{apt.patient_name}</p>
                          <p className="text-xs opacity-75 truncate">{apt.type}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* List View */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Horário</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Paciente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Contato</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        Nenhuma consulta encontrada
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm">
                          {new Date(apt.appointment_date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{apt.appointment_time}</td>
                        <td className="px-4 py-3 text-sm">{apt.patient_name}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1 text-xs">
                              <Mail className="w-3 h-3" />
                              {apt.patient_email}
                            </span>
                            {apt.patient_phone && (
                              <span className="flex items-center gap-1 text-xs">
                                <Phone className="w-3 h-3" />
                                {apt.patient_phone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{apt.type}</td>
                        <td className="px-4 py-3">
                          <select
                            value={apt.status}
                            onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                            className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(apt.status)}`}
                          >
                            <option value="scheduled">Agendada</option>
                            <option value="confirmed">Confirmada</option>
                            <option value="completed">Concluída</option>
                            <option value="cancelled">Cancelada</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(apt)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAppointment(apt.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal: Adicionar Consulta */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Nova Consulta
            </DialogTitle>
            <DialogDescription>
              Agende uma nova consulta para um paciente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="patient">Paciente *</Label>
              <select
                id="patient"
                value={formData.patient_id}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className="w-full mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"
              >
                <option value="">Selecione um paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.email}
                  </option>
                ))}
              </select>
              {patients.length === 0 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                  ⚠️ Nenhum paciente autorizado. Adicione pacientes no Painel do Doutor primeiro.
                </p>
              )}
            </div>

            {/* Exibir dados do paciente selecionado */}
            {formData.patient_id && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Dados do Paciente Selecionado:
                </p>
                <div className="space-y-1 text-sm">
                  <p className="text-blue-800 dark:text-blue-200">
                    <strong>Nome:</strong> {formData.patient_name}
                  </p>
                  <p className="text-blue-800 dark:text-blue-200">
                    <strong>Email:</strong> {formData.patient_email}
                  </p>
                  {formData.patient_phone && (
                    <p className="text-blue-800 dark:text-blue-200">
                      <strong>Telefone:</strong> {formData.patient_phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="time">Horário *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="type">Tipo de Consulta</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="Ex: Consulta Regular, Retorno, etc."
              />
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Anotações sobre a consulta..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button onClick={handleAddAppointment} className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500">
              <Check className="w-4 h-4" />
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar Consulta */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-600" />
              Editar Consulta
            </DialogTitle>
            <DialogDescription>
              Atualize as informações da consulta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">Paciente</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {formData.patient_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{formData.patient_name}</p>
                  <p className="text-xs text-muted-foreground">{formData.patient_email}</p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_date">Data *</Label>
                <Input
                  id="edit_date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_time">Horário *</Label>
                <Input
                  id="edit_time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_type">Tipo de Consulta</Label>
              <Input
                id="edit_type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit_status">Status</Label>
              <select
                id="edit_status"
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                className="w-full mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"
              >
                <option value="scheduled">Agendada</option>
                <option value="confirmed">Confirmada</option>
                <option value="completed">Concluída</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <div>
              <Label htmlFor="edit_notes">Observações</Label>
              <Textarea
                id="edit_notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditModal(false); setSelectedAppointment(null); resetForm(); }}>
              Cancelar
            </Button>
            <Button onClick={handleEditAppointment} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Check className="w-4 h-4" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
