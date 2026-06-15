"use client";

import { Settings } from "lucide-react";

interface ChartOptionsProps {
  showPreviousWeek: boolean;
  smoothCurves: boolean;
  zoneOverlays: boolean;
  onToggleShowPreviousWeek: () => void;
  onToggleSmoothCurves: () => void;
  onToggleZoneOverlays: () => void;
}

export default function ChartOptions({
  showPreviousWeek,
  smoothCurves,
  zoneOverlays,
  onToggleShowPreviousWeek,
  onToggleSmoothCurves,
  onToggleZoneOverlays,
}: ChartOptionsProps) {
  return (
    <div className="h-full bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <Settings className="w-4 h-4 text-gray-600" />
        <h3 className="text-sm font-medium text-gray-900">Chart Options</h3>
      </div>

      <div className="space-y-3">
        <ToggleOption
          label="Show Previous"
          checked={showPreviousWeek}
          onChange={onToggleShowPreviousWeek}
        />
        <ToggleOption
          label="Smooth Curves"
          checked={smoothCurves}
          onChange={onToggleSmoothCurves}
        />
        <ToggleOption
          label="Zone Overlays"
          checked={zoneOverlays}
          onChange={onToggleZoneOverlays}
        />
      </div>
    </div>
  );
}

interface ToggleOptionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleOption({ label, checked, onChange }: ToggleOptionProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`
          relative inline-flex h-5 w-9 items-center rounded-full transition-colors
          ${checked ? "bg-blue-600" : "bg-gray-200"}
        `}
      >
        <span
          className={`
            inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform
            ${checked ? "translate-x-5" : "translate-x-0.5"}
          `}
        />
      </button>
    </label>
  );
}
