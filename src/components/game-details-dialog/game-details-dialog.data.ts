export interface GameInfoItem {
  label: string;
  value: string;
}

export interface GameDetails {
  title: string;
  rating: string;
  likes: string;
  description: string;
  info: GameInfoItem[];
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
};
