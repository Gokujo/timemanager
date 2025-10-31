import React, { useState, useEffect } from 'react';
import { formatMinutesForDisplay } from '../utils/userSettingsUtils';

const PopupPage: React.FC = () => {
  const [workedMinutes, setWorkedMinutes] = useState(0);
  const [plannedWork, setPlannedWork] = useState(480);
  const [endTime, setEndTime] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const worked = parseInt(urlParams.get('worked') || '0');
    const planned = parseInt(urlParams.get('planned') || '480');
    const startTime = urlParams.get('startTime');
    const status = urlParams.get('status') || 'stopped';

    setWorkedMinutes(worked);
    setPlannedWork(planned);

    // Calculate end time if we have start time and status
    if (startTime && status === 'running') {
      const start = new Date(startTime);
      // For popup, we'll use a simplified calculation
      const totalMinutes = planned + worked;
      const endTimeDate = new Date(start.getTime() + totalMinutes * 60 * 1000);
      const calculatedEndTime = endTimeDate.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      setEndTime(calculatedEndTime);
    } else {
      setEndTime(urlParams.get('endTime') || '');
    }

    // Update every second if running
    if (status === 'running' && startTime) {
      const updateInterval = setInterval(() => {
        const now = new Date();
        const start = new Date(startTime);
        const newWorked = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);
        setWorkedMinutes(newWorked);
        
        // Recalculate end time
        const totalMinutes = planned + newWorked;
        const endTimeDate = new Date(start.getTime() + totalMinutes * 60 * 1000);
        const newEndTime = endTimeDate.toLocaleTimeString('de-DE', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        setEndTime(newEndTime);
      }, 1000);

      return () => clearInterval(updateInterval);
    }
  }, []);

  const remainingMinutes = Math.max(0, plannedWork - workedMinutes);
  const overtimeMinutes = Math.max(0, workedMinutes - plannedWork);
  const hasOvertime = overtimeMinutes > 0;

  const handleClick = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="glass-effect p-8 rounded-xl text-center max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6">Arbeitszeit</h1>
        
        {/* Hauptanzeige - Geleistete Arbeitszeit */}
        <div 
          className="bg-white/20 rounded-lg p-8 cursor-pointer hover:bg-white/30 transition-colors"
          onClick={handleClick}
        >
          <p className="text-sm text-white/80 mb-2">Geleistete Arbeitszeit</p>
          <p className="text-6xl font-bold text-white">
            {formatMinutesForDisplay(workedMinutes)}
          </p>
          <p className="text-xs text-white/60 mt-2">
            {showDetails ? 'Klicken zum Ausblenden' : 'Klicken für Details'}
          </p>
        </div>

        {/* Details - Verbleibende Zeit und Arbeitsende */}
        {showDetails && (
          <div className="mt-4 space-y-4">
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-sm text-white/80 mb-1">
                {hasOvertime ? "Überstunden" : "Verbleibende Zeit"}
              </p>
              <p className="text-2xl font-bold text-white">
                {formatMinutesForDisplay(hasOvertime ? overtimeMinutes : remainingMinutes)}
              </p>
            </div>
            
            {endTime && (
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-sm text-white/80 mb-1">Vorauss. Arbeitsende</p>
                <p className="text-2xl font-bold text-white">{endTime}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 text-xs text-white/60">
          <p>Popup wird automatisch aktualisiert</p>
        </div>
      </div>
    </div>
  );
};

export default PopupPage;
