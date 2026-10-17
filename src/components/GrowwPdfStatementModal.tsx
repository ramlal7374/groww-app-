import React, { useState } from 'react';
import { useTrade } from '../context/TradeContext';
import { formatINR } from '../services/api';
import { downloadGrowwPdf } from '../services/pdfReportGenerator';
import {
  FileText,
  Download,
  Printer,
  X,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GrowwPdfStatementModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, wallet, portfolio, transactions, theme } = useTrade();
  const [statementType, setStatementType] = useState<'pnl' | 'holdings' | 'all'>('all');
  const [dateRange, setDateRange] = useState<'current_fy' | 'last_30_days' | 'all_time'>('current_fy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const summary = portfolio?.summary || {
    totalInvested: 0,
    currentValue: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    oneDayPnL: 0,
    oneDayPnLPercent: 0,
    holdingsCount: 0,
    availableVirtualCash: wallet?.balance || 0
  };

  const holdings = portfolio?.holdings || [];

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      downloadGrowwPdf({
        user,
        wallet,
        portfolio,
        transactions,
        dateRange
      });
      setIsGenerating(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div
        className={`w-full max-w-4xl rounded-2xl shadow-2xl border flex flex-col max-h-[92vh] overflow-hidden ${
          theme === 'dark'
            ? 'bg-[#11141c] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between border-b ${
            theme === 'dark' ? 'border-slate-800 bg-[#161b26]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] flex items-center justify-center border border-[#00d09c]/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">Groww Official PDF Statement</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] border border-[#00d09c]/30">
                  SEBI Compliant
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                P&L Statement, Portfolio Holdings Ledger & Transaction Audit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#00d09c] hover:bg-[#00b386] transition-all active:scale-95 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              title="Print document"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'border-slate-800 hover:bg-slate-800 text-slate-300'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div
          className={`px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b ${
            theme === 'dark' ? 'border-slate-800/80 bg-[#141822]' : 'border-slate-100 bg-slate-50/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Type:</span>
            <div className="flex rounded-lg border p-0.5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <button
                onClick={() => setStatementType('all')}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  statementType === 'all'
                    ? 'bg-[#00d09c] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All (Consolidated)
              </button>
              <button
                onClick={() => setStatementType('pnl')}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  statementType === 'pnl'
                    ? 'bg-[#00d09c] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                P&L Only
              </button>
              <button
                onClick={() => setStatementType('holdings')}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  statementType === 'holdings'
                    ? 'bg-[#00d09c] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Holdings
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Period:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#00d09c] ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <option value="current_fy">FY 2024-2025</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="all_time">All Time</option>
            </select>
          </div>
        </div>

        {/* PDF Document Preview Canvas */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 bg-slate-100/70 dark:bg-[#0b0e14]">
          {/* Printable Page Simulation */}
          <div
            id="pdf-statement-page"
            className={`w-full max-w-3xl mx-auto rounded-xl p-6 sm:p-8 shadow-md border ${
              theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {/* Top Groww Letterhead */}
            <div className="flex items-start justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#00d09c] text-white font-black text-sm flex items-center justify-center">
                    G
                  </div>
                  <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Groww</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                    Official Statement
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Nextbillion Technology Pvt. Ltd. | Member: NSE (90177), BSE (6699)</p>
                <p className="text-[11px] text-slate-400">Vaishnavi Tech Park, Outer Ring Road, Bengaluru 560103</p>
              </div>

              <div className="text-right text-xs">
                <div className="font-bold text-slate-900 dark:text-white">Statement Date:</div>
                <div className="text-slate-500 dark:text-slate-400 font-medium">
                  {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">UCC: GRW{user?.id?.slice(0, 8).toUpperCase() || '782910'}</div>
              </div>
            </div>

            {/* Investor Card */}
            <div className="mt-5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-wrap justify-between gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Client Name</span>
                <span className="font-black text-slate-900 dark:text-white text-sm">{user?.name || 'Verified Trader'}</span>
                <span className="text-slate-500 dark:text-slate-400 block mt-0.5">{user?.email || 'trader@groww.in'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">PAN / Tax ID</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">ABCDE1234F</span>
                <span className="text-emerald-500 block text-[11px] font-bold">● KYC Verified</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Depository / DP</span>
                <span className="font-bold text-slate-900 dark:text-white">CDSL</span>
                <span className="text-slate-400 block text-[11px]">BO ID: 1208160004921980</span>
              </div>
            </div>

            {/* P&L & Balance KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <span className="text-[10px] font-bold uppercase text-slate-400">Invested Capital</span>
                <div className="text-sm sm:text-base font-black mt-1">{formatINR(summary.totalInvested)}</div>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <span className="text-[10px] font-bold uppercase text-slate-400">Current Value</span>
                <div className="text-sm sm:text-base font-black mt-1">{formatINR(summary.currentValue)}</div>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <span className="text-[10px] font-bold uppercase text-slate-400">Net Returns (P&L)</span>
                <div
                  className={`text-sm sm:text-base font-black mt-1 ${
                    summary.totalPnL >= 0 ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                  }`}
                >
                  {summary.totalPnL >= 0 ? '+' : ''}
                  {formatINR(summary.totalPnL)}
                  <span className="text-xs font-bold ml-1">({summary.totalPnLPercent.toFixed(2)}%)</span>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <span className="text-[10px] font-bold uppercase text-slate-400">Available Cash</span>
                <div className="text-sm sm:text-base font-black mt-1 text-[#00b386] dark:text-[#00d09c]">
                  {formatINR(wallet?.balance || 0)}
                </div>
              </div>
            </div>

            {/* Holdings & P&L Statement Table */}
            {(statementType === 'all' || statementType === 'holdings' || statementType === 'pnl') && (
              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Stock Holdings & P&L Ledger
                  </h4>
                  <span className="text-[11px] text-slate-400 font-semibold">{holdings.length} Positions</span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 uppercase font-bold">
                        <th className="py-2.5 px-3">Company</th>
                        <th className="py-2.5 px-2 text-right">Qty</th>
                        <th className="py-2.5 px-2 text-right">Avg Price</th>
                        <th className="py-2.5 px-2 text-right">CMP (LTP)</th>
                        <th className="py-2.5 px-2 text-right">Cur. Value</th>
                        <th className="py-2.5 px-3 text-right">Total P&L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {holdings.length > 0 ? (
                        holdings.map((h) => (
                          <tr key={h.symbol} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-slate-900 dark:text-white">{h.symbol}</span>
                              <span className="block text-[10px] text-slate-400 truncate max-w-[140px]">{h.stockName || h.symbol}</span>
                            </td>
                            <td className="py-2.5 px-2 text-right font-semibold">{h.quantity}</td>
                            <td className="py-2.5 px-2 text-right text-slate-500 dark:text-slate-400 font-mono">
                              {formatINR(h.averageBuyPrice)}
                            </td>
                            <td className="py-2.5 px-2 text-right font-bold font-mono text-slate-900 dark:text-white">
                              {formatINR(h.currentPrice)}
                            </td>
                            <td className="py-2.5 px-2 text-right font-bold font-mono">
                              {formatINR(h.currentValue)}
                            </td>
                            <td
                              className={`py-2.5 px-3 text-right font-bold font-mono ${
                                (h.unrealizedPnL || 0) >= 0 ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                              }`}
                            >
                              {(h.unrealizedPnL || 0) >= 0 ? '+' : ''}
                              {formatINR(h.unrealizedPnL || 0)}
                              <span className="block text-[10px] font-medium">({(h.unrealizedPnLPercent || 0).toFixed(2)}%)</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                            No holdings in portfolio yet. Start trading to generate your P&L sheet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Transactions Activity Table */}
            {(statementType === 'all') && (
              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Recent Account Movement & Fund Transactions
                  </h4>
                  <span className="text-[11px] text-slate-400 font-semibold">{transactions.length} Records</span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 uppercase font-bold">
                        <th className="py-2.5 px-3">Date / Time</th>
                        <th className="py-2.5 px-2">Type</th>
                        <th className="py-2.5 px-2">Reference ID</th>
                        <th className="py-2.5 px-2">Status</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {transactions.length > 0 ? (
                        transactions.slice(0, 8).map((tx) => {
                          const isCredit =
                            tx.type === 'VIRTUAL_DEPOSIT' ||
                            tx.type === 'DIVIDEND_CREDIT' ||
                            tx.type === 'SELL_ORDER' ||
                            tx.type === 'COMMODITY_SELL';
                          const d = new Date(tx.createdAt || new Date());
                          return (
                            <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                              <td className="py-2 px-3 text-slate-500 dark:text-slate-400">
                                {d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}{' '}
                                <span className="text-[10px] block text-slate-400">
                                  {d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </td>
                              <td className="py-2 px-2 font-bold text-slate-800 dark:text-slate-200">
                                {tx.type.replace(/_/g, ' ')}
                              </td>
                              <td className="py-2 px-2 font-mono text-[11px] text-slate-400 truncate max-w-[120px]">
                                {(tx.referenceId || tx.id).slice(0, 16)}
                              </td>
                              <td className="py-2 px-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  {tx.status || 'COMPLETED'}
                                </span>
                              </td>
                              <td
                                className={`py-2 px-3 text-right font-bold font-mono ${
                                  isCredit ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                                }`}
                              >
                                {isCredit ? '+' : '-'}
                                {formatINR(tx.amount)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                            No transactions recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer Sign-off */}
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00d09c]" />
                <span>Digitally verified by Groww Clearing & Settlement Node</span>
              </div>
              <div>Computer generated statement — no physical signature needed</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`px-5 py-3.5 flex items-center justify-between border-t ${
            theme === 'dark' ? 'border-slate-800 bg-[#161b26]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00d09c]" />
            <span>Format: PDF (A4 Portrait) • File: Groww_TradeX_Statement.pdf</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#00d09c] hover:bg-[#00b386] transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Download Official PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
