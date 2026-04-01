import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const TOKEN_EXPIRY = "24h";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    sub: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string,
): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: Number(payload.sub),
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function clearTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
}
