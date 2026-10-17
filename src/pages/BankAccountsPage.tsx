import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrade } from '../context/TradeContext';
import {
  Building2,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Check,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
  X,
  Coins,
  Loader2,
  ChevronRight,
  Star
} from 'lucide-react';

export const BankAccountsPage: React.FC = () => {
  const { user, bankAccounts, addBankAccount, removeBankAccount, setPrimaryBankAccount, theme } = useTrade();

  const [isAdding, setIsAdding] = useState(false);
  const [accountHolder, setAccountHolder] = useState(user?.name || 'Arjun Mehta');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('HDFC0000128');
  const [accountType, setAccountType] = useState<'Savings' | 'Current'>('Savings');
  const [makePrimary, setMakePrimary] = useState(false);

  // Verification Animation States
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStage, setVerificationStage] = useState<'IDLE' | 'IFSC_CHECK' | 'PENNY_DROP' | 'SUCCESS'>('IDLE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shakeField, setShakeField] = useState(false);

  // Account removal confirmation modal state
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  const popularBanks = [
    { name: 'HDFC Bank', defaultIfsc: 'HDFC0000128' },
    { name: 'ICICI Bank', defaultIfsc: 'ICIC0000007' },
    { name: 'State Bank of India', defaultIfsc: 'SBIN0000691' },
    { name: 'Axis Bank', defaultIfsc: 'UTIB0000005' },
    { name: 'Kotak Mahindra Bank', defaultIfsc: 'KKBK0000180' },
    { name: 'Punjab National Bank', defaultIfsc: 'PUNB0000100' }
  ];

  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!accountHolder.trim()) {
      setErrorMsg('Please enter account holder name as per bank records');
      triggerShake();
      return;
    }

    if (!bankName.trim()) {
      setErrorMsg('Please select or specify the bank name');
      triggerShake();
      return;
    }

    if (!accountNumber || accountNumber.length < 9) {
      setErrorMsg('Please enter a valid bank account number (at least 9 digits)');
      triggerShake();
      return;
    }

    if (accountNumber !== confirmAccountNumber) {
      setErrorMsg('Account numbers do not match. Please re-check the entered digits.');
      triggerShake();
      return;
    }

    if (!ifsc || ifsc.length < 8) {
      setErrorMsg('Please enter a valid 11-character IFSC code (e.g. HDFC0000128)');
      triggerShake();
      return;
    }

    // Begin Verification Animation
    setIsVerifying(true);
    setVerificationStage('IFSC_CHECK');

    // Stage 1: IFSC Lookup
    await new Promise((r) => setTimeout(r, 900));
    setVerificationStage('PENNY_DROP');

    // Stage 2: Penny drop credit
    await new Promise((r) => setTimeout(r, 1100));
    setVerificationStage('SUCCESS');

    // Add to state
    const masked = '•••• •••• ' + accountNumber.slice(-4);
    addBankAccount({
      accountHolderName: accountHolder,
      bankName,
      accountNumberMasked: masked,
      ifsc: ifsc.toUpperCase(),
      accountType,
      isPrimary: makePrimary || bankAccounts.length === 0
    });

    // Auto dismiss form after success animation
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationStage('IDLE');
      setIsAdding(false);
      setAccountNumber('');
      setConfirmAccountNumber('');
    }, 1600);
  };

  const triggerShake = () => {
    setShakeField(true);
    setTimeout(() => setShakeField(false), 500);
  };

  const confirmRemove = () => {
    if (accountToDelete) {
      removeBankAccount(accountToDelete);
      setAccountToDelete(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12">
      {/* Header Banner */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00d09c]/15 text-[#00d09c] flex items-center justify-center font-black">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Bank Accounts Management</h1>
              <p className="text-xs text-slate-400">
                Manage linked bank accounts for instant deposits and withdrawals
              </p>
            </div>
          </div>
        </div>

        {!isAdding && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            id="open-add-bank-btn"
            onClick={() => setIsAdding(true)}
            className="px-4 py-2.5 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-all shadow-md shadow-[#00d09c]/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bank Account</span>
          </motion.button>
        )}
      </div>

      {/* =========================================================
          SLIDE-IN ANIMATED FORM: ADD BANK ACCOUNT
         ========================================================= */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`rounded-3xl border p-6 sm:p-8 overflow-hidden relative shadow-xl ${
              theme === 'dark' ? 'bg-[#111622] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#00d09c]/15 text-[#00d09c] flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Add New Bank Account</h3>
                  <p className="text-xs text-slate-400">NPCI instant penny-drop verification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Popular Bank Selector Chips */}
            <div className="mb-5">
              <label className="text-xs font-bold text-slate-300 block mb-2">Select Popular Bank</label>
              <div className="flex flex-wrap gap-2">
                {popularBanks.map((b) => (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => {
                      setBankName(b.name);
                      setIfsc(b.defaultIfsc);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      bankName === b.name
                        ? 'bg-[#00d09c] text-slate-950 border-[#00d09c] shadow-sm'
                        : 'bg-[#0b0e14] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Verification Animation Overlay or Form */}
            {isVerifying ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center space-y-6"
              >
                {verificationStage === 'IFSC_CHECK' && (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full border-2 border-dashed border-[#00d09c] flex items-center justify-center animate-spin">
                      <Building2 className="w-8 h-8 text-[#00d09c]" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white">Validating IFSC with RBI Depository...</h4>
                      <p className="text-xs text-slate-400 mt-1">Verifying branch code {ifsc} for {bankName}</p>
                    </div>
                  </div>
                )}

                {verificationStage === 'PENNY_DROP' && (
                  <div className="space-y-4">
                    <motion.div
                      animate={{ y: [-5, 5, -5] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-16 h-16 mx-auto rounded-3xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center"
                    >
                      <Coins className="w-8 h-8" />
                    </motion.div>
                    <div>
                      <h4 className="text-lg font-black text-white">Executing ₹1.00 Penny Drop Verification</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Matching bank beneficiary name with Demat holder: <span className="text-white font-bold">{accountHolder}</span>
                      </p>
                    </div>
                  </div>
                )}

                {verificationStage === 'SUCCESS' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    className="space-y-4"
                  >
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-[#00d09c]/20 border border-[#00d09c]/40 text-[#00d09c] flex items-center justify-center shadow-xl shadow-emerald-500/20">
                      <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-white">Bank Account Verified!</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {bankName} (•••• {accountNumber.slice(-4)}) is now linked and active for transfers.
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.form
                animate={shakeField ? { x: [-12, 12, -8, 8, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                onSubmit={handleStartVerification}
                className="space-y-4"
              >
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Account Holder Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      id="input-account-holder"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="e.g. Arjun Mehta"
                      className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00d09c] transition-all"
                    />
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      id="input-bank-name"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. HDFC Bank"
                      className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00d09c] transition-all"
                    />
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Account Number
                    </label>
                    <input
                      type="password"
                      id="input-account-number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 50100234567890"
                      className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00d09c] transition-all"
                    />
                  </div>

                  {/* Confirm Account Number */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Confirm Account Number
                    </label>
                    <input
                      type="text"
                      id="input-confirm-account-number"
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value)}
                      placeholder="Re-enter account number"
                      className={`w-full bg-[#0b0e14] border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-all ${
                        confirmAccountNumber && confirmAccountNumber === accountNumber
                          ? 'border-emerald-500'
                          : 'border-slate-800 focus:border-[#00d09c]'
                      }`}
                    />
                  </div>

                  {/* IFSC Code */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      id="input-ifsc-code"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                      placeholder="HDFC0000128"
                      className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white uppercase font-mono focus:outline-none focus:border-[#00d09c] transition-all"
                    />
                  </div>

                  {/* Account Type */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Account Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAccountType('Savings')}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          accountType === 'Savings'
                            ? 'bg-[#00d09c] text-slate-950 border-[#00d09c]'
                            : 'bg-[#0b0e14] border-slate-800 text-slate-400'
                        }`}
                      >
                        Savings Account
                      </button>
                      <button
                        type="button"
                        onClick={() => setAccountType('Current')}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          accountType === 'Current'
                            ? 'bg-[#00d09c] text-slate-950 border-[#00d09c]'
                            : 'bg-[#0b0e14] border-slate-800 text-slate-400'
                        }`}
                      >
                        Current Account
                      </button>
                    </div>
                  </div>
                </div>

                {/* Make Primary Checkbox */}
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="make-primary-check"
                    checked={makePrimary}
                    onChange={(e) => setMakePrimary(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00d09c] focus:ring-[#00d09c] bg-[#0b0e14] border-slate-800"
                  />
                  <label htmlFor="make-primary-check" className="text-xs font-semibold text-slate-300 cursor-pointer">
                    Set as Primary Account for instant withdrawal settlements
                  </label>
                </div>

                {/* Submit button */}
                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    id="submit-verify-bank-btn"
                    className="flex-1 py-3.5 rounded-2xl bg-[#00D09C] hover:bg-[#00b386] text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Verify & Link Bank Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          LINKED BANK ACCOUNTS CARDS
         ========================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Linked Bank Accounts ({bankAccounts.length})
          </h3>
          <span className="text-[11px] text-slate-500">NPCI Certified Demat Routing</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bankAccounts.map((acc) => (
            <motion.div
              layout
              key={acc.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`rounded-3xl border p-5 flex flex-col justify-between transition-all ${
                acc.isPrimary
                  ? 'border-[#00d09c] shadow-lg shadow-[#00d09c]/10 bg-gradient-to-br from-[#111622] to-[#151d2e]'
                  : 'border-slate-800 bg-[#111622]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#00d09c]/15 text-[#00d09c] flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-base">{acc.bankName}</h4>
                      <p className="text-xs text-slate-400">{acc.accountType} • {acc.ifsc}</p>
                    </div>
                  </div>

                  {acc.isPrimary ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#00d09c]/20 text-[#00d09c] border border-[#00d09c]/30">
                      <Star className="w-3 h-3 fill-current" /> PRIMARY
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPrimaryBankAccount(acc.id)}
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Make Primary
                    </button>
                  )}
                </div>

                {/* Account Details Box */}
                <div className="mt-4 p-3 bg-[#0b0e14] border border-slate-800/80 rounded-2xl space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Account Number</span>
                    <span className="font-mono text-white font-bold">{acc.accountNumberMasked}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Account Holder</span>
                    <span className="text-white font-medium">{acc.accountHolderName}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Depository Status</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Penny-Drop Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  Verified {new Date(acc.verifiedAt).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  onClick={() => setAccountToDelete(acc.id)}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 p-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Account</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal for Remove */}
      <AnimatePresence>
        {accountToDelete && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full p-6 rounded-3xl border border-slate-800 bg-[#111622] space-y-4 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Remove Bank Account?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Are you sure you want to unlink this bank account? You will need to complete penny-drop verification again to re-add it.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setAccountToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemove}
                  className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black transition-all cursor-pointer"
                >
                  Yes, Remove Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
