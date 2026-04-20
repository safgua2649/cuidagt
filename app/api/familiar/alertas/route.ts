import { NextResponse } from 'next/server';
import { dynamoDB, TABLA_ALERTAS } from '../../../lib/aws';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

export async function GET() {
  try {
    const result = await dynamoDB.send(new ScanCommand({
      TableName: TABLA_ALERTAS,
      Limit: 100,
    }));

    const alertas = (result.Items || [])
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ success: true, alertas });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}