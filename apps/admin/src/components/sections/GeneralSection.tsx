"use client";

import { useState, useTransition } from "react";
import { saveGeneral } from "@/actions/settings";

export default function GeneralSection({
  defaultValue,
}: {
  defaultValue: { title: string; station: string; refreshIntervalMin: number; pageRefreshIntervalMin: number };
}) {
  const [title, setTitle] = useState(defaultValue.title);
  const [station, setStation] = useState(defaultValue.station);
  const [refreshIntervalMin, setRefreshIntervalMin] = useState(defaultValue.refreshIntervalMin);
  const [pageRefreshIntervalMin, setPageRefreshIntervalMin] = useState(defaultValue.pageRefreshIntervalMin);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSave() {
    startTransition(async () => {
      const result = await saveGeneral({ title, station, refreshIntervalMin, pageRefreshIntervalMin });
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "저장되었습니다." });
      }
      setTimeout(() => setMessage(null), 3000);
    });
  }

  return (
    <section className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">기본 정보</h3>
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
      <div className="grid gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-medium">
            페이지 제목
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="왕돌초 해양과학기지"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="station" className="text-sm font-medium">
            관측소 이름
          </label>
          <input
            id="station"
            value={station}
            onChange={(e) => setStation(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="refreshIntervalMin" className="text-sm font-medium">
            자료 갱신 주기 (분)
          </label>
          <input
            id="refreshIntervalMin"
            type="number"
            min={1}
            value={refreshIntervalMin}
            onChange={(e) => setRefreshIntervalMin(Number(e.target.value))}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="pageRefreshIntervalMin" className="text-sm font-medium">
            페이지 새로고침 주기 (분)
          </label>
          <input
            id="pageRefreshIntervalMin"
            type="number"
            min={1}
            value={pageRefreshIntervalMin}
            onChange={(e) => setPageRefreshIntervalMin(Number(e.target.value))}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
    </section>
  );
}
