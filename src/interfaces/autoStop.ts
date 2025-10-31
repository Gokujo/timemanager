/**
 * AutoStopEvent Interface
 * 
 * Represents an automatic stopping event for compliance tracking.
 * 
 * @interface AutoStopEvent
 */
export interface AutoStopEvent {
  /** Unique identifier (UUID) */
  id: string;
  
  /** Why auto-stop was triggered */
  reason: 'maxHours' | 'maxPresence';
  
  /** When auto-stop occurred (Unix timestamp) */
  timestamp: number;
  
  /** Total work time in minutes when stopped */
  workTime: number;
  
  /** Name of active work plan */
  planName: string;
  
  /** Whether user acknowledged the stop */
  userAcknowledged: boolean;
  
  /** Whether override was active (for logging) */
  overrideActive: boolean;
}

/**
 * AutoStopEvent Validation Rules
 * 
 * - id: must be valid UUID
 * - reason: must be one of the defined enum values
 * - timestamp: must be valid Unix timestamp
 * - workTime: must be non-negative number
 * - planName: must be non-empty string
 * - userAcknowledged: must be boolean
 * - overrideActive: must be boolean
 */
export interface AutoStopEventValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * AutoStopEvent State Transitions
 * 
 * - pending → acknowledged: User acknowledges auto-stop event
 * - pending → dismissed: User dismisses notification without acknowledgment
 */
export type AutoStopEventState = 'pending' | 'acknowledged' | 'dismissed';

/**
 * Storage key for AutoStopEvent array in localStorage
 */
export const AUTO_STOP_EVENTS_STORAGE_KEY = 'autoStopEvents';

/**
 * Maximum number of events to store (for performance)
 */
export const MAX_AUTO_STOP_EVENTS = 100;

/**
 * Auto-stop reasons enum
 */
export enum AutoStopReason {
  MAX_HOURS = 'maxHours',
  MAX_PRESENCE = 'maxPresence'
}

/**
 * German labels for auto-stop reasons
 */
export const AUTO_STOP_REASON_LABELS: Record<AutoStopReason, string> = {
  [AutoStopReason.MAX_HOURS]: 'Maximale Arbeitszeit erreicht',
  [AutoStopReason.MAX_PRESENCE]: 'Maximale Anwesenheitszeit erreicht'
};
