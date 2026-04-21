import { NextResponse } from 'next/server';
import { dynamoDB, TABLA_ALERTAS } from '../../lib/aws';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

export async function GET() {
  try {
    const result = await dynamoDB.send(new ScanCommand({
      TableName: TABLA_ALERTAS,
      Limit: 500,
    }));

    const perfiles = result.Items || [];
    const perfilesUnicos: Record<string, any> = {};
    
    perfiles.forEach((a: any) => {
      if (a.contactoFamiliar && !perfilesUnicos[a.contactoFamiliar]) {
        perfilesUnicos[a.contactoFamiliar] = {
          nombre: a.nombre,
          telefonoFamiliar: a.contactoFamiliar,
        };
      }
    });

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;
    const credentials = btoa(`${accountSid}:${authToken}`);

    const hora = new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
    const fecha = new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' });

    const resultados = [];

    for (const perfil of Object.values(perfilesUnicos)) {
      const mensajeBienestar = `🌅 *Buenos días, ${perfil.nombre}!*

Son las ${hora} del ${fecha}.

¿Cómo amaneciste hoy? ¿Te sientes bien? 😊

Responde este mensaje para que tu familiar sepa que estás bien. 💙

_CuidaGT — Siempre contigo_ 👴`;

      try {
        const tel = perfil.telefonoFamiliar.toString().replace(/\D/g, '');
        const telFormateado = tel.startsWith('502') ? `+${tel}` : `+502${tel}`;

        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              From: from || '',
              To: `whatsapp:${telFormateado}`,
              Body: mensajeBienestar,
            }),
          }
        );

        const data = await response.json();
        resultados.push({
          nombre: perfil.nombre,
          telefono: telFormateado,
          status: data.status || 'enviado',
        });

      } catch (e: any) {
        resultados.push({
          nombre: perfil.nombre,
          telefono: perfil.telefonoFamiliar,
          status: 'error',
          error: e.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      enviados: resultados.length,
      resultados,
      hora: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Error bienestar:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}