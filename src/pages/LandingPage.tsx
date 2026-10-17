import React, { useState, useRef } from 'react';
import { useTrade } from '../context/TradeContext';
import { formatINR } from '../services/api';
import { GrowwLogo } from '../components/GrowwLogo';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  BookOpen,
  PieChart,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Layers,
  Calculator,
  ChevronRight,
  Flame,
  Award,
  DollarSign,
  Lock,
  Smartphone
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigateTo, stocks, setSelectedSymbol, theme, isAdmin } = useTrade();
  const [selectedProduct, setSelectedProduct] = useState<'stocks' | 'mf' | 'fo' | 'ipo' | 'sip'>('stocks');

  // Secret 5 consecutive taps on logo opens Admin Login
  const logoTapTimestampsRef = useRef<number[]>([]);
  const handleFooterLogoClick = () => {
    const now = Date.now();
    const recentTaps = [...logoTapTimestampsRef.current.filter((t) => now - t < 3500), now];
    logoTapTimestampsRef.current = recentTaps;

    if (recentTaps.length >= 5) {
      logoTapTimestampsRef.current = [];
      if (isAdmin) {
        navigateTo('admin-dashboard');
      } else {
        navigateTo('admin-login');
      }
    }
  };
  
  // Interactive mini SIP calculator for landing page
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipYears, setSipYears] = useState(10);
  const [sipReturnRate, setSipReturnRate] = useState(12);

  const calculateSip = () => {
    const monthlyRate = sipReturnRate / 12 / 100;
    const months = sipYears * 12;
    const invested = sipAmount * months;
    const totalValue = sipAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const wealthGain = totalValue - invested;
    return { invested, wealthGain, totalValue };
  };

  const sipResult = calculateSip();

  const featuredStocks = stocks.slice(0, 6);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      theme === 'dark' ? 'bg-[#121418] text-slate-100' : 'bg-[#ffffff] text-[#44475b]'
    }`}>
      {/* 1. Official Groww Live Market Indices Strip */}
      <div className={`border-b py-2.5 px-4 overflow-x-auto scrollbar-none ${
        theme === 'dark' ? 'bg-[#171a21] border-[#282e3e]' : 'bg-[#fcfdfe] border-[#eaedf0]'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between min-w-max gap-8 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#00D09C] animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider">LIVE INDICES</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-slate-900 dark:text-white">NIFTY 50</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">24,852.15</span>
              <span className="text-[#00D09C] font-bold text-[11px] bg-[#00D09C]/10 px-1.5 py-0.5 rounded">
                +112.40 (+0.45%)
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-slate-900 dark:text-white">SENSEX</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">81,332.90</span>
              <span className="text-[#00D09C] font-bold text-[11px] bg-[#00D09C]/10 px-1.5 py-0.5 rounded">
                +354.20 (+0.44%)
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-slate-900 dark:text-white">BANK NIFTY</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">51,320.10</span>
              <span className="text-[#eb5b3c] font-bold text-[11px] bg-[#eb5b3c]/10 px-1.5 py-0.5 rounded">
                -42.30 (-0.08%)
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-slate-900 dark:text-white">NIFTY IT</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">42,150.80</span>
              <span className="text-[#00D09C] font-bold text-[11px] bg-[#00D09C]/10 px-1.5 py-0.5 rounded">
                +310.50 (+0.74%)
              </span>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-slate-400">
            Real-time Simulated Feed
          </div>
        </div>
      </div>

      {/* 2. Official Groww Hero Section */}
      <section className="pt-14 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Groww pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00D09C]/10 border border-[#00D09C]/30 text-[#00b386] dark:text-[#00D09C] text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#00D09C]" />
              <span>India's Favorite Stock Trading & Investment Platform</span>
            </div>

            {/* Headline matching Groww's signature slogan */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#44475b] dark:text-white leading-[1.1]">
              All things investing, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D09C] to-[#5367FF]">
                made simple & risk-free.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#7c7e8c] dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Practice trading equities, building your portfolio, and mastering market dynamics with <span className="font-bold text-[#44475b] dark:text-white">₹5,00,000 free virtual capital</span>. Zero real money at risk.
            </p>

            {/* Product Selector Pills (Groww Signature Style) */}
            <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
              <button
                onClick={() => setSelectedProduct('stocks')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedProduct === 'stocks'
                    ? 'bg-[#00D09C] text-slate-950 shadow-md shadow-[#00D09C]/25'
                    : 'bg-slate-100 dark:bg-[#1c202a] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Stocks</span>
              </button>
              <button
                onClick={() => setSelectedProduct('mf')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedProduct === 'mf'
                    ? 'bg-[#5367FF] text-white shadow-md shadow-[#5367FF]/25'
                    : 'bg-slate-100 dark:bg-[#1c202a] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>Mutual Funds</span>
              </button>
              <button
                onClick={() => setSelectedProduct('fo')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedProduct === 'fo'
                    ? 'bg-[#00D09C] text-slate-950 shadow-md shadow-[#00D09C]/25'
                    : 'bg-slate-100 dark:bg-[#1c202a] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>F&O (Futures & Options)</span>
              </button>
              <button
                onClick={() => setSelectedProduct('sip')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedProduct === 'sip'
                    ? 'bg-[#5367FF] text-white shadow-md shadow-[#5367FF]/25'
                    : 'bg-slate-100 dark:bg-[#1c202a] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>SIP Calculator</span>
              </button>
            </div>

            {/* Primary Action Button */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                id="hero-get-started-btn"
                onClick={() => navigateTo('register')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#00D09C] hover:bg-[#00b386] active:scale-95 text-slate-950 font-black text-base transition-all shadow-lg shadow-[#00D09C]/30 flex items-center justify-center gap-2"
              >
                <span>Get ₹5,00,000 Free Virtual Cash</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                id="hero-explore-stocks-btn"
                onClick={() => navigateTo('markets')}
                className={`w-full sm:w-auto px-7 py-4 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  theme === 'dark'
                    ? 'border-[#282e3e] bg-[#1a1e28] text-white hover:bg-[#202533]'
                    : 'border-[#eaedf0] bg-white text-[#44475b] hover:bg-slate-50 shadow-xs'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-[#00D09C]" />
                <span>Explore Live Stock Prices</span>
              </button>
            </div>

            {/* Trust checkmarks */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-[#7c7e8c] dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00D09C]" />
                <span>Free Paper Trading</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00D09C]" />
                <span>Zero Bank Account Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00D09C]" />
                <span>100% Risk-Free Simulation</span>
              </div>
            </div>
          </div>

          {/* 3. Most Bought on Groww (Stock Cards in Groww exact style) */}
          <div className="mt-16">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#44475b] dark:text-white flex items-center gap-2">
                  <span>Most Bought on Groww</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#00D09C]/10 text-[#00b386] dark:text-[#00D09C]">
                    Trending
                  </span>
                </h2>
                <p className="text-xs text-[#7c7e8c] dark:text-slate-400 mt-0.5">
                  Popular equities actively traded on the platform
                </p>
              </div>

              <button
                onClick={() => navigateTo('markets')}
                className="text-xs font-bold text-[#00b386] dark:text-[#00D09C] hover:underline flex items-center gap-1"
              >
                <span>View all stocks</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {featuredStocks.map((stk) => {
                const isUp = stk.change >= 0;
                return (
                  <div
                    key={stk.symbol}
                    onClick={() => {
                      setSelectedSymbol(stk.symbol);
                      navigateTo('stock-details', stk.symbol);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-md ${
                      theme === 'dark'
                        ? 'bg-[#181b24] border-[#282e3e] hover:border-[#00D09C]'
                        : 'bg-white border-[#eaedf0] hover:border-[#00D09C] shadow-xs'
                    }`}
                  >
                    {/* Logo Monogram */}
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#202533] flex items-center justify-center font-black text-xs text-[#5367FF] mb-3 group-hover:scale-105 transition-transform border border-slate-200 dark:border-slate-700">
                      {stk.symbol.substring(0, 3)}
                    </div>

                    <h3 className="font-bold text-sm text-[#44475b] dark:text-white truncate group-hover:text-[#00D09C] transition-colors">
                      {stk.name}
                    </h3>
                    <p className="text-[11px] text-[#7c7e8c] dark:text-slate-400 font-semibold">
                      {stk.symbol}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col">
                      <span className="text-sm font-extrabold text-[#44475b] dark:text-white">
                        {formatINR(stk.currentPrice)}
                      </span>
                      <span className={`text-[11px] font-bold mt-0.5 ${isUp ? 'text-[#00D09C]' : 'text-[#eb5b3c]'}`}>
                        {isUp ? '+' : ''}{stk.change.toFixed(2)} ({isUp ? '+' : ''}{stk.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Groww SIP Wealth Calculator Section */}
      <section className={`py-14 border-y px-4 sm:px-6 transition-colors ${
        theme === 'dark' ? 'bg-[#151821] border-[#282e3e]' : 'bg-[#f8fafc] border-[#eaedf0]'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5367FF]/10 text-[#5367FF] text-xs font-bold">
                <Calculator className="w-3.5 h-3.5" />
                <span>Groww Wealth Planner</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#44475b] dark:text-white">
                See how small monthly investments compound
              </h2>
              <p className="text-sm text-[#7c7e8c] dark:text-slate-400 leading-relaxed">
                Systematic Investment Plans (SIP) allow you to invest a fixed amount regularly. Use this simulated calculator to forecast your wealth creation over 10+ years.
              </p>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500">Monthly Investment</span>
                    <span className="text-[#00D09C] font-extrabold">{formatINR(sipAmount, false)}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="100000"
                    step="500"
                    value={sipAmount}
                    onChange={(e) => setSipAmount(Number(e.target.value))}
                    className="w-full accent-[#00D09C]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500">Investment Period</span>
                    <span className="text-[#5367FF] font-extrabold">{sipYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={sipYears}
                    onChange={(e) => setSipYears(Number(e.target.value))}
                    className="w-full accent-[#5367FF]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500">Expected Annual Return</span>
                    <span className="text-amber-500 font-extrabold">{sipReturnRate}% p.a.</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="0.5"
                    value={sipReturnRate}
                    onChange={(e) => setSipReturnRate(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Result Display Card */}
            <div className="lg:col-span-7">
              <div className={`p-6 sm:p-8 rounded-3xl border ${
                theme === 'dark' ? 'bg-[#1b1f2b] border-[#282e3e]' : 'bg-white border-[#eaedf0] shadow-sm'
              }`}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-6">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#151922]">
                    <span className="text-[11px] font-bold text-slate-400">Total Invested</span>
                    <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      {formatINR(sipResult.invested, false)}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#151922]">
                    <span className="text-[11px] font-bold text-[#00D09C]">Est. Returns</span>
                    <p className="text-lg font-black text-[#00D09C] mt-1">
                      {formatINR(sipResult.wealthGain, false)}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#00D09C]/10 border border-[#00D09C]/20">
                    <span className="text-[11px] font-bold text-[#00b386] dark:text-[#00D09C]">Total Value</span>
                    <p className="text-lg font-black text-[#00b386] dark:text-[#00D09C] mt-1">
                      {formatINR(sipResult.totalValue, false)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 text-center sm:text-left">
                    Ready to practice real-time execution in the market?
                  </div>
                  <button
                    onClick={() => navigateTo('investment')}
                    className="px-5 py-2.5 rounded-xl bg-[#5367FF] hover:bg-[#4355ee] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open Investor Academy</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Groww Features Grid: Why Indians Choose Groww */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-[#44475b] dark:text-white">
              Built for Modern Indian Investors
            </h2>
            <p className="text-sm text-[#7c7e8c] dark:text-slate-400 mt-2">
              Everything you need to master the stock market with confidence and zero financial risk
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-3xl border transition-all hover:border-[#00D09C] ${
              theme === 'dark' ? 'bg-[#181b24] border-[#282e3e]' : 'bg-white border-[#eaedf0] shadow-xs'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-[#00D09C]/15 text-[#00b386] dark:text-[#00D09C] flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#44475b] dark:text-white mb-1.5">
                Simulated Brownian Price Engine
              </h3>
              <p className="text-xs text-[#7c7e8c] dark:text-slate-400 leading-relaxed">
                Watch real-time simulated price ticks fluctuating with realistic volatility. Execute Market and Limit orders and watch them fill when the price crosses your target.
              </p>
            </div>

            <div className={`p-6 rounded-3xl border transition-all hover:border-[#5367FF] ${
              theme === 'dark' ? 'bg-[#181b24] border-[#282e3e]' : 'bg-white border-[#eaedf0] shadow-xs'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-[#5367FF]/15 text-[#5367FF] flex items-center justify-center mb-4">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#44475b] dark:text-white mb-1.5">
                Live Portfolio & P&L Analytics
              </h3>
              <p className="text-xs text-[#7c7e8c] dark:text-slate-400 leading-relaxed">
                Track your holdings, average buy price, current market valuation, daily P&L, and all-time unrealized gains with precision green/red metrics.
              </p>
            </div>

            <div className={`p-6 rounded-3xl border transition-all hover:border-[#00D09C] ${
              theme === 'dark' ? 'bg-[#181b24] border-[#282e3e]' : 'bg-white border-[#eaedf0] shadow-xs'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-[#00D09C]/15 text-[#00b386] dark:text-[#00D09C] flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#44475b] dark:text-white mb-1.5">
                Deposit & T+1 Settlement Training
              </h3>
              <p className="text-xs text-[#7c7e8c] dark:text-slate-400 leading-relaxed">
                Learn clearing house mechanics, virtual UPI deposits, and simulated T+1 rolling settlement rules with authentic ledger accounting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Authentic Groww Footer */}
      <footer className={`mt-auto border-t py-12 px-4 sm:px-6 transition-colors ${
        theme === 'dark' ? 'bg-[#0f1116] border-[#282e3e]' : 'bg-[#fcfdfe] border-[#eaedf0]'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Column 1: Brand */}
            <div className="space-y-3">
              <button
                onClick={handleFooterLogoClick}
                className="text-left touch-manipulation select-none active:scale-[0.98] transition-transform cursor-pointer"
                title="Groww"
              >
                <GrowwLogo size="lg" showBadge={true} />
              </button>
              <p className="text-xs text-[#7c7e8c] dark:text-slate-400 leading-relaxed">
                Vaishnavi Tech Park, South Tower, 3rd Floor, Sarjapur Main Road, Bellandur, Bengaluru - 560103, Karnataka.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs text-[#00b386] dark:text-[#00D09C] font-semibold">
                <span>Trading & Investment Platform</span>
                <span>•</span>
                <span>Version 3.2.0</span>
              </div>
            </div>

            {/* Column 2: Products */}
            <div className="space-y-2 text-xs">
              <h4 className="font-extrabold uppercase text-[#44475b] dark:text-white tracking-wider text-[11px]">
                Products
              </h4>
              <ul className="space-y-1.5 text-[#7c7e8c] dark:text-slate-400">
                <li><button onClick={() => navigateTo('markets')} className="hover:text-[#00D09C]">Stocks</button></li>
                <li><button onClick={() => navigateTo('mutual-funds')} className="hover:text-[#00D09C]">Mutual Funds</button></li>
                <li><button onClick={() => navigateTo('markets')} className="hover:text-[#00D09C]">Futures & Options</button></li>
                <li><button onClick={() => navigateTo('investment')} className="hover:text-[#00D09C]">SIP Calculator</button></li>
                <li><button onClick={() => navigateTo('wallet')} className="hover:text-[#00D09C]">Cash Wallet</button></li>
              </ul>
            </div>

            {/* Column 3: Groww Platform */}
            <div className="space-y-2 text-xs">
              <h4 className="font-extrabold uppercase text-[#44475b] dark:text-white tracking-wider text-[11px]">
                Groww Platform
              </h4>
              <ul className="space-y-1.5 text-[#7c7e8c] dark:text-slate-400">
                <li><button onClick={() => navigateTo('login')} className="hover:text-[#00D09C]">Account Login</button></li>
                <li><button onClick={() => navigateTo('register')} className="hover:text-[#00D09C]">Open Demat Account</button></li>
                <li><button onClick={() => navigateTo('portfolio')} className="hover:text-[#00D09C]">Portfolio Tracking</button></li>
                <li><button onClick={() => navigateTo('orders')} className="hover:text-[#00D09C]">Order History</button></li>
                <li><button onClick={() => navigateTo('settings')} className="hover:text-[#00D09C]">Platform Settings</button></li>
              </ul>
            </div>

            {/* Column 4: Quick Links & Legal */}
            <div className="space-y-2 text-xs">
              <h4 className="font-extrabold uppercase text-[#44475b] dark:text-white tracking-wider text-[11px]">
                Legal & Security
              </h4>
              <ul className="space-y-1.5 text-[#7c7e8c] dark:text-slate-400">
                <li><button onClick={() => navigateTo('terms')} className="hover:text-[#00D09C]">Terms of Use & Disclosures</button></li>
                <li><button onClick={() => navigateTo('terms')} className="hover:text-[#00D09C]">Privacy Policy & Risk Disclosures</button></li>
                <li><span className="text-slate-400">NSE / BSE Market Feed</span></li>
                <li><span className="text-slate-400">Zero Commission Trading</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-[#7c7e8c] dark:text-slate-500 leading-relaxed">
            <p>
              © 2026 Groww Stock Trading & Investment Platform. Built for modern wealth creation, equities trading, and mutual fund investments.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
