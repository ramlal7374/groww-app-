import React, { useState, useMemo } from 'react';
import { useTrade } from '../context/TradeContext';
import { Stock } from '../types';
import { formatINR, formatPercent } from '../services/api';
import { PriceAlertModal } from '../components/PriceAlertModal';
import {
  Star,
  Plus,
  Trash2,
  Edit2,
  Search,
  TrendingUp,
  TrendingDown,
  Bell,
  ArrowRight,
  MoreVertical,
  Check,
  X,
  Layers
} from 'lucide-react';

export const WatchlistsPage: React.FC = () => {
  const {
    stocks,
    watchlistGroups,
    activeWatchlistId,
    setActiveWatchlistId,
    createWatchlistGroup,
    renameWatchlistGroup,
    deleteWatchlistGroup,
    addStockToGroup,
    removeStockFromGroup,
    navigateTo,
    openOrderModal,
    previousPriceMap,
    theme
  } = useTrade();

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Add stock search modal
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [stockSearchQuery, setStockSearchQuery] = useState('');

  // Alert modal
  const [alertStock, setAlertStock] = useState<Stock | null>(null);

  const activeGroup = watchlistGroups.find((g) => g.id === activeWatchlistId) || watchlistGroups[0];

  const activeStocks = useMemo(() => {
    if (!activeGroup) return [];
    return activeGroup.symbols
      .map((sym) => stocks.find((s) => s.symbol.toUpperCase() === sym.toUpperCase()))
      .filter((s): s is Stock => s !== undefined);
  }, [activeGroup, stocks]);

  const unaddedStocks = useMemo(() => {
    if (!activeGroup) return [];
    const q = stockSearchQuery.toLowerCase();
    return stocks.filter(
      (s) =>
        !activeGroup.symbols.includes(s.symbol) &&
        (s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    );
  }, [stocks, activeGroup, stockSearchQuery]);

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      createWatchlistGroup(newGroupName.trim());
      setNewGroupName('');
      setIsCreatingGroup(false);
    }
  };

  const handleRenameSubmit = (id: string) => {
    if (editingName.trim()) {
      renameWatchlistGroup(id, editingName.trim());
      setEditingGroupId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Star className="w-6 h-6 text-[#00d09c] fill-[#00d09c]" />
            <span>My Watchlists</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize equities into tailored lists, monitor real-time ticks, and set instant target price alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddStockOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 text-xs font-black transition-all shadow-md shadow-[#00d09c]/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock to List</span>
          </button>
        </div>
      </div>

      {/* Watchlist Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {watchlistGroups.map((group) => {
          const isActive = group.id === activeWatchlistId;
          const isEditing = editingGroupId === group.id;

          if (isEditing) {
            return (
              <div key={group.id} className="flex items-center gap-1">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-emerald-500 bg-slate-100 dark:bg-[#111622] text-xs font-bold w-36"
                  autoFocus
                />
                <button
                  onClick={() => handleRenameSubmit(group.id)}
                  className="p-1 rounded-md text-emerald-500 hover:bg-emerald-500/10"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingGroupId(null)}
                  className="p-1 rounded-md text-slate-400 hover:bg-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          }

          return (
            <div
              key={group.id}
              className={`flex items-center rounded-xl transition-all ${
                isActive
                  ? 'bg-[#00d09c] text-slate-950 font-black shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold'
              }`}
            >
              <button
                onClick={() => setActiveWatchlistId(group.id)}
                className="px-3 py-2 text-xs whitespace-nowrap flex items-center gap-1.5"
              >
                <span>{group.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-slate-950/15' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  {group.symbols.length}
                </span>
              </button>

              {isActive && (
                <div className="flex items-center pr-2 gap-1">
                  <button
                    onClick={() => {
                      setEditingGroupId(group.id);
                      setEditingName(group.name);
                    }}
                    className="p-1 rounded-md hover:bg-slate-950/10 text-slate-800"
                    title="Rename watchlist"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {watchlistGroups.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete watchlist "${group.name}"?`)) {
                          deleteWatchlistGroup(group.id);
                        }
                      }}
                      className="p-1 rounded-md hover:bg-slate-950/10 text-slate-800"
                      title="Delete watchlist"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isCreatingGroup ? (
          <form onSubmit={handleCreateGroupSubmit} className="flex items-center gap-1 ml-2">
            <input
              type="text"
              placeholder="Watchlist Name..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-[#00d09c] bg-white dark:bg-[#111622] text-xs font-bold w-36 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="px-2.5 py-1.5 bg-[#00d09c] text-slate-950 font-black rounded-xl text-xs"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingGroup(false)}
              className="p-1 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsCreatingGroup(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 whitespace-nowrap hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New List</span>
          </button>
        )}
      </div>

      {/* Active Watchlist Table */}
      {activeStocks.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold">This Watchlist is Empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Add your favourite NSE / BSE equities to monitor prices in real time.
          </p>
          <button
            onClick={() => setIsAddStockOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#00d09c] text-slate-950 font-black text-xs"
          >
            Add Stocks Now
          </button>
        </div>
      ) : (
        <div
          className={`rounded-3xl border overflow-hidden ${
            theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-50/50 dark:bg-[#0b0e14]/50">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Company / Symbol</th>
                  <th className="py-3.5 px-4 font-bold text-right">Market Price (₹)</th>
                  <th className="py-3.5 px-4 font-bold text-right">1D Change</th>
                  <th className="py-3.5 px-4 font-bold text-center">Day Range (L - H)</th>
                  <th className="py-3.5 px-4 font-bold text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {activeStocks.map((stock) => {
                  const isUp = stock.change >= 0;
                  const prev = previousPriceMap[stock.symbol];
                  const flashGreen = prev !== undefined && stock.currentPrice > prev;
                  const flashRed = prev !== undefined && stock.currentPrice < prev;

                  return (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-slate-50 dark:hover:bg-[#111622]/60 transition-colors group cursor-pointer"
                      onClick={() => navigateTo('stock-details', stock.symbol)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800 flex items-center justify-center font-black text-[11px] text-slate-700 dark:text-slate-300">
                            {stock.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-black text-slate-900 dark:text-white group-hover:text-[#00d09c] transition-colors block">
                              {stock.symbol}
                            </span>
                            <span className="text-[11px] text-slate-400 line-clamp-1">{stock.name}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-black text-sm transition-all duration-300 ${
                            flashGreen
                              ? 'text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md'
                              : flashRed
                              ? 'text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {formatINR(stock.currentPrice)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-bold flex items-center justify-end gap-0.5 ${
                            isUp ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                          }`}
                        >
                          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {isUp ? '+' : ''}
                          {stock.change.toFixed(2)} ({formatPercent(stock.changePercent)})
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="text-slate-400 text-[11px]">
                          {formatINR(stock.lowPrice)} - {formatINR(stock.highPrice)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Alert button */}
                          <button
                            onClick={() => setAlertStock(stock)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-400 text-slate-400 hover:text-amber-400 transition-colors"
                            title="Set Price Alert"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Buy */}
                          <button
                            onClick={() => openOrderModal(stock, 'BUY')}
                            className="px-2.5 py-1 rounded-lg bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-[11px] transition-all shadow-xs"
                          >
                            BUY
                          </button>

                          {/* Quick Sell */}
                          <button
                            onClick={() => openOrderModal(stock, 'SELL')}
                            className="px-2.5 py-1 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-bold text-[11px] transition-all"
                          >
                            SELL
                          </button>

                          {/* Remove from this group */}
                          <button
                            onClick={() => removeStockFromGroup(activeGroup.id, stock.symbol)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Remove from watchlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* ADD STOCKS MODAL */}
      {isAddStockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 ${
              theme === 'dark' ? 'bg-[#111622] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black">Add to {activeGroup.name}</h3>
                <p className="text-xs text-slate-400">Search NSE/BSE equities</p>
              </div>
              <button
                onClick={() => setIsAddStockOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search symbol or name..."
                value={stockSearchQuery}
                onChange={(e) => setStockSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0b0e14] text-xs font-bold focus:outline-none focus:border-[#00d09c]"
                autoFocus
              />
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {unaddedStocks.map((st) => (
                <div
                  key={st.symbol}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800 hover:border-[#00d09c] transition-colors"
                >
                  <div>
                    <span className="font-black text-xs block">{st.symbol}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{st.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-xs">{formatINR(st.currentPrice)}</span>
                    <button
                      onClick={() => {
                        addStockToGroup(activeGroup.id, st.symbol);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-all shadow-xs"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRICE ALERT MODAL */}
      {alertStock && (
        <PriceAlertModal
          stock={alertStock}
          isOpen={true}
          onClose={() => setAlertStock(null)}
        />
      )}
    </div>
  );
};
