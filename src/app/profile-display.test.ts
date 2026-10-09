import { describe, it, expect } from 'vitest';
import {
  resolveProfileName,
  getProfileInitials,
  renderProfileBadge,
  type ProfileBadgeElements,
} from './profile-display';
import type { AppSession } from './session';

const EMAIL_SAMPLE = 'student@rs.school';

function buildSession(displayName: string, email: string, avatarUrl?: string): AppSession {
  return {
    displayName,
    email,
    authenticatedAt: Date.now(),
    ...(avatarUrl && { avatarUrl }),
  };
}

function buildElements(): ProfileBadgeElements {
  return {
    nameElement: document.createElement('span'),
    avatarImage: document.createElement('img'),
    avatarInitials: document.createElement('span'),
    avatarFallback: document.createElement('span'),
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

describe('renderProfileBadge', () => {
  it('shows the avatar image when the session has one', () => {
    const elements = buildElements();

    renderProfileBadge(elements, buildSession('Forest', EMAIL_SAMPLE, 'https://example.com/a.png'));

    expect(elements.nameElement.textContent).toBe('Forest');
    expect(elements.avatarImage.hidden).toBe(false);
    expect(elements.avatarImage.getAttribute('src')).toBe('https://example.com/a.png');
    expect(elements.avatarInitials.hidden).toBe(true);
  });

  it('switches to initials when the avatar image fails to load', () => {
    const elements = buildElements();
    renderProfileBadge(elements, buildSession('Forest Dweller', EMAIL_SAMPLE, 'broken.png'));

    elements.avatarImage.dispatchEvent(new Event('error'));

    expect(elements.avatarImage.hidden).toBe(true);
    expect(elements.avatarInitials.hidden).toBe(false);
    expect(elements.avatarInitials.textContent).toBe('FD');
  });

  it('shows initials when there is no avatar', () => {
    const elements = buildElements();

    renderProfileBadge(elements, buildSession('Forest', EMAIL_SAMPLE));

    expect(elements.avatarInitials.textContent).toBe('F');
    expect(elements.avatarInitials.hidden).toBe(false);
    expect(elements.avatarFallback.hidden).toBe(true);
  });

  it('shows the fallback icon when the name has no letters or digits', () => {
    const elements = buildElements();

    renderProfileBadge(elements, buildSession('!!!', EMAIL_SAMPLE));

    expect(elements.avatarInitials.hidden).toBe(true);
    expect(elements.avatarFallback.hidden).toBe(false);
  });
});
