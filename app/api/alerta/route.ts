import { NextResponse } from 'next/server';
import { dynamoDB, TABLA_ALERTAS, obtenerDireccion } from '../../lib/aws';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = 'CG-' + Date.now();

    let direccion = '';
    if (body.lat && body.lng && body.lat !== 0 && body.lng !== 0) {
      direccion = await obtenerDireccion(body.lat, body.lng) || '';
    }

    const item = {
      id,
      tipo: body.tipo || '',
      subtipo: body.subtipo || '',
      nombre: body.nombre || '',
      telefono: body.telefono || '',
      lat: body.lat || 0,
      lng: body.lng || 0,
      direccion,
      descripcion: body.descripcion || '',
      contactoFamiliar: body.contactoFamiliar || '',
      numeroCaso: body.numeroCaso || id,
      timestamp: body.timestamp || new Date().toISOString(),
    };

    await dynamoDB.send(new PutCommand({
      TableName: TABLA_ALERTAS,
      Item: item,
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `Analiza esta alerta de adulto mayor y responde SOLO con JSON.
Formato: {"score": 8, "razon": "Panico activado urgente"}
Alerta: tipo=${body.tipo}, subtipo=${body.subtipo}, descripcion=${body.descripcion}
Criterios: 10=vida en peligro, 7-9=urgente, 4-6=precaucion, 1-3=informativo`,
        }],
      }),
    });

    const aiData = await response.json();
    const aiText = aiData.content?.[0]?.text || '{"score":5,"razon":"Sin clasificar"}';
    const clean = aiText.replace(/```json|```/g, '').trim();
    const aiResult = JSON.parse(clean);

    if (body.contactoFamiliar) {
      const googleMaps = body.lat && body.lng ? `https://maps.google.com/?q=${body.lat},${body.lng}` : '';
      const mensajeWhatsApp = `🆘 *CuidaGT — ${body.tipo?.toUpperCase()}*

👴 *Quien:* ${body.nombre || 'Adulto Mayor'}
📋 *Caso:* ${item.numeroCaso}
🕐 *Hora:* ${new Date().toLocaleTimeString('es-GT')}

📍 *Direccion:* ${direccion || 'Capturando...'}
${googleMaps ? `🗺️ *Ver en mapa:* ${googleMaps}` : ''}

🤖 *AI:* ${aiResult.razon}

${body.subtipo === 'panico' ? '🚨 EMERGENCIA — Ve inmediatamente o llama al 110/122' : '⚠️ Verifica el estado del adulto mayor'}

_CuidaGT — Protegiendo a tus seres queridos_ 💙`;

      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_WHATSAPP_FROM;
      const credentials = btoa(`${accountSid}:${authToken}`);
      const tel = body.contactoFamiliar.toString().replace(/\D/g, '');
      const telFormateado = tel.startsWith('502') ? `+${tel}` : `+502${tel}`;

      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: from || '',
          To: `whatsapp:${telFormateado}`,
          Body: mensajeWhatsApp,
        }),
      });
    }

    return NextResponse.json({ success: true, id, direccion, score: aiResult.score, razon: aiResult.razon });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}