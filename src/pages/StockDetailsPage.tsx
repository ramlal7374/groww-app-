import React, { useState } from 'react';
import { useTrade } from '../context/TradeContext';
import { StockChart } from '../components/StockChart';
import { formatINR, formatPercent, api } from '../services/api';
import { PnLMovementIndicator } from '../components/PnLMovementIndicator';
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  ArrowLeft,
  Star,
  ShieldCheck,
  Zap,
  BarChart2,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers
} from 'lucide-react';

export const StockDetailsPage: React.FC = () => {
  const {
    selectedStock,
    portfolio,
    wallet,
    navigateTo,
    refreshData,
    watchlist,
    toggleWatchlist,
    theme,
    previousPriceMap
  } = useTrade();

  // Inline Order Box State
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [productType, setProductType] = useState<'DELIVERY' | 'INTRADAY'>('DELIVERY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState<number>(1);
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderFeedback, setOrderFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  if (!selectedStock) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <p className="text-slate-400 text-sm">No stock selected for viewing.</p>
        <button
          onClick={() => navigateTo('markets')}
          className="px-5 py-2.5 bg-[#00d09c] text-slate-950 font-black rounded-xl text-xs"
        >
          Explore Equities
        </button>
      </div>
    );
  }

  const currentHolding = portfolio?.holdings.find((h) => h.symbol === selectedStock.symbol);
  const isUp = selectedStock.change >= 0;
  const isWatched = watchlist.includes(selectedStock.symbol);

  // Price calculations
  const effectivePrice =
    orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) || selectedStock.currentPrice : selectedStock.currentPrice;
  const totalOrderValue = quantity * effectivePrice;
  const availableCash = wallet?.balance || 0;
  const maxAffordableQty = Math.max(0, Math.floor(availableCash / selectedStock.currentPrice));

  // Range performance math
  const dayRange = Math.max(1, selectedStock.highPrice - selectedStock.lowPrice);
  const dayProgress = Math.min(
    100,
    Math.max(0, ((selectedStock.currentPrice - selectedStock.lowPrice) / dayRange) * 100)
  );

  const yearRange = Math.max(1, selectedStock.week52High - selectedStock.week52Low);
  const yearProgress = Math.min(
    100,
    Math.max(0, ((selectedStock.currentPrice - selectedStock.week52Low) / yearRange) * 100)
  );

  // Quick quantity increment handler
  const handleAddQty = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  // Submit Order
  const handleExecuteOrder = async () => {
    setOrderFeedback(null);

    if (quantity <= 0) {
      setOrderFeedback({ type: 'error', message: 'Please enter a valid share quantity.' });
      return;
    }

    if (side === 'BUY') {
      if (totalOrderValue > availableCash) {
        setOrderFeedback({
          type: 'error',
          message: `Insufficient virtual cash. Need ${formatINR(totalOrderValue)}, but available balance is ${formatINR(availableCash)}.`
        });
        return;
      }
    } else {
      // Sell check
      const ownedQty = currentHolding?.quantity || 0;
      if (quantity > ownedQty) {
        setOrderFeedback({
          type: 'error',
          message: `Insufficient shares. You only own ${ownedQty} shares of ${selectedStock.symbol}.`
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await api.placeOrder({
        symbol: selectedStock.symbol,
        side,
        orderType,
        quantity,
        limitPrice: orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : undefined
      });

      setOrderFeedback({
        type: 'success',
        message:
          orderType === 'MARKET'
            ? `Successfully executed ${side} order for ${quantity} shares of ${selectedStock.symbol}!`
            : `Limit order placed for ${quantity} shares of ${selectedStock.symbol} at ${formatINR(effectivePrice)}.`
      });

      await refreshData();
      setTimeout(() => {
        setOrderFeedback(null);
      }, 3500);
    } catch (err: any) {
      setOrderFeedback({
        type: 'error',
        message: err.message || 'Failed to place order.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28 md:pb-12">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          id="stock-back-btn"
          onClick={() => navigateTo('markets')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Stocks</span>
        </button>

        {/* Watchlist Star button */}
        <button
          id="stock-details-star-btn"
          onClick={() => toggleWatchlist(selectedStock.symbol)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
            isWatched
              ? 'bg-amber-400/15 border-amber-400 text-amber-500'
              : theme === 'dark'
              ? 'bg-[#151922] border-slate-800 text-slate-400 hover:text-white'
              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-amber-400' : ''}`} />
          <span>{isWatched ? 'In Watchlist' : 'Add to Watchlist'}</span>
        </button>
      </div>

      {/* Hero Stock Header */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border transition-all ${
          theme === 'dark'
            ? 'bg-[#151922] border-slate-800'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00d09c]/20 to-[#00b386]/30 text-[#00b386] dark:text-[#00d09c] font-black text-sm flex items-center justify-center border border-[#00d09c]/30 shadow-xs">
              {selectedStock.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {selectedStock.name}
                </h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {selectedStock.exchange}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  {selectedStock.symbol}
                </span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="text-xs font-semibold text-[#00b386] dark:text-[#00d09c]">
                  {selectedStock.sector}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Price Readout */}
          <div className="sm:text-right">
            <PnLMovementIndicator
              currentPrice={selectedStock.currentPrice}
              previousPrice={previousPriceMap[selectedStock.symbol]}
              symbol={selectedStock.symbol}
              className="text-3xl"
            />
            <div className="flex items-center sm:justify-end gap-2 mt-1">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isUp
                    ? 'bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c]'
                    : 'bg-rose-500/15 text-rose-500'
                }`}
              >
                {isUp ? '+' : ''}
                {selectedStock.change.toFixed(2)} ({formatPercent(selectedStock.changePercent)})
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">1D SIMULATED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left is Chart & Details, Right is Order Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Chart, Performance Bar, Holdings, Fundamentals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Chart with 1D, 1W, 1M, 1Y, 5Y filters */}
          <div
            className={`rounded-3xl border overflow-hidden p-4 sm:p-5 ${
              theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#00d09c]" />
                <span>Price Trend & Historical Chart</span>
              </span>
            </div>
            <StockChart stock={selectedStock} />
          </div>

          {/* Holdings Information Banner (if user holds this stock) */}
          {currentHolding && currentHolding.quantity > 0 && (
            <div
              className={`rounded-3xl border p-5 sm:p-6 transition-all ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[#151922] to-[#111622] border-slate-800'
                  : 'bg-gradient-to-r from-emerald-50/50 to-white border-emerald-100 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#00d09c]" />
                  <h3 className="text-xs font-black uppercase tracking-wider">
                    Your Current Holdings in {selectedStock.symbol}
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c]">
                  Active Position
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Shares Owned</span>
                  <span className="text-base font-black mt-0.5 block">{currentHolding.quantity} Qty</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Average Buy Price</span>
                  <span className="text-base font-black mt-0.5 block">{formatINR(currentHolding.averageBuyPrice)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Invested Value</span>
                  <span className="text-base font-black mt-0.5 block">{formatINR(currentHolding.investedValue)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Total Profit/Loss</span>
                  <div
                    className={`text-base font-black mt-0.5 flex items-center gap-1 ${
                      currentHolding.unrealizedPnL >= 0
                        ? 'text-[#00b386] dark:text-[#00d09c]'
                        : 'text-rose-500'
                    }`}
                  >
                    <span>{formatINR(currentHolding.unrealizedPnL)}</span>
                    <span className="text-[11px]">({formatPercent(currentHolding.unrealizedPnLPercent)})</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSide('SELL');
                    setQuantity(currentHolding.quantity);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 text-xs font-bold transition-colors"
                >
                  Sell All ({currentHolding.quantity} Shares)
                </button>
                <button
                  onClick={() => {
                    setSide('BUY');
                    setQuantity(5);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#00d09c]/15 hover:bg-[#00d09c]/25 text-[#00b386] dark:text-[#00d09c] text-xs font-bold transition-colors"
                >
                  Buy More Shares
                </button>
              </div>
            </div>
          )}

          {/* Performance Range Meter (Today Low-High, 52W Low-High) */}
          <div
            className={`rounded-3xl border p-5 sm:p-6 space-y-5 ${
              theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Price Performance & Trading Range
            </h3>

            {/* Today's Range */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Today's Low</span>
                  <span className="font-bold">{formatINR(selectedStock.lowPrice)}</span>
                </div>
                <div className="text-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Current</span>
                  <span className="block font-black text-[#00b386] dark:text-[#00d09c]">
                    {formatINR(selectedStock.currentPrice)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Today's High</span>
                  <span className="font-bold">{formatINR(selectedStock.highPrice)}</span>
                </div>
              </div>
              <div className="relative h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-400 via-[#00d09c] to-emerald-500 rounded-full"
                  style={{ width: `${dayProgress}%` }}
                />
              </div>
            </div>

            {/* 52-Week Range */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">52-Week Low</span>
                  <span className="font-bold">{formatINR(selectedStock.week52Low)}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">52-Week High</span>
                  <span className="font-bold">{formatINR(selectedStock.week52High)}</span>
                </div>
              </div>
              <div className="relative h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 bg-gradient-to-r from-sky-400 to-[#00d09c] rounded-full"
                  style={{ width: `${yearProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Key Fundamentals & Ratios */}
          <div
            className={`rounded-3xl border p-5 sm:p-6 ${
              theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#00d09c]" />
              <span>Simulated Fundamentals & Key Ratios</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[11px] block">Day Open</span>
                <span className="font-bold mt-0.5 block">{formatINR(selectedStock.openPrice)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[11px] block">Prev Close</span>
                <span className="font-bold mt-0.5 block">{formatINR(selectedStock.previousClose)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[11px] block">Market Cap</span>
                <span className="font-bold mt-0.5 block">₹{selectedStock.marketCap.toLocaleString()} Cr</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[11px] block">P/E Ratio</span>
                <span className="font-bold mt-0.5 block">{selectedStock.peRatio.toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[11px] block">Simulated Volume</span>
                <span className="font-bold mt-0.5 block">{selectedStock.volume.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[11px] block">Beta (Volatility)</span>
                <span className="font-bold mt-0.5 block">{selectedStock.beta.toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[11px] block">52W High</span>
                <span className="font-bold mt-0.5 block text-emerald-500">{formatINR(selectedStock.week52High)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[11px] block">52W Low</span>
                <span className="font-bold mt-0.5 block text-rose-500">{formatINR(selectedStock.week52Low)}</span>
              </div>
            </div>
          </div>

          {/* About Company */}
          <div
            className={`rounded-3xl border p-5 sm:p-6 space-y-3 ${
              theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              About {selectedStock.name}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedStock.description}
            </p>
          </div>
        </div>

        {/* Right 1 Column: Buy & Sell Order Execution Panel */}
        <div className="space-y-6">
          <div
            className={`rounded-3xl border p-5 sm:p-6 sticky top-20 shadow-lg ${
              theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-md'
            }`}
          >
            {/* Side Tabs (BUY / SELL) */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                id="order-side-buy-btn"
                onClick={() => setSide('BUY')}
                className={`py-2 rounded-xl text-xs font-black transition-all ${
                  side === 'BUY'
                    ? 'bg-[#00d09c] text-slate-950 shadow-md shadow-[#00d09c]/20'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                id="order-side-sell-btn"
                onClick={() => setSide('SELL')}
                className={`py-2 rounded-xl text-xs font-black transition-all ${
                  side === 'SELL'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                SELL
              </button>
            </div>

            {/* Delivery vs Intraday */}
            <div className="flex items-center justify-center gap-2 mt-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setProductType('DELIVERY')}
                className={`px-3 py-1.5 rounded-xl border transition-all ${
                  productType === 'DELIVERY'
                    ? 'border-[#00d09c] text-[#00b386] dark:text-[#00d09c] bg-[#00d09c]/10'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Delivery (Long Term)
              </button>
              <button
                type="button"
                onClick={() => setProductType('INTRADAY')}
                className={`px-3 py-1.5 rounded-xl border transition-all ${
                  productType === 'INTRADAY'
                    ? 'border-[#00d09c] text-[#00b386] dark:text-[#00d09c] bg-[#00d09c]/10'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Intraday (Same Day)
              </button>
            </div>

            {/* Order Type Toggle (Market vs Limit) */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">Order Execution</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="order-type-market"
                  onClick={() => setOrderType('MARKET')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                    orderType === 'MARKET'
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-400'
                  }`}
                >
                  Market
                </button>
                <button
                  type="button"
                  id="order-type-limit"
                  onClick={() => {
                    setOrderType('LIMIT');
                    if (!limitPrice) setLimitPrice(selectedStock.currentPrice.toString());
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                    orderType === 'LIMIT'
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-400'
                  }`}
                >
                  Limit
                </button>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <label htmlFor="order-quantity" className="text-slate-400">
                  Quantity (Shares)
                </label>
                {side === 'BUY' ? (
                  <span className="text-[11px] text-slate-400">
                    Max: <strong className="text-slate-700 dark:text-slate-200">{maxAffordableQty}</strong>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Owned: <strong className="text-slate-700 dark:text-slate-200">{currentHolding?.quantity || 0}</strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="order-quantity"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`w-full rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[#00d09c] ${
                    theme === 'dark'
                      ? 'bg-[#0c0f17] border border-slate-800 text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Quantity quick increment chips */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[1, 5, 10, 50].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => handleAddQty(delta)}
                    className="py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-[#00d09c] text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    +{delta}
                  </button>
                ))}
              </div>
            </div>

            {/* Limit Price Input if Limit Order */}
            {orderType === 'LIMIT' && (
              <div className="mt-4 space-y-1.5">
                <label htmlFor="order-limit-price" className="text-xs font-semibold text-slate-400">
                  Limit Price (₹)
                </label>
                <input
                  type="number"
                  id="order-limit-price"
                  step="0.05"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder={selectedStock.currentPrice.toString()}
                  className={`w-full rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[#00d09c] ${
                    theme === 'dark'
                      ? 'bg-[#0c0f17] border border-slate-800 text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            )}

            {/* Order Summary & Financials */}
            <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Estimated Order Value</span>
                <span className="font-black text-slate-900 dark:text-white text-sm">
                  {formatINR(totalOrderValue)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800/60">
                <span>Available Virtual Cash</span>
                <span className="font-bold text-[#00b386] dark:text-[#00d09c]">
                  {formatINR(availableCash)}
                </span>
              </div>
            </div>

            {/* Feedback Notifications */}
            {orderFeedback && (
              <div
                className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  orderFeedback.type === 'success'
                    ? 'bg-[#00d09c]/10 border-[#00d09c]/30 text-[#00b386] dark:text-[#00d09c]'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                }`}
              >
                {orderFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{orderFeedback.message}</span>
              </div>
            )}

            {/* Place Order CTA Button */}
            <button
              type="button"
              id="submit-order-btn"
              disabled={isSubmitting}
              onClick={handleExecuteOrder}
              className={`w-full mt-5 py-3 rounded-2xl font-black text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 ${
                side === 'BUY'
                  ? 'bg-[#00d09c] hover:bg-[#00b386] text-slate-950 shadow-[#00d09c]/20'
                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>
                  {side === 'BUY' ? 'Instant Buy' : 'Instant Sell'} {quantity} {selectedStock.symbol}
                </span>
              )}
            </button>

            <p className="text-[10px] text-slate-400 text-center mt-3">
              Instant order routing. Direct exchange execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
