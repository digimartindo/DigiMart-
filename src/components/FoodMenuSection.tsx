import { useState, Dispatch, SetStateAction, FormEvent } from 'react';
import { Coffee, Plus, Trash2, Edit2, Check, X, Download, RotateCcw, Search, ShoppingBag } from 'lucide-react';
import { FoodItem, FoodSaleRecord } from '../types';
import { formatRupiah, formatDateTime } from '../utils/formatters';

interface FoodMenuSectionProps {
  items: FoodItem[];
  sales: FoodSaleRecord[];
  setItems: Dispatch<SetStateAction<FoodItem[]>>;
  setSales: Dispatch<SetStateAction<FoodSaleRecord[]>>;
  isAdmin: boolean;
}

export default function FoodMenuSection({
  items,
  sales,
  setItems,
  setSales,
  isAdmin,
}: FoodMenuSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'menu' | 'sales'>('menu');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Add Item form
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'meal' | 'drink' | 'snack' | 'other'>('drink');
  const [newItemStock, setNewItemStock] = useState('20');
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit item
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [tempPrice, setTempPrice] = useState('');
  const [tempStock, setTempStock] = useState('');

  // Sales filter
  const [filter, setFilter] = useState('all');
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  const addItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    const item: FoodItem = {
      id: 'f_' + Date.now(),
      name: newItemName.trim(),
      price: Number(newItemPrice),
      category: newItemCategory,
      stock: Number(newItemStock) || 0,
    };
    setItems((prev) => [...prev, item]);
    setNewItemName('');
    setNewItemPrice('');
    setShowAddForm(false);
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const startEdit = (item: FoodItem) => {
    setEditingId(item.id);
    setTempName(item.name);
    setTempPrice(item.price.toString());
    setTempStock((item.stock || 0).toString());
  };

  const saveEdit = (id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              name: tempName.trim(),
              price: Number(tempPrice) || i.price,
              stock: Number(tempStock) || 0,
            }
          : i
      )
    );
    setEditingId(null);
  };

  // Direct cash register sale
  const sellDirect = (item: FoodItem) => {
    const saleRecord: FoodSaleRecord = {
      id: 's_' + Date.now(),
      itemName: item.name,
      category: item.category,
      price: item.price,
      quantity: 1,
      time: Date.now(),
      customerName: 'Penjualan Konter',
    };
    setSales((prev) => [saleRecord, ...prev]);

    // Decrease stock
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, stock: Math.max(0, (i.stock || 1) - 1) } : i
      )
    );
  };

  // Sales filtering
  const now = new Date();
  const isToday = (date: Date) => date.toDateString() === now.toDateString();
  const isThisWeek = (date: Date) => {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return date >= startOfWeek;
  };
  const isThisMonth = (date: Date) =>
    date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

  const filteredSales = sales.filter((s) => {
    const d = new Date(s.time);
    if (filter === 'today') return isToday(d);
    if (filter === 'weekly') return isThisWeek(d);
    if (filter === 'monthly') return isThisMonth(d);
    return true;
  });

  const totalSalesAmount = filteredSales.reduce((sum, s) => sum + s.price * (s.quantity || 1), 0);

  const handleReset = () => {
    const d = new Date();
    const isTodayReset = (date: Date) => date.toDateString() === d.toDateString();
    const isThisWeekReset = (date: Date) => {
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return date >= startOfWeek;
    };
    const isThisMonthReset = (date: Date) =>
      date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear();

    let newSales = sales;
    if (filter === 'today') newSales = sales.filter((s) => !isTodayReset(new Date(s.time)));
    else if (filter === 'weekly') newSales = sales.filter((s) => !isThisWeekReset(new Date(s.time)));
    else if (filter === 'monthly') newSales = sales.filter((s) => !isThisMonthReset(new Date(s.time)));
    else newSales = [];
    setSales(newSales);
    setIsConfirmingReset(false);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Item', 'Kategori', 'Harga', 'Jumlah', 'Total', 'Waktu', 'Pelanggan'];
    const csvContent = [
      headers.join(','),
      ...filteredSales.map((row) =>
        [
          JSON.stringify(row.id || ''),
          JSON.stringify(row.itemName || ''),
          JSON.stringify(row.category || ''),
          row.price,
          row.quantity || 1,
          row.price * (row.quantity || 1),
          JSON.stringify(new Date(row.time).toISOString()),
          JSON.stringify(row.customerName || 'Konter'),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `penjualan_fb_plusgame_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex bg-zinc-100 p-1 rounded-2xl border border-zinc-200 max-w-xs">
          <button
            onClick={() => setActiveSubTab('menu')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'menu' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600'
            }`}
          >
            <Coffee size={15} className={activeSubTab === 'menu' ? 'text-amber-600' : ''} />
            <span>Daftar Menu</span>
          </button>
          <button
            onClick={() => setActiveSubTab('sales')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'sales' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600'
            }`}
          >
            <ShoppingBag size={15} className={activeSubTab === 'sales' ? 'text-blue-600' : ''} />
            <span>Riwayat Jual ({sales.length})</span>
          </button>
        </div>

        {activeSubTab === 'menu' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 text-xs sm:text-sm font-bold shadow-xs transition"
          >
            <Plus size={16} /> + Tambah Menu
          </button>
        )}
      </div>

      {/* Add Menu Form */}
      {showAddForm && (
        <form
          onSubmit={addItem}
          className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm space-y-3 animate-in fade-in"
        >
          <h3 className="font-bold text-sm text-zinc-900">Tambah Item Menu Baru</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-zinc-500 block mb-1">Nama Item</label>
              <input
                type="text"
                placeholder="Contoh: Indomie Dobel + Keju"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Harga (Rp)</label>
              <input
                type="number"
                placeholder="10000"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Kategori</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as any)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs sm:text-sm bg-white"
              >
                <option value="meal">Makanan</option>
                <option value="drink">Minuman</option>
                <option value="snack">Snack</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 text-xs text-zinc-600 hover:bg-zinc-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
            >
              Simpan Item
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 1: MENU ITEMS */}
      {activeSubTab === 'menu' && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          {/* Filter & Search */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari menu makanan / minuman..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto">
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

          {/* Cards Grid of Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.map((item) => {
              const isEdit = editingId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-zinc-200 p-3.5 bg-white hover:border-zinc-300 transition flex flex-col justify-between"
                >
                  {isEdit ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 px-2 py-1 text-xs font-semibold"
                        placeholder="Nama"
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="number"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 px-2 py-1 text-xs"
                          placeholder="Harga"
                        />
                        <input
                          type="number"
                          value={tempStock}
                          onChange={(e) => setTempStock(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 px-2 py-1 text-xs"
                          placeholder="Stok"
                        />
                      </div>
                      <div className="flex gap-1 justify-end pt-1">
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 rounded-md text-zinc-400 hover:text-zinc-600"
                        >
                          <X size={15} />
                        </button>
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          <Check size={15} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h4 className="font-bold text-xs sm:text-sm text-zinc-900 leading-snug">
                            {item.name}
                          </h4>
                          <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md shrink-0">
                            {item.category}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between mb-3">
                          <span className="text-sm font-extrabold text-amber-800 font-mono">
                            {formatRupiah(item.price)}
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            Stok: <span className="font-semibold text-zinc-800">{item.stock ?? 20}</span>
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => sellDirect(item)}
                          className="flex-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white py-1.5 text-xs font-bold transition active:scale-95"
                          title="Jual langsung di kasir"
                        >
                          + Jual Langsung
                        </button>

                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-100 transition"
                            title="Edit Item"
                          >
                            <Edit2 size={13} />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition"
                              title="Hapus Item"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SALES LOG */}
      {activeSubTab === 'sales' && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-zinc-900">Riwayat Penjualan F&B</h3>
              <p className="text-xs text-zinc-500">
                Total Omset F&B Terfilter:{' '}
                <span className="font-bold text-amber-800 font-mono">{formatRupiah(totalSalesAmount)}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs bg-white"
              >
                <option value="all">Semua Waktu</option>
                <option value="today">Hari Ini</option>
                <option value="weekly">Minggu Ini</option>
                <option value="monthly">Bulan Ini</option>
              </select>

              <button
                onClick={exportToCSV}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition"
              >
                <Download size={14} /> Export CSV
              </button>

              {isAdmin && (
                <>
                  {isConfirmingReset ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleReset}
                        className="rounded-xl bg-rose-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                      >
                        Yakin Reset?
                      </button>
                      <button
                        onClick={() => setIsConfirmingReset(false)}
                        className="rounded-xl border border-zinc-200 px-2.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsConfirmingReset(true)}
                      className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-3 py-1.5 text-xs font-semibold hover:bg-rose-100 transition"
                    >
                      <RotateCcw size={13} /> Reset
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Item Menu</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-right">Harga</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-zinc-50/80">
                    <td className="py-2.5 px-3 text-zinc-600 font-mono">
                      {formatDateTime(sale.time)}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-zinc-900">{sale.itemName}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] uppercase font-bold bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">
                        {sale.category || 'F&B'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900">
                      {formatRupiah(sale.price * (sale.quantity || 1))}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-500">
                      {sale.customerName || sale.consoleName || 'Konter'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
