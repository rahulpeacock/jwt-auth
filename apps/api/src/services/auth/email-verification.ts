export async function sendVerificationEmailToUser(email: string, token: string) {
  console.log(`Verification token for ${email} is ${token}`);
}
