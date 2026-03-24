"use client";

import { useState, useTransition } from "react";
import { saveSensors } from "@/actions/settings";
import type { SensorMap } from "@wors/shared/settings";

type SensorEntry = { id: string; label: string };
type StationEntry = { name: string; sensors: SensorEntry[] };

function toArray(map: SensorMap): StationEntry[] {
  return Object.entries(map).map(([name, sensors]) => ({
    name,
    sensors: Object.entries(sensors).map(([id, label]) => ({ id, label })),
  }));
}

function toRecord(arr: StationEntry[]): SensorMap {
  const result: SensorMap = {};
  for (const station of arr) {
    const sensors: Record<string, string> = {};
    for (const s of station.sensors) {
      if (s.id) sensors[s.id] = s.label;
    }
    if (station.name) result[station.name] = sensors;
  }
  return result;
}

export default function SensorsSection({
  defaultValue,
}: {
  defaultValue: SensorMap;
}) {
  const [stations, setStations] = useState<StationEntry[]>(() => toArray(defaultValue));
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSave() {
    startTransition(async () => {
      const result = await saveSensors(toRecord(stations));
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "저장되었습니다." });
      }
      setTimeout(() => setMessage(null), 3000);
    });
  }

  function addStation() {
    setStations([...stations, { name: "", sensors: [] }]);
  }

  function removeStation(idx: number) {
    setStations(stations.filter((_, i) => i !== idx));
  }

  function updateStationName(idx: number, name: string) {
    setStations(stations.map((s, i) => (i === idx ? { ...s, name } : s)));
  }

  function addSensor(stationIdx: number) {
    setStations(
      stations.map((s, i) =>
        i === stationIdx ? { ...s, sensors: [...s.sensors, { id: "", label: "" }] } : s,
      ),
    );
  }

  function removeSensor(stationIdx: number, sensorIdx: number) {
    setStations(
      stations.map((s, i) =>
        i === stationIdx
          ? { ...s, sensors: s.sensors.filter((_, j) => j !== sensorIdx) }
          : s,
      ),
    );
  }

  function updateSensor(stationIdx: number, sensorIdx: number, field: "id" | "label", value: string) {
    setStations(
      stations.map((s, i) =>
        i === stationIdx
          ? {
              ...s,
              sensors: s.sensors.map((sen, j) =>
                j === sensorIdx ? { ...sen, [field]: value } : sen,
              ),
            }
          : s,
      ),
    );
  }

  return (
    <details className="group rounded-lg border bg-card">
      <summary className="flex items-start justify-between gap-4 p-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-muted-foreground transition-transform group-open:rotate-90">&#9654;</span>
            받아올 자료 목록
          </h3>
          <p className="text-sm text-muted-foreground mt-1 ml-6">기지에서 받아올 센서 ID를 지정합니다. 왼쪽 빈 칸은 센서 아이디, 오른쪽 빈 칸은 센서가 나타내는 값입니다.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {message && (
            <span className={`text-sm ${message.type === "error" ? "text-destructive" : "text-green-600"}`}>
              {message.text}
            </span>
          )}
          <button
            onClick={(e) => { e.preventDefault(); handleSave(); }}
            disabled={isPending}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "저장 중..." : "저장"}
          </button>
        </div>
      </summary>

      <div className="flex flex-col gap-6 px-6 pb-6">
        {stations.map((station, si) => (
          <div key={si} className="rounded-md border p-4">
            <div className="flex items-center gap-3 mb-3">
              <input
                value={station.name}
                onChange={(e) => updateStationName(si, e.target.value)}
                placeholder="기지 이름"
                className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={() => removeStation(si)}
                className="h-9 px-3 rounded-md text-sm text-destructive border border-destructive/30 hover:bg-destructive/10"
              >
                삭제
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {station.sensors.map((sensor, sei) => (
                <div key={sei} className="flex items-center gap-2">
                  <input
                    value={sensor.id}
                    onChange={(e) => updateSensor(si, sei, "id", e.target.value)}
                    placeholder="센서 ID"
                    className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    value={sensor.label}
                    onChange={(e) => updateSensor(si, sei, "label", e.target.value)}
                    placeholder="라벨"
                    className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={() => removeSensor(si, sei)}
                    className="h-9 w-9 shrink-0 rounded-md text-sm text-destructive border border-destructive/30 hover:bg-destructive/10 flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addSensor(si)}
              className="mt-3 h-8 px-3 rounded-md text-sm border border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-accent"
            >
              + 센서 추가
            </button>
          </div>
        ))}

        <button
          onClick={addStation}
          className="h-10 rounded-md text-sm border border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-accent"
        >
          + 기지 추가
        </button>
      </div>
    </details>
  );
}
