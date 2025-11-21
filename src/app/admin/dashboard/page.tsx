"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, LogOut, Users, Activity, TrendingUp, Eye, Calendar, MessageSquare, Pill, Target, Brain, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface AdminUser {
  id: string
  email: string
  name: string
}

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  age: string
  gender: string
  city: string
  anxiety_type: string
  is_premium: boolean
  points: number
  created_at: string
}

interface ActivityLog {
  id: string
  user_id: string
  activity_type: string
  activity_description: string
  metadata: any
  created_at: string
  user_name?: string
  user_email?: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    totalActivities: 0,
    todayActivities: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verifica se admin está logado
    const adminStr = localStorage.getItem('admin')
    if (!adminStr) {
      router.push('/admin/login')
      return
    }

    const adminData = JSON.parse(adminStr)
    setAdmin(adminData)
    loadDashboardData()
  }, [router])

  const loadDashboardData = async () => {
    try {
      // Carrega todos os usuários
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Carrega todas as atividades
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (activitiesError) throw activitiesError

      // Enriquece atividades com dados do usuário
      const enrichedActivities = activitiesData?.map(activity => {
        const user = usersData?.find(u => u.id === activity.user_id)
        return {
          ...activity,
          user_name: user?.name || 'Usuário desconhecido',
          user_email: user?.email || ''
        }
      }) || []

      // Calcula estatísticas
      const today = new Date().toISOString().split('T')[0]
      const todayActivities = activitiesData?.filter(a => 
        a.created_at.startsWith(today)
      ).length || 0

      setUsers(usersData || [])
      setActivities(enrichedActivities)
      setStats({
        totalUsers: usersData?.length || 0,
        premiumUsers: usersData?.filter(u => u.is_premium).length || 0,
        totalActivities: activitiesData?.length || 0,
        todayActivities
      })

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados do dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    toast.success('Logout realizado com sucesso!')
    router.push('/')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <Eye className="w-4 h-4" />
      case 'logout': return <LogOut className="w-4 h-4" />
      case 'dashboard_access': return <Activity className="w-4 h-4" />
      case 'mood_entry': return <Heart className="w-4 h-4" />
      case 'medication_added': return <Pill className="w-4 h-4" />
      case 'habit_completed': return <Target className="w-4 h-4" />
      case 'chat_message': return <MessageSquare className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!admin) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Painel Administrativo
                </h1>
                <p className="text-xs text-gray-400">Bem-vindo, {admin.name}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 border-purple-500/20 hover:bg-purple-500/10"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
              <p className="text-sm text-gray-400">Total de Usuários</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <p className="text-3xl font-bold text-white">{stats.premiumUsers}</p>
              <p className="text-sm text-gray-400">Usuários Premium</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-6 text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <p className="text-3xl font-bold text-white">{stats.totalActivities}</p>
              <p className="text-sm text-gray-400">Total de Atividades</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-6 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <p className="text-3xl font-bold text-white">{stats.todayActivities}</p>
              <p className="text-sm text-gray-400">Atividades Hoje</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="mb-8 bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuários Cadastrados
            </CardTitle>
            <CardDescription className="text-gray-400">
              Lista completa de todos os usuários da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-purple-500/20">
                    <TableHead className="text-gray-300">Nome</TableHead>
                    <TableHead className="text-gray-300">E-mail</TableHead>
                    <TableHead className="text-gray-300">Cidade</TableHead>
                    <TableHead className="text-gray-300">Tipo de Ansiedade</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Pontos</TableHead>
                    <TableHead className="text-gray-300">Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-purple-500/20">
                      <TableCell className="text-white font-medium">{user.name}</TableCell>
                      <TableCell className="text-gray-300">{user.email}</TableCell>
                      <TableCell className="text-gray-300">{user.city}</TableCell>
                      <TableCell className="text-gray-300 capitalize">
                        {user.anxiety_type === 'social' && 'Social'}
                        {user.anxiety_type === 'panic' && 'Pânico'}
                        {user.anxiety_type === 'general' && 'Generalizada'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_premium ? "default" : "secondary"} className={user.is_premium ? "bg-green-500" : ""}>
                          {user.is_premium ? 'Premium' : 'Gratuito'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{user.points || 0}</TableCell>
                      <TableCell className="text-gray-300">{formatDate(user.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Activity Logs */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Registro de Atividades
            </CardTitle>
            <CardDescription className="text-gray-400">
              Últimas 50 atividades dos usuários na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border border-purple-500/10"
                >
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-purple-400">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white">{activity.user_name}</p>
                      <Badge variant="outline" className="text-xs border-purple-500/20 text-gray-400">
                        {activity.activity_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{activity.activity_description}</p>
                    <p className="text-xs text-gray-500">{activity.user_email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">{formatDate(activity.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
