import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json({ error: 'ID da consulta necessário' }, { status: 400 });
    }

    // 1. Busca os dados da consulta específica
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        user_profiles!appointments_patient_id_fkey (
          name,
          email
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (error || !appointment) {
      return NextResponse.json({ error: 'Consulta não encontrada' }, { status: 404 });
    }

    const patientEmail = appointment.user_profiles?.email;
    const patientName = appointment.user_profiles?.name;

    if (!patientEmail) {
      return NextResponse.json({ error: 'Paciente sem email cadastrado' }, { status: 400 });
    }

    // 2. Envia o Email
    await transporter.sendMail({
      from: `"ZentiaMind" <${process.env.SMTP_USER}>`,
      to: patientEmail,
      subject: `Lembrete de Consulta - ${patientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #8b5cf6;">Olá, ${patientName}!</h2>
            <p>Estamos enviando este lembrete sobre sua consulta agendada.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>📅 Data:</strong> ${new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}</p>
              <p><strong>⏰ Horário:</strong> ${appointment.appointment_time}</p>
              <p><strong>📝 Tipo:</strong> ${appointment.type}</p>
            </div>
            <p style="font-size: 12px; color: #666;">Atenciosamente,<br>Equipe ZentiaMind</p>
        </div>
      `,
    });

    // 3. Atualiza status de enviado
    await supabase
      .from('appointments')
      .update({ reminder_sent: true })
      .eq('id', appointmentId);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Erro ao enviar:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
