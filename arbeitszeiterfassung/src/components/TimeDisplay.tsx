import React from 'react';
import {formatMinutesCompact, formatMinutesReadable, formatSecondsReadable} from '../utils/userSettingsUtils';

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
        <div className="mb-6">
            {/* Große Hauptanzeige - Geleistete Arbeitszeit */}
            <div className="p-12 bg-white/20 rounded-xl text-white text-center mb-4 shadow-sm ring-1 ring-white/10">
                <p className="text-lg text-white/80 mb-4" style={{marginTop: "-2rem"}}>Geleistete Arbeitszeit</p>
                <p className="text-8xl font-bold">{formatMinutesCompact(workedMinutes)}</p>
            </div>

            {/* Zusätzliche Informationen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/20 rounded-xl text-white shadow-sm ring-1 ring-white/10">
                    <p className="text-sm">{hasOvertime ? "Überstunden" : "Verbleibende Zeit"}</p>
                    <div className="text-2xl font-bold">
                        {hasOvertime ? formatMinutesReadable(overtimeMinutes) : formatMinutesReadable(remainingMinutes)}
                    </div>
                    <div className="text-sm text-white/70 mt-1">
                        {hasOvertime ? formatSecondsReadable(overtimeMinutes) : formatSecondsReadable(remainingMinutes)}
                    </div>
                </div>
                <div className="p-4 bg-white/20 rounded-xl text-white shadow-sm ring-1 ring-white/10">
                    <p className="text-sm">Vorauss. Arbeitsende</p>
                    <p className="text-6xl font-bold">{endTime}</p>
                </div>
            </div>
        </div>
    );
};

export default TimeDisplay;
