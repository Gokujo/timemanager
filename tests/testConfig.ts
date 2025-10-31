// Test configuration constants and utilities
export const TEST_CONSTANTS = {
  // German time formats
  TIME_FORMATS: {
    GERMAN_DATE: 'DD.MM.YYYY',
    GERMAN_TIME: 'HH:MM',
    GERMAN_DATETIME: 'DD.MM.YYYY HH:MM',
  },
  
  // Work day defaults (8 hours = 480 minutes)
  DEFAULT_WORK_HOURS: {
    MONDAY: 480,
    TUESDAY: 480,
    WEDNESDAY: 480,
    THURSDAY: 480,
    FRIDAY: 480,
    SATURDAY: 0,
    SUNDAY: 0,
  },
  
  // Arbeitszeitschutzgesetz limits
  ARBZG_LIMITS: {
    MAX_DAILY_WORK: 600, // 10 hours in minutes
    MANDATORY_BREAK_6H: 30, // 30 minutes after 6 hours
    MANDATORY_BREAK_9H: 45, // 45 minutes after 9 hours
  },
  
  // Test data
  MOCK_USER_SETTINGS: {
    timeFormat: 'minutes' as const,
    dailyWorkHours: {
      monday: 480,
      tuesday: 480,
      wednesday: 480,
      thursday: 480,
      friday: 480,
      saturday: 0,
      sunday: 0,
    },
    defaultBreaks: [],
    plans: {
      VOR_ORT: {
        name: 'Vor Ort',
        start: 480, // 8:00 AM
        end: 1080, // 6:00 PM
        max: 600, // 10 hours
      },
      HOMEOFFICE: {
        name: 'Homeoffice',
        start: 480, // 8:00 AM
        end: 1080, // 6:00 PM
        max: 600, // 10 hours
      },
    },
  },
  
  // Performance thresholds
  PERFORMANCE_THRESHOLDS: {
    INITIAL_LOAD_TIME: 2000, // 2 seconds
    REAL_TIME_UPDATE: 100, // 100ms
    BUNDLE_SIZE: 500, // 500KB gzipped
    MEMORY_USAGE: 50, // 50MB peak
  },
};

// Test utilities
export const createMockDate = (year: number, month: number, day: number, hour: number = 0, minute: number = 0): Date => {
  return new Date(year, month - 1, day, hour, minute);
};

export const createMockBreak = (startHour: number, startMinute: number, endHour: number, endMinute: number) => {
  const start = createMockDate(2025, 1, 27, startHour, startMinute);
  const end = createMockDate(2025, 1, 27, endHour, endMinute);
  return {
    start,
    end,
    duration: (end.getTime() - start.getTime()) / (1000 * 60), // duration in minutes
  };
};

export const createMockTimeTrackingState = (overrides: Partial<any> = {}) => {
  return {
    plan: 'VOR_ORT',
    status: 'stopped' as const,
    startTime: null,
    manualStart: '',
    workedMinutes: 0,
    breaks: [],
    plannedWork: 480,
    warnings: [],
    ...overrides,
  };
};

// German language test helpers
export const GERMAN_TEXT_PATTERNS = {
  TIME_UNITS: ['Stunde', 'Stunden', 'Minute', 'Minuten'],
  DAYS: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
  WORK_PLANS: ['Vor Ort', 'Homeoffice'],
  ERROR_MESSAGES: ['Fehler', 'Warnung', 'Ungültig', 'Erforderlich'],
};

export const validateGermanText = (text: string): boolean => {
  // Check if text contains German-specific characters or common German words
  const germanPattern = /[äöüßÄÖÜ]|[Ss]tunde|[Mm]inute|[Tt]ag|[Ww]oche|[Mm]onat|[Jj]ahr/;
  return germanPattern.test(text);
};
