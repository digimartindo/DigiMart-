import { RentalHistoryItem } from '../types';

export function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount || 0).toLocaleString('id-ID');
}

export function formatDuration(durationMs: number): string {
  const totalMinutes = Math.floor(durationMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours} jam ${minutes} menit`;
  if (hours > 0) return `${hours} jam`;
  return `${minutes} menit`;
}

export function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateRank(hours: number): {
  rank: 'Novice' | 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Mythic';
  color: string;
  nextThreshold: number;
} {
  if (hours >= 50) return { rank: 'Mythic', color: 'text-purple-600 bg-purple-50 border-purple-200', nextThreshold: 100 };
  if (hours >= 30) return { rank: 'Diamond', color: 'text-cyan-600 bg-cyan-50 border-cyan-200', nextThreshold: 50 };
  if (hours >= 15) return { rank: 'Gold', color: 'text-amber-600 bg-amber-50 border-amber-200', nextThreshold: 30 };
  if (hours >= 7) return { rank: 'Silver', color: 'text-slate-600 bg-slate-100 border-slate-200', nextThreshold: 15 };
  if (hours >= 2) return { rank: 'Bronze', color: 'text-amber-800 bg-amber-50 border-amber-200', nextThreshold: 7 };
  return { rank: 'Novice', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', nextThreshold: 2 };
}

export const GAMER_BADGES = [
  '🎮 FIFA/eFootball Maestro',
  '⚔️ Tekken Master',
  '🔥 God of War Veteran',
  '🏎️ Gran Turismo Speedster',
  '⚡ Night Owl Gamer',
  '👑 Plus+Game VIP Regular',
  '🎯 FPS Sniper',
  '🛡️ Elden Lord',
];

export const GAMER_QUOTES = [
  'GGWP! Main seru tanpa patah-patah di Plus+Game.',
  'Level Up! Skill makin terasah, stik makin mantap.',
  'Santai sejenak, gaming dulu biar gak stress!',
  'Victory Royale! Sampai jumpa di session berikutnya.',
];

export function generateWhatsAppMessage(receipt: RentalHistoryItem, loyaltyStamps?: number): string {
  const durationText = formatDuration(receipt.duration);
  const timeFormatted = formatDateTime(receipt.endTime);
  const fnbList = receipt.fnbItems && receipt.fnbItems.length > 0
    ? '\n🍟 *Pesanan F&B:*' + receipt.fnbItems.map(i => `\n  • ${i.name} x${i.quantity} = ${formatRupiah(i.price * i.quantity)}`).join('')
    : '';

  const discountText = receipt.discount > 0 ? `\n🎁 *Diskon (${receipt.discountNote || 'Promo'}):* -${formatRupiah(receipt.discount)}` : '';
  const stampsInfo = loyaltyStamps !== undefined ? `\n⭐ *Loyalty Stamp:* ${loyaltyStamps}/10 (Kumpulkan 10 stamp untuk 1 Jam Gratis!)` : '';

  const text = `*--- PLUS+GAME RENTAL PS ---*
📍 *Official Gaming Receipt & Gamer Pass*

Halo *${receipt.customerName}*! 👋
Terima kasih telah bermain di Plus+Game!

🎮 *Detail Sesi Rental:*
• Konsol: *${receipt.consoleName}*
• Durasi: *${durationText}*
• Selesai: ${timeFormatted}
• Tarif Rental: ${formatRupiah(receipt.rentalCost)}${fnbList}${discountText}
-----------------------------
💰 *TOTAL BAYAR: ${formatRupiah(receipt.cost)}*
💳 Metode: ${receipt.paymentMethod.toUpperCase()}${receipt.cashGiven ? ` (Tunai: ${formatRupiah(receipt.cashGiven)}, Kembali: ${formatRupiah(receipt.change || 0)})` : ''}${stampsInfo}

🏆 *Gamer Badge:* ${receipt.gamerBadge || '🎮 Gaming Warrior'}
✨ *Quote:* "${GAMER_QUOTES[Math.floor(Math.random() * GAMER_QUOTES.length)]}"

Bagikan story kamu & tag kami di Instagram: *@plusgame.id* 🔥
_Sampai jumpa di mabar berikutnya! GGWP!_`;

  return encodeURIComponent(text);
}
