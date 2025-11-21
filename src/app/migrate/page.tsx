"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function MigrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [migrationResult, setMigrationResult] = useState<any>(null)

  const handleMigration = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/migrate-users', {
        method: 'POST'
      })

      const result = await response.json()
      setMigrationResult(result)

      if (result.success) {
        toast.success('Migração concluída!', {
          description: result.message
        })
      } else {
        toast.error('Erro na migração', {
          description: result.error
        })
      }
    } catch (error) {
      console.error('Erro ao migrar:', error)
      toast.error('Erro ao executar migração')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Migração de Dados
          </h1>
          <p className="text-muted-foreground">
            Migrar usuários da tabela <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">users</code> para <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">user_profiles</code>
          </p>
        </div>

        <Card className="border-orange-200 dark:border-orange-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <CardTitle className="text-orange-600 dark:text-orange-400">Atenção</CardTitle>
            </div>
            <CardDescription>
              Esta operação irá:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Copiar todos os usuários de <code>users</code> para <code>user_profiles</code></li>
              <li>Ignorar usuários que já existem em <code>user_profiles</code></li>
              <li>Manter a tabela <code>users</code> intacta (você pode deletá-la manualmente depois)</li>
              <li>Senhas precisarão ser redefinidas pelos usuários</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Executar Migração
            </CardTitle>
            <CardDescription>
              Clique no botão abaixo para iniciar a migração de dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleMigration}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Migrando dados...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Iniciar Migração
                </>
              )}
            </Button>

            {migrationResult && (
              <Card className={migrationResult.success ? 'border-green-200 dark:border-green-900' : 'border-red-200 dark:border-red-900'}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {migrationResult.success ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <CardTitle className="text-green-600 dark:text-green-400">Resultado da Migração</CardTitle>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <CardTitle className="text-red-600 dark:text-red-400">Erro na Migração</CardTitle>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">{migrationResult.message}</p>
                  {migrationResult.migrated !== undefined && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{migrationResult.migrated}</p>
                        <p className="text-xs text-muted-foreground">Migrados</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{migrationResult.skipped}</p>
                        <p className="text-xs text-muted-foreground">Ignorados</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{migrationResult.total}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              <CardTitle className="text-red-600 dark:text-red-400">Deletar Tabela Users</CardTitle>
            </div>
            <CardDescription>
              Após confirmar que a migração foi bem-sucedida
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Para deletar a tabela <code>users</code>, acesse o dashboard do Supabase e execute:
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <code className="text-sm text-red-600 dark:text-red-400">
                DROP TABLE users CASCADE;
              </code>
            </div>
            <p className="text-xs text-muted-foreground">
              ⚠️ Esta operação é irreversível. Certifique-se de que todos os dados foram migrados corretamente antes de executar.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
