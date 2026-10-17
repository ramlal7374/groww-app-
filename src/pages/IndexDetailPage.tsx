import React, { useState, useMemo } from 'react';
import { useTrade } from '../context/TradeContext';
import { MARKET_INDICES, MarketIndexInfo } from '../data/indicesData';
import { formatINR, formatPercent, api } from '../services/api';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Layers,
  BarChart3,
  PieChart,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  DollarSign
} from 'lucide-react';

interface IndexDetailPageProps {
  indexKey?: string;
}

export const IndexDetailPage: React.FC<IndexDetailPageProps> = ({ indexKey: propIndexKey }) => {
  const {
    selectedIndex,
    setSelectedIndex,
    navigateTo,
    setSelectedSymbol,
    wallet,
    refreshData,
    theme
  } = useTrade();

  const activeKey = propIndexKey || selectedIndex || 'nifty-50';
  const indexData: MarketIndexInfo = MARKET_INDICES[activeKey] || MARKET_INDICES['nifty-50'];

  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | '5Y' | 'ALL'>('1D');
  const [activeTab, setActiveTab] = useState<'overview' | 'constituents' | 'options' | 'trade'>('overview');

  // ETF / Index trading state
  const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL'>('BUY');
  const [units, setUnits] = useState<number>(25);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Approximate ETF unit price (Index / 100 or / 50 standard ETF structure e.g. NIFTYBEES)
  const etfUnitPrice = Number((indexData.currentValue / 100).toFixed(2));
  const totalOrderValue = units * etfUnitPrice;
  const availableCash = wallet?.balance || 0;

  const isUp = indexData.change >= 0;

  // Day Range Math
  const dayRange = Math.max(1, indexData.highValue - indexData.lowValue);
  const dayProgress = Math.min(100, Math.max(0, ((indexData.currentValue - indexData.lowValue) / dayRange) * 100));

  // 52W Range Math
  const yearRange = Math.max(1, indexData.week52High - indexData.week52Low);
  const yearProgress = Math.min(100, Math.max(0, ((indexData.currentValue - indexData.week52Low) / yearRange) * 100));

  // Simulated chart data points based on timeframe
  const chartPoints = useMemo(() => {
    const base = indexData.currentValue;
    const factor = timeframe === '1D' ? 0.005 : timeframe === '1W' ? 0.015 : timeframe === '1M' ? 0.03 : timeframe === '1Y' ? 0.12 : 0.25;
    const count = 30;
    const pts: { x: number; y: number }[] = [];
    let p = base * (1 - factor * (isUp ? 0.8 : -0.8));
    for (let i = 0; i < count; i++) {
      const delta = (Math.random() - 0.48) * (base * factor * 0.15);
      p += delta;
      pts.push({ x: i, y: p });
    }
    pts[pts.length - 1].y = base;
    return pts;
  }, [indexData, timeframe, isUp]);

  const minY = Math.min(...chartPoints.map((p) => p.y));
  const maxY = Math.max(...chartPoints.map((p) => p.y));
  const rangeY = Math.max(1, maxY - minY);

  const svgPath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    const width = 600;
    const height = 180;
    const pts = chartPoints.map((pt, idx) => {
      const x = (idx / (chartPoints.length - 1)) * width;
      const y = height - ((pt.y - minY) / rangeY) * (height - 30) - 15;
      return `${x},${y}`;
    });
    return `M ${pts.join(' L ')}`;
  }, [chartPoints, minY, rangeY]);

  // Execute Simulated ETF Order
  const handleExecuteETFOrder = async () => {
    setFeedback(null);
    if (units <= 0) {
      setFeedback({ type: 'error', message: 'Enter a valid unit quantity.' });
      return;
    }

    if (tradeAction === 'BUY' && totalOrderValue > availableCash) {
      setFeedback({
        type: 'error',
        message: `Insufficient balance. Need ${formatINR(totalOrderValue)}, but available balance is ${formatINR(availableCash)}.`
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Map index to representative constituent stock in simulated engine
      const representativeSymbol = indexData.constituents[0]?.symbol || 'RELIANCE';
      await api.placeOrder({
        symbol: representativeSymbol,
        side: tradeAction,
        orderType: 'MARKET',
        quantity: units
      });

      setFeedback({
        type: 'success',
        message: `Order executed: ${tradeAction} ${units} units of ${indexData.name} ETF at ${formatINR(etfUnitPrice)} per unit.`
      });

      await refreshData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Execution error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen py-6 px-3 sm:px-6 transition-colors ${
      theme === 'dark' ? 'bg-[#121418] text-slate-100' : 'bg-[#f8fafc] text-[#44475b]'
    }`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateTo('dashboard')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              theme === 'dark' ? 'bg-[#1c202a] text-slate-300 hover:bg-[#252b39]' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#00D09C]/15 text-[#00b386] dark:text-[#00D09C] border border-[#00D09C]/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D09C] animate-pulse" />
              Real Trading — Real Money
            </span>
          </div>
        </div>

        {/* Index Switcher Buttons Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {Object.values(MARKET_INDICES).map((idx) => {
            const isSelected = idx.key === activeKey;
            return (
              <button
                key={idx.key}
                onClick={() => setSelectedIndex(idx.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#00D09C] text-slate-950 shadow-md shadow-[#00D09C]/20'
                    : theme === 'dark'
                    ? 'bg-[#181b24] text-slate-400 hover:text-white border border-[#282e3e]'
                    : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200 shadow-2xs'
                }`}
              >
                <span>{idx.name}</span>
                <span className={`text-[11px] font-semibold ${idx.change >= 0 ? (isSelected ? 'text-slate-950' : 'text-[#00D09C]') : (isSelected ? 'text-slate-950' : 'text-[#eb5b3c]')}`}>
                  {idx.change >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Index Header Card */}
        <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
          theme === 'dark' ? 'bg-[#181b24] border-[#282e3e]' : 'bg-white border-[#eaedf0] shadow-sm'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#5367FF]/10 text-[#5367FF]">
                  {indexData.exchange}
                </span>
                <span className="text-xs text-slate-400 font-semibold">Benchmark Sector Index</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#44475b] dark:text-white">
                {indexData.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                {indexData.description}
              </p>
            </div>

            <div className="flex md:flex-col items-baseline md:items-end justify-between">
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-[#44475b] dark:text-white">
                {indexData.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className={`mt-1 flex items-center gap-1 text-sm font-bold ${isUp ? 'text-[#00D09C]' : 'text-[#eb5b3c]'}`}>
                {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>
                  {isUp ? '+' : ''}{indexData.change.toFixed(2)} ({isUp ? '+' : ''}{indexData.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Chart Section */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#00D09C]" />
                <span>Performance Chart</span>
              </div>

              {/* Timeframe Chips */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#13161d] p-1 rounded-xl">
                {(['1D', '1W', '1M', '1Y', '5Y', 'ALL'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      timeframe === tf
                        ? 'bg-[#00D09C] text-slate-950 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Chart */}
            <div className="relative h-44 w-full overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 600 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="index-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isUp ? '#00D09C' : '#eb5b3c'} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={isUp ? '#00D09C' : '#eb5b3c'} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area fill */}
                <path
                  d={`${svgPath} L 600,180 L 0,180 Z`}
                  fill="url(#index-gradient)"
                />
                {/* Stroke line */}
                <path
                  d={svgPath}
                  fill="none"
                  stroke={isUp ? '#00D09C' : '#eb5b3c'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Range Performance Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              {/* Today's Low / High */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                  <span>Day Low: {indexData.lowValue.toLocaleString('en-IN')}</span>
                  <span>Day High: {indexData.highValue.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-[#00D09C] rounded-full"
                    style={{ width: `${dayProgress}%` }}
                  />
                </div>
              </div>

              {/* 52-Week Low / High */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                  <span>52W Low: {indexData.week52Low.toLocaleString('en-IN')}</span>
                  <span>52W High: {indexData.week52High.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-[#5367FF] rounded-full"
                    style={{ width: `${yearProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Index Details Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#00D09C] text-slate-950'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Key Constituents ({indexData.constituents.length})
          </button>
          <button
            onClick={() => setActiveTab('trade')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'trade'
                ? 'bg-[#00D09C] text-slate-950'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Trade Index ETF
          </button>
          <button
            onClick={() => setActiveTab('options')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'options'
                ? 'bg-[#00D09C] text-slate-950'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Option Chain Preview
          </button>
        </div>

        {/* Tab 1: Constituents List */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#44475b] dark:text-white">
                Major Index Constituents by Weightage
              </h2>
              <span className="text-xs text-slate-400">Click any stock to trade</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {indexData.constituents.map((item) => {
                const itemUp = item.change >= 0;
                return (
                  <div
                    key={item.symbol}
                    onClick={() => {
                      setSelectedSymbol(item.symbol);
                      navigateTo('stock-details', item.symbol);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-md ${
                      theme === 'dark'
                        ? 'bg-[#181b24] border-[#282e3e] hover:border-[#00D09C]'
                        : 'bg-white border-[#eaedf0] hover:border-[#00D09C] shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-black text-[#44475b] dark:text-white group-hover:text-[#00D09C] transition-colors">
                          {item.symbol}
                        </h3>
                        <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{item.name}</p>
                      </div>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#5367FF]/10 text-[#5367FF]">
                        {item.weightage}% wt
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-sm font-bold text-[#44475b] dark:text-white">
                        {formatINR(item.price)}
                      </span>
                      <span className={`text-xs font-bold ${itemUp ? 'text-[#00D09C]' : 'text-[#eb5b3c]'}`}>
                        {itemUp ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Trade Index ETF */}
        {activeTab === 'trade' && (
          <div className={`p-6 sm:p-8 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#181b24] border-[#282e3e]' : 'bg-white border-[#eaedf0] shadow-sm'
          }`}>
            <div className="max-w-xl mx-auto space-y-5">
              <div>
                <h3 className="text-lg font-black text-[#44475b] dark:text-white">
                  Invest in {indexData.name} via ETF
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Exchange Traded Funds mirror the benchmark index with high liquidity and zero derivative expiry risk.
                </p>
              </div>

              {/* Buy / Sell Toggle */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-[#13161d] p-1">
                <button
                  onClick={() => setTradeAction('BUY')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    tradeAction === 'BUY'
                      ? 'bg-[#00D09C] text-slate-950 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  BUY ETF
                </button>
                <button
                  onClick={() => setTradeAction('SELL')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    tradeAction === 'SELL'
                      ? 'bg-[#eb5b3c] text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  SELL ETF
                </button>
              </div>

              {/* Quantity input */}
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Unit Quantity
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={units}
                    onChange={(e) => setUnits(Math.max(1, parseInt(e.target.value) || 1))}
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-bold ${
                      theme === 'dark'
                        ? 'bg-[#121418] border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                  <div className="flex gap-1">
                    {[25, 50, 100].map((q) => (
                      <button
                        key={q}
                        onClick={() => setUnits(q)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                          units === q
                            ? 'bg-[#00D09C] text-slate-950 border-[#00D09C]'
                            : 'bg-transparent border-slate-300 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        +{q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price calculations */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141720] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Unit ETF Nav Price:</span>
                  <span className="font-bold">{formatINR(etfUnitPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Available Cash:</span>
                  <span className="font-bold text-[#00D09C]">{formatINR(availableCash)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-extrabold">
                  <span>Total Order Value:</span>
                  <span className="text-[#5367FF]">{formatINR(totalOrderValue)}</span>
                </div>
              </div>

              {feedback && (
                <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-[#00D09C]/10 text-[#00b386] dark:text-[#00D09C] border border-[#00D09C]/20'
                    : 'bg-[#eb5b3c]/10 text-[#eb5b3c] border border-[#eb5b3c]/20'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{feedback.message}</span>
                </div>
              )}

              <button
                onClick={handleExecuteETFOrder}
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl text-sm font-black transition-all ${
                  tradeAction === 'BUY'
                    ? 'bg-[#00D09C] hover:bg-[#00b386] text-slate-950 shadow-md shadow-[#00D09C]/20'
                    : 'bg-[#eb5b3c] hover:bg-rose-600 text-white'
                }`}
              >
                {isSubmitting ? 'Processing Order...' : `${tradeAction} ${units} Units of ${indexData.name} ETF`}
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Option Chain Preview */}
        {activeTab === 'options' && (
          <div className={`p-6 rounded-3xl border overflow-x-auto ${
            theme === 'dark' ? 'bg-[#181b24] border-[#282e3e]' : 'bg-white border-[#eaedf0] shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-[#44475b] dark:text-white">
                  {indexData.name} Weekly Expiry Option Chain
                </h3>
                <p className="text-xs text-slate-400">Calls (CE) & Puts (PE) Strike Matrix</p>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded bg-[#00D09C]/15 text-[#00D09C]">
                ATM Spot: {indexData.currentValue.toFixed(0)}
              </span>
            </div>

            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                  <th className="py-2.5 text-left pl-3 text-[#00D09C]">Call LTP (CE)</th>
                  <th className="py-2.5">Call OI</th>
                  <th className="py-2.5 font-black bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4">
                    Strike Price
                  </th>
                  <th className="py-2.5">Put OI</th>
                  <th className="py-2.5 text-right pr-3 text-[#eb5b3c]">Put LTP (PE)</th>
                </tr>
              </thead>
              <tbody>
                {[-200, -100, 0, 100, 200].map((offset) => {
                  const strike = Math.round(indexData.currentValue / 50) * 50 + offset;
                  const isAtm = offset === 0;
                  const callPrice = Math.max(15, (250 - offset * 0.8)).toFixed(1);
                  const putPrice = Math.max(15, (240 + offset * 0.8)).toFixed(1);

                  return (
                    <tr
                      key={strike}
                      className={`border-b border-slate-100 dark:border-slate-800/60 transition-colors ${
                        isAtm ? 'bg-[#00D09C]/10 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-2.5 text-left pl-3 font-bold text-[#00b386] dark:text-[#00D09C]">
                        ₹{callPrice}
                      </td>
                      <td className="py-2.5 text-slate-400">{(Math.random() * 1.5 + 0.8).toFixed(1)}M</td>
                      <td className={`py-2.5 font-black px-4 ${isAtm ? 'bg-[#00D09C] text-slate-950 rounded' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}>
                        {strike} {isAtm && '• ATM'}
                      </td>
                      <td className="py-2.5 text-slate-400">{(Math.random() * 1.8 + 0.9).toFixed(1)}M</td>
                      <td className="py-2.5 text-right pr-3 font-bold text-[#eb5b3c]">
                        ₹{putPrice}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
