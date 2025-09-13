import React from 'react';
import { getTimeFormat, formatTimeForDisplay, parseTimeInput } from '../utils/userSettingsUtils';

interface SettingsProps {
  manualStart: string;
  plannedWork: number;
  minWorkMinutes: number;
  onManualStartChange: (value: string) => void;
  onPlannedWorkChange: (value: number) => void;
}

const Settings: React.FC<SettingsProps> = ({
  manualStart,
  plannedWork,
  minWorkMinutes,
  onManualStartChange,
  onPlannedWorkChange
}) => {
  const timeFormat = getTimeFormat();
  const isHoursFormat = timeFormat === 'hours';
  
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-white mb-2">Einstellungen</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-white block mb-1">Tatsächlicher Arbeitsbeginn</label>
          <input
            type="time"
            value={manualStart}
            onChange={(e) => onManualStartChange(e.target.value)}
            className="w-full p-2 rounded bg-white/20 text-white border border-white/30"
            title="Tatsächlicher Arbeitsbeginn (HH:MM)"
          />
        </div>
        <div>
          <label className="text-white block mb-1">
            Geplante Arbeitszeit {isHoursFormat ? '(Stunden)' : '(Minuten)'}
          </label>
          <input
            type={isHoursFormat ? "time" : "number"}
            value={isHoursFormat ? formatTimeForDisplay(plannedWork) : plannedWork.toString()}
            onChange={(e) => {
              const newValue = parseTimeInput(e.target.value);
              onPlannedWorkChange(newValue);
            }}
            className="w-full p-2 rounded bg-white/20 text-white border border-white/30"
            min={isHoursFormat ? formatTimeForDisplay(minWorkMinutes) : minWorkMinutes}
            title={`Geplante Arbeitszeit ${isHoursFormat ? 'in Stunden (HH:MM)' : 'in Minuten'}`}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;