const IMAGES_PATH: string = 'assets/images/games';

const IMAGE_BY_SLUG: Record<string, string> = {
  'camper-van-make-it-home': 'camper-van-make-it-home-card.jpg',
  'cast-n-chill': 'cast-n-chill-card.jpg',
  'cat-chess': 'cat-chess-card.jpg',
  'cat-mail-co': 'cat-mail-co-card.png',
  'cozy-solitaire': 'cozy-solitaire-card.jpg',
  'cozy-sudoku': 'cozy-sudoku-card.jpg',
  grimshire: 'grimshire-card.jpg',
  heartopia: 'heartopia-card.png',
  'islanders-new-shores': 'islanders-new-shores-card.jpg',
  koroneko: 'koroneko-card.jpg',
  'leaf-it-alone': 'leaf-it-alone-card.jpg',
  'leafy-corner': 'leafy-corner-card.jpg',
  'little-corners': 'little-corners-card.jpg',
  'organized-inside': 'organized-inside-card.jpg',
  palia: 'palia-card.png',
  'shelve-the-potions': 'shelve-the-potions-card.jpg',
  'tailside-cozy-cafe-sim': 'tailside-cozy-cafe-sim-card.jpg',
  'the-wild-at-heart': 'the-wild-at-heart-card.jpg',
  'tiny-glade': 'tiny-glade-card.jpg',
  'tukoni-forest-keepers': 'tukoni-forest-keepers.jpg',
  'vacation-cafe-simulator': 'vacation-cafe-simulator-card.jpg',
  'whisper-of-the-house': 'whisper-of-the-house-card.jpg',
  'winter-burrow': 'winter-burrow-card.jpg',
  wytchwood: 'wytchwood-card.jpg',
};

const FALLBACK_IMAGE: string = 'vacation-cafe-simulator-card.jpg';

export function getGameImage(slug: string): string {
  return `${IMAGES_PATH}/${IMAGE_BY_SLUG[slug] ?? FALLBACK_IMAGE}`;
}
