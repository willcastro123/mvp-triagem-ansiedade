"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<any[]>([
    {
      id: 1,
      text: 'Olá! Sou seu assistente virtual de apoio emocional. Como posso ajudá-lo hoje?',
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputMessage.trim()) return

    // 1. Cria a mensagem do usuário e mostra na tela imediatamente
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    // Atualiza a lista de mensagens na tela
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage(''); // Limpa o campo

    try {
      // 2. Prepara o histórico para a IA entender o contexto
      // A IA precisa saber quem é 'user' e quem é 'assistant' (bot)
      const apiMessages = newMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // 3. Chama o nosso arquivo "route.ts"
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      const data = await response.json();

      if (data.reply) {
        // 4. Cria a mensagem da IA com a resposta real
        const botResponse = {
          id: Date.now() + 1,
          text: data.reply,
          sender: 'bot',
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, botResponse]);
      }

    } catch (error) {
      console.error("Erro ao chamar a IA:", error);
      toast.error("Ops, tive um problema para responder. Tente novamente.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-pink-600" />
              Chat IA
            </h1>
            <p className="text-muted-foreground mt-1">
              Converse com seu assistente virtual de apoio
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <Card className="flex-1 mb-4 overflow-hidden flex flex-col">
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-pink-100' : 'text-muted-foreground'}`}>
                    {new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1"
          />
          <Button 
            type="submit"
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
