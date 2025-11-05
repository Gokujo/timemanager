/**
 * Navigation Utilities
 * 
 * Provides utilities for navigation to start time functionality.
 * Supports React Router navigation and direct URL handling.
 */

import { NavigateFunction } from 'react-router-dom';
import { VALID_ROUTES, ValidRoute } from '../interfaces/navigation';

/**
 * Navigation utility class for start time functionality
 */
export class NavigationUtils {
  /**
   * Navigate to start time (home page)
   */
  static navigateToStartTime(navigate: NavigateFunction): void {
    try {
      navigate('/', { replace: false });
    } catch (error) {
      // Fallback to window.location if React Router fails
      window.location.href = '/';
    }
  }

  /**
   * Navigate to start time with state
   */
  static navigateToStartTimeWithState(
    navigate: NavigateFunction, 
    state?: { highlightStartTime?: boolean }
  ): void {
    try {
      navigate('/', { 
        replace: false,
        state: state || {}
      });
    } catch (error) {
      window.location.href = '/';
    }
  }

  /**
   * Check if current path is start time page
   */
  static isStartTimePage(pathname: string): boolean {
    return pathname === '/' || pathname === '/start';
  }

  /**
   * Get navigation context for current page
   */
  static getNavigationContext(pathname: string): {
    isStartTimePage: boolean;
    canNavigateToStartTime: boolean;
    previousPage?: string;
  } {
    const isStartTimePage = this.isStartTimePage(pathname);
    const canNavigateToStartTime = !isStartTimePage;
    
    return {
      isStartTimePage,
      canNavigateToStartTime,
      previousPage: isStartTimePage ? undefined : pathname
    };
  }

  /**
   * Validate route path
   */
  static isValidRoute(path: string): path is ValidRoute {
    return VALID_ROUTES.includes(path as ValidRoute);
  }

  /**
   * Get route label in German
   */
  static getRouteLabel(path: string): string {
    if (this.isValidRoute(path)) {
      const labels: Record<ValidRoute, string> = {
        '/': 'Startseite',
        '/changelog': 'Changelog',
        '/datenschutz': 'Datenschutz',
        '/impressum': 'Impressum',
        '/nutzungsbedingungen': 'Nutzungsbedingungen',
        '/einstellungen': 'Benutzereinstellungen'
      };
      return labels[path];
    }
    return 'Unbekannte Seite';
  }

  /**
   * Create navigation breadcrumb
   */
  static createBreadcrumb(currentPath: string): Array<{ path: string; label: string }> {
    const breadcrumb = [];
    
    // Always include home
    breadcrumb.push({ path: '/', label: 'Startseite' });
    
    // Add current page if not home
    if (currentPath !== '/') {
      breadcrumb.push({ 
        path: currentPath, 
        label: this.getRouteLabel(currentPath) 
      });
    }
    
    return breadcrumb;
  }

  /**
   * Handle direct URL access
   */
  static handleDirectAccess(pathname: string): {
    isValid: boolean;
    redirectPath?: string;
    error?: string;
  } {
    if (this.isValidRoute(pathname)) {
      return { isValid: true };
    }

    // Handle common redirects
    const redirects: Record<string, string> = {
      '/start': '/',
      '/home': '/',
      '/index': '/',
      '/index.html': '/',
      '/benutzereinstellungen': '/einstellungen'
    };

    if (redirects[pathname]) {
      return {
        isValid: false,
        redirectPath: redirects[pathname]
      };
    }

    return {
      isValid: false,
      error: `Ungültige Route: ${pathname}`
    };
  }

  /**
   * Get navigation suggestions for 404 pages
   */
  static getNavigationSuggestions(): Array<{ path: string; label: string; description: string }> {
    return [
      {
        path: '/',
        label: 'Startseite',
        description: 'Zurück zur Arbeitszeiterfassung'
      },
      {
        path: '/changelog',
        label: 'Changelog',
        description: 'Neueste Änderungen anzeigen'
      },
      {
        path: '/datenschutz',
        label: 'Datenschutz',
        description: 'Datenschutzerklärung lesen'
      },
      {
        path: '/impressum',
        label: 'Impressum',
        description: 'Impressum und Kontakt'
      }
    ];
  }
}

/**
 * Hook for navigation utilities
 */
export function useNavigationUtils() {
  return {
    navigateToStartTime: NavigationUtils.navigateToStartTime,
    navigateToStartTimeWithState: NavigationUtils.navigateToStartTimeWithState,
    isStartTimePage: NavigationUtils.isStartTimePage,
    getNavigationContext: NavigationUtils.getNavigationContext,
    isValidRoute: NavigationUtils.isValidRoute,
    getRouteLabel: NavigationUtils.getRouteLabel,
    createBreadcrumb: NavigationUtils.createBreadcrumb,
    handleDirectAccess: NavigationUtils.handleDirectAccess,
    getNavigationSuggestions: NavigationUtils.getNavigationSuggestions
  };
}

/**
 * Constants for navigation
 */
export const NAVIGATION_CONSTANTS = {
  START_TIME_PATH: '/',
  START_TIME_LABEL: 'Startseite',
  START_TIME_DESCRIPTION: 'Zurück zur Arbeitszeiterfassung',
  FOOTER_NAVIGATION_LABEL: 'Footer navigation',
  MAX_BREADCRUMB_ITEMS: 5
} as const;
