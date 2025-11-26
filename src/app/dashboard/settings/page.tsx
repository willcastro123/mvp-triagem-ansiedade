"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Settings, User, Bell, Lock, Palette, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { type UserProfile } from '@/lib/supabase'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isRequestingReset, setIsRequestingReset] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(userStr)
    setUser(userData)
    setFormData({
      name: userData.name,
      email: userData.email,
      phone: userData.phone
    })
  }, [router])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (user) {
      const updatedUser = { ...user, ...formData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      toast.success('Configurações salvas com sucesso!')
    }
  }

  const handleRequestPasswordReset = async () => {
    if (!user?.email) {
      toast.error('E-mail não encontrado')
      return
    }

    setIsRequestingReset(true)

    try {
      const response = await fetch('/api/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('E-mail de redefinição enviado! Verifique sua caixa de entrada.')
        
        // Em desenvolvimento, mostrar o link
        if (data.resetLink) {
          toast.info('Link de desenvolvimento: ' + data.resetLink, {
            duration: 10000,
          })
        }
        
        setIsPasswordDialogOpen(false)
      } else {
        toast.error(data.error || 'Erro ao solicitar redefinição de senha')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao processar solicitação')
    } finally {
      setIsRequestingReset(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="w-8 h-8 text-gray-600" />
              Configurações
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas preferências e informações pessoais
            </p>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>Atualize seus dados pessoais</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Salvar Alterações</Button>
              </form>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificações
              </CardTitle>
              <CardDescription>Configure suas preferências de notificação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Lembretes de Medicamentos</p>
                    <p className="text-sm text-muted-foreground">Receba notificações sobre seus medicamentos</p>
                  </div>
                  <Button variant="outline" size="sm">Ativar</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Lembretes de Hábitos</p>
                    <p className="text-sm text-muted-foreground">Receba lembretes para completar seus hábitos</p>
                  </div>
                  <Button variant="outline" size="sm">Ativar</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Privacidade e Segurança
              </CardTitle>
              <CardDescription>Gerencie suas configurações de privacidade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Lock className="w-4 h-4 mr-2" />
                      Alterar Senha
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Alterar Senha
                      </DialogTitle>
                      <DialogDescription>
                        Enviaremos um e-mail com instruções para redefinir sua senha de forma segura.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          <strong>E-mail cadastrado:</strong> {user.email}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Ao clicar em "Enviar E-mail", você receberá um link seguro para criar uma nova senha. 
                          O link será válido por 1 hora.
                        </p>
                      </div>
                      <Button 
                        onClick={handleRequestPasswordReset}
                        disabled={isRequestingReset}
                        className="w-full"
                      >
                        {isRequestingReset ? 'Enviando...' : 'Enviar E-mail de Redefinição'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" className="w-full justify-start">
                  Exportar Meus Dados
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  Excluir Conta
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Aparência
              </CardTitle>
              <CardDescription>Personalize a aparência do aplicativo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1">Claro</Button>
                <Button variant="outline" className="flex-1">Escuro</Button>
                <Button variant="outline" className="flex-1">Sistema</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
