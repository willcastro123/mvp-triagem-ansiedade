"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Music, Play, MessageSquare, Send, ThumbsUp, Clock, ArrowLeft, Upload, X, Check, AlertCircle, Filter, Loader2, Mic, Video as VideoIcon, FileAudio } from 'lucide-react'
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
      const { data, error } = await supabase
        .from('meditation_categories')
        .select('*')
        .order('name', { ascending: true })

      if (!error && data) {
        setCategories(data)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Verificar se é vídeo
      if (!file.type.startsWith('video/')) {
        toast.error('Por favor, selecione um arquivo de vídeo')
        return
      }
      
      // Verificar tamanho (máx 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('O arquivo deve ter no máximo 100MB')
        return
      }

      setSelectedFile(file)
      toast.success(`Arquivo selecionado: ${file.name}`)
    }
  }

  const uploadVideoFile = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `${user?.id}/${fileName}`

    const { data, error } = await supabase.storage
      .from('meditation-videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('meditation-videos')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const generateAudioWithOpenAI = async (script: string): Promise<string> => {
    try {
      setIsGeneratingAudio(true)
      
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ script })
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar áudio')
      }

      const audioBlob = await response.blob()
      const audioFile = new File([audioBlob], `audio-${Date.now()}.mp3`, { type: 'audio/mpeg' })

      // Upload do áudio para o Supabase Storage
      const fileName = `${Date.now()}-audio.mp3`
      const filePath = `${user?.id}/${fileName}`

      const { data, error } = await supabase.storage
        .from('meditation-audios')
        .upload(filePath, audioFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('meditation-audios')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Erro ao gerar áudio:', error)
      throw error
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const handleUploadVideo = async () => {
    if (!uploadForm.title) {
      toast.error('Preencha o título')
      return
    }

    if (uploadType === 'url' && !uploadForm.video_url) {
      toast.error('Preencha a URL do vídeo')
      return
    }

    if (uploadType === 'file' && !selectedFile) {
      toast.error('Selecione um arquivo de vídeo')
      return
    }

    if (uploadForm.generate_audio && !uploadForm.audio_script) {
      toast.error('Preencha o roteiro para gerar o áudio')
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)

      let videoUrl = uploadForm.video_url
      let audioUrl = null

      // Upload do vídeo se for arquivo
      if (uploadType === 'file' && selectedFile) {
        setUploadProgress(30)
        toast.info('Fazendo upload do vídeo...')
        videoUrl = await uploadVideoFile(selectedFile)
        setUploadProgress(50)
      }

      // Gerar áudio se solicitado
      if (uploadForm.generate_audio && uploadForm.audio_script) {
        setUploadProgress(60)
        toast.info('Gerando áudio com IA...')
        audioUrl = await generateAudioWithOpenAI(uploadForm.audio_script)
        setUploadProgress(80)
      }

      setUploadProgress(90)

      // Inserir no banco de dados
      const { error } = await supabase
        .from('meditation_videos')
        .insert([{
          title: uploadForm.title,
          description: uploadForm.description,
          video_url: videoUrl,
          thumbnail_url: uploadForm.thumbnail_url,
          duration: uploadForm.duration,
          category: uploadForm.category,
          audio_url: audioUrl,
          created_by: user?.id
        }])

      if (error) throw error

      setUploadProgress(100)
      toast.success('Vídeo adicionado com sucesso!')
      setShowUploadModal(false)
      resetUploadForm()
      loadVideos()
    } catch (error: any) {
      console.error('Erro ao adicionar vídeo:', error)
      toast.error('Erro ao adicionar vídeo: ' + error.message)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const resetUploadForm = () => {
    setUploadForm({
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      duration: 0,
      category: 'Geral',
      generate_audio: false,
      audio_script: ''
    })
    setSelectedFile(null)
    setUploadType('url')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName)
    return category?.icon || '✨'
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

            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">Filtrar por Categoria</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className={selectedCategory === 'all' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
                >
                  ✨ Todas
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.name)}
                    className={selectedCategory === category.name ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
                  >
                    {category.icon} {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {filteredVideos.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed">
                <Music className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {selectedCategory === 'all' 
                    ? 'Nenhum vídeo disponível ainda' 
                    : `Nenhum vídeo na categoria "${selectedCategory}"`}
                </p>
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
                {filteredVideos.map((video) => (
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
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-purple-600 text-white">
                          {getCategoryIcon(video.category)} {video.category}
                        </Badge>
                      </div>
                      {video.audio_url && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-600 text-white">
                            <FileAudio className="w-3 h-3 mr-1" />
                            Áudio
                          </Badge>
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
                      <video
                        src={selectedVideo.video_url}
                        controls
                        className="w-full h-full"
                        title={selectedVideo.title}
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-purple-600 text-white">
                          {getCategoryIcon(selectedVideo.category)} {selectedVideo.category}
                        </Badge>
                        {selectedVideo.audio_url && (
                          <Badge className="bg-green-600 text-white">
                            <FileAudio className="w-3 h-3 mr-1" />
                            Com Áudio Guiado
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
                      {selectedVideo.description && (
                        <p className="text-muted-foreground mb-4">{selectedVideo.description}</p>
                      )}
                      {selectedVideo.audio_url && (
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2 mb-2">
                            <FileAudio className="w-5 h-5 text-green-600" />
                            <h3 className="font-semibold text-green-900 dark:text-green-100">Áudio Guiado</h3>
                          </div>
                          <audio controls className="w-full">
                            <source src={selectedVideo.audio_url} type="audio/mpeg" />
                            Seu navegador não suporta o elemento de áudio.
                          </audio>
                        </div>
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
        <DialogContent className="bg-white dark:bg-slate-800 max-w-2xl max-h-[90vh] overflow-y-auto">
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
            {/* Tipo de Upload */}
            <div>
              <Label>Tipo de Upload</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  type="button"
                  variant={uploadType === 'url' ? 'default' : 'outline'}
                  onClick={() => setUploadType('url')}
                  className="gap-2"
                >
                  <VideoIcon className="w-4 h-4" />
                  URL do Vídeo
                </Button>
                <Button
                  type="button"
                  variant={uploadType === 'file' ? 'default' : 'outline'}
                  onClick={() => setUploadType('file')}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload de Arquivo
                </Button>
              </div>
            </div>

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
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={uploadForm.category} 
                onValueChange={(value) => setUploadForm({ ...uploadForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            {uploadType === 'url' ? (
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
            ) : (
              <div>
                <Label htmlFor="video_file">Arquivo de Vídeo *</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="video_file"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {selectedFile ? selectedFile.name : 'Selecionar Arquivo de Vídeo'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Máximo 100MB. Formatos: MP4, MOV, AVI, etc.
                  </p>
                </div>
              </div>
            )}

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

            {/* Gerar Áudio com IA */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="generate_audio"
                  checked={uploadForm.generate_audio}
                  onChange={(e) => setUploadForm({ ...uploadForm, generate_audio: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="generate_audio" className="cursor-pointer flex items-center gap-2">
                  <Mic className="w-4 h-4 text-green-600" />
                  Gerar Áudio Guiado com IA (OpenAI)
                </Label>
              </div>
              
              {uploadForm.generate_audio && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="audio_script">Roteiro para o Áudio *</Label>
                  <Textarea
                    id="audio_script"
                    value={uploadForm.audio_script}
                    onChange={(e) => setUploadForm({ ...uploadForm, audio_script: e.target.value })}
                    placeholder="Escreva o roteiro que será narrado pela IA. Exemplo: 'Respire fundo e relaxe. Feche os olhos e concentre-se na sua respiração...'"
                    rows={5}
                    className="resize-none"
                  />
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      A IA da OpenAI irá narrar este roteiro com voz natural e criar um arquivo de áudio MP3
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isGeneratingAudio ? 'Gerando áudio com IA...' : 'Fazendo upload...'}
                  </span>
                  <span className="font-semibold">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowUploadModal(false)
                resetUploadForm()
              }}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUploadVideo} 
              className="gap-2"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Adicionar Vídeo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
