"use client";

import { useState } from "react";
import DashboardHeader from "./components/DashboardHeader";
import ChartPlaceholder from "./components/ChartPlaceholder";
import ChartOptions from "./components/ChartOptions";
import ActivityPanel from "./components/ActivityPanel";

export default function Home() {
  const [showPreviousWeek, setShowPreviousWeek] = useState(true);
  const [smoothCurves, setSmoothCurves] = useState(false);
  const [zoneOverlays, setZoneOverlays] = useState(false);

  // Get current date formatted
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="h-screen overflow-hidden flex">
      {/* Left Pane - Main Dashboard (70%) */}
      <div className="w-[70%] flex flex-col bg-white">
        <DashboardHeader title="Weekly Performance" currentDate={currentDate} />

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
