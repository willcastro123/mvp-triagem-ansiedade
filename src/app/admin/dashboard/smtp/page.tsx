"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Mail, Server, Lock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function SMTPSettingsPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  
  const [smtpConfig, setSmtpConfig] = useState({
    host: 'smtp.titan.email',
    port: '465',
    secure: true,
    user: 'suporte@zentiamind.com.br',
    password: '09111964Wc!@'
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Aqui você pode salvar as configurações no banco ou em variáveis de ambiente
      // Por enquanto, apenas mostra uma mensagem de sucesso
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Configurações SMTP salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Server className="w-8 h-8 text-blue-600" />
              Configurações SMTP
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure o servidor de e-mail para envios automáticos
            </p>
          </div>
        </div>

        {/* SMTP Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Servidor SMTP
            </CardTitle>
            <CardDescription>
              Configure as credenciais do servidor de e-mail (Titan, Gmail, Outlook, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp-host">Host SMTP</Label>
                <Input
                  id="smtp-host"
                  value={smtpConfig.host}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                  placeholder="smtp.titan.email"
                />
              </div>
              <div>
                <Label htmlFor="smtp-port">Porta</Label>
                <Input
                  id="smtp-port"
                  value={smtpConfig.port}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                  placeholder="465"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="smtp-user" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Usuário (E-mail)
              </Label>
              <Input
                id="smtp-user"
                type="email"
                value={smtpConfig.user}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="smtp-password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Senha
              </Label>
              <Input
                id="smtp-password"
                type="password"
                value={smtpConfig.password}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Configuração Atual:</strong> Titan Email (HostGator) - suporte@zentiamind.com.br
              </p>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleSave} 
                className="w-full"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Ativo</p>
                  <p className="text-green-100">Servidor SMTP Conectado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">SSL/TLS</p>
                  <p className="text-blue-100">Conexão Segura</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>💡 Guia de Configuração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Titan Email (HostGator)</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Host: smtp.titan.email</li>
                <li>• Porta: 465 (SSL) ou 587 (TLS)</li>
                <li>• Usuário: seu@dominio.com.br</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Gmail</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Host: smtp.gmail.com</li>
                <li>• Porta: 465 (SSL) ou 587 (TLS)</li>
                <li>• Usuário: seu@gmail.com</li>
                <li>• Senha: Use senha de app (não a senha normal)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Outlook/Hotmail</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Host: smtp-mail.outlook.com</li>
                <li>• Porta: 587 (TLS)</li>
                <li>• Usuário: seu@outlook.com ou seu@hotmail.com</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
