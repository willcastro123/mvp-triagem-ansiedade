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
import { Textarea } from '@/components/ui/textarea';
import { LogOut, Users, Activity, TrendingUp, Calendar, Edit, Trash2, UserCheck, Plus, Shield, MessageSquare, Video, Upload, Key, UserPlus, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  city: string;
  anxiety_type: string;
  is_premium: boolean;
  access_code?: string;
  created_at: string;
}

interface Doctor {
  id: string;
  user_id: string;
  specialty: string;
  crm: string;
  created_at: string;
}

interface DoctorPatient {
  id: string;
  doctor_id: string;
  patient_id: string;
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
  totalInvoices: number;
  pendingInvoices: number;
  paidInvoices: number;
}

interface MeditationVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  created_at: string;
}

interface Invoice {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'unpaid';
  due_date: string;
  paid_date?: string;
  description: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorPatients, setDoctorPatients] = useState<DoctorPatient[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [meditationVideos, setMeditationVideos] = useState<MeditationVideo[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    premiumUsers: 0,
    totalDoctors: 0,
    totalActivities: 0,
    todayActivities: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
    paidInvoices: 0
  });

  // Estados para modais
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showUploadVideo, setShowUploadVideo] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showGenerateInvoices, setShowGenerateInvoices] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [patientAccessCode, setPatientAccessCode] = useState('');

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

  const [videoFormData, setVideoFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration: 0
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

      // Carregar relacionamentos doutor-paciente
      const { data: doctorPatientsData, error: doctorPatientsError } = await supabase
        .from('doctor_patients')
        .select('*');

      if (!doctorPatientsError && doctorPatientsData) {
        setDoctorPatients(doctorPatientsData);
      }

      // Carregar vídeos de meditação
      const { data: videosData, error: videosError } = await supabase
        .from('meditation_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!videosError && videosData) {
        setMeditationVideos(videosData);
      }

      // Carregar faturas
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (!invoicesError && invoicesData) {
        // Buscar dados dos usuários para as faturas
        const userIds = [...new Set(invoicesData.map((inv: any) => inv.user_id))];
        const { data: usersForInvoices } = await supabase
          .from('user_profiles')
          .select('id, name, email')
          .in('id', userIds);

        const userMap = new Map(usersForInvoices?.map(u => [u.id, u]) || []);

        const formattedInvoices = invoicesData.map((invoice: any) => {
          const user = userMap.get(invoice.user_id);
          return {
            ...invoice,
            user_name: user?.name || 'Usuário desconhecido',
            user_email: user?.email || ''
          };
        });

        setInvoices(formattedInvoices);
        
        setStats(prev => ({
          ...prev,
          totalInvoices: invoicesData.length,
          pendingInvoices: invoicesData.filter((i: any) => i.status === 'pending').length,
          paidInvoices: invoicesData.filter((i: any) => i.status === 'paid').length
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

  const generateAccessCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleCreateUser = async () => {
    try {
      // Validar campos obrigatórios
      if (!formData.name || !formData.email || !formData.password) {
        alert('Preencha todos os campos obrigatórios');
        return;
      }

      const { supabase } = await import('@/lib/supabase');

      // Gerar código de acesso único
      const accessCode = generateAccessCode();

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
          access_code: accessCode,
          triage_completed: false,
          points: 0
        }])
        .select();

      if (error) throw error;

      alert(`Usuário criado com sucesso! Código de acesso: ${accessCode}`);
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

      // Inserir na tabela doctors
      const { error } = await supabase
        .from('doctors')
        .insert([{
          user_id: selectedUser.id,
          specialty: doctorFormData.specialty,
          crm: doctorFormData.crm
        }])
        .select();

      if (error) throw error;

      alert('Doutor cadastrado com sucesso!');
      setShowAddDoctor(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Erro ao adicionar doutor:', error);
      alert('Erro ao adicionar doutor: ' + error.message);
    }
  };

  const openAddPatient = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setPatientAccessCode('');
    setShowAddPatient(true);
  };

  const handleAddPatient = async () => {
    if (!selectedDoctor) return;

    try {
      // Validar código de acesso
      if (!patientAccessCode.trim()) {
        alert('Digite o código de acesso do paciente');
        return;
      }

      const { supabase } = await import('@/lib/supabase');

      // Buscar paciente pelo código de acesso
      const { data: patientData, error: patientError } = await supabase
        .from('user_profiles')
        .select('id, name, email, access_code')
        .eq('access_code', patientAccessCode.toUpperCase())
        .single();

      if (patientError || !patientData) {
        alert('Código de acesso inválido. Verifique e tente novamente.');
        return;
      }

      // Verificar se o paciente já está vinculado a este doutor
      const { data: existingRelation } = await supabase
        .from('doctor_patients')
        .select('id')
        .eq('doctor_id', selectedDoctor.id)
        .eq('patient_id', patientData.id)
        .single();

      if (existingRelation) {
        alert('Este paciente já está vinculado a este doutor.');
        return;
      }

      // Criar relacionamento doutor-paciente
      const { error: insertError } = await supabase
        .from('doctor_patients')
        .insert([{
          doctor_id: selectedDoctor.id,
          patient_id: patientData.id
        }]);

      if (insertError) throw insertError;

      alert(`Paciente ${patientData.name} adicionado com sucesso!`);
      setShowAddPatient(false);
      setPatientAccessCode('');
      loadData();
    } catch (error: any) {
      console.error('Erro ao adicionar paciente:', error);
      alert('Erro ao adicionar paciente: ' + error.message);
    }
  };

  const handleUploadVideo = async () => {
    try {
      // Validar campos obrigatórios
      if (!videoFormData.title || !videoFormData.video_url) {
        alert('Preencha pelo menos o título e a URL do vídeo');
        return;
      }

      const { supabase } = await import('@/lib/supabase');

      // Inserir vídeo na tabela
      const { error } = await supabase
        .from('meditation_videos')
        .insert([{
          title: videoFormData.title,
          description: videoFormData.description,
          video_url: videoFormData.video_url,
          thumbnail_url: videoFormData.thumbnail_url || '',
          duration: videoFormData.duration || 0
        }]);

      if (error) throw error;

      alert('Vídeo adicionado com sucesso!');
      setShowUploadVideo(false);
      resetVideoForm();
      loadData();
    } catch (error: any) {
      console.error('Erro ao adicionar vídeo:', error);
      alert('Erro ao adicionar vídeo: ' + error.message);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) {
      return;
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      const { error } = await supabase
        .from('meditation_videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      alert('Vídeo excluído com sucesso!');
      loadData();
    } catch (error: any) {
      console.error('Erro ao excluir vídeo:', error);
      alert('Erro ao excluir vídeo: ' + error.message);
    }
  };

  const handleGenerateMonthlyInvoices = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');

      // Obter data atual e calcular vencimento (próximo mês)
      const now = new Date();
      const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 10); // Vencimento dia 10 do próximo mês
      const dueDateStr = dueDate.toISOString().split('T')[0];

      const invoicesToCreate = [];

      // Gerar faturas para todos os usuários
      for (const user of users) {
        // Verificar se já existe fatura pendente para este usuário neste mês
        const { data: existingInvoice } = await supabase
          .from('invoices')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .gte('due_date', now.toISOString().split('T')[0])
          .single();

        if (existingInvoice) {
          continue; // Já existe fatura pendente, pular
        }

        // Verificar se usuário é doutor
        const isDoctor = doctors.some(d => d.user_id === user.id);
        
        // Definir valor: R$ 34,90 para usuários normais, R$ 24,90 para doutores
        const amount = isDoctor ? 24.90 : 34.90;

        invoicesToCreate.push({
          user_id: user.id,
          amount: amount,
          status: 'pending',
          due_date: dueDateStr,
          description: `Mensalidade ${now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })} - ${isDoctor ? 'Plano Doutor' : 'Plano Padrão'}`
        });
      }

      if (invoicesToCreate.length === 0) {
        alert('Não há faturas para gerar. Todos os usuários já possuem faturas pendentes.');
        return;
      }

      // Inserir faturas em lote
      const { error } = await supabase
        .from('invoices')
        .insert(invoicesToCreate);

      if (error) throw error;

      alert(`${invoicesToCreate.length} faturas geradas com sucesso!`);
      setShowGenerateInvoices(false);
      loadData();
    } catch (error: any) {
      console.error('Erro ao gerar faturas:', error);
      alert('Erro ao gerar faturas: ' + error.message);
    }
  };

  const handleConfirmPayment = async (invoiceId: string) => {
    if (!confirm('Confirmar pagamento desta fatura?')) {
      return;
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      const { error } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString()
        })
        .eq('id', invoiceId);

      if (error) throw error;

      alert('Pagamento confirmado com sucesso!');
      loadData();
    } catch (error: any) {
      console.error('Erro ao confirmar pagamento:', error);
      alert('Erro ao confirmar pagamento: ' + error.message);
    }
  };

  const handleMarkAsUnpaid = async (invoiceId: string) => {
    if (!confirm('Marcar esta fatura como não paga?')) {
      return;
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      const { error } = await supabase
        .from('invoices')
        .update({
          status: 'unpaid'
        })
        .eq('id', invoiceId);

      if (error) throw error;

      alert('Fatura marcada como não paga.');
      loadData();
    } catch (error: any) {
      console.error('Erro ao atualizar fatura:', error);
      alert('Erro ao atualizar fatura: ' + error.message);
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
    setSelectedDoctor(null);
  };

  const resetVideoForm = () => {
    setVideoFormData({
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      duration: 0
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Paga</Badge>;
      case 'unpaid':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Não Paga</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
    }
  };

  const getUserDoctorInfo = (userId: string) => {
    return doctors.find(d => d.user_id === userId);
  };

  const getDoctorPatients = (doctorId: string) => {
    const patientIds = doctorPatients
      .filter(dp => dp.doctor_id === doctorId)
      .map(dp => dp.patient_id);
    
    return users.filter(u => patientIds.includes(u.id));
  };

  const filterInvoicesByStatus = (status: string) => {
    return invoices.filter(inv => inv.status === status);
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
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <p className="text-3xl font-bold text-white">{stats.pendingInvoices}</p>
              <p className="text-sm text-gray-400">Faturas Pendentes</p>
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

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="bg-slate-800/50 border-purple-500/20 cursor-pointer hover:bg-slate-800/70 transition-colors"
            onClick={() => router.push('/admin/meditation-comments')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Moderação de Comentários</h3>
                  <p className="text-sm text-gray-400">Aprovar ou rejeitar comentários de meditação</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-slate-800/50 border-purple-500/20 cursor-pointer hover:bg-slate-800/70 transition-colors"
            onClick={() => setShowUploadVideo(true)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Upload de Vídeo</h3>
                  <p className="text-sm text-gray-400">Adicionar novo vídeo de meditação</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-slate-800/50 border-purple-500/20 cursor-pointer hover:bg-slate-800/70 transition-colors"
            onClick={() => setShowGenerateInvoices(true)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Gerar Faturas Mensais</h3>
                  <p className="text-sm text-gray-400">Criar faturas automáticas para todos os usuários</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="invoices">Faturas</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="doctors">Doutores</TabsTrigger>
            <TabsTrigger value="videos">Vídeos</TabsTrigger>
            <TabsTrigger value="activities">Atividades</TabsTrigger>
          </TabsList>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <div className="space-y-6">
              {/* Resumo de Faturas */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-slate-800/50 border-yellow-500/20">
                  <CardContent className="pt-6 text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <p className="text-3xl font-bold text-white">{stats.pendingInvoices}</p>
                    <p className="text-sm text-gray-400">Pendentes</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-green-500/20">
                  <CardContent className="pt-6 text-center">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <p className="text-3xl font-bold text-white">{stats.paidInvoices}</p>
                    <p className="text-sm text-gray-400">Pagas</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-red-500/20">
                  <CardContent className="pt-6 text-center">
                    <XCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                    <p className="text-3xl font-bold text-white">
                      {invoices.filter(i => i.status === 'unpaid').length}
                    </p>
                    <p className="text-sm text-gray-400">Não Pagas</p>
                  </CardContent>
                </Card>
              </div>

              {/* Faturas Pendentes */}
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    Faturas Pendentes
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Faturas aguardando confirmação de pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-purple-500/20">
                          <TableHead className="text-gray-300">Usuário</TableHead>
                          <TableHead className="text-gray-300">E-mail</TableHead>
                          <TableHead className="text-gray-300">Valor</TableHead>
                          <TableHead className="text-gray-300">Vencimento</TableHead>
                          <TableHead className="text-gray-300">Descrição</TableHead>
                          <TableHead className="text-gray-300">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterInvoicesByStatus('pending').map((invoice) => (
                          <TableRow key={invoice.id} className="border-purple-500/20">
                            <TableCell className="text-white font-medium">{invoice.user_name}</TableCell>
                            <TableCell className="text-gray-300">{invoice.user_email}</TableCell>
                            <TableCell className="text-white font-semibold">{formatCurrency(invoice.amount)}</TableCell>
                            <TableCell className="text-gray-300">{formatDateOnly(invoice.due_date)}</TableCell>
                            <TableCell className="text-gray-300 text-sm">{invoice.description}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleConfirmPayment(invoice.id)}
                                  className="gap-1 bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  Confirmar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleMarkAsUnpaid(invoice.id)}
                                  className="gap-1"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Não Paga
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

              {/* Faturas Pagas */}
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Faturas Pagas
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Histórico de faturas confirmadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-purple-500/20">
                          <TableHead className="text-gray-300">Usuário</TableHead>
                          <TableHead className="text-gray-300">Valor</TableHead>
                          <TableHead className="text-gray-300">Vencimento</TableHead>
                          <TableHead className="text-gray-300">Data Pagamento</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterInvoicesByStatus('paid').map((invoice) => (
                          <TableRow key={invoice.id} className="border-purple-500/20">
                            <TableCell className="text-white font-medium">{invoice.user_name}</TableCell>
                            <TableCell className="text-white font-semibold">{formatCurrency(invoice.amount)}</TableCell>
                            <TableCell className="text-gray-300">{formatDateOnly(invoice.due_date)}</TableCell>
                            <TableCell className="text-gray-300">
                              {invoice.paid_date ? formatDate(invoice.paid_date) : '-'}
                            </TableCell>
                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Faturas Não Pagas */}
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-400" />
                    Faturas Não Pagas
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Faturas vencidas ou não pagas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-purple-500/20">
                          <TableHead className="text-gray-300">Usuário</TableHead>
                          <TableHead className="text-gray-300">E-mail</TableHead>
                          <TableHead className="text-gray-300">Valor</TableHead>
                          <TableHead className="text-gray-300">Vencimento</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterInvoicesByStatus('unpaid').map((invoice) => (
                          <TableRow key={invoice.id} className="border-purple-500/20">
                            <TableCell className="text-white font-medium">{invoice.user_name}</TableCell>
                            <TableCell className="text-gray-300">{invoice.user_email}</TableCell>
                            <TableCell className="text-white font-semibold">{formatCurrency(invoice.amount)}</TableCell>
                            <TableCell className="text-gray-300">{formatDateOnly(invoice.due_date)}</TableCell>
                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => handleConfirmPayment(invoice.id)}
                                className="gap-1 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Confirmar Pagamento
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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
                        <TableHead className="text-gray-300">Código de Acesso</TableHead>
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
                          <TableCell className="text-gray-300">
                            <Badge variant="outline" className="font-mono border-purple-500/20">
                              {user.access_code || 'N/A'}
                            </Badge>
                          </TableCell>
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
                      Adicione dados profissionais de doutores e gerencie seus pacientes
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

                  {/* Lista de doutores existentes com seus pacientes */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Doutores Cadastrados</h3>
                    <div className="space-y-4">
                      {doctors.map((doctor) => {
                        const user = users.find(u => u.id === doctor.user_id);
                        const patients = getDoctorPatients(doctor.id);
                        if (!user) return null;
                        
                        return (
                          <Card key={doctor.id} className="bg-slate-900/50 border-purple-500/10">
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h4 className="text-white font-semibold text-lg">{user.name}</h4>
                                  <p className="text-gray-400 text-sm">{user.email}</p>
                                  <div className="flex gap-4 mt-2">
                                    <Badge variant="outline" className="border-blue-500/20 text-blue-400">
                                      {doctor.specialty}
                                    </Badge>
                                    <Badge variant="outline" className="border-green-500/20 text-green-400">
                                      {doctor.crm}
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => openAddPatient(doctor)}
                                  className="gap-2 bg-purple-600 hover:bg-purple-700"
                                >
                                  <UserPlus className="w-4 h-4" />
                                  Adicionar Paciente
                                </Button>
                              </div>

                              {/* Lista de pacientes do doutor */}
                              <div className="mt-4 pt-4 border-t border-purple-500/10">
                                <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  Pacientes ({patients.length})
                                </h5>
                                {patients.length === 0 ? (
                                  <p className="text-gray-500 text-sm">Nenhum paciente vinculado ainda</p>
                                ) : (
                                  <div className="grid md:grid-cols-2 gap-3">
                                    {patients.map((patient) => (
                                      <div 
                                        key={patient.id}
                                        className="bg-slate-800/50 p-3 rounded-lg border border-purple-500/10"
                                      >
                                        <p className="text-white font-medium">{patient.name}</p>
                                        <p className="text-gray-400 text-sm">{patient.email}</p>
                                        <Badge variant="outline" className="mt-2 text-xs border-purple-500/20">
                                          {patient.access_code}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Vídeos de Meditação
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Gerencie os vídeos de meditação disponíveis
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowUploadVideo(true)}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="w-4 h-4" />
                    Adicionar Vídeo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {meditationVideos.map((video) => (
                    <Card key={video.id} className="bg-slate-900/50 border-purple-500/10">
                      <CardContent className="pt-6">
                        {video.thumbnail_url && (
                          <img 
                            src={video.thumbnail_url} 
                            alt={video.title}
                            className="w-full h-40 object-cover rounded-lg mb-4"
                          />
                        )}
                        <h3 className="text-white font-semibold mb-2">{video.title}</h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{video.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {video.duration > 0 ? `${Math.floor(video.duration / 60)}min` : 'Duração não definida'}
                          </span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteVideo(video.id)}
                            className="gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Excluir
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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

      {/* Modal: Adicionar Paciente via Código de Acesso */}
      <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
        <DialogContent className="bg-slate-800 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Key className="w-5 h-5" />
              Adicionar Paciente
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Digite o código de acesso do paciente para vinculá-lo a este doutor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDoctor && (
              <div className="bg-slate-900/50 p-4 rounded-lg border border-purple-500/10">
                <p className="text-white font-semibold mb-1">
                  {users.find(u => u.id === selectedDoctor.user_id)?.name}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="border-blue-500/20 text-blue-400">
                    {selectedDoctor.specialty}
                  </Badge>
                  <Badge variant="outline" className="border-green-500/20 text-green-400">
                    {selectedDoctor.crm}
                  </Badge>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="access_code" className="text-gray-300">Código de Acesso do Paciente *</Label>
              <Input
                id="access_code"
                value={patientAccessCode}
                onChange={(e) => setPatientAccessCode(e.target.value.toUpperCase())}
                placeholder="Ex: ABC12345"
                className="bg-slate-900 border-purple-500/20 text-white font-mono text-lg"
                maxLength={8}
              />
              <p className="text-xs text-gray-500 mt-2">
                O paciente pode encontrar seu código de acesso no perfil dele
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPatient(false)} className="border-purple-500/20">
              Cancelar
            </Button>
            <Button onClick={handleAddPatient} className="bg-purple-600 hover:bg-purple-700">
              Adicionar Paciente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Upload de Vídeo */}
      <Dialog open={showUploadVideo} onOpenChange={setShowUploadVideo}>
        <DialogContent className="bg-slate-800 border-purple-500/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Adicionar Vídeo de Meditação</DialogTitle>
            <DialogDescription className="text-gray-400">
              Preencha as informações do vídeo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="video_title" className="text-gray-300">Título *</Label>
              <Input
                id="video_title"
                value={videoFormData.title}
                onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                placeholder="Ex: Meditação para Ansiedade"
                className="bg-slate-900 border-purple-500/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="video_description" className="text-gray-300">Descrição</Label>
              <Textarea
                id="video_description"
                value={videoFormData.description}
                onChange={(e) => setVideoFormData({ ...videoFormData, description: e.target.value })}
                placeholder="Descreva o conteúdo do vídeo..."
                className="bg-slate-900 border-purple-500/20 text-white min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="video_url" className="text-gray-300">URL do Vídeo *</Label>
              <Input
                id="video_url"
                value={videoFormData.video_url}
                onChange={(e) => setVideoFormData({ ...videoFormData, video_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="bg-slate-900 border-purple-500/20 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Cole a URL do YouTube, Vimeo ou outro serviço</p>
            </div>
            <div>
              <Label htmlFor="thumbnail_url" className="text-gray-300">URL da Thumbnail (opcional)</Label>
              <Input
                id="thumbnail_url"
                value={videoFormData.thumbnail_url}
                onChange={(e) => setVideoFormData({ ...videoFormData, thumbnail_url: e.target.value })}
                placeholder="https://..."
                className="bg-slate-900 border-purple-500/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="duration" className="text-gray-300">Duração (em segundos)</Label>
              <Input
                id="duration"
                type="number"
                value={videoFormData.duration}
                onChange={(e) => setVideoFormData({ ...videoFormData, duration: parseInt(e.target.value) || 0 })}
                placeholder="Ex: 600 (para 10 minutos)"
                className="bg-slate-900 border-purple-500/20 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadVideo(false)} className="border-purple-500/20">
              Cancelar
            </Button>
            <Button onClick={handleUploadVideo} className="bg-blue-600 hover:bg-blue-700">
              Adicionar Vídeo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Gerar Faturas Mensais */}
      <Dialog open={showGenerateInvoices} onOpenChange={setShowGenerateInvoices}>
        <DialogContent className="bg-slate-800 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Gerar Faturas Mensais
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Confirme a geração automática de faturas para todos os usuários
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-purple-500/10">
              <h4 className="text-white font-semibold mb-3">Detalhes da Geração:</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Usuários normais: <strong>R$ 34,90</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <span>Doutores: <strong>R$ 24,90</strong> (desconto de R$ 10,00)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  <span>Vencimento: <strong>Dia 10 do próximo mês</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-yellow-400" />
                  <span>Total de usuários: <strong>{users.length}</strong></span>
                </li>
              </ul>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-yellow-400 text-sm">
                ⚠️ Faturas pendentes existentes não serão duplicadas. Apenas usuários sem faturas pendentes receberão novas cobranças.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateInvoices(false)} className="border-purple-500/20">
              Cancelar
            </Button>
            <Button onClick={handleGenerateMonthlyInvoices} className="bg-green-600 hover:bg-green-700">
              Gerar Faturas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
