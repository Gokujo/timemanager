import { Break } from "../interfaces/break";
import { getActiveBreak } from "./breakUtils";

/**
 * Calculates the total worked time in minutes
 * For active breaks, the worked time is frozen (doesn't increase) until the break ends
 */
export const calculateWorkedTime = (
  startTime: Date | null, 
  breaks: Break[], 
  status: 'stopped' | 'running' | 'paused'
): number => {
  if (!startTime || status === 'stopped') return 0;

  const now = new Date();
  
  // Ensure breaks have proper Date objects for active break detection
  const validBreaks = breaks.filter((b) => {
    if (!b.start || !b.end) return false;
    // Ensure they are Date objects
    const start = b.start instanceof Date ? b.start : new Date(b.start);
    const end = b.end instanceof Date ? b.end : new Date(b.end);
    // Ensure dates are valid
    return !isNaN(start.getTime()) && !isNaN(end.getTime());
  }).map((b) => ({
    ...b,
    start: b.start instanceof Date ? b.start : new Date(b.start!),
    end: b.end instanceof Date ? b.end : new Date(b.end!)
  }));
  
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
  const breakTime = validBreaks.reduce((sum, b) => {
    if (b.start && b.end) {
      // Only count completed breaks (breaks that have ended)
      if (now >= b.end) {
        // For completed breaks, use full duration
        return sum + (b.end.getTime() - b.start.getTime()) / 1000 / 60;
      }
      // Don't count active or future breaks
      return sum;
    }
    return sum;
  }, 0);

  // Also add duration-based breaks (breaks without start/end times)
  const durationBreaks = breaks.filter((b) => !b.start && !b.end && b.duration);
  const durationBreakTime = durationBreaks.reduce((sum, b) => sum + (b.duration || 0), 0);

  return Math.max(0, Math.round(elapsed - breakTime - durationBreakTime));
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
  const validBreaks = breaks.filter((b) => {
    if (!b.start || !b.end) return false;
    const start = b.start instanceof Date ? b.start : new Date(b.start);
    const end = b.end instanceof Date ? b.end : new Date(b.end);
    return !isNaN(start.getTime()) && !isNaN(end.getTime());
  }).map((b) => ({
    ...b,
    start: b.start instanceof Date ? b.start : new Date(b.start!),
    end: b.end instanceof Date ? b.end : new Date(b.end!)
  }));
  
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
    console.error('Error saving state to localStorage:', error);
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
    console.error('Error loading state from localStorage:', error);
    return null;
  }
};
