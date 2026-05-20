import { Suspense } from "react";
import { esClient } from "@/es7/client";
import { getAllSensorData } from "@/es7/search";
import { SensorCard } from "@wors/ui/sensor-card";
import { RangeBar } from "@wors/ui/range-bar";
import { createAngleIndicator } from "@wors/ui/direction";
import ReloadButton from "../ReloadButton";
import { readSettings } from "@wors/shared/settings";
import type { SensorCardConfig } from "@wors/shared/settings";

export function SensorSectionSkeleton() {
  return (
    <section className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[250px] rounded-lg bg-white/70 shadow-2xl animate-pulse" />
      ))}
    </section>
  );
}

async function SensorCards({ station, cards }: { station: string; cards: SensorCardConfig[] }) {
  const allData = await getAllSensorData(esClient, station);

  const getSensorValue = (key: string): number | undefined => {
    const value = allData[key]?.data?.value;
    return value !== undefined ? Number(Number(value).toFixed(1)) : undefined;
  };

  return (
    <section className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
      <div className="col-span-2 md:col-span-3 rounded-lg bg-white/50 backdrop-blur-sm px-6 py-4 text-slate-700">
        <p className="text-lg">본 기관에서 제공하는 관측 자료는 일반적인 정보 안내와 연구를 돕기 위한 참고용입니다. 자료의 정확성이나 최신성을 완벽히 보장하지 않으며, 법적·상업적 결정 또는 항해를 위한 단독 근거로 사용하기에는 부적절합니다. 따라서 본 자료를 활용하여 발생하는 결과나 손해에 대해 본 기관은 책임을 지지 않음을 알려드립니다.</p>
        <p className="text-base mt-1 text-slate-500">
          문의사항 및 의견 &rarr;{" "}
          <a href="mailto:kors@kiost.ac.kr" className="font-medium underline underline-offset-4 hover:text-slate-700">
            kors@kiost.ac.kr
          </a>
        </p>
      </div>
      {cards.map((card, index) => (
        <SensorCardRenderer key={index} config={card} getSensorValue={getSensorValue} />
      ))}
    </section>
  );
}

export default function SensorSection() {
  const settings = readSettings();
  const dashboard = settings.dashboard;

  if (!dashboard) return null;

  const now = new Date();

  return (
    <>
      <header className="text-left mb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">실시간 해양 정보</h1>
        <div className="text-slate-700 text-base mt-2 flex gap-2 justify-between md:justify-start items-center">
          <p>새로고침 시각: {now.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</p>
          <ReloadButton />
        </div>
      </header>

      <Suspense fallback={<SensorSectionSkeleton />}>
        <SensorCards station={dashboard.station} cards={dashboard.sensorCards} />
      </Suspense>
    </>
  );
}

function SensorCardRenderer({
  config,
  getSensorValue,
}: {
  config: SensorCardConfig;
  getSensorValue: (key: string) => number | undefined;
}) {
  if (config.preparing) {
    return (
      <SensorCard>
        <SensorCard.Header title={config.title} />
        <div className="flex flex-col items-center justify-center pb-4 text-xl sm:text-2xl font-bold grow">
          준비중
        </div>
      </SensorCard>
    );
  }

  switch (config.type) {
    case "vector": {
      const direction = getSensorValue(config.directionSensorId);
      const scale = getSensorValue(config.scaleSensorId);
      return (
        <SensorCard>
          <SensorCard.Header title={config.title} />
          <SensorCard.Vector
            direction={direction}
            scale={scale}
            unit={config.unit}
            variant={config.variant}
            caption={createAngleIndicator(direction, config.directionSuffix, config.reverseDirection)}
          />
        </SensorCard>
      );
    }
    case "scalar": {
      const value = getSensorValue(config.sensorId);
      return (
        <SensorCard>
          <SensorCard.Header title={config.title} />
          <SensorCard.Scalar value={value} unit={config.unit} />
        </SensorCard>
      );
    }
    case "range": {
      let value = getSensorValue(config.sensorId);
      if (value !== undefined && config.valueDivisor) {
        value = Number((value / config.valueDivisor).toFixed(1));
      }
      return (
        <SensorCard>
          <SensorCard.Header title={config.title} />
          <div className="flex flex-col gap-3 sm:gap-4 px-6">
            <div className="w-full h-12 flex items-center pt-4">
              <RangeBar range={{ start: config.rangeStart, end: config.rangeEnd }} value={value} unit={config.unit} />
            </div>
            <div className="h-6 w-full justify-between flex text-slate-600 text-sm">
              <p>{config.rangeStart}{config.unit}</p>
              <p>{config.rangeEnd}{config.unit}</p>
            </div>
            <SensorCard.Scalar value={value} unit={config.unit} />
          </div>
        </SensorCard>
      );
    }
  }
}
