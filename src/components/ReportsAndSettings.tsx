import { useState, FormEvent, useRef } from 'react';
import {
  BarChart3,
  Settings,
  DollarSign,
  Clock,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Eye,
  ShieldCheck,
  Gamepad2,
  Coffee,
  Database,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Cloud,
  CloudUpload,
  CloudDownload,
} from 'lucide-react';
import { Console, RentalHistoryItem } from '../types';
import { formatRupiah, formatDuration, formatDateTime } from '../utils/formatters';

interface ReportsAndSettingsProps {
  rentalHistory: RentalHistoryItem[];
  onResetHistory: (filter: string) => void;
  consoles: Console[];
  onAddConsole: (name: string, type: any, rate: number) => void;
  onDeleteConsole: (id: string) => void;
  rates: Record<string, number>;
  onUpdateRate: (type: string, newRate: number) => void;
  packageRate: number;
  onUpdatePackageRate: (rate: number) => void;
  isAdmin: boolean;
  operator: { name: string; role: 'admin' | 'kasir' };
  onUpdateOperator: (name: string, role: 'admin' | 'kasir') => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  backupNotification: string | null;
  onViewReceipt: (receipt: RentalHistoryItem) => void;
  cloudBackups: CloudBackupMeta[];
  cloudLoading: boolean;
  cloudBusy: boolean;
  onCloudBackup: (label: string) => void;
  onCloudRestore: (id: number) => void;
  onCloudDelete: (id: number) => void;
  onRefreshCloud: () => void;
}

export interface CloudBackupMeta {
  id: number;
  label: string;
  created_by: string;
  created_at: string;
  size_bytes?: number;
}

export default function ReportsAndSettings({
  rentalHistory,
  onResetHistory,
  consoles,
  onAddConsole,
  onDeleteConsole,
  rates,
  onUpdateRate,
  packageRate,
  onUpdatePackageRate,
  isAdmin,
  operator,
  onUpdateOperator,
  onExportBackup,
  onImportBackup,
  backupNotification,
  onViewReceipt,
  cloudBackups,
  cloudLoading,
  cloudBusy,
  onCloudBackup,
  onCloudRestore,
  onCloudDelete,
  onRefreshCloud,
}: ReportsAndSettingsProps) {
  const [filter, setFilter] = useState('all');
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cloudLabel, setCloudLabel] = useState('');
  const [restoreConfirmId, setRestoreConfirmId] = useState<number | null>(null);

  // Operator Edit Form
  const [operatorNameInput, setOperatorNameInput] = useState(operator.name);
  const [operatorRoleInput, setOperatorRoleInput] = useState<'admin' | 'kasir'>(operator.role);
  const [isEditingOperator, setIsEditingOperator] = useState(false);

  // New Console Form
  const [newConsoleName, setNewConsoleName] = useState('');
  const [newConsoleType, setNewConsoleType] = useState<string>('PS5');
  const [newConsoleRate, setNewConsoleRate] = useState('12000');
  const [showAddConsole, setShowAddConsole] = useState(false);

  // Filter history
  const now = new Date();
  const isToday = (d: Date) => d.toDateString() === now.toDateString();
  const isThisWeek = (d: Date) => {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return d >= startOfWeek;
  };
  const isThisMonth = (d: Date) =>
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  const isThisYear = (d: Date) => d.getFullYear() === now.getFullYear();

  const filteredHistory = rentalHistory.filter((h) => {
    const d = new Date(h.startTime);
    if (filter === 'today') return isToday(d);
    if (filter === 'weekly') return isThisWeek(d);
    if (filter === 'monthly') return isThisMonth(d);
    if (filter === 'yearly') return isThisYear(d);
    return true;
  });

  const totalEarnings = filteredHistory.reduce((sum, h) => sum + (h.cost || 0), 0);
  const totalRentalEarnings = filteredHistory.reduce((sum, h) => sum + (h.rentalCost || h.cost || 0), 0);
  const totalFnbInRental = filteredHistory.reduce((sum, h) => sum + (h.fnbCost || 0), 0);
  const totalDurationMs = filteredHistory.reduce((sum, h) => sum + (h.duration || 0), 0);
  const avgDurationMs = filteredHistory.length > 0 ? totalDurationMs / filteredHistory.length : 0;

  const exportToCSV = () => {
    const headers = [
      'ID',
      'Konsol',
      'Pelanggan',
      'Waktu Mulai',
      'Waktu Selesai',
      'Durasi (menit)',
      'Biaya Rental',
      'Biaya F&B',
      'Diskon',
      'Total Bayar',
      'Metode Bayar',
    ];
    const csvContent = [
      headers.join(','),
      ...filteredHistory.map((row) =>
        [
          JSON.stringify(row.id || ''),
          JSON.stringify(row.consoleName || ''),
          JSON.stringify(row.customerName || ''),
          JSON.stringify(new Date(row.startTime).toISOString()),
          JSON.stringify(new Date(row.endTime).toISOString()),
          Math.round(row.duration / 60000),
          row.rentalCost,
          row.fnbCost,
          row.discount || 0,
          row.cost,
          JSON.stringify(row.paymentMethod || 'cash'),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan_rental_plusgame_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateConsole = (e: FormEvent) => {
    e.preventDefault();
    if (!newConsoleName.trim()) return;
    onAddConsole(newConsoleName.trim(), newConsoleType, Number(newConsoleRate) || 10000);
    setNewConsoleName('');
    setShowAddConsole(false);
  };

  return (
    <div className="space-y-6">
      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold">Total Omset</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-900 font-mono">
            {formatRupiah(totalEarnings)}
          </div>
          <div className="text-[11px] text-zinc-600 mt-1">
            Rental: {formatRupiah(totalRentalEarnings)}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold">F&B di Station</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Coffee size={18} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-800 font-mono">
            {formatRupiah(totalFnbInRental)}
          </div>
          <div className="text-[11px] text-zinc-600 mt-1">
            Order konsol terintegrasi
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold">Total Sesi Main</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Gamepad2 size={18} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-900 font-mono">
            {filteredHistory.length} <span className="text-sm font-normal text-zinc-500">Sesi</span>
          </div>
          <div className="text-[11px] text-zinc-600 mt-1">
            Rata-rata: {Math.round(avgDurationMs / 60000)} menit
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold">Total Jam Konsol</span>
            <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-900 font-mono">
            {(totalDurationMs / 3600000).toFixed(1)}{' '}
            <span className="text-sm font-normal text-zinc-500">Jam</span>
          </div>
          <div className="text-[11px] text-zinc-600 mt-1">
            Akumulasi durasi aktif
          </div>
        </div>
      </div>

      {/* Main Grid: Transaction History + Station Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Transaction Log */}
        <div className="lg:col-span-2 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-600" />
                Laporan Riwayat Rental
              </h3>
              <p className="text-xs text-zinc-500">
                Log transaksi kasir lengkap dengan detail sewa, F&B, dan struk
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs bg-white"
              >
                <option value="all">Semua</option>
                <option value="today">Hari Ini</option>
                <option value="weekly">Minggu Ini</option>
                <option value="monthly">Bulan Ini</option>
                <option value="yearly">Tahun Ini</option>
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
                        onClick={() => {
                          onResetHistory(filter);
                          setIsConfirmingReset(false);
                        }}
                        className="rounded-xl bg-rose-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                      >
                        Yakin?
                      </button>
                      <button
                        onClick={() => setIsConfirmingReset(false)}
                        className="rounded-xl border border-zinc-200 px-2.5 py-1.5 text-xs text-zinc-600"
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

          <div className="overflow-x-auto max-h-[420px]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Konsol</th>
                  <th className="py-2.5 px-3">Gamer</th>
                  <th className="py-2.5 px-3">Durasi</th>
                  <th className="py-2.5 px-3 text-right">Total Bayar</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-600">
                      Belum ada transaksi di periode ini
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/80">
                      <td className="py-3 px-3 text-zinc-600 font-mono whitespace-nowrap">
                        {formatDateTime(item.endTime)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-zinc-900">
                        {item.consoleName}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-zinc-900">{item.customerName}</div>
                        {item.customerPhone && (
                          <div className="text-[10px] text-zinc-600 font-mono">{item.customerPhone}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-zinc-600 font-mono">
                        {formatDuration(item.duration)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-blue-700">
                        {formatRupiah(item.cost)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onViewReceipt(item)}
                          className="p-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-blue-50 hover:text-blue-600 transition"
                          title="Lihat Struk & Gamer Pass"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Console & Rate Settings */}
        <div className="space-y-6">
          {/* Rate Settings Card */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">
              <Settings size={18} className="text-zinc-600" />
              <h4>Pengaturan Tarif Rental</h4>
            </div>

            <div className="space-y-3">
              {Object.entries(rates).map(([type, rate]) => (
                <div key={type} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-700">{type} (per jam):</span>
                  <div className="flex items-center gap-1 w-32">
                    <span className="text-zinc-600 font-mono">Rp</span>
                    <input
                      type="number"
                      value={rate}
                      disabled={!isAdmin}
                      onChange={(e) => onUpdateRate(type, Number(e.target.value) || 0)}
                      className="w-full rounded-lg border border-zinc-200 px-2 py-1 text-xs font-mono font-bold text-right disabled:bg-zinc-100"
                    />
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between text-xs border-t border-zinc-100 pt-2">
                <span className="font-semibold text-zinc-700">Paket Hemat (3 Jam):</span>
                <div className="flex items-center gap-1 w-32">
                  <span className="text-zinc-600 font-mono">Rp</span>
                  <input
                    type="number"
                    value={packageRate}
                    disabled={!isAdmin}
                    onChange={(e) => onUpdatePackageRate(Number(e.target.value) || 0)}
                    className="w-full rounded-lg border border-zinc-200 px-2 py-1 text-xs font-mono font-bold text-right disabled:bg-zinc-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Console Stations Manager */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="font-bold text-sm text-zinc-900">
                Stasiun Konsol ({consoles.length})
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowAddConsole(!showAddConsole)}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> + Tambah Konsol
                </button>
              )}
            </div>

            {showAddConsole && isAdmin && (
              <form onSubmit={handleCreateConsole} className="space-y-2 bg-zinc-50 p-3 rounded-2xl border border-zinc-200 text-xs">
                <div>
                  <label className="text-[11px] text-zinc-500 block mb-1">Nama Konsol:</label>
                  <input
                    type="text"
                    placeholder="PS5 - 04 (Lounge)"
                    value={newConsoleName}
                    onChange={(e) => setNewConsoleName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-xs bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-zinc-500 block mb-1">Tipe:</label>
                    <select
                      value={newConsoleType}
                      onChange={(e) => {
                        setNewConsoleType(e.target.value);
                        setNewConsoleRate((rates[e.target.value] || 10000).toString());
                      }}
                      className="w-full rounded-lg border border-zinc-200 px-2 py-1 text-xs bg-white"
                    >
                      <option value="PS5">PlayStation 5</option>
                      <option value="PS4">PlayStation 4</option>
                      <option value="SWITCH">Nintendo Switch</option>
                      <option value="VIP">VIP Room</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-500 block mb-1">Tarif/Jam:</label>
                    <input
                      type="number"
                      value={newConsoleRate}
                      onChange={(e) => setNewConsoleRate(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 px-2 py-1 text-xs bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddConsole(false)}
                    className="px-2.5 py-1 rounded-md text-zinc-500 hover:bg-zinc-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs">
              {consoles.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 bg-white"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-bold text-zinc-900 truncate">{c.name}</div>
                    <div className="text-[10px] text-zinc-500">
                      {c.type} • {formatRupiah(c.hourlyRate || rates[c.type] || 10000)}/jam
                    </div>
                  </div>

                  {isAdmin && consoles.length > 1 && (
                    <button
                      onClick={() => onDeleteConsole(c.id)}
                      className="p-1 rounded-md text-zinc-400 hover:text-rose-600 transition"
                      title="Hapus Konsol"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Shared Cloud Backup Card (visible to all users/devices) */}
          <div className="rounded-3xl border border-blue-200 bg-blue-50/40 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                <Cloud size={16} className="text-blue-600" />
                <span>Cadangan Cloud (Semua Perangkat)</span>
              </div>
              <button
                onClick={onRefreshCloud}
                disabled={cloudLoading || cloudBusy}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-blue-700 border border-blue-200 hover:bg-blue-100 transition disabled:opacity-50"
                title="Muat ulang daftar cadangan"
              >
                <RotateCcw size={11} className={cloudLoading ? 'animate-spin' : ''} />
                Segarkan
              </button>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Simpan cadangan ke server. Semua perangkat/kasir yang membuka aplikasi ini akan melihat dan bisa memulihkan cadangan yang sama.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={cloudLabel}
                onChange={(e) => setCloudLabel(e.target.value)}
                placeholder="Nama cadangan (opsional)"
                className="flex-1 min-w-0 rounded-xl border border-zinc-200 px-3 py-2 text-xs bg-white"
              />
              <button
                type="button"
                onClick={() => {
                  onCloudBackup(cloudLabel.trim());
                  setCloudLabel('');
                }}
                disabled={cloudBusy}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs disabled:opacity-50 whitespace-nowrap"
                title="Cadangkan data saat ini ke cloud"
              >
                <CloudUpload size={14} />
                <span>Cadangkan</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {cloudLoading ? (
                <div className="py-6 text-center text-[11px] text-zinc-500">Memuat cadangan cloud...</div>
              ) : cloudBackups.length === 0 ? (
                <div className="py-6 text-center text-[11px] text-zinc-500">
                  Belum ada cadangan cloud. Buat cadangan pertama Anda.
                </div>
              ) : (
                cloudBackups.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-zinc-200 bg-white"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-zinc-900 text-xs truncate">{b.label}</div>
                      <div className="text-[10px] text-zinc-500">
                        {formatDateTime(new Date(b.created_at).getTime())} • oleh {b.created_by}
                        {typeof b.size_bytes === 'number' && (
                          <span> • {(b.size_bytes / 1024).toFixed(1)} KB</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {restoreConfirmId === b.id ? (
                        <>
                          <button
                            onClick={() => {
                              onCloudRestore(b.id);
                              setRestoreConfirmId(null);
                            }}
                            disabled={cloudBusy}
                            className="rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Pulihkan?
                          </button>
                          <button
                            onClick={() => setRestoreConfirmId(null)}
                            className="rounded-lg border border-zinc-200 px-2 py-1 text-[10px] text-zinc-600"
                          >
                            Batal
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setRestoreConfirmId(b.id)}
                            disabled={cloudBusy}
                            className="p-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-emerald-50 hover:text-emerald-600 transition disabled:opacity-50"
                            title="Pulihkan data dari cadangan ini"
                          >
                            <CloudDownload size={14} />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => onCloudDelete(b.id)}
                              disabled={cloudBusy}
                              className="p-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-50"
                              title="Hapus cadangan"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Local Database & Backup/Restore Card */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                <Database size={16} className="text-emerald-600" />
                <span>Penyimpanan Lokal (Offline)</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Siap Offline
              </span>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Seluruh data transaksi, unit konsol, menu kantin, dan poin gamer tersimpan di memori browser perangkat ini. Bebas biaya hosting dan tidak memerlukan koneksi internet.
            </p>

            {backupNotification && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-medium border border-blue-200 animate-fadeIn">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>{backupNotification}</span>
              </div>
            )}

            {/* Backup & Restore Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onExportBackup}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition shadow-xs"
                title="Download backup file JSON"
              >
                <Download size={13} className="text-blue-600" />
                <span>Cadangkan (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition shadow-xs"
                title="Upload file backup JSON untuk memulihkan data"
              >
                <Upload size={13} className="text-emerald-600" />
                <span>Pulihkan (Restore)</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onImportBackup(file);
                    e.target.value = '';
                  }
                }}
              />
            </div>

            {/* Operator / Kasir Profile Settings */}
            <div className="border-t border-zinc-100 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                  <UserCheck size={14} className="text-zinc-600" />
                  <span>Petugas Kasir Shift:</span>
                </div>
                {!isEditingOperator ? (
                  <button
                    onClick={() => setIsEditingOperator(true)}
                    className="text-[11px] text-blue-600 font-bold hover:underline"
                  >
                    Ubah
                  </button>
                ) : null}
              </div>

              {!isEditingOperator ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
                  <span className="font-semibold text-zinc-900">{operator.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${operator.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-zinc-200 text-zinc-700'}`}>
                    {operator.role.toUpperCase()}
                  </span>
                </div>
              ) : (
                <div className="space-y-2 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 text-xs">
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-0.5">Nama Kasir:</label>
                    <input
                      type="text"
                      value={operatorNameInput}
                      onChange={(e) => setOperatorNameInput(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 px-2 py-1 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-0.5">Peran / Hak Akses:</label>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1 text-[11px]">
                        <input
                          type="radio"
                          name="role"
                          checked={operatorRoleInput === 'admin'}
                          onChange={() => setOperatorRoleInput('admin')}
                        />
                        Admin (Kelola Tarif & Hapus)
                      </label>
                      <label className="flex items-center gap-1 text-[11px]">
                        <input
                          type="radio"
                          name="role"
                          checked={operatorRoleInput === 'kasir'}
                          onChange={() => setOperatorRoleInput('kasir')}
                        />
                        Kasir
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingOperator(false)}
                      className="px-2 py-1 text-[11px] rounded text-zinc-600 hover:bg-zinc-200"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (operatorNameInput.trim()) {
                          onUpdateOperator(operatorNameInput.trim(), operatorRoleInput);
                          setIsEditingOperator(false);
                        }
                      }}
                      className="px-3 py-1 text-[11px] font-bold rounded bg-zinc-900 text-white hover:bg-zinc-800"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
