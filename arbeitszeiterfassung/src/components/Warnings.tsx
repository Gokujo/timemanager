import React from 'react';

interface WarningsProps {
  warnings: string[];
}

const Warnings: React.FC<WarningsProps> = ({ warnings }) => {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-red-500/20 rounded-lg text-white">
      <h2 className="text-xl font-semibold mb-2">Warnungen</h2>
      <ul className="list-disc pl-5">
        {warnings.map((warning, index) => (
          <li key={index}>{warning}</li>
        ))}
      </ul>
    </div>
  );
};

export default Warnings;