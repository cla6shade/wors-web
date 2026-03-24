"use client";

import { useState, useTransition } from "react";
import { saveSensorCards } from "@/actions/settings";
import type { SensorCardConfig } from "@wors/shared/settings";
import SensorCardForm from "./SensorCardForm";
import SensorCardPreview from "./SensorCardPreview";

export default function SensorCardsSection({
  defaultValue,
}: {
  defaultValue: SensorCardConfig[];
}) {
  const [cards, setCards] = useState<SensorCardConfig[]>(defaultValue);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSave() {
    startTransition(async () => {
      const result = await saveSensorCards(cards);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "저장되었습니다." });
      }
      setTimeout(() => setMessage(null), 3000);
    });
  }

  function addCard() {
    setCards([...cards, { type: "scalar", title: "", preparing: false, sensorId: "", unit: "" }]);
  }

  function removeCard(idx: number) {
    setCards(cards.filter((_, i) => i !== idx));
  }

  function updateCard(idx: number, card: SensorCardConfig) {
    setCards(cards.map((c, i) => (i === idx ? card : c)));
  }

  function moveCard(idx: number, direction: -1 | 1) {
    const target = idx + direction;
    if (target < 0 || target >= cards.length) return;
    const next = [...cards];
    [next[idx], next[target]] = [next[target], next[idx]];
    setCards(next);
  }

  return (
    <section className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">센서 카드</h3>
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
        {cards.map((card, idx) => (
          <div key={idx} className="rounded-md border p-4 flex gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  카드 {idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveCard(idx, -1)}
                    disabled={idx === 0}
                    className="h-8 w-8 rounded-md text-sm border hover:bg-accent disabled:opacity-30 flex items-center justify-center"
                  >
                    &uarr;
                  </button>
                  <button
                    onClick={() => moveCard(idx, 1)}
                    disabled={idx === cards.length - 1}
                    className="h-8 w-8 rounded-md text-sm border hover:bg-accent disabled:opacity-30 flex items-center justify-center"
                  >
                    &darr;
                  </button>
                  <button
                    onClick={() => removeCard(idx)}
                    className="h-8 px-2 rounded-md text-sm text-destructive border border-destructive/30 hover:bg-destructive/10"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <SensorCardForm card={card} onChange={(c) => updateCard(idx, c)} />
            </div>
            <div className="w-56 shrink-0 flex items-center">
              <SensorCardPreview card={card} />
            </div>
          </div>
        ))}

        <button
          onClick={addCard}
          className="h-10 rounded-md text-sm border border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-accent"
        >
          + 카드 추가
        </button>
      </div>
    </section>
  );
}
