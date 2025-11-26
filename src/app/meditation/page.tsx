"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Music, Play, MessageSquare, Send, ThumbsUp, Clock, ArrowLeft, Upload, X, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase, type UserProfile } from '@/lib/supabase'
import { toast } from 'sonner'

interface MeditationVideo {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  duration: number
  created_at: string
  created_by: string
}

interface Comment {
  id: string
  video_id: string
  user_id: string
  comment: string
  is_approved: boolean
  created_at: string
  user_profiles?: {
    name: string
  }
}

export default function MeditationPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [videos, setVideos] = useState<MeditationVideo[]>([])
  const [selectedVideo, setSelectedVideo] = useState<MeditationVideo | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration: 0
  })

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(userStr)
    setUser(userData)
    loadVideos()
  }, [router])

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('meditation_videos')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setVideos(data)
      }
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error)
    }
  }

  const loadComments = async (videoId: string) => {
    try {
      const { data, error } = await supabase
        .from('meditation_comments')
        .select(`
          *,
          user_profiles!meditation_comments_user_id_fkey (
            name
          )
        `)
        .eq('video_id', videoId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setComments(data)
      }
    } catch (error) {
      console.error('Erro ao carregar comentários:', error)
    }
  }

  const handleUploadVideo = async () => {
    if (!uploadForm.title || !uploadForm.video_url) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    try {
      const { error } = await supabase
        .from('meditation_videos')
        .insert([{
          title: uploadForm.title,
          description: uploadForm.description,
          video_url: uploadForm.video_url,
          thumbnail_url: uploadForm.thumbnail_url,
          duration: uploadForm.duration,
          created_by: user?.id
        }])

      if (error) throw error

      toast.success('Vídeo adicionado com sucesso!')
      setShowUploadModal(false)
      setUploadForm({
        title: '',
        description: '',
        video_url: '',
        thumbnail_url: '',
        duration: 0
      })
      loadVideos()
    } catch (error: any) {
      console.error('Erro ao adicionar vídeo:', error)
      toast.error('Erro ao adicionar vídeo')
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedVideo) {
      toast.error('Digite um comentário')
      return
    }

    try {
      const { error } = await supabase
        .from('meditation_comments')
        .insert([{
          video_id: selectedVideo.id,
          user_id: user?.id,
          comment: newComment,
          is_approved: false
        }])

      if (error) throw error

      toast.success('Comentário enviado! Aguardando aprovação do administrador.')
      setNewComment('')
    } catch (error: any) {
      console.error('Erro ao adicionar comentário:', error)
      toast.error('Erro ao adicionar comentário')
    }
  }

  const openVideo = (video: MeditationVideo) => {
    setSelectedVideo(video)
    loadComments(video.id)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
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
              <Music className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Meditação
              </h1>
            </div>
          </div>
          {user.role === 'admin' && (
            <Button
              onClick={() => setShowUploadModal(true)}
              className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Upload className="w-4 h-4" />
              Adicionar Vídeo
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-8 max-w-6xl mx-auto">
        {!selectedVideo ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Vídeos de Meditação</h2>
              <p className="text-muted-foreground">
                Relaxe e acalme sua mente com nossos vídeos guiados
              </p>
            </div>

            {videos.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed">
                <Music className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Nenhum vídeo disponível ainda</p>
                {user.role === 'admin' && (
                  <Button
                    onClick={() => setShowUploadModal(true)}
                    className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Upload className="w-4 h-4" />
                    Adicionar Primeiro Vídeo
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <Card
                    key={video.id}
                    className="hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => openVideo(video)}
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-16 h-16 text-purple-600" />
                        </div>
                      )}
                      {video.duration > 0 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                      {video.description && (
                        <CardDescription className="line-clamp-2">{video.description}</CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              onClick={() => setSelectedVideo(null)}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Video Player */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-0">
                    <div className="aspect-video bg-black">
                      <iframe
                        src={selectedVideo.video_url}
                        className="w-full h-full"
                        allowFullScreen
                        title={selectedVideo.title}
                      />
                    </div>
                    <div className="p-6">
                      <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
                      {selectedVideo.description && (
                        <p className="text-muted-foreground">{selectedVideo.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comments Section */}
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Comentários
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add Comment */}
                    <div className="space-y-2">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Adicione um comentário..."
                        rows={3}
                        className="resize-none"
                      />
                      <Button
                        onClick={handleAddComment}
                        className="w-full gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Enviar Comentário
                      </Button>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Seu comentário será revisado pelo administrador antes de aparecer publicamente
                        </p>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {comments.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          Nenhum comentário aprovado ainda
                        </p>
                      ) : (
                        comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-semibold text-sm">
                                {comment.user_profiles?.name || 'Usuário'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {comment.comment}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modal: Upload Video */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-600" />
              Adicionar Vídeo de Meditação
            </DialogTitle>
            <DialogDescription>
              Adicione um novo vídeo para os usuários
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                placeholder="Ex: Meditação para Ansiedade"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Descreva o vídeo..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="video_url">URL do Vídeo (YouTube/Vimeo) *</Label>
              <Input
                id="video_url"
                value={uploadForm.video_url}
                onChange={(e) => setUploadForm({ ...uploadForm, video_url: e.target.value })}
                placeholder="https://www.youtube.com/embed/..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use o link de incorporação (embed) do vídeo
              </p>
            </div>
            <div>
              <Label htmlFor="thumbnail_url">URL da Thumbnail</Label>
              <Input
                id="thumbnail_url"
                value={uploadForm.thumbnail_url}
                onChange={(e) => setUploadForm({ ...uploadForm, thumbnail_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="duration">Duração (segundos)</Label>
              <Input
                id="duration"
                type="number"
                value={uploadForm.duration}
                onChange={(e) => setUploadForm({ ...uploadForm, duration: parseInt(e.target.value) || 0 })}
                placeholder="300"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUploadVideo} className="gap-2">
              <Upload className="w-4 h-4" />
              Adicionar Vídeo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
