import { Break } from '../interfaces/break';

/**
 * Ermittelt die aktive Pause aus einem Array von Pausen basierend auf der aktuellen Zeit
 * Wenn mehrere Pausen aktiv sind, wird die längste Pause zurückgegeben (FR-010)
 * @param breaks - Array von Pausen mit Start- und Endzeit
 * @param currentTime - Aktuelle Zeit für die Prüfung
 * @returns Aktive Pause oder null, falls keine Pause aktiv ist. Wenn mehrere aktiv sind, die längste.
 */
export function getActiveBreak(breaks: Break[], currentTime: Date): Break | null {
  const activeBreaks: Break[] = [];

  // Sammle alle aktiven Pausen
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
      activeBreaks.push({
        ...breakItem,
        start,
        end
      });
    }
  }

  // Wenn keine Pause aktiv ist, return null
  if (activeBreaks.length === 0) {
    return null;
  }

  // Wenn nur eine Pause aktiv ist, return diese
  if (activeBreaks.length === 1) {
    return activeBreaks[0];
  }

  // Wenn mehrere Pausen aktiv sind, wähle die längste (FR-010)
  let longestBreak = activeBreaks[0];
  let longestDuration = longestBreak.end!.getTime() - longestBreak.start!.getTime();

  for (const activeBreak of activeBreaks) {
    const duration = activeBreak.end!.getTime() - activeBreak.start!.getTime();
    if (duration > longestDuration) {
      longestBreak = activeBreak;
      longestDuration = duration;
    }
  }

  return longestBreak;
}

/**
 * Ermittelt den Anzeigemodus basierend auf der aktiven Pause
 * @param activeBreak - Aktive Pause oder null
 * @returns 'break' wenn eine aktive Pause vorhanden ist, 'work' sonst
 */
export function getDisplayMode(activeBreak: Break | null): 'work' | 'break' {
  return activeBreak ? 'break' : 'work';
}

