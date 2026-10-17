import React, { useState } from 'react';
import { useTrade } from '../context/TradeContext';
import { formatINR } from '../services/api';
import {
  TrendingUp,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  PieChart,
  ArrowRight,
  Sparkles,
  Layers,
  Award,
  Zap,
  Check,
  Lock
} from 'lucide-react';

export const InvestmentLearnPage: React.FC = () => {
  const { navigateTo, quickAddCash, wallet, theme } = useTrade();

  // SIP Calculator State
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(10000);
  const [expectedReturn, setExpectedReturn] = useState<number>(14);
  const [years, setYears] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<'MUTUAL_FUNDS' | 'ETFS' | 'SIP_CALCULATOR'>('MUTUAL_FUNDS');
  const [investSuccessMessage, setInvestSuccessMessage] = useState<string | null>(null);

  // Calculate SIP Future Value
  const monthlyRate = expectedReturn / 12 / 100;
  const totalMonths = years * 12;
  const investedAmount = monthlyInvestment * totalMonths;
  const futureValue =
    monthlyInvestment *
    ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
    (1 + monthlyRate);
  const totalGains = Math.max(0, futureValue - investedAmount);

  const mutualFunds = [
    {
      id: 'mf-1',
      name: 'Nippon India Large Cap Direct Growth',
      category: 'Large Cap Fund',
      cagr3Y: 24.8,
      risk: 'Very High Risk',
      minSip: 100,
      fundSize: '₹34,180 Cr',
      rating: '5 ★'
    },
    {
      id: 'mf-2',
      name: 'Parag Parikh Flexi Cap Direct Plan',
      category: 'Flexi Cap Fund',
      cagr3Y: 21.4,
      risk: 'Very High Risk',
      minSip: 1000,
      fundSize: '₹72,400 Cr',
      rating: '5 ★'
    },
    {
      id: 'mf-3',
      name: 'HDFC Mid-Cap Opportunities Direct Plan',
      category: 'Mid Cap Fund',
      cagr3Y: 31.2,
      risk: 'Very High Risk',
      minSip: 500,
      fundSize: '₹68,910 Cr',
      rating: '5 ★'
    },
    {
      id: 'mf-4',
      name: 'Quant Small Cap Fund Direct Growth',
      category: 'Small Cap Fund',
      cagr3Y: 38.6,
      risk: 'Very High Risk',
      minSip: 1000,
      fundSize: '₹22,850 Cr',
      rating: '4 ★'
    }
  ];

  const etfs = [
    {
      symbol: 'NIFTYBEES',
      name: 'Nippon India ETF Nifty 50 BeES',
      price: 268.45,
      dayChange: 0.74,
      category: 'Index ETF',
      aum: '₹18,920 Cr'
    },
    {
      symbol: 'BANKBEES',
      name: 'Nippon India ETF Nifty Bank BeES',
      price: 521.10,
      dayChange: 0.92,
      category: 'Banking ETF',
      aum: '₹12,450 Cr'
    },
    {
      symbol: 'GOLDBEES',
      name: 'Nippon India ETF Gold BeES',
      price: 64.20,
      dayChange: 0.32,
      category: 'Precious Metals',
      aum: '₹10,800 Cr'
    },
    {
      symbol: 'ITBEES',
      name: 'Nippon India ETF Nifty IT',
      price: 43.15,
      dayChange: 1.45,
      category: 'Technology ETF',
      aum: '₹4,120 Cr'
    }
  ];

  const handleStartSIP = (fundName: string, sipAmount: number) => {
    setInvestSuccessMessage(`SIP mandate of ${formatINR(sipAmount)}/mo active for ${fundName}!`);
    setTimeout(() => setInvestSuccessMessage(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 transition-all ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] flex items-center justify-center border border-[#00d09c]/30 shrink-0">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">Investments & Mutual Funds</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] border border-[#00d09c]/30">
                  Real Trading — Real Money
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Direct Mutual Funds with 0% Commission • Real-Time Index ETFs • Automated SIPs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('deposit-learn')}
              className="px-4 py-2.5 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-all shadow-md shadow-[#00d09c]/20 flex items-center gap-1.5"
            >
              <span>Add Money</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          {[
            { id: 'MUTUAL_FUNDS', label: 'Direct Mutual Funds', icon: Award },
            { id: 'ETFS', label: 'Index ETFs & Baskets', icon: Layers },
            { id: 'SIP_CALCULATOR', label: 'SIP Compounding Calculator', icon: Calculator }
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                  isCurrent
                    ? 'bg-[#00d09c]/10 border-[#00d09c] text-[#00b386] dark:text-[#00d09c]'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {investSuccessMessage && (
        <div className="p-4 rounded-2xl bg-[#00d09c]/15 border border-[#00d09c]/30 text-[#00b386] dark:text-[#00d09c] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{investSuccessMessage}</span>
        </div>
      )}

      {/* Tab: Mutual Funds */}
      {activeTab === 'MUTUAL_FUNDS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Top Rated Direct Equity Funds (0% Commission)
            </h2>
            <span className="text-xs text-slate-400">AMFI & SEBI Regulated</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mutualFunds.map((fund) => (
              <div
                key={fund.id}
                className={`p-6 rounded-3xl border transition-all space-y-4 ${
                  theme === 'dark'
                    ? 'bg-[#151922] border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {fund.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span>{fund.category}</span>
                      <span>•</span>
                      <span className="text-amber-500 font-bold">{fund.rating}</span>
                      <span>•</span>
                      <span>AUM: {fund.fundSize}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-400 block">3Y Annualized</span>
                    <span className="text-lg font-black text-[#00b386] dark:text-[#00d09c]">
                      +{fund.cagr3Y}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div className="text-slate-400">
                    Min. SIP: <span className="font-bold text-slate-700 dark:text-slate-300">{formatINR(fund.minSip)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartSIP(fund.name, fund.minSip * 5)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs transition-colors"
                    >
                      One-Time
                    </button>
                    <button
                      onClick={() => handleStartSIP(fund.name, fund.minSip)}
                      className="px-4 py-1.5 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-all shadow-xs"
                    >
                      Start SIP
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: ETFs */}
      {activeTab === 'ETFS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Liquid Exchange Traded Funds (ETFs)
            </h2>
            <span className="text-xs text-slate-400">Trade Live on NSE / BSE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {etfs.map((etf) => (
              <div
                key={etf.symbol}
                className={`p-5 rounded-3xl border transition-all space-y-3 ${
                  theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{etf.symbol}</span>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5 line-clamp-1">{etf.name}</p>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {etf.category}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-2">
                  <span className="text-lg font-black">{formatINR(etf.price)}</span>
                  <span className="text-xs font-bold text-[#00b386] dark:text-[#00d09c]">
                    +{etf.dayChange}%
                  </span>
                </div>

                <button
                  onClick={() => navigateTo('markets')}
                  className="w-full py-2 rounded-xl bg-[#00d09c]/15 hover:bg-[#00d09c]/25 text-[#00b386] dark:text-[#00d09c] font-black text-xs transition-all flex items-center justify-center gap-1"
                >
                  <span>Trade {etf.symbol}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: SIP Calculator */}
      {activeTab === 'SIP_CALCULATOR' && (
        <div
          className={`rounded-3xl border p-6 sm:p-8 ${
            theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Controls */}
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-black">SIP Wealth Compounder</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calculate the compounding effect of regular disciplined investing
                </p>
              </div>

              {/* Monthly Investment */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-500 dark:text-slate-400">Monthly Investment</span>
                  <span className="text-[#00b386] dark:text-[#00d09c] text-sm font-black">
                    {formatINR(monthlyInvestment)}
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={100000}
                  step={1000}
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00d09c]"
                />
              </div>

              {/* Expected Return Rate */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-500 dark:text-slate-400">Expected Annual Return (CAGR)</span>
                  <span className="text-[#00b386] dark:text-[#00d09c] text-sm font-black">{expectedReturn}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={1}
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00d09c]"
                />
              </div>

              {/* Time Period */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-500 dark:text-slate-400">Time Horizon</span>
                  <span className="text-[#00b386] dark:text-[#00d09c] text-sm font-black">{years} Years</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00d09c]"
                />
              </div>
            </div>

            {/* Results Visualizer */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800/80 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Projected Maturity Wealth
              </span>
              <div className="text-3xl sm:text-4xl font-black text-[#00b386] dark:text-[#00d09c] tracking-tight">
                {formatINR(futureValue)}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Total Invested Principal</span>
                  <span className="font-black text-sm">{formatINR(investedAmount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Estimated Wealth Gain</span>
                  <span className="font-black text-sm text-[#00b386] dark:text-[#00d09c]">
                    +{formatINR(totalGains)}
                  </span>
                </div>
              </div>

              {/* Visual Proportion Bar */}
              <div className="pt-2">
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${(investedAmount / futureValue) * 100}%` }}
                    className="h-full bg-slate-400 dark:bg-slate-600"
                    title="Principal"
                  />
                  <div
                    style={{ width: `${(totalGains / futureValue) * 100}%` }}
                    className="h-full bg-[#00d09c]"
                    title="Gains"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-bold">
                  <span>Principal</span>
                  <span className="text-[#00b386] dark:text-[#00d09c]">Compounded Growth</span>
                </div>
              </div>

              <button
                onClick={() => handleStartSIP('Direct Growth Portfolio Basket', monthlyInvestment)}
                className="w-full mt-4 py-3 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-all shadow-md shadow-[#00d09c]/20 flex items-center justify-center gap-1.5"
              >
                <span>Automate {formatINR(monthlyInvestment)}/mo SIP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regulatory Footer */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
        <ShieldCheck className="w-4 h-4 text-[#00d09c]" />
        <span>Mutual fund investments are subject to market risks. Read all scheme related documents carefully.</span>
      </div>
    </div>
  );
};

