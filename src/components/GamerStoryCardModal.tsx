import { useState } from 'react';
import { X, Trophy, Share2, Copy, Check, Sparkles, MessageSquare, Printer, Award } from 'lucide-react';
import { RentalHistoryItem } from '../types';
import { formatRupiah, formatDuration, formatDateTime, generateWhatsAppMessage, calculateRank } from '../utils/formatters';

interface GamerStoryCardModalProps {
  receipt: RentalHistoryItem;
  loyaltyStamps?: number;
  onClose: () => void;
  onPrintThermal: () => void;
}

export default function GamerStoryCardModal({
  receipt,
  loyaltyStamps = 1,
  onClose,
  onPrintThermal,
}: GamerStoryCardModalProps) {
  const [copied, setCopied] = useState(false);

  const hoursPlayed = receipt.duration / 3600000;
  const rankInfo = calculateRank(hoursPlayed * 5); // boosted rank calculation for excitement

  const handleShareWhatsApp = () => {
    const encoded = generateWhatsAppMessage(receipt, loyaltyStamps);
    const phoneClean = receipt.customerPhone ? receipt.customerPhone.replace(/[^0-9]/g, '') : '';
    // If phone starts with 08, convert to 628 for WhatsApp
    let waPhone = phoneClean;
    if (waPhone.startsWith('0')) {
      waPhone = '62' + waPhone.substring(1);
    }
    const url = waPhone
      ? `https://api.whatsapp.com/send?phone=${waPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    const text = `🎮 PLUS+GAME GAMER PASS 🎮\nNama: ${receipt.customerName}\nKonsol: ${receipt.consoleName}\nDurasi: ${formatDuration(receipt.duration)}\nTotal: ${formatRupiah(receipt.cost)}\nRank: ${rankInfo.rank} Gamer\nBadge: ${receipt.gamerBadge || 'Gaming Warrior'}\nTag Instagram: @plusgame.id 🔥`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-zinc-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
              <Sparkles size={18} />
            </span>
            <h3 className="font-bold text-zinc-900 text-base">Gamer Pass & Share</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* The Digital Gamer Pass (Instagram Story Card style) */}
        <div
          id="gamer-story-card"
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-slate-900 to-blue-950 p-6 text-white shadow-xl border border-blue-500/30 mb-5"
        >
          {/* Subtle background glow badge */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

          {/* Header of pass */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Plus Logo" className="h-6 w-6 rounded-md shadow" />
              <span className="font-black text-sm tracking-wider text-white">PLUS+GAME</span>
            </div>
            <div className="text-[10px] font-mono tracking-widest text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-500/30">
              GAMER PASS #{String(receipt.id).slice(-4)}
            </div>
          </div>

          {/* Player Identity */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-extrabold text-2xl text-white shadow-md border border-white/20">
              {receipt.customerName ? receipt.customerName.charAt(0).toUpperCase() : 'G'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                OFFICIAL GAMER ID
              </div>
              <h2 className="text-xl font-black truncate text-white leading-tight">
                {receipt.customerName}
              </h2>
              <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold mt-0.5">
                <Trophy size={13} />
                <span>{receipt.gamerBadge || '🎮 FIFA Maestro'}</span>
              </div>
            </div>
          </div>

          {/* Session Stats Grid */}
          <div className="grid grid-cols-2 gap-2.5 bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10 mb-4 text-xs">
            <div>
              <div className="text-[10px] text-zinc-400">STATION PLAYED</div>
              <div className="font-bold text-white truncate">{receipt.consoleName}</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-400">PLAY TIME</div>
              <div className="font-bold text-emerald-400 font-mono">
                {formatDuration(receipt.duration)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-400">TOTAL BILL</div>
              <div className="font-bold text-white font-mono">{formatRupiah(receipt.cost)}</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-400">GAMER RANK</div>
              <div className="font-bold text-amber-300 flex items-center gap-1">
                <Award size={12} /> {rankInfo.rank} Tier
              </div>
            </div>
          </div>

          {/* Loyalty Stamp Card on Pass */}
          <div className="bg-black/30 rounded-2xl p-2.5 border border-white/5 mb-3">
            <div className="flex items-center justify-between text-[11px] mb-1.5 text-zinc-300">
              <span>Member Loyalty Stamp:</span>
              <span className="font-bold text-amber-400">{loyaltyStamps}/10 Stamp</span>
            </div>
            <div className="flex justify-between gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-5 flex-1 rounded-md flex items-center justify-center text-[9px] font-bold ${
                    i < loyaltyStamps
                      ? 'bg-amber-400 text-zinc-950 shadow-xs'
                      : 'bg-white/10 text-white/40'
                  }`}
                >
                  {i < loyaltyStamps ? '★' : i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Callout */}
          <div className="text-center text-[10px] text-zinc-400 pt-1">
            Tag Story Instagram: <span className="text-blue-300 font-semibold">@plusgame.id</span> • GGWP!
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleShareWhatsApp}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs sm:text-sm font-bold text-white hover:bg-emerald-700 shadow-sm transition active:scale-[0.99]"
          >
            <MessageSquare size={16} />
            Kirim Struk & Gamer Pass ke WhatsApp
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onPrintThermal}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 text-xs font-bold text-zinc-800 hover:bg-zinc-100 transition"
            >
              <Printer size={15} /> Cetak Struk 58mm
            </button>
            <button
              onClick={handleCopyText}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 text-xs font-bold text-zinc-800 hover:bg-zinc-100 transition"
            >
              {copied ? (
                <>
                  <Check size={15} className="text-emerald-600" /> Tersalin!
                </>
              ) : (
                <>
                  <Copy size={15} /> Salin Gamer Text
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
