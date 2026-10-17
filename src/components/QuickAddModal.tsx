import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrade } from '../context/TradeContext';
import { formatINR } from '../services/api';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  Building2,
  Smartphone,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  Wallet
} from 'lucide-react';

interface SimulatedBankOption {
  id: string;
  bankName: string;
  accountNumberMasked: string;
  ifsc: string;
  accountType: string;
  isPrimary?: boolean;
  color: string;
}

export const QuickAddModal: React.FC = () => {
  const { quickAddModalOpen, setQuickAddModalOpen, quickAddCash, wallet, bankAccounts, theme } = useTrade();

  // Simulated bank account options (HDFC and State Bank of India)
  const defaultBankOptions: SimulatedBankOption[] = [
    {
      id: 'bank-hdfc-1',
      bankName: 'HDFC Bank',
      accountNumberMasked: '•••• •••• 4912',
      ifsc: 'HDFC0000128',
      accountType: 'Savings A/C',
      isPrimary: true,
      color: 'from-blue-600 to-indigo-700'
    },
    {
      id: 'bank-sbi-2',
      bankName: 'State Bank of India',
      accountNumberMasked: '•••• •••• 8821',
      ifsc: 'SBIN0001423',
      accountType: 'Savings A/C',
      isPrimary: false,
      color: 'from-sky-500 to-blue-600'
    }
  ];

  // Merge with context bankAccounts if available
  const availableBanks: SimulatedBankOption[] =
    bankAccounts && bankAccounts.length >= 2
      ? bankAccounts.map((b, idx) => ({
          id: b.id || `bank-${idx}`,
          bankName: b.bankName,
          accountNumberMasked: b.accountNumberMasked || `•••• •••• ${idx === 0 ? '4912' : '8821'}`,
          ifsc: b.ifsc || (idx === 0 ? 'HDFC0000128' : 'SBIN0001423'),
          accountType: `${b.accountType || 'Savings'} A/C`,
          isPrimary: b.isPrimary,
          color: idx === 0 ? 'from-blue-600 to-indigo-700' : 'from-sky-500 to-blue-600'
        }))
      : defaultBankOptions;

  const [selectedBankId, setSelectedBankId] = useState<string>(availableBanks[0]?.id || 'bank-hdfc-1');
  const [selectedPreset, setSelectedPreset] = useState<number>(10000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'PHONEPE' | 'GPAY' | 'NETBANKING'>('UPI');

  // Stages: 'INPUT' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
  const [stage, setStage] = useState<'INPUT' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('INPUT');
  const [txnRef, setTxnRef] = useState<string>('');
  const [copiedRef, setCopiedRef] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!quickAddModalOpen) return null;

  const presets = [3000, 5000, 10000, 25000, 50000, 100000];

  const currentSelectedBank =
    availableBanks.find((b) => b.id === selectedBankId) || availableBanks[0];

  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : selectedPreset;

  const handleAdd = async () => {
    setErrorMessage(null);
    const amount = customAmount ? parseFloat(customAmount) : selectedPreset;

    if (!amount || isNaN(amount) || amount <= 0) {
      setErrorMessage('Please specify a valid deposit amount (min ₹100).');
      return;
    }
    if (amount > 100000000) {
      setErrorMessage('Maximum single deposit limit is ₹10,00,00,000.');
      return;
    }

    // Enter Processing stage
    setStage('PROCESSING');

    // Simulate authentic UPI/bank gateway handshake latency
    await new Promise((r) => setTimeout(r, 1200));

    const ok = await quickAddCash(amount);

    if (ok) {
      const generatedRef = `TXN-GROWW-${Math.floor(10000000 + Math.random() * 90000000)}`;
      setTxnRef(generatedRef);
      setStage('SUCCESS');
    } else {
      setErrorMessage('Payment Gateway Connection Timed Out. Please try again.');
      setStage('FAILED');
    }
  };

  const handleCopyRef = () => {
    if (txnRef) {
      navigator.clipboard?.writeText(txnRef);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const resetModal = () => {
    setStage('INPUT');
    setCustomAmount('');
    setSelectedPreset(10000);
    setErrorMessage(null);
    setQuickAddModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className={`w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden border ${
          theme === 'dark' ? 'bg-[#111622] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00d09c]/15 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {/* =========================================================
              STAGE 1: INPUT & SELECTION
             ========================================================= */}
          {stage === 'INPUT' && (
            <motion.div
              key="stage-input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] flex items-center justify-center border border-[#00d09c]/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black tracking-tight">Add Funds to Demat</h3>
                      <span className="text-[10px] bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] font-bold px-2 py-0.5 rounded-full border border-[#00d09c]/30">
                        Instant
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Zero commission • NPCI 2.0 Settlement</p>
                  </div>
                </div>
                <button
                  id="close-quick-add-modal"
                  onClick={resetModal}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Demat Balance Display */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#00b386] dark:text-[#00d09c]" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current Demat Balance</span>
                </div>
                <span className="text-base font-black text-[#00b386] dark:text-[#00d09c]">{formatINR(wallet?.balance || 0)}</span>
              </div>

              {/* Bank Account Selection: 2 Simulated Options */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Select Paying Bank Account ({availableBanks.length} Options)
                  </label>
                  <span className="text-[10px] text-[#00b386] dark:text-[#00d09c] font-semibold">Verified Mandates</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableBanks.map((bank) => {
                    const isSelected = selectedBankId === bank.id;
                    return (
                      <button
                        key={bank.id}
                        type="button"
                        id={`select-bank-${bank.id}`}
                        onClick={() => setSelectedBankId(bank.id)}
                        className={`p-3 rounded-2xl border text-left transition-all relative cursor-pointer ${
                          isSelected
                            ? 'bg-[#00d09c]/10 border-[#00d09c] shadow-xs'
                            : 'bg-slate-50 dark:bg-[#0b0e14] border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center font-black text-[11px]">
                              <Building2 className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-xs">{bank.bankName}</span>
                          </div>
                          {bank.isPrimary && (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full font-bold border border-emerald-500/20">
                              Primary
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          <span>{bank.accountNumberMasked}</span>
                          <span className="text-[10px] text-slate-400">{bank.ifsc}</span>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#00d09c] text-slate-950 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1.5">Transfer Mode</label>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                    { id: 'GPAY', label: 'Google Pay', icon: CreditCard },
                    { id: 'PHONEPE', label: 'PhonePe', icon: Smartphone },
                    { id: 'NETBANKING', label: 'NetBanking', icon: Building2 }
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = selectedMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id as any)}
                        className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#00d09c]/15 border-[#00d09c] text-[#00b386] dark:text-[#00d09c] font-black'
                            : 'bg-slate-50 dark:bg-[#0b0e14] border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-400'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-semibold">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Quick Select Amount</label>
                <div className="grid grid-cols-6 gap-1">
                  {presets.map((amt) => (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={amt}
                      id={`preset-${amt}`}
                      type="button"
                      onClick={() => {
                        setSelectedPreset(amt);
                        setCustomAmount('');
                      }}
                      className={`py-1.5 px-1 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                        selectedPreset === amt && !customAmount
                          ? 'bg-[#00d09c] border-[#00d09c] text-slate-950 shadow-sm'
                          : 'bg-slate-50 dark:bg-[#0b0e14] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {amt >= 100000 ? `₹${amt / 100000}L` : `₹${amt / 1000}k`}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Or Enter Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-base text-slate-400 font-black">₹</span>
                  <input
                    type="number"
                    id="custom-virtual-amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedPreset(0);
                    }}
                    placeholder="Enter deposit amount (e.g. 20000)"
                    className="w-full bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800 rounded-2xl pl-8 pr-3.5 py-2 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#00d09c] focus:ring-1 focus:ring-[#00d09c]/40"
                  />
                </div>
              </div>

              {/* Error notice */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {/* Add Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                id="submit-quick-add-btn"
                type="button"
                onClick={handleAdd}
                className="w-full py-3 rounded-2xl bg-[#00D09C] hover:bg-[#00b386] text-slate-950 font-black text-sm transition-all shadow-md shadow-[#00d09c]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Deposit {formatINR(currentAmount)} from {currentSelectedBank?.bankName || 'Bank'}</span>
              </motion.button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00D09C]" />
                <span>256-bit Encrypted Banking Gateway • Direct NPCI IMPS Credit</span>
              </div>
            </motion.div>
          )}

          {/* =========================================================
              STAGE 2: BANK GATEWAY PROCESSING
             ========================================================= */}
          {stage === 'PROCESSING' && (
            <motion.div
              key="stage-processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="py-8 text-center space-y-5"
            >
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full bg-[#00d09c]/20"
                />
                <Loader2 className="w-10 h-10 animate-spin text-[#00d09c]" />
              </div>

              <div>
                <h3 className="text-xl font-black tracking-tight">
                  Debiting from {currentSelectedBank?.bankName}...
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Connecting via {selectedMethod} for {formatINR(currentAmount)}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto space-y-1.5">
                <div className="flex justify-between">
                  <span>Paying Bank:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{currentSelectedBank?.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Account:</span>
                  <span className="text-slate-900 dark:text-white font-mono">{currentSelectedBank?.accountNumberMasked}</span>
                </div>
                <div className="flex justify-between">
                  <span>Verification:</span>
                  <span className="text-[#00b386] dark:text-[#00d09c] font-semibold">2-Factor UPI / OTP Handshake</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* =========================================================
              STAGE 3: SUCCESS FUND ADD ANIMATION
             ========================================================= */}
          {stage === 'SUCCESS' && (
            <motion.div
              key="stage-success"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="py-6 text-center space-y-5"
            >
              {/* Green animated checkmark badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.45 }}
                className="w-16 h-16 mx-auto rounded-3xl bg-[#00d09c]/20 border border-[#00d09c]/40 text-[#00b386] dark:text-[#00d09c] flex items-center justify-center shadow-xl shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </motion.div>

              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-xs font-bold mb-2 border border-emerald-500/20">
                  Deposit Succeeded
                </div>
                <h3 className="text-2xl font-black tracking-tight">Funds Added Successfully!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="text-[#00b386] dark:text-[#00d09c] font-black text-sm">{formatINR(currentAmount)}</span> has been credited to your Demat balance.
                </p>
              </div>

              {/* Reference & Receipt Box */}
              <div className="p-4 bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800 rounded-2xl text-left text-xs space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Reference UTR</span>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="font-mono text-slate-900 dark:text-white font-bold flex items-center gap-1 hover:text-emerald-400 cursor-pointer"
                  >
                    <span>{txnRef}</span>
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Debited From</span>
                  <span className="text-slate-900 dark:text-white font-medium">
                    {currentSelectedBank?.bankName} ({currentSelectedBank?.accountNumberMasked})
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Updated Demat Balance</span>
                  <span className="text-[#00b386] dark:text-[#00d09c] font-black text-sm">{formatINR(wallet?.balance || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Settlement Status</span>
                  <span className="text-emerald-500 font-bold">Instant Credit Verified</span>
                </div>
              </div>

              {/* Done Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={resetModal}
                className="w-full py-3.5 rounded-2xl bg-[#00D09C] hover:bg-[#00b386] text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Done & Continue Trading
              </motion.button>
            </motion.div>
          )}

          {/* =========================================================
              STAGE 4: FAILED STATE WITH RETRY & SHAKE
             ========================================================= */}
          {stage === 'FAILED' && (
            <motion.div
              key="stage-failed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: [-12, 12, -8, 8, -4, 4, 0]
              }}
              transition={{ duration: 0.5 }}
              className="py-6 text-center space-y-5"
            >
              <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-xl shadow-rose-500/20">
                <AlertCircle className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold mb-2 border border-rose-500/20">
                  Transaction Failed
                </div>
                <h3 className="text-2xl font-black tracking-tight">Deposit Incomplete</h3>
                <p className="text-xs text-rose-500 dark:text-rose-300 mt-1 max-w-xs mx-auto">
                  {errorMessage || 'Bank network rejected or timed out the transfer request.'}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStage('INPUT')}
                  className="flex-1 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition-all cursor-pointer"
                >
                  Change Bank / Amount
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleAdd}
                  className="flex-1 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Deposit</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
