import { useState, useRef } from 'react';
import { X, Sparkles, Trophy, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LuckyWheelModalProps {
  onClose: () => void;
  onApplyReward: (reward: { text: string; discountAmount: number }) => void;
}

const WHEEL_PRIZES = [
  { text: 'Diskon Rp 5.000', color: '#2563eb', discount: 5000 },
  { text: 'Free Es Teh Manis', color: '#16a34a', discount: 4000 },
  { text: '+15 Menit Next Mabar', color: '#9333ea', discount: 3000 },
  { text: 'Diskon 10% Sesi Ini', color: '#f59e0b', discount: 5000 },
  { text: 'Free Snack Keripik', color: '#e11d48', discount: 3000 },
  { text: 'Double Stamp Member', color: '#0d9488', discount: 0 },
];

export default function LuckyWheelModal({ onClose, onApplyReward }: LuckyWheelModalProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<{ text: string; discount: number } | null>(null);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);

    // Pick random slice
    const prizeIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const sliceAngle = 360 / WHEEL_PRIZES.length;
    // Calculate final angle to land on prizeIndex (with 5-8 full spins)
    const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;
    // Align with arrow at top (270 degrees)
    const targetAngle = extraSpins + (360 - (prizeIndex * sliceAngle + sliceAngle / 2));

    setRotation(targetAngle);

    setTimeout(() => {
      setSpinning(false);
      const selected = WHEEL_PRIZES[prizeIndex];
      setWinner(selected);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.error(err);
      }
    }, 4000);
  };

  const handleClaim = () => {
    if (winner) {
      onApplyReward({ text: winner.text, discountAmount: winner.discount });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-zinc-200 text-center relative overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
            <Sparkles size={14} /> RODA HOKI PLUS+GAME
          </span>
          <h3 className="text-xl font-extrabold text-zinc-900">Spin & Win Gamer!</h3>
          <p className="text-xs text-zinc-500">
            Putar roda keberuntungan dan menangkan diskon serta hadiah seru
          </p>
        </div>

        {/* The Wheel Container */}
        <div className="relative mx-auto my-6 flex items-center justify-center">
          {/* Wheel Pointer Arrow */}
          <div className="absolute top-0 z-20 -translate-y-2 left-1/2 -translate-x-1/2">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-rose-600 drop-shadow-md" />
          </div>

          {/* SVG Rotating Wheel */}
          <div
            className="h-64 w-64 rounded-full shadow-xl border-4 border-zinc-900 overflow-hidden relative transition-transform duration-[4000ms] ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {WHEEL_PRIZES.map((prize, idx) => {
                const angle = 360 / WHEEL_PRIZES.length;
                const startAngle = idx * angle;
                const endAngle = (idx + 1) * angle;
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                const x1 = 50 + 50 * Math.cos(startRad);
                const y1 = 50 + 50 * Math.sin(startRad);
                const x2 = 50 + 50 * Math.cos(endRad);
                const y2 = 50 + 50 * Math.sin(endRad);

                return (
                  <g key={idx}>
                    <path
                      d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                      fill={prize.color}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Labels overlaid */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-12 w-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-extrabold text-[10px] shadow-md border-2 border-white z-10">
                PLUS+
              </div>
            </div>
          </div>
        </div>

        {/* Legend of prizes */}
        <div className="grid grid-cols-2 gap-1.5 text-[11px] mb-5 text-left">
          {WHEEL_PRIZES.map((p, i) => (
            <div key={i} className="flex items-center gap-1.5 p-1 rounded-md bg-zinc-50">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span className="truncate font-medium text-zinc-700">{p.text}</span>
            </div>
          ))}
        </div>

        {/* Winner Announcement */}
        {winner && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 animate-in zoom-in-95">
            <div className="flex items-center justify-center gap-1.5 text-amber-700 font-bold text-sm mb-1">
              <Trophy size={18} /> SELAMAT ANDA MENDAPATKAN:
            </div>
            <div className="text-lg font-extrabold text-zinc-900">{winner.text}</div>
          </div>
        )}

        {/* Action Button */}
        {winner ? (
          <button
            onClick={handleClaim}
            className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 shadow-md transition"
          >
            Klaim Hadiah ke Tagihan! ✨
          </button>
        ) : (
          <button
            onClick={handleSpin}
            disabled={spinning}
            className="w-full rounded-2xl bg-zinc-900 py-3 text-sm font-bold text-white hover:bg-zinc-800 shadow-md transition disabled:opacity-50"
          >
            {spinning ? 'Roda Sedang Berputar...' : '🎲 PUTAR RODA SEKARANG'}
          </button>
        )}
      </div>
    </div>
  );
}
