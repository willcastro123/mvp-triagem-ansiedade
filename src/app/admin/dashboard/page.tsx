'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, Users, Activity, TrendingUp, Calendar, Edit, Trash2, UserCheck, Plus, Shield } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  city: string;
  anxiety_type: string;
  is_premium: boolean;
  created_at: string;
}

interface Doctor {
  id: string;
  user_id: string;
  specialty: string;
  crm: string;
  created_at: string;
}

interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  activity_description: string;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  totalDoctors: number;
  totalActivities: number;
  todayActivities: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    premiumUsers: 0,
    totalDoctors: 0,
    totalActivities: 0,
    todayActivities: 0
  });

  // Estados para modais
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Estados para formulários
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    city: '',
    anxiety_type: 'general',
    is_premium: false
  });

  const [doctorFormData, setDoctorFormData] = useState({
    specialty: '',
    crm: ''
  });

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = () => {
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      router.push('/admin/login');
      return;
    }

    try {
      const admin = JSON.parse(adminData);
      if (!admin || !admin.email) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      router.push('/admin/login');
    }
  };

  const loadData = async () => {
    try {
      // Importar supabase dinamicamente apenas no cliente
      const { supabase } = await import('@/lib/supabase');

      // Carregar usuários da tabela user_profiles
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Erro ao carregar usuários:', usersError);
      } else if (usersData) {
        setUsers(usersData);
        
        // Calcular estatísticas
        setStats(prev => ({
          ...prev,
          totalUsers: usersData.length,
          premiumUsers: usersData.filter(u => u.is_premium).length
        }));
      }

      // Carregar doutores (se existir tabela doctors)
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: false });

      if (!doctorsError && doctorsData) {
        setDoctors(doctorsData);
        setStats(prev => ({
          ...prev,
          totalDoctors: doctorsData.length
        }));
      }

      // Carregar atividades da tabela user_activity_logs
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('user_activity_logs')
        .select('id, user_id, activity_type, activity_description, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (activitiesError) {
        console.error('Erro ao carregar atividades:', activitiesError);
      } else if (activitiesData) {
        // Buscar dados dos usuários separadamente
        const userIds = [...new Set(activitiesData.map((a: any) => a.user_id))];
        const { data: usersForActivities } = await supabase
          .from('user_profiles')
          .select('id, name, email')
          .in('id', userIds);

        // Criar um mapa de usuários para acesso rápido
        const userMap = new Map(usersForActivities?.map(u => [u.id, u]) || []);

        // Transformar dados para o formato esperado
        const formattedActivities = activitiesData.map((activity: any) => {
          const user = userMap.get(activity.user_id);
          return {
            id: activity.id,
            user_id: activity.user_id,
            activity_type: activity.activity_type,
            activity_description: activity.activity_description,
            created_at: activity.created_at,
            user_name: user?.name || 'Usuário desconhecido',
            user_email: user?.email || ''
          };
        });
        
        setActivities(formattedActivities as any);
        
        const today = new Date().toISOString().split('T')[0];
        const todayCount = activitiesData.filter((a: any) => 
          a.created_at.startsWith(today)
        ).length;

        setStats(prev => ({
          ...prev,
          totalActivities: activitiesData.length,
          todayActivities: todayCount
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/admin/login');
  };

  const handleCreateUser = async () => {
    try {
      // Validar campos obrigatórios
      if (!formData.name || !formData.email || !formData.password) {
        alert('Preencha todos os campos obrigatórios');
        return;
      }

      const { supabase } = await import('@/lib/supabase');

      // Inserir diretamente na tabela user_profiles
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          name: formData.name,
          email: formData.email,
          password: formData.password, // Em produção, usar hash
          city: formData.city || '',
          anxiety_type: formData.anxiety_type,
          is_premium: formData.is_premium,
          triage_completed: false,
          points: 0
        }])
        .select();

      if (error) throw error;

      alert('Usuário criado com sucesso!');
      setShowCreateUser(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário: ' + error.message);
    }
  };

  const openEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      city: user.city,
      anxiety_type: user.anxiety_type,
      is_premium: user.is_premium
    });
    setShowEditUser(true);
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      const { supabase } = await import('@/lib/supabase');

      const updateData: any = {
        name: formData.name,
        city: formData.city,
        anxiety_type: formData.anxiety_type,
        is_premium: formData.is_premium
      };

      // Se uma nova senha foi fornecida, incluí-la na atualização
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', selectedUser.id);

      if (error) throw error;

      alert('Usuário atualizado com sucesso!');
      setShowEditUser(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar usuário: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      alert('Conta excluída com sucesso!');
      loadData();
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error);
      alert('Erro ao excluir conta: ' + error.message);
    }
  };

  const openAddDoctor = (user: User) => {
    setSelectedUser(user);
    setDoctorFormData({
      specialty: '',
      crm: ''
    });
    setShowAddDoctor(true);
  };

  const handleAddDoctor = async () => {
    if (!selectedUser) return;

    try {
      // Validar campos
      if (!doctorFormData.specialty || !doctorFormData.crm) {
        alert('Preencha todos os campos do doutor');
        return;
      }

      const { supabase } = await import('@/lib/supabase');

      // Criar tabela doctors se não existir
      await supabase.rpc('create_doctors_table_if_not_exists');

      // Inserir na tabela doctors
      const { error } = await supabase
        .from('doctors')
        .insert([{
          user_id: selectedUser.id,
          specialty: doctorFormData.specialty,
          crm: doctorFormData.crm
        }]);

      if (error) throw error;

      alert('Doutor cadastrado com sucesso!');
      setShowAddDoctor(false);
      loadData();
    } catch (error: any) {
      console.error('Erro ao adicionar doutor:', error);
      alert('Erro ao adicionar doutor: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      city: '',
      anxiety_type: 'general',
      is_premium: false
    });
    setDoctorFormData({
      specialty: '',
      crm: ''
    });
    setSelectedUser(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return '🔐';
      case 'exposure': return '🎯';
      case 'breathing': return '🫁';
      case 'sale': return '💰';
      default: return '📝';
    }
  };

  const getUserDoctorInfo = (userId: string) => {
    return doctors.find(d => d.user_id === userId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-purple-500/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2 border-purple-500/20 hover:bg-purple-500/10"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
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
              <Shield className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <p className="text-3xl font-bold text-white">{stats.totalDoctors}</p>
              <p className="text-sm text-gray-400">Total de Doutores</p>
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
              <Activity className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <p className="text-3xl font-bold text-white">{stats.totalActivities}</p>
              <p className="text-sm text-gray-400">Total de Atividades</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="doctors">Doutores</TabsTrigger>
            <TabsTrigger value="activities">Atividades</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Gerenciamento de Usuários
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Gerencie usuários cadastrados no sistema
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowCreateUser(true)}
                    className="gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                    Criar Usuário
                  </Button>
                </div>
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
                        <TableHead className="text-gray-300">Premium</TableHead>
                        <TableHead className="text-gray-300">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="border-purple-500/20">
                          <TableCell className="text-white font-medium">{user.name}</TableCell>
                          <TableCell className="text-gray-300">{user.email}</TableCell>
                          <TableCell className="text-gray-300">{user.city || '-'}</TableCell>
                          <TableCell className="text-gray-300 capitalize">
                            {user.anxiety_type === 'social' && 'Social'}
                            {user.anxiety_type === 'panic' && 'Pânico'}
                            {user.anxiety_type === 'general' && 'Generalizada'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.is_premium ? 'default' : 'secondary'} className={user.is_premium ? 'bg-green-500' : ''}>
                              {user.is_premium ? 'Sim' : 'Não'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditUser(user)}
                                className="gap-1 border-purple-500/20 hover:bg-purple-500/10"
                              >
                                <Edit className="w-3 h-3" />
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteUser(user.id)}
                                className="gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                Excluir
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Doctors Tab */}
          <TabsContent value="doctors">
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Gerenciamento de Doutores
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Adicione dados profissionais de doutores
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Lista de usuários para adicionar como doutor */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Adicionar Dados de Doutor</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-purple-500/20">
                            <TableHead className="text-gray-300">Nome</TableHead>
                            <TableHead className="text-gray-300">E-mail</TableHead>
                            <TableHead className="text-gray-300">Cidade</TableHead>
                            <TableHead className="text-gray-300">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.filter(user => !getUserDoctorInfo(user.id)).map((user) => (
                            <TableRow key={user.id} className="border-purple-500/20">
                              <TableCell className="text-white font-medium">{user.name}</TableCell>
                              <TableCell className="text-gray-300">{user.email}</TableCell>
                              <TableCell className="text-gray-300">{user.city || '-'}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  onClick={() => openAddDoctor(user)}
                                  className="gap-1 bg-green-600 hover:bg-green-700"
                                >
                                  <Plus className="w-3 h-3" />
                                  Adicionar Dados
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Lista de doutores existentes */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Doutores Cadastrados</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-purple-500/20">
                            <TableHead className="text-gray-300">Nome</TableHead>
                            <TableHead className="text-gray-300">E-mail</TableHead>
                            <TableHead className="text-gray-300">Especialidade</TableHead>
                            <TableHead className="text-gray-300">CRM</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {doctors.map((doctor) => {
                            const user = users.find(u => u.id === doctor.user_id);
                            if (!user) return null;
                            return (
                              <TableRow key={doctor.id} className="border-purple-500/20">
                                <TableCell className="text-white font-medium">{user.name}</TableCell>
                                <TableCell className="text-gray-300">{user.email}</TableCell>
                                <TableCell className="text-gray-300">{doctor.specialty}</TableCell>
                                <TableCell className="text-gray-300">{doctor.crm}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities">
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
                  {activities.map((activity: any) => (
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
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal: Criar Usuário */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="bg-slate-800 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">Criar Novo Usuário</DialogTitle>
            <DialogDescription className="text-gray-400">
              Preencha os dados do novo usuário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-900 border-purple-500/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-300">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-900 border-purple-500/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-300">Senha *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-slate-900 border-purple-500/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="city" className="text-gray-300">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="bg-slate-900 border-purple-500/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="anxiety_type" className="text-gray-300">Tipo de Ansiedade</Label>
              <Select value={formData.anxiety_type} onValueChange={(value) => setFormData({ ...formData, anxiety_type: value })}>
                <SelectTrigger className="bg-slate-900 border-purple-500/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Generalizada</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="panic">Pânico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_premium"
                checked={formData.is_premium}
                onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_premium" className="text-gray-300">Usuário Premium</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateUser(false)} className="border-purple-500/20">
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} className="bg-purple-600 hover:bg-purple-700">
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar Usuário */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent className="bg-slate-800 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Usuário</DialogTitle>
            <DialogDescription className="text-gray-400">
              Atualize os dados do usuário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_name" className="text-gray-300">Nome</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-900 border-purple-500/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit_password" className="text-gray-300">Nova Senha (deixe em branco para manter a atual)</Label>
              <Input
                id="edit_password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-slate-900 border-purple-500/20 text-white"
                placeholder="Digite a nova senha"
              />
            </div>
            <div>
              <Label htmlFor="edit_city" className="text-gray-300">Cidade</Label>
              <Input
                id="edit_city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="bg-slate-900 border-purple-500/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit_anxiety_type" className="text-gray-300">Tipo de Ansiedade</Label>
              <Select value={formData.anxiety_type} onValueChange={(value) => setFormData({ ...formData, anxiety_type: value })}>
                <SelectTrigger className="bg-slate-900 border-purple-500/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Generalizada</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="panic">Pânico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit_is_premium"
                checked={formData.is_premium}
                onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="edit_is_premium" className="text-gray-300">Usuário Premium</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditUser(false)} className="border-purple-500/20">
              Cancelar
            </Button>
            <Button onClick={handleEditUser} className="bg-purple-600 hover:bg-purple-700">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Adicionar Doutor */}
      <Dialog open={showAddDoctor} onOpenChange={setShowAddDoctor}>
        <DialogContent className="bg-slate-800 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">Adicionar Dados de Doutor</DialogTitle>
            <DialogDescription className="text-gray-400">
              Preencha as informações profissionais do doutor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-purple-500/10">
              <p className="text-white font-semibold mb-1">{selectedUser?.name}</p>
              <p className="text-gray-400 text-sm">{selectedUser?.email}</p>
            </div>
            <div>
              <Label htmlFor="specialty" className="text-gray-300">Especialidade *</Label>
              <Input
                id="specialty"
                value={doctorFormData.specialty}
                onChange={(e) => setDoctorFormData({ ...doctorFormData, specialty: e.target.value })}
                placeholder="Ex: Psiquiatria, Psicologia"
                className="bg-slate-900 border-purple-500/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="crm" className="text-gray-300">CRM/CRP *</Label>
              <Input
                id="crm"
                value={doctorFormData.crm}
                onChange={(e) => setDoctorFormData({ ...doctorFormData, crm: e.target.value })}
                placeholder="Ex: CRM 12345/SP"
                className="bg-slate-900 border-purple-500/20 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDoctor(false)} className="border-purple-500/20">
              Cancelar
            </Button>
            <Button onClick={handleAddDoctor} className="bg-green-600 hover:bg-green-700">
              Adicionar Doutor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}