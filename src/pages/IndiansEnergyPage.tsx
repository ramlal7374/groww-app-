import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrade } from '../context/TradeContext';
import { formatINR } from '../services/api';
import { Stock } from '../types';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Calculator,
  ArrowRight,
  Sparkles,
  Percent,
  Wallet,
  Building2,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BarChart3,
  Flame,
  Sun,
  Wind,
  Droplets,
  PlusCircle,
  ExternalLink,
  Target
} from 'lucide-react';

interface EnergyPlan {
  id: string;
  name: string;
  tag: string;
  investAmount: number;
  returnDurationHours: number;
  profitAmount: number;
  targetFocus: string;
  themeColor: string;
  commissionPercent: number;
  popular?: boolean;
}

export const IndiansEnergyPage: React.FC = () => {
  const { stocks, wallet, setQuickAddModalOpen, openOrderModal, navigateTo, theme, addNotification } = useTrade();

  // Active section tab: 'plans' | 'profit' | 'loss' | 'stocks'
  const [activeTab, setActiveTab] = useState<'plans' | 'profit' | 'loss' | 'stocks'>('plans');

  // Selected plan for quick simulator
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-3');

  // Custom Simulator State
  const [customInvestAmount, setCustomInvestAmount] = useState<number>(10000);
  const [customDurationHours, setCustomDurationHours] = useState<number>(2);
  const [customMultiplier, setCustomMultiplier] = useState<number>(4); // 4x profit return model
  const [commissionRate, setCommissionRate] = useState<number>(25); // 25% realized commission note

  // Profit subsection state
  const [profitStockSymbol, setProfitStockSymbol] = useState<string>('TATAPOWER');
  const [profitInvestAmount, setProfitInvestAmount] = useState<number>(25000);
  const [profitTargetGainPercent, setProfitTargetGainPercent] = useState<number>(45);

  // Loss subsection state
  const [lossStockSymbol, setLossStockSymbol] = useState<string>('SUZLON');
  const [lossInvestAmount, setLossInvestAmount] = useState<number>(20000);
  const [lossDrawdownPercent, setLossDrawdownPercent] = useState<number>(25);
  const [stopLossPercent, setStopLossPercent] = useState<number>(5);

  // Filter Indian Energy Stocks
  const energyStocks = useMemo(() => {
    const energySymbols = ['TATAPOWER', 'NTPC', 'ADANIGREEN', 'SUZLON', 'POWERGRID', 'ONGC', 'RELIANCE', 'IOC'];
    const matched = stocks.filter((s) => energySymbols.includes(s.symbol.toUpperCase()));
    if (matched.length > 0) return matched;
    // Fallback if not loaded yet
    return stocks.filter(
      (s) =>
        s.sector.toLowerCase().includes('energy') ||
        s.sector.toLowerCase().includes('power') ||
        s.sector.toLowerCase().includes('clean')
    );
  }, [stocks]);

  // Defined Plans matching the exact user specification
  const energyPlans: EnergyPlan[] = [
    {
      id: 'plan-1',
      name: 'Starter Energy Tier',
      tag: 'Fast Track 1-Hour',
      investAmount: 3000,
      returnDurationHours: 1,
      profitAmount: 12000,
      targetFocus: 'Suzlon Energy Wind EPC & Turnaround Smallcaps',
      themeColor: 'from-emerald-500 to-teal-700',
      commissionPercent: 25
    },
    {
      id: 'plan-2',
      name: 'Growth Energy Tier',
      tag: 'Rapid 1-Hour',
      investAmount: 5000,
      returnDurationHours: 1,
      profitAmount: 20000,
      targetFocus: 'Tata Power Rooftop Solar Microgrids & EV Infra',
      themeColor: 'from-teal-500 to-cyan-700',
      commissionPercent: 25
    },
    {
      id: 'plan-3',
      name: 'Executive Energy Tier',
      tag: 'Most Popular 2-Hour',
      investAmount: 10000,
      returnDurationHours: 2,
      profitAmount: 40000,
      targetFocus: 'NTPC Green Energy Non-Fossil Generation Pipeline',
      themeColor: 'from-emerald-600 to-green-800',
      commissionPercent: 25,
      popular: true
    },
    {
      id: 'plan-4',
      name: 'Premium Energy Tier',
      tag: 'Power 3-Hour',
      investAmount: 20000,
      returnDurationHours: 3,
      profitAmount: 80000,
      targetFocus: 'Adani Green Hybrid Khavda 30GW Renewable Park',
      themeColor: 'from-blue-600 to-indigo-800',
      commissionPercent: 25
    },
    {
      id: 'plan-5',
      name: 'HNI Energy Tier',
      tag: 'High Yield 3-Hour',
      investAmount: 25000,
      returnDurationHours: 3,
      profitAmount: 100000,
      targetFocus: 'Power Grid High-Voltage Interstate Solar Corridor',
      themeColor: 'from-purple-600 to-indigo-900',
      commissionPercent: 25
    },
    {
      id: 'plan-6',
      name: 'Institutional Energy Tier',
      tag: 'Capital Scale 4-Hour',
      investAmount: 50000,
      returnDurationHours: 4,
      profitAmount: 200000,
      targetFocus: 'Diversified Conglomerate Clean Energy Basket',
      themeColor: 'from-amber-600 to-orange-800',
      commissionPercent: 25
    },
    {
      id: 'plan-7',
      name: 'Venture Clean-Tech Tier',
      tag: 'Maximum Return 4-Hour',
      investAmount: 100000,
      returnDurationHours: 4,
      profitAmount: 400000,
      targetFocus: 'National Green Hydrogen Mission Sovereign Corridor',
      themeColor: 'from-emerald-500 via-teal-600 to-slate-900',
      commissionPercent: 25
    }
  ];

  const currentSelectedPlan = energyPlans.find((p) => p.id === selectedPlanId) || energyPlans[2];

  // Calculations for custom simulator
  const simInvest = customInvestAmount;
  const simProfit = simInvest * customMultiplier;
  const simGrossTotal = simInvest + simProfit;
  const simCommission = simProfit * (commissionRate / 100);
  const simNetProfit = simProfit - simCommission;
  const simNetPayout = simInvest + simNetProfit;

  // Stock for profit simulator
  const activeProfitStock =
    stocks.find((s) => s.symbol.toUpperCase() === profitStockSymbol.toUpperCase()) ||
    stocks[0] || { currentPrice: 400, name: 'Tata Power', symbol: 'TATAPOWER' };

  // Calculations for Profit Section
  const profitShares = Math.floor(profitInvestAmount / (activeProfitStock?.currentPrice || 1));
  const profitActualInvested = profitShares * (activeProfitStock?.currentPrice || 1);
  const profitExitPrice = (activeProfitStock?.currentPrice || 1) * (1 + profitTargetGainPercent / 100);
  const profitGrossValue = profitShares * profitExitPrice;
  const profitGrossGain = profitGrossValue - profitActualInvested;
  // Estimated statutory deductions
  const profitBrokerage = 20; // flat 20
  const profitSTT = profitGrossValue * 0.001; // 0.1%
  const profitNetTakeHome = Math.max(0, profitGrossGain - profitBrokerage - profitSTT);

  // Stock for loss simulator
  const activeLossStock =
    stocks.find((s) => s.symbol.toUpperCase() === lossStockSymbol.toUpperCase()) ||
    stocks[1] || { currentPrice: 60, name: 'Suzlon Energy', symbol: 'SUZLON' };

  // Calculations for Loss Section
  const lossShares = Math.floor(lossInvestAmount / (activeLossStock?.currentPrice || 1));
  const lossActualInvested = lossShares * (activeLossStock?.currentPrice || 1);
  // Unhedged loss
  const unhedgedExitPrice = (activeLossStock?.currentPrice || 1) * (1 - lossDrawdownPercent / 100);
  const unhedgedValue = lossShares * unhedgedExitPrice;
  const unhedgedLossAmount = lossActualInvested - unhedgedValue;
  // Hedged with Stop Loss
  const stopLossExitPrice = (activeLossStock?.currentPrice || 1) * (1 - stopLossPercent / 100);
  const hedgedValue = lossShares * stopLossExitPrice;
  const hedgedLossAmount = lossActualInvested - hedgedValue;
  const capitalSaved = unhedgedLossAmount - hedgedLossAmount;

  const handleTestPlanInDemat = (plan: EnergyPlan) => {
    if (!wallet || wallet.balance < plan.investAmount) {
      addNotification({
        type: 'warning',
        title: 'Insufficient Demat Balance',
        message: `You need ${formatINR(plan.investAmount)} to simulate this plan. Please add funds first.`
      });
      setQuickAddModalOpen(true);
      return;
    }

    addNotification({
      type: 'success',
      title: `${plan.name} Activated`,
      message: `Simulated allocation of ${formatINR(plan.investAmount)} initialized with ${plan.returnDurationHours}-hour projection!`
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-7 pb-28 md:pb-16 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-6 sm:p-8">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 animate-pulse text-amber-500" />
              <span>National Clean Energy Strategy • 2030 Horizon</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <span>Indians Energy</span>
              <span className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-xl bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] border border-[#00d09c]/30">
                Fintech Hub
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Explore curated Indian energy investment plans, multi-bagger renewable energy setups, and
              simulated Profit &amp; Loss risk engineering models. Tested across India’s premier power and clean-tech leaders.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Solar &amp; Microgrids
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-sky-400" /> Wind Turbines
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-teal-400" /> Green Hydrogen
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> 500 GW Target
              </span>
            </div>
          </div>

          {/* Quick Demat Balance & Add Money Card */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0c0f17]/90 backdrop-blur-sm space-y-3 min-w-[260px] shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#00d09c]" />
                <span>Available Demat Cash</span>
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {formatINR(wallet?.balance || 0)}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                id="indians-energy-add-funds-btn"
                onClick={() => setQuickAddModalOpen(true)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Funds</span>
              </button>
              <button
                onClick={() => navigateTo('wallet')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs transition-colors"
                title="Wallet Ledger"
              >
                <Building2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Sector Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block text-[11px]">NIFTY Energy Index</span>
            <span className="text-emerald-500 font-black text-sm">41,284.60 (+1.82%)</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[11px]">CapEx Commitment</span>
            <span className="text-slate-900 dark:text-white font-black text-sm">₹14.5 Lakh Cr</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[11px]">Clean Power Multiplier</span>
            <span className="text-emerald-500 font-black text-sm">4.0x Simulated</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[11px]">Performance Commission</span>
            <span className="text-amber-500 font-black text-sm">25% upon Realization</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#111622] overflow-x-auto scrollbar-none">
        {[
          { id: 'plans', label: 'Investment Plans', icon: Flame, badge: '7 Tiers' },
          { id: 'profit', label: 'Profit Section', icon: TrendingUp, badge: 'Stock Simulator' },
          { id: 'loss', label: 'Loss Section', icon: TrendingDown, badge: 'Risk & Stop-Loss' },
          { id: 'stocks', label: 'Indian Energy Stocks', icon: BarChart3, badge: `${energyStocks.length} Live` }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-energy-${tab.id}`}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[120px] sm:min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-[#1b2234] text-slate-950 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  tab.id === 'profit'
                    ? 'text-emerald-500'
                    : tab.id === 'loss'
                    ? 'text-rose-500'
                    : 'text-[#00d09c]'
                }`}
              />
              <span className="whitespace-nowrap">{tab.label}</span>
              <span
                className={`hidden md:inline-block text-[10px] px-1.5 py-0.2 rounded-md ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: INVESTMENT PLANS (The User Specified Tiers)
         ========================================================================= */}
      {activeTab === 'plans' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Section Description & Rules */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Simulated Energy Growth Plans • Verified Multipliers</span>
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                Each plan projects an indicative 4x profit multiplier model based on fast-moving clean power swings.
                A 25% performance commission applies only after realized profits.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] bg-amber-500/10 text-amber-500 dark:text-amber-400 font-bold px-2.5 py-1 rounded-xl border border-amber-500/20">
                Note: 25% Commission upon Realization
              </span>
            </div>
          </div>

          {/* Grid of All 7 Specified Plans */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {energyPlans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const totalPayout = plan.investAmount + plan.profitAmount;
              const commissionVal = plan.profitAmount * (plan.commissionPercent / 100);
              const netProfit = plan.profitAmount - commissionVal;

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl border transition-all p-5 flex flex-col justify-between relative overflow-hidden ${
                    isSelected
                      ? 'border-[#00d09c] bg-emerald-500/5 dark:bg-[#121927] shadow-lg shadow-emerald-500/10 ring-2 ring-[#00d09c]/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {plan.tag}
                    </span>
                    {plan.popular && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                        Top Choice
                      </span>
                    )}
                  </div>

                  {/* Title & Target */}
                  <div className="space-y-1 mb-4">
                    <h3 className="font-black text-base text-slate-900 dark:text-white tracking-tight">
                      {plan.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {plan.targetFocus}
                    </p>
                  </div>

                  {/* Investment & Return Numbers */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0b0e14] border border-slate-200/80 dark:border-slate-800/80 space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Invest</span>
                      <span className="font-black text-slate-900 dark:text-white text-sm">
                        {formatINR(plan.investAmount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                        <span>Simulated Profit</span>
                        <span className="text-[10px] text-slate-400">({plan.returnDurationHours}h)</span>
                      </span>
                      <span className="font-black text-emerald-500 text-sm">
                        +{formatINR(plan.profitAmount)}
                      </span>
                    </div>

                    <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Total Projected Return</span>
                      <span className="font-black text-[#00b386] dark:text-[#00d09c] text-base">
                        {formatINR(totalPayout)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>Net after 25% fee:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {formatINR(plan.investAmount + netProfit)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      id={`test-plan-btn-${plan.id}`}
                      type="button"
                      onClick={() => handleTestPlanInDemat(plan)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Invest {formatINR(plan.investAmount)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanId(plan.id);
                        setCustomInvestAmount(plan.investAmount);
                        setCustomDurationHours(plan.returnDurationHours);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Calculator className="w-3 h-3" />
                      <span>Load in Simulator</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Custom Plan Simulator */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    Energy Plan Return Simulator
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Adjust investment capital, time horizon, and inspect real-time profit and fee breakdowns
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Quick Select:</span>
                {[3000, 5000, 10000, 25000, 50000, 100000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCustomInvestAmount(preset)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      customInvestAmount === preset
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {preset >= 100000 ? `₹${preset / 100000}L` : `₹${preset / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Controls */}
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Investment Capital (₹)
                    </label>
                    <span className="text-sm font-black text-emerald-500">
                      {formatINR(customInvestAmount)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={200000}
                    step={1000}
                    value={customInvestAmount}
                    onChange={(e) => setCustomInvestAmount(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>₹1,000</span>
                    <span>₹50,000</span>
                    <span>₹1,00,000</span>
                    <span>₹2,00,000</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Projected Duration Window
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { hours: 1, label: '1 Hour' },
                      { hours: 2, label: '2 Hours' },
                      { hours: 3, label: '3 Hours' },
                      { hours: 4, label: '4 Hours' }
                    ].map((d) => (
                      <button
                        key={d.hours}
                        type="button"
                        onClick={() => setCustomDurationHours(d.hours)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          customDurationHours === d.hours
                            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500'
                            : 'bg-slate-50 dark:bg-[#0b0e14] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-600 dark:text-amber-400 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Info className="w-4 h-4" />
                    <span>Realization Commission Rule</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    A fixed 25% performance commission is deducted exclusively from the realized profit after the payout cycle completes. No upfront advisory fees are charged.
                  </p>
                </div>
              </div>

              {/* Output Display Card */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Projected Calculation
                  </span>
                  <span className="text-xs bg-emerald-500/15 text-emerald-500 font-bold px-2 py-0.5 rounded-full">
                    {customMultiplier}x Multiplier
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Capital Invested:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatINR(simInvest)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Gross Simulated Profit ({customDurationHours}h):</span>
                    <span className="font-bold text-emerald-500">
                      +{formatINR(simProfit)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">25% Realized Profit Commission:</span>
                    <span className="font-bold text-rose-500">
                      -{formatINR(simCommission)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Net Take-Home Profit:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatINR(simNetProfit)}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Total Payout to Demat
                    </span>
                    <span className="text-2xl font-black text-[#00b386] dark:text-[#00d09c]">
                      {formatINR(simNetPayout)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Net ROI</span>
                    <span className="text-base font-black text-emerald-500">+300%</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setQuickAddModalOpen(true)}
                  className="w-full py-3 rounded-2xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                  <span>Deposit Funds to Begin Live Strategy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PROFIT SUBSECTION (Stock Examples & Profit Calculations)
         ========================================================================= */}
      {activeTab === 'profit' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                <TrendingUp className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Indians Energy: Profit Section
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select a live stock share, enter your investment capital, and calculate guaranteed upward simulated gains with statutory deductions.
                </p>
              </div>
            </div>
          </div>

          {/* Stock Share Selector Pills */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Select Energy Stock Share to Model Profit:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { symbol: 'TATAPOWER', name: 'Tata Power', price: 418.65, gain: '+45%' },
                { symbol: 'NTPC', name: 'NTPC Limited', price: 388.40, gain: '+38%' },
                { symbol: 'ADANIGREEN', name: 'Adani Green', price: 1782.50, gain: '+65%' },
                { symbol: 'SUZLON', name: 'Suzlon Energy', price: 62.45, gain: '+110%' },
                { symbol: 'POWERGRID', name: 'Power Grid', price: 312.80, gain: '+28%' },
                { symbol: 'ONGC', name: 'ONGC Oil & Gas', price: 296.15, gain: '+32%' }
              ].map((stk) => {
                const isSelected = profitStockSymbol === stk.symbol;
                return (
                  <button
                    key={stk.symbol}
                    type="button"
                    onClick={() => setProfitStockSymbol(stk.symbol)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 text-slate-900 dark:text-white shadow-xs ring-1 ring-emerald-500/40'
                        : 'bg-white dark:bg-[#111622] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-xs">{stk.symbol}</span>
                      <span className="text-[10px] font-bold text-emerald-500">{stk.gain}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{stk.name}</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                      {formatINR(stk.price)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Profit Calculator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Controls */}
            <div className="lg:col-span-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] p-6 space-y-5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-500" />
                <span>Profit Parameters ({profitStockSymbol})</span>
              </h3>

              {/* Capital Input */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Investment Capital (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={profitInvestAmount}
                    onChange={(e) => setProfitInvestAmount(Math.max(100, Number(e.target.value)))}
                    className="w-full bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800 rounded-2xl pl-8 pr-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex gap-1.5 mt-2">
                  {[3000, 5000, 10000, 25000, 50000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setProfitInvestAmount(amt)}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-500 hover:text-white cursor-pointer"
                    >
                      {amt >= 100000 ? `₹${amt / 100000}L` : `₹${amt / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profit Target Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Projected Profit Target
                  </label>
                  <span className="text-sm font-black text-emerald-500">
                    +{profitTargetGainPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={400}
                  step={5}
                  value={profitTargetGainPercent}
                  onChange={(e) => setProfitTargetGainPercent(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>+10% (Steady)</span>
                  <span>+45% (Swing)</span>
                  <span>+100% (2x)</span>
                  <span>+400% (4x)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs space-y-1">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                  Simulated Share Accumulation:
                </span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Buying ~<strong className="text-slate-900 dark:text-white">{profitShares} shares</strong> of{' '}
                  {profitStockSymbol} at Current Market Price of{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {formatINR(activeProfitStock?.currentPrice || 1)}
                  </strong>
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  const targetStk = stocks.find((s) => s.symbol === profitStockSymbol);
                  if (targetStk) openOrderModal(targetStk, 'BUY');
                }}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Execute Simulated Buy on {profitStockSymbol}</span>
              </button>
            </div>

            {/* Output Display */}
            <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] p-6 sm:p-8 space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Simulated Profit Breakdown
                    </h3>
                    <p className="text-xs text-slate-500">
                      Calculated returns upon reaching target exit price of {formatINR(profitExitPrice)}
                    </p>
                  </div>
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    Always In Profit
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 my-5">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">
                      Capital Employed
                    </span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {formatINR(profitActualInvested)}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                      Gross Simulated Profit
                    </span>
                    <span className="text-xl font-black text-emerald-500">
                      +{formatINR(profitGrossGain)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-500">Exit Share Price:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {formatINR(profitExitPrice)} (+{profitTargetGainPercent}%)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-500">Est. Exchange Turnover &amp; Brokerage:</span>
                    <span className="font-bold text-slate-600 dark:text-slate-400 font-mono">
                      ₹{profitBrokerage.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-500">Securities Transaction Tax (STT 0.1%):</span>
                    <span className="font-bold text-slate-600 dark:text-slate-400 font-mono">
                      ₹{profitSTT.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                    Net Take-Home Profit
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#00b386] dark:text-[#00d09c]">
                    +{formatINR(profitNetTakeHome)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-semibold">Total Demat Payout</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {formatINR(profitActualInvested + profitNetTakeHome)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: LOSS SUBSECTION (Downside Risk & Stop-Loss Simulation)
         ========================================================================= */}
      {activeTab === 'loss' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-500/15 via-orange-500/10 to-transparent border border-rose-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black">
                <TrendingDown className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Indians Energy: Loss Section &amp; Downside Risk
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Simulate stock downturns, observe how profits drop to zero without protection, and discover how Stop-Loss orders defend your Demat capital.
                </p>
              </div>
            </div>
          </div>

          {/* Stock Share Selector for Loss Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Select High-Beta Stock Share to Model Downside Volatility:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { symbol: 'SUZLON', name: 'Suzlon Energy', beta: 'Beta: 1.62' },
                { symbol: 'ADANIGREEN', name: 'Adani Green', beta: 'Beta: 1.48' },
                { symbol: 'TATAPOWER', name: 'Tata Power', beta: 'Beta: 1.25' },
                { symbol: 'NTPC', name: 'NTPC Limited', beta: 'Beta: 0.95' },
                { symbol: 'ONGC', name: 'ONGC Oil & Gas', beta: 'Beta: 0.90' },
                { symbol: 'POWERGRID', name: 'Power Grid', beta: 'Beta: 0.72' }
              ].map((stk) => {
                const isSelected = lossStockSymbol === stk.symbol;
                return (
                  <button
                    key={stk.symbol}
                    type="button"
                    onClick={() => setLossStockSymbol(stk.symbol)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500/15 border-rose-500 text-slate-900 dark:text-white shadow-xs ring-1 ring-rose-500/40'
                        : 'bg-white dark:bg-[#111622] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-xs">{stk.symbol}</span>
                      <span className="text-[10px] font-bold text-rose-500">{stk.beta}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{stk.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Loss & Stop Loss Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Controls */}
            <div className="lg:col-span-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] p-6 space-y-5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Risk Scenario Controls ({lossStockSymbol})</span>
              </h3>

              {/* Investment Amount */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Capital Allocated (₹)
                </label>
                <input
                  type="number"
                  value={lossInvestAmount}
                  onChange={(e) => setLossInvestAmount(Math.max(100, Number(e.target.value)))}
                  className="w-full bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Unhedged Market Drop */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Simulated Market Drop / Drawdown
                  </label>
                  <span className="text-sm font-black text-rose-500">
                    -{lossDrawdownPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={5}
                  value={lossDrawdownPercent}
                  onChange={(e) => setLossDrawdownPercent(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>-5% (Dip)</span>
                  <span>-25% (Correction)</span>
                  <span>-50% (Crash)</span>
                </div>
              </div>

              {/* Stop Loss Trigger */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Automated Stop-Loss Guard</span>
                  </label>
                  <span className="text-sm font-black text-emerald-500">
                    Strict -{stopLossPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={15}
                  step={1}
                  value={stopLossPercent}
                  onChange={(e) => setStopLossPercent(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>-2% Tight</span>
                  <span>-5% Standard</span>
                  <span>-15% Wide</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs space-y-1">
                <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Profit Drops to Zero Without Protection:</span>
                </span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  As soon as a share plunges without a Stop-Loss, profits drop to ₹0 and principal is eroded. By setting a Stop-Loss, you lock maximum risk to just {stopLossPercent}%.
                </p>
              </div>
            </div>

            {/* Comparison Cards: Unhedged vs Protected */}
            <div className="lg:col-span-7 space-y-4">
              {/* Unhedged Card */}
              <div className="p-6 rounded-3xl border border-rose-500/40 bg-rose-500/5 dark:bg-[#191114] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center font-black">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-rose-500">
                        Scenario A: Unprotected Drop (-{lossDrawdownPercent}%)
                      </h4>
                      <p className="text-[11px] text-slate-400">No stop-loss active • Profit drops to zero</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                    Profit: ₹0
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-black/20 text-xs">
                    <span className="text-slate-400 block mb-0.5 text-[10px]">Eroded Capital</span>
                    <span className="font-black text-rose-500 text-lg">
                      -{formatINR(unhedgedLossAmount)}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/20 text-xs">
                    <span className="text-slate-400 block mb-0.5 text-[10px]">Remaining Value</span>
                    <span className="font-black text-slate-900 dark:text-white text-lg">
                      {formatINR(unhedgedValue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Protected with Stop-Loss Card */}
              <div className="p-6 rounded-3xl border border-emerald-500/40 bg-emerald-500/5 dark:bg-[#111a18] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-black">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-emerald-500">
                        Scenario B: Protected by Stop-Loss (-{stopLossPercent}%)
                      </h4>
                      <p className="text-[11px] text-slate-400">Auto-exit triggered • 95% capital preserved</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Safe Exit
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-black/20 text-xs">
                    <span className="text-slate-400 block mb-0.5 text-[10px]">Controlled Loss</span>
                    <span className="font-black text-amber-400 text-base">
                      -{formatINR(hedgedLossAmount)}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/20 text-xs">
                    <span className="text-slate-400 block mb-0.5 text-[10px]">Saved from Crash</span>
                    <span className="font-black text-emerald-500 text-base">
                      +{formatINR(capitalSaved)}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/20 text-xs">
                    <span className="text-slate-400 block mb-0.5 text-[10px]">Preserved Balance</span>
                    <span className="font-black text-slate-900 dark:text-white text-base">
                      {formatINR(hedgedValue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Golden Rule Callout */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <span>The 1:3 Risk-to-Reward Ratio</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                  By risking only 5% with a Stop-Loss while targeting 15% to 45% gains in clean energy leaders, a trader stays reliably profitable even if 5 out of 10 trades hit their stop loss!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: LIVE INDIAN ENERGY STOCKS DIRECT TRADING TABLE
         ========================================================================= */}
      {activeTab === 'stocks' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Live Indian Clean Energy &amp; Power Shares
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct market prices, 52-week ranges, and instant simulated order execution
              </p>
            </div>
            <button
              onClick={() => setQuickAddModalOpen(true)}
              className="py-2 px-3 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Money to Trade</span>
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider bg-slate-50/50 dark:bg-[#0c0f17]/50">
                    <th className="py-3 px-4">Company &amp; Symbol</th>
                    <th className="py-3 px-4">Sector</th>
                    <th className="py-3 px-4 text-right">Market Price</th>
                    <th className="py-3 px-4 text-right">24h Change</th>
                    <th className="py-3 px-4 text-right">52W Range</th>
                    <th className="py-3 px-4 text-right">Market Cap</th>
                    <th className="py-3 px-4 text-center">Simulated Trade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {energyStocks.map((stock) => {
                    const isPositive = stock.change >= 0;
                    return (
                      <tr
                        key={stock.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-black text-slate-900 dark:text-white text-sm">
                            {stock.symbol}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                            {stock.name}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                            {stock.sector}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                          {formatINR(stock.currentPrice)}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold">
                          <span
                            className={`inline-flex items-center gap-0.5 ${
                              isPositive ? 'text-emerald-500' : 'text-rose-500'
                            }`}
                          >
                            {isPositive ? '+' : ''}
                            {stock.changePercent.toFixed(2)}%
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          ₹{stock.week52Low} - ₹{stock.week52High}
                        </td>

                        <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          ₹{(stock.marketCap / 1000).toFixed(1)}k Cr
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              id={`buy-stock-${stock.symbol}`}
                              type="button"
                              onClick={() => openOrderModal(stock, 'BUY')}
                              className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
                            >
                              Buy
                            </button>
                            <button
                              id={`sell-stock-${stock.symbol}`}
                              type="button"
                              onClick={() => openOrderModal(stock, 'SELL')}
                              className="px-3 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 border border-rose-500/30 font-bold text-xs transition-colors cursor-pointer"
                            >
                              Sell
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
