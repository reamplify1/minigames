import type { AppSession } from './session';

const DEFAULT_PROFILE_NAME: string = 'Player';
const ALPHANUMERIC_PATTERN: RegExp = /[\p{L}\p{N}]/u;

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
        .map((word: string): string => firstAlphanumericChar(word))
        .join('');
}
