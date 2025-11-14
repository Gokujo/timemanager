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
        if (!startTime) {
            return {
                minutes: plannedWork,
                seconds: 0,
                hasActiveBreak: false
            };
        }
        
        const now = new Date();
        
        // Calculate break time in seconds
        // Normalize break dates to match the startTime date (same day)
        const validBreaks = breaks.filter((b) => {
            if (!b.start || !b.end) return false;
            const start = b.start instanceof Date ? b.start : new Date(b.start);
            const end = b.end instanceof Date ? b.end : new Date(b.end);
            return !isNaN(start.getTime()) && !isNaN(end.getTime());
        }).map((b) => {
            const start = b.start instanceof Date ? b.start : new Date(b.start);
            const end = b.end instanceof Date ? b.end : new Date(b.end);
            
            // Normalize break dates to match startTime date (same day)
            const normalizedStart = new Date(
                startTime.getFullYear(),
                startTime.getMonth(),
                startTime.getDate(),
                start.getHours(),
                start.getMinutes(),
                start.getSeconds(),
                start.getMilliseconds()
            );
            
            const normalizedEnd = new Date(
                startTime.getFullYear(),
                startTime.getMonth(),
                startTime.getDate(),
                end.getHours(),
                end.getMinutes(),
                end.getSeconds(),
                end.getMilliseconds()
            );
            
            return {
                ...b,
                start: normalizedStart,
                end: normalizedEnd
            };
        });
        
        // Detect active break with error handling (graceful degradation)
        let activeBreak: Break | null = null;
        try {
            activeBreak = getActiveBreak(validBreaks, now);
        } catch (error) {
            // Graceful degradation: fall back to normal calculation if break detection fails
            activeBreak = null;
        }
        
        // Freeze calculation time at break start if active break detected
        // Follows same pattern as calculateWorkedTime in timeUtils.ts
        let calculationTime: Date;
        if (activeBreak && activeBreak.start) {
            // Freeze time at break start - round down to nearest minute to prevent drift
            const breakStart = activeBreak.start;
            calculationTime = new Date(
                breakStart.getFullYear(),
                breakStart.getMonth(),
                breakStart.getDate(),
                breakStart.getHours(),
                breakStart.getMinutes(),
                0, // Set seconds and milliseconds to 0
                0
            );
        } else {
            // Use current time, but round down to nearest minute to prevent drift
            calculationTime = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                now.getHours(),
                now.getMinutes(),
                0, // Set seconds and milliseconds to 0
                0
            );
        }
        
        // Round start time down to nearest minute for consistent calculation
        const roundedStartTime = new Date(
            startTime.getFullYear(),
            startTime.getMonth(),
            startTime.getDate(),
            startTime.getHours(),
            startTime.getMinutes(),
            0,
            0
        );
        
        // Calculate elapsed time using calculationTime (frozen at break start if active break)
        const elapsedSeconds = (calculationTime.getTime() - roundedStartTime.getTime()) / 1000;
        
        // Calculate worked time in seconds
        let workedSeconds = elapsedSeconds;
        
        // Subtract completed breaks only
        // Note: Planned breaks (duration-only, without start/end times) are NOT subtracted here.
        // They should only be subtracted when they actually occur (have start/end times and are completed).
        validBreaks.forEach((b) => {
            if (b.start && b.end) {
                const breakStart = b.start instanceof Date ? b.start : new Date(b.start);
                const breakEnd = b.end instanceof Date ? b.end : new Date(b.end);
                // Use calculationTime instead of now for consistency
                if (calculationTime >= breakEnd) {
                    // Completed break - subtract full duration
                    workedSeconds -= (breakEnd.getTime() - breakStart.getTime()) / 1000;
                } else if (activeBreak && b.start === activeBreak.start) {
                    // Active break - subtract time until break start
                    workedSeconds -= (breakStart.getTime() - roundedStartTime.getTime()) / 1000;
                    // Don't count time during active break (already frozen at break start)
                }
            }
        });
        
        // Calculate remaining time in seconds with full precision
        const plannedSeconds = plannedWork * 60;
        
        // If active break, use calculationTime (frozen). Otherwise, use full precision from now
        let preciseElapsedSeconds: number;
        if (activeBreak && activeBreak.start) {
            // During active break: use calculationTime (already rounded to minutes)
            preciseElapsedSeconds = (calculationTime.getTime() - roundedStartTime.getTime()) / 1000;
        } else {
            // No active break: use full precision from current time
            preciseElapsedSeconds = (now.getTime() - roundedStartTime.getTime()) / 1000;
        }
        
        // Calculate worked time in seconds with full precision
        let preciseWorkedSeconds = preciseElapsedSeconds;
        
        // Subtract completed breaks only
        validBreaks.forEach((b) => {
            if (b.start && b.end) {
                const breakStart = b.start instanceof Date ? b.start : new Date(b.start);
                const breakEnd = b.end instanceof Date ? b.end : new Date(b.end);
                if (calculationTime >= breakEnd) {
                    // Completed break - subtract full duration
                    preciseWorkedSeconds -= (breakEnd.getTime() - breakStart.getTime()) / 1000;
                } else if (activeBreak && b.start === activeBreak.start) {
                    // Active break - subtract time until break start
                    preciseWorkedSeconds -= (breakStart.getTime() - roundedStartTime.getTime()) / 1000;
                }
            }
        });
        
        // Calculate remaining time in seconds with full precision
        // Allow negative values for overtime calculation
        const preciseRemainingSeconds = plannedSeconds - preciseWorkedSeconds;
        
        // Calculate remaining time in minutes (for minutes display)
        const remainingMinutes = preciseRemainingSeconds / 60;
        
        // Calculate seconds: extract from remaining seconds, or 0 if active break (frozen)
        // Use absolute value for seconds calculation to handle negative values correctly
        const remainingSecondsValue = activeBreak ? 0 : Math.floor(Math.abs(preciseRemainingSeconds) % 60);
        
        // Return object with both minutes and seconds for proper display
        return {
            minutes: remainingMinutes,
            seconds: remainingSecondsValue,
            hasActiveBreak: !!activeBreak
        };
    }, [plannedWork, workedMinutes, startTime, breaks, currentTime]);
    
    // Determine overtime based on remainingTimeWithSeconds (which is frozen during breaks)
    // If remainingTimeWithSeconds.minutes <= 0, we have overtime
    const hasOvertime = remainingTimeWithSeconds.minutes <= 0;
    
    // Calculate overtime: if negative remaining time, convert to positive overtime
    let overtimeMinutes = 0;
    let overtimeSeconds = 0;
    if (hasOvertime) {
        // Calculate total overtime in seconds (negative remaining time)
        const overtimeTotalSeconds = Math.abs(remainingTimeWithSeconds.minutes * 60);
        overtimeMinutes = Math.floor(overtimeTotalSeconds / 60);
        // Use actual seconds from remainingTimeWithSeconds if available, otherwise calculate from fractional minutes
        if (remainingTimeWithSeconds.hasActiveBreak) {
            overtimeSeconds = 0; // Frozen during break
        } else {
            // Calculate seconds from the fractional part of minutes, or use the actual seconds
            overtimeSeconds = Math.floor(overtimeTotalSeconds % 60);
        }
    }
    
    const remainingMinutes = hasOvertime ? 0 : Math.floor(remainingTimeWithSeconds.minutes);
    const remainingSeconds = hasOvertime ? 0 : remainingTimeWithSeconds.seconds;

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
                        {hasOvertime ? `${overtimeSeconds} Sekunde${overtimeSeconds !== 1 ? 'n' : ''}` : `${remainingSeconds} Sekunde${remainingSeconds !== 1 ? 'n' : ''}`}
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
