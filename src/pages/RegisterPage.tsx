import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrade } from '../context/TradeContext';
import { api } from '../services/api';
import { AnimatedOtpInput } from '../components/AnimatedOtpInput';
import {
  TrendingUp,
  UserPlus,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
  Mail,
  User,
  Phone,
  PartyPopper
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { login, navigateTo } = useTrade();

  const [step, setStep] = useState<'FORM' | 'OTP' | 'SUCCESS'>('FORM');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredData, setRegisteredData] = useState<any>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full legal name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create user account on backend
      const res = await api.register({
        name,
        email,
        phone,
        password
      });
      setRegisteredData(res);
      // Transition smoothly to OTP Screen
      setStep('OTP');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (otp: string): Promise<boolean> => {
    // Valid OTP is 123456 or any 6 digits for testing
    if (otp === '123456' || otp.length === 6) {
      setStep('SUCCESS');

      setTimeout(() => {
        if (registeredData) {
          login(
            registeredData.token,
            registeredData.user,
            registeredData.profile,
            registeredData.wallet
          );
        } else {
          navigateTo('dashboard');
        }
      }, 2000);
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-10">
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-[#111622] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Glow ambient background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {step === 'FORM' && (
            <motion.div
              key="step-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 mb-3"
                >
                  <TrendingUp className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                </motion.div>
                <h2 className="text-2xl font-black text-white tracking-tight">Open Demat Account</h2>
                <p className="text-xs text-slate-400 mt-1">Free instant activation with ₹5,00,000 balance</p>
              </div>

              {/* Instant Benefit Badge */}
              <div className="mb-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-[11px] text-slate-300">
                  Instant paperless onboarding. Practice equity, gold, commodities, and mutual funds risk-free.
                </p>
              </div>

              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Full Name (as per PAN)</span>
                  </label>
                  <input
                    type="text"
                    id="register-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Arjun Mehta"
                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    id="register-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="arjun@example.com"
                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mobile Number</span>
                  </label>
                  <input
                    type="tel"
                    id="register-phone-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Set Security Password</span>
                  </label>
                  <input
                    type="password"
                    id="register-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  id="register-submit-btn"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Proceed to OTP Verification</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
                <span>Already have a Demat account? </span>
                <button
                  id="register-to-login-link"
                  onClick={() => navigateTo('login')}
                  className="font-bold text-emerald-400 hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </div>
            </motion.div>
          )}

          {step === 'OTP' && (
            <motion.div
              key="step-otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="py-2"
            >
              {/* Back button to form */}
              <button
                type="button"
                onClick={() => setStep('FORM')}
                className="mb-4 text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                ← Back to details
              </button>

              <AnimatedOtpInput
                length={6}
                title="Verify Your Phone / Email"
                subtitle={`Verification code sent to ${phone || email || 'your contact'}`}
                onComplete={handleVerifyOtp}
              />
            </motion.div>
          )}

          {step === 'SUCCESS' && (
            <motion.div
              key="step-success"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="text-center py-6 space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </motion.div>

              <div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-2 border border-emerald-500/20"
                >
                  <PartyPopper className="w-3.5 h-3.5" />
                  <span>Signup Complete & Verified</span>
                </motion.div>
                <h3 className="text-2xl font-black text-white tracking-tight">Welcome to Groww TradeX!</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                  Your Demat depository account is activated with{' '}
                  <span className="text-emerald-400 font-bold">₹5,00,000</span> virtual trading capital.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="p-3 bg-[#0b0e14] border border-slate-800 rounded-2xl text-left text-xs space-y-1"
              >
                <div className="flex justify-between text-slate-400">
                  <span>Client ID:</span>
                  <span className="font-mono text-white font-bold">{registeredData?.user?.id || 'GROWW-98421'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Initial Balance:</span>
                  <span className="text-emerald-400 font-bold">₹5,00,000.00</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="text-[#00d09c] font-bold">Active & Ready to Trade</span>
                </div>
              </motion.div>

              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>Redirecting to your portfolio dashboard...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
