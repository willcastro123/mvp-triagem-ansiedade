"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'

interface AdminAuthGuardProps {
  children: React.ReactNode
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = () => {
    try {
      // Verifica se existe admin no localStorage
      const adminData = localStorage.getItem('admin')
      
      if (!adminData) {
        // Não está logado, redireciona para login
        router.push('/admin/login')
        return
      }

      // Admin está logado
      setIsAuthorized(true)
      setIsChecking(false)
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      router.push('/admin/login')
    }
  }

  // Tela de carregamento durante verificação
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  // Se não autorizado, não renderiza nada (já foi redirecionado)
  if (!isAuthorized) {
    return null
  }

  // Autorizado, renderiza o conteúdo
  return <>{children}</>
}
