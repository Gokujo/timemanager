import React, {useCallback} from 'react';
import {getWorkDays} from '../constants/workDays';
import {calculateEndTime} from '../utils/timeUtils';
import {useTimeTracking} from '../hooks/useTimeTracking';
import {openTimePopup} from '../utils/popupUtils';

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
        openTimePopup();
    }, []);

    return (
        <>
            {/* SEO Content Section - Hidden but accessible to search engines */}
            <div className="sr-only">
                <h2>Zeiterfassung Online - Professioneller Timetracker</h2>
                <p>
                    Kostenlose Arbeitszeiterfassung online für Unternehmen und Selbstständige. 
                    Erfassen Sie Ihre Arbeitszeit, Pausenzeiten und Überstunden einfach und präzise. 
                    Unser Zeiterfassungstool ist konform mit dem deutschen Arbeitszeitgesetz (ArbZG) 
                    und erfordert keine Anmeldung oder Registrierung.
                </p>
                <h3>Funktionen der Arbeitszeiterfassung</h3>
                <ul>
                    <li>Arbeitszeit erfassen und berechnen</li>
                    <li>Pausenzeiten verwalten und dokumentieren</li>
                    <li>Überstunden automatisch berechnen</li>
                    <li>Stundenzettel digital erstellen</li>
                    <li>Arbeitszeit nachweis für Steuerberater</li>
                    <li>Zeiterfassung ohne Anmeldung</li>
                    <li>Responsive Design für alle Geräte</li>
                    <li>Arbeitszeit exportieren und drucken</li>
                </ul>
                <h3>Zeiterfassung Software für verschiedene Branchen</h3>
                <p>
                    Ideal für Büroangestellte, Handwerker, Freelancer, Selbstständige, 
                    Berater und alle Berufsgruppen, die ihre Arbeitszeit dokumentieren müssen. 
                    Unser Timetracker unterstützt flexible Arbeitszeiten und verschiedene Arbeitsmodelle.
                </p>
            </div>

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
                        className="middle none rounded-lg bg-white/20 py-2.5 px-5 text-center align-middle text-sm font-semibold text-white shadow-sm shadow-black/10 backdrop-blur-sm transition-all hover:bg-white/30 hover:shadow-md"
                        data-ripple-light="true"
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

            <Warnings warnings={state.warnings}/>

            <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex justify-center">
                    <button
                        onClick={actions.clearAllData}
                        className="middle inline-flex items-center gap-2 rounded-lg bg-red-600 py-3 px-6 text-center align-middle text-sm font-semibold text-white shadow-sm shadow-red-900/20 transition-all hover:bg-red-700 hover:shadow-md"
                        data-ripple-light="true"
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
