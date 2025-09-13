import React, { useCallback } from 'react';
import { getWorkDays } from '../constants/workDays';
import { calculateEndTime } from '../utils/timeUtils';
import { useTimeTracking } from '../hooks/useTimeTracking';
import { openTimePopup } from '../utils/popupUtils';

// Components
import Settings from './Settings';
import TimeDisplay from './TimeDisplay';
import PlanSelector from './PlanSelector';
import Controls from './Controls';
import BreakManager from './BreakManager';
import Warnings from './Warnings';

const HomePage: React.FC = () => {
  // Get current day's minimum work minutes from user settings
  const today = new Date();
  const dayOfWeek = today.getDay();
  const workDays = getWorkDays();
  const minWorkMinutes = workDays[dayOfWeek];

  // Use the time tracking hook
  const [state, actions] = useTimeTracking();

  // Calculate end time
  const endTime = useCallback(() => {
    return calculateEndTime(
      state.startTime,
      state.breaks,
      state.plannedWork,
      state.workedMinutes,
      state.status
    );
  }, [state.startTime, state.breaks, state.plannedWork, state.workedMinutes, state.status]);

  // Handle opening the popup
  const handleOpenPopup = useCallback(() => {
    // Create a callback that always gets the latest state values
    const getLatestValues = () => ({
      workedMinutes: state.workedMinutes,
      plannedWork: state.plannedWork,
      endTime: endTime()
    });

    openTimePopup(
      state.workedMinutes,
      state.plannedWork,
      endTime(),
      // Pass the callback that will always get fresh values
      getLatestValues
    );
  }, [state, endTime]);

  return (
    <>
      <Settings 
        manualStart={state.manualStart}
        plannedWork={state.plannedWork}
        minWorkMinutes={minWorkMinutes}
        onManualStartChange={actions.setManualStart}
        onPlannedWorkChange={actions.setPlannedWork}
      />

      <div className="mb-4">
        <TimeDisplay 
          workedMinutes={state.workedMinutes}
          plannedWork={state.plannedWork}
          endTime={endTime()}
        />
        <div className="flex justify-center mt-2">
          <button 
            onClick={handleOpenPopup}
            className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Zeiten in Popup öffnen
          </button>
        </div>
      </div>

      <PlanSelector 
        selectedPlan={state.plan}
        onPlanChange={actions.setPlan}
      />

      <Controls 
        status={state.status}
        onStart={actions.start}
        onPause={actions.pause}
        onResume={actions.resume}
        onStop={actions.stop}
      />

      <BreakManager 
        breaks={state.breaks}
        onAddBreak={actions.addBreak}
        onDeleteBreak={actions.deleteBreak}
        onResetToDefaultBreaks={actions.resetToDefaultBreaks}
        onUpdateBreakStart={actions.updateBreakStart}
        onUpdateBreakEnd={actions.updateBreakEnd}
        onUpdateBreakDuration={actions.updateBreakDuration}
      />

      <Warnings warnings={state.warnings} />

      <div className="mt-8 pt-6 border-t border-white/20">
        <div className="flex justify-center">
          <button
            onClick={actions.clearAllData}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <span className="w-5 h-5">🗑️</span>
            Alle Daten löschen
          </button>
        </div>
        <p className="text-center text-white/70 text-sm mt-2">
          Löscht alle gespeicherten Daten (LocalStorage & Cookies) und setzt die Anwendung zurück
        </p>
        
        <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
          <div className="flex items-start gap-3">
            <span className="text-blue-300 text-lg">ℹ️</span>
            <div className="text-blue-100 text-sm">
              <p className="font-medium mb-1">Cookie-Information</p>
              <p className="text-blue-200">
                Diese Webseite verwendet Cookies und LocalStorage, um Ihre Arbeitszeiterfassungsdaten 
                lokal zu speichern. Die Daten werden nur auf Ihrem Gerät gespeichert und nicht an 
                externe Server übertragen. Sie können diese Daten jederzeit über den obigen Button 
                vollständig löschen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
