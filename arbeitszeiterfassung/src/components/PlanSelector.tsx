import React from 'react';
import { getPlans } from '../constants/plans';
import { formatTimeFromMinutes } from '../utils/timeUtils';

interface PlanSelectorProps {
  selectedPlan: string;
  onPlanChange: (plan: string) => void;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({
  selectedPlan,
  onPlanChange
}) => {
  const plans = getPlans();
  // Ensure selectedPlan is a valid key in plans
  const validPlan = selectedPlan && plans[selectedPlan] ? selectedPlan : 'VOR_ORT';

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-white mb-2">Anwesenheitsplan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(plans).map(planKey => (
          <div
            key={planKey}
            className={`p-4 rounded-lg cursor-pointer ${
              validPlan === planKey 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/20 text-white'
            }`}
            onClick={() => onPlanChange(planKey)}
          >
            <p className="font-bold">{plans[planKey].name}</p>
            <p>
              {formatTimeFromMinutes(plans[planKey].start)} - {formatTimeFromMinutes(plans[planKey].end)} Uhr 
              (max. {formatTimeFromMinutes(plans[planKey].max)})
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanSelector;
