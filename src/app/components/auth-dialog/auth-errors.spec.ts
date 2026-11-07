import { getAuthErrorMessage, isGoogleCancellation } from './auth-errors';

describe('getAuthErrorMessage', () => {
  it('translates a known Firebase code', () => {
    expect(getAuthErrorMessage({ code: 'auth/invalid-credential' })).toBe(
      'Incorrect email or password.'
    );
  });

  it('uses a general message for anything else', () => {
    const fallback = 'Something went wrong. Please try again.';

    expect(getAuthErrorMessage({ code: 'auth/new-code' })).toBe(fallback);
    expect(getAuthErrorMessage(new Error('boom'))).toBe(fallback);
    expect(getAuthErrorMessage(undefined)).toBe(fallback);
  });
});

describe('isGoogleCancellation', () => {
  it('recognises a closed popup', () => {
    expect(isGoogleCancellation({ code: 'auth/popup-closed-by-user' })).toBe(true);
  });

  it('treats other errors as failures', () => {
    expect(isGoogleCancellation({ code: 'auth/network-request-failed' })).toBe(false);
  });
});
