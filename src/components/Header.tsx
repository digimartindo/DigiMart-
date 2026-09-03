import { Gamepad2, Coffee, Trophy, BarChart3, ShieldCheck, Database, UserCheck } from 'lucide-react';

interface HeaderProps {
  currentPage: 'rental' | 'food' | 'viral' | 'report';
  setCurrentPage: (page: 'rental' | 'food' | 'viral' | 'report') => void;
  operator: { name: string; role: 'admin' | 'kasir' };
  isAdmin: boolean;
  activeRentalsCount: number;
  onToggleRole?: () => void;
}

export default function Header({
  currentPage,
  setCurrentPage,
  operator,
  isAdmin,
  activeRentalsCount,
  onToggleRole,
}: HeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-zinc-200 pb-5 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2 select-none text-zinc-900">
            Plus <img src="/logo.svg" alt="Plus Logo" className="h-8 w-8 inline-block shadow-sm rounded-lg" /> Game
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            Lounge & POS
          </span>
          <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Database Lokal (Offline)
          </span>
        </div>

        {/* Mobile quick role badge */}
        <button
          onClick={onToggleRole}
          className="md:hidden flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-200 transition"
          title="Klik untuk ubah peran kasir/admin"
        >
          {isAdmin ? <ShieldCheck size={14} className="text-blue-600" /> : <UserCheck size={14} className="text-zinc-600" />}
          <span className="font-bold text-[11px]">{isAdmin ? 'ADMIN' : 'KASIR'}</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Navigation Tabs */}
        <nav className="flex bg-zinc-100/90 p-1 rounded-2xl border border-zinc-200/80 shadow-xs">
          <button
            onClick={() => setCurrentPage('rental')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              currentPage === 'rental'
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
            }`}
          >
            <Gamepad2 size={16} className={currentPage === 'rental' ? 'text-blue-600' : 'text-zinc-500'} />
            <span>Playstation</span>
            {activeRentalsCount > 0 && (
              <span className="ml-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.2 animate-pulse">
                {activeRentalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentPage('food')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              currentPage === 'food'
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
            }`}
          >
            <Coffee size={16} className={currentPage === 'food' ? 'text-amber-600' : 'text-zinc-500'} />
            <span>Kantin</span>
          </button>

          <button
            onClick={() => setCurrentPage('viral')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              currentPage === 'viral'
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
            }`}
          >
            <Trophy size={16} className={currentPage === 'viral' ? 'text-yellow-500' : 'text-zinc-500'} />
            <span>Komunitas</span>
          </button>

          <button
            onClick={() => setCurrentPage('report')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              currentPage === 'report'
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
            }`}
          >
            <BarChart3 size={16} className={currentPage === 'report' ? 'text-indigo-600' : 'text-zinc-500'} />
            <span>Laporan</span>
          </button>
        </nav>

        {/* Local Operator Badge & Role Switcher */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onToggleRole}
            title="Klik untuk beralih mode Admin / Kasir"
            className="flex items-center gap-1.5 rounded-xl bg-zinc-100 px-3 py-1.5 text-xs text-zinc-700 border border-zinc-200 hover:bg-zinc-200 transition"
          >
            {isAdmin ? (
              <ShieldCheck size={14} className="text-blue-600" />
            ) : (
              <UserCheck size={14} className="text-zinc-600" />
            )}
            <span className="max-w-[130px] truncate font-medium">{operator.name}</span>
            <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${isAdmin ? 'bg-blue-100 text-blue-700' : 'bg-zinc-200 text-zinc-700'}`}>
              {isAdmin ? 'ADMIN' : 'KASIR'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
