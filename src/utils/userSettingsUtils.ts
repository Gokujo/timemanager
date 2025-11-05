export interface UserSettings {
  timeFormat: 'minutes' | 'hours';
  dailyWorkHours: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
  defaultBreaks: Array<{
    start: string;
    end: string;
    duration: number;
  }>;
  plans: {
    VOR_ORT: {
      name: string;
      start: number;
      end: number;
      max: number;
    };
    HOMEOFFICE: {
      name: string;
      start: number;
      end: number;
      max: number;
    };
  };
}

const defaultUserSettings: UserSettings = {
  timeFormat: 'minutes',
  dailyWorkHours: {
    monday: 480,
    tuesday: 480,
    wednesday: 480,
    thursday: 480,
    friday: 480,
    saturday: 0,
    sunday: 0
  },
  defaultBreaks: [
    { start: '09:00', end: '09:15', duration: 15 },
    { start: '12:00', end: '12:30', duration: 30 }
  ],
  plans: {
    VOR_ORT: {
      name: 'Vor Ort',
      start: 360, // 6:00
      end: 1050, // 17:30
      max: 600 // 10h
    },
    HOMEOFFICE: {
      name: 'Homeoffice',
      start: 360, // 6:00
      end: 1200, // 20:00
      max: 600 // 10h
    }
  }
};

export const loadUserSettings = (): UserSettings => {
  try {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return { ...defaultUserSettings, ...parsed };
    }
  } catch (error) {
    // Error loading user settings
  }
  return defaultUserSettings;
};

export const getDailyWorkHours = (): Record<number, number> => {
  const settings = loadUserSettings();
  return {
    1: settings.dailyWorkHours.monday,
    2: settings.dailyWorkHours.tuesday,
    3: settings.dailyWorkHours.wednesday,
    4: settings.dailyWorkHours.thursday,
    5: settings.dailyWorkHours.friday,
    6: settings.dailyWorkHours.saturday,
    0: settings.dailyWorkHours.sunday
  };
};

export const getCustomPlans = () => {
  const settings = loadUserSettings();
  return settings.plans;
};

export const getDefaultBreaks = () => {
  const settings = loadUserSettings();
  return settings.defaultBreaks.map(breakItem => ({
    start: breakItem.start ? new Date(`2000-01-01T${breakItem.start}`) : null,
    end: breakItem.end ? new Date(`2000-01-01T${breakItem.end}`) : null,
    duration: breakItem.duration
  }));
};

export const getTimeFormat = (): 'minutes' | 'hours' => {
  const settings = loadUserSettings();
  return settings.timeFormat;
};

// Format time based on user settings
export const formatTimeForDisplay = (minutes: number): string => {
  const timeFormat = getTimeFormat();
  if (timeFormat === 'hours') {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
  return minutes.toString();
};

// Parse time input based on user settings
export const parseTimeInput = (value: string): number => {
  const timeFormat = getTimeFormat();
  if (timeFormat === 'hours') {
    const [hours, minutes] = value.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }
  return parseInt(value) || 0;
};

// Format minutes for display based on user settings
export const formatMinutesForDisplay = (minutes: number): string => {
  const timeFormat = getTimeFormat();
  if (timeFormat === 'hours') {
    if (minutes <= 0) return '00:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
  
  // Default to minutes format
  return `${Math.floor(minutes)}m`;
};

// Format minutes in a readable format (e.g., "8 Stunden 30 Minuten")
export const formatMinutesReadable = (minutes: number): string => {
  if (minutes <= 0) return '0 Minuten';
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  
  if (hours === 0) {
    return `${mins} Minute${mins !== 1 ? 'n' : ''}`;
  } else if (mins === 0) {
    return `${hours} Stunde${hours !== 1 ? 'n' : ''}`;
  } else {
    return `${hours} Stunde${hours !== 1 ? 'n' : ''} ${mins} Minute${mins !== 1 ? 'n' : ''}`;
  }
};

// Format minutes with seconds in a readable format
export const formatMinutesWithSecondsReadable = (minutes: number): string => {
  if (minutes <= 0) return '0 Minuten';
  
  const totalSeconds = Math.floor(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  let result = '';
  
  if (hours > 0) {
    result += `${hours} Stunde${hours !== 1 ? 'n' : ''}`;
  }
  
  if (mins > 0) {
    if (result) result += ' ';
    result += `${mins} Minute${mins !== 1 ? 'n' : ''}`;
  }
  
  if (secs > 0 || (hours === 0 && mins === 0)) {
    if (result) result += ' ';
    result += `${secs} Sekunde${secs !== 1 ? 'n' : ''}`;
  }
  
  return result || '0 Sekunden';
};

// Compact format like "8h 30m"
export const formatMinutesCompact = (minutes: number): string => {
  const totalMinutes = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}h ${mins}m`;
};

export const formatSecondsReadable = (minutes: number): string => {
  const totalSeconds = Math.floor(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  let result = '';
  if (secs > 0 || (hours === 0 && mins === 0)) {
    if (result) result += ' ';
    result += `${secs} Sekunde${secs !== 1 ? 'n' : ''}`;
  }
  
  return result || '0 Sekunden';
}