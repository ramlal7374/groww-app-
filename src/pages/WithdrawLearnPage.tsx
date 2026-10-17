import React, { useState } from 'react';
import { useTrade } from '../context/TradeContext';
import { formatINR, api } from '../services/api';
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  Lock,
  Zap
} from 'lucide-react';

export const WithdrawLearnPage: React.FC = () => {
  const { navigateTo, wallet, refreshData, theme } = useTrade();
  const [withdrawAmount, setWithdrawAmount] = useState<number>(25000);
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank •• 4821');
  const [transferMode, setTransferMode] = useState<'IMPS' | 'NEFT'>('IMPS');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successReceipt, setSuccessReceipt] = useState<{
    referenceId: string;
    amount: number;
    bank: string;
    timestamp: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableBalance = wallet?.balance || 0;

  const handleWithdrawal = async () => {
    if (withdrawAmount <= 0) {
      setErrorMessage('Please enter a valid withdrawal amount.');
      return;
    }
    if (withdrawAmount > availableBalance) {
      setErrorMessage('Withdrawal amount cannot exceed available trading balance.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessReceipt(null);

    try {
      await api.withdrawVirtualCash({
        amount: withdrawAmount,
        simulatedBankName: selectedBank,
        simulatedAccountMask: '•••• 4821'
      });
      await refreshData();
      const ref = 'IMPS' + Math.floor(100000000000 + Math.random() * 900000000000);
      setSuccessReceipt({
        referenceId: ref,
        amount: withdrawAmount,
        bank: selectedBank,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process withdrawal request.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12">
      {/* Back button */}
      <button
        onClick={() => navigateTo('wallet')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Wallet</span>
      </button>

      {/* Main Container */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 transition-all ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30 shrink-0">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">Withdraw Funds</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] border border-[#00d09c]/30">
                  Real Trading — Real Money
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Instant IMPS / NEFT payout directly to your linked primary bank account
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800 flex items-center justify-between sm:justify-start gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Withdrawable Balance</span>
              <span className="text-base font-black text-[#00b386] dark:text-[#00d09c]">
                {formatINR(availableBalance)}
              </span>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#00d09c] animate-pulse" />
          </div>
        </div>

        {successReceipt ? (
          /* Withdrawal Success Receipt */
          <div className="py-8 text-center space-y-5 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[#00d09c]/20 text-[#00d09c] flex items-center justify-center mx-auto border border-[#00d09c]/40">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Withdrawal Request Initiated!</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {formatINR(successReceipt.amount)} is on its way to your bank account.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Bank Reference / UTR</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{successReceipt.referenceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination Account</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{successReceipt.bank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Withdrawal Amount</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatINR(successReceipt.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transfer Mode</span>
                <span className="font-semibold text-[#00b386] dark:text-[#00d09c]">
                  {transferMode === 'IMPS' ? 'Instant IMPS (5-15 mins)' : 'Standard NEFT'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Charges</span>
                <span className="font-bold text-[#00b386] dark:text-[#00d09c]">₹0.00 (Free)</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => setSuccessReceipt(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Make Another Withdrawal
              </button>
              <button
                onClick={() => navigateTo('wallet')}
                className="px-6 py-2.5 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-all shadow-md shadow-[#00d09c]/20"
              >
                View Wallet & Transactions
              </button>
            </div>
          </div>
        ) : (
          /* Withdrawal Form */
          <div className="space-y-6 pt-6">
            {/* Amount Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Amount to Withdraw
                </label>
                <span className="text-xs text-slate-400">
                  Available: <span className="font-bold text-slate-700 dark:text-slate-300">{formatINR(availableBalance)}</span>
                </span>
              </div>

              <div className="relative mb-3">
                <span className="absolute left-4 top-3 text-lg font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min={100}
                  max={availableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="Enter amount"
                  className={`w-full rounded-2xl pl-9 pr-4 py-3 text-xl font-black focus:outline-none focus:ring-2 focus:ring-[#00d09c] ${
                    theme === 'dark'
                      ? 'bg-[#0c0f17] border border-slate-800 text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2">
                {[5000, 10000, 25000, 50000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setWithdrawAmount(Math.min(amt, availableBalance))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      withdrawAmount === amt
                        ? 'bg-amber-500/15 border-amber-500 text-amber-500 font-black'
                        : 'bg-slate-50 dark:bg-[#0c0f17] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    +{formatINR(amt, false)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(availableBalance)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#00d09c]/10 border border-[#00d09c]/40 text-[#00b386] dark:text-[#00d09c] hover:bg-[#00d09c]/20"
                >
                  Withdraw All
                </button>
              </div>
            </div>

            {/* Destination Bank Account */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Destination Verified Bank Account
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'HDFC Bank •• 4821',
                    name: 'HDFC Bank Ltd',
                    acc: 'A/C No: ••••••••4821',
                    ifsc: 'IFSC: HDFC0000060',
                    isPrimary: true
                  },
                  {
                    id: 'State Bank of India •• 9132',
                    name: 'State Bank of India',
                    acc: 'A/C No: ••••••••9132',
                    ifsc: 'IFSC: SBIN0001420',
                    isPrimary: false
                  },
                  {
                    id: 'ICICI Bank •• 6044',
                    name: 'ICICI Bank Ltd',
                    acc: 'A/C No: ••••••••6044',
                    ifsc: 'IFSC: ICIC0000004',
                    isPrimary: false
                  }
                ].map((bank) => (
                  <div
                    key={bank.id}
                    onClick={() => setSelectedBank(bank.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedBank === bank.id
                        ? 'bg-[#00d09c]/10 border-[#00d09c] text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-[#0c0f17] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{bank.name}</span>
                          {bank.isPrimary && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {bank.acc} • {bank.ifsc}
                        </div>
                      </div>
                    </div>
                    {selectedBank === bank.id && (
                      <div className="w-6 h-6 rounded-full bg-[#00d09c] text-slate-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payout Speed Options */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Payout Processing Speed
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTransferMode('IMPS')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    transferMode === 'IMPS'
                      ? 'bg-[#00d09c]/10 border-[#00d09c] text-slate-900 dark:text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-[#0c0f17] border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-[#00d09c]" />
                    <span className="text-xs font-black">Instant IMPS (Recommended)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Direct credit within 5-15 minutes • 24/7/365 availability
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTransferMode('NEFT')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    transferMode === 'NEFT'
                      ? 'bg-[#00d09c]/10 border-[#00d09c] text-slate-900 dark:text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-[#0c0f17] border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-black">Standard NEFT Batch</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Hourly clearing batch • Standard banking hours
                  </p>
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-semibold">{errorMessage}</p>
              </div>
            )}

            {/* Action Button */}
            <button
              id="confirm-withdraw-btn"
              disabled={isProcessing || withdrawAmount <= 0 || withdrawAmount > availableBalance}
              onClick={handleWithdrawal}
              className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 active:scale-[0.99] font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Payout Request...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Withdraw {formatINR(withdrawAmount)} to Bank</span>
                </>
              )}
            </button>

            {/* Regulatory Footer */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-[#00d09c]" />
              <span>Direct Bank Settlement • SEBI Regulated Client Account • Zero Transfer Fee</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
