import SensorSection from "@/features/sensor/section/SensorSection";
import Image from "next/image";

export const dynamic = 'force-dynamic'

export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen relative bg-cover bg-center bg-no-repeat font-noto-sans-kr" style={{ backgroundImage: 'url(/wors/왕돌초.webp)' }}>
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
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">왕돌초 해양과학기지(테스트 페이지)</h1>
            </div>
          </nav>

          <main className="w-full max-w-7xl mx-auto flex flex-col gap-12 pt-4">

            <SensorSection />
            <section className="w-full rounded-lg overflow-hidden flex flex-col py-8 gap-12">
              <header className="text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight">실시간 영상</h1>
                <p className="text-slate-300 text-lg"></p>
              </header>
              <div>
                <h2 className="text-slate-900 font-semibold text-xl">서쪽</h2>
                <div className="relative w-full pb-[56.25%] h-0 mt-4">
                  <iframe
                    src="https://www.youtube.com/embed/BpwqbwXtgI8?si=ond-IK9fdSIoGNpg&amp;controls=1&amp;autoplay=1&amp;mute=1"
                    title="YouTube video player"
                    frameBorder="0"
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
              <div>
                <h2 className="text-slate-900 font-semibold text-xl">수중 20m</h2>
                <div className="relative w-full pb-[56.25%] h-0 mt-4">
                  <iframe
                    src="https://www.youtube.com/embed/cRs2LzuiXRw?si=ivQAjFc0M964hvDx&amp;controls=1&amp;autoplay=1&amp;mute=1"
                    title="YouTube video player"
                    frameBorder="0"
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </section>
          </main>
        </div>

        <footer className="w-full mt-20 pt-12 pb-8 bg-black/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto m:px-6 ">
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
