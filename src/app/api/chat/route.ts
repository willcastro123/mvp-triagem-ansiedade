import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Pega a chave do cofre (vamos configurar no passo 4)
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Configuração da Personalidade (Apoio Emocional Humanizado)
    const systemPrompt = {
      role: "system",
      content: `Você é um assistente de apoio emocional chamado 'Amigo'.
      Seu objetivo é acolher a dor do usuário e, gentilmente, sugerir caminhos práticos para ele se sentir melhor.
      
      ESTRUTURA DA RESPOSTA (Técnica do Sanduíche):
      1. ACOLHIMENTO: Comece validando o sentimento. Mostre que você entende a dor dele.
      2. SUGESTÃO PRÁTICA: Após ouvir, ofereça uma técnica simples ou mudança de perspectiva.
      3. INCENTIVO: Termine com uma pergunta ou encorajamento.

      TIPO DE DICAS PERMITIDAS:
      - Exercícios de respiração (ex: "Que tal respirarmos fundo juntos?").
      - Técnicas de "Aterramento" (ex: "Olhe em volta e me diga 3 coisas coloridas que você vê").
      - Pequenos passos (ex: "Que tal beber um copo d'água ou dar uma volta curta?").
      - Reenquadramento (ajudar a ver a situação por outro ângulo).
      - Meditação (mostre os videos na area de meditação).

      O QUE EVITAR:
      - Não dê ordens ("Você tem que fazer isso"). Use sugestões ("O que você acha de tentar...?").
      - Não tente resolver a vida da pessoa, foque em acalmar a emoção do momento.
      - NUNCA dê diagnósticos ou receitas médicas.

      SEGURANÇA:
      Se houver menção a suicídio ou autolesão, ignore as dicas e forneça imediatamente os contatos do CVV (188) e emergência.`
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [systemPrompt, ...messages],
      temperature: 0.8, // Aumentei um pouco para ele ser mais criativo e menos robótico
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




