import React from 'react';
import { Break } from '../interfaces/break';
import { formatMinutes } from '../utils/timeUtils';

interface BreakManagerProps {
  breaks: Break[];
  onAddBreak: () => void;
  onDeleteBreak: (index: number) => void;
  onResetToDefaultBreaks: () => void;
  onUpdateBreakStart: (index: number, value: string) => void;
  onUpdateBreakEnd: (index: number, value: string) => void;
  onUpdateBreakDuration: (index: number, value: string) => void;
}

const BreakManager: React.FC<BreakManagerProps> = ({
  breaks,
  onAddBreak,
  onDeleteBreak,
  onResetToDefaultBreaks,
  onUpdateBreakStart,
  onUpdateBreakEnd,
  onUpdateBreakDuration
}) => {
  // Calculate total break time
  const totalBreakTime = breaks.reduce((sum, b) => sum + (b.duration || 0), 0);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-white">Pausen</h2>
        <div className="text-white">
          <span className="font-semibold">Gesamtpausenzeit:</span> {formatMinutes(totalBreakTime)}
        </div>
      </div>
      
      {breaks.length === 0 ? (
        <div className="p-4 bg-white/10 rounded-lg text-white text-center">
          <p className="mb-2">Keine Pausenzeiten vorhanden</p>
          <p className="text-sm text-white/70">Fügen Sie eine Pause hinzu oder setzen Sie die Standardpausenzeiten zurück</p>
        </div>
      ) : (
        breaks.map((breakItem, index) => (
          <div key={index} className="flex items-center gap-4 mb-2">
            <input
              type="time"
              value={breakItem.start ? breakItem.start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : ''}
              onChange={(e) => onUpdateBreakStart(index, e.target.value)}
              className="w-24 p-2 rounded bg-white/20 text-white border border-white/30"
              title="Pausenbeginn (HH:MM)"
            />
            <input
              type="time"
              value={breakItem.end ? breakItem.end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : ''}
              onChange={(e) => onUpdateBreakEnd(index, e.target.value)}
              className="w-24 p-2 rounded bg-white/20 text-white border border-white/30"
              title="Pausenende (HH:MM)"
            />
            <input
              type="number"
              value={breakItem.duration}
              onChange={(e) => onUpdateBreakDuration(index, e.target.value)}
              className="w-24 p-2 rounded bg-white/20 text-white border border-white/30"
              min="0"
              title="Pausendauer in Minuten"
            />
            <span className="text-white">Minuten</span>
            <button
              onClick={() => onDeleteBreak(index)}
              className="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded hover:bg-red-600"
              title="Pause löschen"
            >
              <span className="text-sm">×</span>
            </button>
          </div>
        ))
      )}
      
      <div className="flex gap-2 mt-4">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={onAddBreak}
        >
          <span className="w-5 h-5">+</span> Pause hinzufügen
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          onClick={onResetToDefaultBreaks}
        >
          <span className="w-5 h-5">↻</span> Standardpausenzeiten zurücksetzen
        </button>
      </div>
    </div>
  );
};

export default BreakManager;
