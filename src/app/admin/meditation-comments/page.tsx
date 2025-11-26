"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, MessageSquare, Check, X, ArrowLeft, AlertCircle, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase, type UserProfile } from '@/lib/supabase'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Comment {
  id: string
  video_id: string
  user_id: string
  comment: string
  is_approved: boolean
  created_at: string
  user_profiles?: {
    name: string
    email: string
  }
  meditation_videos?: {
    title: string
  }
}

export default function MeditationCommentsAdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [pendingComments, setPendingComments] = useState<Comment[]>([])
  const [approvedComments, setApprovedComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(userStr)
    
    // Verifica se é admin
    if (userData.role !== 'admin') {
      toast.error('Acesso negado! Apenas administradores podem acessar esta página.')
      router.push('/dashboard')
      return
    }

    setUser(userData)
    loadComments()
  }, [router])

  const loadComments = async () => {
    try {
      setIsLoading(true)

      // Carregar comentários pendentes
      const { data: pending, error: pendingError } = await supabase
        .from('meditation_comments')
        .select(`
          *,
          user_profiles!meditation_comments_user_id_fkey (
            name,
            email
          ),
          meditation_videos!meditation_comments_video_id_fkey (
            title
          )
        `)
        .eq('is_approved', false)
        .order('created_at', { ascending: false })

      if (!pendingError && pending) {
        setPendingComments(pending)
      }

      // Carregar comentários aprovados
      const { data: approved, error: approvedError } = await supabase
        .from('meditation_comments')
        .select(`
          *,
          user_profiles!meditation_comments_user_id_fkey (
            name,
            email
          ),
          meditation_videos!meditation_comments_video_id_fkey (
            title
          )
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!approvedError && approved) {
        setApprovedComments(approved)
      }

    } catch (error) {
      console.error('Erro ao carregar comentários:', error)
      toast.error('Erro ao carregar comentários')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('meditation_comments')
        .update({ is_approved: true })
        .eq('id', commentId)

      if (error) throw error

      toast.success('Comentário aprovado com sucesso!')
      loadComments()
    } catch (error: any) {
      console.error('Erro ao aprovar comentário:', error)
      toast.error('Erro ao aprovar comentário')
    }
  }

  const handleRejectComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('meditation_comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      toast.success('Comentário rejeitado e removido')
      loadComments()
    } catch (error: any) {
      console.error('Erro ao rejeitar comentário:', error)
      toast.error('Erro ao rejeitar comentário')
    }
  }

  const handleRevokeApproval = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('meditation_comments')
        .update({ is_approved: false })
        .eq('id', commentId)

      if (error) throw error

      toast.success('Aprovação revogada')
      loadComments()
    } catch (error: any) {
      console.error('Erro ao revogar aprovação:', error)
      toast.error('Erro ao revogar aprovação')
    }
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="px-4 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/admin/dashboard')}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Moderação de Comentários
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
              <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                {pendingComments.length} pendentes
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Gerenciar Comentários de Meditação</h2>
          <p className="text-muted-foreground">
            Aprove ou rejeite comentários dos usuários nos vídeos de meditação
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="pending" className="gap-2">
                <AlertCircle className="w-4 h-4" />
                Pendentes ({pendingComments.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-2">
                <Check className="w-4 h-4" />
                Aprovados ({approvedComments.length})
              </TabsTrigger>
            </TabsList>

            {/* Aba: Comentários Pendentes */}
            <TabsContent value="pending" className="space-y-4">
              {pendingComments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Nenhum comentário pendente
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Todos os comentários foram revisados
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingComments.map((comment) => (
                    <Card key={comment.id} className="border-yellow-200 dark:border-yellow-800">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <User className="w-5 h-5 text-purple-600" />
                              {comment.user_profiles?.name || 'Usuário'}
                            </CardTitle>
                            <CardDescription className="flex flex-col gap-1 mt-2">
                              <span className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Vídeo: {comment.meditation_videos?.title || 'Desconhecido'}
                              </span>
                              <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(comment.created_at).toLocaleString('pt-BR')}
                              </span>
                            </CardDescription>
                          </div>
                          <div className="bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                            <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">
                              Pendente
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <p className="text-gray-900 dark:text-gray-100">{comment.comment}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApproveComment(comment.id)}
                            className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                            Aprovar
                          </Button>
                          <Button
                            onClick={() => handleRejectComment(comment.id)}
                            variant="destructive"
                            className="flex-1 gap-2"
                          >
                            <X className="w-4 h-4" />
                            Rejeitar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Aba: Comentários Aprovados */}
            <TabsContent value="approved" className="space-y-4">
              {approvedComments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Check className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Nenhum comentário aprovado ainda
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {approvedComments.map((comment) => (
                    <Card key={comment.id} className="border-green-200 dark:border-green-800">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <User className="w-5 h-5 text-purple-600" />
                              {comment.user_profiles?.name || 'Usuário'}
                            </CardTitle>
                            <CardDescription className="flex flex-col gap-1 mt-2">
                              <span className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Vídeo: {comment.meditation_videos?.title || 'Desconhecido'}
                              </span>
                              <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(comment.created_at).toLocaleString('pt-BR')}
                              </span>
                            </CardDescription>
                          </div>
                          <div className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                            <span className="text-xs font-semibold text-green-800 dark:text-green-200">
                              Aprovado
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <p className="text-gray-900 dark:text-gray-100">{comment.comment}</p>
                        </div>
                        <Button
                          onClick={() => handleRevokeApproval(comment.id)}
                          variant="outline"
                          className="w-full gap-2 border-orange-300 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20"
                        >
                          <X className="w-4 h-4" />
                          Revogar Aprovação
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
