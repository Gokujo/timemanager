// Mock data fixtures for testing
import { TEST_CONSTANTS } from '../testConfig';

// Mock user settings data
export const mockUserSettings = {
  default: {
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
    defaultBreaks: [
      {
        start: '12:00',
        end: '12:30',
        duration: 30,
      },
      {
        start: '15:00',
        end: '15:15',
        duration: 15,
      },
    ],
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
  
  // Modified settings for testing
  modified: {
    timeFormat: 'hours' as const,
    dailyWorkHours: {
      monday: 420, // 7 hours
      tuesday: 480, // 8 hours
      wednesday: 540, // 9 hours
      thursday: 480, // 8 hours
      friday: 360, // 6 hours
      saturday: 0,
      sunday: 0,
    },
    defaultBreaks: [
      {
        start: '12:00',
        end: '13:00',
        duration: 60, // 1 hour lunch
      },
    ],
    plans: {
      VOR_ORT: {
        name: 'Vor Ort',
        start: 420, // 7:00 AM
        end: 1020, // 5:00 PM
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
  
  // Invalid settings for testing validation
  invalid: {
    timeFormat: 'invalid' as any,
    dailyWorkHours: {
      monday: -60, // Negative hours
      tuesday: 1500, // More than 24 hours
      wednesday: 480,
      thursday: 480,
      friday: 480,
      saturday: 0,
      sunday: 0,
    },
    defaultBreaks: [
      {
        start: '25:00', // Invalid time
        end: '12:30',
        duration: -30, // Negative duration
      },
    ],
    plans: {
      VOR_ORT: {
        name: 'Vor Ort',
        start: 1080, // End time before start time
        end: 480,
        max: 1500, // Exceeds ArbZG limit
      },
      HOMEOFFICE: {
        name: 'Homeoffice',
        start: 480,
        end: 1080,
        max: 600,
      },
    },
  },
};

// Mock time tracking state data
export const mockTimeTrackingState = {
  stopped: {
    plan: 'VOR_ORT',
    status: 'stopped' as const,
    startTime: null,
    manualStart: '',
    workedMinutes: 0,
    breaks: [],
    plannedWork: 480,
    warnings: [],
  },
  
  running: {
    plan: 'VOR_ORT',
    status: 'running' as const,
    startTime: new Date('2025-01-27T08:00:00'),
    manualStart: '08:00',
    workedMinutes: 120, // 2 hours worked
    breaks: [],
    plannedWork: 480,
    warnings: [],
  },
  
  paused: {
    plan: 'HOMEOFFICE',
    status: 'paused' as const,
    startTime: new Date('2025-01-27T08:00:00'),
    manualStart: '08:00',
    workedMinutes: 240, // 4 hours worked
    breaks: [
      {
        start: new Date('2025-01-27T12:00:00'),
        end: new Date('2025-01-27T12:30:00'),
        duration: 30,
      },
    ],
    plannedWork: 480,
    warnings: [],
  },
  
  // State with ArbZG violations
  arbzgViolation: {
    plan: 'VOR_ORT',
    status: 'running' as const,
    startTime: new Date('2025-01-27T08:00:00'),
    manualStart: '08:00',
    workedMinutes: 420, // 7 hours worked
    breaks: [], // No breaks - violates ArbZG
    plannedWork: 480,
    warnings: [
      'Nach 6 Stunden Arbeit ist eine Pause von mindestens 30 Minuten erforderlich.',
    ],
  },
};

// Mock break data
export const mockBreaks = {
  shortBreak: {
    start: new Date('2025-01-27T10:30:00'),
    end: new Date('2025-01-27T10:45:00'),
    duration: 15,
  },
  
  lunchBreak: {
    start: new Date('2025-01-27T12:00:00'),
    end: new Date('2025-01-27T12:30:00'),
    duration: 30,
  },
  
  longBreak: {
    start: new Date('2025-01-27T15:00:00'),
    end: new Date('2025-01-27T15:45:00'),
    duration: 45,
  },
  
  // Invalid break data
  invalidBreak: {
    start: new Date('2025-01-27T15:00:00'),
    end: new Date('2025-01-27T14:30:00'), // End before start
    duration: -30, // Negative duration
  },
};

// Mock work plan data
export const mockWorkPlans = {
  vorOrt: {
    name: 'Vor Ort',
    start: 480, // 8:00 AM
    end: 1080, // 6:00 PM
    max: 600, // 10 hours
  },
  
  homeoffice: {
    name: 'Homeoffice',
    start: 480, // 8:00 AM
    end: 1080, // 6:00 PM
    max: 600, // 10 hours
  },
  
  flexible: {
    name: 'Flexibel',
    start: 420, // 7:00 AM
    end: 1140, // 7:00 PM
    max: 600, // 10 hours
  },
  
  // Invalid work plan
  invalid: {
    name: 'Ungültig',
    start: 1080, // End time before start time
    end: 480,
    max: 1500, // Exceeds ArbZG limit
  },
};

// Mock German text data for language testing
export const mockGermanTexts = {
  timeUnits: {
    hours: ['Stunde', 'Stunden'],
    minutes: ['Minute', 'Minuten'],
    days: ['Tag', 'Tage'],
    weeks: ['Woche', 'Wochen'],
  },
  
  workDays: {
    monday: 'Montag',
    tuesday: 'Dienstag',
    wednesday: 'Mittwoch',
    thursday: 'Donnerstag',
    friday: 'Freitag',
    saturday: 'Samstag',
    sunday: 'Sonntag',
  },
  
  workPlans: {
    vorOrt: 'Vor Ort',
    homeoffice: 'Homeoffice',
    flexible: 'Flexibel',
  },
  
  errorMessages: {
    invalidTime: 'Ungültige Zeitangabe',
    requiredField: 'Dieses Feld ist erforderlich',
    maxWorkTimeExceeded: 'Maximale Arbeitszeit überschritten',
    breakRequired: 'Pause erforderlich',
    invalidBreakTime: 'Ungültige Pausenzeit',
  },
  
  successMessages: {
    settingsSaved: 'Einstellungen gespeichert',
    workStarted: 'Arbeit gestartet',
    workPaused: 'Arbeit pausiert',
    workStopped: 'Arbeit beendet',
    breakStarted: 'Pause gestartet',
    breakEnded: 'Pause beendet',
  },
  
  uiLabels: {
    startWork: 'Arbeit starten',
    pauseWork: 'Arbeit pausieren',
    stopWork: 'Arbeit beenden',
    startBreak: 'Pause starten',
    endBreak: 'Pause beenden',
    settings: 'Einstellungen',
    workPlan: 'Arbeitsplan',
    dailyHours: 'Tägliche Stunden',
    timeFormat: 'Zeitformat',
    resetToDefaults: 'Auf Standard zurücksetzen',
  },
};

// Mock performance data
export const mockPerformanceData = {
  bundleSize: {
    current: 450, // KB
    threshold: TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.BUNDLE_SIZE,
    passed: true,
  },
  
  loadTime: {
    current: 1500, // ms
    threshold: TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.INITIAL_LOAD_TIME,
    passed: true,
  },
  
  realTimeUpdate: {
    current: 80, // ms
    threshold: TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.REAL_TIME_UPDATE,
    passed: true,
  },
  
  memoryUsage: {
    current: 35, // MB
    threshold: TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.MEMORY_USAGE,
    passed: true,
  },
};

// Mock edge case data
export const mockEdgeCases = {
  // Very long German text
  longGermanText: 'Dies ist ein sehr langer deutscher Text, der verwendet wird, um zu testen, wie die Anwendung mit langen Texten umgeht. Dieser Text sollte korrekt angezeigt werden, ohne dass die Benutzeroberfläche beschädigt wird.',
  
  // Zero work hours
  zeroWorkHours: {
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
  },
  
  // Maximum work hours (24 hours)
  maxWorkHours: {
    monday: 1440,
    tuesday: 1440,
    wednesday: 1440,
    thursday: 1440,
    friday: 1440,
    saturday: 1440,
    sunday: 1440,
  },
  
  // Boundary values for ArbZG
  arbzgBoundaries: {
    exactly6Hours: 360, // Exactly 6 hours
    exactly9Hours: 540, // Exactly 9 hours
    exactly10Hours: 600, // Exactly 10 hours (max)
    justUnder6Hours: 359, // Just under 6 hours
    justOver6Hours: 361, // Just over 6 hours
    justUnder9Hours: 539, // Just under 9 hours
    justOver9Hours: 541, // Just over 9 hours
    justUnder10Hours: 599, // Just under 10 hours
    justOver10Hours: 601, // Just over 10 hours
  },
  
  // Invalid time inputs
  invalidTimeInputs: [
    '25:00', // Invalid hour
    '12:60', // Invalid minute
    'abc:def', // Non-numeric
    '12', // Missing minutes
    ':30', // Missing hours
    '12:30:45', // Too many parts
    '', // Empty string
    '   ', // Whitespace only
  ],
  
  // localStorage failure scenarios
  localStorageFailures: [
    'QUOTA_EXCEEDED_ERR',
    'SECURITY_ERR',
    'UNKNOWN_ERR',
  ],
};
