import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Pega a chave do cofre (vamos configurar no passo 4)
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Configuração da Personalidade (Apoio Emocional)
    const systemPrompt = {
      role: "system",
      content: `Você é um assistente de apoio emocional empático e acolhedor.
      REGRAS:
      1. Valide os sentimentos do usuário.
      2. Seja breve e faça perguntas gentis.
      3. Nunca dê diagnósticos médicos.
      4. Se o usuário mencionar suicídio ou perigo imediato, oriente a buscar o CVV (188) ou emergência.`
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modelo rápido e barato
      messages: [systemPrompt, ...messages],
    });

    const reply = completion.choices[0].message.content;

    return NextResponse.json({ reply });
    
  } catch (error: any) {
    // ISSO VAI MOSTRAR O ERRO REAL NOS LOGS DA VERCEL
    console.error("ERRO DETALHADO DA OPENAI:", error); 
    
    // Isso manda o erro para o navegador (para você ver no Inspecionar)
    return NextResponse.json(
      { error: "Erro interno", details: error.message }, 
      { status: 500 }
    );
  }
}

