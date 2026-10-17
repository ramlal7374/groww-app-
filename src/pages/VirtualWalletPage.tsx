import React, { useState, useEffect } from 'react';
import { useTrade } from '../context/TradeContext';
import { api, formatINR } from '../services/api';
import { Transaction } from '../types';
import {
  Wallet,
  PlusCircle,
  RotateCcw,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Lock,
  Gift,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  DollarSign,
  Info,
  Building2
} from 'lucide-react';

export const VirtualWalletPage: React.FC = () => {
  const { wallet, refreshData, navigateTo, theme, portfolio, setQuickAddModalOpen } = useTrade();

  const [customAmount, setCustomAmount] = useState<string>('25000');
  const [isAdding, setIsAdding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Transactions ledger state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ledgerFilter, setLedgerFilter] = useState<'ALL' | 'VIRTUAL_DEPOSIT' | 'BUY_ORDER' | 'SELL_ORDER' | 'DIVIDEND_CREDIT'>('ALL');
  const [isSimulatingDividend, setIsSimulatingDividend] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await api.getTransactions();
      setTransactions(res.transactions || []);
    } catch (e) {
      console.error('Failed to load transactions', e);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const balance = wallet?.balance || 0;
  const reserved = wallet?.reservedBalance || 0;
  const total = balance + reserved;

  // Handle Quick Add Funds
  const handleQuickAdd = async (amount: number) => {
    setIsAdding(true);
    setStatusMsg(null);
    try {
      await api.quickAddCash(amount);
      setStatusMsg({
        type: 'success',
        text: `Successfully added ${formatINR(amount)} trading balance to your wallet.`
      });
      await refreshData();
      await fetchTransactions();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to add virtual funds.' });
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Custom Amount Add
  const handleCustomAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customAmount);
    if (!parsed || parsed <= 0) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid positive virtual amount.' });
      return;
    }
    await handleQuickAdd(parsed);
  };

  // Handle Reset Virtual Account
  const handleReset = async () => {
    setIsResetting(true);
    setStatusMsg(null);
    try {
      await api.resetAccount();
      setStatusMsg({
        type: 'success',
        text: 'Virtual account successfully reset to default balance of ₹5,00,000 and clean holdings.'
      });
      setShowResetConfirm(false);
      await refreshData();
      await fetchTransactions();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to reset account.' });
    } finally {
      setIsResetting(false);
    }
  };

  // Handle Simulate Dividend
  const handleSimulateDividend = async () => {
    setIsSimulatingDividend(true);
    setStatusMsg(null);
    try {
      // Pick first owned stock or default to RELIANCE
      const firstHolding = portfolio?.holdings?.[0];
      const symbol = firstHolding?.symbol || 'RELIANCE';
      const perShare = 15.0;

      const res = await api.simulateDividend({ symbol, amountPerShare: perShare });
      setStatusMsg({
        type: 'success',
        text: res.message || `Simulated dividend of ₹${perShare}/share credited for ${symbol}!`
      });
      await refreshData();
      await fetchTransactions();
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Buy at least 1 share of a stock to receive simulated corporate dividends.'
      });
    } finally {
      setIsSimulatingDividend(false);
    }
  };

  // Filtered transactions
  const filteredTxns = transactions.filter((t) => {
    if (ledgerFilter === 'ALL') return true;
    return t.type === ledgerFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-7 pb-28 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#00d09c]" />
            <span>Groww Balance & Wallet</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your trading funds, bank accounts, and transaction ledger
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Funds Button */}
          <button
            id="wallet-add-funds-btn"
            onClick={() => setQuickAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 text-xs font-black transition-all shadow-md shadow-[#00d09c]/20 flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Add Funds</span>
          </button>

          {/* Reset Account Button */}
          <button
            id="wallet-reset-btn"
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Balance</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`max-w-md w-full p-6 rounded-3xl border space-y-4 shadow-2xl ${
              theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black">Reset Virtual Portfolio & Balance?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                This will reset your available balance back to the starting ₹5,00,000 virtual cash
                and clear all current open holdings and orders. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                id="confirm-reset-btn"
                disabled={isResetting}
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black transition-all"
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset Balance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Alert */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            statusMsg.type === 'success'
              ? 'bg-[#00d09c]/10 border-[#00d09c]/30 text-[#00b386] dark:text-[#00d09c]'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Balance Summary Card */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 transition-all shadow-sm ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-[#151922] via-[#12161f] to-[#0c0f17] border-slate-800'
            : 'bg-white border-slate-200 shadow-md'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-[#00d09c]" />
              <span>Available for Trading</span>
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#00b386] dark:text-[#00d09c] tracking-tight">
              {formatINR(balance)}
            </div>
            <p className="text-[11px] text-slate-400">Ready for instant market & limit orders</p>
          </div>

          <div
            className={`p-4 rounded-2xl border space-y-1 ${
              theme === 'dark'
                ? 'bg-[#0c0f17]/70 border-slate-800/80'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Locked in Pending Orders</span>
            </span>
            <div className="text-2xl font-black text-amber-400">{formatINR(reserved)}</div>
            <p className="text-[10px] text-slate-400">Reserved for pending limit triggers</p>
          </div>

          <div
            className={`p-4 rounded-2xl border space-y-1 ${
              theme === 'dark'
                ? 'bg-[#0c0f17]/70 border-slate-800/80'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Total Virtual Capital</span>
            </span>
            <div className="text-2xl font-black">{formatINR(total)}</div>
            <p className="text-[10px] text-slate-400">Free Balance + Reserved</p>
          </div>
        </div>
      </div>

      {/* Add Virtual Money Controls */}
      <div
        className={`rounded-3xl border p-6 sm:p-7 space-y-6 ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-[#00d09c]/20 text-[#00b386] dark:text-[#00d09c] flex items-center justify-center font-bold">
              <PlusCircle className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-black tracking-tight">Add Virtual Money</h2>
              <p className="text-xs text-slate-400">
                Instantly replenish virtual capital to test high-value trades or diversified portfolios
              </p>
            </div>
          </div>
          <button
            onClick={() => setQuickAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#00d09c]/40 bg-[#00d09c]/10 text-[#00b386] dark:text-[#00d09c] text-xs font-bold hover:bg-[#00d09c]/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Select Bank & Deposit</span>
          </button>
        </div>

        {/* Quick Amount Buttons */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
            Quick Amount Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: '+₹10,000', value: 10000 },
              { label: '+₹50,000', value: 50000 },
              { label: '+₹1,00,000', value: 100000 },
              { label: '+₹5,00,000', value: 500000 }
            ].map((preset) => (
              <button
                key={preset.value}
                id={`quick-add-${preset.value}`}
                disabled={isAdding}
                onClick={() => handleQuickAdd(preset.value)}
                className={`p-3.5 rounded-2xl border font-black text-sm transition-all hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-1 ${
                  theme === 'dark'
                    ? 'bg-[#0c0f17] border-slate-800 hover:border-[#00d09c] text-white'
                    : 'bg-slate-50 border-slate-200 hover:border-[#00d09c] text-slate-900 shadow-2xs'
                }`}
              >
                <span className="text-[#00b386] dark:text-[#00d09c] text-base">{preset.label}</span>
                <span className="text-[10px] text-slate-400 font-normal">Instant Simulated Credit</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Virtual Amount Input Form */}
        <form onSubmit={handleCustomAdd} className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <label htmlFor="custom-virtual-amount" className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Custom Virtual Amount (₹)
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                id="custom-virtual-amount"
                min="100"
                step="100"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter custom amount (e.g. 75000)"
                className={`w-full rounded-2xl pl-8 pr-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[#00d09c] ${
                  theme === 'dark'
                    ? 'bg-[#0c0f17] border border-slate-800 text-white'
                    : 'bg-slate-50 border border-slate-200 text-slate-900'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={isAdding}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-all shadow-md shadow-[#00d09c]/20 active:scale-95 whitespace-nowrap shrink-0"
            >
              {isAdding ? 'Adding...' : 'Credit Custom Amount'}
            </button>
          </div>
        </form>

        {/* Action: Simulate Corporate Action (Dividend) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#00d09c]/5 p-4 rounded-2xl border border-[#00d09c]/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00d09c]/20 text-[#00b386] dark:text-[#00d09c] flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black">Learn Corporate Actions: Simulated Dividend</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                See how listed companies pay cash dividends directly to shareholder trading balances.
              </p>
            </div>
          </div>
          <button
            id="simulate-dividend-btn"
            disabled={isSimulatingDividend}
            onClick={handleSimulateDividend}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#151922] border border-[#00d09c]/40 text-[#00b386] dark:text-[#00d09c] hover:bg-[#00d09c]/15 font-black text-xs transition-colors shrink-0 whitespace-nowrap"
          >
            {isSimulatingDividend ? 'Crediting...' : 'Trigger Simulated Dividend'}
          </button>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div
        className={`rounded-3xl border p-6 sm:p-7 space-y-5 ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black tracking-tight">Transaction Ledger</h2>
            <p className="text-xs text-slate-400">
              Complete audit history of deposits, stock purchases, sales, and dividend credits
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
            <button
              onClick={() => setLedgerFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl border transition-colors ${
                ledgerFilter === 'ALL'
                  ? 'bg-[#00d09c] text-slate-950 border-[#00d09c]'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setLedgerFilter('VIRTUAL_DEPOSIT')}
              className={`px-3 py-1.5 rounded-xl border transition-colors ${
                ledgerFilter === 'VIRTUAL_DEPOSIT'
                  ? 'bg-[#00d09c] text-slate-950 border-[#00d09c]'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              Deposits
            </button>
            <button
              onClick={() => setLedgerFilter('BUY_ORDER')}
              className={`px-3 py-1.5 rounded-xl border transition-colors ${
                ledgerFilter === 'BUY_ORDER'
                  ? 'bg-[#00d09c] text-slate-950 border-[#00d09c]'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              Stock Buys
            </button>
            <button
              onClick={() => setLedgerFilter('SELL_ORDER')}
              className={`px-3 py-1.5 rounded-xl border transition-colors ${
                ledgerFilter === 'SELL_ORDER'
                  ? 'bg-[#00d09c] text-slate-950 border-[#00d09c]'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              Stock Sells
            </button>
            <button
              onClick={() => setLedgerFilter('DIVIDEND_CREDIT')}
              className={`px-3 py-1.5 rounded-xl border transition-colors ${
                ledgerFilter === 'DIVIDEND_CREDIT'
                  ? 'bg-[#00d09c] text-slate-950 border-[#00d09c]'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              Dividends
            </button>
          </div>
        </div>

        {filteredTxns.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/70 border-t border-slate-100 dark:border-slate-800/80">
            {filteredTxns.map((txn) => {
              const isCredit =
                txn.type === 'VIRTUAL_DEPOSIT' ||
                txn.type === 'SELL_ORDER' ||
                txn.type === 'DIVIDEND_CREDIT';

              return (
                <div
                  key={txn.id}
                  className="py-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        txn.type === 'VIRTUAL_DEPOSIT'
                          ? 'bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c]'
                          : txn.type === 'DIVIDEND_CREDIT'
                          ? 'bg-amber-400/15 text-amber-500'
                          : txn.type === 'SELL_ORDER'
                          ? 'bg-sky-400/15 text-sky-400'
                          : 'bg-rose-500/15 text-rose-500'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {txn.description}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(txn.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}{' '}
                        at{' '}
                        {new Date(txn.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-black text-sm block ${
                        isCredit
                          ? 'text-[#00b386] dark:text-[#00d09c]'
                          : 'text-rose-500'
                      }`}
                    >
                      {isCredit ? '+' : '-'}
                      {formatINR(txn.amount)}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      {txn.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
            No transactions found for the selected filter.
          </div>
        )}
      </div>

      {/* Educational Disclosure Notice */}
      <div className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-black">
          <ShieldCheck className="w-4 h-4 text-[#00d09c]" />
          <span>Account Security & Wallet Safety</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Groww provides instant wallet top-ups, zero-fee UPI transfers, and continuous portfolio balance settlement.
        </p>
      </div>
    </div>
  );
};
