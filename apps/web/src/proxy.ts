import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { recordVisit } from "@wors/shared/visitors";

function toKstDate(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(kst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** KST 기준 다음 날 자정의 UTC Date */
function kstEndOfDay(dateStr: string): Date {
  // dateStr = "2026-03-24" → KST 다음 날 00:00:00 = UTC 전날 15:00:00
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1) - 9 * 60 * 60 * 1000);
}

export function proxy(request: NextRequest) {
  const today = toKstDate();
  const visited = request.cookies.get("wors_visited")?.value;

  const response = NextResponse.next();

  if (visited !== today) {
    recordVisit(today);
    response.cookies.set("wors_visited", today, {
      httpOnly: false,
      sameSite: "strict",
      expires: kstEndOfDay(today),
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/"],
};
