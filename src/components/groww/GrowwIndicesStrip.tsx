import React from 'react';
import { useTrade } from '../../context/TradeContext';
import { LiveIndexQuote } from '../../types';
import { TrendingUp, TrendingDown, RefreshCw, Radio } from 'lucide-react';

export const GrowwIndicesStrip: React.FC = () => {
  const {
    liveIndices,
    liveMarketStatus,
    isAutoUpdating,
    toggleAutoUpdate,
    syncMarketNow,
    navigateToIndex,
    theme
  } = useTrade();

  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncMarketNow();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const getIndexRouteKey = (symbol: string) => {
    if (symbol.includes('NSEI') || symbol.includes('NIFTY 50') || symbol === 'NIFTY') return 'nifty-50';
    if (symbol.includes('BSESN') || symbol.includes('SENSEX')) return 'sensex';
    if (symbol.includes('BANK') || symbol.includes('NSEBANK')) return 'bank-nifty';
    return 'midcap-100';
  };

  return (
    <div className="space-y-2.5">
      {/* Real-Time Market Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-3.5" />
            <span>Live Market Feed</span>
            <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
              ({liveMarketStatus?.source || 'Yahoo Finance Live API'})
            </span>
          </div>

          <button
            onClick={toggleAutoUpdate}
            title="Toggle live ticks auto-update"
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
              isAutoUpdating
                ? 'bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] border-[#00d09c]/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
            }`}
          >
            {isAutoUpdating ? '⚡ Auto-Update: ON (2.5s)' : '⏸ Auto-Update: Paused'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#00d09c]' : ''}`} />
            <span>Sync Now</span>
          </button>
        </div>
      </div>

      {/* 4 Indices Cards from PDF: NIFTY 50, SENSEX, BANKNIFTY, MIDCPNIFTY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {liveIndices.map((idx) => {
          const isPos = idx.change >= 0;
          const routeKey = getIndexRouteKey(idx.symbol);

          // Build SVG path from sparkline points
          const sparkline = idx.sparkline && idx.sparkline.length > 1 ? idx.sparkline : [10, 12, 11, 14, 13, 15];
          const minVal = Math.min(...sparkline);
          const maxVal = Math.max(...sparkline);
          const range = maxVal - minVal || 1;
          const points = sparkline
            .map((val, i) => {
              const x = (i / (sparkline.length - 1)) * 100;
              const y = 18 - ((val - minVal) / range) * 16;
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <button
              key={idx.symbol}
              type="button"
              id={`index-card-${idx.name.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => navigateToIndex(routeKey)}
              className={`p-3.5 rounded-2xl border text-left transition-all hover:border-[#00d09c] hover:shadow-md active:scale-[0.98] cursor-pointer group ${
                theme === 'dark'
                  ? 'bg-[#151922] border-slate-800'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold tracking-tight group-hover:text-[#00d09c] transition-colors">
                  {idx.name}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isPos
                      ? 'bg-[#00d09c]/10 text-[#00b386] dark:text-[#00d09c]'
                      : 'bg-rose-500/10 text-rose-500'
                  }`}
                >
                  {isPos ? '+' : ''}
                  {idx.changePercent.toFixed(2)}%
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight">
                  {idx.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span
                  className={`text-xs font-bold flex items-center ${
                    isPos ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                  }`}
                >
                  {isPos ? (
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  )}
                  {isPos ? '+' : ''}
                  {idx.change.toFixed(2)}
                </span>
              </div>

              {/* Dynamic Live Sparkline SVG */}
              <div className="mt-2 h-5 w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 20">
                  <polyline
                    points={points}
                    fill="none"
                    stroke={isPos ? '#00d09c' : '#f43f5e'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
