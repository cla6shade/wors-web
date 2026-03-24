import { readSettings } from "@wors/shared/settings";
import { getVisits, getTodayVisits, getMonthlyVisits, getMonthlyVisitHistory } from "@wors/shared/visitors";
import GeneralSection from "@/components/sections/GeneralSection";
import SensorsSection from "@/components/sections/SensorsSection";
import SensorCardsSection from "@/components/sections/SensorCardsSection";
import YouTubeEmbedsSection from "@/components/sections/YouTubeEmbedsSection";
import VisitorStatsSection from "@/components/sections/VisitorStatsSection";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const settings = readSettings();
  const dashboard = settings.dashboard;
  const dailyData = getVisits(30);
  const monthlyData = getMonthlyVisitHistory(12);
  const todayCount = getTodayVisits();
  const monthlyCount = getMonthlyVisits();

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-bold">왕돌초 페이지 관리</h2>

      <VisitorStatsSection dailyData={dailyData} monthlyData={monthlyData} todayCount={todayCount} monthlyCount={monthlyCount} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 items-start">
        <div className="flex flex-col gap-8">
          <GeneralSection
            defaultValue={{
              title: dashboard?.title ?? "",
              station: dashboard?.station ?? "",
              refreshIntervalMin: dashboard?.refreshIntervalMin ?? 10,
              pageRefreshIntervalMin: dashboard?.pageRefreshIntervalMin ?? 10,
            }}
          />
          <YouTubeEmbedsSection defaultValue={dashboard?.youtubeEmbeds ?? []} />
          <SensorsSection defaultValue={dashboard?.sensors ?? {}} />
        </div>

        <SensorCardsSection defaultValue={dashboard?.sensorCards ?? []} />
      </div>
    </div>
  );
}
