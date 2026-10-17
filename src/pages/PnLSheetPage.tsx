import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrade } from '../context/TradeContext';
import { formatINR } from '../services/api';
import { downloadGrowwPdf } from '../services/pdfReportGenerator';
import { GrowwPdfStatementModal } from '../components/GrowwPdfStatementModal';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
  CheckCircle2,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export const PnLSheetPage: React.FC = () => {
  const { user, wallet, portfolio, transactions, theme, navigateTo, setSelectedSymbol } = useTrade();

  const [selectedFY, setSelectedFY] = useState<'FY 2025-26' | 'FY 2024-25'>('FY 2025-26');
  const [selectedSegment, setSelectedSegment] = useState<'ALL' | 'EQUITY' | 'COMMODITY' | 'INTRADAY'>('ALL');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const holdings = portfolio?.holdings || [];
  const summary = portfolio?.summary;

  // Realized calculations based on sell transactions
  const realizedPnL = useMemo(() => {
    let profit = 0;
    transactions.forEach((tx) => {
      if (tx.type === 'SELL_ORDER' || tx.type === 'COMMODITY_SELL') {
        // Approximate 4.5% realized margin on executed sell orders
        profit += tx.amount * 0.045;
      }
    });
    return profit;
  }, [transactions]);

  // Unrealized calculations from current portfolio
  const totalInvested = summary?.totalInvested || 0;
  const currentVal = summary?.currentValue || 0;
  const unrealizedPnL = summary?.totalPnl || (currentVal - totalInvested);
  const unrealizedPercent = summary?.totalPnlPercentage || (totalInvested > 0 ? (unrealizedPnL / totalInvested) * 100 : 0);

  const netCombinedPnL = realizedPnL + unrealizedPnL;

  // Filter holdings by segment
  const filteredHoldings = useMemo(() => {
    return holdings.filter((h) => {
      if (selectedSegment === 'ALL') return true;
      if (selectedSegment === 'COMMODITY') {
        return h.symbol.includes('GOLD') || h.symbol.includes('SILVER');
      }
      if (selectedSegment === 'EQUITY') {
        return !h.symbol.includes('GOLD') && !h.symbol.includes('SILVER');
      }
      return true;
    });
  }, [holdings, selectedSegment]);

  // Tax calculations (Indian Union Budget 2024-25 guidelines)
  const stcgTax = Math.max(0, realizedPnL * 0.20); // 20% STCG
  const ltcgTax = Math.max(0, Math.max(0, realizedPnL - 125000) * 0.125); // 12.5% LTCG after 1.25L exemption

  const handleExportPnL = () => {
    const headers = ['Symbol', 'Quantity', 'Avg Buy Price (INR)', 'Current Price (INR)', 'Invested (INR)', 'Current Value (INR)', 'Unrealized P&L (INR)', 'Returns (%)'];
    const rows = holdings.map((h) => [
      h.symbol,
      h.quantity,
      h.averagePrice.toFixed(2),
      h.currentPrice.toFixed(2),
      h.investedValue.toFixed(2),
      h.currentValue.toFixed(2),
      h.unrealizedPnl.toFixed(2),
      h.unrealizedPnlPercentage.toFixed(2) + '%'
    ]);

    const csvContent = [
      `Profit and Loss Statement - ${selectedFY}`,
      `Generated Date: ${new Date().toLocaleDateString()}`,
      `Total Net P&L: INR ${netCombinedPnL.toFixed(2)}`,
      '',
      headers.join(','),
      ...rows.map((r) => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Groww_PnL_Sheet_${selectedFY.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Profit & Loss (P&L) Statement</h1>
              <p className="text-xs text-slate-400">
                Tax P&L report for ITR filing, capital gains breakdown, and unrealized positions
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* FY selector */}
          <div className="flex items-center bg-[#0b0e14] border border-slate-800 rounded-xl p-1 text-xs font-bold">
            {(['FY 2025-26', 'FY 2024-25'] as const).map((fy) => (
              <button
                key={fy}
                onClick={() => setSelectedFY(fy)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedFY === fy
                    ? 'bg-[#00d09c] text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {fy}
              </button>
            ))}
          </div>

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
            onClick={handleExportPnL}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Excel</span>
          </motion.button>
        </div>
      </div>

      {/* =========================================================
          LIVE P&L ANIMATED BANNER (PROFIT / LOSS FEEDBACK)
         ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Net Combined P&L with Dynamic Glow Animation */}
        <motion.div
          animate={{
            borderColor: netCombinedPnL >= 0 ? ['#00d09c33', '#00d09c88', '#00d09c33'] : ['#f43f5e33', '#f43f5e88', '#f43f5e33']
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className={`p-6 rounded-3xl border bg-[#111622] space-y-3 relative overflow-hidden`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Net Combined P&L
            </span>
            <span
              className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                netCombinedPnL >= 0
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              }`}
            >
              {netCombinedPnL >= 0 ? 'NET PROFIT' : 'NET LOSS'}
            </span>
          </div>

          <div>
            <motion.div
              key={netCombinedPnL}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className={`text-3xl sm:text-4xl font-black tracking-tight ${
                netCombinedPnL >= 0 ? 'text-[#00d09c]' : 'text-rose-400'
              }`}
            >
              {netCombinedPnL >= 0 ? '+' : ''}{formatINR(netCombinedPnL)}
            </motion.div>
            <p className="text-[11px] text-slate-400 mt-1">
              Combined Realized + Mark-to-Market (MTM) holdings
            </p>
          </div>
        </motion.div>

        {/* Realized P&L */}
        <div className="p-6 rounded-3xl border border-slate-800 bg-[#111622] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" /> Realized P&L (Closed Trades)
            </span>
            <span className="text-[10px] text-slate-500 font-bold">Taxable</span>
          </div>
          <div>
            <div className="text-3xl font-black text-white tracking-tight">
              {realizedPnL >= 0 ? '+' : ''}{formatINR(realizedPnL)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Booked profits from executed equity/bullion sale orders
            </p>
          </div>
        </div>

        {/* Unrealized P&L (Open Holdings) */}
        <div className="p-6 rounded-3xl border border-slate-800 bg-[#111622] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Unrealized P&L (Open Positions)
            </span>
            <span
              className={`text-xs font-bold ${
                unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {unrealizedPercent >= 0 ? '+' : ''}{unrealizedPercent.toFixed(2)}%
            </span>
          </div>
          <div>
            <div
              className={`text-3xl font-black tracking-tight ${
                unrealizedPnL >= 0 ? 'text-[#00d09c]' : 'text-rose-400'
              }`}
            >
              {unrealizedPnL >= 0 ? '+' : ''}{formatINR(unrealizedPnL)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Current MTM valuation against invested capital of {formatINR(totalInvested)}
            </p>
          </div>
        </div>
      </div>

      {/* Tax Capital Gains Summary Box */}
      <div className="p-5 rounded-3xl bg-[#0b0e14] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-[#00d09c]" />
            <h3 className="text-sm font-black text-white">Estimated Capital Gains Tax Breakdown (Budget 2024-25)</h3>
          </div>
          <span className="text-[11px] text-slate-500">For ITR-2 / ITR-3 Filing</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
            <span className="text-slate-400">Short Term Capital Gains (STCG @ 20%)</span>
            <div className="text-base font-black text-white">{formatINR(stcgTax)}</div>
            <span className="text-[10px] text-slate-500">Applicable on holdings held &lt; 12 months</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
            <span className="text-slate-400">Long Term Capital Gains (LTCG @ 12.5%)</span>
            <div className="text-base font-black text-white">{formatINR(ltcgTax)}</div>
            <span className="text-[10px] text-slate-500">Exempt up to ₹1,25,000 / fiscal year</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
            <span className="text-slate-400">STT & Regulatory Levies Paid</span>
            <div className="text-base font-black text-white">₹0.00 (Demat Zero Brokerage)</div>
            <span className="text-[10px] text-emerald-400 font-semibold">100% Free Virtual Testing Mode</span>
          </div>
        </div>
      </div>

      {/* Segment Filter Pills */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[
            { id: 'ALL', label: 'All Holdings P&L' },
            { id: 'EQUITY', label: 'Equity Stocks' },
            { id: 'COMMODITY', label: 'Gold & Silver' }
          ].map((seg) => (
            <button
              key={seg.id}
              onClick={() => setSelectedSegment(seg.id as any)}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                selectedSegment === seg.id
                  ? 'bg-[#00d09c] text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white bg-[#111622] border border-slate-800'
              }`}
            >
              {seg.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-semibold">
          Showing {filteredHoldings.length} Positions
        </span>
      </div>

      {/* Holdings Individual P&L Ledger */}
      <div className="rounded-3xl border border-slate-800 bg-[#111622] overflow-hidden shadow-sm">
        {filteredHoldings.length > 0 ? (
          <div className="divide-y divide-slate-800/80">
            {filteredHoldings.map((h) => {
              const isProfit = h.unrealizedPnl >= 0;

              return (
                <div
                  key={h.symbol}
                  className="p-4 sm:p-5 hover:bg-slate-800/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Animated Profit / Loss Pulse Indicator */}
                    <motion.div
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.8, 1, 0.8]
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                        isProfit
                          ? 'bg-[#00d09c]/15 border-[#00d09c]/30 text-[#00d09c]'
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {isProfit ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </motion.div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{h.symbol}</span>
                        <span className="text-xs text-slate-400">Qty: {h.quantity}</span>
                        <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md font-mono">
                          Avg: {formatINR(h.averagePrice)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                        <span>LTP: <strong className="text-white">{formatINR(h.currentPrice)}</strong></span>
                        <span>•</span>
                        <span>Invested: <strong className="text-white">{formatINR(h.investedValue)}</strong></span>
                        <span>•</span>
                        <span>Current: <strong className="text-white">{formatINR(h.currentValue)}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* P&L Right Column with animation */}
                  <div className="text-left sm:text-right">
                    <motion.span
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 1 }}
                      className={`text-lg font-black block tracking-tight ${
                        isProfit ? 'text-[#00d09c]' : 'text-rose-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}{formatINR(h.unrealizedPnl)}
                    </motion.span>
                    <span
                      className={`text-xs font-bold inline-block px-2 py-0.5 rounded-full ${
                        isProfit ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}{h.unrealizedPnlPercentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">No Holdings Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Execute equity or gold/silver orders to generate live Profit & Loss tracking statements.
            </p>
            <button
              onClick={() => navigateTo('markets')}
              className="mt-2 px-4 py-2 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-all cursor-pointer"
            >
              Explore Stocks & Commodities
            </button>
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
