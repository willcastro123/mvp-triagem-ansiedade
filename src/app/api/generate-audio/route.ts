import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { script } = await request.json()

    if (!script || typeof script !== 'string') {
      return NextResponse.json(
        { error: 'Roteiro inválido' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key não configurada' },
        { status: 500 }
      )
    }

    // Inicializar OpenAI apenas quando necessário (dentro da função)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Gerar áudio usando a API de Text-to-Speech da OpenAI
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova', // Voz feminina suave e natural
      input: script,
      speed: 0.9, // Velocidade um pouco mais lenta para meditação
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('Erro ao gerar áudio:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar áudio: ' + error.message },
      { status: 500 }
    )
  }
}
