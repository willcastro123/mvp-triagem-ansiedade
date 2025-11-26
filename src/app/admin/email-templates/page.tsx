"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Plus, Edit, Eye, Save, X, Copy, Check, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { getSupabaseClient } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'

interface EmailTemplate {
  id: string
  name: string
  type: string
  subject: string
  html_content: string
  variables: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function EmailTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [copiedVar, setCopiedVar] = useState<string | null>(null)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testVariables, setTestVariables] = useState<Record<string, string>>({})
  const [isSendingTest, setIsSendingTest] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    subject: '',
    html_content: '',
    variables: [] as string[]
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Erro ao carregar templates:', error)
      toast.error('Erro ao carregar templates')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject,
      html_content: template.html_content,
      variables: template.variables
    })
    setIsEditing(true)
  }

  const handleCreate = () => {
    setFormData({
      name: '',
      type: '',
      subject: '',
      html_content: '',
      variables: []
    })
    setIsCreating(true)
  }

  const handleSave = async () => {
    try {
      const supabase = getSupabaseClient()

      if (isCreating) {
        const { error } = await supabase
          .from('email_templates')
          .insert({
            ...formData,
            updated_at: new Date().toISOString()
          })

        if (error) throw error
        toast.success('Template criado com sucesso!')
      } else if (selectedTemplate) {
        const { error } = await supabase
          .from('email_templates')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedTemplate.id)

        if (error) throw error
        toast.success('Template atualizado com sucesso!')
      }

      setIsEditing(false)
      setIsCreating(false)
      setSelectedTemplate(null)
      loadTemplates()
    } catch (error) {
      console.error('Erro ao salvar template:', error)
      toast.error('Erro ao salvar template')
    }
  }

  const handlePreview = (template: EmailTemplate) => {
    let html = template.html_content
    
    // Substituir variáveis por valores de exemplo
    template.variables.forEach(variable => {
      const exampleValues: Record<string, string> = {
        name: 'João Silva',
        resetLink: 'https://exemplo.com/reset-password?token=abc123',
        productName: 'Plano Premium',
        amount: '99,90',
        date: new Date().toLocaleDateString('pt-BR'),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        paymentLink: 'https://exemplo.com/payment/123',
        title: 'Notificação Importante',
        message: 'Esta é uma mensagem de exemplo para visualização do template.',
        subject: 'Assunto do E-mail'
      }
      
      const value = exampleValues[variable] || `[${variable}]`
      html = html.replace(new RegExp(`{{${variable}}}`, 'g'), value)
    })
    
    setPreviewHtml(html)
    setShowPreview(true)
  }

  const handleTestEmail = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    
    // Inicializar variáveis de teste com valores padrão
    const defaultValues: Record<string, string> = {
      name: 'João Silva',
      resetLink: `${window.location.origin}/reset-password?token=test123`,
      productName: 'Plano Premium',
      amount: '99,90',
      date: new Date().toLocaleDateString('pt-BR'),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
      paymentLink: `${window.location.origin}/payment/test`,
      title: 'Notificação de Teste',
      message: 'Esta é uma mensagem de teste do sistema de e-mails.',
      subject: 'E-mail de Teste'
    }
    
    const vars: Record<string, string> = {}
    template.variables.forEach(v => {
      vars[v] = defaultValues[v] || `Teste ${v}`
    })
    
    setTestVariables(vars)
    setShowTestDialog(true)
  }

  const sendTestEmail = async () => {
    if (!testEmail || !selectedTemplate) {
      toast.error('Preencha o e-mail de destino')
      return
    }

    setIsSendingTest(true)
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType: selectedTemplate.type,
          email: testEmail,
          variables: testVariables
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar e-mail')
      }

      toast.success('E-mail de teste enviado com sucesso!')
      setShowTestDialog(false)
      setTestEmail('')
    } catch (error: any) {
      console.error('Erro ao enviar e-mail de teste:', error)
      toast.error(error.message || 'Erro ao enviar e-mail de teste')
    } finally {
      setIsSendingTest(false)
    }
  }

  const extractVariables = (html: string): string[] => {
    const regex = /{{(\w+)}}/g
    const matches = html.matchAll(regex)
    const vars = new Set<string>()
    
    for (const match of matches) {
      vars.add(match[1])
    }
    
    return Array.from(vars)
  }

  const handleHtmlChange = (html: string) => {
    setFormData({
      ...formData,
      html_content: html,
      variables: extractVariables(html)
    })
  }

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(`{{${variable}}}`)
    setCopiedVar(variable)
    setTimeout(() => setCopiedVar(null), 2000)
    toast.success('Variável copiada!')
  }

  const templateTypes = [
    { value: 'password_reset', label: 'Redefinição de Senha' },
    { value: 'welcome', label: 'Boas-vindas / Cadastro' },
    { value: 'purchase_confirmation', label: 'Confirmação de Compra' },
    { value: 'invoice_pending', label: 'Fatura em Aberto' },
    { value: 'notification', label: 'Notificação Geral' },
    { value: 'appointment_reminder', label: 'Lembrete de Consulta' },
    { value: 'medication_reminder', label: 'Lembrete de Medicamento' },
    { value: 'custom', label: 'Personalizado' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Mail className="w-8 h-8 text-purple-600" />
                Templates de E-mail
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os templates de e-mail automáticos do sistema
              </p>
            </div>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Template
          </Button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {templateTypes.find(t => t.value === template.type)?.label || template.type}
                    </CardDescription>
                  </div>
                  <Badge variant={template.is_active ? "default" : "secondary"}>
                    {template.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Assunto:</p>
                    <p className="text-sm truncate">{template.subject}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Variáveis:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="col-span-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      onClick={() => handleTestEmail(template)}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Testar Envio
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit/Create Dialog */}
        <Dialog open={isEditing || isCreating} onOpenChange={(open) => {
          if (!open) {
            setIsEditing(false)
            setIsCreating(false)
            setSelectedTemplate(null)
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isCreating ? 'Criar Novo Template' : 'Editar Template'}
              </DialogTitle>
              <DialogDescription>
                Configure o template de e-mail. Use variáveis no formato {`{{variavel}}`} para personalização.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Template</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Redefinição de Senha"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    disabled={!isCreating}
                  >
                    <option value="">Selecione um tipo</option>
                    {templateTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Assunto do E-mail</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ex: Redefinição de Senha - Zentia Mind"
                />
              </div>

              <div>
                <Label htmlFor="html_content">Conteúdo HTML</Label>
                <Textarea
                  id="html_content"
                  value={formData.html_content}
                  onChange={(e) => handleHtmlChange(e.target.value)}
                  placeholder="Cole aqui o HTML do template..."
                  className="font-mono text-sm min-h-[300px]"
                />
              </div>

              {formData.variables.length > 0 && (
                <div>
                  <Label>Variáveis Detectadas</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.variables.map((variable) => (
                      <Button
                        key={variable}
                        variant="outline"
                        size="sm"
                        onClick={() => copyVariable(variable)}
                        className="gap-2"
                      >
                        {copiedVar === variable ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {`{{${variable}}}`}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Clique para copiar a variável
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Template
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setIsCreating(false)
                    setSelectedTemplate(null)
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Visualização do Template</DialogTitle>
              <DialogDescription>
                Preview com dados de exemplo
              </DialogDescription>
            </DialogHeader>
            <div 
              className="border rounded-lg p-4 bg-white"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </DialogContent>
        </Dialog>

        {/* Test Email Dialog */}
        <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Testar Envio de E-mail</DialogTitle>
              <DialogDescription>
                Envie um e-mail de teste para verificar o template
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="test-email">E-mail de Destino</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>

              {selectedTemplate && selectedTemplate.variables.length > 0 && (
                <div>
                  <Label>Variáveis do Template</Label>
                  <div className="space-y-2 mt-2">
                    {selectedTemplate.variables.map((variable) => (
                      <div key={variable}>
                        <Label htmlFor={`var-${variable}`} className="text-xs text-muted-foreground">
                          {variable}
                        </Label>
                        <Input
                          id={`var-${variable}`}
                          value={testVariables[variable] || ''}
                          onChange={(e) => setTestVariables({
                            ...testVariables,
                            [variable]: e.target.value
                          })}
                          placeholder={`Valor para ${variable}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={sendTestEmail} 
                  className="flex-1"
                  disabled={isSendingTest}
                >
                  {isSendingTest ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar E-mail de Teste
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTestDialog(false)
                    setTestEmail('')
                  }}
                  disabled={isSendingTest}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
