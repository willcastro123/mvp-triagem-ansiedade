"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Music, Play, MessageSquare, Send, Clock, ArrowLeft, Upload, Loader2, Mic, Video as VideoIcon, FileAudio, AlertCircle, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { supabase, type UserProfile } from '@/lib/supabase'
import { toast } from 'sonner'

interface MeditationVideo {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  duration: number
  category: string
  audio_url?: string
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

interface Category {
  id: string
  name: string
  description: string
  icon: string
}

export default function MeditationPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [videos, setVideos] = useState<MeditationVideo[]>([])
  const [filteredVideos, setFilteredVideos] = useState<MeditationVideo[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedVideo, setSelectedVideo] = useState<MeditationVideo | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url')
  const [isUploading, setIsUploading] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration: 0,
    category: 'Geral',
    generate_audio: false,
    audio_script: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const userData = JSON.parse(userStr)
    setUser(userData)
    loadCategories()
    loadVideos()
  }, [router])

  useEffect(() => {
    filterVideosByCategory()
  }, [selectedCategory, videos])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase.from('meditation_categories').select('*').order('name', { ascending: true })
      if (!error && data) setCategories(data)
    } catch (error) {
      console.error('Erro categorias:', error)
    }
  }

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase.from('meditation_videos').select('*').order('created_at', { ascending: false })
      if (!error && data) setVideos(data)
    } catch (error) {
      console.error('Erro vídeos:', error)
    }
  }

  const filterVideosByCategory = () => {
    if (selectedCategory === 'all') {
      setFilteredVideos(videos)
    } else {
      setFilteredVideos(videos.filter(v => v.category === selectedCategory))
    }
  }

  const loadComments = async (videoId: string) => {
    try {
      const { data, error } = await supabase
        .from('meditation_comments')
        .select(`*, user_profiles!meditation_comments_user_id_fkey (name)`)
        .eq('video_id', videoId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
      if (!error && data) setComments(data)
    } catch (error) {
      console.error('Erro comentários:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('video/')) return toast.error('Selecione um vídeo')
      if (file.size > 100 * 1024 * 1024) return toast.error('Máximo 100MB')
      setSelectedFile(file)
      toast.success(`Selecionado: ${file.name}`)
    }
  }

  const uploadVideoFile = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const { data, error } = await supabase.storage.from('meditation-videos').upload(`${user?.id}/${fileName}`, file)
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('meditation-videos').getPublicUrl(`${user?.id}/${fileName}`)
    return publicUrl
  }

  const handleUploadVideo = async () => {
    if (!uploadForm.title) return toast.error('Preencha o título')
    try {
      setIsUploading(true)
      let videoUrl = uploadForm.video_url
      if (uploadType === 'file' && selectedFile) {
        videoUrl = await uploadVideoFile(selectedFile)
      }
      const { error } = await supabase.from('meditation_videos').insert([{
        title: uploadForm.title,
        description: uploadForm.description,
        video_url: videoUrl,
        thumbnail_url: uploadForm.thumbnail_url,
        duration: uploadForm.duration,
        category: uploadForm.category,
        created_by: user?.id
      }])
      if (error) throw error
      toast.success('Vídeo adicionado!')
      setShowUploadModal(false)
      loadVideos()
    } catch (error: any) {
      toast.error('Erro: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedVideo) return toast.error('Digite um comentário')
    try {
      const { error } = await supabase.from('meditation_comments').insert([{
        video_id: selectedVideo.id,
        user_id: user?.id,
        comment: newComment,
        is_approved: false
      }])
      if (error) throw error
      toast.success('Comentário enviado para aprovação!')
      setNewComment('')
    } catch (error) {
      toast.error('Erro ao enviar')
    }
  }

  const openVideo = (video: MeditationVideo) => {
    setSelectedVideo(video)
    loadComments(video.id)
  }

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName)
    return category?.icon || '✨'
  }

  const getEmbedUrl = (url: string) => {
    if (url.includes('embed')) return url
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
      return `https://player.vimeo.com/video/${videoId}`
    }
    return url
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="px-4 py-4 flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-2">
              <Music className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Meditação</h1>
            </div>
          </div>
          {user.role === 'admin' && (
            <Button onClick={() => setShowUploadModal(true)} className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Upload className="w-4 h-4" /> Adicionar Vídeo
            </Button>
          )}
        </div>
      </header>

      <main className="p-4 lg:p-8 max-w-6xl mx-auto">
        {!selectedVideo ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Vídeos de Meditação</h2>
              <p className="text-muted-foreground">Relaxe e acalme sua mente com nossos vídeos guiados</p>
            </div>

            {/* Filtros de Categoria */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">Categorias</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant={selectedCategory === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory('all')} className={selectedCategory === 'all' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}>
                  ✨ Todas
                </Button>
                {categories.map((category) => (
                  <Button key={category.id} variant={selectedCategory === category.name ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(category.name)} className={selectedCategory === category.name ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}>
                    {category.icon} {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {filteredVideos.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed">
                <Music className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Nenhum vídeo nesta categoria ainda.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                  <Card key={video.id} className="hover:shadow-xl transition-shadow cursor-pointer" onClick={() => openVideo(video)}>
                    <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
                      {video.thumbnail_url ? (
                        <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Play className="w-16 h-16 text-purple-600" /></div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-purple-600 text-white">
                          {getCategoryIcon(video.category)} {video.category}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{video.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setSelectedVideo(null)} className="mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-0">
                    <div className="aspect-video bg-black">
                      {selectedVideo.video_url.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video src={selectedVideo.video_url} controls className="w-full h-full" title={selectedVideo.title} />
                      ) : (
                        <iframe src={getEmbedUrl(selectedVideo.video_url)} className="w-full h-full" title={selectedVideo.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-purple-600 text-white">{getCategoryIcon(selectedVideo.category)} {selectedVideo.category}</Badge>
                      </div>
                      <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
                      <p className="text-muted-foreground mb-4">{selectedVideo.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Comentários</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Deixe um comentário..." rows={3} />
                      <Button onClick={handleAddComment} className="w-full gap-2"><Send className="w-4 h-4" /> Enviar</Button>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {comments.map((comment) => (
                        <div key={comment.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="font-semibold text-sm">{comment.user_profiles?.name || 'Usuário'}</p>
                          <p className="text-sm">{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modal Upload (Versão Admin Simplificada nesta página) */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="bg-white dark:bg-slate-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Vídeo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
             {/* ... Campos de Título, URL, e SELECT DE CATEGORIA (Igual ao Admin) ... */}
             <div>
                <Label>Categoria</Label>
                <Select value={uploadForm.category} onValueChange={(val) => setUploadForm({...uploadForm, category: val})}>
                   <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                   <SelectContent>
                      {categories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.icon} {cat.name}</SelectItem>)}
                   </SelectContent>
                </Select>
             </div>
             {/* ... Outros inputs (Titulo, URL, Descrição) ... */}
             <div>
               <Label>Título</Label>
               <Input value={uploadForm.title} onChange={e => setUploadForm({...uploadForm, title: e.target.value})} />
             </div>
             <div>
               <Label>URL do Vídeo</Label>
               <Input value={uploadForm.video_url} onChange={e => setUploadForm({...uploadForm, video_url: e.target.value})} />
             </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUploadVideo}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
