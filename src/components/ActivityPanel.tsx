"use client";

import { useState, useEffect } from "react";
import { Scissors, Save } from "lucide-react";
import ActivityCard from "./ActivityCard";

import { ActivityHrData, CropState } from "@/types/types";

interface ActivityPanelProps {
  data: readonly ActivityHrData[];
  activeActivities: string[];
  onToggleActivity: (activityId: string) => void;
  onSaveAllCrops: (cropDataMap: CropState, onSuccess: () => void) => void;
}

export default function ActivityPanel({
  data,
  activeActivities,
  onToggleActivity,
  onSaveAllCrops: onSaveCrop,
}: ActivityPanelProps) {
  const [cropData, setCropDataMap] = useState<CropState>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initialData: CropState = {};
    data.forEach((activity) => {
      initialData[activity.activity_id] = {
        cropStart: activity.crop_start,
        cropEnd: activity.crop_end,
      };
    });
    setCropDataMap(initialData);
  }, [data]);

  const handleCropChange = (
    activityId: string,
    cropStart: number,
    cropEnd: number,
  ) => {
    setCropDataMap((prev) => ({
      ...prev,
      [activityId]: { cropStart, cropEnd },
    }));
  };

  const handleSaveCrops = () => {
    console.log("Saving all crops:", cropData);
    setIsSaving(true);
    onSaveCrop(cropData, () => {
      setIsSaving(false);
    });
  };

  const includedCount = activeActivities.length;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 px-4 py-4">
          <Scissors className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activities
          </h2>
          <button
            onClick={handleSaveCrops}
            disabled={isSaving}
            className={`
              ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
              transition-colors
              ${
                isSaving
                  ? "bg-green-500 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
              }
              disabled:opacity-75
            `}
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saved!" : "Save Crops"}
          </button>
          <span className="ml-auto text-sm text-gray-500">
            {includedCount}/{data.length} active
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {data.map((activity) => {
          if (!cropData[activity.activity_id]) {
            return;
          }

          return (
            <ActivityCard
              key={activity.activity_id}
              activity={activity}
              isActive={activeActivities.includes(activity.activity_id)}
              onToggleActive={() => onToggleActivity(activity.activity_id)}
              cropStart={cropData[activity.activity_id].cropStart}
              cropEnd={cropData[activity.activity_id].cropEnd || 100}
              onCropChange={(cropStart, cropEnd) =>
                handleCropChange(activity.activity_id, cropStart, cropEnd)
              }
            />
          );
        })}
      </div>
    </div>
  );
}
