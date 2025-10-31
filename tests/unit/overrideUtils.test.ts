/**
 * Unit Tests for Override Utilities
 * 
 * Tests the override utilities for User Story 4.
 * Ensures proper DSGVO compliance and override functionality.
 */

import { OverrideUtils } from '../../src/utils/overrideUtils';
import { OverrideSetting, DEFAULT_OVERRIDE_SETTING } from '../../src/interfaces/override';

// Mock localStorage for testing
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('Override Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Override Setting Management', () => {
    it('should get default override setting when none exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const setting = OverrideUtils.getOverrideSetting();
      expect(setting).toEqual(DEFAULT_OVERRIDE_SETTING);
    });

    it('should get existing override setting from localStorage', () => {
      const existingSetting: OverrideSetting = {
        enabled: true,
        timestamp: Date.now(),
        reason: 'Test reason',
        acknowledged: true
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingSetting));

      const setting = OverrideUtils.getOverrideSetting();
      expect(setting).toEqual(existingSetting);
    });

    it('should save override setting to localStorage', () => {
      const setting: OverrideSetting = {
        enabled: true,
        timestamp: Date.now(),
        reason: 'Test reason',
        acknowledged: true
      };

      const result = OverrideUtils.saveOverrideSetting(setting);
      expect(result.success).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'overrideSetting',
        JSON.stringify(setting)
      );
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const setting: OverrideSetting = {
        enabled: true,
        timestamp: Date.now(),
        reason: 'Test reason',
        acknowledged: true
      };

      const result = OverrideUtils.saveOverrideSetting(setting);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Override Validation', () => {
    it('should validate override setting correctly', () => {
      const validSetting: OverrideSetting = {
        enabled: true,
        timestamp: Date.now(),
        reason: 'Valid reason',
        acknowledged: true
      };

      const result = OverrideUtils.validateOverrideSetting(validSetting);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid timestamp', () => {
      const invalidSetting: OverrideSetting = {
        enabled: true,
        timestamp: -1, // Invalid timestamp
        reason: 'Test reason',
        acknowledged: true
      };

      const result = OverrideUtils.validateOverrideSetting(invalidSetting);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Ungültiger Zeitstempel');
    });

    it('should reject reason that is too long', () => {
      const invalidSetting: OverrideSetting = {
        enabled: true,
        timestamp: Date.now(),
        reason: 'a'.repeat(201), // Too long
        acknowledged: true
      };

      const result = OverrideUtils.validateOverrideSetting(invalidSetting);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Grund zu lang');
    });

    it('should require acknowledgment when enabled', () => {
      const invalidSetting: OverrideSetting = {
        enabled: true,
        timestamp: Date.now(),
        reason: 'Test reason',
        acknowledged: false // Not acknowledged
      };

      const result = OverrideUtils.validateOverrideSetting(invalidSetting);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Rechtliche Bestätigung erforderlich');
    });
  });

  describe('DSGVO Compliance', () => {
    it('should only store data locally', () => {
      const setting: OverrideSetting = {
        enabled: true,
        timestamp: Date.now(),
        reason: 'Test reason',
        acknowledged: true
      };

      OverrideUtils.saveOverrideSetting(setting);
      
      // Should only use localStorage, no external calls
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
    });

    it('should allow complete data deletion', () => {
      const result = OverrideUtils.clearOverrideData();
      expect(result.success).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('overrideSetting');
    });

    it('should not store sensitive user information', () => {
      const setting: OverrideSetting = {
        enabled: true,
        timestamp: Date.now(),
        reason: 'Test reason',
        acknowledged: true
      };

      const savedData = JSON.stringify(setting);
      
      // Should not contain sensitive information
      expect(savedData).not.toContain('password');
      expect(savedData).not.toContain('email');
      expect(savedData).not.toContain('name');
      expect(savedData).not.toContain('address');
    });
  });

  describe('Break Requirement Validation', () => {
    it('should not allow override during break periods', () => {
      const workTime = {
        totalWorkTime: 8 * 60, // 8 hours
        totalBreakTime: 30,
        isOnBreak: true // Currently on break
      };

      const result = OverrideUtils.canUseOverride(workTime, true);
      expect(result.canOverride).toBe(false);
      expect(result.reason).toContain('Pause');
    });

    it('should allow override during active work time', () => {
      const workTime = {
        totalWorkTime: 8 * 60, // 8 hours
        totalBreakTime: 30,
        isOnBreak: false // Not on break
      };

      const result = OverrideUtils.canUseOverride(workTime, true);
      expect(result.canOverride).toBe(true);
    });

    it('should not allow override if not enabled', () => {
      const workTime = {
        totalWorkTime: 8 * 60, // 8 hours
        totalBreakTime: 30,
        isOnBreak: false
      };

      const result = OverrideUtils.canUseOverride(workTime, false);
      expect(result.canOverride).toBe(false);
      expect(result.reason).toContain('nicht aktiviert');
    });
  });

  describe('German Language Requirements', () => {
    it('should provide German error messages', () => {
      const invalidSetting: OverrideSetting = {
        enabled: true,
        timestamp: -1,
        reason: '',
        acknowledged: false
      };

      const result = OverrideUtils.validateOverrideSetting(invalidSetting);
      result.errors.forEach(error => {
        expect(error).toMatch(/[äöüßÄÖÜ]/);
      });
    });

    it('should use German labels and descriptions', () => {
      const labels = OverrideUtils.getOverrideLabels();
      expect(labels.title).toMatch(/[äöüßÄÖÜ]/);
      expect(labels.description).toMatch(/[äöüßÄÖÜ]/);
      expect(labels.warning).toMatch(/[äöüßÄÖÜ]/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle corrupted localStorage data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const setting = OverrideUtils.getOverrideSetting();
      expect(setting).toEqual(DEFAULT_OVERRIDE_SETTING);
    });

    it('should handle empty localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('');

      const setting = OverrideUtils.getOverrideSetting();
      expect(setting).toEqual(DEFAULT_OVERRIDE_SETTING);
    });

    it('should handle missing localStorage', () => {
      // @ts-ignore
      delete window.localStorage;

      const setting = OverrideUtils.getOverrideSetting();
      expect(setting).toEqual(DEFAULT_OVERRIDE_SETTING);
    });
  });
});
