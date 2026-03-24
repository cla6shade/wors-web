import type { Metadata } from "next";
import { Geist, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { verifySession } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";
import LogoutButton from "@/components/LogoutButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WORS Admin",
  description: "왕돌초 해양과학기지 관리자",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAuthenticated = await verifySession();

  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${notoSansKr.variable} font-[family-name:var(--font-noto-sans-kr)]`}>
        {isAuthenticated ? (
          <div className="min-h-screen">
            <header className="border-b">
              <div className="mx-auto px-8 h-14 flex items-center justify-between">
                <h1 className="font-bold text-lg">WORS Dashboard</h1>
                <LogoutButton />
              </div>
            </header>
            <main className="mx-auto px-8 py-8">
              {children}
            </main>
          </div>
        ) : (
          <LoginForm />
        )}
      </body>
    </html>
  );
}
