/**
 * Auto-Stop Utilities
 * 
 * Provides utilities for automatic work time stopping based on ArbZG compliance
 * and work plan limits. Ensures legal compliance and proper time management.
 */

import { AutoStopEvent, AutoStopReason, AUTO_STOP_REASON_LABELS } from '../interfaces/autoStop';
import { safeSetItem, safeGetItem, StorageResult } from './storageUtils';
import { globalTimerManager } from './timerUtils';

/**
 * Work time data structure
 */
export interface WorkTimeData {
  startTime: Date;
  endTime: Date | null;
  breaks: Array<{ start: Date; end: Date }>;
  totalWorkTime: number; // in minutes
  totalBreakTime: number; // in minutes
  isOnBreak?: boolean;
}

/**
 * Work plan structure
 */
export interface WorkPlan {
  name: string;
  maxPresenceTime: number; // in minutes
  maxWorkTime: number; // in minutes
}

/**
 * Auto-stop result
 */
export interface AutoStopResult {
  shouldStop: boolean;
  reason?: AutoStopReason;
  message: string;
  timeRemaining?: number; // in minutes
}

/**
 * Auto-stop utility class
 */
export class AutoStopUtils {
  /**
   * Check ArbZG compliance for work time
   */
  static checkArbzgCompliance(workTime: WorkTimeData): AutoStopResult {
    // Maximum work time: 10 hours per ArbZG
    if (workTime.totalWorkTime >= 10 * 60) {
      return {
        shouldStop: true,
        reason: AutoStopReason.MAX_HOURS,
        message: 'Maximale Arbeitszeit von 10 Stunden nach ArbZG erreicht',
        timeRemaining: 0
      };
    }

    // Break requirements: 30min after 6h, 45min after 9h
    if (workTime.totalWorkTime >= 6 * 60 && workTime.totalBreakTime < 30) {
      return {
        shouldStop: true,
        reason: AutoStopReason.MAX_HOURS,
        message: 'Pausenzeit von mindestens 30 Minuten nach 6 Stunden Arbeitszeit erforderlich',
        timeRemaining: 30 - workTime.totalBreakTime
      };
    }

    if (workTime.totalWorkTime >= 9 * 60 && workTime.totalBreakTime < 45) {
      return {
        shouldStop: true,
        reason: AutoStopReason.MAX_HOURS,
        message: 'Pausenzeit von mindestens 45 Minuten nach 9 Stunden Arbeitszeit erforderlich',
        timeRemaining: 45 - workTime.totalBreakTime
      };
    }

    return {
      shouldStop: false,
      message: 'Arbeitszeit innerhalb der ArbZG-Grenzen'
    };
  }

  /**
   * Check work plan compliance
   */
  static checkPlanCompliance(workTime: WorkTimeData, plan: WorkPlan): AutoStopResult {
    // Check presence time limit
    const totalPresenceTime = workTime.totalWorkTime + workTime.totalBreakTime;
    if (totalPresenceTime >= plan.maxPresenceTime) {
      return {
        shouldStop: true,
        reason: AutoStopReason.MAX_PRESENCE,
        message: `Maximale Anwesenheitszeit von ${plan.maxPresenceTime / 60} Stunden im Plan "${plan.name}" erreicht`,
        timeRemaining: 0
      };
    }

    // Check work time limit
    if (workTime.totalWorkTime >= plan.maxWorkTime) {
      return {
        shouldStop: true,
        reason: AutoStopReason.MAX_HOURS,
        message: `Maximale Arbeitszeit von ${plan.maxWorkTime / 60} Stunden im Plan "${plan.name}" erreicht`,
        timeRemaining: 0
      };
    }

    return {
      shouldStop: false,
      message: `Arbeitszeit innerhalb der Plan-Grenzen (${plan.name})`
    };
  }

  /**
   * Create auto-stop event
   */
  static createAutoStopEvent(
    reason: AutoStopReason,
    workTime: WorkTimeData,
    plan: WorkPlan,
    overrideActive: boolean
  ): AutoStopEvent {
    return {
      id: this.generateEventId(),
      reason,
      timestamp: Date.now(),
      workTime: workTime.totalWorkTime,
      planName: plan.name,
      userAcknowledged: false,
      overrideActive
    };
  }

  /**
   * Generate unique event ID
   */
  private static generateEventId(): string {
    return `auto-stop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate next check interval based on work time
   */
  static calculateNextCheckInterval(workTime: WorkTimeData): number {
    const totalWorkHours = workTime.totalWorkTime / 60;
    
    // More frequent checks as we approach limits
    if (totalWorkHours >= 9.5) {
      return 10000; // 10 seconds
    } else if (totalWorkHours >= 9) {
      return 30000; // 30 seconds
    } else if (totalWorkHours >= 8) {
      return 60000; // 1 minute
    } else {
      return 300000; // 5 minutes
    }
  }

  /**
   * Save auto-stop event to localStorage
   */
  static async saveAutoStopEvent(event: AutoStopEvent): Promise<StorageResult<void>> {
    try {
      // Get existing events
      const existingResult = safeGetItem<AutoStopEvent[]>('autoStopEvents');
      const events = existingResult.success ? (existingResult.data || []) : [];

      // Add new event
      events.push(event);

      // Keep only last 100 events (for performance)
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }

      // Save back to localStorage
      return safeSetItem('autoStopEvents', events);
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'SERIALIZATION_ERROR' as any,
          message: `Fehler beim Speichern des Auto-Stop-Events: ${error}`,
          originalError: error instanceof Error ? error : new Error(String(error))
        }
      };
    }
  }

  /**
   * Get auto-stop events from localStorage
   */
  static getAutoStopEvents(): StorageResult<AutoStopEvent[]> {
    return safeGetItem<AutoStopEvent[]>('autoStopEvents');
  }

  /**
   * Acknowledge auto-stop event
   */
  static async acknowledgeAutoStopEvent(eventId: string): Promise<StorageResult<void>> {
    try {
      const eventsResult = this.getAutoStopEvents();
      if (!eventsResult.success || !eventsResult.data) {
        return {
          success: false,
          error: {
            type: 'DESERIALIZATION_ERROR' as any,
            message: 'Fehler beim Laden der Auto-Stop-Events'
          }
        };
      }

      const events = eventsResult.data;
      const eventIndex = events.findIndex(event => event.id === eventId);
      
      if (eventIndex === -1) {
        return {
          success: false,
          error: {
            type: 'INVALID_DATA' as any,
            message: 'Auto-Stop-Event nicht gefunden'
          }
        };
      }

      events[eventIndex].userAcknowledged = true;
      return safeSetItem('autoStopEvents', events);
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'SERIALIZATION_ERROR' as any,
          message: `Fehler beim Bestätigen des Auto-Stop-Events: ${error}`,
          originalError: error instanceof Error ? error : new Error(String(error))
        }
      };
    }
  }

  /**
   * Get German label for auto-stop reason
   */
  static getReasonLabel(reason: AutoStopReason): string {
    return AUTO_STOP_REASON_LABELS[reason];
  }

  /**
   * Format work time for display
   */
  static formatWorkTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')} Stunden`;
  }

  /**
   * Check if work time is approaching limits (for warnings)
   */
  static isApproachingLimits(workTime: WorkTimeData, plan: WorkPlan): {
    arbzgWarning: boolean;
    planWarning: boolean;
    message: string;
  } {
    const totalWorkHours = workTime.totalWorkTime / 60;
    const totalPresenceHours = (workTime.totalWorkTime + workTime.totalBreakTime) / 60;

    // ArbZG warnings
    const arbzgWarning = totalWorkHours >= 9.5;
    const arbzgMessage = arbzgWarning ? 'Warnung: Nähert sich der maximalen Arbeitszeit von 10 Stunden' : '';

    // Plan warnings
    const planWarning = totalPresenceHours >= (plan.maxPresenceTime / 60) * 0.9;
    const planMessage = planWarning ? `Warnung: Nähert sich der maximalen Anwesenheitszeit von ${plan.maxPresenceTime / 60} Stunden` : '';

    return {
      arbzgWarning,
      planWarning,
      message: arbzgMessage || planMessage || 'Arbeitszeit normal'
    };
  }

  /**
   * Cleanup old auto-stop events (for maintenance)
   */
  static async cleanupOldEvents(daysToKeep: number = 30): Promise<StorageResult<void>> {
    try {
      const eventsResult = this.getAutoStopEvents();
      if (!eventsResult.success || !eventsResult.data) {
        return { success: true }; // No events to clean
      }

      const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      const filteredEvents = eventsResult.data.filter(event => event.timestamp > cutoffTime);

      return safeSetItem('autoStopEvents', filteredEvents);
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'SERIALIZATION_ERROR' as any,
          message: `Fehler beim Bereinigen alter Events: ${error}`,
          originalError: error instanceof Error ? error : new Error(String(error))
        }
      };
    }
  }
}

/**
 * Constants for auto-stop functionality
 */
export const AUTO_STOP_CONSTANTS = {
  MAX_WORK_HOURS_ARBZG: 10,
  MIN_BREAK_6H: 30,
  MIN_BREAK_9H: 45,
  CHECK_INTERVAL_MIN: 10000, // 10 seconds
  CHECK_INTERVAL_MAX: 300000, // 5 minutes
  WARNING_THRESHOLD: 0.9, // 90% of limit
  MAX_EVENTS_STORED: 100,
  DEFAULT_CLEANUP_DAYS: 30
} as const;
