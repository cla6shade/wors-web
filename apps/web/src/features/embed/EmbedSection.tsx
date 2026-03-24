import type { YouTubeEmbedConfig } from "@wors/shared/settings";

export default function EmbedSection({ embeds }: { embeds: YouTubeEmbedConfig[] }) {
  if (embeds.length === 0) return null;

  return (
    <section className="w-full rounded-lg overflow-hidden flex flex-col py-8 gap-12">
      <header className="text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight">실시간 영상</h1>
      </header>
      {embeds.map((embed, index) => (
        <div key={index}>
          <h2 className="text-slate-900 font-semibold text-xl">{embed.title}</h2>
          <div className="relative w-full pb-[56.25%] h-0 mt-4">
            <iframe
              src={embed.url}
              title="YouTube video player"
              frameBorder="0"
              loading="lazy"
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      ))}
    </section>
  );
}
