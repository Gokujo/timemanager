import { Break } from "../interfaces/break";

/**
 * Calculates the total worked time in minutes
 */
export const calculateWorkedTime = (
  startTime: Date | null, 
  breaks: Break[], 
  status: 'stopped' | 'running' | 'paused'
): number => {
  if (!startTime || status === 'stopped') return 0;

  const now = new Date();
  const elapsed = (now.getTime() - startTime.getTime()) / 1000 / 60;
  
  // Calculate break time considering both duration and start/end times
  const breakTime = breaks.reduce((sum, b) => {
    if (b.start && b.end) {
      // Use actual start/end time calculation
      return sum + (b.end.getTime() - b.start.getTime()) / 1000 / 60;
    } else if (b.duration) {
      // Use duration value
      return sum + b.duration;
    }
    return sum;
  }, 0);

  return Math.max(0, elapsed - breakTime);
};

/**
 * Calculates the expected end time based on planned work and breaks
 */
export const calculateEndTime = (
  startTime: Date | null, 
  breaks: Break[], 
  plannedWork: number, 
  workedMinutes: number,
  status: 'stopped' | 'running' | 'paused'
): string => {
  if (!startTime || status === 'stopped') return '-';

  const totalBreaks = breaks.reduce((sum, b) => sum + (b.duration || 0), 0);
  const remaining = plannedWork - workedMinutes;
  const end = new Date(
    startTime.getTime() + (workedMinutes + remaining + totalBreaks) * 60 * 1000
  );

  return end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
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
