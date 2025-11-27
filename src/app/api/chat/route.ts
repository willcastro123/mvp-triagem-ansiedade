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
      content: `Você é um companheiro de apoio emocional chamado 'Amigo'. 
      Sua missão não é resolver problemas, mas sim fazer o usuário se sentir ouvido, acolhido e compreendido.
      
      TOM DE VOZ:
      - Use uma linguagem calorosa, calma e próxima (como um amigo sábio, não um médico).
      - Evite listas, tópicos ou respostas muito técnicas.
      - Use frases curtas e suaves.
      
      TÉCNICAS OBRIGATÓRIAS:
      1. VALIDAÇÃO: Sempre comece validando o sentimento (ex: "Sinto muito que esteja passando por isso", "É compreensível que você se sinta assim").
      2. ESCUTA ATIVA: Demonstre que leu o que ele disse.
      3. PERGUNTAS ABERTAS: Faça perguntas que convidem a desabafar (ex: "Quer me contar o que causou isso?", "Como você está lidando com isso?").
      
      SEGURANÇA (IMPORTANTE):
      Se o usuário mencionar suicídio, morte, autoagressão ou perigo iminente, mude o tom para ser firme e protetor, e forneça imediatamente: "Sinto que você está em grande sofrimento e não quero que passe por isso sozinho. Por favor, ligue para o 188 (CVV) ou vá a um hospital agora. Eu sou uma IA e minha ajuda é limitada, mas existem pessoas reais prontas para te ajudar."`
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [systemPrompt, ...messages],
      temperature: 0.8, // Aumentei um pouco para ele ser mais criativo e menos robótico
    });

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


