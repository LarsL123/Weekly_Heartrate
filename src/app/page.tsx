"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import HrChart from "../components/HrChart";
import ChartOptions from "../components/ChartOptions";
import ActivityPanel from "../components/ActivityPanel";

import { ActivityHrData, CropState } from "@/types/types";

export default function Home() {
  const [showPreviousWeek, setShowPreviousWeek] = useState(true);
  const [smoothingWindow, setSmoothingWindow] = useState(3);
  const [zoneOverlays, setZoneOverlays] = useState(false);

  const [rawHrData, setRawHrData] = useState<ActivityHrData[]>([]);
  const [activeActivities, setActiveActivities] = useState<string[]>([]);

  // Get current date formatted
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/hrData?week=${"2026-06-14"}`);
      if (!response.ok) {
        throw new Error(
          `Was not abel to get data from the server: ${response.status}`,
        );
      }

      const data = await response.json();
      setRawHrData(data);
      setActiveActivities(data.map((e: ActivityHrData) => e.activity_id));
    };

    fetchData();
  }, []);

  const onSaveCrops = (cropDataMap: CropState) => {
    const storeCrops = async () => {
      const result = await fetch("/api/hrData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cropDataMap),
      });

      console.log(await result.json());

      setRawHrData((prev) => {
        return prev.map((activity) => {
          activity.crop_start = cropDataMap[activity.activity_id].cropStart;
          activity.crop_end = cropDataMap[activity.activity_id].cropEnd;
          return activity;
        });
      });
    };
    storeCrops();
  };

  return (
    <div className="h-screen overflow-hidden flex">
      <div className="w-[70%] flex flex-col bg-white">
        <DashboardHeader title="Weekly Performance" currentDate={currentDate} />
        <div className="flex-1 p-6 flex gap-6 overflow-hidden">
          <div className="w-[80%]">
            <HrChart
              showPreviousWeek={showPreviousWeek}
              workouts={rawHrData}
              activeActivities={activeActivities}
              smoothingWindow={smoothingWindow}
            />
          </div>
          <div className="w-[20%]">
            <ChartOptions
              showPreviousWeek={showPreviousWeek}
              smoothingWindow={smoothingWindow}
              zoneOverlays={zoneOverlays}
              onToggleShowPreviousWeek={() =>
                setShowPreviousWeek(!showPreviousWeek)
              }
              onChangeSmoothingWindow={setSmoothingWindow}
              onToggleZoneOverlays={() => setZoneOverlays(!zoneOverlays)}
            />
          </div>
        </div>
      </div>

      <div className="w-[30%] border-l border-gray-200">
        <ActivityPanel
          data={rawHrData}
          activeActivities={activeActivities}
          onToggleActivity={(activityId: string) => {
            setActiveActivities((prev) =>
              prev.includes(activityId)
                ? prev.filter((id) => id !== activityId)
                : [...prev, activityId],
            );
          }}
          onSaveAllCrops={onSaveCrops}
        />
      </div>
    </div>
  );
}
