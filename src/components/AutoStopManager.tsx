/**
 * AutoStopManager Component
 * 
 * Manages automatic work time stopping based on ArbZG compliance
 * and work plan limits. Provides notifications and event handling.
 */

import React, { useState, useEffect } from 'react';
import { AutoStopEvent, AutoStopReason } from '../interfaces/autoStop';
import { AutoStopUtils, WorkTimeData, WorkPlan } from '../utils/autoStopUtils';
import { useAutoStop } from '../hooks/useAutoStop';

interface AutoStopManagerProps {
  workTime: WorkTimeData;
  plan: WorkPlan;
  overrideActive: boolean;
  onWorkTimeStop?: () => void;
  className?: string;
}

const AutoStopManager: React.FC<AutoStopManagerProps> = ({
  workTime,
  plan,
  overrideActive,
  onWorkTimeStop,
  className = ''
}) => {
  const [currentEvent, setCurrentEvent] = useState<AutoStopEvent | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  const {
    isMonitoring,
    currentWarning,
    startMonitoring,
    stopMonitoring,
    acknowledgeEvent,
    getRecentEvents
  } = useAutoStop({
    workTime,
    plan,
    overrideActive,
    onAutoStop: handleAutoStop,
    onWarning: handleWarning
  });

  /**
   * Handle auto-stop event
   */
  function handleAutoStop(event: AutoStopEvent) {
    setCurrentEvent(event);
    setShowNotification(true);
    setIsAcknowledged(false);
    
    // Automatically stop work time
    onWorkTimeStop?.();
  }

  /**
   * Handle warning messages
   */
  function handleWarning(message: string) {
    // Could show toast notification here
  }

  /**
   * Acknowledge auto-stop event
   */
  const handleAcknowledge = async () => {
    if (!currentEvent) return;

    const success = await acknowledgeEvent(currentEvent.id);
    if (success) {
      setIsAcknowledged(true);
      setShowNotification(false);
      setCurrentEvent(null);
    }
  }

  /**
   * Dismiss notification without acknowledgment
   */
  const handleDismiss = () => {
    setShowNotification(false);
    setCurrentEvent(null);
  }

  /**
   * Start monitoring when work begins
   */
  useEffect(() => {
    if (workTime.startTime && !workTime.endTime && !isMonitoring) {
      startMonitoring();
    } else if (workTime.endTime && isMonitoring) {
      stopMonitoring();
    }
  }, [workTime.startTime, workTime.endTime, isMonitoring, startMonitoring, stopMonitoring]);

  /**
   * Handle auto-stop during break periods
   */
  useEffect(() => {
    if (workTime.isOnBreak && currentEvent) {
      // Auto-stop should still occur even during breaks
      // This ensures ArbZG compliance
      // Logging removed for production - could be handled via errorUtils if needed
    }
  }, [workTime.isOnBreak, currentEvent]);

  return (
    <div className={`auto-stop-manager ${className}`}>
      {/* Warning Display */}
      {currentWarning && !showNotification && (
        <div 
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4"
          role="alert"
          aria-live="polite"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                {currentWarning}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Stop Notification */}
      {showNotification && currentEvent && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-labelledby="auto-stop-title"
          aria-describedby="auto-stop-description"
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 id="auto-stop-title" className="text-lg font-medium text-gray-900">
                  Arbeitszeit automatisch gestoppt
                </h3>
              </div>
            </div>

            <div id="auto-stop-description" className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                {AutoStopUtils.getReasonLabel(currentEvent.reason)}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Arbeitszeit: {AutoStopUtils.formatWorkTime(currentEvent.workTime)}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Plan: {currentEvent.planName}
              </p>
              {currentEvent.overrideActive && (
                <p className="text-sm text-orange-600 font-medium">
                  ⚠️ Umgehungsoption war aktiv
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Schließen
              </button>
              <button
                onClick={handleAcknowledge}
                disabled={isAcknowledged}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                {isAcknowledged ? 'Bestätigt' : 'Bestätigen'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Screen Reader Information */}
      <div className="sr-only" aria-live="polite">
        {isMonitoring ? 'Automatische Arbeitszeit-Überwachung aktiv' : 'Automatische Arbeitszeit-Überwachung inaktiv'}
        {currentWarning && ` Warnung: ${currentWarning}`}
        {showNotification && ' Arbeitszeit wurde automatisch gestoppt'}
      </div>
    </div>
  );
};

export default AutoStopManager;
