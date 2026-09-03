import { useState, FormEvent } from 'react';
import { X, Gamepad2, Clock, Sparkles, User, Phone, Check } from 'lucide-react';
import { Console, CustomerLoyalty } from '../types';
import { formatRupiah } from '../utils/formatters';

interface RentalStartModalProps {
  console: Console;
  defaultRate: number;
  packageRate: number;
  regularGamers: CustomerLoyalty[];
  onClose: () => void;
  onConfirm: (data: {
    customerName: string;
    customerPhone: string;
    rentalType: 'waktu' | 'paket';
    targetDurationMinutes?: number;
    packageCount?: number;
  }) => void;
}

export default function RentalStartModal({
  console: item,
  defaultRate,
  packageRate,
  regularGamers,
  onClose,
  onConfirm,
}: RentalStartModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [rentalType, setRentalType] = useState<'waktu' | 'paket'>('waktu');
  const [selectedDurationHours, setSelectedDurationHours] = useState<number>(2);
  const [customPackageHours, setCustomPackageHours] = useState<string>('2');

  const rate = item.hourlyRate || defaultRate;

  const handleSelectRegular = (gamer: CustomerLoyalty) => {
    setCustomerName(gamer.name);
    setCustomerPhone(gamer.phone);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    if (rentalType === 'paket') {
      const hours = Number(customPackageHours) || selectedDurationHours || 2;
      onConfirm({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        rentalType: 'paket',
        targetDurationMinutes: hours * 60,
        packageCount: hours,
      });
    } else {
      onConfirm({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        rentalType: 'waktu',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-zinc-200">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Gamepad2 size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">Mulai Sesi Rental</h3>
              <p className="text-xs text-zinc-500 font-medium">
                {item.name} • <span className="text-blue-600 font-bold">{formatRupiah(rate)}/jam</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick regular gamers chips */}
          {regularGamers && regularGamers.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-zinc-600 flex items-center gap-1 mb-1.5">
                <Sparkles size={13} className="text-amber-500" /> Member Regular / Langganan:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {regularGamers.slice(0, 4).map((g) => (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => handleSelectRegular(g)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition font-medium ${
                      customerName === g.name
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">
              Nama Gamer / Nickname <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Contoh: Rian PES, Kevin, atau Tim Mabar"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Phone for WhatsApp & Loyalty */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">
              Nomor WhatsApp <span className="text-zinc-600 font-normal">(opsional - untuk struk WA & stamp loyalty)</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Billing Mode Selection */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-2">
              Pilih Skema Rental:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRentalType('waktu')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  rentalType === 'waktu'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-900">Open Billing</span>
                  {rentalType === 'waktu' && <Check size={14} className="text-blue-600" />}
                </div>
                <p className="text-[11px] text-zinc-500">
                  Main santai sepuasnya, tagihan dihitung saat checkout.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRentalType('paket')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  rentalType === 'paket'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-900">Paket Durasi</span>
                  {rentalType === 'paket' && <Check size={14} className="text-blue-600" />}
                </div>
                <p className="text-[11px] text-zinc-500">
                  Pilih durasi pasti dengan timer hitung mundur.
                </p>
              </button>
            </div>
          </div>

          {/* Package duration options */}
          {rentalType === 'paket' && (
            <div className="rounded-2xl bg-zinc-50 p-3.5 border border-zinc-200 space-y-2.5">
              <label className="text-xs font-semibold text-zinc-700 block">
                Pilih Durasi Paket:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 5].map((hr) => (
                  <button
                    type="button"
                    key={hr}
                    onClick={() => {
                      setSelectedDurationHours(hr);
                      setCustomPackageHours(hr.toString());
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      Number(customPackageHours) === hr
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {hr} Jam
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-zinc-500">Estimasi Paket:</span>
                <span className="font-bold text-zinc-900">
                  {formatRupiah((Number(customPackageHours) || 2) * rate)}
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-xs sm:text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!customerName.trim()}
              className="flex-2 rounded-xl bg-blue-600 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-md transition disabled:opacity-50"
            >
              🎮 Mulai Sesi Sekarang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
