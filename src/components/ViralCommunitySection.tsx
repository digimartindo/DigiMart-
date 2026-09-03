import { useState, FormEvent } from 'react';
import { Trophy, Award, Sparkles, Star, Users, Flame, Plus, Search, Check, Gift, Swords, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomerLoyalty, TournamentMatch } from '../types';
import { calculateRank, formatDuration } from '../utils/formatters';

interface ViralCommunitySectionProps {
  loyaltyGamers: CustomerLoyalty[];
  onAddGamer: (gamer: CustomerLoyalty) => void;
  onUpdateGamerStamps: (id: string, stamps: number) => void;
  tournamentMatches: TournamentMatch[];
  onUpdateTournamentMatch: (matchId: string, winner: string, score1: number, score2: number) => void;
  onOpenLuckyWheel: () => void;
}

export default function ViralCommunitySection({
  loyaltyGamers,
  onAddGamer,
  onUpdateGamerStamps,
  tournamentMatches,
  onUpdateTournamentMatch,
  onOpenLuckyWheel,
}: ViralCommunitySectionProps) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'loyalty' | 'tournament'>('leaderboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // New member form state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberConsole, setNewMemberConsole] = useState('PS5');

  // Loyalty lookup
  const [selectedLoyaltyGamer, setSelectedLoyaltyGamer] = useState<CustomerLoyalty | null>(
    loyaltyGamers[0] || null
  );

  const filteredGamers = [...loyaltyGamers]
    .filter(
      (g) =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.phone.includes(searchTerm)
    )
    .sort((a, b) => b.totalPlayHours - a.totalPlayHours);

  const handleSaveMember = (e: FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberPhone.trim()) return;

    const newGamer: CustomerLoyalty = {
      id: 'l_' + Date.now(),
      name: newMemberName.trim(),
      phone: newMemberPhone.trim(),
      totalPlayHours: 0,
      stamps: 1,
      rank: 'Novice',
      favoriteConsole: newMemberConsole,
      badges: ['🎮 Member Baru Plus+Game'],
      lastVisit: Date.now(),
    };

    onAddGamer(newGamer);
    setSelectedLoyaltyGamer(newGamer);
    setNewMemberName('');
    setNewMemberPhone('');
    setShowAddMemberModal(false);

    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch (err) {
      console.error(err);
    }
  };

  const handleClaimFreeHour = (gamerId: string) => {
    onUpdateGamerStamps(gamerId, 0); // reset stamps after claiming 1 free hour reward
    try {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    } catch (err) {
      console.error(err);
    }
    alert('🎉 Selamat! 1 Jam Main Gratis berhasil diklaim untuk pelanggan!');
  };

  const handleSetWinner = (match: TournamentMatch, winner: string, s1: number, s2: number) => {
    onUpdateTournamentMatch(match.id, winner, s1, s2);
    if (match.round === 'Grand Final') {
      try {
        confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Viral Hero Bar */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Flame size={14} className="text-amber-400" /> GAMING COMMUNITY
          </div>
          <h2 className="text-2xl font-black tracking-tight">Plus+Game Lounge & Leaderboard</h2>
          <p className="text-xs text-blue-200/80 max-w-xl">
            Sistem gamifikasi gamer, leaderboard rental, kartu loyalitas stamp (10 Jam = 1 Jam Gratis), dan turnamen mini berhadiah!
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onOpenLuckyWheel}
            className="flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg transition active:scale-95"
          >
            <Sparkles size={16} /> Putar Roda Hoki
          </button>
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition active:scale-95"
          >
            <Plus size={16} /> + Daftar Member
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-zinc-100 p-1 rounded-2xl border border-zinc-200 max-w-md">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'leaderboard'
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Trophy size={15} className={activeTab === 'leaderboard' ? 'text-amber-500' : ''} />
          <span>Top Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('loyalty')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'loyalty'
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Star size={15} className={activeTab === 'loyalty' ? 'text-blue-600' : ''} />
          <span>Stamp Loyalitas</span>
        </button>

        <button
          onClick={() => setActiveTab('tournament')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'tournament'
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Swords size={15} className={activeTab === 'tournament' ? 'text-rose-500' : ''} />
          <span>Turnamen Mini</span>
        </button>
      </div>

      {/* TAB 1: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Trophy size={20} className="text-amber-500" />
                Hall of Fame Gamer Plus+Game
              </h3>
              <p className="text-xs text-zinc-500">
                Peringkat gamer paling setia berdasarkan akumulasi jam bermain di rental
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari nickname / nomor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 text-xs">
                  <th className="py-3 px-3 font-semibold w-12 text-center">Rank</th>
                  <th className="py-3 px-3 font-semibold">Gamer & Kontak</th>
                  <th className="py-3 px-3 font-semibold">Tier Status</th>
                  <th className="py-3 px-3 font-semibold text-center">Total Jam</th>
                  <th className="py-3 px-3 font-semibold">Badge Spesial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredGamers.map((gamer, index) => {
                  const rankData = calculateRank(gamer.totalPlayHours);
                  return (
                    <tr
                      key={gamer.id}
                      className="hover:bg-zinc-50/80 transition cursor-pointer"
                      onClick={() => {
                        setSelectedLoyaltyGamer(gamer);
                        setActiveTab('loyalty');
                      }}
                    >
                      <td className="py-3.5 px-3 text-center font-bold">
                        {index === 0 && <span className="text-lg">🥇</span>}
                        {index === 1 && <span className="text-lg">🥈</span>}
                        {index === 2 && <span className="text-lg">🥉</span>}
                        {index > 2 && <span className="text-zinc-500 font-mono">#{index + 1}</span>}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-zinc-900">{gamer.name}</div>
                        <div className="text-[11px] text-zinc-600 font-mono">{gamer.phone}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${rankData.color}`}
                        >
                          <Award size={12} />
                          {rankData.rank}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center font-bold text-zinc-900 font-mono">
                        {gamer.totalPlayHours} Jam
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {gamer.badges && gamer.badges.length > 0 ? (
                            gamer.badges.slice(0, 2).map((b, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-zinc-100 text-zinc-700 font-medium px-2 py-0.5 rounded-md border border-zinc-200"
                              >
                                {b}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-zinc-600">Gamer Regular</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LOYALTY STAMPS */}
      {activeTab === 'loyalty' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Member Picker List */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-sm text-zinc-900">Pilih Member Gamer</h4>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                + Member Baru
              </button>
            </div>

            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredGamers.map((gamer) => (
                <button
                  key={gamer.id}
                  onClick={() => setSelectedLoyaltyGamer(gamer)}
                  className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between ${
                    selectedLoyaltyGamer?.id === gamer.id
                      ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                      : 'border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs sm:text-sm text-zinc-900 truncate">
                      {gamer.name}
                    </div>
                    <div className="text-[11px] text-zinc-600 font-mono">{gamer.phone}</div>
                  </div>
                  <div className="text-right pl-2">
                    <span className="text-xs font-bold text-amber-800 font-mono">
                      {gamer.stamps}/10 ★
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Punch Card Display */}
          <div className="md:col-span-2 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            {selectedLoyaltyGamer ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                      {selectedLoyaltyGamer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                        KARTU MEMBER LOYALITAS
                      </div>
                      <h3 className="text-xl font-black text-zinc-900">
                        {selectedLoyaltyGamer.name}
                      </h3>
                      <p className="text-xs text-zinc-500">
                        WA: {selectedLoyaltyGamer.phone} • Konsol Favorit: {selectedLoyaltyGamer.favoriteConsole}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-500 font-mono">
                      {selectedLoyaltyGamer.stamps}
                    </span>
                    <span className="text-xs text-zinc-600">/10 Stamp</span>
                  </div>
                </div>

                {/* 10-Stamp Visual Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-700">
                      Progress Menuju 1 Jam Gratis:
                    </span>
                    <span className="text-xs text-zinc-500">
                      {10 - selectedLoyaltyGamer.stamps} stamp lagi
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2.5">
                    {Array.from({ length: 10 }).map((_, index) => {
                      const isStamped = index < selectedLoyaltyGamer.stamps;
                      const isTenth = index === 9;
                      return (
                        <div
                          key={index}
                          className={`h-20 rounded-2xl border-2 flex flex-col items-center justify-center p-2 text-center transition ${
                            isStamped
                              ? 'border-amber-400 bg-amber-50 text-amber-600 shadow-2xs'
                              : isTenth
                              ? 'border-dashed border-rose-300 bg-rose-50/50 text-rose-400'
                              : 'border-dashed border-zinc-200 bg-zinc-50/50 text-zinc-300'
                          }`}
                        >
                          {isStamped ? (
                            <>
                              <Star size={24} className="fill-amber-400 text-amber-500 mb-1" />
                              <span className="text-[10px] font-black font-mono">STAMP #{index + 1}</span>
                            </>
                          ) : isTenth ? (
                            <>
                              <Gift size={22} className="text-rose-500 mb-1 animate-bounce" />
                              <span className="text-[9px] font-bold text-rose-600 leading-tight">
                                1 JAM GRATIS!
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-lg font-bold font-mono text-zinc-300">
                                {index + 1}
                              </span>
                              <span className="text-[9px] text-zinc-600">Sewa 1 Jam</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stamp Control Buttons */}
                <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        onUpdateGamerStamps(
                          selectedLoyaltyGamer.id,
                          Math.min(10, selectedLoyaltyGamer.stamps + 1)
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Plus size={14} /> Tambah 1 Stamp
                    </button>
                    {selectedLoyaltyGamer.stamps > 0 && (
                      <button
                        onClick={() =>
                          onUpdateGamerStamps(
                            selectedLoyaltyGamer.id,
                            Math.max(0, selectedLoyaltyGamer.stamps - 1)
                          )
                        }
                        className="px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-semibold text-xs transition"
                      >
                        - Kurangi
                      </button>
                    )}
                  </div>

                  {selectedLoyaltyGamer.stamps >= 10 && (
                    <button
                      onClick={() => handleClaimFreeHour(selectedLoyaltyGamer.id)}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-2 animate-pulse"
                    >
                      <Gift size={16} /> KLAIM REWARD 1 JAM GRATIS!
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-400">
                <Users size={36} className="mx-auto mb-2 text-zinc-300" />
                <p className="text-sm">Pilih member untuk melihat kartu stamp</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TOURNAMENT BRACKET */}
      {activeTab === 'tournament' && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
            <div>
              <span className="text-[10px] font-bold text-rose-600 uppercase bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                COMMUNITY EVENT
              </span>
              <h3 className="text-lg font-bold text-zinc-900 mt-1 flex items-center gap-2">
                <Swords size={20} className="text-rose-500" />
                Mini Turnamen eFootball / PES / Tekken Plus+Game
              </h3>
              <p className="text-xs text-zinc-500">
                Sistem bagan turnamen knockout rental untuk mabar seru akhir pekan!
              </p>
            </div>

            <button
              onClick={() => {
                const text = `🏆 *TURNAMEN PLUS+GAME WEEKEND CUP* 🏆\nAyo ikuti turnamen rental PS berhadiah saldo & voucher main gratis!\nDaftar langsung ke kasir Plus+Game. Kuota terbatas! 🔥`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
            >
              <Share2 size={14} /> Sebarkan ke WA Komunitas
            </button>
          </div>

          {/* Tournament Match Brackets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tournamentMatches.map((match) => (
              <div
                key={match.id}
                className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-bold text-zinc-600">
                  <span>{match.round}</span>
                  {match.winner && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      Selesai
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  {/* Player 1 */}
                  <div
                    className={`p-2 rounded-xl border flex items-center justify-between ${
                      match.winner === match.player1
                        ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                        : 'bg-white border-zinc-200 text-zinc-800'
                    }`}
                  >
                    <span className="truncate max-w-[120px]">{match.player1}</span>
                    <input
                      type="number"
                      value={match.score1}
                      onChange={(e) =>
                        handleSetWinner(
                          match,
                          Number(e.target.value) > match.score2
                            ? match.player1
                            : match.score2 > Number(e.target.value)
                            ? match.player2
                            : '',
                          Number(e.target.value),
                          match.score2
                        )
                      }
                      className="w-10 text-center font-mono font-bold bg-zinc-100 rounded-md py-0.5 border border-zinc-200"
                    />
                  </div>

                  {/* Player 2 */}
                  <div
                    className={`p-2 rounded-xl border flex items-center justify-between ${
                      match.winner === match.player2
                        ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                        : 'bg-white border-zinc-200 text-zinc-800'
                    }`}
                  >
                    <span className="truncate max-w-[120px]">{match.player2}</span>
                    <input
                      type="number"
                      value={match.score2}
                      onChange={(e) =>
                        handleSetWinner(
                          match,
                          match.score1 > Number(e.target.value)
                            ? match.player1
                            : Number(e.target.value) > match.score1
                            ? match.player2
                            : '',
                          match.score1,
                          Number(e.target.value)
                        )
                      }
                      className="w-10 text-center font-mono font-bold bg-zinc-100 rounded-md py-0.5 border border-zinc-200"
                    />
                  </div>
                </div>

                {match.winner ? (
                  <div className="text-[11px] font-bold text-emerald-700 text-center pt-1">
                    👑 Pemenang: {match.winner}
                  </div>
                ) : (
                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => handleSetWinner(match, match.player1, 1, 0)}
                      className="flex-1 py-1 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-[10px] font-bold text-zinc-800"
                    >
                      {match.player1.split(' ')[0]} Menang
                    </button>
                    <button
                      onClick={() => handleSetWinner(match, match.player2, 0, 1)}
                      className="flex-1 py-1 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-[10px] font-bold text-zinc-800"
                    >
                      {match.player2.split(' ')[0]} Menang
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-zinc-200">
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Daftar Member Gamer Baru</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Member baru langsung mendapatkan 1 stamp perdana dan tercatat di leaderboard!
            </p>

            <form onSubmit={handleSaveMember} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Nama Gamer / Nickname <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rian PES Master"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Nomor WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Konsol Favorit
                </label>
                <select
                  value={newMemberConsole}
                  onChange={(e) => setNewMemberConsole(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm bg-white"
                >
                  <option value="PS5">PlayStation 5</option>
                  <option value="PS4">PlayStation 4</option>
                  <option value="SWITCH">Nintendo Switch</option>
                  <option value="VIP">VIP Room</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 rounded-xl border border-zinc-200 bg-white py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
                >
                  Simpan Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
