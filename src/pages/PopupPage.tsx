import React, { useState, useEffect, useMemo } from 'react';
import { formatMinutesForDisplay } from '../utils/userSettingsUtils';
import { loadStateFromLocalStorage, calculateWorkedTime, calculateEndTime, formatTimeFromMinutes } from '../utils/timeUtils';
import { getActiveBreak, getDisplayMode } from '../utils/breakUtils';
import { errorUtils } from '../utils/errorUtils';
import { Break } from '../interfaces/break';

const PopupPage: React.FC = () => {
  const [workedMinutes, setWorkedMinutes] = useState(0);
  const [plannedWork, setPlannedWork] = useState(480);
  const [endTime, setEndTime] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [status, setStatus] = useState<'stopped' | 'running' | 'paused'>('stopped');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load state from localStorage - runs on mount and periodically to sync with main app
  useEffect(() => {
    const loadState = () => {
      const savedState = loadStateFromLocalStorage();
      
      if (savedState) {
        // Ensure breaks are properly converted (loadStateFromLocalStorage already converts them)
        const convertedBreaks = Array.isArray(savedState.breaks) 
          ? savedState.breaks.map((b: any) => ({
              ...b,
              start: b.start ? (b.start instanceof Date ? b.start : new Date(b.start)) : null,
              end: b.end ? (b.end instanceof Date ? b.end : new Date(b.end)) : null
            }))
          : [];
        setBreaks(convertedBreaks);
        // startTime is already converted to Date by loadStateFromLocalStorage
        setStartTime(savedState.startTime || null);
        setStatus(savedState.status || 'stopped');
        setPlannedWork(savedState.plannedWork || 480);
      } else {
        // Fallback to URL parameters if no localStorage data
        const urlParams = new URLSearchParams(window.location.search);
        const startTimeParam = urlParams.get('startTime');
        const statusParam = urlParams.get('status') || 'stopped';

        setStartTime(startTimeParam ? new Date(startTimeParam) : null);
        setStatus(statusParam as 'stopped' | 'running' | 'paused');
        setPlannedWork(parseInt(urlParams.get('planned') || '480'));
      }
    };

    // Load initial state
    loadState();

    // Reload state periodically to sync with main app (every second)
    const stateInterval = setInterval(loadState, 1000);

    return () => clearInterval(stateInterval);
  }, []);

  // Update current time and worked minutes every second for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Update worked minutes if running or paused (to handle break detection)
      if (startTime && (status === 'running' || status === 'paused')) {
        // Ensure breaks are valid Date objects before calculating
        const validBreaks = breaks.map((b: Break) => ({
          ...b,
          start: b.start ? (b.start instanceof Date ? b.start : new Date(b.start)) : null,
          end: b.end ? (b.end instanceof Date ? b.end : new Date(b.end)) : null
        }));
        
        // calculateWorkedTime now correctly freezes time during active breaks
        const newWorked = calculateWorkedTime(startTime, validBreaks, status);
        setWorkedMinutes(newWorked);
        
        // Recalculate end time only if running (not paused/stopped)
        if (status === 'running') {
          const calculatedEndTime = calculateEndTime(
            startTime,
            validBreaks,
            plannedWork,
            newWorked,
            status
          );
          setEndTime(calculatedEndTime);
        }
      } else if (status === 'stopped') {
        setEndTime('');
        setWorkedMinutes(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, breaks, status, plannedWork]);

  // Get active break - handle edge cases and ensure proper date conversion
  const activeBreak = useMemo(() => {
    // Edge case: no breaks or no start time
    if (!breaks || breaks.length === 0 || !startTime) return null;
    
    try {
      // Ensure all breaks have proper Date objects
      const validBreaks = breaks.filter((b: Break) => {
        // Only consider breaks with both start and end times
        if (!b.start || !b.end) return false;
        
        // Ensure they are Date objects
        const start = b.start instanceof Date ? b.start : new Date(b.start);
        const end = b.end instanceof Date ? b.end : new Date(b.end);
        
        // Ensure dates are valid
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
        
        return true;
      }).map((b: Break) => ({
        ...b,
        start: b.start instanceof Date ? b.start : new Date(b.start!),
        end: b.end instanceof Date ? b.end : new Date(b.end!)
      }));
      
      if (validBreaks.length === 0) return null;
      
      return getActiveBreak(validBreaks, currentTime);
    } catch (error) {
      // Silently handle break detection errors to prevent UI crashes
      errorUtils.logError(error, { context: 'active break detection' });
      return null;
    }
  }, [breaks, currentTime, startTime]);

  const displayMode = getDisplayMode(activeBreak);

  // Format break end time for display
  const breakEndTimeString = useMemo(() => {
    if (displayMode === 'break' && activeBreak && activeBreak.end) {
      try {
        if (!(activeBreak.end instanceof Date) || isNaN(activeBreak.end.getTime())) {
          return null;
        }
        const breakEndMinutes = activeBreak.end.getHours() * 60 + activeBreak.end.getMinutes();
        return formatTimeFromMinutes(breakEndMinutes);
      } catch (error) {
        return null;
      }
    }
    return null;
  }, [displayMode, activeBreak]);

  const remainingMinutes = Math.max(0, plannedWork - workedMinutes);
  const overtimeMinutes = Math.max(0, workedMinutes - plannedWork);
  const hasOvertime = overtimeMinutes > 0;

  const handleClick = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="glass-effect p-8 rounded-xl text-center max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6">Arbeitszeit</h1>
        
        {/* Pause-Status-Anzeige - wird nur angezeigt wenn Pause aktiv ist */}
        {displayMode === 'break' && breakEndTimeString && (
          <div 
            className="bg-yellow-500/30 rounded-lg p-3 mb-4 text-center border-2 border-yellow-400/50"
            role="alert"
            aria-live="polite"
          >
            <p className="text-sm font-semibold text-yellow-100 blinking-text">
              ⏸️ Pause aktiv bis {breakEndTimeString}
            </p>
          </div>
        )}

        {/* Hauptanzeige - zeigt immer geleistete Arbeitszeit, Aufschrift wechselt bei Pause */}
        <div 
          className="bg-white/20 rounded-lg p-8 cursor-pointer hover:bg-white/30 transition-colors"
          onClick={handleClick}
          role="status"
          aria-live="polite"
          aria-label={displayMode === 'break' && breakEndTimeString ? `Pause bis ${breakEndTimeString}, Geleistete Arbeitszeit: ${formatMinutesForDisplay(workedMinutes)}` : `Geleistete Arbeitszeit: ${formatMinutesForDisplay(workedMinutes)}`}
        >
          {displayMode === 'break' && breakEndTimeString ? (
            <>
              <p className="text-sm text-white/80 mb-2">
                Pause bis {breakEndTimeString}
              </p>
              <p 
                className={`text-6xl font-bold text-white ${displayMode === 'break' ? 'blinking-text' : ''}`}
                aria-label={`${formatMinutesForDisplay(workedMinutes)} geleistete Arbeitszeit`}
              >
                {formatMinutesForDisplay(workedMinutes)}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-white/80 mb-2">Geleistete Arbeitszeit</p>
              <p className="text-6xl font-bold text-white" aria-label={`${formatMinutesForDisplay(workedMinutes)} geleistete Arbeitszeit`}>
                {formatMinutesForDisplay(workedMinutes)}
              </p>
            </>
          )}
          <p className="text-xs text-white/60 mt-2">
            {showDetails ? 'Klicken zum Ausblenden' : 'Klicken für Details'}
          </p>
        </div>

        {/* Details - Verbleibende Zeit und Arbeitsende */}
        {showDetails && (
          <div className="mt-4 space-y-4">
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-sm text-white/80 mb-1">
                {hasOvertime ? "Überstunden" : "Verbleibende Zeit"}
              </p>
              <p className="text-2xl font-bold text-white">
                {formatMinutesForDisplay(hasOvertime ? overtimeMinutes : remainingMinutes)}
              </p>
            </div>
            
            {endTime && (
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-sm text-white/80 mb-1">Vorauss. Arbeitsende</p>
                <p className="text-2xl font-bold text-white">{endTime}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 text-xs text-white/60">
          <p>Popup wird automatisch aktualisiert</p>
        </div>
      </div>
    </div>
  );
};

export default PopupPage;
