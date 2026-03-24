"use client";

import { logout } from "@/actions/auth";

export default function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      로그아웃
    </button>
  );
}
