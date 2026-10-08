import type { AppSession } from './session';

const DEFAULT_PROFILE_NAME = 'Player';
const ALPHANUMERIC_PATTERN = /[\p{L}\p{N}]/u;

export interface ProfileBadgeElements {
  nameElement: HTMLElement;
  avatarImage: HTMLImageElement;
  avatarInitials: HTMLElement;
  avatarFallback: HTMLElement;
}

export function resolveProfileName(session: AppSession): string {
  const trimmedDisplayName = session.displayName.trim();

  if (trimmedDisplayName) {
    return trimmedDisplayName;
  }

  const emailLocalPart = session.email.split('@', 1)[0]?.trim();

  return emailLocalPart || DEFAULT_PROFILE_NAME;
}

function firstAlphanumericChar(word: string): string {
  const match = ALPHANUMERIC_PATTERN.exec(word);
  return match ? match[0].toUpperCase() : '';
}

export function getProfileInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  return words.length === 0
    ? ''
    : words
        .slice(0, 2)
        .map((word) => firstAlphanumericChar(word))
        .join('');
}

function showInitialsOrFallback(elements: ProfileBadgeElements, initials: string): void {
  elements.avatarImage.hidden = true;
  elements.avatarImage.removeAttribute('src');

  const hasInitials = initials.length > 0;
  elements.avatarInitials.hidden = !hasInitials;
  elements.avatarInitials.textContent = initials;
  elements.avatarFallback.hidden = hasInitials;
}

export function renderProfileBadge(elements: ProfileBadgeElements, session: AppSession): void {
  const profileName = resolveProfileName(session);
  const initials = getProfileInitials(profileName);

  elements.nameElement.textContent = profileName;

  if (session.avatarUrl) {
    elements.avatarInitials.hidden = true;
    elements.avatarFallback.hidden = true;
    elements.avatarImage.hidden = false;
    elements.avatarImage.alt = '';
    elements.avatarImage.src = session.avatarUrl;
    elements.avatarImage.addEventListener(
      'error',
      () => {
        showInitialsOrFallback(elements, initials);
      },
      { once: true }
    );
  } else {
    showInitialsOrFallback(elements, initials);
  }
}
