import React from 'react';
import { getActiveBreak } from '../utils/breakUtils';
import { Break } from '../interfaces/break';

interface ControlsProps {
    status: 'stopped' | 'running' | 'paused';
    breaks: Break[];
    startTime: Date | null;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
}

const Controls: React.FC<ControlsProps> = ({
                                               status,
                                               breaks,
                                               startTime,
                                               onStart,
                                               onPause,
                                               onResume,
                                               onStop
                                           }) => {
    // Calculate active break (if any)
    const currentTime = new Date();
    const activeBreak = getActiveBreak(breaks, currentTime);

    // Pause button: hidden when active break exists
    const showPauseButton = status === 'running' && !activeBreak;

    // Resume button: enabled when active break exists OR status is 'paused'
    const resumeEnabled = status === 'paused' || activeBreak !== null;

    // Status indicator: "Pausiert" when active break exists OR status is 'paused'
    const statusText = activeBreak !== null || status === 'paused'
        ? 'Pausiert'
        : status === 'running'
            ? 'Laufend'
            : 'Gestoppt';

    const statusColor = activeBreak !== null || status === 'paused'
        ? 'status-yellow'
        : status === 'running'
            ? 'status-green'
            : 'status-red';

    return (
        <div className="mb-6">
            <div className="flex flex-wrap gap-3 mb-6">
                <button
                    className="middle inline-flex items-center gap-2 rounded-lg bg-green-600 py-2.5 px-4 text-center align-middle text-sm font-semibold text-white shadow-sm shadow-green-900/20 transition-all hover:bg-green-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={onStart}
                    disabled={status !== 'stopped'}
                    data-ripple-light="true"
                >
                    <span className="w-5 h-5">▶</span> Start
                </button>
                {showPauseButton && (
                    <button
                        className="middle inline-flex items-center gap-2 rounded-lg bg-yellow-600 py-2.5 px-4 text-center align-middle text-sm font-semibold text-white shadow-sm shadow-yellow-900/20 transition-all hover:bg-yellow-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={onPause}
                        disabled={status !== 'running'}
                        data-ripple-light="true"
                    >
                        <span className="w-5 h-5">⏸</span> Pause
                    </button>
                )}
                <button
                    className="middle inline-flex items-center gap-2 rounded-lg bg-blue-600 py-2.5 px-4 text-center align-middle text-sm font-semibold text-white shadow-sm shadow-blue-900/20 transition-all hover:bg-blue-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={onResume}
                    disabled={!resumeEnabled}
                    data-ripple-light="true"
                >
                    <span className="w-5 h-5">▶</span> Fortsetzen
                </button>
                <button
                    className="middle inline-flex items-center gap-2 rounded-lg bg-red-600 py-2.5 px-4 text-center align-middle text-sm font-semibold text-white shadow-sm shadow-red-900/20 transition-all hover:bg-red-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={onStop}
                    disabled={status === 'stopped'}
                    data-ripple-light="true"
                >
                    <span className="w-5 h-5">⏹</span> Stop
                </button>
            </div>

            <div className="mb-6">
                <p className="text-white">
                    Status:
                    <span className={`${statusColor} px-2.5 py-1 rounded-md text-white ml-2 shadow-sm`}>{statusText}</span>
                </p>
            </div>
        </div>
    );
};

export default Controls;