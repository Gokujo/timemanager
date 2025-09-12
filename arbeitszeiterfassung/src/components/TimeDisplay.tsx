import React from 'react';
import { formatMinutes } from '../utils/timeUtils';

interface TimeDisplayProps {
  workedMinutes: number;
  plannedWork: number;
  endTime: string;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({
  workedMinutes,
  plannedWork,
  endTime
}) => {
  const remainingMinutes = Math.max(0, plannedWork - workedMinutes);
  const overtimeMinutes = Math.max(0, workedMinutes - plannedWork);
  const hasOvertime = overtimeMinutes > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="p-4 bg-white/20 rounded-lg text-white">
        <p className="text-sm">Geleistete Arbeitszeit</p>
        <p className="text-2xl font-bold">{formatMinutes(workedMinutes)}</p>
      </div>
      <div className="p-4 bg-white/20 rounded-lg text-white">
        <p className="text-sm">{hasOvertime ? "Überstunden" : "Verbleibende Zeit"}</p>
        <p className="text-2xl font-bold">{hasOvertime ? formatMinutes(overtimeMinutes) : formatMinutes(remainingMinutes)}</p>
      </div>
      <div className="p-4 bg-white/20 rounded-lg text-white">
        <p className="text-sm">Vorauss. Arbeitsende</p>
        <p className="text-2xl font-bold">{endTime}</p>
      </div>
    </div>
  );
};

export default TimeDisplay;
