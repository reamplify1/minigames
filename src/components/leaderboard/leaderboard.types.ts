export type AvatarColor = 'yellow' | 'green' | 'blue' | 'pink' | 'lavender';

export interface Player {
  initials: string;
  name: string;
  compactName: string;
  avatarColor: AvatarColor;
  gamesPlayed: number;
  score: string;
  compactScore: string;
  streakDays: number;
  favoriteGame: string;
}