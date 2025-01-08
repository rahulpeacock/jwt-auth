import { env } from '@/api/lib/env';
import { createJwtToken } from './jwt';

export async function sendVerificationEmailToUser(email: string, token: string) {
  console.log(`Verification token for ${email} is ${token}`);
}

export async function createVerificationToken(email: string): Promise<string> {
  const verificationToken = await createJwtToken<{ email: string }>({ email }, '2d', env.VERIFICATION_TOKEN);
  return verificationToken;
}
