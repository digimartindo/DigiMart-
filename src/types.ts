export type ConsoleStatus = 'available' | 'rented' | 'booked' | 'maintenance';

export type ConsoleType = 'PS5' | 'PS4' | 'PS3' | 'SWITCH' | 'VIP';

export interface TableOrderItem {
  id: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  orderedAt: number;
}

export interface Console {
  id: string;
  name: string;
  type: ConsoleType;
  status: ConsoleStatus;
  hourlyRate?: number; // custom override or uses default
  startTime?: number;
  targetDurationMinutes?: number; // prepaid/package duration in minutes
  customerName?: string;
  customerPhone?: string;
  rentalType?: 'waktu' | 'paket';
  packageCount?: number;
  orders?: TableOrderItem[];
  notes?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  category: 'drink' | 'snack' | 'meal' | 'other';
  stock?: number;
}

export interface FoodSaleRecord {
  id: string;
  itemName: string;
  category?: string;
  price: number;
  quantity?: number;
  time: number;
  customerName?: string;
  consoleName?: string;
}

export interface RentalHistoryItem {
  id: number | string;
  consoleId?: string;
  consoleName: string;
  consoleType?: ConsoleType;
  customerName: string;
  customerPhone?: string;
  startTime: number;
  endTime: number;
  duration: number; // in ms
  rentalCost: number;
  fnbCost: number;
  discount: number;
  discountNote?: string;
  cost: number; // total = rentalCost + fnbCost - discount
  paymentMethod: 'cash' | 'qris' | 'transfer';
  cashGiven?: number;
  change?: number;
  rentalType: 'waktu' | 'paket';
  packageCount?: number;
  fnbItems?: TableOrderItem[];
  cashierEmail?: string;
  gamerBadge?: string;
  stampsAwarded?: number;
}

export interface CustomerLoyalty {
  id: string;
  name: string;
  phone: string;
  totalPlayHours: number;
  stamps: number; // 0 - 10
  rank: 'Novice' | 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Mythic';
  favoriteConsole: string;
  badges: string[];
  lastVisit: number;
}

export interface TournamentPlayer {
  id: string;
  name: string;
  phone?: string;
  score: number;
}

export interface TournamentMatch {
  id: string;
  round: string; // 'Semi Final 1', 'Semi Final 2', 'Final'
  player1: string;
  player2: string;
  score1: number;
  score2: number;
  winner?: string;
}
