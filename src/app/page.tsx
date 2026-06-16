"use client";

import { useEffect, useState, useRef } from "react";
import DashboardHeader from "../components/DashboardHeader";
import HrChart from "../components/HrChart";
import ChartOptions from "../components/ChartOptions";
import ActivityPanel from "../components/ActivityPanel";
import { getMonday, prevMonday } from "@/services/dateHelpers";

import { ActivityHrData, CropState } from "@/types/types";

export default function Home() {
  const [showPreviousWeek, setShowPreviousWeek] = useState(false);
  const [smoothingWindow, setSmoothingWindow] = useState(3);
  const [zoneOverlays, setZoneOverlays] = useState(false);
  const [selectedPrimaryDate, setSelectedPrimaryDate] =
    useState<string>(getMonday());
  const [selectedSecondaryDate, setSelectedSecondaryDate] =
    useState<string>(prevMonday());
  const [primaryWorkouts, setPrimaryWorkouts] = useState<ActivityHrData[]>([]);
  const [secondaryWorkouts, setSecondaryWorkouts] = useState<ActivityHrData[]>(
    [],
  );
  const [activeActivities, setActiveActivities] = useState<string[]>([]);

  const cache = useRef<Map<string, ActivityHrData[]>>(new Map());

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/hrData?week=${selectedPrimaryDate}`);
      if (!response.ok) {
        throw new Error(
          `Was not abel to get data from the server: ${response.status}`,
        );
      }
      console.log("Fetched");
      const data = await response.json();
      cache.current.set(selectedPrimaryDate, data);
      setPrimaryWorkouts(data);
      setActiveActivities(data.map((e: ActivityHrData) => e.activity_id));
    };

    fetchData();
  }, [selectedPrimaryDate]);

  useEffect(() => {
    if (!showPreviousWeek) return;

    if (cache.current.has(selectedSecondaryDate))
      return setSecondaryWorkouts(cache.current.get(selectedSecondaryDate)!);

    const loadSecondaryWorkouts = async () => {
      const response = await fetch(`/api/hrData?week=${selectedSecondaryDate}`);
      if (!response.ok) {
        throw new Error(
          `Was not abel to get data from the server: ${response.status}`,
        );
      }

      console.log("Fetched");
      const data = await response.json();
      cache.current.set(selectedSecondaryDate, data);
      setSecondaryWorkouts(data);
    };

    loadSecondaryWorkouts();
  }, [selectedSecondaryDate, showPreviousWeek]);

  const onSaveCrops = (cropDataMap: CropState, onSuccess: () => void) => {
    const storeCrops = async () => {
      const result = await fetch("/api/hrData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cropDataMap),
      });

      console.log(await result.json());

      setPrimaryWorkouts((prev) => {
        return prev.map((activity) => {
          activity.crop_start = cropDataMap[activity.activity_id].cropStart;
          activity.crop_end = cropDataMap[activity.activity_id].cropEnd;
          return activity;
        });
      });
      onSuccess();
    };

    storeCrops();
  };

  console.log(cache);

  return (
    <div className="h-screen overflow-hidden flex">
      <div className="w-[70%] flex flex-col bg-white">
        <DashboardHeader
          title="Weekly Performance"
          currentDate={selectedPrimaryDate}
        />
        <div className="flex-1 p-6 flex gap-6 overflow-hidden">
          <div className="w-[80%]">
            <HrChart
              showPreviousWeek={showPreviousWeek}
              primaryWorkouts={primaryWorkouts}
              secondaryWorkouts={secondaryWorkouts}
              activeActivities={activeActivities}
              smoothingWindow={smoothingWindow}
            />
          </div>
          <div className="w-[20%]">
            <ChartOptions
              showPreviousWeek={showPreviousWeek}
              smoothingWindow={smoothingWindow}
              zoneOverlays={zoneOverlays}
              selectedPrimaryDate={selectedPrimaryDate}
              selectedSecondaryDate={selectedSecondaryDate}
              onToggleShowPreviousWeek={() =>
                setShowPreviousWeek(!showPreviousWeek)
              }
              onChangeSmoothingWindow={setSmoothingWindow}
              onToggleZoneOverlays={() => setZoneOverlays(!zoneOverlays)}
              onChangePrimaryDate={setSelectedPrimaryDate}
              onChangeSecondaryDate={setSelectedSecondaryDate}
            />
          </div>
        </div>
      </div>

      <div className="w-[30%] border-l border-gray-200">
        <ActivityPanel
          data={primaryWorkouts}
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
