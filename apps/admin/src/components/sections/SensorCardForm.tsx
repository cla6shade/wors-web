"use client";

import type { SensorCardConfig } from "@wors/shared/settings";

const CARD_TYPE_LABELS: Record<SensorCardConfig["type"], string> = {
  scalar: "스칼라",
  vector: "벡터",
  range: "범위",
};

const VARIANT_LABELS: Record<"wind" | "wave" | "current", string> = {
  wind: "바람",
  wave: "파도",
  current: "조류",
};

function defaultForType(type: SensorCardConfig["type"], prev: SensorCardConfig): SensorCardConfig {
  const base = { title: prev.title, preparing: prev.preparing };
  switch (type) {
    case "scalar":
      return { ...base, type: "scalar", sensorId: "", unit: "" };
    case "vector":
      return {
        ...base,
        type: "vector",
        directionSensorId: "",
        scaleSensorId: "",
        unit: "",
        variant: "wind",
        directionSuffix: "",
      };
    case "range":
      return { ...base, type: "range", sensorId: "", unit: "", rangeStart: 0, rangeEnd: 100 };
  }
}

export default function SensorCardForm({
  card,
  onChange,
}: {
  card: SensorCardConfig;
  onChange: (card: SensorCardConfig) => void;
}) {
  function update<K extends keyof SensorCardConfig>(field: K, value: SensorCardConfig[K]) {
    onChange({ ...card, [field]: value } as SensorCardConfig);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Type & Common */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">타입</label>
          <select
            value={card.type}
            onChange={(e) => onChange(defaultForType(e.target.value as SensorCardConfig["type"], card))}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {Object.entries(CARD_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">제목</label>
          <input
            value={card.title}
            onChange={(e) => update("title", e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={card.preparing}
          onChange={(e) => update("preparing", e.target.checked)}
          className="rounded"
        />
        준비중
      </label>

      {/* Type-specific fields */}
      {card.type === "scalar" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="센서 ID" value={card.sensorId} onChange={(v) => onChange({ ...card, sensorId: v })} />
          <Field label="단위" value={card.unit} onChange={(v) => onChange({ ...card, unit: v })} />
        </div>
      )}

      {card.type === "vector" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="방향 센서 ID" value={card.directionSensorId} onChange={(v) => onChange({ ...card, directionSensorId: v })} />
            <Field label="크기 센서 ID" value={card.scaleSensorId} onChange={(v) => onChange({ ...card, scaleSensorId: v })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="단위" value={card.unit} onChange={(v) => onChange({ ...card, unit: v })} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">유형</label>
              <select
                value={card.variant}
                onChange={(e) => onChange({ ...card, variant: e.target.value as "wind" | "wave" | "current" })}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.entries(VARIANT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <Field label="방향 접미사" value={card.directionSuffix} onChange={(v) => onChange({ ...card, directionSuffix: v })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={card.reverseDirection ?? false}
              onChange={(e) => onChange({ ...card, reverseDirection: e.target.checked })}
              className="rounded"
            />
            방향 반전
          </label>
        </>
      )}

      {card.type === "range" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="센서 ID" value={card.sensorId} onChange={(v) => onChange({ ...card, sensorId: v })} />
            <Field label="단위" value={card.unit} onChange={(v) => onChange({ ...card, unit: v })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <NumberField label="범위 시작" value={card.rangeStart} onChange={(v) => onChange({ ...card, rangeStart: v })} />
            <NumberField label="범위 끝" value={card.rangeEnd} onChange={(v) => onChange({ ...card, rangeEnd: v })} />
            <NumberField
              label="값 나누기"
              value={card.valueDivisor ?? 0}
              onChange={(v) => onChange({ ...card, valueDivisor: v || undefined })}
              placeholder="선택사항"
            />
          </div>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder={placeholder}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
      />
    </div>
  );
}
