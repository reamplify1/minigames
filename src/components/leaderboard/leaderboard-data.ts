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

export const players: Player[] = [
  {
    initials: 'AP',
    name: 'Alex_Pro99',
    compactName: 'Alex_Pro99',
    avatarColor: 'yellow',
    gamesPlayed: 142,
    score: '94,250',
    compactScore: '94.2K',
    streakDays: 12,
    favoriteGame: 'Heartopia',
  },
  {
    initials: 'CG',
    name: 'CozyGamer_x',
    compactName: 'CozyGamer',
    avatarColor: 'green',
    gamesPlayed: 118,
    score: '81,400',
    compactScore: '81.4K',
    streakDays: 8,
    favoriteGame: 'Cat Mail Co.',
  },
  {
    initials: 'MM',
    name: 'MatchMaster',
    compactName: 'MatchMaster',
    avatarColor: 'blue',
    gamesPlayed: 98,
    score: '72,110',
    compactScore: '72.1K',
    streakDays: 5,
    favoriteGame: 'Tiny Glade',
  },
  {
    initials: 'BP',
    name: 'BubblePop',
    compactName: 'BubblePop',
    avatarColor: 'pink',
    gamesPlayed: 87,
    score: '65,900',
    compactScore: '65.9K',
    streakDays: 3,
    favoriteGame: 'Whisper of the House',
  },
  {
    initials: 'SG',
    name: 'SudokuGod',
    compactName: 'SudokuGod',
    avatarColor: 'lavender',
    gamesPlayed: 74,
    score: '59,320',
    compactScore: '59.3K',
    streakDays: 2,
    favoriteGame: 'Cat Chess',
  },
];