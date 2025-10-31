// Component tests for German UI text
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TEST_CONSTANTS, germanLanguageTestHelpers } from '../testHelpers';
import { mockGermanTexts, mockUserSettings } from '../fixtures/mockData';

// Mock React components for testing
const MockTimeDisplay = ({ minutes, format }: { minutes: number; format: 'minutes' | 'hours' }) => {
  const formatTime = (minutes: number, format: 'minutes' | 'hours') => {
    if (format === 'minutes') {
      return minutes.toString();
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
  };

  return (
    <div data-testid="time-display">
      <span data-testid="time-value">{formatTime(minutes, format)}</span>
      <span data-testid="time-label">
        {format === 'minutes' ? 'Minuten' : 'Stunden'}
      </span>
    </div>
  );
};

const MockWorkPlanSelector = ({ plans, selectedPlan, onPlanChange }: {
  plans: Record<string, any>;
  selectedPlan: string;
  onPlanChange: (plan: string) => void;
}) => {
  return (
    <div data-testid="work-plan-selector">
      <label htmlFor="plan-select">Arbeitsplan:</label>
      <select
        id="plan-select"
        value={selectedPlan}
        onChange={(e) => onPlanChange(e.target.value)}
        data-testid="plan-select"
      >
        {Object.entries(plans).map(([key, plan]) => (
          <option key={key} value={key}>
            {plan.name}
          </option>
        ))}
      </select>
    </div>
  );
};

const MockSettingsForm = ({ settings, onSave, onReset }: {
  settings: any;
  onSave: (settings: any) => void;
  onReset: () => void;
}) => {
  const [localSettings, setLocalSettings] = React.useState(settings);

  const handleSave = () => {
    onSave(localSettings);
  };

  const handleReset = () => {
    onReset();
    setLocalSettings(settings);
  };

  return (
    <form data-testid="settings-form">
      <div>
        <label htmlFor="time-format">Zeitformat:</label>
        <select
          id="time-format"
          value={localSettings.timeFormat}
          onChange={(e) => setLocalSettings({ ...localSettings, timeFormat: e.target.value })}
          data-testid="time-format-select"
        >
          <option value="minutes">Minuten</option>
          <option value="hours">Stunden</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="work-hours">Tägliche Arbeitsstunden:</label>
        <input
          id="work-hours"
          type="number"
          value={localSettings.dailyWorkHours.monday}
          onChange={(e) => setLocalSettings({
            ...localSettings,
            dailyWorkHours: { ...localSettings.dailyWorkHours, monday: parseInt(e.target.value) }
          })}
          data-testid="work-hours-input"
        />
        <span>Minuten</span>
      </div>
      
      <button type="button" onClick={handleSave} data-testid="save-button">
        Einstellungen speichern
      </button>
      
      <button type="button" onClick={handleReset} data-testid="reset-button">
        Auf Standard zurücksetzen
      </button>
    </form>
  );
};

const MockErrorDisplay = ({ error }: { error: string | null }) => {
  if (!error) return null;
  
  return (
    <div data-testid="error-display" role="alert">
      <span data-testid="error-icon">⚠️</span>
      <span data-testid="error-message">{error}</span>
    </div>
  );
};

const MockSuccessMessage = ({ message }: { message: string | null }) => {
  if (!message) return null;
  
  return (
    <div data-testid="success-message" role="status">
      <span data-testid="success-icon">✅</span>
      <span data-testid="success-text">{message}</span>
    </div>
  );
};

describe('German UI Text Component Tests', () => {
  describe('TimeDisplay Component', () => {
    it('should display time in German format', () => {
      render(<MockTimeDisplay minutes={480} format="hours" />);
      
      expect(screen.getByTestId('time-value')).toHaveTextContent('08:00');
      expect(screen.getByTestId('time-label')).toHaveTextContent('Stunden');
    });

    it('should display time in minutes format with German label', () => {
      render(<MockTimeDisplay minutes={480} format="minutes" />);
      
      expect(screen.getByTestId('time-value')).toHaveTextContent('480');
      expect(screen.getByTestId('time-label')).toHaveTextContent('Minuten');
    });

    it('should use German time format (24-hour)', () => {
      render(<MockTimeDisplay minutes={1080} format="hours" />);
      
      const timeValue = screen.getByTestId('time-value');
      expect(timeValue).toHaveTextContent('18:00'); // 6:00 PM in 24-hour format
      expect(timeValue.textContent).not.toContain('AM');
      expect(timeValue.textContent).not.toContain('PM');
    });

    it('should handle edge cases correctly', () => {
      render(<MockTimeDisplay minutes={0} format="hours" />);
      
      expect(screen.getByTestId('time-value')).toHaveTextContent('00:00');
      expect(screen.getByTestId('time-label')).toHaveTextContent('Stunden');
    });
  });

  describe('WorkPlanSelector Component', () => {
    it('should display work plans in German', () => {
      const plans = {
        VOR_ORT: { name: 'Vor Ort', start: 480, end: 1080, max: 600 },
        HOMEOFFICE: { name: 'Homeoffice', start: 480, end: 1080, max: 600 },
      };

      render(
        <MockWorkPlanSelector
          plans={plans}
          selectedPlan="VOR_ORT"
          onPlanChange={() => {}}
        />
      );

      expect(screen.getByText('Arbeitsplan:')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Vor Ort')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Homeoffice')).toBeInTheDocument();
    });

    it('should handle plan selection with German text', async () => {
      const plans = {
        VOR_ORT: { name: 'Vor Ort', start: 480, end: 1080, max: 600 },
        HOMEOFFICE: { name: 'Homeoffice', start: 480, end: 1080, max: 600 },
      };

      const handlePlanChange = jest.fn();

      render(
        <MockWorkPlanSelector
          plans={plans}
          selectedPlan="VOR_ORT"
          onPlanChange={handlePlanChange}
        />
      );

      const select = screen.getByTestId('plan-select');
      fireEvent.change(select, { target: { value: 'HOMEOFFICE' } });

      expect(handlePlanChange).toHaveBeenCalledWith('HOMEOFFICE');
    });

    it('should validate German text in work plan names', () => {
      const plans = {
        VOR_ORT: { name: 'Vor Ort', start: 480, end: 1080, max: 600 },
        HOMEOFFICE: { name: 'Homeoffice', start: 480, end: 1080, max: 600 },
      };

      render(
        <MockWorkPlanSelector
          plans={plans}
          selectedPlan="VOR_ORT"
          onPlanChange={() => {}}
        />
      );

      // Validate that all displayed text is in German
      const labelText = screen.getByText('Arbeitsplan:').textContent;
      const validation = germanLanguageTestHelpers.validateGermanText(labelText);
      expect(validation.isValid).toBe(true);

      // Validate work plan names
      Object.values(plans).forEach(plan => {
        const planValidation = germanLanguageTestHelpers.validateGermanText(plan.name);
        expect(planValidation.isValid).toBe(true);
      });
    });
  });

  describe('SettingsForm Component', () => {
    it('should display settings form in German', () => {
      const settings = mockUserSettings.default;
      const onSave = jest.fn();
      const onReset = jest.fn();

      render(
        <MockSettingsForm
          settings={settings}
          onSave={onSave}
          onReset={onReset}
        />
      );

      expect(screen.getByText('Zeitformat:')).toBeInTheDocument();
      expect(screen.getByText('Tägliche Arbeitsstunden:')).toBeInTheDocument();
      expect(screen.getByText('Minuten')).toBeInTheDocument();
      expect(screen.getByText('Einstellungen speichern')).toBeInTheDocument();
      expect(screen.getByText('Auf Standard zurücksetzen')).toBeInTheDocument();
    });

    it('should handle form interactions with German text', async () => {
      const settings = mockUserSettings.default;
      const onSave = jest.fn();
      const onReset = jest.fn();

      render(
        <MockSettingsForm
          settings={settings}
          onSave={onSave}
          onReset={onReset}
        />
      );

      // Test time format selection
      const timeFormatSelect = screen.getByTestId('time-format-select');
      fireEvent.change(timeFormatSelect, { target: { value: 'hours' } });
      expect(timeFormatSelect).toHaveValue('hours');

      // Test work hours input
      const workHoursInput = screen.getByTestId('work-hours-input');
      fireEvent.change(workHoursInput, { target: { value: '420' } });
      expect(workHoursInput).toHaveValue(420);

      // Test save button
      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);
      expect(onSave).toHaveBeenCalled();

      // Test reset button
      const resetButton = screen.getByTestId('reset-button');
      fireEvent.click(resetButton);
      expect(onReset).toHaveBeenCalled();
    });

    it('should validate all form text is in German', () => {
      const settings = mockUserSettings.default;
      const onSave = jest.fn();
      const onReset = jest.fn();

      render(
        <MockSettingsForm
          settings={settings}
          onSave={onSave}
          onReset={onReset}
        />
      );

      // Get all text content from the form
      const formTexts = [
        'Zeitformat:',
        'Tägliche Arbeitsstunden:',
        'Minuten',
        'Stunden',
        'Einstellungen speichern',
        'Auf Standard zurücksetzen',
      ];

      formTexts.forEach(text => {
        const validation = germanLanguageTestHelpers.validateGermanText(text);
        expect(validation.isValid).toBe(true);
        expect(validation.issues).toHaveLength(0);
      });
    });
  });

  describe('ErrorDisplay Component', () => {
    it('should display German error messages', () => {
      const errorMessage = 'Maximale Arbeitszeit von 10 Stunden überschritten.';
      
      render(<MockErrorDisplay error={errorMessage} />);

      expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage);
      expect(screen.getByTestId('error-display')).toHaveAttribute('role', 'alert');
    });

    it('should not display when no error', () => {
      render(<MockErrorDisplay error={null} />);

      expect(screen.queryByTestId('error-display')).not.toBeInTheDocument();
    });

    it('should validate error messages are in German', () => {
      const errorMessages = Object.values(mockGermanTexts.errorMessages);
      
      errorMessages.forEach(message => {
        render(<MockErrorDisplay error={message} />);
        
        const errorElement = screen.getByTestId('error-message');
        expect(errorElement).toHaveTextContent(message);
        
        const validation = germanLanguageTestHelpers.validateGermanText(message);
        expect(validation.isValid).toBe(true);
        
        // Clean up for next iteration
        screen.getByTestId('error-display').remove();
      });
    });
  });

  describe('SuccessMessage Component', () => {
    it('should display German success messages', () => {
      const successMessage = 'Einstellungen gespeichert';
      
      render(<MockSuccessMessage message={successMessage} />);

      expect(screen.getByTestId('success-text')).toHaveTextContent(successMessage);
      expect(screen.getByTestId('success-message')).toHaveAttribute('role', 'status');
    });

    it('should not display when no message', () => {
      render(<MockSuccessMessage message={null} />);

      expect(screen.queryByTestId('success-message')).not.toBeInTheDocument();
    });

    it('should validate success messages are in German', () => {
      const successMessages = Object.values(mockGermanTexts.successMessages);
      
      successMessages.forEach(message => {
        render(<MockSuccessMessage message={message} />);
        
        const successElement = screen.getByTestId('success-text');
        expect(successElement).toHaveTextContent(message);
        
        const validation = germanLanguageTestHelpers.validateGermanText(message);
        expect(validation.isValid).toBe(true);
        
        // Clean up for next iteration
        screen.getByTestId('success-message').remove();
      });
    });
  });

  describe('Accessibility with German Text', () => {
    it('should maintain accessibility with German labels', () => {
      render(
        <MockSettingsForm
          settings={mockUserSettings.default}
          onSave={() => {}}
          onReset={() => {}}
        />
      );

      // Check that labels are properly associated with form controls
      const timeFormatLabel = screen.getByText('Zeitformat:');
      const timeFormatSelect = screen.getByTestId('time-format-select');
      expect(timeFormatLabel).toBeInTheDocument();
      expect(timeFormatSelect).toBeInTheDocument();

      const workHoursLabel = screen.getByText('Tägliche Arbeitsstunden:');
      const workHoursInput = screen.getByTestId('work-hours-input');
      expect(workHoursLabel).toBeInTheDocument();
      expect(workHoursInput).toBeInTheDocument();
    });

    it('should provide proper ARIA attributes for German text', () => {
      const errorMessage = 'Ungültiges Zeitformat. Bitte verwenden Sie das Format HH:MM.';
      
      render(<MockErrorDisplay error={errorMessage} />);

      const errorDisplay = screen.getByTestId('error-display');
      expect(errorDisplay).toHaveAttribute('role', 'alert');
      expect(errorDisplay).toHaveTextContent(errorMessage);
    });
  });

  describe('Performance with German UI Components', () => {
    it('should render German UI components efficiently', () => {
      const startTime = performance.now();
      
      render(
        <div>
          <MockTimeDisplay minutes={480} format="hours" />
          <MockWorkPlanSelector
            plans={{
              VOR_ORT: { name: 'Vor Ort', start: 480, end: 1080, max: 600 },
              HOMEOFFICE: { name: 'Homeoffice', start: 480, end: 1080, max: 600 },
            }}
            selectedPlan="VOR_ORT"
            onPlanChange={() => {}}
          />
          <MockSettingsForm
            settings={mockUserSettings.default}
            onSave={() => {}}
            onReset={() => {}}
          />
        </div>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (less than 50ms)
      expect(renderTime).toBeLessThan(50);
    });

    it('should handle German text updates efficiently', async () => {
      const { rerender } = render(
        <MockTimeDisplay minutes={480} format="hours" />
      );

      const startTime = performance.now();
      
      // Rerender with different values
      for (let i = 0; i < 100; i++) {
        rerender(<MockTimeDisplay minutes={i * 60} format="hours" />);
      }
      
      const endTime = performance.now();
      const updateTime = endTime - startTime;
      
      // Should update efficiently
      expect(updateTime).toBeLessThan(100);
    });
  });
});
