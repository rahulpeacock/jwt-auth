import { env } from '@/api/lib/env';
import { encodeBase32LowerCaseNoPadding, encodeBase32UpperCaseNoPadding } from '@oslojs/encoding';
import { createJwtToken } from './jwt';

export async function createVerificationToken(email: string): Promise<string> {
  const verificationToken = await createJwtToken<{ email: string }>({ email }, '1d', env.VERIFICATION_TOKEN);
  return verificationToken;
}

export function generateRandomOTP(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const code = encodeBase32UpperCaseNoPadding(bytes);
  return code;
}

export function generateForgotPasswordToken(): string {
  const tokenBytes = new Uint8Array(20);
  crypto.getRandomValues(tokenBytes);
  const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();
  return token;
}
