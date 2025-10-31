import React from 'react';
import {Break} from '../interfaces/break';
import {formatMinutes} from '../utils/timeUtils';

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
                <div className="p-4 bg-white/10 rounded-xl text-white text-center ring-1 ring-white/10">
                    <p className="mb-2">Keine Pausenzeiten vorhanden</p>
                    <p className="text-sm text-white/70">Fügen Sie eine Pause hinzu oder setzen Sie die Standardpausenzeiten zurück</p>
                </div>
            ) : (
                breaks.map((breakItem, index) => (
                    <div key={index} className="flex items-center gap-4 mb-2">
                        <input
                            type="time"
                            value={breakItem.start ? breakItem.start.toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'}) : ''}
                            onChange={(e) => onUpdateBreakStart(index, e.target.value)}
                            className="w-24 rounded-lg bg-white/10 text-white border border-white/20 px-3 py-2 outline-none focus:border-white/40 focus:ring-0"
                            title="Pausenbeginn (HH:MM)"
                        />
                        <input
                            type="time"
                            value={breakItem.end ? breakItem.end.toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'}) : ''}
                            onChange={(e) => onUpdateBreakEnd(index, e.target.value)}
                            className="w-24 rounded-lg bg-white/10 text-white border border-white/20 px-3 py-2 outline-none focus:border-white/40 focus:ring-0"
                            title="Pausenende (HH:MM)"
                        />
                        <input
                            type="number"
                            value={breakItem.duration}
                            onChange={(e) => onUpdateBreakDuration(index, e.target.value)}
                            className="w-24 rounded-lg bg-white/10 text-white border border-white/20 px-3 py-2 outline-none focus:border-white/40 focus:ring-0"
                            min="0"
                            title="Pausendauer in Minuten"
                        />
                        <span className="text-white">Minuten</span>
                        <button
                            onClick={() => onDeleteBreak(index)}
                            className="flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm shadow-red-900/20"
                            title="Pause löschen"
                            data-ripple-light="true"
                        >
                            <span className="text-sm">×</span>
                        </button>
                    </div>
                ))
            )}

            <div className="flex gap-2 mt-4">
                <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-900/20"
                    onClick={onAddBreak}
                    data-ripple-light="true"
                >
                    <span className="w-5 h-5">+</span> Pause hinzufügen
                </button>
                <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-900/20"
                    onClick={onResetToDefaultBreaks}
                    data-ripple-light="true"
                >
                    <span className="w-5 h-5">↻</span> Standardpausenzeiten zurücksetzen
                </button>
            </div>
        </div>
    );
};

export default BreakManager;
