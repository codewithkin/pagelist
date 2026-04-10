import { SignJWT, jwtVerify } from "jose";

const ALG = "HS256";

export interface JwtPayload {
  sub: string;    // userId
  sid: string;    // sessionId
}

export async function signToken(
  payload: JwtPayload,
  secret: string,
  expiresIn = "7d",
): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

export async function verifyToken(
  token: string,
  secret: string,
): Promise<JwtPayload | null> {
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key, { algorithms: [ALG] });
    return { sub: payload.sub as string, sid: payload["sid"] as string };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, "argon2id");
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return Bun.password.verify(password, hash);
}
