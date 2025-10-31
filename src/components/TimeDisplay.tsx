import React, { useState, useEffect, useMemo } from 'react';
import {formatMinutesCompact, formatMinutesReadable, formatSecondsReadable} from '../utils/userSettingsUtils';
import {getActiveBreak, getDisplayMode} from '../utils/breakUtils';
import {formatTimeFromMinutes} from '../utils/timeUtils';
import {Break} from '../interfaces/break';

interface TimeDisplayProps {
    workedMinutes: number;
    plannedWork: number;
    endTime: string;
    breaks?: Break[];
    startTime?: Date | null;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({
                                                     workedMinutes,
                                                     plannedWork,
                                                     endTime,
                                                     breaks = [],
                                                     startTime = null
                                                 }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    
    // Calculate remaining time with seconds precision based on current time
    const remainingTimeWithSeconds = useMemo(() => {
        if (!startTime) return plannedWork;
        
        const now = new Date();
        
        // Calculate actual elapsed time in seconds (without rounding)
        const elapsedSeconds = (now.getTime() - startTime.getTime()) / 1000;
        
        // Calculate break time in seconds
        const validBreaks = breaks.filter((b) => {
            if (!b.start || !b.end) return false;
            const start = b.start instanceof Date ? b.start : new Date(b.start);
            const end = b.end instanceof Date ? b.end : new Date(b.end);
            return !isNaN(start.getTime()) && !isNaN(end.getTime());
        });
        
        // Check for active break
        const activeBreak = getActiveBreak(validBreaks, now);
        
        // Calculate worked time in seconds
        let workedSeconds = elapsedSeconds;
        
        // Subtract completed breaks
        validBreaks.forEach((b) => {
            if (b.start && b.end) {
                const breakStart = b.start instanceof Date ? b.start : new Date(b.start);
                const breakEnd = b.end instanceof Date ? b.end : new Date(b.end);
                if (now >= breakEnd) {
                    // Completed break - subtract full duration
                    workedSeconds -= (breakEnd.getTime() - breakStart.getTime()) / 1000;
                } else if (activeBreak && b.start === activeBreak.start) {
                    // Active break - subtract time until break start
                    workedSeconds -= (breakStart.getTime() - startTime.getTime()) / 1000;
                    // Don't count time during active break
                    workedSeconds -= (now.getTime() - breakStart.getTime()) / 1000;
                }
            }
        });
        
        // Subtract duration-based breaks
        const durationBreaks = breaks.filter((b) => !b.start && !b.end && b.duration);
        durationBreaks.forEach((b) => {
            workedSeconds -= (b.duration || 0) * 60;
        });
        
        // Calculate remaining time in seconds
        const plannedSeconds = plannedWork * 60;
        const remainingSeconds = Math.max(0, plannedSeconds - workedSeconds);
        
        return remainingSeconds / 60; // Convert back to minutes with fractional part
    }, [plannedWork, workedMinutes, startTime, breaks, currentTime]);
    
    const remainingMinutes = Math.floor(remainingTimeWithSeconds);
    const remainingSeconds = Math.floor((remainingTimeWithSeconds % 1) * 60);
    
    const overtimeMinutes = Math.max(0, workedMinutes - plannedWork);
    const hasOvertime = overtimeMinutes > 0;

    // Update current time every second for real-time break detection
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Get active break - handle edge cases
    const activeBreak = useMemo(() => {
        // Edge case: no breaks or no start time
        if (!breaks || breaks.length === 0 || !startTime) return null;
        
        // Edge case: invalid breaks array
        try {
            return getActiveBreak(breaks, currentTime);
        } catch (error) {
            // Silently handle break detection errors to prevent UI crashes
            return null;
        }
    }, [breaks, currentTime, startTime]);

    const displayMode = getDisplayMode(activeBreak);

    // Format break end time for display - using utility function with error handling
    const breakEndTimeString = useMemo(() => {
        if (displayMode === 'break' && activeBreak && activeBreak.end) {
            try {
                // Edge case: invalid date
                if (!(activeBreak.end instanceof Date) || isNaN(activeBreak.end.getTime())) {
                    return null;
                }
                const breakEndMinutes = activeBreak.end.getHours() * 60 + activeBreak.end.getMinutes();
                return formatTimeFromMinutes(breakEndMinutes);
            } catch (error) {
                // Silently handle formatting errors
                return null;
            }
        }
        return null;
    }, [displayMode, activeBreak]);

    return (
        <div className="mb-6">
            {/* Große Hauptanzeige - zeigt immer geleistete Arbeitszeit, Aufschrift wechselt bei Pause */}
            <div 
                className="p-12 bg-white/20 rounded-xl text-white text-center mb-4 shadow-sm ring-1 ring-white/10"
                role="status"
                aria-live="polite"
                aria-label={displayMode === 'break' && breakEndTimeString ? `Pause bis ${breakEndTimeString}, Geleistete Arbeitszeit: ${formatMinutesCompact(workedMinutes)}` : `Geleistete Arbeitszeit: ${formatMinutesCompact(workedMinutes)}`}
            >
                {displayMode === 'break' && breakEndTimeString ? (
                    <>
                        <p className="text-lg text-white/80 mb-4" style={{marginTop: "-2rem"}}>
                            Pause bis {breakEndTimeString}
                        </p>
                        <p 
                            className="text-8xl font-bold blinking-text"
                            aria-label={`${formatMinutesCompact(workedMinutes)} geleistete Arbeitszeit`}
                        >
                            {formatMinutesCompact(workedMinutes)}
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-lg text-white/80 mb-4" style={{marginTop: "-2rem"}}>Geleistete Arbeitszeit</p>
                        <p className="text-8xl font-bold" aria-label={`${formatMinutesCompact(workedMinutes)} geleistete Arbeitszeit`}>
                            {formatMinutesCompact(workedMinutes)}
                        </p>
                    </>
                )}
            </div>

            {/* Zusätzliche Informationen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                    className="p-4 bg-white/20 rounded-xl text-white shadow-sm ring-1 ring-white/10"
                    role="status"
                    aria-label={hasOvertime ? `Überstunden: ${formatMinutesReadable(overtimeMinutes)}` : `Verbleibende Zeit: ${formatMinutesReadable(remainingMinutes)}`}
                >
                    <p className="text-sm">{hasOvertime ? "Überstunden" : "Verbleibende Zeit"}</p>
                    <div className="text-2xl font-bold">
                        {hasOvertime ? formatMinutesReadable(overtimeMinutes) : formatMinutesReadable(remainingMinutes)}
                    </div>
                    <div className="text-sm text-white/70 mt-1">
                        {hasOvertime ? formatSecondsReadable(overtimeMinutes) : `${remainingSeconds} Sekunde${remainingSeconds !== 1 ? 'n' : ''}`}
                    </div>
                </div>
                <div 
                    className="p-4 bg-white/20 rounded-xl text-white shadow-sm ring-1 ring-white/10"
                    role="status"
                    aria-label={`Voraussichtliches Arbeitsende: ${endTime}`}
                >
                    <p className="text-sm">Vorauss. Arbeitsende</p>
                    <p className="text-6xl font-bold">{endTime}</p>
                </div>
            </div>
        </div>
    );
};

export default TimeDisplay;
