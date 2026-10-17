import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrade } from '../context/TradeContext';
import { api } from '../services/api';
import { AnimatedOtpInput } from '../components/AnimatedOtpInput';
import {
  TrendingUp,
  LogIn,
  Sparkles,
  AlertCircle,
  ArrowRight,
  KeyRound,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, navigateTo } = useTrade();

  const [authMode, setAuthMode] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shakePassword, setShakePassword] = useState(false);

  // OTP Login sub-steps
  const [otpStep, setOtpStep] = useState<'INPUT_EMAIL' | 'ENTER_OTP' | 'OTP_SUCCESS'>('INPUT_EMAIL');

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.login({ email, password });
      login(res.token, res.user, res.profile, res.wallet);
    } catch (err: any) {
      triggerShake();
      setErrorMessage(err.message || 'Invalid email or password. Please try again or use Demo login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerShake = () => {
    setShakePassword(true);
    setTimeout(() => setShakePassword(false), 600);
  };

  const handleDemoLogin = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await api.login({
        email: 'trader@tradex.sim',
        password: 'tradex123'
      });
      login(res.token, res.user, res.profile, res.wallet);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize demo account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address to receive OTP');
      return;
    }
    setErrorMessage(null);
    setOtpStep('ENTER_OTP');
  };

  const handleVerifyOtp = async (otp: string): Promise<boolean> => {
    if (otp === '123456' || otp.length === 6) {
      setOtpStep('OTP_SUCCESS');
      setTimeout(async () => {
        // Auto sign in as the user or demo trader
        await handleDemoLogin();
      }, 1500);
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-[#111622] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Glow ambient background element */}
        <div className="absolute -top-24 -right-24 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 mb-3"
          >
            <TrendingUp className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </motion.div>
          <h2 className="text-2xl font-black text-white tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1">Access your investment portfolio & markets</p>
        </div>

        {/* Auth Mode Tabs (Password vs OTP) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0b0e14] rounded-2xl border border-slate-800/80 mb-5">
          <button
            type="button"
            id="login-tab-password"
            onClick={() => {
              setAuthMode('PASSWORD');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'PASSWORD'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Password Login
          </button>
          <button
            type="button"
            id="login-tab-otp"
            onClick={() => {
              setAuthMode('OTP');
              setOtpStep('INPUT_EMAIL');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'OTP'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Login with OTP
          </button>
        </div>

        {/* Instant Demo Access Banner */}
        <div className="mb-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Instant Demo Account</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
              ₹5,00,000 Loaded
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            Jump in immediately with pre-loaded demo capital and sample holdings.
          </p>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            id="login-quick-demo-btn"
            type="button"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <span>Load Demo Account</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </motion.button>
        </div>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#111622] px-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            {authMode === 'PASSWORD' ? 'Or Log In With Password' : 'Or Verify With OTP'}
          </span>
        </div>

        {/* Error notification */}
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

        <AnimatePresence mode="wait">
          {authMode === 'PASSWORD' && (
            <motion.form
              key="password-form"
              animate={shakePassword ? { x: [-12, 12, -8, 8, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              onSubmit={handlePasswordSubmit}
              className={`space-y-4 p-1 rounded-2xl transition-all ${
                shakePassword ? 'border border-rose-500/50 bg-rose-500/5' : ''
              }`}
            >
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  id="login-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Password</span>
                  </label>
                  <button
                    type="button"
                    id="login-forgot-pwd-btn"
                    onClick={() => navigateTo('settings')}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  id="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-[#0b0e14] border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-all ${
                    shakePassword
                      ? 'border-rose-500 focus:border-rose-400'
                      : 'border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40'
                  }`}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                id="login-submit-btn"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-white text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Log In to Account</span>
                  </>
                )}
              </motion.button>
            </motion.form>
          )}

          {authMode === 'OTP' && otpStep === 'INPUT_EMAIL' && (
            <motion.form
              key="otp-email-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleOtpEmailSubmit}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Enter Registered Email / Mobile</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@tradex.sim"
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <span>Send 6-Digit OTP</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </motion.button>
            </motion.form>
          )}

          {authMode === 'OTP' && otpStep === 'ENTER_OTP' && (
            <motion.div
              key="otp-input-screen"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 py-1"
            >
              <button
                type="button"
                onClick={() => setOtpStep('INPUT_EMAIL')}
                className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                ← Change email
              </button>

              <AnimatedOtpInput
                length={6}
                title="Verify Login OTP"
                subtitle={`One-time login passcode sent to ${email || 'your email'}`}
                onComplete={handleVerifyOtp}
              />
            </motion.div>
          )}

          {authMode === 'OTP' && otpStep === 'OTP_SUCCESS' && (
            <motion.div
              key="otp-success-screen"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-3"
            >
              <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black text-white">Login Authorized!</h3>
              <p className="text-xs text-slate-400">Loading your trading dashboard...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
          <span>Don't have an account? </span>
          <button
            id="login-to-register-link"
            onClick={() => navigateTo('register')}
            className="font-bold text-emerald-400 hover:underline cursor-pointer"
          >
            Create Demat Account
          </button>
        </div>
      </motion.div>
    </div>
  );
};
