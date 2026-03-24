"use server";

import { revalidatePath } from "next/cache";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth";

export async function login(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const password = formData.get("password") as string;
  if (!password) {
    return { error: "비밀번호를 입력해주세요." };
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: "비밀번호가 올바르지 않습니다." };
  }
  await setSessionCookie();
  revalidatePath("/");
  return {};
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  revalidatePath("/");
}
