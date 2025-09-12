import { Plan } from "../interfaces/plan";

export const PLANS: Record<string, Plan> = {
  VOR_ORT: { name: 'Vor Ort', start: 6 * 60, end: 17.5 * 60, max: 11.5 * 60 },
  HOMEOFFICE: { name: 'Homeoffice', start: 6 * 60, end: 20 * 60, max: 14 * 60 }
};