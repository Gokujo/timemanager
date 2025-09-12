import React from 'react';

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
          <label className="text-white block mb-1">Geplante Arbeitszeit (Minuten)</label>
          <input
            type="number"
            value={plannedWork}
            onChange={(e) => onPlannedWorkChange(parseInt(e.target.value) || minWorkMinutes)}
            className="w-full p-2 rounded bg-white/20 text-white border border-white/30"
            min={minWorkMinutes}
            title="Geplante Arbeitszeit in Minuten"
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;