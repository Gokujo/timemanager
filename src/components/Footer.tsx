/**
 * Footer Component
 * 
 * Enhanced footer component with start time navigation link.
 * Provides quick access to the main time tracking functionality.
 * Includes GitHub repository link for source code access.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavigationUtils, NAVIGATION_CONSTANTS } from '../utils/navigationUtils';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const location = useLocation();
  const navigationContext = NavigationUtils.getNavigationContext(location.pathname);

  return (
    <footer 
      role="contentinfo" 
      className={`mt-8 pt-6 border-t border-white/20 ${className}`}
      aria-label="Footer"
    >
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        {/* Start Time Link - Enhanced for User Story 1 */}
        {navigationContext.canNavigateToStartTime && (
          <>
            <Link
              to="/"
              className="text-white/70 hover:text-white transition-colors font-medium"
              aria-label="Startseite - Zurück zur Arbeitszeiterfassung"
              data-testid="start-time-link"
            >
              Startseite
            </Link>
            <span className="text-white/50">•</span>
          </>
        )}

        {/* Existing Footer Links */}
        <Link
          to="/benutzereinstellungen"
          className="text-white/70 hover:text-white transition-colors"
          aria-label="Zu den Benutzereinstellungen"
        >
          Einstellungen
        </Link>
        <span className="text-white/50">•</span>
        
        <Link
          to="/impressum"
          className="text-white/70 hover:text-white transition-colors"
          aria-label="Zum Impressum"
        >
          Impressum
        </Link>
        <span className="text-white/50">•</span>
        
        <Link
          to="/datenschutz"
          className="text-white/70 hover:text-white transition-colors"
          aria-label="Zur Datenschutzerklärung"
        >
          Datenschutz
        </Link>
        <span className="text-white/50">•</span>
        
        <Link
          to="/nutzungsbedingungen"
          className="text-white/70 hover:text-white transition-colors"
          aria-label="Zu den Nutzungsbedingungen"
        >
          Nutzungsbedingungen
        </Link>
        <span className="text-white/50">•</span>
        
        <Link
          to="/changelog"
          className="text-white/70 hover:text-white transition-colors"
          aria-label="Zum Changelog"
          data-ripple-light="true"
        >
          v0.2.4
        </Link>
        <span className="text-white/50">•</span>
        
        <a
          href="https://github.com/Gokujo/timemanager"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/70 hover:text-white transition-colors"
          aria-label="Quellcode auf GitHub ansehen"
        >
          GitHub
        </a>
      </div>

      {/* Navigation Context Information for Screen Readers */}
      <div className="sr-only" aria-live="polite">
        {navigationContext.isStartTimePage 
          ? 'Sie befinden sich auf der Startseite mit der Arbeitszeiterfassung'
          : `Sie befinden sich auf der Seite: ${NavigationUtils.getRouteLabel(location.pathname)}`
        }
      </div>
    </footer>
  );
};

export default Footer;
