/**
 * OverrideToggle Component
 * 
 * Toggle component for override option functionality.
 * Provides legal warnings and acknowledgment requirements.
 */

import React, { useState, useEffect } from 'react';
import { OverrideUtils, OverrideLabels } from '../utils/overrideUtils';
import { OverrideSetting } from '../interfaces/override';

interface OverrideToggleProps {
  workTime: { isOnBreak?: boolean };
  onOverrideChange?: (enabled: boolean) => void;
  className?: string;
}

const OverrideToggle: React.FC<OverrideToggleProps> = ({
  workTime,
  onOverrideChange,
  className = ''
}) => {
  const [overrideSetting, setOverrideSetting] = useState<OverrideSetting>(
    OverrideUtils.getOverrideSetting()
  );
  const [showDetails, setShowDetails] = useState(false);
  const [reason, setReason] = useState(overrideSetting.reason);
  const [acknowledged, setAcknowledged] = useState(overrideSetting.acknowledged);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labels: OverrideLabels = OverrideUtils.getOverrideLabels();

  /**
   * Handle toggle change
   */
  const handleToggle = async (enabled: boolean) => {
    if (enabled && !acknowledged) {
      setShowDetails(true);
      return;
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
      } else {
        setError(result.error?.message || 'Fehler beim Speichern');
      }
    } catch (err) {
      setError('Unerwarteter Fehler beim Speichern');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle acknowledgment
   */
  const handleAcknowledgment = async () => {
    if (!acknowledged) {
      setError('Sie müssen die rechtlichen Auswirkungen bestätigen');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newSetting = OverrideUtils.createOverrideSetting(
        true,
        reason,
        true
      );

      const result = await OverrideUtils.saveOverrideSetting(newSetting);
      
      if (result.success) {
        setOverrideSetting(newSetting);
        setShowDetails(false);
        onOverrideChange?.(true);
      } else {
        setError(result.error?.message || 'Fehler beim Speichern');
      }
    } catch (err) {
      setError('Unerwarteter Fehler beim Speichern');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle reason change
   */
  const handleReasonChange = (newReason: string) => {
    const validation = OverrideUtils.validateReason(newReason);
    if (validation.isValid) {
      setReason(newReason);
      setError(null);
    } else {
      setError(validation.error || 'Ungültiger Grund');
    }
  };

  /**
   * Check if override can be used
   */
  const canUseOverride = OverrideUtils.canUseOverride(workTime, overrideSetting.enabled);

  return (
    <div className={`override-toggle ${className}`}>
      {/* Main Toggle */}
      <div className="bg-white/10 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              {labels.title}
            </h3>
            <p className="text-white/80 text-sm mb-3">
              {labels.description}
            </p>
            
            {/* Status Display */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                overrideSetting.enabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {overrideSetting.enabled ? 'Aktiviert' : 'Deaktiviert'}
              </span>
              
              {overrideSetting.enabled && !canUseOverride.canOverride && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  {canUseOverride.reason}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={overrideSetting.enabled}
                onChange={(e) => handleToggle(e.target.checked)}
                disabled={isLoading}
                className="sr-only"
                aria-describedby="override-description"
              />
              <div className={`w-11 h-6 rounded-full transition-colors ${
                overrideSetting.enabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  overrideSetting.enabled ? 'translate-x-5' : 'translate-x-0.5'
                } mt-0.5`} />
              </div>
            </label>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-white/70 hover:text-white text-sm underline"
            >
              {showDetails ? 'Details ausblenden' : 'Details anzeigen'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Details Panel */}
      {showDetails && (
        <div className="bg-white/5 rounded-lg p-4 mb-4">
          {/* Warning */}
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {labels.warning}
                </p>
              </div>
            </div>
          </div>

          {/* Acknowledgment Checkbox */}
          <div className="mb-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1"
                aria-describedby="acknowledge-description"
              />
              <div>
                <p className="text-white font-medium">
                  {labels.acknowledgeText}
                </p>
                <p id="acknowledge-description" className="text-white/70 text-sm mt-1">
                  Durch das Aktivieren dieser Option bestätigen Sie, dass Sie die rechtlichen Auswirkungen verstehen.
                </p>
              </div>
            </label>
          </div>

          {/* Reason Input */}
          <div className="mb-4">
            <label htmlFor="override-reason" className="block text-white font-medium mb-2">
              {labels.reasonLabel}
            </label>
            <textarea
              id="override-reason"
              value={reason}
              onChange={(e) => handleReasonChange(e.target.value)}
              placeholder={labels.reasonPlaceholder}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              maxLength={200}
            />
            <p className="text-white/50 text-xs mt-1">
              {reason.length}/200 Zeichen
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDetails(false)}
              className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleAcknowledgment}
              disabled={!acknowledged || isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {isLoading ? 'Speichern...' : 'Bestätigen und Aktivieren'}
            </button>
          </div>
        </div>
      )}

      {/* Screen Reader Information */}
      <div className="sr-only" aria-live="polite">
        {overrideSetting.enabled 
          ? 'Umgehungsoption ist aktiviert' 
          : 'Umgehungsoption ist deaktiviert'
        }
        {!canUseOverride.canOverride && ` - ${canUseOverride.reason}`}
      </div>
    </div>
  );
};

export default OverrideToggle;
