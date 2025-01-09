import { type JWTVerifyResult, SignJWT, jwtVerify } from 'jose';

const alg = 'HS256';
const _secret = (val: string) => new TextEncoder().encode(val);

export async function createJwtToken<T>(payload: T, expirationTime: string, secret: string): Promise<string> {
  const jwtToken = await new SignJWT({ 'urn:example:claim': true, ...payload })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer('urn:example:issuer')
    .setAudience('urn:example:audience')
    .setExpirationTime(expirationTime)
    .sign(_secret(secret));

  return jwtToken;
}

export async function verifyJwtToken<T>(token: string, secret: string): Promise<JWTVerifyResult<T>> {
  const decodedToken = await jwtVerify<T>(token, _secret(secret), {
    issuer: 'urn:example:issuer',
    audience: 'urn:example:audience',
  });
  return decodedToken;
}
