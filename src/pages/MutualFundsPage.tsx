import React, { useState, useMemo } from 'react';
import { useTrade } from '../context/TradeContext';
import { MUTUAL_FUNDS_DATA, MutualFund } from '../data/marketAssetsData';
import { formatINR, formatPercent } from '../services/api';
import {
  Layers,
  Search,
  TrendingUp,
  Star,
  CheckCircle2,
  Calendar,
  DollarSign,
  Briefcase,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  PieChart,
  ArrowUpDown,
  Filter,
  Info,
  X
} from 'lucide-react';

export const MutualFundsPage: React.FC = () => {
  const { wallet, mutualFundInvestments, investInMutualFund, navigateTo, theme } = useTrade();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'EXPLORE' | 'MY_INVESTMENTS' | 'COMPARE'>('EXPLORE');

  // Selected Fund for Detail / Investment Modal
  const [activeFundModal, setActiveFundModal] = useState<MutualFund | null>(null);
  const [investmentType, setInvestmentType] = useState<'SIP' | 'LUMPSUM'>('SIP');
  const [investAmount, setInvestAmount] = useState<number>(5000);
  const [sipDay, setSipDay] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Comparison State
  const [compareFund1, setCompareFund1] = useState<MutualFund>(MUTUAL_FUNDS_DATA[0]);
  const [compareFund2, setCompareFund2] = useState<MutualFund>(MUTUAL_FUNDS_DATA[1]);

  const categories = ['All', 'Flexi Cap', 'Small Cap', 'Large Cap', 'Mid Cap', 'Index Funds', 'ELSS'];

  const filteredFunds = useMemo(() => {
    return MUTUAL_FUNDS_DATA.filter((f) => {
      const matchCat = selectedCategory === 'All' || f.category === selectedCategory;
      const matchSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.fundHouse.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  const availableCash = wallet?.balance || 0;

  // Handle Investment Execution
  const handleExecuteInvestment = async () => {
    if (!activeFundModal) return;
    setErrorMsg(null);

    const minAmt = investmentType === 'SIP' ? activeFundModal.minSipAmount : activeFundModal.minLumpsumAmount;
    if (investAmount < minAmt) {
      setErrorMsg(`Minimum ${investmentType} amount for this fund is ${formatINR(minAmt)}`);
      return;
    }

    if (investAmount > availableCash) {
      setErrorMsg(`Insufficient balance. You have ${formatINR(availableCash)} available in your wallet.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await investInMutualFund(activeFundModal, investAmount, investmentType);
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setActiveFundModal(null);
      }, 2500);
    } catch (e: any) {
      setErrorMsg(e.message || 'Investment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mutual Fund Portfolio Aggregations
  const totalMfInvested = mutualFundInvestments.reduce((acc, curr) => acc + curr.totalInvested, 0);
  const totalMfCurrent = mutualFundInvestments.reduce((acc, curr) => acc + curr.currentValue, 0);
  const totalMfPnL = totalMfCurrent - totalMfInvested;
  const totalMfPnLPercent = totalMfInvested > 0 ? (totalMfPnL / totalMfInvested) * 100 : 0;

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
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Mutual Funds Simulation</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct Plans • 0% Commission • Start SIPs or Lumpsum with simulated balance
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

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('EXPLORE')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'EXPLORE'
              ? 'bg-[#00d09c] text-slate-950 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Explore All Funds ({MUTUAL_FUNDS_DATA.length})
        </button>

        <button
          onClick={() => setActiveTab('MY_INVESTMENTS')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'MY_INVESTMENTS'
              ? 'bg-[#00d09c] text-slate-950 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>My Investments</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800">
            {mutualFundInvestments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('COMPARE')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'COMPARE'
              ? 'bg-[#00d09c] text-slate-950 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Fund Comparison</span>
        </button>
      </div>

      {/* TAB 1: EXPLORE FUNDS */}
      {activeTab === 'EXPLORE' && (
        <div className="space-y-5">
          {/* Search & Categories */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search funds by name, category, or AMC..."
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

          {/* Mutual Fund Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFunds.map((fund) => (
              <div
                key={fund.id}
                className={`rounded-3xl border p-5 flex flex-col justify-between transition-all hover:border-[#00d09c] hover:shadow-lg group ${
                  theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0c0f17] text-slate-500 dark:text-slate-400">
                      {fund.category}
                    </span>
                    <div className="flex items-center text-amber-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                      <span>{fund.rating}★</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-black group-hover:text-[#00d09c] transition-colors line-clamp-2">
                    {fund.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{fund.fundHouse}</p>

                  <div className="grid grid-cols-3 gap-2 my-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">NAV</span>
                      <span className="text-xs font-black">{formatINR(fund.nav)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">3Y Returns</span>
                      <span className="text-xs font-black text-[#00b386] dark:text-[#00d09c]">
                        +{fund.returns3Y}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">1Y Returns</span>
                      <span className="text-xs font-black text-[#00b386] dark:text-[#00d09c]">
                        +{fund.returns1Y}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span>AUM (Fund Size):</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">₹{fund.aum.toLocaleString()} Cr</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Expense Ratio:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{fund.expenseRatio}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Risk Level:</span>
                      <span className="font-bold text-amber-500">{fund.riskLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveFundModal(fund);
                      setInvestmentType('SIP');
                      setInvestAmount(fund.minSipAmount);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-all shadow-sm"
                  >
                    Start SIP
                  </button>
                  <button
                    onClick={() => {
                      setActiveFundModal(fund);
                      setInvestmentType('LUMPSUM');
                      setInvestAmount(fund.minLumpsumAmount);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#00d09c] text-xs font-bold transition-all"
                  >
                    One-Time
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MY MUTUAL FUND INVESTMENTS */}
      {activeTab === 'MY_INVESTMENTS' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className={`p-4 rounded-2xl border ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-400 block">Total Invested</span>
              <span className="text-lg font-black mt-1 block">{formatINR(totalMfInvested)}</span>
            </div>
            <div
              className={`p-4 rounded-2xl border ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-400 block">Current Value</span>
              <span className="text-lg font-black mt-1 block">{formatINR(totalMfCurrent)}</span>
            </div>
            <div
              className={`p-4 rounded-2xl border ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-400 block">Total Profit / Loss</span>
              <span
                className={`text-lg font-black mt-1 flex items-center gap-1 ${
                  totalMfPnL >= 0 ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                }`}
              >
                {formatINR(totalMfPnL)} ({formatPercent(totalMfPnLPercent)})
              </span>
            </div>
            <div
              className={`p-4 rounded-2xl border ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-400 block">Active SIPs</span>
              <span className="text-lg font-black mt-1 block">
                {mutualFundInvestments.filter((i) => i.investmentType === 'SIP').length}
              </span>
            </div>
          </div>

          {/* Holdings List */}
          {mutualFundInvestments.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <PieChart className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold">No Mutual Fund Investments Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explore our catalog of top-performing Direct-Growth mutual funds and start your first simulated SIP today.
              </p>
              <button
                onClick={() => setActiveTab('EXPLORE')}
                className="px-4 py-2 rounded-xl bg-[#00d09c] text-slate-950 font-black text-xs"
              >
                Explore Funds
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {mutualFundInvestments.map((inv) => (
                <div
                  key={inv.id}
                  className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c]">
                        {inv.investmentType}
                      </span>
                      <span className="text-xs text-slate-400">{inv.category}</span>
                    </div>
                    <h4 className="text-sm font-black">{inv.fundName}</h4>
                    <p className="text-[11px] text-slate-500">
                      Units Allocated: <strong className="text-slate-700 dark:text-slate-300">{inv.unitsAllocated}</strong> • Current NAV: {formatINR(inv.currentNav)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase">Invested</span>
                      <span className="font-bold">{formatINR(inv.totalInvested)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase">Current Value</span>
                      <span className="font-black text-sm">{formatINR(inv.currentValue)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block uppercase">Returns</span>
                      <span
                        className={`font-black ${
                          inv.unrealizedPnL >= 0 ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                        }`}
                      >
                        +{formatINR(inv.unrealizedPnL)} ({inv.unrealizedPnLPercent}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FUND COMPARISON */}
      {activeTab === 'COMPARE' && (
        <div className="space-y-6">
          <div
            className={`rounded-3xl border p-5 sm:p-6 ${
              theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <h3 className="text-sm font-black mb-4 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-[#00d09c]" />
              <span>Side-by-Side Fund Comparison</span>
            </h3>

            {/* Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Fund A</label>
                <select
                  value={compareFund1.id}
                  onChange={(e) => {
                    const f = MUTUAL_FUNDS_DATA.find((x) => x.id === e.target.value);
                    if (f) setCompareFund1(f);
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b0e14] text-xs font-bold"
                >
                  {MUTUAL_FUNDS_DATA.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Fund B</label>
                <select
                  value={compareFund2.id}
                  onChange={(e) => {
                    const f = MUTUAL_FUNDS_DATA.find((x) => x.id === e.target.value);
                    if (f) setCompareFund2(f);
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b0e14] text-xs font-bold"
                >
                  {MUTUAL_FUNDS_DATA.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 font-bold">Metric</th>
                    <th className="py-2.5 font-bold text-[#00b386] dark:text-[#00d09c]">{compareFund1.name}</th>
                    <th className="py-2.5 font-bold text-sky-500">{compareFund2.name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  <tr>
                    <td className="py-3 font-semibold text-slate-400">Category</td>
                    <td className="py-3 font-bold">{compareFund1.category}</td>
                    <td className="py-3 font-bold">{compareFund2.category}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-400">Current NAV</td>
                    <td className="py-3 font-bold">{formatINR(compareFund1.nav)}</td>
                    <td className="py-3 font-bold">{formatINR(compareFund2.nav)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-400">1 Year Returns</td>
                    <td className="py-3 font-bold text-emerald-500">+{compareFund1.returns1Y}%</td>
                    <td className="py-3 font-bold text-emerald-500">+{compareFund2.returns1Y}%</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-400">3 Year Returns</td>
                    <td className="py-3 font-bold text-emerald-500">+{compareFund1.returns3Y}%</td>
                    <td className="py-3 font-bold text-emerald-500">+{compareFund2.returns3Y}%</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-400">5 Year Returns</td>
                    <td className="py-3 font-bold text-emerald-500">+{compareFund1.returns5Y}%</td>
                    <td className="py-3 font-bold text-emerald-500">+{compareFund2.returns5Y}%</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-400">Expense Ratio</td>
                    <td className="py-3 font-bold">{compareFund1.expenseRatio}%</td>
                    <td className="py-3 font-bold">{compareFund2.expenseRatio}%</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-400">AUM (Fund Size)</td>
                    <td className="py-3 font-bold">₹{compareFund1.aum.toLocaleString()} Cr</td>
                    <td className="py-3 font-bold">₹{compareFund2.aum.toLocaleString()} Cr</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-400">Risk Level</td>
                    <td className="py-3 font-bold text-amber-500">{compareFund1.riskLevel}</td>
                    <td className="py-3 font-bold text-amber-500">{compareFund2.riskLevel}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-400">Rating</td>
                    <td className="py-3 font-bold text-amber-400">{compareFund1.rating}★</td>
                    <td className="py-3 font-bold text-amber-400">{compareFund2.rating}★</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-400">Min SIP Amount</td>
                    <td className="py-3 font-bold">{formatINR(compareFund1.minSipAmount)}</td>
                    <td className="py-3 font-bold">{formatINR(compareFund2.minSipAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INVESTMENT MODAL */}
      {activeFundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in duration-200 ${
              theme === 'dark' ? 'bg-[#111622] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c]">
                  {activeFundModal.category}
                </span>
                <h3 className="text-base font-black mt-1">{activeFundModal.name}</h3>
                <p className="text-xs text-slate-400">Current NAV: {formatINR(activeFundModal.nav)}</p>
              </div>
              <button
                onClick={() => setActiveFundModal(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#00d09c]/20 text-[#00b386] dark:text-[#00d09c] flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h4 className="text-base font-black">Investment Successful!</h4>
                <p className="text-xs text-slate-400">
                  {investmentType === 'SIP'
                    ? `SIP of ${formatINR(investAmount)} set for ${sipDay}th of every month.`
                    : `One-time lumpsum of ${formatINR(investAmount)} allocated successfully.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Switcher: SIP vs One-Time */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setInvestmentType('SIP');
                      setInvestAmount(activeFundModal.minSipAmount);
                    }}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      investmentType === 'SIP'
                        ? 'bg-[#00d09c] text-slate-950 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Monthly SIP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInvestmentType('LUMPSUM');
                      setInvestAmount(activeFundModal.minLumpsumAmount);
                    }}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      investmentType === 'LUMPSUM'
                        ? 'bg-[#00d09c] text-slate-950 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    One-Time (Lumpsum)
                  </button>
                </div>

                {/* Amount Presets */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">
                    {investmentType === 'SIP' ? 'Monthly Installment Amount' : 'Investment Amount'}
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[1000, 2500, 5000, 10000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setInvestAmount(amt)}
                        className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          investAmount === amt
                            ? 'bg-[#00d09c] text-slate-950 border-[#00d09c]'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-[#00d09c]'
                        }`}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      value={investAmount}
                      onChange={(e) => setInvestAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0b0e14] text-sm font-bold focus:outline-none focus:border-[#00d09c]"
                    />
                  </div>
                </div>

                {/* SIP Day Selector */}
                {investmentType === 'SIP' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                      Monthly Auto-Debit Date
                    </label>
                    <select
                      value={sipDay}
                      onChange={(e) => setSipDay(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b0e14] text-xs font-bold"
                    >
                      {[1, 5, 10, 15, 20, 25].map((d) => (
                        <option key={d} value={d}>
                          {d}th of every month
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Calculation estimation */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Estimated Units:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {(investAmount / activeFundModal.nav).toFixed(3)} units
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Account Balance:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{formatINR(availableCash)}</span>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-500 font-medium bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleExecuteInvestment}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-[#00d09c]/20 flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        Confirm {investmentType === 'SIP' ? 'SIP Setup' : 'Lumpsum Investment'} of {formatINR(investAmount)}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
