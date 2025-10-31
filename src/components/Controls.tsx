import React from 'react';

interface ControlsProps {
    status: 'stopped' | 'running' | 'paused';
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
}

const Controls: React.FC<ControlsProps> = ({
                                               status,
                                               onStart,
                                               onPause,
                                               onResume,
                                               onStop
                                           }) => {
    // Status color for the status indicator
    const statusColor =
        status === 'running'
            ? 'status-green'
            : status === 'paused'
                ? 'status-yellow'
                : 'status-red';

    // Status text
    const statusText =
        status === 'running'
            ? 'Laufend'
            : status === 'paused'
                ? 'Pausiert'
                : 'Gestoppt';

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
                <button
                    className="middle inline-flex items-center gap-2 rounded-lg bg-yellow-600 py-2.5 px-4 text-center align-middle text-sm font-semibold text-white shadow-sm shadow-yellow-900/20 transition-all hover:bg-yellow-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={onPause}
                    disabled={status !== 'running'}
                    data-ripple-light="true"
                >
                    <span className="w-5 h-5">⏸</span> Pause
                </button>
                <button
                    className="middle inline-flex items-center gap-2 rounded-lg bg-blue-600 py-2.5 px-4 text-center align-middle text-sm font-semibold text-white shadow-sm shadow-blue-900/20 transition-all hover:bg-blue-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={onResume}
                    disabled={status !== 'paused'}
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