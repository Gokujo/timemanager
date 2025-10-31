/**
 * Override Utilities
 * 
 * Provides utilities for override option functionality.
 * Ensures DSGVO compliance and proper validation of override settings.
 */

import { OverrideSetting, DEFAULT_OVERRIDE_SETTING, MAX_REASON_LENGTH } from '../interfaces/override';
import { safeGetItem, safeSetItem, safeRemoveItem, StorageResult } from './storageUtils';

/**
 * Override validation result
 */
export interface OverrideValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Override usage check result
 */
export interface OverrideUsageResult {
  canOverride: boolean;
  reason: string;
}

/**
 * Override labels for German language
 */
export interface OverrideLabels {
  title: string;
  description: string;
  warning: string;
  acknowledgeText: string;
  reasonLabel: string;
  reasonPlaceholder: string;
}

/**
 * Override utility class
 */
export class OverrideUtils {
  /**
   * Get override setting from localStorage
   */
  static getOverrideSetting(): OverrideSetting {
    const result = safeGetItem<OverrideSetting>('overrideSetting');
    
    if (result.success && result.data) {
      return result.data;
    }
    
    return DEFAULT_OVERRIDE_SETTING;
  }

  /**
   * Save override setting to localStorage
   */
  static saveOverrideSetting(setting: OverrideSetting): StorageResult<void> {
    const validation = this.validateOverrideSetting(setting);
    if (!validation.isValid) {
      return {
        success: false,
        error: {
          type: 'INVALID_DATA' as any,
          message: `Ungültige Override-Einstellung: ${validation.errors.join(', ')}`
        }
      };
    }

    return safeSetItem('overrideSetting', setting);
  }

  /**
   * Validate override setting
   */
  static validateOverrideSetting(setting: OverrideSetting): OverrideValidationResult {
    const errors: string[] = [];

    // Check timestamp
    if (!setting.timestamp || setting.timestamp <= 0) {
      errors.push('Ungültiger Zeitstempel');
    }

    // Check reason length
    if (setting.reason && setting.reason.length > MAX_REASON_LENGTH) {
      errors.push(`Grund zu lang (maximal ${MAX_REASON_LENGTH} Zeichen)`);
    }

    // Check acknowledgment requirement
    if (setting.enabled && !setting.acknowledged) {
      errors.push('Rechtliche Bestätigung erforderlich');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if override can be used
   */
  static canUseOverride(workTime: { isOnBreak?: boolean }, overrideEnabled: boolean): OverrideUsageResult {
    if (!overrideEnabled) {
      return {
        canOverride: false,
        reason: 'Umgehungsoption ist nicht aktiviert'
      };
    }

    if (workTime.isOnBreak) {
      return {
        canOverride: false,
        reason: 'Umgehungsoption gilt nur während aktiver Arbeitszeit, nicht während Pausen'
      };
    }

    return {
      canOverride: true,
      reason: 'Umgehungsoption kann verwendet werden'
    };
  }

  /**
   * Create new override setting
   */
  static createOverrideSetting(
    enabled: boolean,
    reason: string = '',
    acknowledged: boolean = false
  ): OverrideSetting {
    return {
      enabled,
      timestamp: Date.now(),
      reason: reason.substring(0, MAX_REASON_LENGTH),
      acknowledged
    };
  }

  /**
   * Update override setting
   */
  static updateOverrideSetting(
    updates: Partial<OverrideSetting>
  ): StorageResult<OverrideSetting> {
    const currentSetting = this.getOverrideSetting();
    const updatedSetting: OverrideSetting = {
      ...currentSetting,
      ...updates,
      timestamp: Date.now()
    };

    const saveResult = this.saveOverrideSetting(updatedSetting);
    if (!saveResult.success) {
      return {
        success: false,
        error: saveResult.error
      };
    }

    return {
      success: true,
      data: updatedSetting
    };
  }

  /**
   * Clear override data (DSGVO compliance)
   */
  static clearOverrideData(): StorageResult<void> {
    return safeRemoveItem('overrideSetting');
  }

  /**
   * Get override labels in German
   */
  static getOverrideLabels(): OverrideLabels {
    return {
      title: 'Umgehungsoption für maximale Arbeitszeit',
      description: 'Aktivieren Sie diese Option, um die automatische Stoppung bei maximaler Arbeitszeit zu umgehen.',
      warning: '⚠️ WARNUNG: Die Verwendung dieser Option kann gegen das Arbeitszeitschutzgesetz (ArbZG) verstoßen. Verwenden Sie diese Option nur in Ausnahmefällen und mit entsprechender rechtlicher Beratung.',
      acknowledgeText: 'Ich verstehe die rechtlichen Auswirkungen und bestätige die Verwendung der Umgehungsoption.',
      reasonLabel: 'Grund für die Umgehung (optional)',
      reasonPlaceholder: 'Beschreiben Sie kurz, warum die Umgehung notwendig ist...'
    };
  }

  /**
   * Get override status information
   */
  static getOverrideStatus(): {
    isEnabled: boolean;
    isAcknowledged: boolean;
    lastModified: Date | null;
    reason: string;
  } {
    const setting = this.getOverrideSetting();
    
    return {
      isEnabled: setting.enabled,
      isAcknowledged: setting.acknowledged,
      lastModified: setting.timestamp ? new Date(setting.timestamp) : null,
      reason: setting.reason
    };
  }

  /**
   * Check if override is active and valid
   */
  static isOverrideActive(): boolean {
    const setting = this.getOverrideSetting();
    return setting.enabled && setting.acknowledged;
  }

  /**
   * Get override usage statistics (for compliance tracking)
   */
  static getOverrideUsageStats(): {
    totalActivations: number;
    lastActivation: Date | null;
    averageDuration: number; // in minutes
  } {
    // This would typically be calculated from stored events
    // For now, return basic information
    const setting = this.getOverrideSetting();
    
    return {
      totalActivations: setting.enabled ? 1 : 0,
      lastActivation: setting.timestamp ? new Date(setting.timestamp) : null,
      averageDuration: 0 // Would be calculated from actual usage data
    };
  }

  /**
   * Validate override reason
   */
  static validateReason(reason: string): {
    isValid: boolean;
    error?: string;
  } {
    if (reason.length > MAX_REASON_LENGTH) {
      return {
        isValid: false,
        error: `Grund zu lang (maximal ${MAX_REASON_LENGTH} Zeichen)`
      };
    }

    // Check for potentially sensitive information
    const sensitivePatterns = [
      /password/i,
      /passwort/i,
      /email/i,
      /telefon/i,
      /adresse/i,
      /gehalt/i,
      /lohn/i
    ];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(reason)) {
        return {
          isValid: false,
          error: 'Grund enthält möglicherweise sensible Informationen'
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Format override setting for display
   */
  static formatOverrideSetting(setting: OverrideSetting): string {
    const status = setting.enabled ? 'Aktiviert' : 'Deaktiviert';
    const acknowledged = setting.acknowledged ? 'Bestätigt' : 'Nicht bestätigt';
    const date = setting.timestamp ? new Date(setting.timestamp).toLocaleDateString('de-DE') : 'Unbekannt';
    
    return `${status} | ${acknowledged} | ${date}${setting.reason ? ` | ${setting.reason}` : ''}`;
  }
}

/**
 * Constants for override functionality
 */
export const OVERRIDE_CONSTANTS = {
  STORAGE_KEY: 'overrideSetting',
  MAX_REASON_LENGTH: 200,
  REQUIRED_ACKNOWLEDGMENT: true,
  DSGVO_COMPLIANT: true,
  BREAK_RESTRICTION: true
} as const;
