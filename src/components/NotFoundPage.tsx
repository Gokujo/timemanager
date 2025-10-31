/**
 * NotFoundPage Component
 * 
 * 404 error page component for handling invalid routes.
 * Provides user-friendly error message and navigation suggestions.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavigationUtils } from '../utils/navigationUtils';

interface NotFoundPageProps {
  className?: string;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ className = '' }) => {
  const location = useLocation();
  const suggestions = NavigationUtils.getNavigationSuggestions();

  return (
    <div 
      className={`min-h-screen flex items-center justify-center p-4 ${className}`}
      role="main"
      aria-labelledby="not-found-title"
    >
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1 
          id="not-found-title"
          className="text-2xl font-bold text-gray-900 mb-4"
        >
          404 - Seite nicht gefunden
        </h1>
        
        <p className="text-gray-600 mb-6">
          Die angeforderte Seite <code className="bg-gray-100 px-2 py-1 rounded text-sm">{location.pathname}</code> konnte nicht gefunden werden.
        </p>

        {/* Navigation Suggestions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Möglicherweise suchen Sie nach:
          </h2>
          
          <nav 
            className="space-y-2"
            aria-label="Navigation Vorschläge"
          >
            {suggestions.map((suggestion, index) => (
              <Link
                key={suggestion.path}
                to={suggestion.path}
                className="block w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`${suggestion.label}: ${suggestion.description}`}
                data-testid={`suggestion-${suggestion.path.replace('/', '') || 'home'}`}
              >
                <div className="font-medium">{suggestion.label}</div>
                <div className="text-sm text-blue-600">{suggestion.description}</div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Additional Help */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Falls Sie weiterhin Probleme haben, können Sie zur{' '}
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Startseite
            </Link>{' '}
            zurückkehren.
          </p>
        </div>

        {/* Screen Reader Information */}
        <div className="sr-only" aria-live="polite">
          Fehler 404: Die angeforderte Seite {location.pathname} wurde nicht gefunden. 
          Verwenden Sie die Navigation Vorschläge, um zu einer verfügbaren Seite zu gelangen.
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
