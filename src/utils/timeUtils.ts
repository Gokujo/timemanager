import { Break } from "../interfaces/break";
import { getActiveBreak } from "./breakUtils";

/**
 * Calculates the total worked time in minutes
 * For active breaks, the worked time is frozen (doesn't increase) until the break ends.
 * Planned breaks (duration-only, without start/end times) are NOT subtracted from worked time.
 * Only completed breaks (with start/end times that have ended) are subtracted.
 */
export const calculateWorkedTime = (
  startTime: Date | null, 
  breaks: Break[], 
  status: 'stopped' | 'running' | 'paused'
): number => {
  if (!startTime || status === 'stopped') return 0;

  const now = new Date();
  
  // Ensure breaks have proper Date objects for active break detection
  // Normalize break dates to match the startTime date (same day)
  const validBreaks = breaks.filter((b) => {
    if (!b.start || !b.end) return false;
    // Ensure they are Date objects
    const start = b.start instanceof Date ? b.start : new Date(b.start);
    const end = b.end instanceof Date ? b.end : new Date(b.end);
    // Ensure dates are valid
    return !isNaN(start.getTime()) && !isNaN(end.getTime());
  }).map((b) => {
    const start = b.start instanceof Date ? b.start : new Date(b.start!);
    const end = b.end instanceof Date ? b.end : new Date(b.end!);
    
    // Normalize break dates to match startTime date (same day)
    // This ensures breaks work correctly even if they were created with a different date
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
  
  // Check if there's currently an active break
  const activeBreak = getActiveBreak(validBreaks, now);
  
  // If there's an active break, freeze the time calculation
  // Calculate worked time up to the break start time (round down to avoid millisecond drift)
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
  
  const elapsed = (calculationTime.getTime() - roundedStartTime.getTime()) / 1000 / 60;
  
  // Calculate break time for completed breaks only
  // Count breaks that overlap with work time (even if they started before work started)
  // Active breaks are NOT included here because calculationTime is already frozen at break start
  const breakTime = validBreaks.reduce((sum, b) => {
    if (b.start && b.end) {
      // Skip active break - it's already handled by freezing calculationTime
      if (activeBreak && b.start === activeBreak.start && b.end === activeBreak.end) {
        return sum;
      }
      
      // For completed breaks, calculate the overlap between break and work time
      // Break must end after work started and start before calculation time
      if (b.end > roundedStartTime && b.start < calculationTime) {
        // Calculate the actual break time that overlaps with work time
        const breakStart = b.start > roundedStartTime ? b.start : roundedStartTime;
        const breakEnd = b.end < calculationTime ? b.end : calculationTime;
        
        // Only count if there's actual overlap (breakEnd > breakStart)
        if (breakEnd > breakStart) {
          return sum + (breakEnd.getTime() - breakStart.getTime()) / 1000 / 60;
        }
      }
      // Don't count breaks that don't overlap with work time
      return sum;
    }
    return sum;
  }, 0);

  // Note: Planned breaks (duration-only, without start/end times) are NOT subtracted here.
  // They should only be subtracted when they actually occur (have start/end times and are completed).

  return Math.max(0, Math.round(elapsed - breakTime));
};

/**
 * Calculates the expected end time based on planned work and breaks
 * Accounts for active breaks by freezing time during breaks
 */
export const calculateEndTime = (
  startTime: Date | null, 
  breaks: Break[], 
  plannedWork: number, 
  workedMinutes: number,
  status: 'stopped' | 'running' | 'paused'
): string => {
  if (!startTime || status === 'stopped') return '-';

  const now = new Date();
  
  // Ensure breaks have proper Date objects
  // Normalize break dates to match the startTime date (same day)
  const validBreaks = breaks.filter((b) => {
    if (!b.start || !b.end) return false;
    const start = b.start instanceof Date ? b.start : new Date(b.start);
    const end = b.end instanceof Date ? b.end : new Date(b.end);
    return !isNaN(start.getTime()) && !isNaN(end.getTime());
  }).map((b) => {
    const start = b.start instanceof Date ? b.start : new Date(b.start!);
    const end = b.end instanceof Date ? b.end : new Date(b.end!);
    
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
  
  // Check if there's currently an active break
  const activeBreak = getActiveBreak(validBreaks, now);
  
  // Calculate total break time (completed breaks only)
  const completedBreakTime = validBreaks.reduce((sum, b) => {
    if (b.start && b.end && now >= b.end) {
      // Only count completed breaks
      return sum + (b.end.getTime() - b.start.getTime()) / 1000 / 60;
    }
    return sum;
  }, 0);
  
  // Add duration-based breaks (breaks without start/end times)
  const durationBreaks = breaks.filter((b) => !b.start && !b.end && b.duration);
  const durationBreakTime = durationBreaks.reduce((sum, b) => sum + (b.duration || 0), 0);
  
  const totalBreakTime = completedBreakTime + durationBreakTime;
  
  // Calculate remaining work time
  const remaining = plannedWork - workedMinutes;
  
  // Calculate base end time: start time + worked time + remaining time + all completed breaks
  // This accounts for the fact that workedMinutes already excludes break time
  let endTime = new Date(
    startTime.getTime() + (workedMinutes + remaining + totalBreakTime) * 60 * 1000
  );
  
  // If there's an active break, add the time until break ends to the end time
  if (activeBreak && activeBreak.end) {
    const breakEndTime = activeBreak.end.getTime();
    const remainingBreakTime = breakEndTime > now.getTime() 
      ? (breakEndTime - now.getTime()) / 1000 / 60 
      : 0;
    
    // Add the remaining break time to shift the end time forward
    endTime = new Date(endTime.getTime() + remainingBreakTime * 60 * 1000);
  }

  return endTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Calculates the total break time in minutes
 */
export const calculateTotalBreakTime = (breaks: Break[]): number => {
  return breaks.reduce((sum, b) => sum + (b.duration || 0), 0);
};

/**
 * Calculates the presence time (total time since start, including breaks)
 */
export const calculatePresenceTime = (
  startTime: Date | null, 
  status: 'stopped' | 'running' | 'paused'
): number => {
  if (!startTime || status === 'stopped') return 0;
  return (new Date().getTime() - startTime.getTime()) / 1000 / 60;
};

/**
 * Formats minutes to hours and minutes string
 */
export const formatMinutes = (minutes: number): string => {
  if (minutes <= 0) return '0h 0m';
  return `${Math.floor(minutes / 60)}h ${Math.floor(minutes % 60)}m`;
};


/**
 * Formats minutes to hours, minutes and seconds string
 */
export const formatMinutesWithSeconds = (minutes: number): string => {
  if (minutes <= 0) return '0h 0m 0s';

  const totalSeconds = minutes * 60;
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  return `${hours}h ${mins}m ${secs}s`;
};

/**
 * Formats minutes to HH:MM format
 */
export const formatTimeFromMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Saves time tracking state to localStorage
 */
export const saveStateToLocalStorage = (state: any): void => {
  try {
    // Convert Date objects to ISO strings for storage
    const stateToSave = {
      ...state,
      startTime: state.startTime ? state.startTime.toISOString() : null,
      breaks: state.breaks.map((b: any) => ({
        ...b,
        start: b.start ? b.start.toISOString() : null,
        end: b.end ? b.end.toISOString() : null
      }))
    };
    localStorage.setItem('timeTrackingState', JSON.stringify(stateToSave));
  } catch (error) {
    // Error saving state to localStorage
  }
};

/**
 * Loads time tracking state from localStorage
 */
export const loadStateFromLocalStorage = (): any | null => {
  try {
    const savedState = localStorage.getItem('timeTrackingState');
    if (!savedState) return null;

    const parsedState = JSON.parse(savedState);

    // Check if the saved state is from today
    const savedDate = parsedState.startTime ? new Date(parsedState.startTime).toDateString() : null;
    const today = new Date().toDateString();

    if (savedDate !== today) {
      // If the saved state is not from today, clear it
      localStorage.removeItem('timeTrackingState');
      return null;
    }

    // Convert ISO strings back to Date objects
    return {
      ...parsedState,
      startTime: parsedState.startTime ? new Date(parsedState.startTime) : null,
      breaks: parsedState.breaks.map((b: any) => ({
        ...b,
        start: b.start ? new Date(b.start) : null,
        end: b.end ? new Date(b.end) : null
      }))
    };
  } catch (error) {
    // Error loading state from localStorage
    return null;
  }
};
