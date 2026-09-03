/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import ConsoleCard from './components/ConsoleCard';
import RentalStartModal from './components/RentalStartModal';
import TableOrderModal from './components/TableOrderModal';
import RentalCheckoutModal from './components/RentalCheckoutModal';
import LuckyWheelModal from './components/LuckyWheelModal';
import GamerStoryCardModal from './components/GamerStoryCardModal';
import PrintableReceipt from './components/PrintableReceipt';
import FoodMenuSection from './components/FoodMenuSection';
import ViralCommunitySection from './components/ViralCommunitySection';
import ReportsAndSettings from './components/ReportsAndSettings';

import {
  Console,
  FoodItem,
  FoodSaleRecord,
  RentalHistoryItem,
  CustomerLoyalty,
  TournamentMatch,
  TableOrderItem,
} from './types';
import {
  INITIAL_CONSOLES,
  INITIAL_FOOD_ITEMS,
  INITIAL_LOYALTY_GAMERS,
  INITIAL_TOURNAMENT_MATCHES,
  DEFAULT_RATES,
  DEFAULT_PACKAGE_RATE,
} from './data/initialData';

export default function App() {
  // Local Operator Profile (Local & Offline Ready)
  const [operator, setOperator] = useState<{ name: string; role: 'admin' | 'kasir' }>(() => {
    const saved = localStorage.getItem('local-operator');
    return saved ? JSON.parse(saved) : { name: 'Kasir Utama', role: 'admin' };
  });

  const [backupNotification, setBackupNotification] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('local-operator', JSON.stringify(operator));
  }, [operator]);

  const isAdmin = operator.role === 'admin';

  const handleToggleRole = () => {
    setOperator((prev) => ({
      ...prev,
      role: prev.role === 'admin' ? 'kasir' : 'admin',
    }));
  };

  // Primary State with localStorage persistence
  const [currentPage, setCurrentPage] = useState<'rental' | 'food' | 'viral' | 'report'>('rental');

  const [consoles, setConsoles] = useState<Console[]>(() => {
    const saved = localStorage.getItem('ps-rentals');
    return saved ? JSON.parse(saved) : INITIAL_CONSOLES;
  });

  const [rates, setRates] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('rental-rates');
    return saved ? JSON.parse(saved) : DEFAULT_RATES;
  });

  const [packageRate, setPackageRate] = useState<number>(() => {
    const saved = localStorage.getItem('rental-package-rate');
    return saved ? Number(saved) : DEFAULT_PACKAGE_RATE;
  });

  const [foodItems, setFoodItems] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem('food-items');
    return saved ? JSON.parse(saved) : INITIAL_FOOD_ITEMS;
  });

  const [foodSales, setFoodSales] = useState<FoodSaleRecord[]>(() => {
    const saved = localStorage.getItem('food-sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [rentalHistory, setRentalHistory] = useState<RentalHistoryItem[]>(() => {
    const saved = localStorage.getItem('rental-history');
    return saved ? JSON.parse(saved) : [];
  });

  const [loyaltyGamers, setLoyaltyGamers] = useState<CustomerLoyalty[]>(() => {
    const saved = localStorage.getItem('loyalty-gamers');
    return saved ? JSON.parse(saved) : INITIAL_LOYALTY_GAMERS;
  });

  const [tournamentMatches, setTournamentMatches] = useState<TournamentMatch[]>(() => {
    const saved = localStorage.getItem('tournament-matches');
    return saved ? JSON.parse(saved) : INITIAL_TOURNAMENT_MATCHES;
  });

  // Modal states
  const [startRentalConsoleId, setStartRentalConsoleId] = useState<string | null>(null);
  const [tableOrderConsoleId, setTableOrderConsoleId] = useState<string | null>(null);
  const [checkoutConsoleId, setCheckoutConsoleId] = useState<string | null>(null);
  const [isLuckyWheelOpen, setIsLuckyWheelOpen] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{ text: string; amount: number } | null>(null);
  const [activeStoryReceipt, setActiveStoryReceipt] = useState<RentalHistoryItem | null>(null);
  const [lastReceiptToPrint, setLastReceiptToPrint] = useState<RentalHistoryItem | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('ps-rentals', JSON.stringify(consoles));
  }, [consoles]);

  useEffect(() => {
    localStorage.setItem('rental-rates', JSON.stringify(rates));
  }, [rates]);

  useEffect(() => {
    localStorage.setItem('rental-package-rate', packageRate.toString());
  }, [packageRate]);

  useEffect(() => {
    localStorage.setItem('food-items', JSON.stringify(foodItems));
  }, [foodItems]);

  useEffect(() => {
    localStorage.setItem('food-sales', JSON.stringify(foodSales));
  }, [foodSales]);

  useEffect(() => {
    localStorage.setItem('rental-history', JSON.stringify(rentalHistory));
  }, [rentalHistory]);

  useEffect(() => {
    localStorage.setItem('loyalty-gamers', JSON.stringify(loyaltyGamers));
  }, [loyaltyGamers]);

  useEffect(() => {
    localStorage.setItem('tournament-matches', JSON.stringify(tournamentMatches));
  }, [tournamentMatches]);

  // Console Actions
  const handleStartRental = (consoleId: string) => {
    setStartRentalConsoleId(consoleId);
  };

  const handleConfirmStart = (data: {
    customerName: string;
    customerPhone: string;
    rentalType: 'waktu' | 'paket';
    targetDurationMinutes?: number;
    packageCount?: number;
  }) => {
    if (!startRentalConsoleId) return;
    setConsoles((prev) =>
      prev.map((c) =>
        c.id === startRentalConsoleId
          ? {
              ...c,
              status: 'rented',
              startTime: Date.now(),
              customerName: data.customerName,
              customerPhone: data.customerPhone,
              rentalType: data.rentalType,
              targetDurationMinutes: data.targetDurationMinutes,
              packageCount: data.packageCount,
              orders: [],
            }
          : c
      )
    );
    setStartRentalConsoleId(null);
  };

  const handleEndRental = (consoleId: string) => {
    setAppliedDiscount(null);
    setCheckoutConsoleId(consoleId);
  };

  const handleCompleteCheckout = (receipt: RentalHistoryItem) => {
    // 1. Save to rental history
    setRentalHistory((prev) => [receipt, ...prev]);

    // 2. Also log any F&B items consumed in this rental to foodSales
    if (receipt.fnbItems && receipt.fnbItems.length > 0) {
      const additionalFoodSales: FoodSaleRecord[] = receipt.fnbItems.map((f) => ({
        id: 'fs_' + Date.now() + '_' + Math.random(),
        itemName: f.name,
        price: f.price,
        quantity: f.quantity,
        time: Date.now(),
        customerName: receipt.customerName,
        consoleName: receipt.consoleName,
      }));
      setFoodSales((prev) => [...additionalFoodSales, ...prev]);
    }

    // 3. Update customer loyalty records if customer phone or name provided
    if (receipt.customerPhone || receipt.customerName) {
      const hours = receipt.duration / 3600000;
      setLoyaltyGamers((prev) => {
        const existingIndex = prev.findIndex(
          (g) =>
            (receipt.customerPhone && g.phone === receipt.customerPhone) ||
            g.name.toLowerCase() === receipt.customerName.toLowerCase()
        );

        if (existingIndex > -1) {
          const updated = [...prev];
          const curr = updated[existingIndex];
          const newHours = Math.round(curr.totalPlayHours + hours);
          const newStamps = Math.min(10, curr.stamps + 1);
          updated[existingIndex] = {
            ...curr,
            totalPlayHours: newHours,
            stamps: newStamps,
            lastVisit: Date.now(),
            favoriteConsole: receipt.consoleName,
          };
          return updated;
        } else {
          const newGamer: CustomerLoyalty = {
            id: 'l_' + Date.now(),
            name: receipt.customerName,
            phone: receipt.customerPhone || '-',
            totalPlayHours: Math.max(1, Math.round(hours)),
            stamps: 1,
            rank: 'Bronze',
            favoriteConsole: receipt.consoleName,
            badges: [receipt.gamerBadge || '🎮 Gaming Warrior'],
            lastVisit: Date.now(),
          };
          return [...prev, newGamer];
        }
      });
    }

    // 4. Reset the console to available
    setConsoles((prev) =>
      prev.map((c) =>
        c.id === checkoutConsoleId
          ? {
              ...c,
              status: 'available',
              startTime: undefined,
              targetDurationMinutes: undefined,
              customerName: undefined,
              customerPhone: undefined,
              rentalType: undefined,
              packageCount: undefined,
              orders: [],
            }
          : c
      )
    );

    // 5. Trigger celebration confetti
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.error(e);
    }

    // 6. Close checkout, open Gamer Story Card & set printable receipt
    setLastReceiptToPrint(receipt);
    setActiveStoryReceipt(receipt);
    setCheckoutConsoleId(null);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // Table Orders
  const handleOpenTableOrder = (consoleId: string) => {
    setTableOrderConsoleId(consoleId);
  };

  const handleSaveTableOrders = (consoleId: string, updatedOrders: TableOrderItem[]) => {
    setConsoles((prev) =>
      prev.map((c) => (c.id === consoleId ? { ...c, orders: updatedOrders } : c))
    );
  };

  const handleUpdateConsoleName = (consoleId: string, newName: string) => {
    setConsoles((prev) =>
      prev.map((c) => (c.id === consoleId ? { ...c, name: newName } : c))
    );
  };

  // Console management
  const handleAddConsole = (name: string, type: any, rate: number) => {
    const newConsole: Console = {
      id: Date.now().toString(),
      name,
      type,
      status: 'available',
      hourlyRate: rate,
      orders: [],
    };
    setConsoles((prev) => [...prev, newConsole]);
  };

  const handleDeleteConsole = (id: string) => {
    setConsoles((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdateRate = (type: string, newRate: number) => {
    setRates((prev) => ({ ...prev, [type]: newRate }));
  };

  const handleResetHistory = (filterType: string) => {
    const now = new Date();
    const isTodayReset = (date: Date) => date.toDateString() === now.toDateString();
    const isThisWeekReset = (date: Date) => {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return date >= startOfWeek;
    };
    const isThisMonthReset = (date: Date) =>
      date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    const isThisYearReset = (date: Date) => date.getFullYear() === now.getFullYear();

    let newHistory = rentalHistory;
    if (filterType === 'today') newHistory = rentalHistory.filter((h) => !isTodayReset(new Date(h.startTime)));
    else if (filterType === 'weekly') newHistory = rentalHistory.filter((h) => !isThisWeekReset(new Date(h.startTime)));
    else if (filterType === 'monthly') newHistory = rentalHistory.filter((h) => !isThisMonthReset(new Date(h.startTime)));
    else if (filterType === 'yearly') newHistory = rentalHistory.filter((h) => !isThisYearReset(new Date(h.startTime)));
    else newHistory = [];

    setRentalHistory(newHistory);
  };

  // Loyalty & Tournament Handlers
  const handleAddGamer = (gamer: CustomerLoyalty) => {
    setLoyaltyGamers((prev) => [gamer, ...prev]);
  };

  const handleUpdateGamerStamps = (id: string, stamps: number) => {
    setLoyaltyGamers((prev) =>
      prev.map((g) => (g.id === id ? { ...g, stamps } : g))
    );
  };

  const handleUpdateTournamentMatch = (
    matchId: string,
    winner: string,
    score1: number,
    score2: number
  ) => {
    setTournamentMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, winner, score1, score2 } : m))
    );
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      consoles,
      rates,
      packageRate,
      foodItems,
      foodSales,
      rentalHistory,
      loyaltyGamers,
      tournamentMatches,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_plusgame_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupNotification('File cadangan data (JSON) berhasil diunduh!');
    setTimeout(() => setBackupNotification(null), 4000);
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.consoles) setConsoles(data.consoles);
        if (data.rates) setRates(data.rates);
        if (data.packageRate) setPackageRate(data.packageRate);
        if (data.foodItems) setFoodItems(data.foodItems);
        if (data.foodSales) setFoodSales(data.foodSales);
        if (data.rentalHistory) setRentalHistory(data.rentalHistory);
        if (data.loyaltyGamers) setLoyaltyGamers(data.loyaltyGamers);
        if (data.tournamentMatches) setTournamentMatches(data.tournamentMatches);
        setBackupNotification('Seluruh data berhasil dipulihkan dari file cadangan!');
        setTimeout(() => setBackupNotification(null), 4000);
      } catch (err) {
        setBackupNotification('Gagal: Format file cadangan tidak valid.');
        setTimeout(() => setBackupNotification(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const activeRentalsCount = consoles.filter((c) => c.status === 'rented').length;
  const activeStartConsole = consoles.find((c) => c.id === startRentalConsoleId);
  const activeOrderConsole = consoles.find((c) => c.id === tableOrderConsoleId);
  const activeCheckoutConsole = consoles.find((c) => c.id === checkoutConsoleId);

  // Find customer's loyalty stamps if available for active receipt
  const activeGamerStamps = activeStoryReceipt
    ? loyaltyGamers.find((g) => g.name === activeStoryReceipt.customerName)?.stamps || 1
    : 1;

  return (
    <div className="min-h-screen bg-zinc-50/80 p-3 sm:p-5 md:p-8 font-sans text-zinc-900 selection:bg-blue-100 selection:text-blue-900">
      <div className="mx-auto max-w-7xl">
        {/* Printable 58mm Thermal Receipt (Triggered on window.print()) */}
        <PrintableReceipt
          receipt={lastReceiptToPrint || activeStoryReceipt}
          loyaltyStamps={activeGamerStamps}
        />

        {/* Global Navigation Header */}
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          operator={operator}
          isAdmin={isAdmin}
          activeRentalsCount={activeRentalsCount}
          onToggleRole={handleToggleRole}
        />

        {/* VIEW 1: RENTAL PS STATIONS */}
        {currentPage === 'rental' && (
          <div className="space-y-6">
            {/* Quick Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="text-xs font-bold text-zinc-700">
                  Total Stasiun:{' '}
                  <span className="font-mono text-zinc-900 text-sm">{consoles.length}</span>
                </div>
                <div className="h-3 w-px bg-zinc-200" />
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {consoles.length - activeRentalsCount} Tersedia
                </div>
                <div className="h-3 w-px bg-zinc-200" />
                <div className="flex items-center gap-1 text-xs font-semibold text-rose-700">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                  {activeRentalsCount} Sedang Main
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLuckyWheelOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs hover:bg-amber-100 transition flex items-center gap-1.5"
                >
                  <span>🎲</span> Roda Hoki Diskon
                </button>
                <button
                  onClick={() => setCurrentPage('viral')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs transition"
                >
                  🏆 Top Gamers
                </button>
              </div>
            </div>

            {/* Consoles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {consoles.map((item) => (
                <ConsoleCard
                  key={item.id}
                  consoleItem={item}
                  isAdmin={isAdmin}
                  defaultRate={rates[item.type] || 10000}
                  onStartRental={handleStartRental}
                  onEndRental={handleEndRental}
                  onAddFoodOrder={handleOpenTableOrder}
                  onUpdateConsoleName={handleUpdateConsoleName}
                />
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: FOOD & BEVERAGES */}
        {currentPage === 'food' && (
          <FoodMenuSection
            items={foodItems}
            sales={foodSales}
            setItems={setFoodItems}
            setSales={setFoodSales}
            isAdmin={isAdmin}
          />
        )}

        {/* VIEW 3: VIRAL & COMMUNITY */}
        {currentPage === 'viral' && (
          <ViralCommunitySection
            loyaltyGamers={loyaltyGamers}
            onAddGamer={handleAddGamer}
            onUpdateGamerStamps={handleUpdateGamerStamps}
            tournamentMatches={tournamentMatches}
            onUpdateTournamentMatch={handleUpdateTournamentMatch}
            onOpenLuckyWheel={() => setIsLuckyWheelOpen(true)}
          />
        )}

        {/* VIEW 4: REPORTS & SETTINGS */}
        {currentPage === 'report' && (
          <ReportsAndSettings
            rentalHistory={rentalHistory}
            onResetHistory={handleResetHistory}
            consoles={consoles}
            onAddConsole={handleAddConsole}
            onDeleteConsole={handleDeleteConsole}
            rates={rates}
            onUpdateRate={handleUpdateRate}
            packageRate={packageRate}
            onUpdatePackageRate={setPackageRate}
            isAdmin={isAdmin}
            operator={operator}
            onUpdateOperator={(name, role) => setOperator({ name, role })}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            backupNotification={backupNotification}
            onViewReceipt={(receipt) => {
              setLastReceiptToPrint(receipt);
              setActiveStoryReceipt(receipt);
            }}
          />
        )}

        {/* MODAL 1: START RENTAL */}
        {activeStartConsole && (
          <RentalStartModal
            console={activeStartConsole}
            defaultRate={rates[activeStartConsole.type] || 10000}
            packageRate={packageRate}
            regularGamers={loyaltyGamers}
            onClose={() => setStartRentalConsoleId(null)}
            onConfirm={handleConfirmStart}
          />
        )}

        {/* MODAL 2: ORDER FOOD TO TABLE */}
        {activeOrderConsole && (
          <TableOrderModal
            console={activeOrderConsole}
            foodItems={foodItems}
            onClose={() => setTableOrderConsoleId(null)}
            onSaveOrders={handleSaveTableOrders}
          />
        )}

        {/* MODAL 3: CHECKOUT & PAYMENT */}
        {activeCheckoutConsole && (
          <RentalCheckoutModal
            console={activeCheckoutConsole}
            defaultRate={rates[activeCheckoutConsole.type] || 10000}
            packageRate={packageRate}
            cashierEmail={operator.name}
            onClose={() => setCheckoutConsoleId(null)}
            onOpenLuckyWheel={() => setIsLuckyWheelOpen(true)}
            appliedDiscount={appliedDiscount}
            onCompleteCheckout={handleCompleteCheckout}
          />
        )}

        {/* MODAL 4: LUCKY WHEEL OF FORTUNE */}
        {isLuckyWheelOpen && (
          <LuckyWheelModal
            onClose={() => setIsLuckyWheelOpen(false)}
            onApplyReward={(reward) => {
              setAppliedDiscount({ text: reward.text, amount: reward.discountAmount });
            }}
          />
        )}

        {/* MODAL 5: VIRAL GAMER STORY CARD */}
        {activeStoryReceipt && (
          <GamerStoryCardModal
            receipt={activeStoryReceipt}
            loyaltyStamps={activeGamerStamps}
            onClose={() => setActiveStoryReceipt(null)}
            onPrintThermal={handlePrintReceipt}
          />
        )}
      </div>
    </div>
  );
}
