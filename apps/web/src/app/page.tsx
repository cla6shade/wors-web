import Image from "next/image";
import { Suspense } from "react";
import AutoRefresh from "@/components/AutoRefresh";
import SensorSection, { SensorSectionSkeleton } from "@/features/sensor/section/SensorSection";
import EmbedSection from "@/features/embed/EmbedSection";
import { readSettings } from "@wors/shared/settings";

export const dynamic = 'force-dynamic'

export default async function Home() {
  const settings = readSettings();
  const dashboard = settings.dashboard;
  const title = dashboard?.title || "왕돌초 해양과학기지";
  const pageRefreshMin = dashboard?.pageRefreshIntervalMin ?? 10;
  const embeds = dashboard?.youtubeEmbeds ?? [];

  return (
    <div className="flex flex-col min-h-screen relative bg-cover bg-center bg-no-repeat font-noto-sans-kr" style={{ backgroundImage: 'url(/wors/왕돌초.webp)' }}>
      <AutoRefresh intervalMs={pageRefreshMin * 60_000} />
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
      <div className="relative">
        <div className="flex flex-col px-4 md:px-8">
          <nav className="w-full max-w-7xl mx-auto flex items-center justify-between py-6 border-b border-slate-200 mb-12">
            <div className="font-bold text-slate-900 flex gap-3 md:gap-6 items-center">
              <Image
                src="/wors/logo.svg"
                alt="WORS Logo"
                width={120}
                height={40}
                className="w-auto h-[40px]"
                priority
              />
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
            </div>
          </nav>

          <main className="w-full max-w-7xl mx-auto flex flex-col gap-12 pt-4">

            <Suspense fallback={<SensorSectionSkeleton />}>
              <SensorSection />
            </Suspense>
            <EmbedSection embeds={embeds} />
          </main>
        </div>

        <footer className="w-full mt-20 pt-12 pb-8 bg-black/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto md:px-6 ">
            <div className="text-center md:text-left">
              <p className="text-slate-100 font-semibold mb-1">한국해양과학기술원 (KIOST)</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-slate-200 text-sm">&copy; {new Date().getFullYear()} Korea Institute of Ocean Science & Technology</p>
              <p className="text-slate-200 text-xs mt-1">All rights reserved</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
