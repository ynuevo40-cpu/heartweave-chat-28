import { describe, it, expect } from 'vitest';

// Utility functions for validation that could be extracted
export const ValidationUtils = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidUsername: (username: string): boolean => {
    return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
  },

  sanitizeMessage: (content: string): string => {
    return content.trim().replace(/\s+/g, ' ');
  },

  isValidMessageLength: (content: string, maxLength: number = 2000): boolean => {
    return content.length > 0 && content.length <= maxLength;
  }
};

describe('ValidationUtils', () => {
  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(ValidationUtils.isValidEmail('test@example.com')).toBe(true);
      expect(ValidationUtils.isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(ValidationUtils.isValidEmail('invalid-email')).toBe(false);
      expect(ValidationUtils.isValidEmail('@domain.com')).toBe(false);
      expect(ValidationUtils.isValidEmail('user@')).toBe(false);
    });
  });

  describe('isValidUsername', () => {
    it('should validate correct usernames', () => {
      expect(ValidationUtils.isValidUsername('user123')).toBe(true);
      expect(ValidationUtils.isValidUsername('test_user')).toBe(true);
    });

    it('should reject invalid usernames', () => {
      expect(ValidationUtils.isValidUsername('ab')).toBe(false); // too short
      expect(ValidationUtils.isValidUsername('a'.repeat(21))).toBe(false); // too long
      expect(ValidationUtils.isValidUsername('user-name')).toBe(false); // invalid chars
    });
  });

  describe('sanitizeMessage', () => {
    it('should trim whitespace and normalize spaces', () => {
      expect(ValidationUtils.sanitizeMessage('  hello   world  ')).toBe('hello world');
      expect(ValidationUtils.sanitizeMessage('test\n\nmessage')).toBe('test message');
    });
  });

  describe('isValidMessageLength', () => {
    it('should validate message lengths', () => {
      expect(ValidationUtils.isValidMessageLength('Hello')).toBe(true);
      expect(ValidationUtils.isValidMessageLength('')).toBe(false);
      expect(ValidationUtils.isValidMessageLength('a'.repeat(2001))).toBe(false);
    });
  });
});