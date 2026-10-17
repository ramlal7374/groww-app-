import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrade } from '../context/TradeContext';
import { formatINR } from '../services/api';
import { Transaction, TransactionStatus, TransactionType } from '../types';
import { GrowwPdfStatementModal } from '../components/GrowwPdfStatementModal';
import {
  ListOrdered,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  Search,
  Download,
  FileText,
  Copy,
  Check,
  Building2,
  TrendingUp,
  Wallet,
  ArrowUpDown,
  Filter,
  ExternalLink,
  Coins,
  Zap,
  Landmark,
  Users
} from 'lucide-react';
import { COMMUNITY_INVESTOR_TRANSACTIONS } from '../data/communityTransactionsData';

export const TransactionsPage: React.FC = () => {
  const { transactions, theme, navigateTo, setSelectedSymbol, setQuickAddModalOpen } = useTrade();

  // Primary Tabs: All, EV Energy & Community Investors, Add Money History, Withdrawal History, Trading Order History
  const [activeTab, setActiveTab] = useState<'ALL' | 'EV_INVESTORS' | 'WITHDRAWAL' | 'ADD_MONEY' | 'TRADING'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TransactionStatus>('ALL');
  const [search, setSearch] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Combine user transactions and community investor transactions (minimum 125 entries)
  const allTransactions = useMemo(() => {
    const map = new Map<string, Transaction>();
    COMMUNITY_INVESTOR_TRANSACTIONS.forEach((tx) => map.set(tx.id, tx));
    transactions.forEach((tx) => map.set(tx.id, tx));
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [transactions]);

  // Categorize and filter transactions
  const filtered = useMemo(() => {
    return allTransactions.filter((t) => {
      // 1. Tab match
      let matchTab = true;
      if (activeTab === 'ADD_MONEY') {
        matchTab = t.type === 'VIRTUAL_DEPOSIT';
      } else if (activeTab === 'WITHDRAWAL') {
        matchTab = t.type === 'VIRTUAL_WITHDRAWAL' || t.withdrawalStatus !== undefined || t.bankName !== undefined;
      } else if (activeTab === 'EV_INVESTORS') {
        matchTab =
          t.isPublicInvestorEntry === true ||
          t.type === 'EV_ENERGY_PROFIT_PAYOUT' ||
          t.type === 'EV_ENERGY_SLOT_BOOK' ||
          !!t.investorName;
      } else if (activeTab === 'TRADING') {
        matchTab =
          t.type === 'BUY_ORDER' ||
          t.type === 'SELL_ORDER' ||
          t.type === 'COMMODITY_BUY' ||
          t.type === 'COMMODITY_SELL';
      }

      // 2. Status match
      let matchStatus = true;
      if (statusFilter !== 'ALL') {
        matchStatus = t.status === statusFilter || t.withdrawalStatus === statusFilter;
      }

      // 3. Search match
      const q = search.toLowerCase().trim();
      const refMatch = t.referenceId?.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      const descMatch = t.description?.toLowerCase().includes(q);
      const stockMatch = t.stock?.toLowerCase().includes(q) || t.relatedAsset?.toLowerCase().includes(q);
      const investorMatch = t.investorName?.toLowerCase().includes(q);
      const bankMatch = t.bankName?.toLowerCase().includes(q);
      const statusMatch = t.withdrawalStatus?.toLowerCase().includes(q);

      return matchTab && matchStatus && (!q || refMatch || descMatch || stockMatch || investorMatch || bankMatch || statusMatch);
    });
  }, [allTransactions, activeTab, statusFilter, search]);

  // Metrics for active tab
  const metrics = useMemo(() => {
    let totalInflow = 0;
    let totalOutflow = 0;
    let successCount = 0;
    let totalProfitPaid = 0;

    allTransactions.forEach((t) => {
      if (t.status === 'COMPLETED' || t.withdrawalStatus === 'SUCCESS') {
        successCount++;
        if (
          t.type === 'VIRTUAL_DEPOSIT' ||
          t.type === 'SELL_ORDER' ||
          t.type === 'DIVIDEND_CREDIT' ||
          t.type === 'EV_ENERGY_PROFIT_PAYOUT'
        ) {
          totalInflow += t.amount;
        } else {
          totalOutflow += t.amount;
        }
      }
      if (t.profitOrLoss?.type === 'PROFIT') {
        totalProfitPaid += t.profitOrLoss.amount;
      }
    });

    return { totalInflow, totalOutflow, successCount, totalProfitPaid, totalCount: allTransactions.length };
  }, [allTransactions]);

  const handleCopyRef = (refId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(refId);
    setCopiedId(refId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['Date', 'Time', 'Transaction ID', 'Reference ID', 'Type', 'Status', 'Asset/Stock', 'Amount (INR)', 'Description'];
    const rows = filtered.map((t) => {
      const d = new Date(t.createdAt);
      return [
        d.toLocaleDateString(),
        d.toLocaleTimeString(),
        t.id,
        t.referenceId || t.id,
        t.type,
        t.status,
        t.stock || t.relatedAsset || 'N/A',
        t.amount.toFixed(2),
        `"${t.description.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Groww_TradeX_Transactions_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Loader2 className="w-3 h-3 animate-spin" /> Processing
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'BUY_ORDER':
      case 'COMMODITY_BUY':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case 'SELL_ORDER':
      case 'COMMODITY_SELL':
        return <ArrowUpRight className="w-4 h-4 text-rose-400" />;
      case 'VIRTUAL_DEPOSIT':
        return <PlusCircle className="w-4 h-4 text-[#00d09c]" />;
      case 'VIRTUAL_WITHDRAWAL':
        return <Building2 className="w-4 h-4 text-amber-400" />;
      case 'DIVIDEND_CREDIT':
        return <Coins className="w-4 h-4 text-sky-400" />;
      case 'EV_ENERGY_PROFIT_PAYOUT':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'EV_ENERGY_SLOT_BOOK':
        return <Zap className="w-4 h-4 text-cyan-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeLabel = (type: TransactionType) => {
    switch (type) {
      case 'BUY_ORDER':
        return 'Buy Equity';
      case 'SELL_ORDER':
        return 'Sell Equity';
      case 'COMMODITY_BUY':
        return 'Buy Commodity';
      case 'COMMODITY_SELL':
        return 'Sell Commodity';
      case 'VIRTUAL_DEPOSIT':
        return 'Add Money';
      case 'VIRTUAL_WITHDRAWAL':
        return 'Bank Withdrawal';
      case 'DIVIDEND_CREDIT':
        return 'Dividend Credit';
      case 'EV_ENERGY_PROFIT_PAYOUT':
        return '⚡ EV Energy Profit Payout';
      case 'EV_ENERGY_SLOT_BOOK':
        return '⚡ EV Energy Share Slot';
      default:
        return 'Demat Transaction';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28 md:pb-12">
      {/* Header Banner */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00d09c]/15 text-[#00d09c] flex items-center justify-center font-black">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Payments & Transaction History</h1>
              <p className="text-xs text-slate-400">
                Official Demat ledger with date, time, reference ID, and related assets
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsPdfModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#00d09c]/20"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Official Groww PDF</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Ledger</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setQuickAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-all shadow-md shadow-[#00d09c]/20 flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Money</span>
          </motion.button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-[#111622] border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" /> Total Inflows & Deposits
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
            {formatINR(metrics.totalInflow)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Demat & Wallet Inflow</span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-[#111622] border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> EV Profit Distributed
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
            {formatINR(metrics.totalProfitPaid)}
          </div>
          <span className="text-[10px] text-amber-400/80 font-bold font-mono">Exact 3x Profit Model</span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-[#111622] border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400" /> Outflows & Orders
          </span>
          <div className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight">
            {formatINR(metrics.totalOutflow)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Purchases & Withdrawals</span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-[#111622] border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Verified Demat Records
          </span>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {metrics.totalCount} <span className="text-xs font-normal text-slate-500">entries</span>
          </div>
          <span className="text-[10px] text-sky-400 font-mono">98.4% IMPS Success Rate</span>
        </div>
      </div>

      {/* Primary Category Tabs: All, EV Investors, Add Money, Withdrawal, Trading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'ALL', label: `All Transactions (${allTransactions.length})` },
            { id: 'EV_INVESTORS', label: '⚡ EV Energy Investors (100+ Live Proofs)' },
            { id: 'WITHDRAWAL', label: 'Bank Withdrawal History' },
            { id: 'ADD_MONEY', label: 'Add Money History' },
            { id: 'TRADING', label: 'Trading Order History' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-black rounded-2xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#00d09c] text-slate-950 shadow-md shadow-[#00d09c]/20'
                  : 'text-slate-400 hover:text-white bg-[#111622] border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] text-slate-500 font-bold uppercase mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {['ALL', 'COMPLETED', 'PROCESSING', 'PENDING', 'CANCELLED', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st as any)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          id="tx-history-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Reference ID, Stock Symbol, Transaction Type, or Keyword..."
          className="w-full bg-[#111622] border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d09c] focus:ring-1 focus:ring-[#00d09c]/30"
        />
      </div>

      {/* Transactions List */}
      <div className="rounded-3xl border border-slate-800 bg-[#111622] overflow-hidden shadow-sm">
        {filtered.length > 0 ? (
          <div className="divide-y divide-slate-800/80">
            {filtered.map((tx) => {
              const dateObj = new Date(tx.createdAt);
              const dateFormatted = dateObj.toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              const timeFormatted = dateObj.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              const isCredit =
                tx.type === 'VIRTUAL_DEPOSIT' ||
                tx.type === 'SELL_ORDER' ||
                tx.type === 'COMMODITY_SELL' ||
                tx.type === 'DIVIDEND_CREDIT' ||
                tx.type === 'EV_ENERGY_PROFIT_PAYOUT' ||
                (tx.profitOrLoss?.type === 'PROFIT' && tx.amount > 0);

              const displayRef = tx.referenceId || `TXN-${tx.id.toUpperCase()}`;
              const relatedAsset = tx.stock || tx.relatedAsset;

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 hover:bg-slate-800/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left Column: Icon + Details */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border ${
                        isCredit
                          ? 'bg-[#00d09c]/15 border-[#00d09c]/30 text-[#00d09c]'
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {getTypeIcon(tx.type)}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Investor Name if present */}
                        {tx.investorName && (
                          <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                            <Users className="w-3 h-3" />
                            <span>{tx.investorName}</span>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          </span>
                        )}

                        <span className="font-bold text-white text-sm">
                          {getTypeLabel(tx.type)}
                        </span>

                        {/* Status Badge */}
                        {getStatusBadge(tx.status)}

                        {/* Related Stock/Asset Pill */}
                        {relatedAsset && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSymbol(relatedAsset);
                              navigateTo('stock-details', relatedAsset);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-emerald-400 hover:bg-slate-700 hover:text-emerald-300 transition-colors cursor-pointer border border-slate-700/60"
                          >
                            <span>{relatedAsset}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>

                      {/* Rich Community Investor Metadata Pills */}
                      {(tx.investPrice || tx.profitOrLoss || tx.bankName || tx.withdrawalStatus) && (
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          {tx.investPrice && (
                            <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700">
                              Invested: <strong>{formatINR(tx.investPrice, false)}</strong>
                            </span>
                          )}

                          {tx.profitOrLoss && (
                            <span
                              className={`text-[11px] font-black font-mono px-2 py-0.5 rounded-lg border ${
                                tx.profitOrLoss.type === 'PROFIT'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                              }`}
                            >
                              {tx.profitOrLoss.type === 'PROFIT'
                                ? `+${formatINR(tx.profitOrLoss.amount, false)} Profit (3x)`
                                : `-${formatINR(tx.profitOrLoss.amount, false)} Loss`}
                            </span>
                          )}

                          {tx.bankName && (
                            <span className="text-[11px] text-slate-300 flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700">
                              <Landmark className="w-3 h-3 text-slate-400" />
                              <span>{tx.bankName}</span>
                            </span>
                          )}

                          {tx.withdrawalStatus && (
                            <span
                              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                                tx.withdrawalStatus === 'SUCCESS'
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : tx.withdrawalStatus === 'PROCESSING'
                                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              }`}
                            >
                              {tx.withdrawalStatus === 'SUCCESS'
                                ? '✓ Withdrawal Success'
                                : tx.withdrawalStatus === 'PROCESSING'
                                ? '⏳ Processing (Bank Clearing)'
                                : '✕ Failed / Refunded'}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {tx.description}
                      </p>

                      {/* Date, Time & Reference ID & Time to Withdraw */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 pt-0.5">
                        <span>{dateFormatted} at {timeFormatted}</span>
                        {tx.timeToWithdraw && (
                          <>
                            <span>•</span>
                            <span className="text-cyan-400/90 font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Withdrawal Time: {tx.timeToWithdraw}</span>
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <span>Ref:</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyRef(displayRef, e)}
                            className="font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-semibold"
                          >
                            <span>{displayRef}</span>
                            {copiedId === displayRef ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-500 hover:text-slate-300" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Amount */}
                  <div className="text-left sm:text-right pl-13 sm:pl-0 shrink-0">
                    <span
                      className={`text-base sm:text-lg font-black block tracking-tight font-mono ${
                        isCredit ? 'text-[#00d09c]' : 'text-rose-400'
                      }`}
                    >
                      {isCredit ? '+' : '-'} {formatINR(tx.amount > 0 ? tx.amount : (tx.profitOrLoss?.amount || 0))}
                    </span>
                    {tx.profitOrLoss?.type === 'PROFIT' && (
                      <span className="text-[10px] text-emerald-400 font-bold block font-mono">
                        Profit +{formatINR(tx.profitOrLoss.amount, false)}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">
                      {tx.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">No transactions found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No transactions match your filter criteria for {activeTab.replace('_', ' ')}.
            </p>
          </div>
        )}
      </div>

      {/* Official PDF Statement Modal */}
      <GrowwPdfStatementModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />
    </div>
  );
};
