/**
 * useOverride Hook
 * 
 * React hook for override option functionality.
 * Manages override state and provides utility functions.
 */

import { useState, useEffect, useCallback } from 'react';
import { OverrideUtils } from '../utils/overrideUtils';
import { OverrideSetting } from '../interfaces/override';

interface UseOverrideOptions {
  workTime: { isOnBreak?: boolean };
  onOverrideChange?: (enabled: boolean) => void;
}

interface UseOverrideReturn {
  overrideSetting: OverrideSetting;
  isOverrideActive: boolean;
  canUseOverride: boolean;
  overrideReason: string;
  isLoading: boolean;
  error: string | null;
  updateOverride: (enabled: boolean, reason?: string) => Promise<boolean>;
  clearOverride: () => Promise<boolean>;
  refreshOverride: () => void;
}

export function useOverride({
  workTime,
  onOverrideChange
}: UseOverrideOptions): UseOverrideReturn {
  const [overrideSetting, setOverrideSetting] = useState<OverrideSetting>(
    OverrideUtils.getOverrideSetting()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if override is active
   */
  const isOverrideActive = OverrideUtils.isOverrideActive();

  /**
   * Check if override can be used
   */
  const canUseOverride = OverrideUtils.canUseOverride(workTime, overrideSetting.enabled).canOverride;

  /**
   * Get override reason
   */
  const overrideReason = overrideSetting.reason;

  /**
   * Update override setting
   */
  const updateOverride = useCallback(async (
    enabled: boolean, 
    reason: string = ''
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const newSetting = OverrideUtils.createOverrideSetting(
        enabled,
        reason,
        enabled // Must be acknowledged if enabled
      );

      const result = await OverrideUtils.saveOverrideSetting(newSetting);
      
      if (result.success) {
        setOverrideSetting(newSetting);
        onOverrideChange?.(enabled);
        return true;
      } else {
        setError(result.error?.message || 'Fehler beim Speichern');
        return false;
      }
    } catch (err) {
      setError('Unerwarteter Fehler beim Speichern');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onOverrideChange]);

  /**
   * Clear override setting
   */
  const clearOverride = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await OverrideUtils.clearOverrideData();
      
      if (result.success) {
        setOverrideSetting(OverrideUtils.getOverrideSetting());
        onOverrideChange?.(false);
        return true;
      } else {
        setError(result.error?.message || 'Fehler beim Löschen');
        return false;
      }
    } catch (err) {
      setError('Unerwarteter Fehler beim Löschen');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onOverrideChange]);

  /**
   * Refresh override setting from storage
   */
  const refreshOverride = useCallback(() => {
    const currentSetting = OverrideUtils.getOverrideSetting();
    setOverrideSetting(currentSetting);
    setError(null);
  }, []);

  /**
   * Update override setting with acknowledgment
   */
  const updateWithAcknowledgment = useCallback(async (
    enabled: boolean,
    reason: string = '',
    acknowledged: boolean = false
  ): Promise<boolean> => {
    if (enabled && !acknowledged) {
      setError('Rechtliche Bestätigung erforderlich');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newSetting = OverrideUtils.createOverrideSetting(
        enabled,
        reason,
        acknowledged
      );

      const result = await OverrideUtils.saveOverrideSetting(newSetting);
      
      if (result.success) {
        setOverrideSetting(newSetting);
        onOverrideChange?.(enabled);
        return true;
      } else {
        setError(result.error?.message || 'Fehler beim Speichern');
        return false;
      }
    } catch (err) {
      setError('Unerwarteter Fehler beim Speichern');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onOverrideChange]);

  /**
   * Get override status information
   */
  const getOverrideStatus = useCallback(() => {
    return OverrideUtils.getOverrideStatus();
  }, []);

  /**
   * Validate override reason
   */
  const validateReason = useCallback((reason: string) => {
    return OverrideUtils.validateReason(reason);
  }, []);

  /**
   * Get override usage statistics
   */
  const getUsageStats = useCallback(() => {
    return OverrideUtils.getOverrideUsageStats();
  }, []);

  /**
   * Format override setting for display
   */
  const formatOverrideSetting = useCallback(() => {
    return OverrideUtils.formatOverrideSetting(overrideSetting);
  }, [overrideSetting]);

  /**
   * Listen for storage changes (for multi-tab support)
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'overrideSetting') {
        refreshOverride();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshOverride]);

  /**
   * Update override setting when work time changes
   */
  useEffect(() => {
    // Check if override can still be used
    const canUse = OverrideUtils.canUseOverride(workTime, overrideSetting.enabled);
    if (!canUse.canOverride && overrideSetting.enabled) {
      // Override is active but cannot be used (e.g., during break)
      console.warn('Override aktiv aber nicht verwendbar:', canUse.reason);
    }
  }, [workTime, overrideSetting.enabled]);

  return {
    overrideSetting,
    isOverrideActive,
    canUseOverride,
    overrideReason,
    isLoading,
    error,
    updateOverride,
    clearOverride,
    refreshOverride,
    // Additional utility functions
    updateWithAcknowledgment,
    getOverrideStatus,
    validateReason,
    getUsageStats,
    formatOverrideSetting
  } as UseOverrideReturn & {
    updateWithAcknowledgment: typeof updateWithAcknowledgment;
    getOverrideStatus: typeof getOverrideStatus;
    validateReason: typeof validateReason;
    getUsageStats: typeof getUsageStats;
    formatOverrideSetting: typeof formatOverrideSetting;
  };
}
