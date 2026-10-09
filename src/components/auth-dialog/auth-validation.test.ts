import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validateUsername,
  validateLoginPassword,
  validateRegisterPassword,
  validateConfirmPassword,
} from './auth-validation';

describe('validateEmail', () => {
  it('requires a value', () => {
    expect(validateEmail('')).toBe('Email is required.');
  });

  it('rejects an email with no @ sign', () => {
    expect(validateEmail('not-an-email')).toBe('Enter a valid email address.');
  });

  it('trims surrounding whitespace before validating', () => {
    expect(validateEmail('  student@rs.school  ')).toBeUndefined();
  });

  it('accepts a valid email', () => {
    expect(validateEmail('student@rs.school')).toBeUndefined();
  });
});

describe('validateUsername', () => {
  it('requires a value', () => {
    expect(validateUsername('')).toBe('Username is required.');
  });

  it('rejects a username shorter than 2 characters', () => {
    expect(validateUsername('A')).toBe('Username must be 2–30 characters long.');
  });

  it('rejects a username longer than 30 characters', () => {
    expect(validateUsername('A'.repeat(31))).toBe('Username must be 2–30 characters long.');
  });

  it('rejects a username that does not start with an uppercase letter', () => {
    expect(validateUsername('forestdweller')).toBe(
      'Username must start with an uppercase letter and contain only English letters and digits.'
    );
  });

  it('accepts a valid username', () => {
    expect(validateUsername('ForestDweller1')).toBeUndefined();
  });
});

describe('validateLoginPassword', () => {
  it('requires a value', () => {
    expect(validateLoginPassword('')).toBe('Password is required.');
  });

  it('rejects a password shorter than 6 characters', () => {
    expect(validateLoginPassword('Ab1')).toBe('Password must be at least 6 characters.');
  });

  it('accepts any password that meets the minimum length', () => {
    expect(validateLoginPassword('abcdef')).toBeUndefined();
  });
});

describe('validateRegisterPassword', () => {
  it('requires a value', () => {
    expect(validateRegisterPassword('')).toBe('Password is required.');
  });

  it('rejects a password containing spaces', () => {
    expect(validateRegisterPassword('Abc def1!')).toBe('Password cannot contain spaces.');
  });

  it('rejects a password shorter than 6 characters', () => {
    expect(validateRegisterPassword('Ab1!')).toBe('Password must be at least 6 characters.');
  });

  it('rejects a password with no uppercase letter', () => {
    expect(validateRegisterPassword('abcdef1!')).toBe(
      'Password must contain at least one uppercase letter.'
    );
  });

  it('rejects a password with no digit', () => {
    expect(validateRegisterPassword('Abcdefgh!')).toBe('Password must contain at least one digit.');
  });

  it('rejects a password with no special character', () => {
    expect(validateRegisterPassword('Abcdefg1')).toBe(
      'Password must contain at least one special character.'
    );
  });

  it('accepts a password meeting every rule', () => {
    expect(validateRegisterPassword('Abcdef1!')).toBeUndefined();
  });
});

describe('validateConfirmPassword', () => {
  it('requires a value', () => {
    expect(validateConfirmPassword('', 'Abcdef1!')).toBe('Please confirm your password.');
  });

  it('rejects a mismatched confirmation', () => {
    expect(validateConfirmPassword('Different1!', 'Abcdef1!')).toBe('Passwords do not match.');
  });

  it('accepts a matching confirmation', () => {
    expect(validateConfirmPassword('Abcdef1!', 'Abcdef1!')).toBeUndefined();
  });
});
