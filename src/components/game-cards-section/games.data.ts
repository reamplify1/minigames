import vacationCafeCover from '../../assets/images/games/vacation-cafe-simulator.jpg';
import winterBurrowCover from '../../assets/images/games/winter-burrow-card.jpg';
import shelvePotionsCover from '../../assets/images/games/shelve-the-potion-card.jpg';
import heartopiaCover from '../../assets/images/games/heartopia-card.png';
import paliaCover from '../../assets/images/games/palia-card.png';
import catMailCover from '../../assets/images/games/cat-mail-card.png';

export interface Game {
  id: string;
  title: string;
  genre: string;
  price: string;
  description: string;
  rating: number;
  likes: string;
  cover: string;
}

export const GAMES: Game[] = [
  {
    id: 'vacation-cafe-simulator',
    title: 'Vacation Cafe Simulator',
    genre: 'Strategy',
    price: 'Free',
    description:
      'Cozy Italian Vacation Cafe 🏖️ No timers, No stress 😌 cook traditional dishes 🍝 upgrade and customize 🏠 just drink Prosecco 🥂 relax and grow your dream cafe ✨',
    rating: 4.8,
    likes: '28.7K',
    cover: vacationCafeCover,
  },
  {
    id: 'winter-burrow',
    title: 'Winter Burrow',
    genre: 'Farm',
    price: 'Free',
    description:
      'A cozy woodland survival game about a mouse restoring their childhood burrow. Explore, gather resources, craft, knit warm sweaters, bake pies and meet the locals.',
    rating: 4.9,
    likes: '32.4K',
    cover: winterBurrowCover,
  },
  {
    id: 'shelve-the-potions',
    title: 'Shelve the Potions!',
    genre: 'Puzzle',
    price: 'Free',
    description:
      "Organize 2000+ potions on shelves after the witch's cats have knocked them over, using clues around an enchanted cellar. Learn strange symbols and decipher cryptic notes.",
    rating: 4.7,
    likes: '21.3K',
    cover: shelvePotionsCover,
  },
  {
    id: 'heartopia',
    title: 'Heartopia',
    genre: 'Strategy',
    price: '$1.99',
    description:
      'A multiplayer life simulation game crafted for creativity, freedom, and peace. Build your dream home, explore hobbies, and forge warm connections with friends in a cozy town.',
    rating: 4.6,
    likes: '46.8K',
    cover: heartopiaCover,
  },
  {
    id: 'palia',
    title: 'Palia',
    genre: 'Strategy',
    price: 'Free',
    description:
      'A free-to-play fantasy life sim adventure where you can craft, explore, and create the life and home of your dreams in a vibrant, cozy open world full of neighbors to meet.',
    rating: 4.8,
    likes: '89.5K',
    cover: paliaCover,
  },
  {
    id: 'cat-mail-co',
    title: 'Cat Mail Co.',
    genre: 'Puzzle',
    price: 'Free',
    description:
      'Run a cozy cat post office. Sort and deliver parcels from the daily boat. At night, the moon reveals hidden truths about packages. Clear a strange backlog and unlock new destinations.',
    rating: 4.9,
    likes: '38.2K',
    cover: catMailCover,
  },
];
