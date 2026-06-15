"use client";

import { ActivityHrData } from "@/types/types";
import { Activity } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HrChartProps {
  showPreviousWeek: boolean;
  workouts: ActivityHrData[];
  activeActivities: string[];
  smoothingWindow: number;
}

// Apply moving average smoothing to data
function applyMovingAverage(
  data: Array<{ heartrate: number; time: number }>,
  windowSize: number
) {
  if (windowSize <= 1 || data.length === 0) {
    return data;
  }

  const smoothedData: Array<{ heartrate: number; time: number }> = [];

  for (let i = 0; i < data.length; i++) {
    const halfWindow = Math.floor(windowSize / 2);
    const start = Math.max(0, i - halfWindow);
    const end = Math.min(data.length, i + halfWindow + 1);

    let sum = 0;
    for (let j = start; j < end; j++) {
      sum += data[j].time;
    }

    smoothedData.push({
      heartrate: data[i].heartrate,
      time: sum / (end - start),
    });
  }

  return smoothedData;
}

// Process workout data to calculate time spent at each heart rate
function processHeartRateData(
  workouts: ActivityHrData[],
  activeActivities: string[],
  smoothingWindow: number,
) {
  const hrTimeMap = new Map<number, number>(); // heart rate -> total time in seconds

  workouts.forEach((workout) => {
    if (!activeActivities.includes(workout.activity_id)) {
      return;
    }

    const streams = workout.streams as {
      time?: number[];
      heartrate?: number[];
    };
    const { time, heartrate } = streams;

    if (!time || !heartrate || time.length === 0 || heartrate.length === 0) {
      return;
    }

    // Iterate through each point and calculate time spent
    for (let i = 0; i < heartrate.length - 1; i++) {
      const hr = Math.round(heartrate[i]); // Round to nearest BPM
      const duration = time[i + 1] - time[i]; // Time between this point and next

      hrTimeMap.set(hr, (hrTimeMap.get(hr) || 0) + duration);
    }
  });

  // Convert to array and sort by heart rate
  const chartData = Array.from(hrTimeMap.entries())
    .map(([hr, time]) => ({
      heartrate: hr,
      time: time / 60, // Convert to minutes
    }))
    .sort((a, b) => a.heartrate - b.heartrate);

  // Apply smoothing if window size > 1
  return applyMovingAverage(chartData, smoothingWindow);
}

export default function HrChart({
  showPreviousWeek,
  workouts,
  activeActivities,
  smoothingWindow,
}: HrChartProps) {
  const chartData = processHeartRateData(workouts, activeActivities, smoothingWindow);

  return (
    <div className="h-full bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Heart Rate Distribution
        </h3>
        <Activity className="w-5 h-5 text-blue-500" />
      </div>

      <div className="h-[calc(100%-3rem)]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                type="number"
                domain={[80, 200]}
                dataKey="heartrate"
                label={{
                  value: "Heart Rate (BPM)",
                  position: "insideBottom",
                  offset: -5,
                }}
                allowDataOverflow
                stroke="#6b7280"
              />
              <YAxis
                label={{
                  value: "Time (minutes)",
                  angle: -90,
                  position: "insideLeft",
                }}
                stroke="#6b7280"
              />
              <Tooltip
                formatter={(value) => {
                  if (typeof value === "number") {
                    return [`${value.toFixed(2)} min`, "Time"];
                  }
                  return [String(value), "Time"];
                }}
                labelFormatter={(label) => `${label} BPM`}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                }}
              />
              <Line
                type="monotone"
                dataKey="time"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No heart rate data available
          </div>
        )}
      </div>
    </div>
  );
}
