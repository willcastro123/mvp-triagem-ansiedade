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
import { LogOut, Users, Activity, TrendingUp, Calendar, Edit, Trash2, UserCheck, Plus, Shield, MessageSquare, Video, Upload, Key, UserPlus, DollarSign, CheckCircle, XCircle, Clock, Search, Filter, ThumbsUp, ThumbsDown, FileText, Eye } from 'lucide-react';

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
  pendingComments: number;
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
  payment_method?: string;
  created_at: string;
  paid_at?: string;
  user_name?: string;
  user_email?: string;
}

interface Comment {
  id: string;
  user_id: string;
  video_id: string;
  comment_text: string;
  is_approved: boolean;
  created_at: string;
  user_name?: string;
  user_email?: string;
  video_title?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorPatients, setDoctorPatients] = useState<DoctorPatient[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [meditationVideos, setMeditationVideos] = useState<MeditationVideo[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    premiumUsers: 0,
    totalDoctors: 0,
    totalActivities: 0,
    todayActivities: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
    paidInvoices: 0,
    pendingComments: 0
  });

  // Estados para filtros de atividades
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  const [selectedActivityCategory, setSelectedActivityCategory] = useState<string>('all');

  // Estados para modais
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showUploadVideo, setShowUploadVideo] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showGenerateInvoices, setShowGenerateInvoices] = useState(false);
  const [showPatientReport, setShowPatientReport] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedPatientForReport, setSelectedPatientForReport] = useState<User | null>(null);
  const [patientActivities, setPatientActivities] = useState<any[]>([]);
  const [patientComments, setPatientComments] = useState<any[]>([]);
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
      const { supabase } = await import('@/lib/supabase');

      // Carregar usuários
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!usersError && usersData) {
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

      // Carregar comentários pendentes
      const { data: commentsData, error: commentsError } = await supabase
        .from('meditation_comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!commentsError && commentsData) {
        // Buscar dados dos usuários e vídeos para os comentários
        const userIds = [...new Set(commentsData.map((c: any) => c.user_id))];
        const videoIds = [...new Set(commentsData.map((c: any) => c.video_id))];

        const { data: usersForComments } = await supabase
          .from('user_profiles')
          .select('id, name, email')
          .in('id', userIds);

        const { data: videosForComments } = await supabase
          .from('meditation_videos')
          .select('id, title')
          .in('id', videoIds);

        const userMap = new Map(usersForComments?.map(u => [u.id, u]) || []);
        const videoMap = new Map(videosForComments?.map(v => [v.id, v]) || []);

        const formattedComments = commentsData.map((comment: any) => {
          const user = userMap.get(comment.user_id);
          const video = videoMap.get(comment.video_id);
          return {
            ...comment,
            user_name: user?.name || 'Usuário desconhecido',
            user_email: user?.email || '',
            video_title: video?.title || 'Vídeo desconhecido'
          };
        });

        setComments(formattedComments);
        
        setStats(prev => ({
          ...prev,
          pendingComments: commentsData.filter((c: any) => !c.is_approved).length
        }));
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
        .order('created_at', { ascending: false });

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

  const handleApproveComment = async (commentId: string) => {
    try {
      const { supabase } = await import('@/lib/supabase');

      const { error } = await supabase
        .from('meditation_comments')
        .update({ is_approved: true })
        .eq('id', commentId);

      if (error) throw error;

      alert('Comentário aprovado com sucesso!');
      loadData();
    } catch (error: any) {
      console.error('Erro ao aprovar comentário:', error);
      alert('Erro ao aprovar comentário: ' + error.message);
    }
  };

  const handleRejectComment = async (commentId: string) => {
    if (!confirm('Tem certeza que deseja reprovar e excluir este comentário?')) {
      return;
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      const { error } = await supabase
        .from('meditation_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      alert('Comentário excluído com sucesso!');
      loadData();
    } catch (error: any) {
      console.error('Erro ao excluir comentário:', error);
      alert('Erro ao excluir comentário: ' + error.message);
    }
  };

  const handleConfirmPayment = async (invoiceId: string) => {
    try {
      const { supabase } = await import('@/lib/supabase');

      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'paid',
          paid_at: new Date().toISOString()
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
    try {
      const { supabase } = await import('@/lib/supabase');

      const { error } = await supabase
        .from('invoices')
        .update({ status: 'unpaid' })
        .eq('id', invoiceId);

      if (error) throw error;

      alert('Fatura marcada como não paga!');
      loadData();
    } catch (error: any) {
      console.error('Erro ao atualizar fatura:', error);
      alert('Erro ao atualizar fatura: ' + error.message);
    }
  };

  const handleGenerateInvoices = async () => {
    if (!confirm('Tem certeza que deseja gerar faturas mensais para todos os usuários premium?')) {
      return;
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      const premiumUsers = users.filter(u => u.is_premium);

      const invoices = premiumUsers.map(user => ({
        user_id: user.id,
        amount: 29.90,
        status: 'pending',
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('invoices')
        .insert(invoices);

      if (error) throw error;

      alert(`${invoices.length} faturas geradas com sucesso!`);
      setShowGenerateInvoices(false);
      loadData();
    } catch (error: any) {
      console.error('Erro ao gerar faturas:', error);
      alert('Erro ao gerar faturas: ' + error.message);
    }
  };

  const handleCreateUser = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');

      const accessCode = generateAccessCode();

      const { error } = await supabase
        .from('user_profiles')
        .insert([{
          name: formData.name,
          email: formData.email,
          city: formData.city,
          anxiety_type: formData.anxiety_type,
          is_premium: formData.is_premium,
          access_code: accessCode,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      alert('Usuário criado com sucesso!');
      setShowCreateUser(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        city: '',
        anxiety_type: 'general',
        is_premium: false
      });
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

      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: formData.name,
          email: formData.email,
          city: formData.city,
          anxiety_type: formData.anxiety_type,
          is_premium: formData.is_premium
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      alert('Usuário atualizado com sucesso!');
      setShowEditUser(false);
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        city: '',
        anxiety_type: 'general',
        is_premium: false
      });
      loadData();
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar usuário: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      alert('Usuário excluído com sucesso!');
      loadData();
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário: ' + error.message);
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
      const { supabase } = await import('@/lib/supabase');

      const { error } = await supabase
        .from('doctors')
        .insert([{
          user_id: selectedUser.id,
          specialty: doctorFormData.specialty,
          crm: doctorFormData.crm,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      alert('Dados de doutor adicionados com sucesso!');
      setShowAddDoctor(false);
      setSelectedUser(null);
      setDoctorFormData({
        specialty: '',
        crm: ''
      });
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
    if (!selectedDoctor || !patientAccessCode) {
      alert('Por favor, insira o código de acesso do paciente.');
      return;
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      // Buscar paciente pelo código de acesso
      const { data: patientData, error: patientError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('access_code', patientAccessCode.toUpperCase())
        .single();

      if (patientError || !patientData) {
        alert('Paciente não encontrado com este código de acesso.');
        return;
      }

      // Verificar se o vínculo já existe
      const { data: existingLink } = await supabase
        .from('doctor_patients')
        .select('id')
        .eq('doctor_id', selectedDoctor.id)
        .eq('patient_id', patientData.id)
        .single();

      if (existingLink) {
        alert('Este paciente já está vinculado a este doutor.');
        return;
      }

      // Criar vínculo
      const { error } = await supabase
        .from('doctor_patients')
        .insert([{
          doctor_id: selectedDoctor.id,
          patient_id: patientData.id,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      alert('Paciente vinculado com sucesso!');
      setShowAddPatient(false);
      setSelectedDoctor(null);
      setPatientAccessCode('');
      loadData();
    } catch (error: any) {
      console.error('Erro ao vincular paciente:', error);
      alert('Erro ao vincular paciente: ' + error.message);
    }
  };

  const handleUploadVideo = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');

      const { error } = await supabase
        .from('meditation_videos')
        .insert([{
          title: videoFormData.title,
          description: videoFormData.description,
          video_url: videoFormData.video_url,
          thumbnail_url: videoFormData.thumbnail_url,
          duration: videoFormData.duration,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      alert('Vídeo adicionado com sucesso!');
      setShowUploadVideo(false);
      setVideoFormData({
        title: '',
        description: '',
        video_url: '',
        thumbnail_url: '',
        duration: 0
      });
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

  const getActivityCategories = () => {
    const categories = new Set<string>();
    activities.forEach((activity: any) => {
      categories.add(activity.activity_type);
    });
    return Array.from(categories);
  };

  const filterActivities = () => {
    let filtered = activities;

    // Filtrar por categoria
    if (selectedActivityCategory !== 'all') {
      filtered = filtered.filter((activity: any) => 
        activity.activity_type === selectedActivityCategory
      );
    }

    // Filtrar por termo de busca
    if (activitySearchTerm.trim()) {
      const searchLower = activitySearchTerm.toLowerCase();
      filtered = filtered.filter((activity: any) => 
        activity.activity_description.toLowerCase().includes(searchLower) ||
        activity.user_name.toLowerCase().includes(searchLower) ||
        activity.user_email.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
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

  const getPendingComments = () => {
    return comments.filter(c => !c.is_approved);
  };

  const getApprovedComments = () => {
    return comments.filter(c => c.is_approved);
  };

  const filteredActivities = filterActivities();
  const activityCategories = getActivityCategories();

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
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-3xl font-bold text-white">{stats.pendingComments}</p>
              <p className="text-sm text-gray-400">Comentários Pendentes</p>
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
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-6 p-0">
              <button
                onClick={() => setShowUploadVideo(true)}
                className="w-full text-left hover:bg-slate-800/70 transition-colors touch-manipulation"
              >
                <div className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Upload de Vídeo</h3>
                    <p className="text-sm text-gray-400">Adicionar novo vídeo de meditação</p>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-6 p-0">
              <button
                onClick={() => setShowGenerateInvoices(true)}
                className="w-full text-left hover:bg-slate-800/70 transition-colors touch-manipulation"
              >
                <div className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Gerar Faturas Mensais</h3>
                    <p className="text-sm text-gray-400">Criar faturas automáticas para todos os usuários</p>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-6 p-0">
              <button
                onClick={() => setShowCreateUser(true)}
                className="w-full text-left hover:bg-slate-800/70 transition-colors touch-manipulation"
              >
                <div className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Criar Usuário</h3>
                    <p className="text-sm text-gray-400">Adicionar novo usuário ao sistema</p>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="comments" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="comments">Comentários</TabsTrigger>
            <TabsTrigger value="invoices">Faturas</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="doctors">Doutores</TabsTrigger>
            <TabsTrigger value="videos">Vídeos</TabsTrigger>
            <TabsTrigger value="activities">Atividades</TabsTrigger>
          </TabsList>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <div className="space-y-6">
              {/* Comentários Pendentes */}
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-yellow-400" />
                    Comentários Pendentes de Aprovação
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Revise e aprove ou reprove comentários de meditação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getPendingComments().length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">Nenhum comentário pendente de aprovação.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getPendingComments().map((comment) => (
                        <div
                          key={comment.id}
                          className="p-4 bg-slate-900/50 rounded-lg border border-yellow-500/20"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold text-white">{comment.user_name}</p>
                                <Badge variant="outline" className="text-xs border-purple-500/20 text-gray-400">
                                  {comment.user_email}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-400 mb-2">
                                <strong>Vídeo:</strong> {comment.video_title}
                              </p>
                              <p className="text-white mb-3">{comment.comment_text}</p>
                              <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                size="sm"
                                onClick={() => handleApproveComment(comment.id)}
                                className="gap-1 bg-green-600 hover:bg-green-700"
                              >
                                <ThumbsUp className="w-3 h-3" />
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectComment(comment.id)}
                                className="gap-1"
                              >
                                <ThumbsDown className="w-3 h-3" />
                                Reprovar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comentários Aprovados */}
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Comentários Aprovados
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Histórico de comentários aprovados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getApprovedComments().length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">Nenhum comentário aprovado ainda.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getApprovedComments().map((comment) => (
                        <div
                          key={comment.id}
                          className="p-4 bg-slate-900/50 rounded-lg border border-green-500/20"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold text-white">{comment.user_name}</p>
                                <Badge className="text-xs bg-green-500">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Aprovado
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-400 mb-2">
                                <strong>Vídeo:</strong> {comment.video_title}
                              </p>
                              <p className="text-white mb-3">{comment.comment_text}</p>
                              <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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
                          <TableHead className="text-gray-300">Data Criação</TableHead>
                          <TableHead className="text-gray-300">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterInvoicesByStatus('pending').map((invoice) => (
                          <TableRow key={invoice.id} className="border-purple-500/20">
                            <TableCell className="text-white font-medium">{invoice.user_name}</TableCell>
                            <TableCell className="text-gray-300">{invoice.user_email}</TableCell>
                            <TableCell className="text-white font-semibold">{formatCurrency(invoice.amount)}</TableCell>
                            <TableCell className="text-gray-300">{formatDateOnly(invoice.created_at)}</TableCell>
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
                          <TableHead className="text-gray-300">Data Criação</TableHead>
                          <TableHead className="text-gray-300">Data Pagamento</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterInvoicesByStatus('paid').map((invoice) => (
                          <TableRow key={invoice.id} className="border-purple-500/20">
                            <TableCell className="text-white font-medium">{invoice.user_name}</TableCell>
                            <TableCell className="text-white font-semibold">{formatCurrency(invoice.amount)}</TableCell>
                            <TableCell className="text-gray-300">{formatDateOnly(invoice.created_at)}</TableCell>
                            <TableCell className="text-gray-300">
                              {invoice.paid_at ? formatDate(invoice.paid_at) : '-'}
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
                          <TableHead className="text-gray-300">Data Criação</TableHead>
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
                            <TableCell className="text-gray-300">{formatDateOnly(invoice.created_at)}</TableCell>
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
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <p className="text-white font-medium">{patient.name}</p>
                                            <p className="text-gray-400 text-sm">{patient.email}</p>
                                            <Badge variant="outline" className="mt-2 text-xs border-purple-500/20">
                                              {patient.access_code}
                                            </Badge>
                                          </div>
                                        </div>
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
                      Gerencie vídeos de meditação disponíveis no app
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {meditationVideos.map((video) => (
                    <Card key={video.id} className="bg-slate-900/50 border-purple-500/10">
                      <CardContent className="pt-6">
                        <div className="aspect-video bg-slate-800 rounded-lg mb-3 overflow-hidden">
                          {video.thumbnail_url ? (
                            <img 
                              src={video.thumbnail_url} 
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="w-12 h-12 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <h4 className="text-white font-semibold mb-2">{video.title}</h4>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{video.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="border-purple-500/20">
                            {video.duration} min
                          </Badge>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteVideo(video.id)}
                          >
                            <Trash2 className="w-3 h-3" />
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
                  Histórico completo de atividades dos usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Buscar atividades..."
                        value={activitySearchTerm}
                        onChange={(e) => setActivitySearchTerm(e.target.value)}
                        className="pl-10 bg-slate-900/50 border-purple-500/20"
                      />
                    </div>
                  </div>
                  <Select value={selectedActivityCategory} onValueChange={setSelectedActivityCategory}>
                    <SelectTrigger className="w-full sm:w-[200px] bg-slate-900/50 border-purple-500/20">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Categorias</SelectItem>
                      {activityCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lista de Atividades */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredActivities.length === 0 ? (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">Nenhuma atividade encontrada.</p>
                    </div>
                  ) : (
                    filteredActivities.map((activity: any) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border border-purple-500/10"
                      >
                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Activity className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs border-purple-500/20 text-purple-400">
                              {activity.activity_type}
                            </Badge>
                            <span className="text-xs text-gray-500">{formatDate(activity.created_at)}</span>
                          </div>
                          <p className="text-white font-medium mb-1">{activity.activity_description}</p>
                          <p className="text-sm text-gray-400">
                            Usuário: <span className="text-gray-300">{activity.user_name}</span> ({activity.user_email})
                          </p>
                        </div>
                      </div>
                    ))
                  )}
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
              Adicione um novo usuário ao sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-900/50 border-purple-500/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-white">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-900/50 border-purple-500/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="city" className="text-white">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="bg-slate-900/50 border-purple-500/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="anxiety_type" className="text-white">Tipo de Ansiedade</Label>
              <Select value={formData.anxiety_type} onValueChange={(value) => setFormData({ ...formData, anxiety_type: value })}>
                <SelectTrigger className="bg-slate-900/50 border-purple-500/20 text-white">
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
                className="w-4 h-4"
              />
              <Label htmlFor="is_premium" className="text-white">Usuário Premium</Label>
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
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_name" className="text-white">Nome</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-900/50 border-purple-500/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit_email" className="text-white">E-mail</Label>
              <Input
                id="edit_email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-900/50 border-purple-500/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit_city" className="text-white">Cidade</Label>
              <Input
                id="edit_city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="bg-slate-900/50 border-purple-500/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit_anxiety_type" className="text-white">Tipo de Ansiedade</Label>
              <Select value={formData.anxiety_type} onValueChange={(value) => setFormData({ ...formData, anxiety_type: value })}>
                <SelectTrigger className="bg-slate-900/50 border-purple-500/20 text-white">
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
                className="w-4 h-4"
              />
              <Label htmlFor="edit_is_premium" className="text-white">Usuário Premium</Label>
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
              Adicione informações profissionais do doutor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="specialty" className="text-white">Especialidade</Label>
              <Input
                id="specialty"
                value={doctorFormData.specialty}
                onChange={(e) => setDoctorFormData({ ...doctorFormData, specialty: e.target.value })}
                className="bg-slate-900/50 border-purple-500/20 text-white"
                placeholder="Ex: Psiquiatra, Psicólogo"
              />
            </div>
            <div>
              <Label htmlFor="crm" className="text-white">CRM</Label>
              <Input
                id="crm"
                value={doctorFormData.crm}
                onChange={(e) => setDoctorFormData({ ...doctorFormData, crm: e.target.value })}
                className="bg-slate-900/50 border-purple-500/20 text-white"
                placeholder="Ex: CRM/SP 123456"
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

      {/* Modal: Adicionar Paciente */}
      <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
        <DialogContent className="bg-slate-800 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">Adicionar Paciente</DialogTitle>
            <DialogDescription className="text-gray-400">
              Vincule um paciente ao doutor usando o código de acesso
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="patient_code" className="text-white">Código de Acesso do Paciente</Label>
              <Input
                id="patient_code"
                value={patientAccessCode}
                onChange={(e) => setPatientAccessCode(e.target.value)}
                className="bg-slate-900/50 border-purple-500/20 text-white font-mono"
                placeholder="Ex: ABC12345"
              />
              <p className="text-xs text-gray-500 mt-1">
                Digite o código de acesso único do paciente
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPatient(false)} className="border-purple-500/20">
              Cancelar
            </Button>
            <Button onClick={handleAddPatient} className="bg-purple-600 hover:bg-purple-700">
              Vincular Paciente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Upload de Vídeo */}
      <Dialog open={showUploadVideo} onOpenChange={setShowUploadVideo}>
        <DialogContent className="bg-slate-800 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">Adicionar Vídeo de Meditação</DialogTitle>
            <DialogDescription className="text-gray-400">
              Adicione um novo vídeo de meditação ao app
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="video_title" className="text-white">Título</Label>
              <Input
                id="video_title"
                value={videoFormData.title}
                onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                className="bg-slate-900/50 border-purple-500/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="video_description" className="text-white">Descrição</Label>
              <Textarea
                id="video_description"
                value={videoFormData.description}
                onChange={(e) => setVideoFormData({ ...videoFormData, description: e.target.value })}
                className="bg-slate-900/50 border-purple-500/20 text-white"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="video_url" className="text-white">URL do Vídeo</Label>
              <Input
                id="video_url"
                value={videoFormData.video_url}
                onChange={(e) => setVideoFormData({ ...videoFormData, video_url: e.target.value })}
                className="bg-slate-900/50 border-purple-500/20 text-white"
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="thumbnail_url" className="text-white">URL da Thumbnail</Label>
              <Input
                id="thumbnail_url"
                value={videoFormData.thumbnail_url}
                onChange={(e) => setVideoFormData({ ...videoFormData, thumbnail_url: e.target.value })}
                className="bg-slate-900/50 border-purple-500/20 text-white"
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="duration" className="text-white">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                value={videoFormData.duration}
                onChange={(e) => setVideoFormData({ ...videoFormData, duration: parseInt(e.target.value) })}
                className="bg-slate-900/50 border-purple-500/20 text-white"
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

      {/* Modal: Gerar Faturas */}
      <Dialog open={showGenerateInvoices} onOpenChange={setShowGenerateInvoices}>
        <DialogContent className="bg-slate-800 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">Gerar Faturas Mensais</DialogTitle>
            <DialogDescription className="text-gray-400">
              Gerar faturas automáticas para todos os usuários premium
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-purple-500/10">
              <p className="text-white mb-2">
                <strong>Usuários Premium:</strong> {stats.premiumUsers}
              </p>
              <p className="text-white mb-2">
                <strong>Valor por Fatura:</strong> R$ 29,90
              </p>
              <p className="text-white">
                <strong>Total a Faturar:</strong> {formatCurrency(stats.premiumUsers * 29.90)}
              </p>
            </div>
            <p className="text-gray-400 text-sm">
              Isso criará uma fatura pendente para cada usuário premium no sistema.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateInvoices(false)} className="border-purple-500/20">
              Cancelar
            </Button>
            <Button onClick={handleGenerateInvoices} className="bg-green-600 hover:bg-green-700">
              Gerar Faturas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
