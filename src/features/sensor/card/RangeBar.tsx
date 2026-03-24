import { cn } from "@/lib/utils";

type Range = {
  start: number;
  end: number;
};

type RangeBarProps = {
  range: Range;
  value?: number;
  unit?: string;
  className?: string;

  height?: number;
};

export function RangeBar({
  range,
  value,
  unit = "",
  className,
  height = 10,
}: RangeBarProps) {
  const { start, end } = range;

  const hasRange = Number.isFinite(start) && Number.isFinite(end) && end > start;
  const hasValue = typeof value === "number" && Number.isFinite(value);

  if (!hasRange) return null;

  const clamp = (x: number, a: number, b: number) => Math.min(Math.max(x, a), b);

  const rawT = hasValue ? (value - start) / (end - start) : 0;
  const clampedT = clamp(rawT, 0, 1);

  // ===== Boundary-safe positioning =====
  // knob: h-4 w-4 => 16px
  const KNOB_SIZE = 16;
  // label: 말풍선이 좌우로 삐져나가지 않게 최소 여유(px). 필요하면 조절.
  const LABEL_SAFE_PADDING = 18;

  const percent = clampedT * 100;

  // label은 말풍선 폭이 가변이라 "대략 padding" 기반으로 안전하게 clamp
  const labelLeft = `clamp(
    ${LABEL_SAFE_PADDING}px,
    ${percent}%,
    calc(100% - ${LABEL_SAFE_PADDING}px)
  )`;

  // knob는 폭이 고정(16px)이므로 반지름만큼 정확히 clamp
  const knobLeft = `clamp(
    ${KNOB_SIZE / 2}px,
    ${percent}%,
    calc(100% - ${KNOB_SIZE / 2}px)
  )`;
  // ====================================

  return (
    <div className={cn("w-full", className)}>

      {/* Track */}
      <div
        className="relative w-full rounded-full border bg-white/60 overflow-hidden"
        style={{ height }}
      >
        {/* Fill */}
        <div className="absolute inset-y-0 left-0 w-full">
          <div
            className="h-full rounded-full bg-linear-to-r from-sky-300 to-blue-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Knob */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{ left: knobLeft }}
        >
          <div className="h-4 w-4 rounded-full border bg-white shadow" />
        </div>
      </div>
    </div>
  );
}
