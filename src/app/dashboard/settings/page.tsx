"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar, Shield, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  
  const [userData, setUserData] = useState({
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 98765-4321',
    birthDate: '1990-05-15',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567'
  })

  useEffect(() => {
    // Carregar dados do usuário do localStorage
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setUserEmail(user.email)
      setUserData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        birthDate: user.birth_date || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zip_code || ''
      })
    }
  }, [])

// ----------------- NOVA FUNÇÃO handleSaveProfile -----------------
const handleSaveProfile = async () => {
  setIsSaving(true)
  
  // 1. Pega o usuário logado para obter o ID (UID)
  const { data: { user: currentUser }, error: sessionError } = await supabase.auth.getUser()
  
  if (sessionError || !currentUser) {
    toast.error('Erro de sessão', { description: 'Faça login novamente.' })
    setIsSaving(false)
    return
  }

  try {
    const isEmailChanged = userData.email !== userEmail
    let authUpdateSuccess = true
    
    // --- LÓGICA DE TROCA DE E-MAIL ---
    if (isEmailChanged) {
      // 2. Chama a função de autenticação do Supabase para alterar o email
      const { error: authError } = await supabase.auth.updateUser({
        email: userData.email
      })

      if (authError) {
        console.error('Erro ao atualizar AUTH:', authError)
        toast.error('Erro ao trocar e-mail', { description: authError.message })
        authUpdateSuccess = false
        // Se a troca de email falhar, paramos aqui
        return 
      }
      
      // Se a troca do Auth for bem-sucedida, informamos o usuário
      toast.info('Link de confirmação enviado para o novo e-mail.', {
        description: 'Clique no link para finalizar a troca de endereço.'
      })
    }
    // ------------------------------------
    
    // 3. Salva os dados do perfil (Nome, Telefone, Endereço) na tabela pública
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        name: userData.name,
        // O email só será atualizado na tabela pública se a troca no Auth for bem-sucedida
        // Ou se o email não mudou. Se mudou, esperamos a confirmação para atualizar o localStorage.
        email: userData.email, 
        phone: userData.phone,
        city: userData.city,
        // Adicione outras colunas aqui:
        // age: userData.birthDate,
        // etc.
      })
      .eq('id', currentUser.id) // Atualiza apenas o registro do usuário logado

    if (profileError) {
      console.error('Erro ao atualizar perfil:', profileError)
      toast.error('Erro ao salvar dados pessoais.')
      return
    }

    // 4. Se a troca de email foi iniciada, não salvamos no localStorage ainda.
    if (!isEmailChanged || authUpdateSuccess) {
      toast.success('Dados pessoais atualizados com sucesso!')
      
      // Atualizar o localStorage com os novos dados
      const updatedUser = { ...JSON.parse(localStorage.getItem('user') || '{}'), ...userData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Se o email não mudou, atualiza o estado userEmail
      if (!isEmailChanged) {
        setUserEmail(userData.email)
      }
    }

  } catch (error) {
    console.error('Erro geral ao salvar:', error)
    toast.error('Erro inesperado ao salvar os dados.')
  } finally {
    setIsSaving(false)
  }
}
// -------------------------------------------------------------

  const handleRequestPasswordReset = async () => {
    if (!userEmail) {
      toast.error('E-mail não encontrado')
      return
    }

    setIsSendingEmail(true)
    try {
      // Gerar código único para reset de senha (6 dígitos)
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString()

      // Salvar código no campo access_code
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          access_code: resetCode
        })
        .eq('email', userEmail)

      if (updateError) {
        console.error('Erro ao salvar código:', updateError)
        throw updateError
      }

      // Enviar e-mail via API
      const resetLink = `${window.location.origin}/reset-password?code=${resetCode}`
      
      const response = await fetch('/api/send-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          resetLink: resetLink,
          userName: userData.name
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao enviar e-mail')
      }

      toast.success('Link de redefinição enviado para seu e-mail! Verifique sua caixa de entrada.')
    } catch (error: any) {
      console.error('Erro ao solicitar redefinição de senha:', error)
      toast.error(error.message || 'Erro ao enviar e-mail. Tente novamente.')
    } finally {
      setIsSendingEmail(false)
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
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <User className="w-8 h-8 text-blue-600" />
              Configurações da Conta
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus dados pessoais e preferências
            </p>
          </div>
        </div>

        {/* Personal Information Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Atualize seus dados pessoais e informações de contato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <Label htmlFor="birthDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data de Nascimento
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={userData.birthDate}
                  onChange={(e) => setUserData({ ...userData, birthDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Endereço
              </Label>
              <Input
                id="address"
                value={userData.address}
                onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                placeholder="Rua, número, complemento"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={userData.city}
                  onChange={(e) => setUserData({ ...userData, city: e.target.value })}
                  placeholder="Cidade"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={userData.state}
                  onChange={(e) => setUserData({ ...userData, state: e.target.value })}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  value={userData.zipCode}
                  onChange={(e) => setUserData({ ...userData, zipCode: e.target.value })}
                  placeholder="00000-000"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleSaveProfile} 
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
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password Change Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Alterar Senha
            </CardTitle>
            <CardDescription>
              Solicite um link de redefinição de senha por e-mail
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Redefinição segura por e-mail
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Clique no botão abaixo para receber um link de redefinição de senha no seu e-mail cadastrado: <strong>{userEmail}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
              <p className="text-sm text-amber-900 dark:text-amber-100">
                O link de redefinição expira em 1 hora por segurança
              </p>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleRequestPasswordReset} 
                className="w-full gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                disabled={isSendingEmail}
              >
                {isSendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enviando e-mail...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar Link de Redefinição
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
