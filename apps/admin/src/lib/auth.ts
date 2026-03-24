import { cookies } from "next/headers";

const SESSION_COOKIE = "wors-admin-session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

function getSecret(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD is not set");
  return password;
}

async function sign(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function verify(payload: string, signature: string, secret: string): Promise<boolean> {
  const expected = await sign(payload, secret);
  return expected === signature;
}

export async function createSessionCookie(): Promise<string> {
  const secret = getSecret();
  const payload = JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE });
  const signature = await sign(payload, secret);
  return `${btoa(payload)}.${signature}`;
}

export async function setSessionCookie(): Promise<void> {
  const value = await createSessionCookie();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/wors-edit",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: SESSION_COOKIE, path: "/wors-edit" });
}

export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie) return false;

  try {
    const [payloadB64, signature] = cookie.value.split(".");
    if (!payloadB64 || !signature) return false;

    const secret = getSecret();
    const payload = atob(payloadB64);
    const valid = await verify(payload, signature, secret);
    if (!valid) return false;

    const { exp } = JSON.parse(payload) as { exp: number };
    return exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
