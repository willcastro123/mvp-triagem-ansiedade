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
import { LogOut, Users, Activity, Mail, Settings, Send, Upload, Key, UserPlus, DollarSign, CheckCircle, XCircle, Clock, Search, Filter, ThumbsUp, ThumbsDown, Edit, Trash2, Plus, Shield, MessageSquare, Video, Mic, FileVideo, Sparkles } from 'lucide-react';

// Interfaces
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

interface MeditationVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  category: string; // Adicionado campo categoria
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Invoice {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'unpaid';
  paid_at?: string;
  created_at: string;
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

export default function AdminDashboard() {
  const router = useRouter();
  
  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorPatients, setDoctorPatients] = useState<DoctorPatient[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [meditationVideos, setMeditationVideos] = useState<MeditationVideo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // Nova state para categorias
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

  // Filter States
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  const [selectedActivityCategory, setSelectedActivityCategory] = useState<string>('all');

  // Modal States
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showUploadVideo, setShowUploadVideo] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showGenerateInvoices, setShowGenerateInvoices] = useState(false);
  
  // Selection States
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [patientAccessCode, setPatientAccessCode] = useState('');

  // Form Data States
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
    duration: 0,
    category: 'Geral', // Default category
    uploadType: 'url' as 'url' | 'file' | 'ai-voice' | 'ai-video'
  });

  // AI Generation States
  const [aiVoiceText, setAiVoiceText] = useState('');
  const [aiVideoPrompt, setAiVideoPrompt] = useState('');
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
      router.push('/admin/login');
    }
  };

  const loadData = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');

      // 1. Users
      const { data: usersData } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
      if (usersData) {
        setUsers(usersData);
        setStats(prev => ({
          ...prev,
          totalUsers: usersData.length,
          premiumUsers: usersData.filter(u => u.is_premium).length
        }));
      }

      // 2. Categories (NOVO)
      const { data: catData } = await supabase.from('meditation_categories').select('*').order('name');
      if (catData) setCategories(catData);

      // 3. Doctors
      const { data: doctorsData } = await supabase.from('doctors').select('*').order('created_at', { ascending: false });
      if (doctorsData) {
        setDoctors(doctorsData);
        setStats(prev => ({ ...prev, totalDoctors: doctorsData.length }));
      }

      // 4. Doctor Patients
      const { data: dpData } = await supabase.from('doctor_patients').select('*');
      if (dpData) setDoctorPatients(dpData);

      // 5. Videos
      const { data: videosData } = await supabase.from('meditation_videos').select('*').order('created_at', { ascending: false });
      if (videosData) setMeditationVideos(videosData);

      // 6. Comments
      const { data: commentsData } = await supabase.from('meditation_comments').select('*').order('created_at', { ascending: false });
      if (commentsData) {
        const userIds = [...new Set(commentsData.map((c: any) => c.user_id))];
        const videoIds = [...new Set(commentsData.map((c: any) => c.video_id))];
        
        const { data: usersForComments } = await supabase.from('user_profiles').select('id, name, email').in('id', userIds);
        const { data: videosForComments } = await supabase.from('meditation_videos').select('id, title').in('id', videoIds);
        
        const userMap = new Map(usersForComments?.map(u => [u.id, u]) || []);
        const videoMap = new Map(videosForComments?.map(v => [v.id, v]) || []);

        const formattedComments = commentsData.map((comment: any) => ({
          ...comment,
          user_name: userMap.get(comment.user_id)?.name || 'Usuário desconhecido',
          user_email: userMap.get(comment.user_id)?.email || '',
          video_title: videoMap.get(comment.video_id)?.title || 'Vídeo desconhecido'
        }));

        setComments(formattedComments);
        setStats(prev => ({ ...prev, pendingComments: commentsData.filter((c: any) => !c.is_approved).length }));
      }

      // 7. Invoices
      const { data: invoicesData } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
      if (invoicesData) {
        const userIds = [...new Set(invoicesData.map((inv: any) => inv.user_id))];
        const { data: usersForInvoices } = await supabase.from('user_profiles').select('id, name, email').in('id', userIds);
        const userMap = new Map(usersForInvoices?.map(u => [u.id, u]) || []);

        const formattedInvoices = invoicesData.map((invoice: any) => ({
          ...invoice,
          user_name: userMap.get(invoice.user_id)?.name || 'Usuário desconhecido',
          user_email: userMap.get(invoice.user_id)?.email || ''
        }));

        setInvoices(formattedInvoices);
        setStats(prev => ({
          ...prev,
          totalInvoices: invoicesData.length,
          pendingInvoices: invoicesData.filter((i: any) => i.status === 'pending').length,
          paidInvoices: invoicesData.filter((i: any) => i.status === 'paid').length
        }));
      }

      // 8. Activities
      const { data: activitiesData } = await supabase
        .from('user_activity_logs')
        .select('id, user_id, activity_type, activity_description, created_at')
        .order('created_at', { ascending: false });

      if (activitiesData) {
        const userIds = [...new Set(activitiesData.map((a: any) => a.user_id))];
        const { data: usersForActivities } = await supabase.from('user_profiles').select('id, name, email').in('id', userIds);
        const userMap = new Map(usersForActivities?.map(u => [u.id, u]) || []);

        const formattedActivities = activitiesData.map((activity: any) => ({
          id: activity.id,
          user_id: activity.user_id,
          activity_type: activity.activity_type,
          activity_description: activity.activity_description,
          created_at: activity.created_at,
          user_name: userMap.get(activity.user_id)?.name || 'Usuário desconhecido',
          user_email: userMap.get(activity.user_id)?.email || ''
        }));
        
        setActivities(formattedActivities as any);
        const today = new Date().toISOString().split('T')[0];
        setStats(prev => ({
          ...prev,
          totalActivities: activitiesData.length,
          todayActivities: activitiesData.filter((a: any) => a.created_at.startsWith(today)).length
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

  // Helper Functions
  const generateAccessCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('pt-BR');
  const formatDateOnly = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR');
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // --- Handlers for User, Doctor, Patient, Invoice, Comments are kept similar to your original code but shortened for brevity in this response. 
  // You should keep your existing logic for create/edit/delete users/doctors/invoices. 
  // I will focus on the VIDEO UPLOAD part which was the request.

  const handleCreateUser = async () => {
    try {
      if (!formData.name || !formData.email || !formData.password) {
        alert('Preencha todos os campos obrigatórios (Nome, Email e Senha)');
        return;
      }
      const accessCode = generateAccessCode();
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, access_code: accessCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao criar usuário');
      alert(`✅ Usuário criado!\nCódigo: ${accessCode}`);
      setShowCreateUser(false);
      resetForm();
      loadData();
    } catch (error: any) {
      alert('Erro: ' + error.message);
    }
  };

  // ... (Other handlers like handleEditUser, handleAddDoctor, handleAddPatient, handleApproveComment remain the same) ...

  const handleFileUpload = async (file: File) => {
    setIsGenerating(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const { error } = await supabase.storage.from('meditation-videos').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('meditation-videos').getPublicUrl(fileName);
      setVideoFormData({ ...videoFormData, video_url: publicUrl });
      alert('Vídeo enviado com sucesso!');
    } catch (error: any) {
      alert('Erro ao fazer upload: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUploadVideo = async () => {
    try {
      if (!videoFormData.title || !videoFormData.video_url) {
        alert('Preencha título e URL');
        return;
      }
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.from('meditation_videos').insert([{
        title: videoFormData.title,
        description: videoFormData.description,
        video_url: videoFormData.video_url,
        thumbnail_url: videoFormData.thumbnail_url || '',
        duration: videoFormData.duration || 0,
        category: videoFormData.category || 'Geral' // Aqui usa a categoria selecionada
      }]);
      if (error) throw error;
      alert('Vídeo adicionado!');
      setShowUploadVideo(false);
      resetVideoForm();
      loadData();
    } catch (error: any) {
      alert('Erro: ' + error.message);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Excluir vídeo?')) return;
    try {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.from('meditation_videos').delete().eq('id', videoId);
      if (error) throw error;
      loadData();
    } catch (error: any) {
      alert('Erro: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', city: '', anxiety_type: 'general', is_premium: false });
  };

  const resetVideoForm = () => {
    setVideoFormData({ title: '', description: '', video_url: '', thumbnail_url: '', duration: 0, category: 'Geral', uploadType: 'url' });
    setAiVoiceText('');
    setAiVideoPrompt('');
    setSelectedVideoFile(null);
  };

  // ... (Rest of helper functions for Icons and Labels) ...
  const getActivityIcon = (type: string) => '📝'; // Simplificado
  const getActivityCategoryLabel = (type: string) => type; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-purple-500/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
          <Button onClick={handleLogout} variant="outline" className="gap-2 border-purple-500/20 hover:bg-purple-500/10">
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Actions Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card onClick={() => setShowUploadVideo(true)} className="bg-slate-800/50 border-purple-500/20 cursor-pointer hover:bg-slate-800/70">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Upload de Vídeo</h3>
                <p className="text-sm text-gray-400">Adicionar à galeria</p>
              </div>
            </CardContent>
          </Card>
          <Card onClick={() => setShowCreateUser(true)} className="bg-slate-800/50 border-purple-500/20 cursor-pointer hover:bg-slate-800/70">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Criar Usuário</h3>
                <p className="text-sm text-gray-400">Novo acesso</p>
              </div>
            </CardContent>
          </Card>
          {/* Add more cards as needed */}
        </div>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="doctors">Doutores</TabsTrigger>
            <TabsTrigger value="videos">Vídeos</TabsTrigger>
            <TabsTrigger value="invoices">Faturas</TabsTrigger>
          </TabsList>

          {/* ... (Tabs Content for Users, Doctors, Invoices can be pasted from your original code) ... */}
          
          <TabsContent value="videos">
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2"><Video className="w-5 h-5" /> Vídeos de Meditação</CardTitle>
                  <Button onClick={() => setShowUploadVideo(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="w-4 h-4 mr-2" /> Adicionar Vídeo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {meditationVideos.map((video) => (
                    <Card key={video.id} className="bg-slate-900/50 border-purple-500/10">
                      <CardContent className="pt-6">
                        {video.thumbnail_url && (
                          <img src={video.thumbnail_url} alt={video.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                        )}
                        <h3 className="text-white font-semibold mb-2">{video.title}</h3>
                        <Badge className="mb-2 bg-purple-600">{video.category}</Badge>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{video.description}</p>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteVideo(video.id)} className="w-full">
                          <Trash2 className="w-3 h-3 mr-2" /> Excluir
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* ... Add other TabsContent ... */}
        </Tabs>
      </main>

      {/* --- MODAL DE UPLOAD DE VÍDEO (ATUALIZADO COM CATEGORIA) --- */}
      <Dialog open={showUploadVideo} onOpenChange={setShowUploadVideo}>
        <DialogContent className="bg-slate-800 border-purple-500/20 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white">Adicionar Vídeo</DialogTitle>
            <DialogDescription className="text-gray-400">Detalhes do vídeo de meditação</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Tipo de Upload Selector (URL, File, AI) */}
            <div className="grid grid-cols-4 gap-3">
               <Button variant={videoFormData.uploadType === 'url' ? 'default' : 'outline'} onClick={() => setVideoFormData({...videoFormData, uploadType: 'url'})} className="flex flex-col h-auto py-2"><Upload className="w-4 h-4"/><span className="text-xs">URL</span></Button>
               <Button variant={videoFormData.uploadType === 'file' ? 'default' : 'outline'} onClick={() => setVideoFormData({...videoFormData, uploadType: 'file'})} className="flex flex-col h-auto py-2"><FileVideo className="w-4 h-4"/><span className="text-xs">Arquivo</span></Button>
               {/* Outros botões... */}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="v_title" className="text-gray-300">Título</Label>
                <Input id="v_title" value={videoFormData.title} onChange={e => setVideoFormData({...videoFormData, title: e.target.value})} className="bg-slate-900 border-purple-500/20 text-white" />
              </div>
              <div>
                <Label htmlFor="v_desc" className="text-gray-300">Descrição</Label>
                <Textarea id="v_desc" value={videoFormData.description} onChange={e => setVideoFormData({...videoFormData, description: e.target.value})} className="bg-slate-900 border-purple-500/20 text-white" />
              </div>

              {/* SELETOR DE CATEGORIA AQUI */}
              <div>
                <Label htmlFor="v_cat" className="text-gray-300">Categoria</Label>
                <Select value={videoFormData.category} onValueChange={(val) => setVideoFormData({...videoFormData, category: val})}>
                  <SelectTrigger className="bg-slate-900 border-purple-500/20 text-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                        categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.icon} {cat.name}</SelectItem>
                        ))
                    ) : (
                        <SelectItem value="Geral">Geral</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Campos condicionais de Upload */}
              {videoFormData.uploadType === 'url' && (
                 <div>
                    <Label className="text-gray-300">URL do Vídeo</Label>
                    <Input value={videoFormData.video_url} onChange={e => setVideoFormData({...videoFormData, video_url: e.target.value})} className="bg-slate-900 border-purple-500/20 text-white" placeholder="https://youtube.com..." />
                 </div>
              )}
              {videoFormData.uploadType === 'file' && (
                 <div>
                    <Label className="text-gray-300">Arquivo</Label>
                    <Input type="file" accept="video/*" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} className="bg-slate-900 border-purple-500/20 text-white" />
                 </div>
              )}

              <div>
                 <Label className="text-gray-300">Thumbnail URL</Label>
                 <Input value={videoFormData.thumbnail_url} onChange={e => setVideoFormData({...videoFormData, thumbnail_url: e.target.value})} className="bg-slate-900 border-purple-500/20 text-white" />
              </div>
              <div>
                 <Label className="text-gray-300">Duração (segundos)</Label>
                 <Input type="number" value={videoFormData.duration} onChange={e => setVideoFormData({...videoFormData, duration: parseInt(e.target.value) || 0})} className="bg-slate-900 border-purple-500/20 text-white" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadVideo(false)}>Cancelar</Button>
            <Button onClick={handleUploadVideo} className="bg-blue-600">Salvar Vídeo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Outros modais (User, Doctor) aqui... mantive omitidos para economizar espaço, mas devem permanecer no seu código original */}
    </div>
  );
}
