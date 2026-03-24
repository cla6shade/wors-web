import { cn } from "./cn";

type RangeBarProps = {
  range: { start: number; end: number };
  value?: number;
  unit?: string;
  className?: string;
  height?: number;
};

export function RangeBar({
  range,
  value,
  className,
  height = 10,
}: RangeBarProps) {
  const { start, end } = range;

  const hasRange = Number.isFinite(start) && Number.isFinite(end) && end > start;
  if (!hasRange) return null;

  const hasValue = typeof value === "number" && Number.isFinite(value);
  const clamp = (x: number, a: number, b: number) => Math.min(Math.max(x, a), b);

  const rawT = hasValue ? (value - start) / (end - start) : 0;
  const clampedT = clamp(rawT, 0, 1);

  const KNOB_SIZE = 16;
  const LABEL_SAFE_PADDING = 18;
  const percent = clampedT * 100;

  const labelLeft = `clamp(${LABEL_SAFE_PADDING}px, ${percent}%, calc(100% - ${LABEL_SAFE_PADDING}px))`;
  const knobLeft = `clamp(${KNOB_SIZE / 2}px, ${percent}%, calc(100% - ${KNOB_SIZE / 2}px))`;

  void labelLeft; // available for future use

  return (
    <div className={cn("w-full", className)}>
      <div
        className="relative w-full rounded-full border bg-white/60 overflow-hidden"
        style={{ height }}
      >
        <div className="absolute inset-y-0 left-0 w-full">
          <div
            className="h-full rounded-full bg-linear-to-r from-sky-300 to-blue-500"
            style={{ width: `${percent}%` }}
          />
        </div>
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
