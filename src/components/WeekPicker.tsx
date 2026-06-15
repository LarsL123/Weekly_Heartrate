import React from "react";

interface WeekPickerProps {
  label: string;
  value: string; //Date (YYYY-MM-DD)
  onChange: (value: string) => void;
}

export default function WeekPicker({
  label,
  value,
  onChange,
}: WeekPickerProps) {
  // Convert a date string (YYYY-MM-DD) to week format (YYYY-Www) using ISO 8601
  const dateToWeek = (dateString: string): string => {
    const date = new Date(dateString);

    // Copy date so we don't modify the original
    const target = new Date(date.valueOf());

    // ISO 8601 week date: weeks start on Monday
    const dayNr = (date.getDay() + 6) % 7; // Make Monday = 0, Sunday = 6

    // Set to nearest Thursday (current date + 4 - dayNr)
    target.setDate(target.getDate() - dayNr + 3);

    // Get first day of year
    const jan4 = new Date(target.getFullYear(), 0, 4);

    // Calculate week number
    const dayDiff = (target.getTime() - jan4.getTime()) / 86400000;
    const weekNum =
      1 + Math.round((dayDiff - 3 + ((jan4.getDay() + 6) % 7)) / 7);

    return `${target.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
  };

  // Convert week format (YYYY-Www) to a date string (Monday of that week)
  const weekToDate = (weekString: string): string => {
    const [year, week] = weekString.split("-W").map(Number);

    // Simple calculation: January 4th is always in week 1
    const jan4 = new Date(year, 0, 4);

    // Get the Monday of week 1
    const jan4Day = (jan4.getDay() + 6) % 7; // Make Monday = 0, Sunday = 6
    const week1Monday = new Date(year, 0, 4 - jan4Day);

    // Add the number of weeks
    const targetMonday = new Date(week1Monday);
    targetMonday.setDate(week1Monday.getDate() + (week - 1) * 7);

    return targetMonday.toLocaleDateString("sv-SE");
  };

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
        onChange={handleWeekChange}
        className="px-2 py-1.5 text-sm border border-gray-300 rounded
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   text-gray-900"
      />
    </div>
  );
}
