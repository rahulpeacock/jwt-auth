export async function sendVerificationEmailToUser(email: string, token: string) {
  console.log(`Verification token for ${email} is ${token}`);
}

export async function sendForgotPasswordEmail(email: string, token: string) {
  // reset-password-url: {env.CLIENT_URL}/auth/reset-password?token={token}
  console.log(`Verification token for ${email} is ${token}`);
}
