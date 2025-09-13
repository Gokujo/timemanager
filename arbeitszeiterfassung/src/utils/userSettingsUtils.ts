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
    console.error('Fehler beim Laden der Benutzereinstellungen:', error);
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
