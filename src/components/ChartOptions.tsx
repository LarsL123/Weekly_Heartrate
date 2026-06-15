"use client";

import { Settings } from "lucide-react";
import WeekPicker from "./WeekPicker";

interface ChartOptionsProps {
  showPreviousWeek: boolean;
  smoothingWindow: number;
  zoneOverlays: boolean;
  selectedDate: string;
  onToggleShowPreviousWeek: () => void;
  onChangeSmoothingWindow: (value: number) => void;
  onToggleZoneOverlays: () => void;
  onChangeDate: (date: string) => void;
}

export default function ChartOptions({
  showPreviousWeek,
  smoothingWindow,
  zoneOverlays,
  selectedDate,
  onToggleShowPreviousWeek,
  onChangeSmoothingWindow,
  onToggleZoneOverlays,
  onChangeDate,
}: ChartOptionsProps) {
  return (
    <div className="h-full bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <Settings className="w-4 h-4 text-gray-600" />
        <h3 className="text-sm font-medium text-gray-900">Chart Options</h3>
      </div>

      <div className="space-y-3">
        <WeekPicker label="Week" value={selectedDate} onChange={onChangeDate} />
        <ToggleOption
          label="Show Previous"
          checked={showPreviousWeek}
          onChange={onToggleShowPreviousWeek}
        />
        <CounterOption
          label="Smoothing"
          value={smoothingWindow}
          onChange={onChangeSmoothingWindow}
          minValue={1}
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

interface CounterOptionProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  minValue: number;
}

function CounterOption({
  label,
  value,
  onChange,
  minValue,
}: CounterOptionProps) {
  const handleDecrement = () => {
    if (value > minValue) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    onChange(value + 1);
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= minValue}
          className={`
            w-6 h-6 rounded flex items-center justify-center text-sm font-medium
            transition-colors
            ${
              value <= minValue
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }
          `}
        >
          −
        </button>
        <span className="text-sm font-medium text-gray-900 w-8 text-center">
          {value}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          className="w-6 h-6 rounded bg-gray-200 text-gray-700 hover:bg-gray-300
                     flex items-center justify-center text-sm font-medium transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
