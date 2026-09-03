import { useState } from 'react';
import { X, DollarSign, QrCode, CreditCard, Sparkles, Printer, MessageSquare, Award, Check } from 'lucide-react';
import { Console, RentalHistoryItem } from '../types';
import { formatRupiah, formatDuration, GAMER_BADGES } from '../utils/formatters';

interface RentalCheckoutModalProps {
  console: Console;
  defaultRate: number;
  packageRate: number;
  cashierEmail?: string;
  onClose: () => void;
  onOpenLuckyWheel: () => void;
  appliedDiscount: { text: string; amount: number } | null;
  onCompleteCheckout: (receipt: RentalHistoryItem) => void;
}

export default function RentalCheckoutModal({
  console: item,
  defaultRate,
  packageRate,
  cashierEmail,
  onClose,
  onOpenLuckyWheel,
  appliedDiscount,
  onCompleteCheckout,
}: RentalCheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'transfer'>('cash');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [selectedBadge, setSelectedBadge] = useState<string>(
    GAMER_BADGES[Math.floor(Math.random() * GAMER_BADGES.length)]
  );

  const rate = item.hourlyRate || defaultRate;
  const startTime = item.startTime || Date.now() - 3600000;
  const durationMs = Date.now() - startTime;
  const durationMinutes = Math.max(1, durationMs / 60000);

  // Calculate rental cost
  let rentalCost = 0;
  if (item.rentalType === 'paket' && item.packageCount) {
    rentalCost = item.packageCount * packageRate;
  } else {
    const roundedMinutes = Math.max(15, Math.ceil(durationMinutes / 15) * 15);
    rentalCost = (roundedMinutes / 60) * rate;
  }

  const fnbCost = item.orders?.reduce((sum, o) => sum + o.price * o.quantity, 0) || 0;
  const discountAmount = appliedDiscount ? appliedDiscount.amount : 0;
  const totalCost = Math.max(0, rentalCost + fnbCost - discountAmount);

  const cashAmount = Number(cashGiven) || 0;
  const change = paymentMethod === 'cash' && cashAmount >= totalCost ? cashAmount - totalCost : 0;

  const handleQuickCash = (amount: number) => {
    setCashGiven(amount.toString());
  };

  const handleFinish = () => {
    const newReceipt: RentalHistoryItem = {
      id: Date.now(),
      consoleId: item.id,
      consoleName: item.name,
      consoleType: item.type,
      customerName: item.customerName || 'Gamer Guest',
      customerPhone: item.customerPhone,
      startTime,
      endTime: Date.now(),
      duration: durationMs,
      rentalCost,
      fnbCost,
      discount: discountAmount,
      discountNote: appliedDiscount?.text,
      cost: totalCost,
      paymentMethod,
      cashGiven: paymentMethod === 'cash' ? cashAmount : undefined,
      change: paymentMethod === 'cash' ? change : undefined,
      rentalType: item.rentalType || 'waktu',
      packageCount: item.packageCount,
      fnbItems: item.orders || [],
      cashierEmail,
      gamerBadge: selectedBadge,
      stampsAwarded: 1,
    };

    onCompleteCheckout(newReceipt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-rose-600 uppercase bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              Checkout & Pembayaran
            </span>
            <h3 className="text-xl font-extrabold text-zinc-900 mt-1">{item.name}</h3>
            <p className="text-xs text-zinc-500">
              Pelanggan: <span className="font-semibold text-zinc-800">{item.customerName}</span> • Durasi: {formatDuration(durationMs)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Bill Breakdown */}
          <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-700">
              <span>Sewa Konsol ({formatDuration(durationMs)}):</span>
              <span className="font-mono font-semibold">{formatRupiah(rentalCost)}</span>
            </div>

            {item.orders && item.orders.length > 0 && (
              <div className="border-t border-zinc-200/60 pt-1.5 space-y-1">
                <span className="font-semibold text-zinc-800">Pesanan Menu F&B:</span>
                {item.orders.map((o, idx) => (
                  <div key={idx} className="flex justify-between pl-2 text-zinc-600">
                    <span>
                      {o.name} <span className="font-medium">x{o.quantity}</span>
                    </span>
                    <span className="font-mono">{formatRupiah(o.price * o.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-zinc-700 font-medium pl-2 pt-0.5">
                  <span>Subtotal F&B:</span>
                  <span className="font-mono">{formatRupiah(fnbCost)}</span>
                </div>
              </div>
            )}

            {/* Lucky wheel prize / discount */}
            {appliedDiscount && (
              <div className="flex justify-between text-emerald-700 font-bold border-t border-zinc-200/60 pt-1.5">
                <span className="flex items-center gap-1">
                  <Sparkles size={13} /> {appliedDiscount.text}:
                </span>
                <span className="font-mono">-{formatRupiah(appliedDiscount.amount)}</span>
              </div>
            )}

            <div className="border-t border-zinc-300 pt-2 flex items-center justify-between text-sm">
              <span className="font-extrabold text-zinc-900">TOTAL AKHIR:</span>
              <span className="text-lg font-black text-blue-700 font-mono">
                {formatRupiah(totalCost)}
              </span>
            </div>
          </div>

          {/* Gimmick / Viral Wheel trigger */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎲</span>
              <div>
                <div className="text-xs font-bold text-amber-900">Roda Hoki Pelanggan</div>
                <div className="text-[11px] text-amber-700">
                  {appliedDiscount ? `Kupon aktif: ${appliedDiscount.text}` : 'Putar roda untuk dapat diskon / free item!'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenLuckyWheel}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition"
            >
              {appliedDiscount ? 'Putar Ulang' : 'Putar Roda'}
            </button>
          </div>

          {/* Gamer Badge Selection (Fun Gamification) */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">
              Pilih Gelar / Gamer Badge untuk Struk:
            </label>
            <select
              value={selectedBadge}
              onChange={(e) => setSelectedBadge(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-800 bg-white"
            >
              {GAMER_BADGES.map((b, idx) => (
                <option key={idx} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
              Metode Pembayaran:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition ${
                  paymentMethod === 'cash'
                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <DollarSign size={15} /> Tunai
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition ${
                  paymentMethod === 'qris'
                    ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <QrCode size={15} /> QRIS
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition ${
                  paymentMethod === 'transfer'
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <CreditCard size={15} /> Transfer
              </button>
            </div>
          </div>

          {/* Cash Calculator */}
          {paymentMethod === 'cash' && (
            <div className="rounded-2xl bg-zinc-50 p-3.5 border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700">Uang Diterima:</label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickCash(totalCost)}
                    className="px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-800 text-[10px] font-bold hover:bg-zinc-300"
                  >
                    Uang Pas
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCash(50000)}
                    className="px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-800 text-[10px] font-bold hover:bg-zinc-300"
                  >
                    50k
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCash(100000)}
                    className="px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-800 text-[10px] font-bold hover:bg-zinc-300"
                  >
                    100k
                  </button>
                </div>
              </div>

              <input
                type="number"
                placeholder="Jumlah nominal tunai"
                value={cashGiven}
                onChange={(e) => setCashGiven(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm bg-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />

              {cashAmount > 0 && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-zinc-500">Kembalian:</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      cashAmount < totalCost ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {cashAmount < totalCost
                      ? `Kurang ${formatRupiah(totalCost - cashAmount)}`
                      : formatRupiah(change)}
                  </span>
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'qris' && (
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-center space-y-2">
              <div className="text-xs font-bold text-blue-900">Scan QRIS Plus+Game</div>
              <div className="mx-auto w-32 h-32 bg-white p-2 rounded-xl shadow-xs border border-zinc-200 flex flex-col items-center justify-center">
                {/* SVG mock QRIS code */}
                <svg viewBox="0 0 100 100" className="w-24 h-24 text-zinc-900">
                  <rect width="100" height="100" fill="white" />
                  <path
                    d="M10 10 h30 v30 h-30 z M15 15 v20 h20 v-20 z M20 20 h10 v10 h-10 z"
                    fill="currentColor"
                  />
                  <path
                    d="M60 10 h30 v30 h-30 z M65 15 v20 h20 v-20 z M70 20 h10 v10 h-10 z"
                    fill="currentColor"
                  />
                  <path
                    d="M10 60 h30 v30 h-30 z M15 65 v20 h20 v-20 z M20 70 h10 v10 h-10 z"
                    fill="currentColor"
                  />
                  <rect x="50" y="50" width="10" height="10" fill="currentColor" />
                  <rect x="70" y="60" width="15" height="10" fill="currentColor" />
                  <rect x="55" y="75" width="20" height="15" fill="currentColor" />
                </svg>
              </div>
              <p className="text-[11px] text-blue-700 font-medium">
                Tampilkan QRIS ke pelanggan untuk pembayaran {formatRupiah(totalCost)}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-5 border-t border-zinc-100 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-xs sm:text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleFinish}
            disabled={paymentMethod === 'cash' && cashAmount > 0 && cashAmount < totalCost}
            className="flex-2 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-emerald-700 shadow-md transition disabled:opacity-50"
          >
            <Check size={16} /> Selesaikan Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
}
