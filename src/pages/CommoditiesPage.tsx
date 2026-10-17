import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrade } from '../context/TradeContext';
import { formatINR } from '../services/api';
import { Stock } from '../types';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  PlusCircle,
  Coins,
  Scale,
  Award,
  Lock,
  ChevronRight,
  Info
} from 'lucide-react';

export const CommoditiesPage: React.FC = () => {
  const { stocks, openOrderModal, setSelectedSymbol, navigateTo, theme, portfolio } = useTrade();

  const [activeCategory, setActiveCategory] = useState<'ALL' | 'GOLD' | 'SILVER'>('ALL');
  const [quickGramMode, setQuickGramMode] = useState<Record<string, number>>({
    GOLD24K: 1,
    SILVER1KG: 10
  });

  // Commodity stocks filter
  const commodityStocks = useMemo(() => {
    return stocks.filter(
      (s) =>
        s.category === 'COMMODITY' ||
        s.symbol.includes('GOLD') ||
        s.symbol.includes('SILVER')
    );
  }, [stocks]);

  const filteredCommodities = useMemo(() => {
    if (activeCategory === 'ALL') return commodityStocks;
    if (activeCategory === 'GOLD') return commodityStocks.filter((s) => s.symbol.includes('GOLD'));
    return commodityStocks.filter((s) => s.symbol.includes('SILVER'));
  }, [commodityStocks, activeCategory]);

  // Check user's commodity holdings
  const userCommodityHoldings = useMemo(() => {
    if (!portfolio?.holdings) return [];
    const commoditySymbols = new Set(commodityStocks.map((s) => s.symbol));
    return portfolio.holdings.filter((h) => commoditySymbols.has(h.symbol));
  }, [portfolio, commodityStocks]);

  const totalCommodityInvestment = userCommodityHoldings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCommodityPnL = userCommodityHoldings.reduce((sum, h) => sum + h.unrealizedPnl, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28 md:pb-12">
      {/* Hero Commodity Banner */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 relative overflow-hidden transition-all shadow-sm ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-[#1c180d] via-[#151922] to-[#0c0f17] border-amber-500/20'
            : 'bg-gradient-to-br from-amber-50/70 via-white to-slate-50 border-amber-200'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400/15 text-amber-400 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MCX Live Bullion Market • 24K 99.9% Purity</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Gold & Silver Trading Sessions
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Invest in digital 24 Karat pure Gold and Silver with 100% insured vault backing by MMTC-PAMP.
              Zero storage fees, live market rates, and instant liquidity.
            </p>
          </div>

          {/* User Commodity Portfolio Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0e14]/80 border border-amber-500/30 text-xs space-y-3 shrink-0 min-w-[240px]">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Your Bullion Portfolio
            </span>
            <div>
              <div className="text-2xl font-black text-white">{formatINR(totalCommodityInvestment)}</div>
              <div
                className={`text-xs font-bold mt-0.5 flex items-center gap-1 ${
                  totalCommodityPnL >= 0 ? 'text-[#00d09c]' : 'text-rose-400'
                }`}
              >
                {totalCommodityPnL >= 0 ? '+' : ''}{formatINR(totalCommodityPnL)} ({userCommodityHoldings.length} Assets)
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>100% Insured by Brink's India</span>
            </div>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* MCX Market Session Status & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: 'ALL', label: 'All Bullion' },
            { id: 'GOLD', label: 'Gold (24K & BeES)' },
            { id: 'SILVER', label: 'Silver (1KG & BeES)' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-4 py-2 text-xs font-black rounded-2xl transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white bg-[#111622] border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* MCX Live Session Indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#111622] px-3.5 py-1.5 rounded-2xl border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-white">MCX Trading Session: 09:00 AM - 11:30 PM IST</span>
        </div>
      </div>

      {/* Commodity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCommodities.map((item) => {
          const isGold = item.symbol.includes('GOLD');
          const isUp = item.change >= 0;

          return (
            <motion.div
              layout
              key={item.symbol}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className={`rounded-3xl border p-6 flex flex-col justify-between relative overflow-hidden ${
                isGold
                  ? 'bg-gradient-to-b from-[#181510] to-[#111622] border-amber-500/30'
                  : 'bg-gradient-to-b from-[#141720] to-[#111622] border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border shadow-lg ${
                        isGold
                          ? 'bg-amber-400/20 text-amber-400 border-amber-400/40 shadow-amber-500/10'
                          : 'bg-slate-300/20 text-slate-200 border-slate-400/40 shadow-slate-500/10'
                      }`}
                    >
                      <Coins className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-white">{item.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {item.symbol}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isGold ? '99.9% 24K Pure Investment Gold' : '99.9% Pure Investment Silver'} • Demat Stored
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      isUp ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                    }`}
                  >
                    {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{isUp ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                  </span>
                </div>

                {/* Price & Weight Matrix */}
                <div className="my-5 p-4 rounded-2xl bg-[#0b0e14] border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block uppercase">
                      Live Bullion Rate
                    </span>
                    <div className="text-2xl font-black text-white tracking-tight">
                      {formatINR(item.currentPrice)}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {item.symbol === 'GOLD24K' ? 'Per 1 Gram 24K' : item.symbol === 'SILVER1KG' ? 'Per 10 Grams' : 'Per Unit ETF'}
                    </span>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-xs text-slate-400">Day's High / Low</div>
                    <div className="text-xs font-bold text-white">
                      {formatINR(item.dayHigh)} / {formatINR(item.dayLow)}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold">Live Depository Rate</div>
                  </div>
                </div>

                {/* Benefits / Guarantees */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-5">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <Award className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                    <span className="text-[11px] text-slate-300 font-semibold block">99.9% Pure</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <Lock className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                    <span className="text-[11px] text-slate-300 font-semibold block">Insured Vault</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <Scale className="w-4 h-4 mx-auto text-sky-400 mb-1" />
                    <span className="text-[11px] text-slate-300 font-semibold block">Instant Liquid</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSymbol(item.symbol);
                    navigateTo('stock-details', item.symbol);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  View Candlestick Chart
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => openOrderModal(item, 'BUY')}
                  className="flex-1 py-2.5 rounded-xl bg-[#00D09C] hover:bg-[#00b386] text-slate-950 text-xs font-black transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Buy {item.symbol}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => openOrderModal(item, 'SELL')}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  Sell
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
