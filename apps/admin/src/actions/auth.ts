"use server";

import { revalidatePath } from "next/cache";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { getClientIp, checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

export async function login(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const ip = await getClientIp();
  const { allowed, retryAfterSec } = checkRateLimit(ip);
  if (!allowed) {
    const min = Math.ceil((retryAfterSec ?? 0) / 60);
    return { error: `로그인 시도가 너무 많습니다. ${min}분 후 다시 시도해주세요.` };
  }

  const password = formData.get("password") as string;
  if (!password) {
    return { error: "비밀번호를 입력해주세요." };
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: "비밀번호가 올바르지 않습니다." };
  }

  resetRateLimit(ip);
  await setSessionCookie();
  revalidatePath("/");
  return {};
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  revalidatePath("/");
}
