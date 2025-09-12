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
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          onClick={onStart}
          disabled={status !== 'stopped'}
        >
          <span className="w-5 h-5">▶</span> Start
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          onClick={onPause}
          disabled={status !== 'running'}
        >
          <span className="w-5 h-5">⏸</span> Pause
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={onResume}
          disabled={status !== 'paused'}
        >
          <span className="w-5 h-5">▶</span> Fortsetzen
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          onClick={onStop}
          disabled={status === 'stopped'}
        >
          <span className="w-5 h-5">⏹</span> Stop
        </button>
      </div>

      <div className="mb-6">
        <p className="text-white">
          Status: 
          <span className={`${statusColor} px-2 py-1 rounded text-white ml-2`}>
            {statusText}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Controls;