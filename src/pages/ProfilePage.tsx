import React, { useState } from 'react';
import { useTrade } from '../context/TradeContext';
import { api, formatINR } from '../services/api';
import {
  User,
  ShieldCheck,
  Award,
  Settings,
  LogOut,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Sun,
  Moon,
  IdCard,
  Wallet
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, profile, logout, navigateTo, updateProfile, theme, toggleTheme, wallet, refreshData } =
    useTrade();

  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>(
    profile?.tradingExperience || 'beginner'
  );
  const [risk, setRisk] = useState<'conservative' | 'moderate' | 'aggressive'>(
    profile?.riskTolerance || 'moderate'
  );
  const [savedMsg, setSavedMsg] = useState(false);
  const [resetMsg, setResetMsg] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSaveProfile = async () => {
    try {
      await api.updateProfile({
        tradingExperience: experience,
        riskTolerance: risk
      });
      updateProfile({
        tradingExperience: experience,
        riskTolerance: risk
      });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        'Are you sure you want to reset your virtual portfolio? Balance will be set to ₹5,00,000.'
      )
    ) {
      return;
    }

    setIsResetting(true);
    try {
      await api.resetAccount();
      await refreshData();
      setResetMsg(true);
      setTimeout(() => setResetMsg(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12">
      {/* Header Banner */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d09c] to-teal-700 flex items-center justify-center text-slate-950 font-black text-2xl shadow-md shadow-[#00d09c]/20">
            {user?.name?.[0]?.toUpperCase() || 'G'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">{user?.name || 'Trader'}</h1>
              <span className="text-[10px] bg-[#00d09c]/10 text-[#00b386] dark:text-[#00d09c] font-black px-2 py-0.5 rounded-full border border-[#00d09c]/25">
                Simulated Demat Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Client ID: <span className="font-bold text-slate-700 dark:text-slate-200">{profile?.clientId || 'GRW-94829'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Theme Quick Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c0f17] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          <button
            onClick={() => navigateTo('settings')}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c0f17] text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
          <button
            onClick={logout}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 text-xs font-black flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Account Info Details */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 space-y-4 ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <h2 className="text-sm font-black">Account & KYC Profile (Simulated)</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 dark:bg-[#0c0f17] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Mail className="w-4 h-4 text-[#00d09c] shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Registered Email</span>
              <span className="font-bold">{user?.email}</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0c0f17] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Phone className="w-4 h-4 text-[#00d09c] shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Phone Number</span>
              <span className="font-bold">{user?.phone || '+91 98765 43210'}</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0c0f17] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <IdCard className="w-4 h-4 text-[#00d09c] shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Simulated Client Code</span>
              <span className="font-bold font-mono">{profile?.clientId || 'GRW-94829'}</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0c0f17] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Wallet className="w-4 h-4 text-[#00d09c] shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Virtual Account Status</span>
              <span className="font-bold text-[#00b386] dark:text-[#00d09c]">
                Active ({formatINR(wallet?.balance || 0)} Virtual Cash)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reset Account Option */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="space-y-1">
          <h2 className="text-sm font-black flex items-center gap-2 text-rose-500">
            <RotateCcw className="w-4 h-4" />
            <span>Reset Trading Balance</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Re-initialize your trading balance back to ₹5,00,000 and clear order history.
          </p>
        </div>

        <button
          id="profile-reset-btn"
          disabled={isResetting}
          onClick={handleReset}
          className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/30 text-xs font-black transition-all shrink-0 active:scale-95 disabled:opacity-50"
        >
          {isResetting ? 'Resetting...' : 'Reset Account'}
        </button>
      </div>

      {resetMsg && (
        <div className="p-3 rounded-xl bg-[#00d09c]/10 border border-[#00d09c]/20 text-[#00b386] dark:text-[#00d09c] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Account successfully reset to ₹5,00,000 balance.</span>
        </div>
      )}

      {/* Account Preferences */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 space-y-5 ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <h2 className="text-sm font-black">Trading Experience & Profile</h2>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Trading Experience Level
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setExperience(lvl)}
                className={`py-2.5 text-xs font-bold rounded-xl border transition-all uppercase ${
                  experience === lvl
                    ? 'bg-[#00d09c] text-slate-950 border-[#00d09c] font-black'
                    : 'bg-slate-50 dark:bg-[#0c0f17] border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Risk Tolerance
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {(['conservative', 'moderate', 'aggressive'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRisk(r)}
                className={`py-2.5 text-xs font-bold rounded-xl border transition-all uppercase ${
                  risk === r
                    ? 'bg-[#00d09c] text-slate-950 border-[#00d09c] font-black'
                    : 'bg-slate-50 dark:bg-[#0c0f17] border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {savedMsg && (
          <div className="p-3 rounded-xl bg-[#00d09c]/10 border border-[#00d09c]/20 text-[#00b386] dark:text-[#00d09c] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile preferences updated successfully!</span>
          </div>
        )}

        <button
          onClick={handleSaveProfile}
          className="w-full py-3 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-all shadow-md shadow-[#00d09c]/20 active:scale-95"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};
