import { RotateCcw } from "lucide-react";
import { SensorCard } from "../card/SensorCard";
import { createAngleIndicator } from "../utils/direction";
import { RangeBar } from "../card/RangeBar";
import { Client } from "@opensearch-project/opensearch";
import { getAllSensorData } from "@/es7/search";
import ReloadButton from "../ReloadButton";

export default async function SensorSection() {
  const client = new Client({
    node: process.env.ES7_HOST,
    auth: {
      username: process.env.ES7_USERNAME!,
      password: process.env.ES7_PASSWORD!,
    },
    ssl: {
      rejectUnauthorized: false,
    },
  });

  const allData = await getAllSensorData(client, '왕돌초');
  console.log(allData);

  const getSensorValue = (key: string): number | undefined => {
    const value = allData[key]?.data?.value;
    return value !== undefined ? Number(Number(value).toFixed(1)) : undefined;
  };

  const date = allData['WDC_HMP_TP1']?.date;
  const temp = getSensorValue('WDC_HMP_TP1');
  const windSpeed = getSensorValue('WDC_WDM_WS1');
  const windDir = getSensorValue('WDC_WDM_WD1');
  const waterTemp = getSensorValue('WDC_CTD2_EC');
  const visibility = getSensorValue('WDC_PWV_VIS1');

  return (
    <>
      <header className="text-left mb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">실시간 해양 정보</h1>
        <div className="text-slate-700 text-base mt-2 flex gap-2 justify-between md:justify-start items-center">
          <p>업데이트 일시: {date?.toLocaleString()}</p>
          <ReloadButton />
        </div>
      </header>


      <section className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">

        <SensorCard>
          <SensorCard.Header title="풍향/풍속" />
          <SensorCard.Vector
            direction={windDir}
            scale={windSpeed}
            unit="m/s"
            caption={createAngleIndicator(windDir, "풍")}
          />
        </SensorCard>

        <SensorCard>
         <SensorCard.Header title="파고/파향" />
         <div className="flex flex-col items-center justify-center pb-4 text-xl sm:text-2xl font-bold grow">준비중</div>
         </SensorCard>

        <SensorCard>
         <SensorCard.Header title="유속/유향" />
         <div className="flex flex-col items-center justify-center pb-4 text-xl sm:text-2xl font-bold grow">준비중</div>
         </SensorCard>

        <SensorCard>
          <SensorCard.Header title="가시거리">
          </SensorCard.Header>
          <div className="flex flex-col gap-3 sm:gap-4 px-6">
            <div className="w-full h-12 flex items-center pt-4">
              <RangeBar range={{ start: 0, end: 20 }} value={visibility === undefined ? visibility : visibility / 1000} unit="km" />
            </div>
            <div className="h-6 w-full justify-between flex text-slate-600 text-sm">
              <p>0km</p>
              <p>20km</p>
            </div>
            <SensorCard.Scalar value={visibility === undefined ? visibility : visibility / 1000} unit="km" />
          </div>
        </SensorCard>

        <SensorCard>
          <SensorCard.Header title="기온">
          </SensorCard.Header>
          <SensorCard.Scalar value={temp} unit="°C" />
        </SensorCard>

        <SensorCard>
          <SensorCard.Header title="수온(표층)">
          </SensorCard.Header>
          <SensorCard.Scalar value={waterTemp} unit="°C" />
        </SensorCard>


      </section>
    </>
  )
}