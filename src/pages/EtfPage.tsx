import React, { useState, useMemo } from 'react';
import { useTrade } from '../context/TradeContext';
import { ETFS_DATA, EtfItem } from '../data/marketAssetsData';
import { formatINR, formatPercent, api } from '../services/api';
import {
  PieChart,
  Search,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Briefcase,
  X
} from 'lucide-react';

export const EtfPage: React.FC = () => {
  const { wallet, portfolio, refreshData, theme } = useTrade();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedEtf, setSelectedEtf] = useState<EtfItem | null>(null);

  // Trade Modal state
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const categories = ['All', 'Index', 'Gold & Silver', 'Sectoral', 'International'];

  const filteredEtfs = useMemo(() => {
    return ETFS_DATA.filter((etf) => {
      const matchCat = selectedCategory === 'All' || etf.category === selectedCategory;
      const matchSearch =
        etf.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        etf.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  const availableCash = wallet?.balance || 0;

  // Check if user holds this ETF in their portfolio
  const getEtfHolding = (symbol: string) => {
    return portfolio?.holdings.find((h) => h.symbol === symbol);
  };

  const handleOpenTradeModal = (etf: EtfItem, tradeSide: 'BUY' | 'SELL') => {
    setSelectedEtf(etf);
    setSide(tradeSide);
    setQuantity(tradeSide === 'BUY' ? 10 : getEtfHolding(etf.symbol)?.quantity || 1);
    setFeedback(null);
  };

  const totalOrderValue = selectedEtf ? quantity * selectedEtf.currentPrice : 0;

  const handleExecuteTrade = async () => {
    if (!selectedEtf) return;
    setFeedback(null);

    if (quantity <= 0) {
      setFeedback({ type: 'error', message: 'Enter a valid quantity.' });
      return;
    }

    if (side === 'BUY') {
      if (totalOrderValue > availableCash) {
        setFeedback({
          type: 'error',
          message: `Insufficient virtual cash. Need ${formatINR(totalOrderValue)}, available is ${formatINR(availableCash)}.`
        });
        return;
      }
    } else {
      const holding = getEtfHolding(selectedEtf.symbol);
      const owned = holding?.quantity || 0;
      if (quantity > owned) {
        setFeedback({
          type: 'error',
          message: `Insufficient units. You only hold ${owned} units of ${selectedEtf.symbol}.`
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await api.placeOrder({
        symbol: selectedEtf.symbol,
        side,
        orderType: 'MARKET',
        quantity
      });

      setFeedback({
        type: 'success',
        message: `Successfully executed ${side} order for ${quantity} units of ${selectedEtf.symbol}!`
      });

      await refreshData();
      setTimeout(() => {
        setSelectedEtf(null);
      }, 2000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Execution failed'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12">
      {/* Header Banner */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] flex items-center justify-center font-black">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Exchange Traded Funds (ETFs)</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Low-cost index, gold, sectoral, and global baskets traded like stocks in real time
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <span className="text-slate-400 block text-[10px]">Available Virtual Cash</span>
            <span className="text-sm font-black text-[#00b386] dark:text-[#00d09c]">{formatINR(availableCash)}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ETFs by symbol (e.g. NIFTYBEES, GOLDBEES)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] text-xs font-medium focus:outline-none focus:border-[#00d09c]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'bg-slate-100 dark:bg-[#151922] text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ETF Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEtfs.map((etf) => {
          const holding = getEtfHolding(etf.symbol);
          const isUp = etf.change >= 0;

          return (
            <div
              key={etf.id}
              className={`rounded-3xl border p-5 flex flex-col justify-between transition-all hover:border-[#00d09c] hover:shadow-lg group ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0c0f17] text-slate-500 dark:text-slate-400">
                    {etf.category}
                  </span>
                  {holding && holding.quantity > 0 && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c]">
                      Holdings: {holding.quantity} Units
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black group-hover:text-[#00d09c] transition-colors">{etf.symbol}</h3>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{etf.name}</p>

                {/* Live Price readout */}
                <div className="flex items-baseline justify-between my-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-xl font-black">{formatINR(etf.currentPrice)}</span>
                  <span
                    className={`text-xs font-bold flex items-center ${
                      isUp ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                    }`}
                  >
                    {isUp ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                    {isUp ? '+' : ''}
                    {etf.change.toFixed(2)} ({formatPercent(etf.changePercent)})
                  </span>
                </div>

                {/* Underlying info */}
                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-[#0b0e14] p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Underlying:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 line-clamp-1 text-right max-w-[170px]">
                      {etf.underlyingIndex}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>1Y Returns:</span>
                    <span className="font-bold text-emerald-500">+{etf.returns1Y}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Expense Ratio:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{etf.expenseRatio}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>AUM:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">₹{etf.aumCr.toLocaleString()} Cr</span>
                  </div>
                </div>

                {/* Top holdings tags */}
                <div className="mb-4">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">Top Weights</span>
                  <div className="flex flex-wrap gap-1">
                    {etf.holdings.slice(0, 3).map((h, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#111622] text-slate-600 dark:text-slate-300"
                      >
                        {h.name} ({h.weight}%)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => handleOpenTradeModal(etf, 'BUY')}
                  className="flex-1 py-2.5 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-all shadow-sm"
                >
                  BUY {etf.symbol}
                </button>
                <button
                  onClick={() => handleOpenTradeModal(etf, 'SELL')}
                  className="flex-1 py-2.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition-all"
                >
                  SELL
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* TRADE MODAL */}
      {selectedEtf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 ${
              theme === 'dark' ? 'bg-[#111622] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    side === 'BUY' ? 'bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c]' : 'bg-rose-500/15 text-rose-500'
                  }`}
                >
                  {side} ETF ORDER
                </span>
                <h3 className="text-base font-black mt-1">{selectedEtf.symbol}</h3>
                <p className="text-xs text-slate-400">Market Price: {formatINR(selectedEtf.currentPrice)}</p>
              </div>
              <button
                onClick={() => setSelectedEtf(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl border text-xs mb-4 ${
                  feedback.type === 'success'
                    ? 'bg-[#00d09c]/15 border-[#00d09c]/30 text-[#00b386] dark:text-[#00d09c]'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-500'
                }`}
              >
                {feedback.message}
              </div>
            )}

            <div className="space-y-4">
              {/* Switch side */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSide('BUY')}
                  className={`py-2 rounded-xl text-xs font-black transition-all ${
                    side === 'BUY' ? 'bg-[#00d09c] text-slate-950 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setSide('SELL')}
                  className={`py-2 rounded-xl text-xs font-black transition-all ${
                    side === 'SELL' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400'
                  }`}
                >
                  SELL
                </button>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Quantity (Units)</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0b0e14] text-sm font-bold focus:outline-none focus:border-[#00d09c]"
                />
              </div>

              {/* Price Calculation */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Total Order Value:</span>
                  <span className="font-black text-sm text-slate-900 dark:text-white">
                    {formatINR(totalOrderValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Available Balance:</span>
                  <span className="font-bold">{formatINR(availableCash)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExecuteTrade}
                disabled={isSubmitting}
                className={`w-full py-3 font-black rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 ${
                  side === 'BUY'
                    ? 'bg-[#00d09c] hover:bg-[#00b386] text-slate-950 shadow-[#00d09c]/20'
                    : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>
                    Execute {side} Order ({formatINR(totalOrderValue)})
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
