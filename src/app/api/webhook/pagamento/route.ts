import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// 1. Configuração e Verificação das Variáveis
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERRO CRÍTICO: Variáveis de ambiente do Supabase faltando!');
}

const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
  },
});

export async function POST(req: Request) {
  console.log('\n--- 🔒 INICIANDO WEBHOOK SEGURO (KEOTO) ---');

  // ============================================================
  // 🛡️ BLOCO DE SEGURANÇA (NOVO)
  // ============================================================
  const { searchParams } = new URL(req.url);
  const secretRecebido = searchParams.get('secret'); 
  const secretCorreto = process.env.KEOTO_WEBHOOK_SECRET;

  // Se a senha não estiver no .env ou não bater com a URL: BLOQUEIA
  if (!secretCorreto || secretRecebido !== secretCorreto) {
    console.error(`⛔ ACESSO NEGADO! Secret inválido ou ausente.`);
    return NextResponse.json({ error: 'Acesso Negado: Token Inválido' }, { status: 401 });
  }
  // ============================================================
  
  try {
    const body = await req.json();
    console.log('📦 Payload Recebido e Autorizado'); 

    // 1. Email
    const realEmail = 
      body.customer?.email || 
      body.email || 
      '';

    // 2. Status
    const rawStatus = 
      body.status || 
      body.event || 
      'UNKNOWN';

    // 3. Nome
    const nome = 
      body.customer?.name || 
      body.name || 
      'Cliente Keoto';

    // 4. Telefone
    const phone = 
      body.customer?.phone_number || 
      body.customer?.phone || 
      '';

    console.log(`🔎 Dados: ${realEmail} | Status: ${rawStatus}`);

    if (!realEmail) {
      return NextResponse.json({ message: 'Email não encontrado.' });
    }

    // Validação de Status
    const successKeywords = ['PAID', 'APPROVED', 'COMPLETED', 'CONFIRMED'];
    const isApproved = successKeywords.some(keyword => 
      String(rawStatus).toUpperCase().includes(keyword)
    );
    
    if (!isApproved) {
      console.log(`⚠️ Status ignorado: "${rawStatus}"`);
      return NextResponse.json({ message: 'Status ignorado' });
    }
    
    console.log(`2️⃣ Compra Aprovada.`);

    // PASSO 3: Gerar credenciais
    const randomId = crypto.randomBytes(4).toString('hex');
    const tempEmail = `acesso_${randomId}@portal.interno`;
    const tempPassword = crypto.randomBytes(6).toString('hex');

    // PASSO 4: Criar Usuário no Auth
    console.log('4️⃣ Criando Auth...');
    const { data
