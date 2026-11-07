const DEFAULT_AUTH_ERROR_MESSAGE: string = 'Something went wrong. Please try again.';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password is too weak.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/account-exists-with-different-credential':
    'An account already exists with this email using a different sign-in method.',
  'auth/unauthorized-domain': 'This domain is not authorized for Google sign-in yet.',
  'auth/popup-blocked':
    'Your browser blocked the sign-in popup. Please allow popups and try again.',
  'auth/popup-timeout': 'Sign-in is taking too long. Please try again.',
};

const GOOGLE_CANCELED_ERROR_CODES: Set<string> = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/user-cancelled',
]);

function getErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return typeof error.code === 'string' ? error.code : undefined;
  }

  return undefined;
}

export function getAuthErrorMessage(error: unknown): string {
  return AUTH_ERROR_MESSAGES[getErrorCode(error) ?? ''] ?? DEFAULT_AUTH_ERROR_MESSAGE;
}

export function isGoogleCancellation(error: unknown): boolean {
  return GOOGLE_CANCELED_ERROR_CODES.has(getErrorCode(error) ?? '');
}
