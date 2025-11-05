import { useState, useEffect, useCallback } from 'react';
import { Break } from '../interfaces/break';
import { getPlans } from '../constants/plans';
import { getWorkDays } from '../constants/workDays';
import { calculateWorkedTime, saveStateToLocalStorage, loadStateFromLocalStorage } from '../utils/timeUtils';
import { validateWorkTime, validateBreakOverlap, ValidationResult } from '../utils/validationUtils';
import { getDefaultBreaks } from '../utils/userSettingsUtils';
import { getActiveBreak } from '../utils/breakUtils';

export interface TimeTrackingState {
  plan: string;
  status: 'stopped' | 'running' | 'paused';
  startTime: Date | null;
  manualStart: string;
  workedMinutes: number;
  breaks: Break[];
  plannedWork: number;
  warnings: string[];
}

export interface TimeTrackingActions {
  setPlan: (plan: string) => void;
  setManualStart: (time: string) => void;
  setPlannedWork: (minutes: number) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  addBreak: () => void;
  deleteBreak: (index: number) => void;
  resetToDefaultBreaks: () => void;
  clearAllData: () => void;
  updateBreakDuration: (index: number, value: string) => void;
  updateBreakStart: (index: number, value: string) => void;
  updateBreakEnd: (index: number, value: string) => void;
}

// Erstelle vordefinierte Pausenzeiten aus Benutzereinstellungen
const createDefaultBreaks = (): Break[] => {
  return getDefaultBreaks();
};

export const useTimeTracking = (): [TimeTrackingState, TimeTrackingActions] => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const workDays = getWorkDays();
  const minWorkMinutes = workDays[dayOfWeek];
  const plans = getPlans();

  // Load state from localStorage or use defaults
  const savedState = loadStateFromLocalStorage();

  // State
  const [plan, setPlan] = useState<string>(savedState?.plan || 'VOR_ORT');
  const [status, setStatus] = useState<'stopped' | 'running' | 'paused'>(savedState?.status || 'stopped');
  const [startTime, setStartTime] = useState<Date | null>(savedState?.startTime || null);
  const [manualStart, setManualStart] = useState<string>(
    savedState?.manualStart || today.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  );
  const [workedMinutes, setWorkedMinutes] = useState<number>(savedState?.workedMinutes || 0);
  const [breaks, setBreaks] = useState<Break[]>(savedState?.breaks || createDefaultBreaks());
  const [plannedWork, setPlannedWork] = useState<number>(savedState?.plannedWork || minWorkMinutes || 480);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Calculate total break time
  const calculateTotalBreakTime = useCallback((): number => {
    return breaks.reduce((sum, b) => sum + (b.duration || 0), 0);
  }, [breaks]);

  // Automatically add breaks according to legal regulations
  const ensureRequiredBreaks = useCallback(() => {
    if (status !== 'running' && status !== 'stopped') return;

    const totalBreakTime = calculateTotalBreakTime();

    // No automatic breaks needed if sufficient breaks are already present
    if ((workedMinutes <= 6 * 60) || 
        (workedMinutes > 6 * 60 && workedMinutes <= 9 * 60 && totalBreakTime >= 30) ||
        (workedMinutes > 9 * 60 && totalBreakTime >= 45)) {
      return;
    }

    // Create a copy of the breaks array
    const newBreaks = [...breaks];

    // If no breaks or all breaks have start and end times, add a new break
    const hasIncompleteBreak = newBreaks.some(b => !b.start || !b.end);

    if (!hasIncompleteBreak) {
      // Add appropriate break based on worked time
      if (workedMinutes > 9 * 60 && totalBreakTime < 45) {
        newBreaks.push({ start: null, end: null, duration: 45 });
      } else if (workedMinutes > 6 * 60 && totalBreakTime < 30) {
        newBreaks.push({ start: null, end: null, duration: 30 });
      }

      setBreaks(newBreaks);
    }
  }, [workedMinutes, breaks, status, calculateTotalBreakTime]);

  // Validation
  const validateAndSetWarnings = useCallback(() => {
    if (!plan || !plans[plan]) return;

    // Ensure required breaks are added
    ensureRequiredBreaks();

    const result: ValidationResult = validateWorkTime(
      workedMinutes,
      breaks,
      startTime,
      status,
      plans[plan],
      plannedWork
    );

    setWarnings(result.warnings);
  }, [workedMinutes, breaks, startTime, status, plan, plannedWork, ensureRequiredBreaks, plans]);

  // Update worked minutes in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      if (status === 'running' || status === 'paused') {
        const calculatedTime = calculateWorkedTime(startTime, breaks, status);
        setWorkedMinutes(calculatedTime);
        validateAndSetWarnings();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, startTime, breaks, validateAndSetWarnings]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state = {
      plan,
      status,
      startTime,
      manualStart,
      workedMinutes,
      breaks,
      plannedWork,
      warnings
    };
    saveStateToLocalStorage(state);
  }, [plan, status, startTime, manualStart, workedMinutes, breaks, plannedWork, warnings]);

  // Actions
  const start = useCallback(() => {
    // Check if it's a non-working day based on user settings
    if (workDays[dayOfWeek] === 0) {
      const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
      setWarnings([`${dayNames[dayOfWeek]} ist ein arbeitsfreier Tag!`]);
      return;
    }

    const [hours, minutes] = manualStart.split(':').map(Number);
    const now = new Date();
    // DST-Fix: Verwende Date-Konstruktor statt setHours() für korrekte Zeitzonen-Behandlung
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

    if (start > now) {
      setWarnings(['Arbeitsbeginn darf nicht in der Zukunft liegt!']);
      return;
    }

    setStartTime(start);
    setStatus('running');
    // Pausenzeiten nicht zurücksetzen, da sie bereits vordefiniert sind
  }, [dayOfWeek, manualStart, workDays]);

  const pause = useCallback(() => {
    if (status === 'running') {
      // Erstelle eine neue Pause anstatt die letzte zu ändern
      const newBreaks = [...breaks, { start: new Date(), end: null, duration: 0 }];
      setBreaks(newBreaks);
      setStatus('paused');
    }
  }, [status, breaks]);

  const resume = useCallback(() => {
    const currentTime = new Date();
    const activeBreak = getActiveBreak(breaks, currentTime);

    // Check for active planned break first (FR-005)
    if (activeBreak) {
      const newBreaks = [...breaks];
      const breakIndex = newBreaks.findIndex(b => 
        b.start === activeBreak.start && b.end === activeBreak.end
      );

      if (breakIndex !== -1) {
        // Set end time to current time (FR-006)
        newBreaks[breakIndex].end = currentTime;
        // Calculate and save duration automatically (FR-007)
        const duration = (newBreaks[breakIndex].end.getTime() - newBreaks[breakIndex].start!.getTime()) / 1000 / 60;
        newBreaks[breakIndex].duration = Math.max(0, Math.round(duration));
        setBreaks(newBreaks);
        // Keep status 'running' (FR-008)
        return;
      }
    }

    // Normal resume logic for manual pause (status === 'paused')
    if (status === 'paused') {
      const newBreaks = [...breaks];
      const lastBreak = newBreaks[newBreaks.length - 1];
      if (lastBreak && lastBreak.start) {
        lastBreak.end = new Date();
        // Berechne die Dauer automatisch
        const duration = (lastBreak.end.getTime() - lastBreak.start.getTime()) / 1000 / 60;
        lastBreak.duration = Math.max(0, Math.round(duration));
      }
      setBreaks(newBreaks);
      setStatus('running');
    }
  }, [status, breaks]);

  const stop = useCallback(() => {
    setStatus('stopped');
    validateAndSetWarnings();
  }, [validateAndSetWarnings]);

  const addBreak = useCallback(() => {
    // Validate overlap before adding new break
    const newBreak: Break = { start: null, end: null, duration: 0 };
    const validation = validateBreakOverlap(newBreak, breaks);
    
    // Planned breaks (without start/end) cannot overlap, so always allow
    setBreaks([...breaks, newBreak]);
  }, [breaks]);

  const deleteBreak = useCallback((index: number) => {
    const newBreaks = breaks.filter((_, i) => i !== index);
    setBreaks(newBreaks);
    validateAndSetWarnings();
  }, [breaks, validateAndSetWarnings]);

  const resetToDefaultBreaks = useCallback(() => {
    setBreaks(createDefaultBreaks());
    validateAndSetWarnings();
  }, [validateAndSetWarnings]);

  const clearAllData = useCallback(() => {
    // Bestätigung des Benutzers einholen
    if (window.confirm('Möchten Sie wirklich alle Daten löschen? Diese Aktion kann nicht rückgängig gemacht werden.\n\nEs werden folgende Daten gelöscht:\n• Zeiterfassungsdaten (Arbeitszeiten, Pausen)\n• Benutzereinstellungen (Arbeitszeiten, Pläne, Pausenzeiten)\n• Alle Cookies und LocalStorage-Daten')) {
      // LocalStorage löschen
      localStorage.removeItem('timeTrackingState');
      localStorage.removeItem('userSettings');
      
      // Alle Cookies löschen
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
      });
      
      // State zurücksetzen
      setPlan('VOR_ORT');
      setStatus('stopped');
      setStartTime(null);
      const currentTime = new Date();
      setManualStart(currentTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
      setWorkedMinutes(0);
      setBreaks(createDefaultBreaks());
      setPlannedWork(minWorkMinutes || 480);
      setWarnings([]);
      
      // Seite neu laden um sicherzustellen, dass alle Daten gelöscht sind
      window.location.reload();
    }
  }, [minWorkMinutes]);

  const updateBreakDuration = useCallback((index: number, value: string) => {
    const newBreaks = [...breaks];
    newBreaks[index].duration = parseInt(value) || 0;
    setBreaks(newBreaks);
    validateAndSetWarnings();
  }, [breaks, validateAndSetWarnings]);

  const updateBreakStart = useCallback((index: number, value: string) => {
    if (!startTime) return;

    const newBreaks = [...breaks];
    const [hours, minutes] = value.split(':').map(Number);
    // DST-Fix: Verwende Date-Konstruktor statt setHours() für korrekte Zeitzonen-Behandlung
    const breakStart = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), hours, minutes, 0, 0);
    
    // Create updated break for validation
    const updatedBreak: Break = {
      ...newBreaks[index],
      start: breakStart
    };
    
    // Validate overlap before updating (exclude current break from existing breaks)
    const existingBreaks = newBreaks.filter((_, i) => i !== index);
    const validation = validateBreakOverlap(updatedBreak, existingBreaks);
    
    // If validation fails, show error and don't update
    if (!validation.isValid && validation.errors && validation.errors.length > 0) {
      alert(validation.errors.join('\n'));
      return;
    }
    
    newBreaks[index].start = breakStart;
    
    // Automatische Berechnung der Pausendauer wenn Start- und Endzeit vorhanden sind
    if (newBreaks[index].end) {
      const endTime = newBreaks[index].end!; // Non-null assertion da wir bereits geprüft haben
      const duration = (endTime.getTime() - breakStart.getTime()) / 1000 / 60;
      newBreaks[index].duration = Math.max(0, Math.round(duration));
    }
    
    setBreaks(newBreaks);
    validateAndSetWarnings();
  }, [breaks, startTime, validateAndSetWarnings]);

  const updateBreakEnd = useCallback((index: number, value: string) => {
    if (!startTime) return;

    const newBreaks = [...breaks];
    const [hours, minutes] = value.split(':').map(Number);
    // DST-Fix: Verwende Date-Konstruktor statt setHours() für korrekte Zeitzonen-Behandlung
    const breakEnd = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), hours, minutes, 0, 0);
    
    // Create updated break for validation
    const updatedBreak: Break = {
      ...newBreaks[index],
      end: breakEnd
    };
    
    // Validate overlap before updating (exclude current break from existing breaks)
    const existingBreaks = newBreaks.filter((_, i) => i !== index);
    const validation = validateBreakOverlap(updatedBreak, existingBreaks);
    
    // If validation fails, show error and don't update
    if (!validation.isValid && validation.errors && validation.errors.length > 0) {
      alert(validation.errors.join('\n'));
      return;
    }
    
    newBreaks[index].end = breakEnd;
    
    // Automatische Berechnung der Pausendauer wenn Start- und Endzeit vorhanden sind
    if (newBreaks[index].start) {
      const startTime = newBreaks[index].start!; // Non-null assertion da wir bereits geprüft haben
      const duration = (breakEnd.getTime() - startTime.getTime()) / 1000 / 60;
      newBreaks[index].duration = Math.max(0, Math.round(duration));
    }
    
    setBreaks(newBreaks);
    validateAndSetWarnings();
  }, [breaks, startTime, validateAndSetWarnings]);

  const setPlannedWorkMinutes = useCallback((minutes: number) => {
    setPlannedWork(minutes || minWorkMinutes);
    validateAndSetWarnings();
  }, [minWorkMinutes, validateAndSetWarnings]);

  return [
    // State
    {
      plan,
      status,
      startTime,
      manualStart,
      workedMinutes,
      breaks,
      plannedWork,
      warnings
    },
    // Actions
    {
      setPlan,
      setManualStart,
      setPlannedWork: setPlannedWorkMinutes,
      start,
      pause,
      resume,
      stop,
      addBreak,
      deleteBreak,
      resetToDefaultBreaks,
      clearAllData,
      updateBreakDuration,
      updateBreakStart,
      updateBreakEnd
    }
  ];
};
