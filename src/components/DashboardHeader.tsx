import { Calendar } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  currentDate: string;
}

export default function DashboardHeader({ title, currentDate }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Calendar className="w-4 h-4" />
        <span>{currentDate}</span>
      </div>
    </div>
  );
}
