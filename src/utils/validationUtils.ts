import { Break } from "../interfaces/break";
import { Plan } from "../interfaces/plan";
import { getWorkDays, DAY_NAMES } from "../constants/workDays";
import { calculatePresenceTime, calculateTotalBreakTime } from "./timeUtils";

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
}

/**
 * Validates work time according to German labor law (ArbZG)
 */
export const validateWorkTime = (
  workedMinutes: number,
  breaks: Break[],
  startTime: Date | null,
  status: 'stopped' | 'running' | 'paused',
  plan: Plan,
  plannedWork: number
): ValidationResult => {
  const warnings: string[] = [];
  const totalBreaks = calculateTotalBreakTime(breaks);
  const presenceTime = calculatePresenceTime(startTime, status);
  const today = new Date();
  const dayOfWeek = today.getDay();
  const workDays = getWorkDays();
  const minWorkMinutes = workDays[dayOfWeek];

  // Check for required breaks based on worked time
  if (workedMinutes > 6 * 60 && totalBreaks < 30) {
    warnings.push('ArbZG: Mind. 30 Min Pause nach 6h Arbeit erforderlich!');
  }

  if (workedMinutes > 9 * 60 && totalBreaks < 45) {
    warnings.push('ArbZG: Mind. 45 Min Pause nach 9h Arbeit erforderlich!');
  }

  // Check for maximum work time
  if (workedMinutes > 10 * 60) {
    warnings.push('ArbZG: Maximale Arbeitszeit von 10h überschritten!');
  }

  // Check for maximum presence time
  if (presenceTime > plan.max) {
    warnings.push(`ArbZG: Maximale Anwesenheitszeit (${plan.name}: ${Math.floor(plan.max / 60)}:${Math.floor(plan.max % 60).toString().padStart(2, '0')}) überschritten!`);
  }

  // Check if expected end time exceeds plan end time
  if (startTime && status !== 'stopped') {
    const totalBreaks = breaks.reduce((sum, b) => sum + (b.duration || 0), 0);
    const remaining = plannedWork - workedMinutes;
    const endTimeDate = new Date(
      startTime.getTime() + (workedMinutes + remaining + totalBreaks) * 60 * 1000
    );

    // Convert end time to minutes since midnight
    const endTimeMinutes = endTimeDate.getHours() * 60 + endTimeDate.getMinutes();

    if (endTimeMinutes > plan.end) {
      warnings.push(`Vorauss. Arbeitsende (${endTimeDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}) darf ${plan.name} Endzeit (${Math.floor(plan.end / 60)}:${(plan.end % 60).toString().padStart(2, '0')}) nicht überschreiten!`);
    }
  }

  // Check for minimum work time
  if (status === 'stopped' && workedMinutes > 0 && workedMinutes < minWorkMinutes) {
    warnings.push(`Mindestarbeitszeit (${Math.floor(minWorkMinutes / 60)}:${Math.floor(minWorkMinutes % 60).toString().padStart(2, '0')}) für ${DAY_NAMES[dayOfWeek]} nicht erreicht!`);
  }

  // Check if planned work is less than minimum required
  if (plannedWork < minWorkMinutes) {
    warnings.push(`Geplante Arbeitszeit (${Math.floor(plannedWork / 60)}:${Math.floor(plannedWork % 60).toString().padStart(2, '0')}) unter Mindestarbeitszeit (${Math.floor(minWorkMinutes / 60)}:${Math.floor(minWorkMinutes % 60).toString().padStart(2, '0')})!`);
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
};

/**
 * Validates if a time is valid for starting work
 */
export const validateStartTime = (startTimeStr: string): ValidationResult => {
  const warnings: string[] = [];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const workDays = getWorkDays();

  // Check if it's a non-working day based on user settings
  if (workDays[dayOfWeek] === 0) {
    const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    warnings.push(`${dayNames[dayOfWeek]} ist ein arbeitsfreier Tag!`);
    return { isValid: false, warnings };
  }

  // Check if start time is in the future
  const [hours, minutes] = startTimeStr.split(':').map(Number);
  const now = new Date();
  // DST-Fix: Verwende Date-Konstruktor statt setHours() für korrekte Zeitzonen-Behandlung
  const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

  if (startTime > now) {
    warnings.push('Arbeitsbeginn darf nicht in der Zukunft liegen!');
    return { isValid: false, warnings };
  }

  return { isValid: true, warnings };
};
