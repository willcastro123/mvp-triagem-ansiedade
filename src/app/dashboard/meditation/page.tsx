"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Music, Video, Sparkles, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase, type UserProfile } from '@/lib/supabase'
import { toast } from 'sonner'

interface MediaItem {
  id: string
  title: string
  description: string
  duration: string
  thumbnail: string
  url: string
  type: 'video' | 'audio'
  category: string
}

export default function MeditationPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const userData = JSON.parse(userStr)
    setUser(userData)
  }, [router])

  const videos: MediaItem[] = [
    {
      id: '1',
      title: 'Meditação Guiada - 10 Minutos',
      description: 'Meditação guiada para iniciantes, perfeita para começar o dia',
      duration: '10:00',
      thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
      url: 'https://www.youtube.com/embed/inpok4MKVLM',
      type: 'video',
      category: 'Guiada'
    },
    {
      id: '2',
      title: 'Respiração Profunda',
      description: 'Técnicas de respiração para reduzir ansiedade',
      duration: '5:00',
      thumbnail: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&fit=crop',
      url: 'https://www.youtube.com/embed/SEfs5TJZ6Nk',
      type: 'video',
      category: 'Respiração'
    },
    {
      id: '3',
      title: 'Meditação para Dormir',
      description: 'Relaxamento profundo para uma noite tranquila',
      duration: '20:00',
      thumbnail: 'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?w=400&h=300&fit=crop',
      url: 'https://www.youtube.com/embed/aEqlQvczMJQ',
      type: 'video',
      category: 'Sono'
    },
    {
      id: '4',
      title: 'Mindfulness - Atenção Plena',
      description: 'Pratique a atenção plena no momento presente',
      duration: '15:00',
      thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=300&fit=crop',
      url: 'https://www.youtube.com/embed/ZToicYcHIOU',
      type: 'video',
      category: 'Mindfulness'
    }
  ]

  const sounds: MediaItem[] = [
    {
      id: '5',
      title: 'Sons da Natureza',
      description: 'Floresta tropical com pássaros e água corrente',
      duration: '30:00',
      thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      url: 'https://www.youtube.com/embed/eKFTSSKCzWA',
      type: 'audio',
      category: 'Natureza'
    },
    {
      id: '6',
      title: 'Ondas do Mar',
      description: 'Som relaxante de ondas quebrando na praia',
      duration: '60:00',
      thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
      url: 'https://www.youtube.com/embed/WHPEKLQID4U',
      type: 'audio',
      category: 'Natureza'
    },
    {
      id: '7',
      title: 'Chuva Suave',
      description: 'Som de chuva leve para relaxamento profundo',
      duration: '45:00',
      thumbnail: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&h=300&fit=crop',
      url: 'https://www.youtube.com/embed/q76bMs-NwRk',
      type: 'audio',
      category: 'Natureza'
    },
    {
      id: '8',
      title: 'Música Ambiente',
      description: 'Música instrumental relaxante para meditação',
      duration: '40:00',
      thumbnail: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=300&fit=crop',
      url: 'https://www.youtube.com/embed/lTRiuFIWV54',
      type: 'audio',
      category: 'Música'
    }
  ]

  const handleMediaSelect = async (media: MediaItem) => {
    setSelectedMedia(media)
    setIsPlaying(true)

    // Registrar atividade e adicionar pontos
    if (user) {
      try {
        // Adicionar pontos
        const newPoints = (user.points || 0) + 5
        await supabase
          .from('user_profiles')
          .update({ points: newPoints })
          .eq('id', user.id)

        // Atualizar estado local
        setUser({ ...user, points: newPoints })

        // Registrar atividade
        await supabase
          .from('user_activity_logs')
          .insert([{
            user_id: user.id,
            activity_type: 'meditation',
            activity_description: `Iniciou meditação: ${media.title}`,
            metadata: { media_id: media.id, media_type: media.type }
          }])

        toast.success('🎉 +5 pontos! Continue praticando!')
      } catch (error) {
        console.error('Erro ao registrar meditação:', error)
      }
    }
  }

  const MediaCard = ({ media }: { media: MediaItem }) => (
    <Card 
      className="hover:shadow-xl transition-all cursor-pointer group"
      onClick={() => handleMediaSelect(media)}
    >
      <div className="relative overflow-hidden rounded-t-lg">
        <img 
          src={media.thumbnail} 
          alt={media.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-12 h-12 text-white" />
        </div>
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {media.duration}
        </div>
      </div>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {media.type === 'video' ? <Video className="w-5 h-5" /> : <Music className="w-5 h-5" />}
          {media.title}
        </CardTitle>
        <CardDescription>{media.description}</CardDescription>
      </CardHeader>
    </Card>
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Meditação & Relaxamento</h1>
              <p className="text-muted-foreground">Vídeos e sons para acalmar sua mente</p>
            </div>
          </div>
        </div>

        {/* Player */}
        {selectedMedia && (
          <Card className="mb-8 border-purple-200 shadow-xl">
            <CardContent className="p-6">
              <div className="aspect-video rounded-lg overflow-hidden bg-black mb-4">
                <iframe
                  width="100%"
                  height="100%"
                  src={selectedMedia.url}
                  title={selectedMedia.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedMedia.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedMedia.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{selectedMedia.duration}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Tabs */}
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="videos" className="gap-2">
              <Video className="w-4 h-4" />
              Vídeos
            </TabsTrigger>
            <TabsTrigger value="sounds" className="gap-2">
              <Music className="w-4 h-4" />
              Sons
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <MediaCard key={video.id} media={video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sounds">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sounds.map((sound) => (
                <MediaCard key={sound.id} media={sound} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="mt-8 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-semibold mb-1">Ganhe pontos meditando!</p>
                <p>Cada sessão de meditação concluída adiciona 5 pontos à sua conta. Continue praticando para desbloquear conquistas!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
