import { getProfileInitials, resolveProfileName } from './profile-display';
import type { AppSession } from './session';

const EMAIL_SAMPLE: string = 'student@rs.school';

function buildSession(displayName: string, email: string, avatarUrl?: string): AppSession {
  return {
    displayName,
    email,
    authenticatedAt: Date.now(),
    ...(avatarUrl && { avatarUrl }),
  };
}

describe('resolveProfileName', () => {
  it('uses the trimmed display name', () => {
    expect(resolveProfileName(buildSession(' Forest Dweller ', EMAIL_SAMPLE))).toBe(
      'Forest Dweller'
    );
  });

  it('falls back to the part of the email before "@"', () => {
    expect(resolveProfileName(buildSession(' ', 'student@rs.school'))).toBe('student');
  });

  it('falls back to "Player" when there is no name and no email', () => {
    expect(resolveProfileName(buildSession('', ''))).toBe('Player');
  });
});

describe('getProfileInitials', () => {
  it('takes the first letter of the first two words', () => {
    expect(getProfileInitials('forest dweller of the woods')).toBe('FD');
  });

  it('skips leading symbols and supports non-English letters', () => {
    expect(getProfileInitials('_pixel émile')).toBe('PÉ');
  });

  it('returns an empty string for a blank name', () => {
    expect(getProfileInitials(' ')).toBe('');
  });
});
