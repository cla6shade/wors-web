"use client";

import type { SensorCardConfig } from "@wors/shared/settings";
import { SensorCard } from "@wors/ui/sensor-card";
import { RangeBar } from "@wors/ui/range-bar";
import { createAngleIndicator } from "@wors/ui/direction";

const MOCK_SCALAR = 12.3;
const MOCK_DIRECTION = 225;
const MOCK_SCALE = 5.2;

export default function SensorCardPreview({ card }: { card: SensorCardConfig }) {
  const title = card.title || "제목 없음";

  if (card.preparing) {
    return (
      <SensorCard className="w-full min-h-64 scale-75 origin-center">
        <SensorCard.Header title={title} />
        <div className="flex flex-col items-center justify-center pb-4 text-xl sm:text-2xl font-bold grow">
          준비중
        </div>
      </SensorCard>
    );
  }

  switch (card.type) {
    case "scalar":
      return (
        <SensorCard className="w-full min-h-64 scale-75 origin-center">
          <SensorCard.Header title={title} />
          <SensorCard.Scalar value={MOCK_SCALAR} unit={card.unit} />
        </SensorCard>
      );

    case "vector":
      return (
        <SensorCard className="w-full min-h-64 scale-75 origin-center">
          <SensorCard.Header title={title} />
          <SensorCard.Vector
            direction={MOCK_DIRECTION}
            scale={MOCK_SCALE}
            unit={card.unit}
            variant={card.variant}
            caption={createAngleIndicator(MOCK_DIRECTION, card.directionSuffix, card.reverseDirection)}
          />
        </SensorCard>
      );

    case "range": {
      const mockValue = card.rangeStart + (card.rangeEnd - card.rangeStart) * 0.6;
      return (
        <SensorCard className="w-full min-h-64 scale-75 origin-center">
          <SensorCard.Header title={title} />
          <div className="flex flex-col gap-3 sm:gap-4 px-6">
            <div className="w-full h-12 flex items-center pt-4">
              <RangeBar range={{ start: card.rangeStart, end: card.rangeEnd }} value={mockValue} unit={card.unit} />
            </div>
            <div className="h-6 w-full justify-between flex text-slate-600 text-sm">
              <p>{card.rangeStart}{card.unit}</p>
              <p>{card.rangeEnd}{card.unit}</p>
            </div>
            <SensorCard.Scalar value={Number(mockValue.toFixed(1))} unit={card.unit} />
          </div>
        </SensorCard>
      );
    }
  }
}
