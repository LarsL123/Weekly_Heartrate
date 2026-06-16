import React from "react";
import { weekToDate, dateToWeek } from "@/services/dateHelpers";

interface WeekPickerProps {
  label: string;
  value: string; //Date (YYYY-MM-DD)
  disabled?: boolean;
  onChange: (value: string) => void;
}

export default function WeekPicker({
  label,
  value,
  disabled = false,
  onChange,
}: WeekPickerProps) {
  const handleWeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const weekValue = e.target.value;
    if (weekValue) {
      const dateValue = weekToDate(weekValue);
      onChange(dateValue);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-gray-700">{label}</label>
      <input
        type="week"
        value={dateToWeek(value)}
        min="2026-W24"
        disabled={disabled}
        onChange={handleWeekChange}
        className={`px-2 py-1.5 text-sm border border-gray-300 rounded
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${disabled ? "bg-gray-300 text-gray-200" : "text-gray-900"}`}
      />
    </div>
  );
}
