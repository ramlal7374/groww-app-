import React, { useState } from 'react';
import { useTrade } from '../context/TradeContext';
import { formatINR } from '../services/api';
import {
  ArrowLeft,
  ArrowDownLeft,
  Building,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  CreditCard,
  QrCode,
  Sparkles,
  ArrowRight,
  Lock,
  ChevronRight,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export const DepositLearnPage: React.FC = () => {
  const { navigateTo, quickAddCash, wallet, theme } = useTrade();
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'NETBANKING' | 'QR' | 'BANK_TRANSFER'>('UPI');
  const [upiApp, setUpiApp] = useState<'GPAY' | 'PHONEPE' | 'PAYTM' | 'OTHER'>('GPAY');
  const [customUpiId, setCustomUpiId] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank');
  const [amount, setAmount] = useState<number>(50000);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [copiedVpa, setCopiedVpa] = useState(false);

  const presets = [5000, 10000, 25000, 50000, 100000];

  const handleProcessPayment = async () => {
    if (amount <= 0) return;
    setIsProcessing(true);
    setPaymentSuccess(false);

    // Realistic payment processing pipeline
    setTimeout(async () => {
      const randomRef = 'GROWW' + Math.floor(100000000000 + Math.random() * 900000000000);
      setTransactionRef(randomRef);
      await quickAddCash(amount);
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 1200);
  };

  const copyGrowwVpa = () => {
    navigator.clipboard.writeText('growwbrokerage@icici');
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
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
        {/* Header with Real Trading Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] flex items-center justify-center border border-[#00d09c]/30 shrink-0">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">Add Funds</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] border border-[#00d09c]/30">
                  Real Trading — Real Money
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Instant deposit via UPI 2.0, Net Banking or IMPS/RTGS Bank Transfer
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800 flex items-center justify-between sm:justify-start gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Balance</span>
              <span className="text-base font-black text-[#00b386] dark:text-[#00d09c]">
                {formatINR(wallet?.balance || 0)}
              </span>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#00d09c] animate-pulse" />
          </div>
        </div>

        {paymentSuccess ? (
          /* Payment Success Card */
          <div className="py-8 text-center space-y-5 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[#00d09c]/20 text-[#00d09c] flex items-center justify-center mx-auto border border-[#00d09c]/40">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Payment Successful!</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {formatINR(amount)} has been credited to your trading account.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction Ref / UTR</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{transactionRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid</span>
                <span className="font-bold text-[#00b386] dark:text-[#00d09c]">{formatINR(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Mode</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {selectedMethod === 'UPI' ? `UPI (${upiApp})` : selectedMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className="font-bold text-[#00b386] dark:text-[#00d09c]">Settled & Verified</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => setPaymentSuccess(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Add More Funds
              </button>
              <button
                onClick={() => navigateTo('markets')}
                className="px-6 py-2.5 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-all shadow-md shadow-[#00d09c]/20"
              >
                Start Trading Stocks
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <div className="space-y-6 pt-6">
            {/* Amount Input */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Enter Amount to Add
              </label>
              <div className="relative mb-3">
                <span className="absolute left-4 top-3 text-lg font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min={100}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  placeholder="Enter amount"
                  className={`w-full rounded-2xl pl-9 pr-4 py-3 text-xl font-black focus:outline-none focus:ring-2 focus:ring-[#00d09c] ${
                    theme === 'dark'
                      ? 'bg-[#0c0f17] border border-slate-800 text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      amount === preset
                        ? 'bg-[#00d09c] border-[#00d09c] text-slate-950 font-black shadow-xs'
                        : 'bg-slate-50 dark:bg-[#0c0f17] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    +{formatINR(preset, false)}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Select Payment Mode
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'UPI', label: 'UPI Instant', desc: 'Google Pay, PhonePe', icon: Smartphone },
                  { id: 'QR', label: 'Scan QR Code', desc: 'Any UPI App', icon: QrCode },
                  { id: 'NETBANKING', label: 'Net Banking', desc: 'Direct Portal', icon: Building },
                  { id: 'BANK_TRANSFER', label: 'NEFT / RTGS', desc: 'Broker Escrow', icon: CreditCard }
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = selectedMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethod(m.id as any)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-[#00d09c]/10 border-[#00d09c] text-slate-900 dark:text-white shadow-xs'
                          : 'bg-slate-50 dark:bg-[#0c0f17] border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-[#00d09c]' : 'text-slate-400'}`} />
                      <div className="text-xs font-bold">{m.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Payment Method Details */}
            {selectedMethod === 'UPI' && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800 space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Select UPI Application
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'GPAY', name: 'Google Pay' },
                    { id: 'PHONEPE', name: 'PhonePe' },
                    { id: 'PAYTM', name: 'Paytm' }
                  ].map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setUpiApp(app.id as any)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                        upiApp === app.id
                          ? 'bg-[#00d09c]/15 border-[#00d09c] text-[#00b386] dark:text-[#00d09c]'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {app.name}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Or Enter UPI ID (VPA)
                  </label>
                  <input
                    type="text"
                    value={customUpiId}
                    onChange={(e) => setCustomUpiId(e.target.value)}
                    placeholder="username@okhdfcbank"
                    className={`w-full rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#00d09c] ${
                      theme === 'dark'
                        ? 'bg-[#151922] border border-slate-800 text-white'
                        : 'bg-white border border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            )}

            {selectedMethod === 'QR' && (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
                  {/* Generated QR Placeholder */}
                  <div className="w-44 h-44 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl relative">
                    <QrCode className="w-32 h-32 text-slate-800" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="p-1 rounded-lg bg-[#00d09c] text-slate-950 font-black text-[10px]">
                        GROWW UPI
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Scan using any UPI App (GPay, PhonePe, Paytm, BHIM)
                  </p>
                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                    <span>VPA: growwbrokerage@icici</span>
                    <button
                      onClick={copyGrowwVpa}
                      className="text-[#00d09c] hover:underline inline-flex items-center gap-0.5 font-bold"
                    >
                      {copiedVpa ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedVpa ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'NETBANKING' && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Select Verified Bank
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBank(b)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        selectedBank === b
                          ? 'bg-[#00d09c]/15 border-[#00d09c] text-[#00b386] dark:text-[#00d09c]'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedMethod === 'BANK_TRANSFER' && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Groww Broker Client Escrow Details
                </span>
                <div className="space-y-2">
                  <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400">Beneficiary Name</span>
                    <span className="font-bold">Groww Invest Tech Pvt Ltd Client A/C</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400">Bank & Branch</span>
                    <span className="font-bold">ICICI Bank, CMS Branch Mumbai</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400">Account Number</span>
                    <span className="font-mono font-bold">GROWWCL94821039</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">IFSC Code</span>
                    <span className="font-mono font-bold">ICIC0000104</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              id="confirm-pay-btn"
              disabled={isProcessing || amount <= 0}
              onClick={handleProcessPayment}
              className="w-full py-4 rounded-2xl bg-[#00d09c] hover:bg-[#00b386] active:scale-[0.99] text-slate-950 font-black text-sm transition-all shadow-lg shadow-[#00d09c]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Processing Payment of {formatINR(amount)}...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay & Add {formatINR(amount)}</span>
                </>
              )}
            </button>

            {/* Regulatory Footer */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-[#00d09c]" />
              <span>SEBI & NPCI 256-bit Encrypted • Zero Deposit Charges • Direct Clearing</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

