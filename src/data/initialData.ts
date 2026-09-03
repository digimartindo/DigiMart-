import { Console, FoodItem, CustomerLoyalty, TournamentMatch } from '../types';

export const DEFAULT_RATES: Record<string, number> = {
  PS5: 12000,
  PS4: 8000,
  PS3: 5000,
  SWITCH: 10000,
  VIP: 20000,
};

export const DEFAULT_PACKAGE_RATE = 25000; // Paket 3 Jam Hemat

export const INITIAL_CONSOLES: Console[] = [
  { id: '1', name: 'PS5 - 01 (VIP 4K)', type: 'PS5', status: 'available', hourlyRate: 12000 },
  { id: '2', name: 'PS5 - 02 (Arena)', type: 'PS5', status: 'available', hourlyRate: 12000 },
  { id: '3', name: 'PS5 - 03 (Arena)', type: 'PS5', status: 'available', hourlyRate: 12000 },
  { id: '4', name: 'PS4 - 01 (Cozy Room)', type: 'PS4', status: 'available', hourlyRate: 8000 },
  { id: '5', name: 'PS4 - 02 (Cozy Room)', type: 'PS4', status: 'available', hourlyRate: 8000 },
  { id: '6', name: 'Switch - 01 (Party 4-Player)', type: 'SWITCH', status: 'available', hourlyRate: 10000 },
];

export const INITIAL_FOOD_ITEMS: FoodItem[] = [
  { id: 'f1', name: 'Indomie Goreng + Telur', price: 10000, category: 'meal', stock: 24 },
  { id: 'f2', name: 'Indomie Kuah Kari Spesial', price: 10000, category: 'meal', stock: 20 },
  { id: 'f3', name: 'Nasi Goreng Gaming', price: 15000, category: 'meal', stock: 12 },
  { id: 'f4', name: 'Es Teh Manis Jumbo', price: 4000, category: 'drink', stock: 50 },
  { id: 'f5', name: 'Kopi Susu Dingin Mantap', price: 6000, category: 'drink', stock: 35 },
  { id: 'f6', name: 'Pocari Sweat Dingin', price: 8000, category: 'drink', stock: 18 },
  { id: 'f7', name: 'Air Mineral 600ml', price: 4000, category: 'drink', stock: 40 },
  { id: 'f8', name: 'Kentang Goreng Krispi', price: 12000, category: 'snack', stock: 15 },
  { id: 'f9', name: 'Sosis Bakar Jumbo', price: 10000, category: 'snack', stock: 16 },
  { id: 'f10', name: 'Pop Mie Kuah Pedas', price: 8000, category: 'meal', stock: 20 },
];

export const INITIAL_LOYALTY_GAMERS: CustomerLoyalty[] = [
  {
    id: 'l1',
    name: 'Rian "El Maestro"',
    phone: '081234567890',
    totalPlayHours: 42,
    stamps: 8,
    rank: 'Diamond',
    favoriteConsole: 'PS5 - 01 (VIP 4K)',
    badges: ['🎮 FIFA Maestro', '👑 Plus+Game VIP Regular', '⚡ Night Owl Gamer'],
    lastVisit: Date.now() - 3600000 * 5,
  },
  {
    id: 'l2',
    name: 'Bima "Tekken God"',
    phone: '081987654321',
    totalPlayHours: 28,
    stamps: 5,
    rank: 'Gold',
    favoriteConsole: 'PS5 - 02 (Arena)',
    badges: ['⚔️ Tekken Master', '🔥 God of War Veteran'],
    lastVisit: Date.now() - 3600000 * 18,
  },
  {
    id: 'l3',
    name: 'Dimas Aditya',
    phone: '085711223344',
    totalPlayHours: 19,
    stamps: 9,
    rank: 'Gold',
    favoriteConsole: 'PS4 - 01',
    badges: ['🏎️ Gran Turismo Speedster'],
    lastVisit: Date.now() - 3600000 * 24,
  },
  {
    id: 'l4',
    name: 'Farhan Mabar',
    phone: '087855667788',
    totalPlayHours: 11,
    stamps: 3,
    rank: 'Silver',
    favoriteConsole: 'Switch - 01',
    badges: ['🎮 Gaming Warrior'],
    lastVisit: Date.now() - 3600000 * 48,
  },
  {
    id: 'l5',
    name: 'Rizky Pro',
    phone: '081399887766',
    totalPlayHours: 6,
    stamps: 2,
    rank: 'Bronze',
    favoriteConsole: 'PS5 - 03',
    badges: ['⚡ Night Owl Gamer'],
    lastVisit: Date.now() - 3600000 * 72,
  },
];

export const INITIAL_TOURNAMENT_MATCHES: TournamentMatch[] = [
  { id: 't1', round: 'Semi Final 1', player1: 'Rian "El Maestro"', player2: 'Farhan Mabar', score1: 3, score2: 1, winner: 'Rian "El Maestro"' },
  { id: 't2', round: 'Semi Final 2', player1: 'Bima "Tekken God"', player2: 'Dimas Aditya', score1: 2, score2: 1, winner: 'Bima "Tekken God"' },
  { id: 't3', round: 'Grand Final', player1: 'Rian "El Maestro"', player2: 'Bima "Tekken God"', score1: 0, score2: 0 },
];
