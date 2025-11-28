"use client"

import { LogIn, Mail, Lock, Heart, UserPlus, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useRouter,  } from 'next/navigation'
import { LogIn, Mail, Lock, Heart, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false) // <--- NOVO STATE
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

  // ----------------- NOVA FUNÇÃO handleLogin -----------------
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!email || !password) {
    toast.error('Preencha todos os campos')
    return
  }

  setIsLoading(true)

  try {
    console.log('🔐 Tentando fazer login com:', email)

    // PASSO 1: Fazer o LOGIN com a função de Autenticação do Supabase (Correto!)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      // Isso pega erros como 'Invalid login credentials' ou 'Email not confirmed'
      console.error('❌ Erro de Autenticação:', authError.message)
      toast.error('Credenciais inválidas ou conta não ativa.', {
        description: authError.message.includes('Email not confirmed') 
          ? 'Sua conta não está confirmada.' 
          : 'E-mail ou senha incorretos.',
      })
      setIsLoading(false)
      return
    }

    // O login funcionou. Agora buscamos o registro na tabela de perfis.
    const userUID = authData.user?.id
    if (!userUID) throw new Error('UID do usuário não encontrado após login.')

    // PASSO 2: Buscar dados do perfil na sua tabela pública (user_profiles)
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles') 
      .select('*')
      .eq('id', userUID) // Busca pelo ID retornado pelo login
      .maybeSingle()

    if (profileError || !userProfile) {
      console.error('⚠️ Perfil não encontrado após login bem-sucedido. UID:', userUID)
      toast.error('Erro de perfil', {
        description: 'Perfil do usuário não encontrado no banco de dados.'
      })
      // Opcional: Deslogar o usuário aqui se o perfil for obrigatório
      await supabase.auth.signOut() 
      setIsLoading(false)
      return
    }

    console.log('✅ Login bem-sucedido! Usuário:', userProfile.email)

    // ... (Restante do código: Salvar no localStorage, logs, redirecionar) ...

    // Salva usuário no localStorage (agora com os dados do perfil)
    localStorage.setItem('user', JSON.stringify(userProfile))
    console.log('💾 Usuário salvo no localStorage')

    toast.success('Login realizado com sucesso!', {
      description: `Bem-vindo, ${userProfile.name}!`
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
// -----------------------------------------------------------------

// ----------------- NOVA FUNÇÃO handleForgotPassword -----------------
const handleForgotPassword = async () => {
  if (!email) {
    toast.error('Informe seu e-mail', {
      description: 'Digite o e-mail no campo acima para solicitar a redefinição.'
    })
    return
  }

  setIsLoading(true)

  try {
    // Supabase envia o link de redefinição para o email cadastrado
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Importante: Substitua /update-password pela sua URL de redefinição de senha
      redirectTo: `${window.location.origin}/update-password`, 
    })

    if (error) {
      console.error('Erro ao solicitar reset:', error)
      toast.error('Erro ao enviar e-mail', { 
        description: 'Verifique o e-mail digitado ou tente mais tarde.' 
      })
      return
    }

    toast.success('E-mail de redefinição enviado!', {
      description: 'Verifique sua caixa de entrada (e spam) para redefinir sua senha.'
    })

  } catch (error) {
    console.error('Erro inesperado no reset:', error)
    toast.error('Ocorreu um erro inesperado.')
  } finally {
    setIsLoading(false)
  }
}
// ------------------------------------------------------------------
  
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

            div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"} // <--- LÓGICA DE VISIBILIDADE APLICADA AQUI
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10" // <-- Adicionado espaço (pr-10) para o ícone
                  required
                  disabled={isLoading}
                />
                {/* BOTÃO DO OLHINHO (VISIBILIDADE) */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

          {/* LINK ESQUECEU SUA SENHA? */}
            {!isRegisterMode && (
              <div className="text-right text-sm -mt-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="text-muted-foreground hover:text-purple-600 transition-colors hover:underline"
                >
                  Esqueceu sua senha?
                </button>
              </div>
            )}
            {/* FIM LINK ESQUECEU SUA SENHA? */}
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
