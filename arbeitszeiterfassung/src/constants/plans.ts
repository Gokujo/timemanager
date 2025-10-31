import { Plan } from "../interfaces/plan";
import { getCustomPlans } from "../utils/userSettingsUtils";

// Dynamische Pläne aus Benutzereinstellungen
export const getPlans = (): Record<string, Plan> => {
  return getCustomPlans();
};

// Fallback für statische Verwendung
export const PLANS: Record<string, Plan> = {
  VOR_ORT: { name: 'Vor Ort', start: 6 * 60, end: 17.5 * 60, max: 10 * 60 },
  HOMEOFFICE: { name: 'Homeoffice', start: 6 * 60, end: 20 * 60, max: 10 * 60 }
};