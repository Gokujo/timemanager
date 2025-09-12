import React from 'react';
import { PLANS } from '../constants/plans';
import { formatTimeFromMinutes } from '../utils/timeUtils';

interface PlanSelectorProps {
  selectedPlan: string;
  onPlanChange: (plan: string) => void;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({
  selectedPlan,
  onPlanChange
}) => {
  // Ensure selectedPlan is a valid key in PLANS
  const validPlan = selectedPlan && PLANS[selectedPlan] ? selectedPlan : 'VOR_ORT';

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-white mb-2">Anwesenheitsplan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(PLANS).map(planKey => (
          <div
            key={planKey}
            className={`p-4 rounded-lg cursor-pointer ${
              validPlan === planKey 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/20 text-white'
            }`}
            onClick={() => onPlanChange(planKey)}
          >
            <p className="font-bold">{PLANS[planKey].name}</p>
            <p>
              {formatTimeFromMinutes(PLANS[planKey].start)} - {formatTimeFromMinutes(PLANS[planKey].end)} Uhr 
              (max. {formatTimeFromMinutes(PLANS[planKey].max)})
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanSelector;
