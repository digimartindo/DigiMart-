import { useState } from 'react';
import { Gamepad2, User, Clock, PlusCircle, CheckCircle, Utensils, Zap } from 'lucide-react';
import { Console, FoodItem } from '../types';
import ConsoleTimer from './ConsoleTimer';
import { formatRupiah } from '../utils/formatters';

interface ConsoleCardProps {
  key?: string;
  consoleItem: Console;
  isAdmin: boolean;
  onStartRental: (consoleId: string) => void;
  onEndRental: (consoleId: string) => void;
  onAddFoodOrder: (consoleId: string) => void;
  onUpdateConsoleName: (consoleId: string, newName: string) => void;
  defaultRate: number;
}

export default function ConsoleCard({
  consoleItem: item,
  isAdmin,
  onStartRental,
  onEndRental,
  onAddFoodOrder,
  onUpdateConsoleName,
  defaultRate,
}: ConsoleCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);

  const rate = item.hourlyRate || defaultRate;

  // Calculate live running rental estimate if rented
  const getRunningCost = () => {
    if (!item.startTime) return 0;
    const elapsedMinutes = (Date.now() - item.startTime) / 60000;
    if (item.rentalType === 'paket' && item.packageCount) {
      // Package
      return item.packageCount * 25000;
    }
    const roundedMinutes = Math.max(15, Math.ceil(elapsedMinutes / 15) * 15);
    return (roundedMinutes / 60) * rate;
  };

  const fnbTotal = item.orders?.reduce((sum, o) => sum + o.price * o.quantity, 0) || 0;
  const runningRentalCost = item.status === 'rented' ? getRunningCost() : 0;
  const totalEstimatedCost = runningRentalCost + fnbTotal;

  const handleSaveName = () => {
    if (editName.trim()) {
      onUpdateConsoleName(item.id, editName.trim());
    }
    setIsEditing(false);
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'PS5':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PS4':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'SWITCH':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'VIP':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
        item.status === 'rented'
          ? 'border-blue-200 bg-white shadow-md ring-1 ring-blue-500/10'
          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md'
      } p-5`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getTypeBadgeColor(item.type)}`}>
                {item.type}
              </span>
              <span className="text-xs text-zinc-600 font-medium">
                {formatRupiah(rate)}/jam
              </span>
            </div>

            {isEditing && isAdmin ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="w-full text-base font-bold border-b-2 border-blue-500 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="rounded-lg bg-blue-600 p-1 text-white hover:bg-blue-700"
                >
                  <CheckCircle size={16} />
                </button>
              </div>
            ) : (
              <h3
                onClick={() => isAdmin && setIsEditing(true)}
                className={`text-lg font-bold text-zinc-900 tracking-tight leading-snug ${
                  isAdmin ? 'cursor-pointer hover:text-blue-600' : ''
                }`}
                title={isAdmin ? 'Klik untuk ubah nama konsol' : ''}
              >
                {item.name}
              </h3>
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              item.status === 'rented'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                item.status === 'rented' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            {item.status === 'rented' ? 'SEDANG MAIN' : 'TERSEDIA'}
          </span>
        </div>

        {/* Content Section */}
        {item.status === 'rented' ? (
          <div className="space-y-3 pt-2 border-t border-zinc-100 text-sm">
            {/* Customer Info */}
            <div className="flex items-center justify-between bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  {item.customerName ? item.customerName.charAt(0).toUpperCase() : 'G'}
                </div>
                <div>
                  <div className="font-semibold text-zinc-900 text-xs sm:text-sm">
                    {item.customerName || 'Gamer Guest'}
                  </div>
                  {item.customerPhone && (
                    <div className="text-[11px] text-zinc-600">{item.customerPhone}</div>
                  )}
                </div>
              </div>

              <span className="text-[11px] font-medium bg-zinc-200/70 text-zinc-700 px-2 py-0.5 rounded-md">
                {item.rentalType === 'paket' ? `Paket (${item.packageCount} Jam)` : 'Open Billing'}
              </span>
            </div>

            {/* Timer Display */}
            <div className="bg-blue-50/70 border border-blue-100 p-2.5 rounded-xl">
              <div className="text-[11px] text-blue-900 font-medium flex items-center justify-between mb-1">
                <span>Mulai: {new Date(item.startTime!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="font-bold text-blue-700 flex items-center gap-1">
                  <Clock size={12} />
                  <ConsoleTimer
                    startTime={item.startTime!}
                    targetDurationMinutes={item.targetDurationMinutes}
                  />
                </span>
              </div>
            </div>

            {/* F&B Orders on Table */}
            <div className="rounded-xl border border-zinc-200/80 p-2.5 bg-white">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
                  <Utensils size={13} className="text-amber-600" />
                  <span>Pesanan Meja ({item.orders?.length || 0})</span>
                </div>
                <button
                  onClick={() => onAddFoodOrder(item.id)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                >
                  <PlusCircle size={13} /> Tambah F&B
                </button>
              </div>

              {item.orders && item.orders.length > 0 ? (
                <div className="space-y-1 max-h-20 overflow-y-auto pr-1 text-xs">
                  {item.orders.map((order, idx) => (
                    <div key={idx} className="flex items-center justify-between text-zinc-600">
                      <span className="truncate max-w-[140px] text-[11px]">
                        {order.name} <span className="font-medium text-zinc-900">x{order.quantity}</span>
                      </span>
                      <span className="font-mono text-[11px] text-zinc-800">
                        {formatRupiah(order.price * order.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-zinc-600 italic">Belum ada pesanan F&B</p>
              )}
            </div>

            {/* Estimated Total */}
            <div className="flex items-center justify-between px-1 pt-1 text-xs">
              <span className="text-zinc-500">Estimasi Biaya Saat Ini:</span>
              <span className="font-bold text-sm text-zinc-900 font-mono">
                {formatRupiah(totalEstimatedCost)}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-zinc-400">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
              <Gamepad2 size={24} />
            </div>
            <p className="text-xs text-zinc-500 font-medium">Stasiun siap digunakan</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">Mulai sesi rental gamer</p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-2 border-t border-zinc-100">
        {item.status === 'rented' ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAddFoodOrder(item.id)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
            >
              <Utensils size={14} className="text-amber-600" />
              + Order F&B
            </button>
            <button
              onClick={() => onEndRental(item.id)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm transition"
            >
              <Zap size={14} />
              Selesai & Bayar
            </button>
          </div>
        ) : (
          <button
            onClick={() => onStartRental(item.id)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-zinc-800 shadow-sm transition active:scale-[0.99]"
          >
            <Gamepad2 size={16} className="text-blue-400" />
            Mulai Rental
          </button>
        )}
      </div>
    </div>
  );
}
