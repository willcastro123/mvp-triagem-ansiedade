'use client'

import { Lock, Crown, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PremiumLockProps {
  feature: string
  description?: string
  children?: React.ReactNode
  isPremium: boolean
  showUpgradeButton?: boolean
}

export function PremiumLock({ 
  feature, 
  description, 
  children, 
  isPremium,
  showUpgradeButton = true 
}: PremiumLockProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const router = useRouter()

  // Se é premium, mostra o conteúdo normalmente
  if (isPremium) {
    return <>{children}</>
  }

  // Se não é premium, mostra o bloqueio
  return (
    <>
      <div className="relative">
        {/* Overlay de bloqueio */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-purple-900/95 to-gray-900/95 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              Recurso Premium
            </h3>
            <p className="text-gray-300 mb-4">
              {description || `Acesso ao ${feature} disponível apenas para usuários premium`}
            </p>
            {showUpgradeButton && (
              <Button
                onClick={() => setShowUpgradeModal(true)}
                className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
              >
                <Crown className="w-5 h-5" />
                Desbloquear Agora
              </Button>
            )}
          </div>
        </div>

        {/* Conteúdo bloqueado (desfocado) */}
        <div className="pointer-events-none blur-sm opacity-50">
          {children}
        </div>
      </div>

      {/* Modal de Upgrade */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-yellow-500/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2 text-2xl">
              <Crown className="w-6 h-6 text-yellow-400" />
              Torne-se Premium
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Desbloqueie todos os recursos e potencialize seu tratamento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Benefícios Premium
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Acesso ilimitado a todas as funcionalidades</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Meditações guiadas exclusivas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Chat IA sem limites</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Relatórios detalhados de progresso</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Suporte prioritário</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Atualizações e novos recursos primeiro</span>
                </div>
              </CardContent>
            </Card>

            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 rounded-lg border border-green-500/20 text-center">
              <p className="text-sm text-gray-300 mb-2">Investimento mensal</p>
              <p className="text-4xl font-bold text-white mb-1">R$ 34,90</p>
              <p className="text-xs text-gray-400">Cancele quando quiser</p>
            </div>

            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
              <p className="text-sm text-blue-300 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <strong>Status do Pagamento:</strong> Aguardando confirmação
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Após a confirmação do pagamento da sua fatura, todos os recursos serão liberados automaticamente.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeModal(false)}
              className="border-gray-600 hover:bg-gray-800"
            >
              Fechar
            </Button>
            <Button
              onClick={() => {
                setShowUpgradeModal(false)
                router.push('/dashboard')
              }}
              className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              <CreditCard className="w-4 h-4" />
              Ver Status do Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Componente para bloquear botões individuais
export function PremiumButton({ 
  isPremium, 
  onClick, 
  children, 
  className = '',
  ...props 
}: any) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  if (!isPremium) {
    return (
      <>
        <Button
          onClick={() => setShowUpgradeModal(true)}
          className={`relative ${className}`}
          {...props}
        >
          <Lock className="w-4 h-4 mr-2" />
          {children}
        </Button>

        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-yellow-500/20">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Recurso Premium
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Esta funcionalidade está disponível apenas para usuários premium
              </DialogDescription>
            </DialogHeader>
            <div className="text-center py-6">
              <p className="text-gray-300 mb-4">
                Aguarde a confirmação do pagamento da sua fatura para desbloquear todos os recursos.
              </p>
              <Button
                onClick={() => setShowUpgradeModal(false)}
                className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                Entendi
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <Button onClick={onClick} className={className} {...props}>
      {children}
    </Button>
  )
}
