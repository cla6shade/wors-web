"use client";

import { useState, useTransition } from "react";
import { saveYoutubeEmbeds } from "@/actions/settings";
import type { YouTubeEmbedConfig } from "@wors/shared/settings";

export default function YouTubeEmbedsSection({
  defaultValue,
}: {
  defaultValue: YouTubeEmbedConfig[];
}) {
  const [embeds, setEmbeds] = useState<YouTubeEmbedConfig[]>(defaultValue);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSave() {
    startTransition(async () => {
      const result = await saveYoutubeEmbeds(embeds);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "저장되었습니다." });
      }
      setTimeout(() => setMessage(null), 3000);
    });
  }

  function addEmbed() {
    setEmbeds([...embeds, { title: "", url: "" }]);
  }

  function removeEmbed(idx: number) {
    setEmbeds(embeds.filter((_, i) => i !== idx));
  }

  function updateEmbed(idx: number, field: "title" | "url", value: string) {
    setEmbeds(embeds.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));
  }

  return (
    <section className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">YouTube 임베드</h3>
        <div className="flex items-center gap-3">
          {message && (
            <span className={`text-sm ${message.type === "error" ? "text-destructive" : "text-green-600"}`}>
              {message.text}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {embeds.map((embed, idx) => (
          <div key={idx} className="rounded-md border p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">임베드 {idx + 1}</span>
              <button
                onClick={() => removeEmbed(idx)}
                className="h-8 px-2 rounded-md text-sm text-destructive border border-destructive/30 hover:bg-destructive/10"
              >
                삭제
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">제목</label>
                <input
                  value={embed.title}
                  onChange={(e) => updateEmbed(idx, "title", e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">URL</label>
                <textarea
                  value={embed.url}
                  onChange={(e) => updateEmbed(idx, "url", e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  rows={3}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground resize-none"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addEmbed}
          className="h-10 rounded-md text-sm border border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-accent"
        >
          + 임베드 추가
        </button>
      </div>
    </section>
  );
}
