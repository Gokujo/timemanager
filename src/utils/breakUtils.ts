import { Break } from '../interfaces/break';

/**
 * Ermittelt die aktive Pause aus einem Array von Pausen basierend auf der aktuellen Zeit
 * @param breaks - Array von Pausen mit Start- und Endzeit
 * @param currentTime - Aktuelle Zeit für die Prüfung
 * @returns Aktive Pause oder null, falls keine Pause aktiv ist
 */
export function getActiveBreak(breaks: Break[], currentTime: Date): Break | null {
  // Prüfe jede Pause auf Aktivität
  for (const breakItem of breaks) {
    // Überspringe Pausen ohne Start- oder Endzeit
    if (!breakItem.start || !breakItem.end) {
      continue;
    }

    // Ensure dates are Date objects
    const start = breakItem.start instanceof Date ? breakItem.start : new Date(breakItem.start);
    const end = breakItem.end instanceof Date ? breakItem.end : new Date(breakItem.end);

    // Ensure dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      continue;
    }

    // Pause ist aktiv, wenn aktuelle Zeit >= Startzeit und < Endzeit
    // Compare timestamps to avoid timezone issues
    if (currentTime.getTime() >= start.getTime() && currentTime.getTime() < end.getTime()) {
      return {
        ...breakItem,
        start,
        end
      };
    }
  }

  return null;
}

/**
 * Ermittelt den Anzeigemodus basierend auf der aktiven Pause
 * @param activeBreak - Aktive Pause oder null
 * @returns 'break' wenn eine aktive Pause vorhanden ist, 'work' sonst
 */
export function getDisplayMode(activeBreak: Break | null): 'work' | 'break' {
  return activeBreak ? 'break' : 'work';
}

