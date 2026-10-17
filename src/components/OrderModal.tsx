import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrade } from '../context/TradeContext';
import { api, formatINR } from '../services/api';
import { OrderSide, OrderType } from '../types';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';

export const OrderModal: React.FC = () => {
  const { orderModal, closeOrderModal, wallet, portfolio, refreshData, setQuickAddModalOpen } = useTrade();
  const { isOpen, stock, side: initialSide } = orderModal;

  const [side, setSide] = useState<OrderSide>(initialSide || 'BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [productType, setProductType] = useState<'DELIVERY' | 'INTRADAY'>('DELIVERY');
  const [quantity, setQuantity] = useState<number>(1);
  const [limitPrice, setLimitPrice] = useState<number>(stock?.currentPrice || 0);

  // Animation Stages: FORM -> PROCESSING -> SUCCESS
  const [stage, setStage] = useState<'FORM' | 'PROCESSING' | 'SUCCESS'>('FORM');
  const [processingStep, setProcessingStep] = useState<number>(1);
  const [lastExecutedOrder, setLastExecutedOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (stock) {
      setLimitPrice(stock.currentPrice);
      setSide(initialSide || 'BUY');
      setStage('FORM');
      setProcessingStep(1);
      setErrorMessage(null);
      setQuantity(1);
      setLastExecutedOrder(null);
    }
  }, [stock, initialSide, isOpen]);

  if (!isOpen || !stock) return null;

  // Holding Context
  const currentHolding = portfolio?.holdings.find((h) => h.symbol === stock.symbol);
  const ownedQuantity = currentHolding ? currentHolding.quantity : 0;

  const activePrice = orderType === 'MARKET' ? stock.currentPrice : limitPrice;
  const totalCost = Number((activePrice * quantity).toFixed(2));
  const availableCash = wallet?.balance || 0;

  const canAfford = side === 'BUY' ? availableCash >= totalCost : true;
  const canSell = side === 'SELL' ? ownedQuantity >= quantity : true;

  const handleQuickQty = (added: number) => {
    setQuantity((prev) => Math.max(1, prev + added));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (quantity <= 0) {
      setErrorMessage('Quantity must be greater than 0');
      return;
    }

    if (side === 'BUY' && !canAfford) {
      setErrorMessage(`Insufficient virtual balance. Required: ${formatINR(totalCost)}, Available: ${formatINR(availableCash)}`);
      return;
    }

    if (side === 'SELL' && !canSell) {
      setErrorMessage(`You own ${ownedQuantity} shares of ${stock.symbol}. Cannot sell ${quantity}`);
      return;
    }

    // Start Order Processing Animation
    setStage('PROCESSING');
    setProcessingStep(1);

    // Step 1: Demat verification
    await new Promise((r) => setTimeout(r, 450));
    setProcessingStep(2);

    // Step 2: Routing to exchange
    await new Promise((r) => setTimeout(r, 450));
    setProcessingStep(3);

    try {
      const res = await api.placeOrder({
        symbol: stock.symbol,
        side,
        orderType,
        quantity,
        limitPrice: orderType === 'LIMIT' ? limitPrice : undefined
      });

      setLastExecutedOrder({
        ...res.order,
        stockName: stock.name,
        totalCost
      });

      // Refresh portfolio and wallet state
      await refreshData();

      // Show Success Animation
      setStage('SUCCESS');
    } catch (err: any) {
      setStage('FORM');
      setErrorMessage(err.message || 'Failed to place order');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-lg bg-[#111622] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden"
      >
        {/* Glow ambient background element */}
        <div
          className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
            side === 'BUY' ? 'bg-emerald-500/15' : 'bg-rose-500/15'
          }`}
        />

        <AnimatePresence mode="wait">
          {/* =========================================================
              STAGE 1: ORDER CONFIGURATION FORM
             ========================================================= */}
          {stage === 'FORM' && (
            <motion.div
              key="order-form-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white tracking-tight">{stock.symbol}</h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {stock.exchange}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 truncate max-w-[160px]">{stock.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base font-bold text-white">{formatINR(stock.currentPrice)}</span>
                    <span
                      className={`text-xs font-semibold ${
                        stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                <button
                  id="close-order-modal-btn"
                  onClick={closeOrderModal}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Buy / Sell Tab Switcher */}
              <div className="grid grid-cols-2 gap-2 my-4 p-1 bg-[#0b0e14] rounded-2xl border border-slate-800">
                <button
                  id="tab-order-buy"
                  type="button"
                  onClick={() => setSide('BUY')}
                  className={`py-2.5 text-sm font-black rounded-xl transition-all cursor-pointer ${
                    side === 'BUY'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  BUY
                </button>
                <button
                  id="tab-order-sell"
                  type="button"
                  onClick={() => setSide('SELL')}
                  className={`py-2.5 text-sm font-black rounded-xl transition-all cursor-pointer ${
                    side === 'SELL'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SELL
                </button>
              </div>

              {/* Position Context / Holding Info */}
              <div className="flex items-center justify-between text-xs px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-slate-300 mb-4">
                <div>
                  <span className="text-slate-500">Holdings in Demat: </span>
                  <span className="font-bold text-white">{ownedQuantity} shares</span>
                </div>
                <div>
                  <span className="text-slate-500">Trading Balance: </span>
                  <span className="font-bold text-emerald-400">{formatINR(availableCash)}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Order Type & Product Mode */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Order Type</label>
                    <div className="flex rounded-xl bg-[#0b0e14] border border-slate-800 p-1">
                      <button
                        type="button"
                        id="btn-order-type-market"
                        onClick={() => setOrderType('MARKET')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          orderType === 'MARKET' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Market
                      </button>
                      <button
                        type="button"
                        id="btn-order-type-limit"
                        onClick={() => setOrderType('LIMIT')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          orderType === 'LIMIT' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Limit
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Product</label>
                    <div className="flex rounded-xl bg-[#0b0e14] border border-slate-800 p-1">
                      <button
                        type="button"
                        onClick={() => setProductType('DELIVERY')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          productType === 'DELIVERY' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Delivery (CNC)
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductType('INTRADAY')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          productType === 'INTRADAY' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Intraday (MIS)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quantity Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Quantity (Shares / Units)</label>
                    <div className="flex items-center gap-1">
                      {[1, 5, 10, 50, 100].map((inc) => (
                        <button
                          key={inc}
                          type="button"
                          onClick={() => handleQuickQty(inc)}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 cursor-pointer"
                        >
                          +{inc}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="number"
                    id="order-quantity-input"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-4 py-2.5 text-base font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Limit Price Input if Limit Order */}
                {orderType === 'LIMIT' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">Limit Price (₹)</label>
                      <span className="text-[11px] text-slate-500">Current: {formatINR(stock.currentPrice)}</span>
                    </div>
                    <input
                      type="number"
                      step="0.05"
                      id="order-limit-price-input"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-4 py-2.5 text-base font-bold text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                {/* Cost Breakdown */}
                <div className="p-3.5 rounded-2xl bg-[#0b0e14] border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Order Value</span>
                    <span className="font-bold text-white text-sm">{formatINR(totalCost)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Brokerage & Regulatory</span>
                    <span className="font-semibold text-emerald-400">₹0.00 (Zero Brokerage)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Execution Protocol</span>
                    <span className="text-slate-300 font-medium">
                      {orderType === 'MARKET' ? 'Immediate Execution (IOC)' : 'Day Limit Order'}
                    </span>
                  </div>
                </div>

                {/* Error notice */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                    {side === 'BUY' && !canAfford && (
                      <button
                        type="button"
                        onClick={() => {
                          closeOrderModal();
                          setQuickAddModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-emerald-500 text-slate-950 text-[11px] font-bold rounded-lg shrink-0 cursor-pointer"
                      >
                        + Add Money
                      </button>
                    )}
                  </motion.div>
                )}

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  id="submit-order-btn"
                  disabled={(side === 'BUY' && !canAfford) || (side === 'SELL' && !canSell)}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                    side === 'BUY'
                      ? 'bg-[#00D09C] hover:bg-[#00b386] text-slate-950 shadow-emerald-500/20'
                      : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                  }`}
                >
                  <span>
                    Confirm {side} {quantity} {stock.symbol} • {formatINR(totalCost)}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </form>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00D09C]" />
                <span>Exchange Certified • Instant Trade Settlement</span>
              </div>
            </motion.div>
          )}

          {/* =========================================================
              STAGE 2: ORDER PROCESSING ANIMATION
             ========================================================= */}
          {stage === 'PROCESSING' && (
            <motion.div
              key="order-processing-view"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="py-8 text-center space-y-6"
            >
              {/* Radar pulse and spinning exchange orb */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full bg-emerald-500/20"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-18 h-18 rounded-full border-2 border-dashed border-emerald-400 flex items-center justify-center"
                >
                  <Activity className="w-8 h-8 text-emerald-400" />
                </motion.div>
              </div>

              <div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Processing {side} Order...
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Connecting to NSE matching engine for {quantity} shares of {stock.symbol}
                </p>
              </div>

              {/* Progress Steps with Animated Checkmarks */}
              <div className="max-w-xs mx-auto text-left space-y-3 bg-[#0b0e14] border border-slate-800 rounded-2xl p-4 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    processingStep >= 1 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {processingStep > 1 ? '✓' : '1'}
                  </div>
                  <span className={processingStep >= 1 ? 'text-white font-semibold' : 'text-slate-500'}>
                    Verifying Demat Buying Power
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    processingStep >= 2 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {processingStep > 2 ? '✓' : '2'}
                  </div>
                  <span className={processingStep >= 2 ? 'text-white font-semibold' : 'text-slate-500'}>
                    Routing Packet to NSE Order Book
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    processingStep >= 3 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {processingStep >= 3 ? '✓' : '3'}
                  </div>
                  <span className={processingStep >= 3 ? 'text-white font-semibold' : 'text-slate-500'}>
                    Executing Best Available Trade Fill
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Executing at optimal best bid/offer...</span>
              </div>
            </motion.div>
          )}

          {/* =========================================================
              STAGE 3: ORDER SUCCESS CELEBRATION
             ========================================================= */}
          {stage === 'SUCCESS' && (
            <motion.div
              key="order-success-view"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="py-4 text-center space-y-5"
            >
              {/* Bouncing Checkmark Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.25, 1] }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </motion.div>

              <div>
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-2 border border-emerald-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Order Filled & Settled</span>
                </motion.div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {side === 'BUY' ? 'Successfully Bought' : 'Successfully Sold'}!
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {quantity} shares of <span className="text-white font-bold">{stock.symbol}</span> @{' '}
                  <span className="text-emerald-400 font-bold">{formatINR(stock.currentPrice)}</span>
                </p>
              </div>

              {/* Execution Summary Card */}
              <div className="p-4 bg-[#0b0e14] border border-slate-800 rounded-2xl text-left text-xs space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between text-slate-400">
                  <span>Order Reference ID</span>
                  <span className="font-mono text-white font-bold">{lastExecutedOrder?.id || 'ORD-984210'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Settlement Value</span>
                  <span className="text-white font-bold">{formatINR(totalCost)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>New Demat Holdings</span>
                  <span className="text-emerald-400 font-bold">
                    {side === 'BUY' ? ownedQuantity + quantity : Math.max(0, ownedQuantity - quantity)} shares
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> EXECUTED
                  </span>
                </div>
              </div>

              {/* Done Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={closeOrderModal}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                View in Portfolio
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
