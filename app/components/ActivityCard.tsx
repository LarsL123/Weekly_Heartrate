"use client";

import { useState, useRef, useEffect } from "react";
import { Bike, Activity as ActivityIcon, Calendar, Clock } from "lucide-react";

export interface Activity {
  id: string;
  type: "run" | "ride";
  date: string;
  duration: string;
  totalDuration: number; // in seconds
}

export interface ActivityCropData {
  id: string;
  cropStart: number;
  cropEnd: number;
  included: boolean;
}

interface ActivityCardProps {
  activity: Activity;
  isSelected: boolean;
  onSelect: () => void;
  cropData: ActivityCropData;
  onCropChange: (data: ActivityCropData) => void;
}

export default function ActivityCard({
  activity,
  isSelected,
  onSelect,
  cropData,
  onCropChange,
}: ActivityCardProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);

  const Icon = activity.type === "run" ? ActivityIcon : Bike;

  const handleMouseDown = (type: "start" | "end") => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "start") {
      setIsDraggingStart(true);
    } else {
      setIsDraggingEnd(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!barRef.current || (!isDraggingStart && !isDraggingEnd)) return;

      const rect = barRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

      if (isDraggingStart) {
        const newStart = Math.min(percentage, cropData.cropEnd - 5);
        onCropChange({ ...cropData, cropStart: Math.round(newStart) });
      } else if (isDraggingEnd) {
        const newEnd = Math.max(percentage, cropData.cropStart + 5);
        onCropChange({ ...cropData, cropEnd: Math.round(newEnd) });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingStart(false);
      setIsDraggingEnd(false);
    };

    if (isDraggingStart || isDraggingEnd) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingStart, isDraggingEnd, cropData, onCropChange]);

  const toggleIncluded = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCropChange({ ...cropData, included: !cropData.included });
  };

  return (
    <div
      onClick={onSelect}
      className={`
        bg-white border rounded-lg p-4 cursor-pointer transition-all
        ${isSelected ? "border-blue-500 shadow-md" : "border-gray-200 hover:border-gray-300"}
        ${!cropData.included ? "opacity-60" : ""}
      `}
    >
      {/* Activity Header with Toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon
            className={`w-5 h-5 ${activity.type === "run" ? "text-orange-500" : "text-green-500"}`}
          />
          <span className="font-medium text-gray-900 capitalize">
            {activity.type}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Include/Exclude Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={cropData.included}
            onClick={toggleIncluded}
            className={`
               relative inline-flex h-5 w-9 items-center rounded-full transition-colors 
              ${cropData.included ? "bg-green-500" : "bg-gray-300"} 
            `}
            title={
              cropData.included
                ? "Included in comparison"
                : "Excluded from comparison"
            }
          >
            <span
              className={`
                inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform
                ${cropData.included ? "translate-x-5" : "translate-x-0.5"}
              `}
            />
          </button>
        </div>
      </div>

      {/* Activity Metadata */}
      <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{activity.date}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{activity.duration}</span>
        </div>
      </div>

      {/* Crop Control Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-gray-700">
            Crop Selection
          </div>
          <div className="text-xs text-gray-500">
            {cropData.cropStart}% - {cropData.cropEnd}%
          </div>
        </div>

        {/* Visual Crop Bar with Draggable Endpoints */}
        <div className="relative h-20 flex items-center">
          <div
            ref={barRef}
            className="relative h-12 w-full bg-gray-100 rounded border border-gray-200 select-none"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Full Activity Bar Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 rounded pointer-events-none" />

            {/* Dimmed Areas (Outside Crop) */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-gray-400 bg-opacity-40 rounded-l pointer-events-none"
              style={{ width: `${cropData.cropStart}%` }}
            />
            <div
              className="absolute top-0 bottom-0 right-0 bg-gray-400 bg-opacity-40 rounded-r pointer-events-none"
              style={{ width: `${100 - cropData.cropEnd}%` }}
            />

            {/* Crop Selection Highlight */}
            <div
              className="absolute top-0 bottom-0 bg-blue-500 bg-opacity-10 pointer-events-none"
              style={{
                left: `${cropData.cropStart}%`,
                width: `${cropData.cropEnd - cropData.cropStart}%`,
              }}
            />

            {/* Center Line Indicator */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-400 pointer-events-none" />
          </div>

          {/* Left Draggable Handle */}
          <button
            type="button"
            className="absolute cursor-ew-resize"
            style={{
              left: `${cropData.cropStart}%`,
              transform: "translateX(-50%)",
              background: isDraggingStart ? "#2563eb" : "#3b82f6",
              width: "8px",
              height: "48px",
              borderRadius: "2px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
            onMouseDown={handleMouseDown("start")}
          />

          {/* Right Draggable Handle */}
          <button
            type="button"
            className="absolute cursor-ew-resize"
            style={{
              left: `${cropData.cropEnd}%`,
              transform: "translateX(-50%)",
              background: isDraggingEnd ? "#2563eb" : "#3b82f6",
              width: "8px",
              height: "48px",
              borderRadius: "2px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
            onMouseDown={handleMouseDown("end")}
          />
        </div>
      </div>
    </div>
  );
}
