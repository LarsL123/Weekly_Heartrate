'use client';

import { Activity, TrendingUp } from 'lucide-react';

interface ChartPlaceholderProps {
  showPreviousWeek: boolean;
}

export default function ChartPlaceholder({ showPreviousWeek }: ChartPlaceholderProps) {
  return (
    <div className="h-full bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Heart Rate Comparison</h3>
        <Activity className="w-5 h-5 text-blue-500" />
      </div>

      {/* Simulated Chart Area */}
      <div className="relative h-[calc(100%-3rem)] bg-gradient-to-b from-gray-50 to-white rounded border border-gray-100">
        {/* Y-Axis Labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between py-4 text-xs text-gray-500">
          <span>200</span>
          <span>150</span>
          <span>100</span>
          <span>50</span>
        </div>

        {/* Chart Content */}
        <div className="ml-12 h-full p-4 relative">
          {/* Current Week Line (Blue) */}
          <div className="absolute left-4 right-4 top-1/3">
            <div className="h-0.5 bg-blue-500 relative">
              <TrendingUp className="absolute -top-2 right-0 w-4 h-4 text-blue-500" />
            </div>
            <span className="absolute -top-6 right-0 text-xs font-medium text-blue-600">
              Current Week
            </span>
          </div>

          {/* Previous Week Line (Gray) - Conditional */}
          {showPreviousWeek && (
            <div className="absolute left-4 right-4 top-1/2">
              <div className="h-0.5 bg-gray-400 opacity-60 relative">
                <TrendingUp className="absolute -top-2 right-0 w-4 h-4 text-gray-400" />
              </div>
              <span className="absolute -bottom-6 right-0 text-xs font-medium text-gray-500">
                Previous Week
              </span>
            </div>
          )}

          {/* X-Axis Labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </div>
    </div>
  );
}
