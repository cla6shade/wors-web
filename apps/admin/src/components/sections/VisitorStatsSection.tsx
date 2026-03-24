"use client";

import type { DailyVisits, MonthlyVisits } from "@wors/shared/visitors";

export default function VisitorStatsSection({
  dailyData,
  monthlyData,
  todayCount,
  monthlyCount,
}: {
  dailyData: DailyVisits[];
  monthlyData: MonthlyVisits[];
  todayCount: number;
  monthlyCount: number;
}) {
  const filledDaily = fillDates(dailyData, 30);
  const dailyMax = Math.max(...filledDaily.map((d) => d.count), 1);

  const filledMonthly = fillMonths(monthlyData, 12);
  const monthlyMax = Math.max(...filledMonthly.map((d) => d.count), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Daily */}
      <section className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">일별 방문자</h3>
            <p className="text-sm text-muted-foreground">최근 30일</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{todayCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">오늘</p>
          </div>
        </div>

        <BarChart
          data={filledDaily}
          max={dailyMax}
          getKey={(d) => d.date}
          getLabel={(d) => {
            const dt = new Date(d.date);
            return `${dt.getMonth() + 1}/${dt.getDate()} — ${d.count}명`;
          }}
          isHighlighted={(d) => d.date === new Date().toISOString().slice(0, 10)}
        />

        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          <span>{formatDate(filledDaily[0]?.date)}</span>
          <span>{formatDate(filledDaily[filledDaily.length - 1]?.date)}</span>
        </div>
      </section>

      {/* Monthly */}
      <section className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">월별 방문자</h3>
            <p className="text-sm text-muted-foreground">최근 12개월</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{monthlyCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">이번 달</p>
          </div>
        </div>

        <BarChart
          data={filledMonthly}
          max={monthlyMax}
          getKey={(d) => d.month}
          getLabel={(d) => {
            const [y, m] = d.month.split("-");
            return `${y}년 ${Number(m)}월 — ${d.count}명`;
          }}
          isHighlighted={(d) => d.month === new Date().toISOString().slice(0, 7)}
        />

        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          <span>{formatMonth(filledMonthly[0]?.month)}</span>
          <span>{formatMonth(filledMonthly[filledMonthly.length - 1]?.month)}</span>
        </div>
      </section>
    </div>
  );
}

function BarChart<T extends { count: number }>({
  data,
  max,
  getKey,
  getLabel,
  isHighlighted,
}: {
  data: T[];
  max: number;
  getKey: (d: T) => string;
  getLabel: (d: T) => string;
  isHighlighted: (d: T) => boolean;
}) {
  return (
    <div className="flex items-end gap-px h-40">
      {data.map((item) => {
        const height = item.count > 0 ? Math.max((item.count / max) * 100, 4) : 0;
        const highlighted = isHighlighted(item);

        return (
          <div
            key={getKey(item)}
            className="flex-1 flex flex-col items-center justify-end h-full group relative"
          >
            <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-10">
              <div className="bg-foreground text-background text-xs rounded px-2 py-1 whitespace-nowrap">
                {getLabel(item)}
              </div>
            </div>
            <div
              className={`w-full rounded-sm transition-colors ${highlighted ? "bg-primary" : "bg-primary/40 hover:bg-primary/70"}`}
              style={{ height: `${height}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

function fillDates(data: DailyVisits[], days: number): DailyVisits[] {
  const map = new Map(data.map((d) => [d.date, d.count]));
  const result: DailyVisits[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    result.push({ date: dateStr, count: map.get(dateStr) ?? 0 });
  }
  return result;
}

function fillMonths(data: MonthlyVisits[], months: number): MonthlyVisits[] {
  const map = new Map(data.map((d) => [d.month, d.count]));
  const result: MonthlyVisits[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    result.push({ month: monthStr, count: map.get(monthStr) ?? 0 });
  }
  return result;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatMonth(monthStr?: string): string {
  if (!monthStr) return "";
  const [, m] = monthStr.split("-");
  return `${Number(m)}월`;
}
