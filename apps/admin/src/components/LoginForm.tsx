"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-6">관리자 로그인</h1>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              required
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
