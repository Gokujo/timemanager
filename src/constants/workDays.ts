import { getDailyWorkHours } from '../utils/userSettingsUtils';

// Dynamische Arbeitszeiten aus Benutzereinstellungen
export const getWorkDays = (): Record<number, number> => {
  return getDailyWorkHours();
};

// Fallback für statische Verwendung
export const WORK_DAYS: Record<number, number> = {
  1: 480, // Montag
  2: 480, // Dienstag
  3: 480, // Mittwoch
  4: 480, // Donnerstag
  5: 480, // Freitag
  6: 0,   // Samstag
  0: 0    // Sonntag
};

export const DAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];