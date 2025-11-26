'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sidebar } from '@/components/custom/sidebar';
import { LogOut, Users, Activity, MessageSquare, Eye, FileText, CheckCircle, Clock } from 'lucide-react';

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

export default function DoctorPanel() {
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorPatients, setDoctorPatients] = useState<DoctorPatient[]>([]);
  const [showPatientReport, setShowPatientReport] = useState(false);
  const [selectedPatientForReport, setSelectedPatientForReport] = useState<User | null>(null);
  const [patientActivities, setPatientActivities] = useState<any[]>([]);
  const [patientComments, setPatientComments] = useState<any[]>([]);

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
      }

      // Carregar doutores
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: false });

      if (!doctorsError && doctorsData) {
        setDoctors(doctorsData);
      }

      // Carregar relacionamentos doutor-paciente
      const { data: doctorPatientsData, error: doctorPatientsError } = await supabase
        .from('doctor_patients')
        .select('*');

      if (!doctorPatientsError && doctorPatientsData) {
        setDoctorPatients(doctorPatientsData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/admin/login');
  };

  const getDoctorPatients = (doctorId: string) => {
    const patientIds = doctorPatients
      .filter(dp => dp.doctor_id === doctorId)
      .map(dp => dp.patient_id);
    
    return users.filter(u => patientIds.includes(u.id));
  };

  const openPatientReport = async (patient: User) => {
    setSelectedPatientForReport(patient);
    setShowPatientReport(true);

    try {
      const { supabase } = await import('@/lib/supabase');

      // Carregar atividades do paciente
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', patient.id)
        .order('created_at', { ascending: false });

      if (!activitiesError && activitiesData) {
        setPatientActivities(activitiesData);
      }

      // Carregar comentários do paciente
      const { data: commentsData, error: commentsError } = await supabase
        .from('meditation_comments')
        .select('*, meditation_videos(title)')
        .eq('user_id', patient.id)
        .order('created_at', { ascending: false });

      if (!commentsError && commentsData) {
        setPatientComments(commentsData);
      }
    } catch (error) {
      console.error('Erro ao carregar relatório do paciente:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return '🔐';
      case 'exposure': return '🎯';
      case 'breathing': return '🫁';
      case 'sale': return '💰';
      case 'meditation': return '🧘';
      case 'quiz': return '📝';
      case 'scheduling': return '📅';
      default: return '📝';
    }
  };

  const getActivityCategoryLabel = (type: string) => {
    switch (type) {
      case 'login': return 'Autenticação';
      case 'exposure': return 'Exposição';
      case 'breathing': return 'Respiração';
      case 'sale': return 'Vendas';
      case 'meditation': return 'Meditação';
      case 'quiz': return 'Quiz';
      case 'scheduling': return 'Agendamento';
      default: return 'Outros';
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-slate-800/50 border-b border-purple-500/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Painel do Doutor</h1>
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

        {/* Content */}
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Doutores e Seus Pacientes
              </CardTitle>
              <CardDescription className="text-gray-400">
                Visualize todos os doutores cadastrados e seus pacientes vinculados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {doctors.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">Nenhum doutor cadastrado ainda.</p>
                </div>
              ) : (
                <div className="space-y-6">
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
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="border-purple-500/20">
                                      <TableHead className="text-gray-300">Nome</TableHead>
                                      <TableHead className="text-gray-300">E-mail</TableHead>
                                      <TableHead className="text-gray-300">Código</TableHead>
                                      <TableHead className="text-gray-300">Cidade</TableHead>
                                      <TableHead className="text-gray-300">Tipo Ansiedade</TableHead>
                                      <TableHead className="text-gray-300">Ações</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {patients.map((patient) => (
                                      <TableRow key={patient.id} className="border-purple-500/20">
                                        <TableCell className="text-white font-medium">{patient.name}</TableCell>
                                        <TableCell className="text-gray-300">{patient.email}</TableCell>
                                        <TableCell>
                                          <Badge variant="outline" className="font-mono border-purple-500/20">
                                            {patient.access_code}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-300">{patient.city || '-'}</TableCell>
                                        <TableCell className="text-gray-300 capitalize">
                                          {patient.anxiety_type === 'social' && 'Social'}
                                          {patient.anxiety_type === 'panic' && 'Pânico'}
                                          {patient.anxiety_type === 'general' && 'Generalizada'}
                                        </TableCell>
                                        <TableCell>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openPatientReport(patient)}
                                            className="gap-1 border-blue-500/20 hover:bg-blue-500/10"
                                          >
                                            <Eye className="w-3 h-3" />
                                            Ver Relatório
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Modal: Relatório Detalhado do Paciente */}
      <Dialog open={showPatientReport} onOpenChange={setShowPatientReport}>
        <DialogContent className="bg-slate-800 border-purple-500/20 max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Relatório Detalhado do Paciente
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Histórico completo de atividades e interações do paciente
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatientForReport && (
            <div className="space-y-6">
              {/* Informações do Paciente */}
              <div className="bg-slate-900/50 p-6 rounded-lg border border-purple-500/10">
                <h3 className="text-white font-semibold text-xl mb-4">{selectedPatientForReport.name}</h3>
                <div className="grid md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">E-mail:</p>
                    <p className="text-white font-medium">{selectedPatientForReport.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Cidade:</p>
                    <p className="text-white font-medium">{selectedPatientForReport.city || 'Não informada'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Tipo de Ansiedade:</p>
                    <p className="text-white font-medium capitalize">
                      {selectedPatientForReport.anxiety_type === 'social' && 'Social'}
                      {selectedPatientForReport.anxiety_type === 'panic' && 'Pânico'}
                      {selectedPatientForReport.anxiety_type === 'general' && 'Generalizada'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Código de Acesso:</p>
                    <Badge variant="outline" className="font-mono border-purple-500/20 text-white">
                      {selectedPatientForReport.access_code}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Status:</p>
                    <Badge variant={selectedPatientForReport.is_premium ? 'default' : 'secondary'} className={selectedPatientForReport.is_premium ? 'bg-green-500' : ''}>
                      {selectedPatientForReport.is_premium ? 'Premium' : 'Padrão'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Cadastrado em:</p>
                    <p className="text-white font-medium">{formatDateOnly(selectedPatientForReport.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Estatísticas Rápidas */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-slate-900/50 border-purple-500/10">
                  <CardContent className="pt-6 text-center">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <p className="text-3xl font-bold text-white">{patientActivities.length}</p>
                    <p className="text-sm text-gray-400">Atividades Realizadas</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-purple-500/10">
                  <CardContent className="pt-6 text-center">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-3xl font-bold text-white">{patientComments.length}</p>
                    <p className="text-sm text-gray-400">Comentários Feitos</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-purple-500/10">
                  <CardContent className="pt-6 text-center">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <p className="text-3xl font-bold text-white">
                      {patientComments.filter((c: any) => c.is_approved).length}
                    </p>
                    <p className="text-sm text-gray-400">Comentários Aprovados</p>
                  </CardContent>
                </Card>
              </div>

              {/* Histórico de Atividades */}
              <div>
                <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Histórico Completo de Atividades ({patientActivities.length})
                </h4>
                {patientActivities.length === 0 ? (
                  <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-purple-500/10">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">Nenhuma atividade registrada ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {patientActivities.map((activity: any) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border border-purple-500/10 hover:border-purple-500/30 transition-colors"
                      >
                        <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-2xl">
                          {getActivityIcon(activity.activity_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs border-purple-500/20 text-purple-400">
                              {getActivityCategoryLabel(activity.activity_type)}
                            </Badge>
                            <span className="text-xs text-gray-500">{formatDate(activity.created_at)}</span>
                          </div>
                          <p className="text-white font-medium mb-1">{activity.activity_description}</p>
                          <p className="text-sm text-gray-400">
                            Tipo: <span className="text-gray-300">{activity.activity_type}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comentários do Paciente */}
              <div>
                <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  Todos os Comentários em Vídeos ({patientComments.length})
                </h4>
                {patientComments.length === 0 ? (
                  <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-purple-500/10">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">Nenhum comentário registrado ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {patientComments.map((comment: any) => (
                      <div
                        key={comment.id}
                        className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/10"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className={comment.is_approved ? 'bg-green-500' : 'bg-yellow-500'}>
                              {comment.is_approved ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Aprovado
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pendente
                                </>
                              )}
                            </Badge>
                            <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                          <strong className="text-blue-400">Vídeo:</strong> {comment.meditation_videos?.title || 'Vídeo desconhecido'}
                        </p>
                        <div className="bg-slate-800/50 p-3 rounded border border-purple-500/10">
                          <p className="text-white leading-relaxed">{comment.comment_text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowPatientReport(false)} 
              className="border-purple-500/20"
            >
              Fechar Relatório
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
