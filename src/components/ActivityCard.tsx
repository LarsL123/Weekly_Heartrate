"use client";

import { Bike, Activity as ActivityIcon, Calendar, Clock } from "lucide-react";
import { ActivityHrData } from "@/types/types";
import CropControl from "./CropControl";

interface ActivityCardProps {
  readonly activity: ActivityHrData;
  isActive: boolean;
  onToggleActive: () => void;
  cropStart: number;
  cropEnd: number;
  onCropChange: (cropStart: number, cropEnd: number) => void;
}

// Helper function to format seconds into HH:MM:SS or MM:SS
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Helper function to determine activity type icon
function getActivityType(sportType: string): "run" | "ride" {
  const lowerType = sportType.toLowerCase();
  if (lowerType.includes("run") || lowerType.includes("jog")) {
    return "run";
  }
  return "ride";
}

export default function ActivityCard({
  activity,
  isActive,
  onToggleActive,
  cropStart,
  cropEnd,
  onCropChange,
}: ActivityCardProps) {
  const activityType = getActivityType(activity.sport_type);
  const Icon = activityType === "run" ? ActivityIcon : Bike;

  const toggleActive = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleActive();
  };

  return (
    <div
      className={`
        bg-white border rounded-lg p-4 cursor-pointer transition-all border-gray-200 hover:border-gray-300
        ${!isActive ? "opacity-60" : ""}
      `}
    >
      {/* Activity Header with Toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon
            className={`w-5 h-5 ${activityType === "run" ? "text-orange-500" : "text-green-500"}`}
          />
          <span className="font-medium text-gray-900 capitalize">
            {activityType}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={toggleActive}
            className={`
               relative inline-flex h-5 w-9 items-center rounded-full transition-colors
              ${isActive ? "bg-green-500" : "bg-gray-300"}
            `}
            title={isActive ? "Active in comparison" : "Inactive in comparison"}
          >
            <span
              className={`
                inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform
                ${isActive ? "translate-x-5" : "translate-x-0.5"}
              `}
            />
          </button>
        </div>
      </div>

      {/* Activity Name */}
      <div className="mb-2 text-sm font-medium text-gray-900 truncate">
        {activity.name}
      </div>

      {/* Activity Metadata */}
      <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(activity.start_date)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDuration(activity.elapsed_time)}</span>
        </div>
      </div>

      {/* Crop Control Area */}
      <CropControl
        cropStart={cropStart}
        cropEnd={cropEnd}
        onCropChange={onCropChange}
      />
    </div>
  );
}
