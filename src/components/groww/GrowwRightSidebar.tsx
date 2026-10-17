import React from 'react';
import { useTrade } from '../../context/TradeContext';
import { formatINR } from '../../services/api';
import { PnLMovementIndicator } from '../PnLMovementIndicator';
import {
  Lock,
  ChevronRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Briefcase,
  PieChart,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  Activity,
  Award,
  Zap
} from 'lucide-react';

interface Props {
  onOpenPdfStatement: () => void;
}

export const GrowwRightSidebar: React.FC<Props> = ({ onOpenPdfStatement }) => {
  const { user, wallet, portfolio, navigateTo, theme } = useTrade();

  const summary = portfolio?.summary || {
    totalInvested: 0,
    currentValue: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    oneDayPnL: 0,
    oneDayPnLPercent: 0,
    holdingsCount: 0,
    availableVirtualCash: wallet?.balance || 0
  };

  const hasInvestments = (portfolio?.holdings?.length || 0) > 0;

  return (
    <div className="space-y-4">
      {/* 1. Attention required! Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border relative overflow-hidden transition-all ${
          theme === 'dark'
            ? 'bg-[#151922] border-slate-800'
            : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
              Attention required!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Complete setting up your account to start investing with live market data on Groww.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            id="sidebar-complete-setup-btn"
            onClick={() => navigateTo('profile')}
            className="w-full py-2 px-3 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-all text-center cursor-pointer shadow-xs active:scale-98"
          >
            COMPLETE SETUP
          </button>
        </div>
      </div>

      {/* 2. Your investments Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#00d09c]" />
            <h4 className="text-sm font-extrabold tracking-tight">Your investments</h4>
          </div>
          <button
            onClick={() => navigateTo('portfolio')}
            className="text-xs font-bold text-[#00b386] dark:text-[#00d09c] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {hasInvestments ? (
          <div className="mt-3.5 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Returns</span>
              <div
                className={`text-sm font-black font-mono flex items-center ${
                  summary.totalPnL >= 0 ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                }`}
              >
                {summary.totalPnL >= 0 ? '+' : ''}
                {formatINR(summary.totalPnL)}
                <span className="text-xs ml-1 font-semibold">({summary.totalPnLPercent.toFixed(2)}%)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">Current Value</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {formatINR(summary.currentValue)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Invested</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {formatINR(summary.totalInvested)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">1D Returns</span>
              <span
                className={`font-bold font-mono text-xs ${
                  summary.oneDayPnL >= 0 ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                }`}
              >
                {summary.oneDayPnL >= 0 ? '+' : ''}
                {formatINR(summary.oneDayPnL)}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-5 text-center space-y-2.5">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-[#00d09c]">
              <Briefcase className="w-7 h-7 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">You haven't invested yet</p>
              <p className="text-xs text-slate-400 mt-0.5">Explore real-time Indian stocks and begin trading</p>
            </div>
            <button
              onClick={() => navigateTo('markets')}
              className="px-4 py-1.5 rounded-xl bg-[#00d09c] text-slate-950 hover:bg-[#00b386] text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              Explore Stocks
            </button>
          </div>
        )}

        {/* Action button to open PDF Statement */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onOpenPdfStatement}
            className="w-full py-2 px-3 rounded-xl border border-dashed border-[#00d09c]/60 text-[#00b386] dark:text-[#00d09c] hover:bg-[#00d09c]/10 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Download PDF Statement</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Products & Tools (8 tiles from PDF) */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-sm font-extrabold tracking-tight">Products & tools</h4>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          {/* IPO (11 open) */}
          <button
            onClick={() => navigateTo('investment')}
            className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-[#00d09c] text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                11 open
              </span>
            </div>
            <div className="mt-2 font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#00d09c]">
              IPO
            </div>
          </button>

          {/* Bonds (1 open) */}
          <button
            onClick={() => navigateTo('investment')}
            className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-[#00d09c] text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Award className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                1 open
              </span>
            </div>
            <div className="mt-2 font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#00d09c]">
              Bonds
            </div>
          </button>

          {/* ETFs */}
          <button
            onClick={() => navigateTo('markets')}
            className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-[#00d09c] text-left transition-colors cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
              <PieChart className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#00d09c]">
              ETFs
            </div>
          </button>

          {/* Intraday Screener */}
          <button
            onClick={() => navigateTo('markets')}
            className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-[#00d09c] text-left transition-colors cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#00d09c]">
              Intraday Screener
            </div>
          </button>

          {/* Stocks SIP */}
          <button
            onClick={() => navigateTo('investment')}
            className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-[#00d09c] text-left transition-colors cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#00d09c]">
              Stocks SIP
            </div>
          </button>

          {/* MTF stocks */}
          <button
            onClick={() => navigateTo('markets')}
            className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-[#00d09c] text-left transition-colors cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#00d09c]">
              MTF stocks
            </div>
          </button>

          {/* Events calendar */}
          <button
            onClick={() => navigateTo('news')}
            className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-[#00d09c] text-left transition-colors cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#00d09c]">
              Events calendar
            </div>
          </button>

          {/* All Stocks screener */}
          <button
            onClick={() => navigateTo('markets')}
            className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-[#00d09c] text-left transition-colors cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#00d09c]">
              All Stocks
            </div>
          </button>
        </div>
      </div>

      {/* 4. Trading screens (Technical Analysis Cards from PDF) */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-sm font-extrabold tracking-tight">Trading screens</h4>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
          {/* Resistance breakouts */}
          <div
            onClick={() => navigateTo('markets')}
            className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 -mx-2 px-2 rounded-xl transition-colors group"
          >
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#00d09c] transition-colors">
                Resistance breakouts
              </div>
              <span className="text-[11px] font-bold text-[#00b386] dark:text-[#00d09c]">Bullish</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-14 h-6 text-[#00d09c]" viewBox="0 0 60 24" fill="none">
                <line x1="0" y1="12" x2="60" y2="12" stroke="#94a3b8" strokeDasharray="2 2" strokeWidth="1" />
                <path d="M2 18 L18 15 L32 17 L44 8 L58 4" stroke="#00d09c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00d09c] transition-colors" />
            </div>
          </div>

          {/* MACD above signal line */}
          <div
            onClick={() => navigateTo('markets')}
            className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 -mx-2 px-2 rounded-xl transition-colors group"
          >
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#00d09c] transition-colors">
                MACD above signal line
              </div>
              <span className="text-[11px] font-bold text-[#00b386] dark:text-[#00d09c]">Bullish</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-14 h-6" viewBox="0 0 60 24" fill="none">
                <path d="M2 18 Q20 20 30 12 T58 4" stroke="#00d09c" strokeWidth="1.75" fill="none" />
                <path d="M2 15 Q20 16 30 14 T58 10" stroke="#f43f5e" strokeWidth="1.25" strokeDasharray="1.5 1.5" fill="none" />
              </svg>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00d09c] transition-colors" />
            </div>
          </div>

          {/* RSI overbought */}
          <div
            onClick={() => navigateTo('markets')}
            className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 -mx-2 px-2 rounded-xl transition-colors group"
          >
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-rose-500 transition-colors">
                RSI overbought
              </div>
              <span className="text-[11px] font-bold text-rose-500">Bearish</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-14 h-6" viewBox="0 0 60 24" fill="none">
                <line x1="0" y1="8" x2="60" y2="8" stroke="#f43f5e" strokeDasharray="2 2" strokeWidth="1" strokeOpacity="0.4" />
                <path d="M2 18 L16 16 L28 14 L42 6 L58 5" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
            </div>
          </div>

          {/* RSI oversold */}
          <div
            onClick={() => navigateTo('markets')}
            className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 -mx-2 px-2 rounded-xl transition-colors group"
          >
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#00d09c] transition-colors">
                RSI oversold
              </div>
              <span className="text-[11px] font-bold text-[#00b386] dark:text-[#00d09c]">Bullish</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-14 h-6" viewBox="0 0 60 24" fill="none">
                <line x1="0" y1="16" x2="60" y2="16" stroke="#00d09c" strokeDasharray="2 2" strokeWidth="1" strokeOpacity="0.4" />
                <path d="M2 8 L18 12 L30 20 L44 19 L58 14" stroke="#00d09c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00d09c] transition-colors" />
            </div>
          </div>
        </div>

        {/* Intraday Screener Link */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2 text-center">
          <button
            onClick={() => navigateTo('markets')}
            className="text-xs font-bold text-[#00b386] dark:text-[#00d09c] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Intraday screener</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
