/**
 * NavigationState Interface
 * 
 * Represents current routing state for direct URL access.
 * 
 * @interface NavigationState
 */
export interface NavigationState {
  /** Current route path */
  currentPath: string;
  
  /** Previous route path */
  previousPath: string | null;
  
  /** When navigation occurred (Unix timestamp) */
  timestamp: number;
  
  /** Whether user accessed URL directly */
  isDirectAccess: boolean;
}

/**
 * NavigationState Validation Rules
 * 
 * - currentPath: must be valid route path
 * - previousPath: must be valid route path or null
 * - timestamp: must be valid Unix timestamp
 * - isDirectAccess: must be boolean
 */
export interface NavigationStateValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * NavigationState State Transitions
 * 
 * - Route changes update currentPath and previousPath
 * - Direct URL access sets isDirectAccess to true
 * - Navigation within app sets isDirectAccess to false
 */
export type NavigationStateTransition = 'route_change' | 'direct_access' | 'internal_navigation';

/**
 * Storage key for NavigationState in sessionStorage
 */
export const NAVIGATION_STATE_STORAGE_KEY = 'navigationState';

/**
 * Default NavigationState values
 */
export const DEFAULT_NAVIGATION_STATE: NavigationState = {
  currentPath: '/',
  previousPath: null,
  timestamp: Date.now(),
  isDirectAccess: false
};

/**
 * Valid route paths in the application
 */
export const VALID_ROUTES = [
  '/',
  '/changelog',
  '/datenschutz',
  '/impressum',
  '/nutzungsbedingungen',
  '/benutzereinstellungen'
] as const;

/**
 * Type for valid route paths
 */
export type ValidRoute = typeof VALID_ROUTES[number];

/**
 * German labels for route paths
 */
export const ROUTE_LABELS: Record<ValidRoute, string> = {
  '/': 'Startseite',
  '/changelog': 'Changelog',
  '/datenschutz': 'Datenschutz',
  '/impressum': 'Impressum',
  '/nutzungsbedingungen': 'Nutzungsbedingungen',
  '/benutzereinstellungen': 'Benutzereinstellungen'
};
