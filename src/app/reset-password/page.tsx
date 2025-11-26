"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Eye, EyeOff, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isResetting, setIsResetting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  })

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
      validateToken(tokenParam)
    } else {
      setIsValidToken(false)
      setIsLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    // Validar senha em tempo real
    const password = passwords.newPassword
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    })
  }, [passwords.newPassword])

  const validateToken = async (tokenToValidate: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('reset_token, reset_token_expiry')
        .eq('reset_token', tokenToValidate)
        .single()

      if (error || !data) {
        setIsValidToken(false)
        setIsLoading(false)
        return
      }

      // Verificar se o token expirou
      const expiryDate = new Date(data.reset_token_expiry)
      const now = new Date()

      if (now > expiryDate) {
        setIsValidToken(false)
        toast.error('Link expirado. Solicite um novo link de redefinição.')
      } else {
        setIsValidToken(true)
      }
    } catch (error) {
      console.error('Erro ao validar token:', error)
      setIsValidToken(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!token) {
      toast.error('Token inválido')
      return
    }

    // Validar senhas
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (!Object.values(passwordValidation).every(v => v)) {
      toast.error('A senha não atende aos requisitos de segurança')
      return
    }

    setIsResetting(true)
    try {
      // Buscar usuário pelo token
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id, email')
        .eq('reset_token', token)
        .single()

      if (userError || !userData) {
        throw new Error('Token inválido')
      }

      // Atualizar senha e limpar token
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          password: passwords.newPassword, // Em produção, use hash (bcrypt)
          reset_token: null,
          reset_token_expiry: null
        })
        .eq('id', userData.id)

      if (updateError) {
        throw updateError
      }

      toast.success('Senha redefinida com sucesso! Redirecionando para login...')
      
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error)
      toast.error(error.message || 'Erro ao redefinir senha. Tente novamente.')
    } finally {
      setIsResetting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Validando link...</p>
        </div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Link Inválido ou Expirado</CardTitle>
            <CardDescription>
              Este link de redefinição de senha não é válido ou já expirou.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                Links de redefinição expiram em 1 hora por segurança. Solicite um novo link nas configurações da sua conta.
              </p>
            </div>
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full"
            >
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
          <CardDescription>
            Crie uma nova senha segura para sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nova Senha */}
          <div>
            <Label htmlFor="newPassword">Nova Senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder="Digite sua nova senha"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Confirmar Senha */}
          <div>
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                placeholder="Confirme sua nova senha"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Validação de Senha */}
          {passwords.newPassword && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium mb-2">Requisitos de senha:</p>
              <div className="space-y-1">
                <div className={`flex items-center gap-2 text-sm ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.minLength ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  Mínimo de 8 caracteres
                </div>
                <div className={`flex items-center gap-2 text-sm ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.hasUpperCase ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  Pelo menos uma letra maiúscula
                </div>
                <div className={`flex items-center gap-2 text-sm ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.hasLowerCase ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  Pelo menos uma letra minúscula
                </div>
                <div className={`flex items-center gap-2 text-sm ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.hasNumber ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  Pelo menos um número
                </div>
                <div className={`flex items-center gap-2 text-sm ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.hasSpecialChar ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  Pelo menos um caractere especial (!@#$%^&*)
                </div>
              </div>
            </div>
          )}

          {/* Aviso de Senhas Diferentes */}
          {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <X className="w-4 h-4" />
                As senhas não coincidem
              </p>
            </div>
          )}

          <Button 
            onClick={handleResetPassword} 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            disabled={isResetting || !Object.values(passwordValidation).every(v => v) || passwords.newPassword !== passwords.confirmPassword}
          >
            {isResetting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Redefinindo...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Redefinir Senha
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
