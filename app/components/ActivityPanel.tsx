'use client';

import { useState } from 'react';
import { Scissors, Save } from 'lucide-react';
import ActivityCard, { Activity, ActivityCropData } from './ActivityCard';

const mockActivities: Activity[] = [
  { id: '1', type: 'run', date: 'Jun 12', duration: '45:23', totalDuration: 2723 },
  { id: '2', type: 'ride', date: 'Jun 11', duration: '1:12:45', totalDuration: 4365 },
  { id: '3', type: 'run', date: 'Jun 10', duration: '32:15', totalDuration: 1935 },
  { id: '4', type: 'ride', date: 'Jun 9', duration: '58:30', totalDuration: 3510 },
  { id: '5', type: 'run', date: 'Jun 8', duration: '41:10', totalDuration: 2470 },
  { id: '6', type: 'ride', date: 'Jun 7', duration: '1:25:00', totalDuration: 5100 },
  { id: '7', type: 'run', date: 'Jun 6', duration: '38:45', totalDuration: 2325 },
];

export default function ActivityPanel() {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize crop data for all activities
  const [cropDataMap, setCropDataMap] = useState<Record<string, ActivityCropData>>(() => {
    const initialData: Record<string, ActivityCropData> = {};
    mockActivities.forEach(activity => {
      initialData[activity.id] = {
        id: activity.id,
        cropStart: 0,
        cropEnd: 100,
        included: true,
      };
    });
    return initialData;
  });

  const handleCropChange = (data: ActivityCropData) => {
    setCropDataMap(prev => ({
      ...prev,
      [data.id]: data,
    }));
  };

  const handleSaveAll = () => {
    console.log('Saving all crops:', cropDataMap);
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);
  };

  const includedCount = Object.values(cropDataMap).filter(data => data.included).length;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Panel Header with Save All Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 px-4 py-4">
          <Scissors className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
          <span className="ml-auto text-sm text-gray-500">
            {includedCount}/{mockActivities.length} included
          </span>
        </div>

        {/* Save All Crops Button */}
        <div className="px-4 pb-4">
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className={`
              w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
              transition-colors
              ${isSaving
                ? 'bg-green-500 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
              }
              disabled:opacity-75
            `}
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saved All Crops!' : 'Save All Crops'}
          </button>
        </div>
      </div>

      {/* Scrollable Activities List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {mockActivities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            isSelected={selectedActivityId === activity.id}
            onSelect={() => setSelectedActivityId(activity.id)}
            cropData={cropDataMap[activity.id]}
            onCropChange={handleCropChange}
          />
        ))}
      </div>
    </div>
  );
}
