import React, { useState, useMemo } from 'react';
import { useTrade } from '../context/TradeContext';
import { Stock } from '../types';
import { formatINR, formatPercent } from '../services/api';
import { PnLMovementIndicator } from '../components/PnLMovementIndicator';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';

export const MarketsPage: React.FC = () => {
  const { stocks, setSelectedSymbol, navigateTo, openOrderModal, theme, watchlist, toggleWatchlist, previousPriceMap } =
    useTrade();
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [sortBy, setSortBy] = useState<'default' | 'gainers' | 'losers' | 'price-high' | 'price-low'>('default');

  const sectors = [
    'All',
    'Banking & Finance',
    'Information Technology',
    'Automotive & EV',
    'Energy & Telecom',
    'FMCG & Agri',
    'Consumer Tech'
  ];

  const filteredStocks = useMemo(() => {
    let list = stocks.filter((s) => {
      const matchSearch =
        s.symbol.toLowerCase().includes(search.toLowerCase()) ||
        s.name.toLowerCase().includes(search.toLowerCase());
      const matchSector =
        selectedSector === 'All' ||
        s.sector.includes(selectedSector) ||
        (selectedSector === 'Banking & Finance' && s.sector.includes('Banking'));
      return matchSearch && matchSector;
    });

    if (sortBy === 'gainers') {
      list.sort((a, b) => b.changePercent - a.changePercent);
    } else if (sortBy === 'losers') {
      list.sort((a, b) => a.changePercent - b.changePercent);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.currentPrice - a.currentPrice);
    } else if (sortBy === 'price-low') {
      list.sort((a, b) => a.currentPrice - b.currentPrice);
    }

    return list;
  }, [stocks, search, selectedSector, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Explore Indian Stocks</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time simulated pricing across NSE large-cap and growth stocks with continuous volatility
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-black text-[#00b386] dark:text-[#00d09c] bg-[#00d09c]/10 border border-[#00d09c]/25 px-3.5 py-1.5 rounded-full w-fit">
          <Zap className="w-3.5 h-3.5" />
          <span>Continuous Indian Market Simulation</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              id="markets-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stocks by name or ticker (e.g. RELIANCE, TCS, ZOMATO)..."
              className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#00d09c] ${
                theme === 'dark'
                  ? 'bg-[#0c0f17] border border-slate-800 text-white placeholder-slate-500'
                  : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              id="markets-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#00d09c] ${
                theme === 'dark'
                  ? 'bg-[#0c0f17] border border-slate-800 text-white'
                  : 'bg-slate-50 border border-slate-200 text-slate-900'
              }`}
            >
              <option value="default">Default Ranking</option>
              <option value="gainers">Top Gainers (%)</option>
              <option value="losers">Top Losers (%)</option>
              <option value="price-high">Highest Price</option>
              <option value="price-low">Lowest Price</option>
            </select>
          </div>
        </div>

        {/* Sector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {sectors.map((sec) => (
            <button
              key={sec}
              id={`sector-${sec.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1.5 text-xs rounded-xl shrink-0 transition-all font-bold ${
                selectedSector === sec
                  ? 'bg-[#00d09c] text-slate-950 font-black'
                  : theme === 'dark'
                  ? 'bg-[#0c0f17] border border-slate-800 text-slate-400 hover:text-white'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStocks.map((stock) => {
          const isUp = stock.change >= 0;
          const isWatched = watchlist.includes(stock.symbol);

          return (
            <div
              key={stock.symbol}
              className={`rounded-3xl p-5 transition-all hover:-translate-y-0.5 flex flex-col justify-between group border ${
                theme === 'dark'
                  ? 'bg-[#151922] border-slate-800/90 hover:border-slate-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md'
              }`}
            >
              <div>
                {/* Top Stock Meta */}
                <div className="flex items-start justify-between">
                  <div
                    onClick={() => {
                      setSelectedSymbol(stock.symbol);
                      navigateTo('stock-details', stock.symbol);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black group-hover:text-[#00d09c] transition-colors">
                        {stock.symbol}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {stock.exchange}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px] mt-0.5">
                      {stock.name}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(stock.symbol);
                    }}
                    className={`p-2 rounded-xl transition-colors ${
                      isWatched
                        ? 'text-amber-500 bg-amber-400/10'
                        : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    <Star className={`w-4 h-4 ${isWatched ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                {/* Price & Change */}
                <div
                  onClick={() => {
                    setSelectedSymbol(stock.symbol);
                    navigateTo('stock-details', stock.symbol);
                  }}
                  className="mt-4 flex items-center justify-between cursor-pointer"
                >
                  <PnLMovementIndicator
                    currentPrice={stock.currentPrice}
                    previousPrice={previousPriceMap[stock.symbol]}
                    symbol={stock.symbol}
                    className="text-lg"
                  />
                  <div
                    className={`flex items-center gap-1 text-xs font-bold ${
                      isUp ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                    }`}
                  >
                    {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>
                      {isUp ? '+' : ''}
                      {formatINR(stock.change)} ({formatPercent(stock.changePercent)})
                    </span>
                  </div>
                </div>

                {/* Sector tag */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{stock.sector}</span>
                  <span>Vol: {stock.volume ? (stock.volume / 100000).toFixed(1) + 'L' : '12.4L'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => openOrderModal(stock, 'BUY')}
                  className="flex-1 py-2 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-colors shadow-xs"
                >
                  Buy
                </button>
                <button
                  onClick={() => openOrderModal(stock, 'SELL')}
                  className="flex-1 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-black text-xs transition-colors"
                >
                  Sell
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
