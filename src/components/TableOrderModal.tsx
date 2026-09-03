import { useState } from 'react';
import { X, Utensils, Plus, Minus, Check, Search } from 'lucide-react';
import { Console, FoodItem, TableOrderItem } from '../types';
import { formatRupiah } from '../utils/formatters';

interface TableOrderModalProps {
  console: Console;
  foodItems: FoodItem[];
  onClose: () => void;
  onSaveOrders: (consoleId: string, updatedOrders: TableOrderItem[]) => void;
}

export default function TableOrderModal({
  console: item,
  foodItems,
  onClose,
  onSaveOrders,
}: TableOrderModalProps) {
  const [currentOrders, setCurrentOrders] = useState<TableOrderItem[]>(item.orders || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredItems = foodItems.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddQuantity = (food: FoodItem) => {
    const existingIndex = currentOrders.findIndex((o) => o.itemId === food.id);
    if (existingIndex > -1) {
      const updated = [...currentOrders];
      updated[existingIndex].quantity += 1;
      setCurrentOrders(updated);
    } else {
      setCurrentOrders([
        ...currentOrders,
        {
          id: Date.now().toString(),
          itemId: food.id,
          name: food.name,
          price: food.price,
          quantity: 1,
          orderedAt: Date.now(),
        },
      ]);
    }
  };

  const handleRemoveQuantity = (foodId: string) => {
    const existingIndex = currentOrders.findIndex((o) => o.itemId === foodId);
    if (existingIndex > -1) {
      const updated = [...currentOrders];
      if (updated[existingIndex].quantity > 1) {
        updated[existingIndex].quantity -= 1;
        setCurrentOrders(updated);
      } else {
        setCurrentOrders(currentOrders.filter((o) => o.itemId !== foodId));
      }
    }
  };

  const getQuantityForFood = (foodId: string) => {
    const found = currentOrders.find((o) => o.itemId === foodId);
    return found ? found.quantity : 0;
  };

  const totalBill = currentOrders.reduce((sum, o) => sum + o.price * o.quantity, 0);

  const handleSave = () => {
    onSaveOrders(item.id, currentOrders);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Utensils size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">Pesan Menu F&B ke Meja</h3>
              <p className="text-xs text-zinc-500">
                {item.name} • Pelanggan: <span className="font-semibold text-zinc-800">{item.customerName || 'Gamer'}</span>
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

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari menu (Indomie, Es Teh, Kopi...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'meal', label: 'Makanan' },
              { id: 'drink', label: 'Minuman' },
              { id: 'snack', label: 'Snack' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1 mb-4">
          {filteredItems.map((food) => {
            const qty = getQuantityForFood(food.id);
            return (
              <div
                key={food.id}
                className="flex items-center justify-between p-3 rounded-2xl border border-zinc-200 hover:border-zinc-300 bg-white shadow-2xs transition"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="font-semibold text-xs sm:text-sm text-zinc-900 truncate">
                    {food.name}
                  </div>
                  <div className="text-xs font-bold text-amber-800">
                    {formatRupiah(food.price)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {qty > 0 ? (
                    <>
                      <button
                        onClick={() => handleRemoveQuantity(food.id)}
                        className="h-7 w-7 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center hover:bg-zinc-200 transition"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-xs font-bold font-mono">
                        {qty}
                      </span>
                      <button
                        onClick={() => handleAddQuantity(food)}
                        className="h-7 w-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition"
                      >
                        <Plus size={14} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleAddQuantity(food)}
                      className="px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-800 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Plus size={13} /> Tambah
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Summary & Save */}
        <div className="border-t border-zinc-100 pt-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-500">Total Pesanan Meja:</div>
            <div className="text-lg font-bold text-zinc-900 font-mono">
              {formatRupiah(totalBill)}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-amber-800 px-5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-amber-900 shadow-sm transition"
            >
              <Check size={16} /> Simpan Pesanan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
