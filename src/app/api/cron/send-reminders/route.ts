import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Inicializa o Supabase (use a chave SERVICE_ROLE para ter permissão total no backend)
// Você pega essa chave nas configurações do projeto no Supabase > API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuração do seu SMTP (que você já tem)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // true para 465, false para outras portas
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function GET() {
  try {
    // 1. Define a data de amanhã para buscar agendamentos
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0]; // Formato YYYY-MM-DD

    console.log(`🔍 Buscando consultas para: ${dateStr}`);

    // 2. Busca consultas agendadas para amanhã que AINDA NÃO foram notificadas
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        user_profiles!appointments_patient_id_fkey (
          name,
          email
        )
      `)
      .eq('appointment_date', dateStr)
      .eq('status', 'scheduled')
      .eq('reminder_sent', false); // Só pega quem não recebeu email ainda

    if (error) throw error;

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({ message: 'Nenhuma consulta para notificar amanhã.' });
    }

    console.log(`📧 Encontrados ${appointments.length} pacientes para notificar.`);

    // 3. Loop para enviar emails
    const emailPromises = appointments.map(async (apt: any) => {
      const patientName = apt.user_profiles?.name || 'Paciente';
      const patientEmail = apt.user_profiles?.email;

      if (!patientEmail) return null;

      // Conteúdo do Email
      const mailOptions = {
        from: `"ZentiaMind - Agendamentos" <${process.env.SMTP_USER}>`,
        to: patientEmail,
        subject: `Lembrete de Consulta - ${patientName}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #8b5cf6;">Olá, ${patientName}!</h2>
            <p>Este é um lembrete automático da sua consulta no <strong>ZentiaMind</strong>.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>📅 Data:</strong> ${new Date(apt.appointment_date).toLocaleDateString('pt-BR')}</p>
              <p><strong>⏰ Horário:</strong> ${apt.appointment_time}</p>
              <p><strong>📝 Tipo:</strong> ${apt.type}</p>
            </div>

            <p>Caso não possa comparecer, por favor, entre em contato para reagendar.</p>
            <br>
            <p style="font-size: 12px; color: #666;">Atenciosamente,<br>Equipe ZentiaMind</p>
          </div>
        `,
      };

      // Envia o email
      await transporter.sendMail(mailOptions);

      // 4. Marca no banco que o lembrete foi enviado (para não enviar de novo)
      await supabase
        .from('appointments')
        .update({ reminder_sent: true })
        .eq('id', apt.id);
        
      return patientEmail;
    });

    await Promise.all(emailPromises);

    return NextResponse.json({ 
      success: true, 
      message: `Emails enviados para ${appointments.length} pacientes.` 
    });

  } catch (error: any) {
    console.error('Erro no envio:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
