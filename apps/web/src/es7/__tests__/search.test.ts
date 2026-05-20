import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockReadSettings } = vi.hoisted(() => ({
  mockReadSettings: vi.fn(),
}));

vi.mock("@wors/shared/settings", () => ({
  readSettings: () => mockReadSettings(),
}));

import { getAllSensorData } from "../search";
import {
  STATION,
  orphanDashboard,
  preparingScalarDashboard,
  tempScalarDashboard,
  windVectorDashboard,
} from "./fixtures";
import { buildClient, doc } from "./utils";

describe("getAllSensorData card-level fallback", () => {
  beforeEach(() => {
    mockReadSettings.mockReset();
  });

  it("returns 1st fetch values when all sensors are normal", async () => {
    mockReadSettings.mockReturnValue(windVectorDashboard());

    const client = buildClient((tagId, before) => {
      if (before) throw new Error(`should not fall back for ${tagId}`);
      if (tagId === "WD")
        return doc({ tagId: "WD", value: 180, logdate: "2026-01-01T00:10:00Z" });
      if (tagId === "WS")
        return doc({ tagId: "WS", value: 5, logdate: "2026-01-01T00:11:00Z" });
      return null;
    });

    const out = await getAllSensorData(client, STATION);
    expect(out.WD.data.value).toBe(180);
    expect(out.WS.data.value).toBe(5);
  });

  it("falls back both vector sensors when one is 0, using max logdate as T", async () => {
    mockReadSettings.mockReturnValue(windVectorDashboard());

    const T_WD = "2026-01-01T00:10:00Z";
    const T_WS = "2026-01-01T00:11:00Z"; // 더 큼 → fallback 기준점
    const client = buildClient((tagId, before) => {
      if (!before) {
        if (tagId === "WD") return doc({ tagId: "WD", value: 180, logdate: T_WD });
        if (tagId === "WS") return doc({ tagId: "WS", value: 0, logdate: T_WS });
        return null;
      }
      expect(before).toBe(T_WS);
      if (tagId === "WD")
        return doc({ tagId: "WD", value: 170, logdate: "2026-01-01T00:09:00Z" });
      if (tagId === "WS")
        return doc({ tagId: "WS", value: 3, logdate: "2026-01-01T00:09:30Z" });
      return null;
    });

    const out = await getAllSensorData(client, STATION);
    expect(out.WD.data.value).toBe(170);
    expect(out.WS.data.value).toBe(3);
  });

  it("triggers fallback when value is NaN-ish (non-numeric value)", async () => {
    mockReadSettings.mockReturnValue(tempScalarDashboard());

    const T = "2026-01-01T00:10:00Z";
    const client = buildClient((tagId, before) => {
      if (!before)
        return doc({
          tagId,
          // @ts-expect-error — 의도적으로 비숫자 주입해 NaN 트리거
          value: "n/a",
          logdate: T,
        });
      expect(before).toBe(T);
      return doc({ tagId, value: 22, logdate: "2026-01-01T00:09:00Z" });
    });

    const out = await getAllSensorData(client, STATION);
    expect(out.TEMP.data.value).toBe(22);
  });

  it("falls back scalar card when value is 0", async () => {
    mockReadSettings.mockReturnValue(tempScalarDashboard());

    const T = "2026-01-01T00:10:00Z";
    const client = buildClient((tagId, before) => {
      if (!before) return doc({ tagId, value: 0, logdate: T });
      expect(before).toBe(T);
      return doc({ tagId, value: 22, logdate: "2026-01-01T00:09:00Z" });
    });

    const out = await getAllSensorData(client, STATION);
    expect(out.TEMP.data.value).toBe(22);
  });

  it("skips preparing cards (no fallback even at 0)", async () => {
    mockReadSettings.mockReturnValue(preparingScalarDashboard());

    const T = "2026-01-01T00:10:00Z";
    const client = buildClient((tagId, before) => {
      if (before) throw new Error("preparing card should not trigger fallback");
      return doc({ tagId, value: 0, logdate: T });
    });

    const out = await getAllSensorData(client, STATION);
    expect(out.TEMP.data.value).toBe(0);
  });

  it("keeps 1st result when fallback returns null", async () => {
    mockReadSettings.mockReturnValue(tempScalarDashboard());

    const T = "2026-01-01T00:10:00Z";
    const client = buildClient((tagId, before) => {
      if (!before) return doc({ tagId, value: 0, logdate: T });
      return null;
    });

    const out = await getAllSensorData(client, STATION);
    expect(out.TEMP.data.value).toBe(0);
  });

  it("does not fall back sensors not bound to any card", async () => {
    mockReadSettings.mockReturnValue(orphanDashboard());

    const T = "2026-01-01T00:10:00Z";
    const client = buildClient((tagId, before) => {
      if (before) throw new Error("orphan sensor should not fall back");
      return doc({ tagId, value: 0, logdate: T });
    });

    const out = await getAllSensorData(client, STATION);
    expect(out.ORPHAN.data.value).toBe(0);
  });

  it("triggers fallback when one sensor result is null but another provides T", async () => {
    mockReadSettings.mockReturnValue(windVectorDashboard());

    const T_WD = "2026-01-01T00:10:00Z";
    const client = buildClient((tagId, before) => {
      if (!before) {
        if (tagId === "WD") return doc({ tagId: "WD", value: 180, logdate: T_WD });
        if (tagId === "WS") return null;
        return null;
      }
      expect(before).toBe(T_WD);
      if (tagId === "WD")
        return doc({ tagId: "WD", value: 170, logdate: "2026-01-01T00:09:00Z" });
      if (tagId === "WS")
        return doc({ tagId: "WS", value: 4, logdate: "2026-01-01T00:09:30Z" });
      return null;
    });

    const out = await getAllSensorData(client, STATION);
    expect(out.WD.data.value).toBe(170);
    expect(out.WS.data.value).toBe(4);
  });

  it("performs fallback only once per card (no recursion even if fallback is still 0)", async () => {
    mockReadSettings.mockReturnValue(tempScalarDashboard());

    let callCount = 0;
    const T = "2026-01-01T00:10:00Z";
    const client = buildClient((tagId, before) => {
      callCount += 1;
      return doc({ tagId, value: 0, logdate: before ?? T });
    });

    const out = await getAllSensorData(client, STATION);
    expect(out.TEMP.data.value).toBe(0);
    expect(callCount).toBe(2); // 1차 + fallback 1회만
  });
});
