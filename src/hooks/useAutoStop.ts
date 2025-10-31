/**
 * useAutoStop Hook
 * 
 * React hook for automatic work time stopping functionality.
 * Manages timers, compliance checking, and auto-stop events.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AutoStopUtils, WorkTimeData, WorkPlan, AutoStopResult } from '../utils/autoStopUtils';
import { AutoStopEvent, AutoStopReason } from '../interfaces/autoStop';
import { globalTimerManager } from '../utils/timerUtils';
import { errorUtils } from '../utils/errorUtils';

interface UseAutoStopOptions {
  workTime: WorkTimeData;
  plan: WorkPlan;
  overrideActive: boolean;
  onAutoStop?: (event: AutoStopEvent) => void;
  onWarning?: (message: string) => void;
}

interface UseAutoStopReturn {
  isMonitoring: boolean;
  lastCheck: Date | null;
  nextCheck: Date | null;
  currentWarning: string | null;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  acknowledgeEvent: (eventId: string) => Promise<boolean>;
  getRecentEvents: () => AutoStopEvent[];
}

export function useAutoStop({
  workTime,
  plan,
  overrideActive,
  onAutoStop,
  onWarning
}: UseAutoStopOptions): UseAutoStopReturn {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [nextCheck, setNextCheck] = useState<Date | null>(null);
  const [currentWarning, setCurrentWarning] = useState<string | null>(null);
  
  const timerRef = useRef<string | null>(null);
  const isActiveRef = useRef(false);

  /**
   * Perform auto-stop check
   */
  const performCheck = useCallback(async () => {
    if (!isActiveRef.current) return;

    try {
      // Check ArbZG compliance first
      const arbzgResult = AutoStopUtils.checkArbzgCompliance(workTime);
      
      // Check plan compliance
      const planResult = AutoStopUtils.checkPlanCompliance(workTime, plan);

      // Determine if we should stop
      const shouldStop = !overrideActive && (arbzgResult.shouldStop || planResult.shouldStop);
      
      if (shouldStop) {
        const reason = arbzgResult.shouldStop ? arbzgResult.reason! : planResult.reason!;
        const message = arbzgResult.shouldStop ? arbzgResult.message : planResult.message;

        // Create auto-stop event
        const event = AutoStopUtils.createAutoStopEvent(reason, workTime, plan, overrideActive);
        
        // Save event
        await AutoStopUtils.saveAutoStopEvent(event);
        
        // Stop monitoring
        stopMonitoring();
        
        // Notify parent component
        onAutoStop?.(event);
        
        return;
      }

      // Check for warnings
      const warningInfo = AutoStopUtils.isApproachingLimits(workTime, plan);
      if (warningInfo.arbzgWarning || warningInfo.planWarning) {
        setCurrentWarning(warningInfo.message);
        onWarning?.(warningInfo.message);
      } else {
        setCurrentWarning(null);
      }

      // Update check times
      setLastCheck(new Date());
      
      // Schedule next check
      const interval = AutoStopUtils.calculateNextCheckInterval(workTime);
      const nextCheckTime = new Date(Date.now() + interval);
      setNextCheck(nextCheckTime);

      // Schedule next check
      if (isActiveRef.current) {
        timerRef.current = globalTimerManager.setTimeout(() => {
          performCheck();
        }, interval);
      }

    } catch (error) {
      errorUtils.logError(error, {
        context: 'Auto-Stop-Prüfung',
        workTime: {
          totalWorkTime: workTime.totalWorkTime,
          totalBreakTime: workTime.totalBreakTime
        },
        plan: plan.name
      });
    }
  }, [workTime, plan, overrideActive, onAutoStop, onWarning]);

  /**
   * Start monitoring
   */
  const startMonitoring = useCallback(() => {
    if (isActiveRef.current) return;

    isActiveRef.current = true;
    setIsMonitoring(true);
    
    // Perform initial check
    performCheck();
  }, [performCheck]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    isActiveRef.current = false;
    setIsMonitoring(false);
    
    if (timerRef.current) {
      globalTimerManager.clearTimer(timerRef.current);
      timerRef.current = null;
    }
    
    setCurrentWarning(null);
    setNextCheck(null);
  }, []);

  /**
   * Acknowledge auto-stop event
   */
  const acknowledgeEvent = useCallback(async (eventId: string): Promise<boolean> => {
    try {
      const result = await AutoStopUtils.acknowledgeAutoStopEvent(eventId);
      return result.success;
    } catch (error) {
      errorUtils.logError(error, {
        context: 'Auto-Stop Event Bestätigung',
        eventId
      });
      return false;
    }
  }, []);

  /**
   * Get recent auto-stop events
   */
  const getRecentEvents = useCallback((): AutoStopEvent[] => {
    const result = AutoStopUtils.getAutoStopEvents();
    if (!result.success || !result.data) {
      return [];
    }

    // Return last 10 events, sorted by timestamp (newest first)
    return result.data
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  /**
   * Handle page refresh during auto-stop
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isActiveRef.current) {
        // Save current state to sessionStorage
        sessionStorage.setItem('autoStopMonitoring', JSON.stringify({
          isMonitoring: true,
          lastCheck: lastCheck?.toISOString(),
          workTime: {
            ...workTime,
            startTime: workTime.startTime.toISOString(),
            endTime: workTime.endTime?.toISOString() || null,
            breaks: workTime.breaks.map(breakItem => ({
              start: breakItem.start.toISOString(),
              end: breakItem.end.toISOString()
            }))
          },
          plan,
          overrideActive
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isMonitoring, lastCheck, workTime, plan, overrideActive]);

  /**
   * Restore monitoring state after page refresh
   */
  useEffect(() => {
    const savedState = sessionStorage.getItem('autoStopMonitoring');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.isMonitoring) {
          // Restore state
          setLastCheck(state.lastCheck ? new Date(state.lastCheck) : null);
          
          // Clear saved state
          sessionStorage.removeItem('autoStopMonitoring');
          
          // Resume monitoring if work is still active
          if (!workTime.endTime) {
            startMonitoring();
          }
        }
      } catch (error) {
        console.error('Fehler beim Wiederherstellen des Auto-Stop-Status:', error);
        sessionStorage.removeItem('autoStopMonitoring');
      }
    }
  }, [startMonitoring, workTime.endTime]);

  return {
    isMonitoring,
    lastCheck,
    nextCheck,
    currentWarning,
    startMonitoring,
    stopMonitoring,
    acknowledgeEvent,
    getRecentEvents
  };
}
