"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import ChartPlaceholder from "../components/ChartPlaceholder";
import ChartOptions from "../components/ChartOptions";
import ActivityPanel from "../components/ActivityPanel";

import { ActivityHrData } from "@/types/types";

export default function Home() {
  const [showPreviousWeek, setShowPreviousWeek] = useState(true);
  const [smoothCurves, setSmoothCurves] = useState(false);
  const [zoneOverlays, setZoneOverlays] = useState(false);

  const [rawHrData, setRawHrData] = useState<ActivityHrData[]>([]);

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
    };

    fetchData();
  }, []);

  return (
    <div className="h-screen overflow-hidden flex">
      {/* Left Pane - Main Dashboard (70%) */}
      <div className="w-[70%] flex flex-col bg-white">
        <DashboardHeader title="Weekly Performance" currentDate={currentDate} />
        {rawHrData.map((e) => {
          return e.name + " ";
        })}
        {/* Content Area */}
        <div className="flex-1 p-6 flex gap-6 overflow-hidden">
          {/* Chart Area (80% of content) */}
          <div className="w-[80%]">
            <ChartPlaceholder showPreviousWeek={showPreviousWeek} />
          </div>

          {/* Options Panel (20% of content) */}
          <div className="w-[20%]">
            <ChartOptions
              showPreviousWeek={showPreviousWeek}
              smoothCurves={smoothCurves}
              zoneOverlays={zoneOverlays}
              onToggleShowPreviousWeek={() =>
                setShowPreviousWeek(!showPreviousWeek)
              }
              onToggleSmoothCurves={() => setSmoothCurves(!smoothCurves)}
              onToggleZoneOverlays={() => setZoneOverlays(!zoneOverlays)}
            />
          </div>
        </div>
      </div>

      {/* Right Pane - Activity Management (30%) */}
      <div className="w-[30%] border-l border-gray-200">
        <ActivityPanel />
      </div>
    </div>
  );
}
