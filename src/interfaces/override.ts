/**
 * OverrideSetting Interface
 * 
 * Represents user preference to bypass automatic work time stopping.
 * 
 * @interface OverrideSetting
 */
export interface OverrideSetting {
  /** Whether override is active */
  enabled: boolean;
  
  /** When setting was last modified (Unix timestamp) */
  timestamp: number;
  
  /** Optional user-provided reason for override */
  reason: string;
  
  /** Whether user acknowledged legal implications */
  acknowledged: boolean;
}

/**
 * OverrideSetting Validation Rules
 * 
 * - enabled: must be boolean
 * - timestamp: must be valid Unix timestamp
 * - reason: must be string with max 200 characters
 * - acknowledged: must be boolean
 */
export interface OverrideSettingValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * OverrideSetting State Transitions
 * 
 * - disabled → enabled: User activates override, must acknowledge legal implications
 * - enabled → disabled: User deactivates override, auto-stop resumes
 * - enabled → enabled: User updates reason or re-acknowledges
 */
export type OverrideSettingState = 'disabled' | 'enabled' | 'updating';

/**
 * Storage key for OverrideSetting in localStorage
 */
export const OVERRIDE_SETTING_STORAGE_KEY = 'overrideSetting';

/**
 * Default OverrideSetting values
 */
export const DEFAULT_OVERRIDE_SETTING: OverrideSetting = {
  enabled: false,
  timestamp: Date.now(),
  reason: '',
  acknowledged: false
};

/**
 * Maximum length for reason field
 */
export const MAX_REASON_LENGTH = 200;
