"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, Mail, Lock, Heart, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRegisterMode, setIsRegisterMode] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Verifica se o e-mail já existe
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle()

      if (existingUser) {
        toast.error('E-mail já cadastrado', {
          description: 'Use outro e-mail ou faça login.'
        })
        setIsLoading(false)
        return
      }

      // Cria nova conta
      const { data: newUser, error } = await supabase
        .from('user_profiles')
        .insert([{
          email,
          password,
          name: email.split('@')[0],
          phone: '',
          age: '',
          gender: '',
          city: '',
          anxiety_type: null,
          triage_completed: false,
          is_premium: false,
          points: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar conta:', error)
        throw error
      }

      // Registra atividade de criação de conta
      try {
        await supabase
          .from('user_activity_logs')
          .insert([{
            user_id: newUser.id,
            activity_type: 'register',
            activity_description: 'Usuário criou uma nova conta',
            metadata: { timestamp: new Date().toISOString() }
          }])
      } catch (logError) {
        console.warn('Erro ao registrar atividade (não crítico):', logError)
      }

      // Salva usuário no localStorage
      localStorage.setItem('user', JSON.stringify(newUser))

      toast.success('Conta criada com sucesso!')
      
      // Aguarda um pouco antes de redirecionar
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)

    } catch (error) {
      console.error('Erro ao criar conta:', error)
      toast.error('Erro ao criar conta', {
        description: 'Tente novamente mais tarde.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Preencha todos os campos')
      return
    }

    setIsLoading(true)

    try {
      console.log('🔐 Tentando fazer login com:', email)

      // Busca usuário no banco
      const { data: user, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle()

      console.log('📊 Resultado da busca:', { 
        encontrou: !!user, 
        erro: error?.message,
        detalhes: error 
      })

      if (error) {
        console.error('❌ Erro ao buscar usuário:', error)
        toast.error('Erro ao conectar com o banco de dados', {
          description: error.message || 'Tente novamente mais tarde.'
        })
        setIsLoading(false)
        return
      }

      if (!user) {
        console.warn('⚠️ Usuário não encontrado ou senha incorreta')
        toast.error('Credenciais inválidas', {
          description: 'E-mail ou senha incorretos.'
        })
        setIsLoading(false)
        return
      }

      console.log('✅ Login bem-sucedido! Usuário:', user.email)

      // Registra atividade de login (não crítico)
      try {
        await supabase
          .from('user_activity_logs')
          .insert([{
            user_id: user.id,
            activity_type: 'login',
            activity_description: 'Usuário fez login no sistema',
            metadata: { timestamp: new Date().toISOString() }
          }])
      } catch (logError) {
        console.warn('⚠️ Erro ao registrar atividade (não crítico):', logError)
      }

      // Salva usuário no localStorage
      localStorage.setItem('user', JSON.stringify(user))
      console.log('💾 Usuário salvo no localStorage')

      toast.success('Login realizado com sucesso!', {
        description: `Bem-vindo, ${user.name}!`
      })
      
      // Aguarda um pouco antes de redirecionar
      console.log('🔄 Redirecionando para dashboard...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)

    } catch (error) {
      console.error('❌ Erro inesperado ao fazer login:', error)
      toast.error('Erro ao fazer login', {
        description: 'Ocorreu um erro inesperado. Tente novamente.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ZentiaMind
            </CardTitle>
            <CardDescription>
              {isRegisterMode ? 'Crie sua conta para começar' : 'Faça login para acessar sua conta'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {isRegisterMode ? 'Criando conta...' : 'Entrando...'}
                </>
              ) : (
                <>
                  {isRegisterMode ? (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Criar Conta e Entrar
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Entrar
                    </>
                  )}
                </>
              )}
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-sm text-purple-600 hover:underline"
                disabled={isLoading}
              >
                {isRegisterMode ? 'Já tem uma conta? Faça login' : 'Não tem conta? Registre-se'}
              </button>
              
              <div className="text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="text-purple-600 hover:underline"
                  disabled={isLoading}
                >
                  Voltar para a página inicial
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
