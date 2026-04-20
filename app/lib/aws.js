import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY || '',
    secretAccessKey: process.env.SECRET_KEY || '',
  },
});

export const dynamoDB = DynamoDBDocumentClient.from(client);
export const TABLA_CUIDADORES = 'cuidagt-cuidadores';
export const TABLA_ADULTOS = 'cuidagt-adultos';
export const TABLA_ALERTAS = 'cuidagt-alertas';
export const TABLA_MOVIMIENTOS = 'cuidagt-movimientos';

export async function obtenerDireccion(lat, lng) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=es`
    );
    const data = await response.json();
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return null;
  } catch (error) {
    console.error('Error geocoding:', error);
    return null;
  }
}