import { decode, sign, verify } from 'hono/jwt';
import type { TokenHeader } from 'hono/utils/jwt/jwt';
import type { JWTPayload } from 'hono/utils/jwt/types';
import type { Auth } from './types';

interface Payload extends JWTPayload, Auth {}

export async function createJwtToken(payload: Payload, secret: string): Promise<string> {
  const token = await sign(payload, secret, 'HS256');
  return token;
}

interface DecodedPayload extends JWTPayload, Auth {}

export async function verifyJwtToken(token: string, secret: string): Promise<DecodedPayload> {
  const decodedPayload = await verify(token, secret, 'HS256');
  return decodedPayload as DecodedPayload;
}

export function decodeJwtToken(token: string): { header: TokenHeader; payload: DecodedPayload } {
  const data = decode(token);
  return { header: data.header, payload: data.payload as DecodedPayload };
}
