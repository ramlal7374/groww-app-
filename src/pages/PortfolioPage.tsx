import React, { useState, useMemo } from 'react';
import { useTrade } from '../context/TradeContext';
import { formatINR, formatPercent } from '../services/api';
import { PnLMovementIndicator } from '../components/PnLMovementIndicator';
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  PieChart,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  ChevronRight,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  ListOrdered
} from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const {
    portfolio,
    stocks,
    transactions,
    navigateTo,
    setSelectedSymbol,
    openOrderModal,
    setQuickAddModalOpen,
    theme,
    wallet,
    mutualFundInvestments,
    previousPriceMap
  } = useTrade();

  const [activeTab, setActiveTab] = useState<'HOLDINGS' | 'MUTUAL_FUNDS' | 'TRANSACTIONS'>('HOLDINGS');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'value' | 'pnl' | 'name'>('value');
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<string>('ALL');

  const summary = portfolio?.summary || {
    totalInvested: 0,
    currentValue: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    unrealizedPnL: 0,
    realizedPnL: 0,
    oneDayPnL: 0,
    oneDayPnLPercent: 0,
    holdingsCount: 0,
    availableVirtualCash: wallet?.balance || 0
  };

  const holdings = portfolio?.holdings || [];

  // Group by sector for allocation visualizer
  const sectorMap: Record<string, number> = {};
  holdings.forEach((h) => {
    sectorMap[h.sector] = (sectorMap[h.sector] || 0) + h.currentValue;
  });

  const sectorList = Object.entries(sectorMap).map(([sector, val]) => ({
    sector,
    value: val,
    percent: summary.currentValue > 0 ? (val / summary.currentValue) * 100 : 0
  }));

  // Filter & sort
  const filteredHoldings = holdings
    .filter(
      (h) =>
        h.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'value') return b.currentValue - a.currentValue;
      if (sortBy === 'pnl') return b.unrealizedPnL - a.unrealizedPnL;
      return a.name.localeCompare(b.name);
    });

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchType = txTypeFilter === 'ALL' || t.type === txTypeFilter;
      const matchSearch =
        !txSearchQuery.trim() ||
        t.description.toLowerCase().includes(txSearchQuery.toLowerCase()) ||
        (t.stock && t.stock.toLowerCase().includes(txSearchQuery.toLowerCase()));
      return matchType && matchSearch;
    });
  }, [transactions, txTypeFilter, txSearchQuery]);

  const handleStockClick = (symbol: string) => {
    setSelectedSymbol(symbol);
    navigateTo('stock-details', symbol);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#00d09c]" />
            <span>Holdings & Portfolio</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time valuation of your live equity positions, dynamic P&L, and returns
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickAddModalOpen(true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 ${
              theme === 'dark'
                ? 'bg-[#151922] hover:bg-slate-800 border-slate-800 text-[#00d09c]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-[#00b386] shadow-2xs'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Money</span>
          </button>
          <button
            onClick={() => navigateTo('markets')}
            className="px-3.5 py-1.5 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 text-xs font-black transition-all shadow-md shadow-[#00d09c]/20 flex items-center gap-1.5"
          >
            <span>Explore Stocks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid (5-column layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Current Value */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className="text-[11px] font-semibold text-slate-400 block">Current Value</span>
          <div className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            {formatINR(summary.currentValue)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Across {summary.holdingsCount} stock position(s)
          </span>
        </div>

        {/* Total Invested */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className="text-[11px] font-semibold text-slate-400 block">Total Invested</span>
          <div className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            {formatINR(summary.totalInvested)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Cost basis of holdings
          </span>
        </div>

        {/* Unrealized P&L (Total Returns) */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className="text-[11px] font-semibold text-slate-400 block">Unrealized P&L</span>
          <div
            className={`text-xl sm:text-2xl font-black tracking-tight mt-1 flex items-center gap-1 ${
              summary.totalPnL >= 0 ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
            }`}
          >
            {summary.totalPnL >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{formatINR(summary.totalPnL)}</span>
          </div>
          <span
            className={`text-[11px] font-bold block mt-1 ${
              summary.totalPnL >= 0 ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
            }`}
          >
            {formatPercent(summary.totalPnLPercent)} overall
          </span>
        </div>

        {/* Realized P&L */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className="text-[11px] font-semibold text-slate-400 block">Realized P&L</span>
          <div
            className={`text-xl sm:text-2xl font-black tracking-tight mt-1 flex items-center gap-1 ${
              (summary.realizedPnL || 0) >= 0 ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
            }`}
          >
            {(summary.realizedPnL || 0) >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{formatINR(summary.realizedPnL || 0)}</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Booked on closed trades
          </span>
        </div>

        {/* 1-Day Returns */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className="text-[11px] font-semibold text-slate-400 block">1-Day Returns</span>
          <div
            className={`text-xl sm:text-2xl font-black tracking-tight mt-1 flex items-center gap-1 ${
              summary.oneDayPnL >= 0 ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
            }`}
          >
            {summary.oneDayPnL >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{formatINR(summary.oneDayPnL)}</span>
          </div>
          <span
            className={`text-[11px] font-bold block mt-1 ${
              summary.oneDayPnL >= 0 ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
            }`}
          >
            {formatPercent(summary.oneDayPnLPercent)} today
          </span>
        </div>
      </div>

      {/* Sector Allocation Breakdown */}
      {sectorList.length > 0 && (
        <div
          className={`p-5 rounded-3xl border space-y-3 ${
            theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-[#00d09c]" />
              <span>Sector Diversification</span>
            </span>
            <span className="text-slate-400">{sectorList.length} Sector(s)</span>
          </div>

          {/* Multi-color segment bar */}
          <div className="h-2.5 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800">
            {sectorList.map((item, idx) => {
              const colors = ['#00d09c', '#38bdf8', '#fbbf24', '#a855f7', '#f43f5e', '#34d399'];
              return (
                <div
                  key={item.sector}
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: colors[idx % colors.length]
                  }}
                  title={`${item.sector}: ${item.percent.toFixed(1)}%`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            {sectorList.map((item, idx) => {
              const colors = ['#00d09c', '#38bdf8', '#fbbf24', '#a855f7', '#f43f5e', '#34d399'];
              return (
                <div key={item.sector} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: colors[idx % colors.length] }}
                  />
                  <span className="font-semibold">{item.sector}</span>
                  <span className="text-slate-400 font-mono">({item.percent.toFixed(1)}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Portfolio Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          id="portfolio-tab-holdings"
          onClick={() => setActiveTab('HOLDINGS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'HOLDINGS'
              ? 'bg-[#00d09c] text-slate-950 shadow-md shadow-[#00d09c]/20'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Holdings & Positions ({holdings.length})</span>
        </button>
        <button
          id="portfolio-tab-mutual-funds"
          onClick={() => setActiveTab('MUTUAL_FUNDS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'MUTUAL_FUNDS'
              ? 'bg-[#00d09c] text-slate-950 shadow-md shadow-[#00d09c]/20'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Mutual Funds ({mutualFundInvestments.length})</span>
        </button>
        <button
          id="portfolio-tab-transactions"
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'TRANSACTIONS'
              ? 'bg-[#00d09c] text-slate-950 shadow-md shadow-[#00d09c]/20'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Transaction History ({transactions.length})</span>
        </button>
      </div>

      {activeTab === 'HOLDINGS' ? (
        /* Individual Holdings Table / Cards */
        <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-black tracking-tight">
            Your Stock Positions ({holdings.length})
          </h2>

          <div className="flex items-center gap-2">
            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter holdings..."
                className={`rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#00d09c] ${
                  theme === 'dark'
                    ? 'bg-[#151922] border border-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-900'
                }`}
              />
            </div>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none ${
                theme === 'dark'
                  ? 'bg-[#151922] border border-slate-800 text-slate-200'
                  : 'bg-white border border-slate-200 text-slate-800'
              }`}
            >
              <option value="value">Sort by Value</option>
              <option value="pnl">Sort by P&L</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        {filteredHoldings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHoldings.map((holding) => {
              const matchedStock = stocks.find((s) => s.symbol === holding.symbol);
              const isPnlPositive = holding.unrealizedPnL >= 0;

              return (
                <div
                  key={holding.symbol}
                  id={`holding-card-${holding.symbol}`}
                  onClick={() => handleStockClick(holding.symbol)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer group hover:shadow-md ${
                    theme === 'dark'
                      ? 'bg-[#151922] border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Top Bar: Name, Ticker, Sector, Exchange */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#00d09c]/10 text-[#00b386] dark:text-[#00d09c] font-black text-xs flex items-center justify-center border border-[#00d09c]/25 shrink-0">
                        {holding.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-black tracking-tight">{holding.name}</h3>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {holding.exchange}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="font-mono font-bold text-slate-500">{holding.symbol}</span>
                          <span>•</span>
                          <span>{holding.sector}</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Financial Stats Matrix */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Shares Owned</span>
                      <span className="font-black mt-0.5 block">{holding.quantity} Qty</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Avg Buy Price</span>
                      <span className="font-bold mt-0.5 block">{formatINR(holding.averageBuyPrice)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Current Price</span>
                      <div className="mt-0.5">
                        <PnLMovementIndicator
                          currentPrice={holding.currentPrice}
                          previousPrice={previousPriceMap[holding.symbol]}
                          symbol={holding.symbol}
                          className="font-bold text-xs"
                          showBadge={false}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Invested Amount</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {formatINR(holding.investedValue)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[11px] block">Current Value</span>
                      <span className="font-black text-slate-950 dark:text-white text-sm">
                        {formatINR(holding.currentValue)}
                      </span>
                    </div>
                  </div>

                  {/* Profit / Loss & Quick Actions */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Total P&L
                      </span>
                      <div
                        className={`text-sm font-black flex items-center gap-1 ${
                          isPnlPositive ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                        }`}
                      >
                        {isPnlPositive ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        <span>{formatINR(holding.unrealizedPnL)}</span>
                        <span className="text-[11px]">
                          ({formatPercent(holding.unrealizedPnLPercent)})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id={`holding-buy-more-${holding.symbol}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (matchedStock) openOrderModal(matchedStock, 'BUY');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#00d09c]/15 hover:bg-[#00d09c]/25 text-[#00b386] dark:text-[#00d09c] text-xs font-black transition-colors"
                      >
                        Buy More
                      </button>
                      <button
                        id={`holding-sell-${holding.symbol}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (matchedStock) openOrderModal(matchedStock, 'SELL');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 text-xs font-black transition-colors"
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={`p-12 rounded-3xl border text-center space-y-4 ${
              theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#00d09c]/10 text-[#00b386] dark:text-[#00d09c] flex items-center justify-center mx-auto border border-[#00d09c]/25">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold">No holdings found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No positions matching "${searchQuery}".`
                  : "You don't own any shares yet. Use your available balance to place your first trade."}
              </p>
            </div>
            <button
              id="portfolio-empty-explore-btn"
              onClick={() => navigateTo('markets')}
              className="px-5 py-2.5 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs shadow-md shadow-[#00d09c]/20 inline-flex items-center gap-2"
            >
              <span>Explore Equities & Buy First Stock</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    ) : activeTab === 'MUTUAL_FUNDS' ? (
      /* Mutual Funds Positions View */
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black tracking-tight flex items-center gap-2">
              <span>Mutual Fund Holdings</span>
              <span className="text-xs font-normal text-slate-400">({mutualFundInvestments.length} total)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Active SIP portfolios and lump-sum investments in top Indian AMCs
            </p>
          </div>

          <button
            onClick={() => navigateTo('mutual-funds')}
            className="px-4 py-2 rounded-xl bg-[#00d09c] text-slate-950 font-black text-xs flex items-center gap-1.5"
          >
            <span>Explore Mutual Funds</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {mutualFundInvestments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mutualFundInvestments.map((inv) => (
              <div
                key={inv.id}
                className={`rounded-3xl border p-5 flex flex-col justify-between ${
                  theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c]">
                      {inv.investmentType}
                    </span>
                    <span className="text-xs text-slate-400">{inv.category}</span>
                  </div>
                  <h3 className="text-sm font-black">{inv.fundName}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Units: <strong className="text-slate-700 dark:text-slate-300">{inv.unitsAllocated}</strong> • Current NAV: {formatINR(inv.currentNav)}
                  </p>

                  <div className="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Invested</span>
                      <span className="font-bold">{formatINR(inv.totalInvested)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Current Value</span>
                      <span className="font-black">{formatINR(inv.currentValue)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 text-[11px]">Unrealized P&L:</span>
                  <span className={`font-black ${inv.unrealizedPnL >= 0 ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'}`}>
                    +{formatINR(inv.unrealizedPnL)} ({inv.unrealizedPnLPercent}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <Layers className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold">No Mutual Fund Holdings</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start monthly SIPs in top Indian mutual funds with zero fees and simulated rupee compounding.
            </p>
            <button
              onClick={() => navigateTo('mutual-funds')}
              className="px-5 py-2.5 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs inline-flex items-center gap-2"
            >
              <span>Explore Mutual Funds</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    ) : (
      /* Transaction History View */
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black tracking-tight flex items-center gap-2">
              <span>Transaction History</span>
              <span className="text-xs font-normal text-slate-400">({transactions.length} total)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Detailed audit trail with stock, quantity, executed price, order type and timestamp
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Transaction Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={txSearchQuery}
                onChange={(e) => setTxSearchQuery(e.target.value)}
                placeholder="Search stock or ID..."
                className={`rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#00d09c] ${
                  theme === 'dark'
                    ? 'bg-[#151922] border border-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-900'
                }`}
              />
            </div>

            {/* Transaction Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              {['ALL', 'BUY_ORDER', 'SELL_ORDER', 'VIRTUAL_DEPOSIT', 'VIRTUAL_WITHDRAWAL'].map((typ) => (
                <button
                  key={typ}
                  onClick={() => setTxTypeFilter(typ)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] ${
                    txTypeFilter === typ
                      ? 'bg-[#00d09c] text-slate-950 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {typ === 'ALL'
                    ? 'All'
                    : typ === 'BUY_ORDER'
                    ? 'Buy'
                    : typ === 'SELL_ORDER'
                    ? 'Sell'
                    : typ === 'VIRTUAL_DEPOSIT'
                    ? 'Deposits'
                    : 'Withdrawals'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredTransactions.length > 0 ? (
          <div
            className={`rounded-3xl border overflow-hidden ${
              theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className={`text-[11px] uppercase tracking-wider font-bold border-b ${
                      theme === 'dark'
                        ? 'border-slate-800 text-slate-400 bg-slate-900/40'
                        : 'border-slate-100 text-slate-500 bg-slate-50/70'
                    }`}
                  >
                    <th className="py-3 px-4 sm:px-6">Stock / Action</th>
                    <th className="py-3 px-4">Order Type</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredTransactions.map((tx) => {
                    const isBuy = tx.type === 'BUY_ORDER';
                    const isSell = tx.type === 'SELL_ORDER';
                    const isDeposit = tx.type === 'VIRTUAL_DEPOSIT';
                    const isWithdrawal = tx.type === 'VIRTUAL_WITHDRAWAL';
                    const stockSym = tx.stock || (tx.description.includes('RELIANCE') ? 'RELIANCE' : '');

                    return (
                      <tr
                        key={tx.id}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                          stockSym ? 'cursor-pointer' : ''
                        }`}
                        onClick={() => {
                          if (stockSym) handleStockClick(stockSym);
                        }}
                      >
                        {/* Stock / Description */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                isBuy
                                  ? 'bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c]'
                                  : isSell
                                  ? 'bg-rose-500/15 text-rose-500'
                                  : isDeposit
                                  ? 'bg-emerald-500/15 text-emerald-500'
                                  : 'bg-amber-500/15 text-amber-500'
                              }`}
                            >
                              {isBuy ? (
                                <ArrowDownLeft className="w-4 h-4" />
                              ) : isSell ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : isDeposit ? (
                                <PlusCircle className="w-4 h-4" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div className="font-black flex items-center gap-1.5">
                                <span>{tx.stock || (isDeposit ? 'Deposit' : isWithdrawal ? 'Withdrawal' : 'Trade')}</span>
                                {stockSym && (
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    {stocks.find((s) => s.symbol === stockSym)?.name}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 truncate max-w-[260px] mt-0.5">
                                {tx.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Order Type */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                isBuy
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : isSell
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                  : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                              }`}
                            >
                              {isBuy ? 'BUY' : isSell ? 'SELL' : isDeposit ? 'CREDIT' : 'DEBIT'}
                            </span>
                            {tx.orderType && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                                {tx.orderType}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Quantity */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold">
                          {tx.quantity ? `${tx.quantity} shares` : '—'}
                        </td>

                        {/* Executed Price */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold">
                          {tx.price ? formatINR(tx.price) : '—'}
                        </td>

                        {/* Total Amount */}
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`font-black font-mono text-sm ${
                              isSell || isDeposit
                                ? 'text-[#00b386] dark:text-[#00d09c]'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {isSell || isDeposit ? '+' : '-'}
                            {formatINR(tx.amount)}
                          </span>
                        </td>

                        {/* Timestamp */}
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{tx.status}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div
            className={`p-12 rounded-3xl border text-center space-y-3 ${
              theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <ListOrdered className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold">No transactions found</h3>
            <p className="text-xs text-slate-400">
              {txSearchQuery ? `No records matching "${txSearchQuery}"` : 'Transactions will appear here as you buy or sell stocks.'}
            </p>
          </div>
        )}
      </div>
    )}
    </div>
  );
};
