const EMAIL_PATTERN: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN: RegExp = /^[A-Z][A-Za-z\d]{1,29}$/;

const REGISTER_PASSWORD_MIN_LENGTH: number = 6;
const LOGIN_PASSWORD_MIN_LENGTH: number = 6;

const UPPERCASE_PATTERN: RegExp = /[A-Z]/;
const DIGIT_PATTERN: RegExp = /\d/;
const SPECIAL_CHARACTER_PATTERN: RegExp = /[^A-Za-z\d\s]/;
const WHITESPACE_PATTERN: RegExp = /\s/;

interface ValidationRule {
  isInvalid: (value: string) => boolean;
  message: string;
}

function getFirstError(value: string, rules: ValidationRule[]): string | undefined {
  const failedRule = rules.find((rule: ValidationRule): boolean => rule.isInvalid(value));

  return failedRule?.message;
}

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();

  return getFirstError(trimmed, [
    { isInvalid: (current: string): boolean => !current, message: 'Email is required.' },
    {
      isInvalid: (current: string): boolean => !EMAIL_PATTERN.test(current),
      message: 'Enter a valid email address.',
    },
  ]);
}

export function validateUsername(value: string): string | undefined {
  const trimmed = value.trim();

  return getFirstError(trimmed, [
    { isInvalid: (current: string): boolean => !current, message: 'Username is required.' },
    {
      isInvalid: (current: string): boolean => current.length < 2 || current.length > 30,
      message: 'Username must be 2–30 characters long.',
    },
    {
      isInvalid: (current: string): boolean => !USERNAME_PATTERN.test(current),
      message:
        'Username must start with an uppercase letter and contain only English letters and digits.',
    },
  ]);
}

export function validateLoginPassword(value: string): string | undefined {
  return getFirstError(value, [
    { isInvalid: (current: string): boolean => !current, message: 'Password is required.' },
    {
      isInvalid: (current: string): boolean => current.length < LOGIN_PASSWORD_MIN_LENGTH,
      message: `Password must be at least ${LOGIN_PASSWORD_MIN_LENGTH} characters.`,
    },
  ]);
}

export function validateRegisterPassword(value: string): string | undefined {
  return getFirstError(value, [
    { isInvalid: (current: string): boolean => !current, message: 'Password is required.' },
    {
      isInvalid: (current: string): boolean => WHITESPACE_PATTERN.test(current),
      message: 'Password cannot contain spaces.',
    },
    {
      isInvalid: (current: string): boolean => current.length < REGISTER_PASSWORD_MIN_LENGTH,
      message: `Password must be at least ${REGISTER_PASSWORD_MIN_LENGTH} characters.`,
    },
    {
      isInvalid: (current: string): boolean => !UPPERCASE_PATTERN.test(current),
      message: 'Password must contain at least one uppercase letter.',
    },
    {
      isInvalid: (current: string): boolean => !DIGIT_PATTERN.test(current),
      message: 'Password must contain at least one digit.',
    },
    {
      isInvalid: (current: string): boolean => !SPECIAL_CHARACTER_PATTERN.test(current),
      message: 'Password must contain at least one special character.',
    },
  ]);
}

export function validateConfirmPassword(value: string, password: string): string | undefined {
  return getFirstError(value, [
    { isInvalid: (current: string): boolean => !current, message: 'Please confirm your password.' },
    {
      isInvalid: (current: string): boolean => current !== password,
      message: 'Passwords do not match.',
    },
  ]);
}
