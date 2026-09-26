import vacationCafeImage from '../../assets/images/games/vacation-cafe-simulator.jpg';
import winterBurrowImage from '../../assets/images/games/winter-burrow-card.jpg';
import shelvePotionsImage from '../../assets/images/games/shelve-the-potion-card.jpg';
import heartopiaImage from '../../assets/images/games/heartopia-card.png';
import paliaImage from '../../assets/images/games/palia-card.png';
import catMailImage from '../../assets/images/games/cat-mail-card.png';
import tinyGladeImage from '../../assets/images/games/tiny-glade-card.jpg';
import tailsideImage from '../../assets/images/games/tailside-cozy-cafe-simcard.jpg';
import islandersImage from '../../assets/images/games/islanders-new-shores-card.jpg';

export interface FeaturedGame {
  title: string;
  rating: number;
  likes: string;
  image: string;
}

export const FEATURED_GAMES: FeaturedGame[] = [
  { title: 'Vacation Cafe Simulator', rating: 4.8, likes: '28.7K', image: vacationCafeImage },
  { title: 'Winter Burrow', rating: 4.9, likes: '32.4K', image: winterBurrowImage },
  { title: 'Shelve the Potions!', rating: 4.7, likes: '21.3K', image: shelvePotionsImage },
  { title: 'Heartopia', rating: 4.6, likes: '46.8K', image: heartopiaImage },
  { title: 'Palia', rating: 4.8, likes: '89.5K', image: paliaImage },
  { title: 'Cat Mail Co.', rating: 4.9, likes: '38.2K', image: catMailImage },
  { title: 'Tiny Glade', rating: 4.9, likes: '67.3K', image: tinyGladeImage },
  { title: 'Tailside: Cozy Cafe Sim', rating: 4.8, likes: '35.6K', image: tailsideImage },
  { title: 'ISLANDERS: New Shores', rating: 4.9, likes: '54.2K', image: islandersImage },
];
