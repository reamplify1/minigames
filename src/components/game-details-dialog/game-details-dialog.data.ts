export interface GameInfoItem {
  label: string;
  value: string;
}

export interface GameRecord {
  player: string;
  score: string;
  date: string;
}

export type CommentAvatarColor = 'blue' | 'yellow' | 'white';

export interface GameComment {
  author: string;
  date: string;
  text: string;
  likes: number;
  isLiked: boolean;
  avatarColor: CommentAvatarColor;
}

export interface GameDetails {
  title: string;
  rating: string;
  likes: string;
  description: string;
  info: GameInfoItem[];
  records: GameRecord[];
  comments: GameComment[];
}

export const MOCK_GAME_DETAILS: GameDetails = {
  title: 'Tukoni: Forest Keepers',
  rating: '4.9',
  likes: '31.2K',
  description:
    'Tukoni: Forest Keepers — a cozy hand-drawn puzzle-adventure. You are Traveller, a little forest spirit on an important mission. Wander storybook meadows, visit mushroom villages, meet adorable inhabitants, solve gentle hand-crafted puzzles, brew herbal teas and help the Tukoni forest prepare peacefully for the coming winter.',
  info: [
    { label: 'Genre', value: 'Puzzle' },
    { label: 'Players', value: 'Solo' },
    { label: 'Duration', value: '40-90 min' },
    { label: 'Price', value: 'Free' },
  ],
  records: [
    { player: 'ForestSpirit', score: '356,700 pts', date: '2 days ago' },
    { player: 'TeaBrewer', score: '332,400pts', date: '5 days ago' },
    { player: 'HerbalistPath', score: '308,900 pts', date: '1 week ago' },
  ],
  comments: [
    {
      author: 'ForestDweller',
      date: '3 hours ago',
      text: 'The hand-drawn art is absolutely magical 🍄 Every location feels like a page from a children’s storybook. The mushroom village made me cry happy tears!',
      likes: 12,
      isLiked: false,
      avatarColor: 'blue',
    },
    {
      author: 'HerbalTeaLover',
      date: '1 day ago',
      text: 'Perfect cozy evening game — brew a cup of chamomile, wrap in a blanket and help the little Tukoni prepare for winter. The puzzles are gentle but satisfying.',
      likes: 5,
      isLiked: false,
      avatarColor: 'yellow',
    },
    {
      author: 'CottageCoreMia',
      date: '3 days ago',
      text: 'I want to live inside this game forever 🌿 The NPCs are so charming, the tea recipes are real, and the atmosphere is pure warmth and calm.',
      likes: 8,
      isLiked: true,
      avatarColor: 'white',
    },
  ],
};
