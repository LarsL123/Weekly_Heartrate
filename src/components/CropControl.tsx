"use client";

import { useState, useRef, useEffect } from "react";

interface CropControlProps {
  cropStart: number;
  cropEnd: number;
  onCropChange: (cropStart: number, cropEnd: number) => void;
}

export default function CropControl({
  cropStart,
  cropEnd,
  onCropChange,
}: CropControlProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);

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
        const newStart = Math.min(percentage, cropEnd - 5);
        onCropChange(Math.round(newStart), cropEnd);
      } else if (isDraggingEnd) {
        const newEnd = Math.max(percentage, cropStart + 5);
        onCropChange(cropStart, Math.round(newEnd));
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
  }, [isDraggingStart, isDraggingEnd, cropStart, cropEnd, onCropChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-gray-700">Crop Selection</div>
        <div className="text-xs text-gray-500">
          {cropStart}% - {cropEnd}%
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
            style={{ width: `${cropStart}%` }}
          />
          <div
            className="absolute top-0 bottom-0 right-0 bg-gray-400 bg-opacity-40 rounded-r pointer-events-none"
            style={{ width: `${100 - cropEnd}%` }}
          />

          {/* Crop Selection Highlight */}
          <div
            className="absolute top-0 bottom-0 bg-blue-500 bg-opacity-10 pointer-events-none"
            style={{
              left: `${cropStart}%`,
              width: `${cropEnd - cropStart}%`,
            }}
          />
        </div>

        <button
          type="button"
          className="absolute cursor-ew-resize"
          style={{
            left: `${cropStart}%`,
            transform: "translateX(-50%)",
            background: isDraggingStart ? "#2563eb" : "#3b82f6",
            width: "8px",
            height: "48px",
            borderRadius: "2px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
          onMouseDown={handleMouseDown("start")}
        />

        <button
          type="button"
          className="absolute cursor-ew-resize"
          style={{
            left: `${cropEnd}%`,
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
  );
}
