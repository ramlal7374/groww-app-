import React, { useState } from 'react';
import { useTrade } from '../context/TradeContext';
import { formatINR } from '../services/api';
import { Stock } from '../types';
import { GrowwIndicesStrip } from '../components/groww/GrowwIndicesStrip';
import { GrowwTopMoversTable } from '../components/groww/GrowwTopMoversTable';
import { GrowwRightSidebar } from '../components/groww/GrowwRightSidebar';
import { GrowwPdfFooter } from '../components/groww/GrowwPdfFooter';
import { GrowwPdfStatementModal } from '../components/GrowwPdfStatementModal';
import { PnLMovementIndicator } from '../components/PnLMovementIndicator';
import { GrowwLogo } from '../components/GrowwLogo';
import {
  FileText,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Layers,
  Award,
  PieChart,
  Zap,
  Newspaper,
  ShieldCheck,
  Search,
  ArrowUpRight,
  Terminal,
  Monitor,
  ShoppingBag,
  Building2,
  Flame,
  Shield,
  Droplets
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    stocks,
    navigateTo,
    setSelectedSymbol,
    openOrderModal,
    portfolio,
    orders,
    watchlist,
    theme
  } = useTrade();

  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'explore' | 'holdings' | 'positions' | 'orders' | 'watchlist'>('explore');

  const handleStockClick = (symbol: string) => {
    setSelectedSymbol(symbol);
    navigateTo('stock-details', symbol);
  };

  // Find specific stocks for the PDF layout (or fallback to top stocks)
  const getStockBySymbol = (sym: string, fallbackIdx: number = 0): Stock => {
    const found = stocks.find((s) => s.symbol.toUpperCase() === sym.toUpperCase());
    if (found) return found;
    return stocks[fallbackIdx] || {
      id: sym,
      symbol: sym,
      name: sym,
      exchange: 'NSE',
      sector: 'General',
      currentPrice: 100,
      previousClose: 100,
      openPrice: 100,
      highPrice: 105,
      lowPrice: 95,
      change: 0,
      changePercent: 0,
      volume: 100000,
      marketCap: 1000,
      peRatio: 20,
      beta: 1.0,
      week52High: 120,
      week52Low: 80,
      description: '',
      historicalTrend: [98, 99, 100, 102, 100]
    };
  };

  // 1. Most bought stocks on Groww (from PDF: PC Jeweller, Raymond, Anlon Healthcare, TATAGOLD)
  const mostBoughtStocks: { stock: Stock; badgeText: string; badgeColor: string }[] = [
    {
      stock: getStockBySymbol('PCJEWELLER', 0),
      badgeText: 'PCJ',
      badgeColor: 'bg-indigo-900 text-indigo-200'
    },
    {
      stock: getStockBySymbol('RAYMOND', 1),
      badgeText: 'Raymond',
      badgeColor: 'bg-rose-900 text-rose-200'
    },
    {
      stock: getStockBySymbol('ANLON', 2),
      badgeText: 'AH',
      badgeColor: 'bg-amber-800 text-amber-200'
    },
    {
      stock: getStockBySymbol('TATAGOLD', 3),
      badgeText: 'TATA',
      badgeColor: 'bg-blue-900 text-blue-200'
    }
  ];

  // 2. Most traded stocks in MTF (from PDF: Raymond, Solar Industries, Urban Company, Brainbees Solutions)
  const mtfStocks: Stock[] = [
    getStockBySymbol('RAYMOND', 1),
    getStockBySymbol('SOLARINDS', 4),
    getStockBySymbol('URBANCO', 5),
    getStockBySymbol('BRAINBEES', 6)
  ];

  // 3. Top intraday stocks (from PDF: Raymond, Zensar Technologies, Tata Invest. Corpn., Brainbees Solutions)
  const intradayStocks: Stock[] = [
    getStockBySymbol('RAYMOND', 1),
    getStockBySymbol('ZENSARTECH', 7),
    getStockBySymbol('TATAINVEST', 8),
    getStockBySymbol('BRAINBEES', 6)
  ];

  // 4. Most bought ETFs (from PDF Page 2: GOLD, SILVER, INTERNATIONAL, NIFTY 50)
  const mostBoughtEtfs = [
    { category: 'GOLD', stock: getStockBySymbol('TATAGOLD', 3) },
    { category: 'SILVER', stock: getStockBySymbol('SILVERBEES', 9) },
    { category: 'INTERNATIONAL', stock: getStockBySymbol('MON100', 10) },
    { category: 'NIFTY 50', stock: getStockBySymbol('GROWWNIFTY', 11) }
  ];

  // 5. ETFs by Groww (from PDF Page 2: Groww Nifty 50, Groww Silver, Groww Gold, Groww BFSI)
  const etfsByGroww: Stock[] = [
    getStockBySymbol('GROWWNIFTY', 11),
    {
      id: 'GROWWSILVER',
      symbol: 'GROWWSILV',
      name: 'Groww Silver ETF',
      exchange: 'NSE',
      sector: 'Commodity ETF',
      currentPrice: 94.20,
      previousClose: 95.12,
      openPrice: 95.00,
      highPrice: 95.50,
      lowPrice: 93.80,
      change: -0.92,
      changePercent: -0.97,
      volume: 450000,
      marketCap: 850,
      peRatio: 0,
      beta: 0.9,
      week52High: 110,
      week52Low: 75,
      description: 'Groww Silver ETF tracks physical silver bullion prices.',
      historicalTrend: [95, 96, 94.5, 94.2]
    },
    {
      id: 'GROWWGOLD',
      symbol: 'GROWWGOLD',
      name: 'Groww Gold ETF',
      exchange: 'NSE',
      sector: 'Commodity ETF',
      currentPrice: 14.50,
      previousClose: 14.65,
      openPrice: 14.60,
      highPrice: 14.75,
      lowPrice: 14.40,
      change: -0.15,
      changePercent: -1.02,
      volume: 820000,
      marketCap: 1200,
      peRatio: 0,
      beta: 0.8,
      week52High: 16.5,
      week52Low: 12.0,
      description: 'Groww Gold ETF tracks domestic gold bullion prices.',
      historicalTrend: [14.6, 14.7, 14.55, 14.50]
    },
    {
      id: 'GROWWBFSI',
      symbol: 'GROWWBFSI',
      name: 'Groww BFSI ETF',
      exchange: 'NSE',
      sector: 'Sectoral ETF',
      currentPrice: 58.30,
      previousClose: 58.94,
      openPrice: 58.80,
      highPrice: 59.20,
      lowPrice: 57.90,
      change: -0.64,
      changePercent: -1.09,
      volume: 310000,
      marketCap: 620,
      peRatio: 18,
      beta: 1.1,
      week52High: 65,
      week52Low: 48,
      description: 'Groww BFSI ETF invests in banking, financial services and insurance leaders.',
      historicalTrend: [59.0, 58.7, 58.5, 58.3]
    }
  ];

  // 6. Sectors Trending Today (from PDF Page 2)
  const trendingSectors = [
    { name: 'Information Technology', icon: Monitor, ratio: '99 / 147', change: 2.02, isPos: true },
    { name: 'FMCG', icon: ShoppingBag, ratio: '13 / 25', change: 0.42, isPos: true },
    { name: 'Real Estate Investment Trusts', icon: Building2, ratio: '4 / 7', change: 0.20, isPos: true },
    { name: 'Refractories', icon: Flame, ratio: '3 / 14', change: -4.82, isPos: false },
    { name: 'Defence', icon: Shield, ratio: '4 / 21', change: -4.85, isPos: false },
    { name: 'Water Distribution', icon: Droplets, ratio: '0 / 9', change: -5.57, isPos: false }
  ];

  // 6. Popular Bonds (from PDF Page 2-3)
  const popularBonds = [
    { name: "Indel Money Ltd. Aug '29", yieldRate: '11.05%', tenure: '35 months', rating: 'CRISIL A-' },
    { name: "Earlysalary Services Pvt. Ltd. Oct '28", yieldRate: '11.10%', tenure: '24 months', rating: 'CARE A-' },
    { name: "Earlysalary Services Jul '28", yieldRate: '11.10%', tenure: '21 months', rating: 'ICRA A-' },
    { name: "Dishman Carbogen Amcis Limited Jan '29", yieldRate: '11.15%', tenure: '28 months', rating: 'IND A' }
  ];

  // 7. Stocks in news today (from PDF Page 3)
  const stocksInNews = [
    {
      title: 'HCL Tech wins $500M European digital engineering contract with global enterprise',
      time: '12 mins ago',
      symbol: 'HCLTECH',
      tag: 'Contract Win'
    },
    {
      title: 'Infosys expands AI generative cloud services with enterprise partnerships',
      time: '35 mins ago',
      symbol: 'INFY',
      tag: 'AI Cloud'
    },
    {
      title: 'PC Jeweller board approves strategic debt restructuring and equity allotment',
      time: '1 hour ago',
      symbol: 'PCJEWELLER',
      tag: 'Debt Restructuring'
    },
    {
      title: 'Solar Industries secures export defence munitions order worth ₹1,200 Cr',
      time: '2 hours ago',
      symbol: 'SOLARINDS',
      tag: 'Defence Export'
    }
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Top Banner & Indian Market Indices Bar */}
      <div
        className={`border-b transition-colors py-3 sm:py-4 ${
          theme === 'dark' ? 'bg-[#0f121a] border-slate-800' : 'bg-slate-50/70 border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <GrowwIndicesStrip />
        </div>
      </div>

      {/* Groww PDF Sub-Navigation Tabs Strip */}
      <div
        className={`sticky top-16 z-30 border-b backdrop-blur-md transition-colors ${
          theme === 'dark'
            ? 'bg-[#0c0f17]/90 border-slate-800 text-slate-300'
            : 'bg-white/95 border-slate-200 text-slate-700 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <nav className="flex items-center gap-1 sm:gap-6 overflow-x-auto no-scrollbar py-2 text-xs sm:text-sm font-bold">
            <button
              onClick={() => setActiveSubTab('explore')}
              className={`py-2 px-3 relative transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'explore'
                  ? 'text-[#00d09c] font-black'
                  : 'hover:text-slate-900 dark:hover:text-white text-slate-500 dark:text-slate-400'
              }`}
            >
              Explore
              {activeSubTab === 'explore' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00d09c] rounded-full" />
              )}
            </button>

            <button
              onClick={() => navigateTo('portfolio')}
              className="py-2 px-3 relative transition-colors cursor-pointer whitespace-nowrap text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
            >
              <span>Holdings</span>
              {(portfolio?.holdings?.length || 0) > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] font-bold">
                  {portfolio?.holdings?.length}
                </span>
              )}
            </button>

            <button
              onClick={() => navigateTo('portfolio')}
              className="py-2 px-3 relative transition-colors cursor-pointer whitespace-nowrap text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Positions
            </button>

            <button
              onClick={() => navigateTo('orders')}
              className="py-2 px-3 relative transition-colors cursor-pointer whitespace-nowrap text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
            >
              <span>Orders</span>
              {orders.filter((o) => o.status === 'PENDING').length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                  {orders.filter((o) => o.status === 'PENDING').length}
                </span>
              )}
            </button>

            <button
              onClick={() => navigateTo('watchlists')}
              className="py-2 px-3 relative transition-colors cursor-pointer whitespace-nowrap text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
            >
              <span>Watchlist</span>
              {watchlist.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                  {watchlist.length}
                </span>
              )}
            </button>
          </nav>

          {/* Right Subnav Controls: Terminal & PDF Statement matching Groww */}
          <div className="flex items-center gap-2 shrink-0 py-1">
            <button
              id="subnav-terminal-btn"
              onClick={() => navigateTo('markets')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 hover:border-[#00d09c] text-slate-700 dark:text-slate-200 hover:text-[#00d09c] transition-all cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-[#00d09c]" />
              <span className="hidden sm:inline">Terminal</span>
            </button>
            <button
              id="export-pdf-statement-btn"
              onClick={() => setPdfModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#00d09c] hover:bg-[#00b386] transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">P&L & PDF Statement</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Layout (70% Left, 30% Right Sidebar) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ================= LEFT MAIN AREA (8 Cols) ================= */}
          <div className="lg:col-span-8 space-y-7">
            {/* ⚡ NEW: EV Energy Stock Terminal Hero Banner */}
            <div
              onClick={() => navigateTo('ev-energy-stock')}
              className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#0c2217] via-[#0f2d20] to-[#0a1622] border-2 border-emerald-500/40 hover:border-emerald-400 shadow-xl shadow-emerald-500/10 cursor-pointer transition-all hover:scale-[1.01] group relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 fill-current animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                        New Launch
                      </span>
                      <span className="text-[11px] font-bold text-emerald-300">
                        1 - 2 Hour Short-Cycle Grid
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                      EV Energy Stock Terminal
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xl">
                      Trade electric vehicle power grid nodes with fixed tiers: ₹1,000, ₹2,000, ₹3,000, ₹5,000 to ₹50,000. Rapid 1h-2h settlement cycle.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button className="px-4 py-2 rounded-xl bg-emerald-500 group-hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-500/20">
                    <span>Trade EV Energy</span>
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            {/* 1. Most bought stocks on Groww */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold tracking-tight">
                  Most bought stocks on Groww
                </h3>
                <button
                  onClick={() => navigateTo('markets')}
                  className="text-xs font-bold text-[#00b386] dark:text-[#00d09c] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>See more</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 4 Cards: PC Jeweller, Raymond, Anlon Healthcare, TATAGOLD */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {mostBoughtStocks.map(({ stock, badgeText, badgeColor }) => {
                  const isPos = stock.change >= 0;
                  return (
                    <button
                      key={stock.symbol}
                      onClick={() => handleStockClick(stock.symbol)}
                      className={`p-3.5 rounded-2xl border text-left transition-all hover:border-[#00d09c] hover:shadow-md cursor-pointer group active:scale-[0.98] ${
                        theme === 'dark'
                          ? 'bg-[#151922] border-slate-800'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      {/* Logo Badge */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${badgeColor} mb-2.5 shadow-xs`}
                      >
                        {badgeText}
                      </div>

                      <div className="font-bold text-xs sm:text-sm truncate text-slate-900 dark:text-white group-hover:text-[#00d09c] transition-colors">
                        {stock.name}
                      </div>

                      <div className="mt-2 text-sm sm:text-base font-black font-mono">
                        <PnLMovementIndicator
                          currentPrice={stock.currentPrice}
                          symbol={stock.symbol}
                          formatValue={(v) => formatINR(v)}
                        />
                      </div>

                      <div
                        className={`text-[11px] font-bold mt-0.5 flex items-center ${
                          isPos ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                        }`}
                      >
                        {isPos ? (
                          <TrendingUp className="w-3 h-3 mr-0.5" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-0.5" />
                        )}
                        {isPos ? '+' : ''}
                        {stock.change.toFixed(2)} ({isPos ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%)
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Top movers today (Table with HCL Tech, Infosys, TCS, Tech M, LTM, Wipro) */}
            <GrowwTopMoversTable />

            {/* 3. Most traded stocks in MTF (from PDF) */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold tracking-tight">
                  Most traded stocks in MTF
                </h3>
                <button
                  onClick={() => navigateTo('markets')}
                  className="text-xs font-bold text-[#00b386] dark:text-[#00d09c] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>See more</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 4 Cards: Raymond, Solar Ind, Urban Company, Brainbees */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {mtfStocks.map((stk) => {
                  const isPos = stk.change >= 0;
                  return (
                    <button
                      key={stk.symbol}
                      onClick={() => handleStockClick(stk.symbol)}
                      className={`p-3.5 rounded-2xl border text-left transition-all hover:border-[#00d09c] hover:shadow-md cursor-pointer group active:scale-[0.98] ${
                        theme === 'dark'
                          ? 'bg-[#151922] border-slate-800'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-300 mb-2">
                        {stk.symbol.slice(0, 3)}
                      </div>

                      <div className="font-bold text-xs sm:text-sm truncate text-slate-900 dark:text-white group-hover:text-[#00d09c] transition-colors">
                        {stk.name}
                      </div>

                      <div className="mt-2 text-sm sm:text-base font-black font-mono">
                        <PnLMovementIndicator
                          currentPrice={stk.currentPrice}
                          symbol={stk.symbol}
                          formatValue={(v) => formatINR(v)}
                        />
                      </div>

                      <div
                        className={`text-[11px] font-bold mt-0.5 ${
                          isPos ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                        }`}
                      >
                        {isPos ? '+' : ''}
                        {stk.change.toFixed(2)} ({isPos ? '+' : ''}
                        {stk.changePercent.toFixed(2)}%)
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Top intraday stocks (from PDF Page 2) */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold tracking-tight">
                  Top intraday stocks
                </h3>
                <button
                  onClick={() => navigateTo('markets')}
                  className="text-xs font-bold text-[#00b386] dark:text-[#00d09c] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Intraday screener</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 4 Cards: Raymond, Zensar Tech, Tata Invest, Brainbees */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {intradayStocks.map((stk) => {
                  const isPos = stk.change >= 0;
                  return (
                    <button
                      key={stk.symbol}
                      onClick={() => handleStockClick(stk.symbol)}
                      className={`p-3.5 rounded-2xl border text-left transition-all hover:border-[#00d09c] hover:shadow-md cursor-pointer group active:scale-[0.98] ${
                        theme === 'dark'
                          ? 'bg-[#151922] border-slate-800'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-300 mb-2">
                        {stk.symbol.slice(0, 3)}
                      </div>

                      <div className="font-bold text-xs sm:text-sm truncate text-slate-900 dark:text-white group-hover:text-[#00d09c] transition-colors">
                        {stk.name}
                      </div>

                      <div className="mt-2 text-sm sm:text-base font-black font-mono">
                        <PnLMovementIndicator
                          currentPrice={stk.currentPrice}
                          symbol={stk.symbol}
                          formatValue={(v) => formatINR(v)}
                        />
                      </div>

                      <div
                        className={`text-[11px] font-bold mt-0.5 ${
                          isPos ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                        }`}
                      >
                        {isPos ? '+' : ''}
                        {stk.change.toFixed(2)} ({isPos ? '+' : ''}
                        {stk.changePercent.toFixed(2)}%)
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Sectors trending today (Table from PDF Page 2) */}
            <div
              className={`rounded-2xl border p-5 space-y-3 transition-all ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-extrabold tracking-tight">Sectors trending today</h3>
                <button
                  onClick={() => navigateTo('markets')}
                  className="text-xs font-bold text-[#00b386] dark:text-[#00d09c] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>See all sectors</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                      <th className="py-2.5 px-3">Sector</th>
                      <th className="py-2.5 px-3 text-right">Gainers/Losers</th>
                      <th className="py-2.5 px-3 text-right">1D price change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {trendingSectors.map((sec) => {
                      const IconComponent = sec.icon;
                      return (
                        <tr
                          key={sec.name}
                          onClick={() => navigateTo('markets')}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                                <IconComponent className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#00d09c] transition-colors">
                                {sec.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-medium text-slate-500 dark:text-slate-400">
                            {sec.ratio}
                          </td>
                          <td
                            className={`py-3 px-3 text-right font-bold font-mono ${
                              sec.isPos ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                            }`}
                          >
                            {sec.isPos ? '+' : ''}
                            {sec.change.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 6. Most bought ETFs (from PDF Page 2: GOLD, SILVER, INTERNATIONAL, NIFTY 50) */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold tracking-tight">Most bought ETFs</h3>
                <button
                  onClick={() => navigateTo('markets')}
                  className="text-xs font-bold text-[#00b386] dark:text-[#00d09c] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>See all ETFs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {mostBoughtEtfs.map(({ category, stock: stk }) => {
                  const isPos = stk.change >= 0;
                  return (
                    <button
                      key={category + stk.symbol}
                      onClick={() => handleStockClick(stk.symbol)}
                      className={`p-3.5 rounded-2xl border text-left transition-all hover:border-[#00d09c] hover:shadow-md cursor-pointer group active:scale-[0.98] flex flex-col justify-between ${
                        theme === 'dark'
                          ? 'bg-[#151922] border-slate-800'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div>
                        {/* Category Label matching Groww PDF */}
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                          {category}
                        </div>

                        <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-xs mb-2.5">
                          ETF
                        </div>

                        <div className="font-bold text-xs sm:text-sm line-clamp-2 text-slate-900 dark:text-white group-hover:text-[#00d09c] transition-colors leading-snug">
                          {stk.name}
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-sm sm:text-base font-black font-mono">
                          <PnLMovementIndicator
                            currentPrice={stk.currentPrice}
                            symbol={stk.symbol}
                            formatValue={(v) => formatINR(v)}
                          />
                        </div>

                        <div
                          className={`text-[11px] font-bold mt-0.5 ${
                            isPos ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                          }`}
                        >
                          {isPos ? '+' : ''}
                          {stk.change.toFixed(2)} ({isPos ? '+' : ''}
                          {stk.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. ETFs by Groww (from PDF Page 2: with signature green Groww logo) */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold tracking-tight">ETFs by Groww</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] border border-[#00d09c]/25">
                    Direct
                  </span>
                </div>
                <button
                  onClick={() => navigateTo('markets')}
                  className="text-xs font-bold text-[#00b386] dark:text-[#00d09c] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>See all ETFs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {etfsByGroww.map((stk) => {
                  const isPos = stk.change >= 0;
                  return (
                    <button
                      key={stk.symbol}
                      onClick={() => handleStockClick(stk.symbol)}
                      className={`p-3.5 rounded-2xl border text-left transition-all hover:border-[#00d09c] hover:shadow-md cursor-pointer group active:scale-[0.98] ${
                        theme === 'dark'
                          ? 'bg-[#151922] border-slate-800'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#00d09c]/15 border border-[#00d09c]/30 flex items-center justify-center mb-2.5">
                        <GrowwLogo size="sm" showBadge={false} />
                      </div>

                      <div className="font-bold text-xs sm:text-sm truncate text-slate-900 dark:text-white group-hover:text-[#00d09c] transition-colors">
                        {stk.name}
                      </div>

                      <div className="mt-2 text-sm sm:text-base font-black font-mono">
                        <PnLMovementIndicator
                          currentPrice={stk.currentPrice}
                          symbol={stk.symbol}
                          formatValue={(v) => formatINR(v)}
                        />
                      </div>

                      <div
                        className={`text-[11px] font-bold mt-0.5 ${
                          isPos ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                        }`}
                      >
                        {isPos ? '+' : ''}
                        {stk.change.toFixed(2)} ({isPos ? '+' : ''}
                        {stk.changePercent.toFixed(2)}%)
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. Popular Bonds (from PDF Page 2-3) */}
            <div
              className={`rounded-2xl border p-5 space-y-3 transition-all ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-extrabold tracking-tight">Popular Bonds</h3>
                <button
                  onClick={() => navigateTo('investment')}
                  className="text-xs font-bold text-[#00b386] dark:text-[#00d09c] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>See more</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {popularBonds.map((b) => (
                  <div
                    key={b.name}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-[#00d09c] transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {b.name}
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                        {b.rating}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Yield</span>
                        <span className="font-black text-sm text-[#00b386] dark:text-[#00d09c]">
                          {b.yieldRate}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Tenure</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {b.tenure}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 8. Stocks in news today (from PDF Page 3) */}
            <div
              className={`rounded-2xl border p-5 space-y-3 transition-all ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-[#00d09c]" />
                  <h3 className="text-base font-extrabold tracking-tight">Stocks in news today</h3>
                </div>
                <button
                  onClick={() => navigateTo('news')}
                  className="text-xs font-bold text-[#00b386] dark:text-[#00d09c] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>All news</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800/60">
                {stocksInNews.map((news, i) => (
                  <div
                    key={i}
                    onClick={() => handleStockClick(news.symbol)}
                    className="pt-3 first:pt-0 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                      <span className="font-bold text-[#00b386] dark:text-[#00d09c]">
                        {news.symbol}
                      </span>
                      <span>•</span>
                      <span>{news.time}</span>
                      <span>•</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                        {news.tag}
                      </span>
                    </div>
                    <h5 className="text-xs sm:text-sm font-semibold group-hover:text-[#00d09c] transition-colors leading-snug text-slate-800 dark:text-slate-200">
                      {news.title}
                    </h5>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= RIGHT SIDEBAR (4 Cols) ================= */}
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              <GrowwRightSidebar onOpenPdfStatement={() => setPdfModalOpen(true)} />
            </div>
          </div>
        </div>
      </div>

      {/* Groww PDF Official Footer */}
      <GrowwPdfFooter />

      {/* Official PDF Statement & P&L Modal */}
      <GrowwPdfStatementModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
      />
    </div>
  );
};
