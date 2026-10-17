import React, { useState, useMemo } from 'react';
import { useTrade } from '../../context/TradeContext';
import { Stock } from '../../types';
import { formatINR } from '../../services/api';
import { PnLMovementIndicator } from '../PnLMovementIndicator';
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

export const GrowwTopMoversTable: React.FC = () => {
  const { stocks, setSelectedSymbol, navigateTo, openOrderModal, theme } = useTrade();
  const [moverType, setMoverType] = useState<'gainers' | 'losers' | 'volume'>('gainers');
  const [indexFilter, setIndexFilter] = useState<'NIFTY 100' | 'NIFTY 50' | 'NIFTY 500'>('NIFTY 100');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Filter & sort stocks based on moverType
  const sortedStocks = useMemo(() => {
    let list = [...stocks];

    if (moverType === 'gainers') {
      list.sort((a, b) => b.changePercent - a.changePercent);
    } else if (moverType === 'losers') {
      list.sort((a, b) => a.changePercent - b.changePercent);
    } else if (moverType === 'volume') {
      list.sort((a, b) => b.volume - a.volume);
    }

    return showAll ? list : list.slice(0, 6);
  }, [stocks, moverType, showAll]);

  const handleStockClick = (symbol: string) => {
    setSelectedSymbol(symbol);
    navigateTo('stock-details', symbol);
  };

  // Helper to get mini sparkline SVG path
  const renderSparkline = (stk: Stock) => {
    const isPos = stk.change >= 0;
    const trend = stk.historicalTrend && stk.historicalTrend.length > 1 ? stk.historicalTrend : [10, 12, 11, 15, 14, 16];
    const minVal = Math.min(...trend);
    const maxVal = Math.max(...trend);
    const range = maxVal - minVal || 1;
    const points = trend
      .map((val, i) => {
        const x = (i / (trend.length - 1)) * 50;
        const y = 14 - ((val - minVal) / range) * 12;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg className="w-12 h-4 overflow-visible shrink-0" viewBox="0 0 50 16">
        <polyline
          points={points}
          fill="none"
          stroke={isPos ? '#00d09c' : '#f43f5e'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div
      className={`rounded-2xl border transition-all ${
        theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}
    >
      {/* Table Header Controls matching PDF */}
      <div className="p-4 sm:p-5 pb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h3 className="text-base font-extrabold tracking-tight">Top movers today</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Filter Pills: Gainers | Losers | Volume shockers */}
          <div className="flex rounded-xl p-0.5 border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 text-xs font-bold">
            <button
              onClick={() => setMoverType('gainers')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                moverType === 'gainers'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Gainers
            </button>
            <button
              onClick={() => setMoverType('losers')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                moverType === 'losers'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Losers
            </button>
            <button
              onClick={() => setMoverType('volume')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                moverType === 'volume'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Volume shockers
            </button>
          </div>

          {/* Index Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{indexFilter}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {dropdownOpen && (
              <div
                className={`absolute right-0 mt-1 w-32 rounded-xl shadow-xl border py-1 z-30 ${
                  theme === 'dark' ? 'bg-[#1a1f2c] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                {(['NIFTY 100', 'NIFTY 50', 'NIFTY 500'] as const).map((idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIndexFilter(idx);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-[#00d09c]/10 transition-colors ${
                      indexFilter === idx ? 'text-[#00d09c] font-bold' : ''
                    }`}
                  >
                    {idx}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table matching PDF columns: Company | Market price (1D) | Volume */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase">
              <th className="py-3 px-4 sm:px-5">Company</th>
              <th className="py-3 px-4 text-right">Market price (1D)</th>
              <th className="py-3 px-4 sm:px-5 text-right">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {sortedStocks.map((stk) => {
              const isPos = stk.change >= 0;
              return (
                <tr
                  key={stk.symbol}
                  onClick={() => handleStockClick(stk.symbol)}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group`}
                >
                  {/* Company */}
                  <td className="py-3 px-4 sm:px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-300 shrink-0">
                        {stk.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-[#00d09c] transition-colors">
                          {stk.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-semibold">{stk.symbol}</div>
                      </div>
                    </div>
                  </td>

                  {/* Market price (1D) with Sparkline */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {renderSparkline(stk)}

                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          <PnLMovementIndicator
                            currentPrice={stk.currentPrice}
                            symbol={stk.symbol}
                            formatValue={(v) => formatINR(v)}
                          />
                        </div>
                        <div
                          className={`text-[11px] font-bold ${
                            isPos ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                          }`}
                        >
                          {isPos ? '+' : ''}
                          {stk.change.toFixed(2)} ({isPos ? '+' : ''}
                          {stk.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Volume (Indian format) */}
                  <td className="py-3 px-4 sm:px-5 text-right font-mono font-medium text-slate-600 dark:text-slate-300">
                    {stk.volume.toLocaleString('en-IN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer "See more >" */}
      <div className="p-3 sm:p-4 text-center border-t border-slate-100 dark:border-slate-800/80">
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs font-bold text-[#00b386] dark:text-[#00d09c] hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
        >
          <span>{showAll ? 'Show less' : 'See more'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
