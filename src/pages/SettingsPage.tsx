import React, { useState, useEffect } from 'react';
import { useTrade } from '../context/TradeContext';
import { api, formatINR } from '../services/api';
import {
  Settings,
  RotateCcw,
  KeyRound,
  Bell,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Gauge,
  Activity,
  History
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { refreshData, navigateTo, theme, toggleTheme, isAdmin } = useTrade();
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);

  // App preferences states
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('groww_sound_enabled') !== 'false';
  });
  const [volatility, setVolatility] = useState<'LOW' | 'MEDIUM' | 'HIGH'>(() => {
    return (localStorage.getItem('groww_volatility') as any) || 'MEDIUM';
  });
  const [tickSpeed, setTickSpeed] = useState<number>(() => {
    return parseInt(localStorage.getItem('groww_tick_speed') || '3');
  });

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('groww_sound_enabled', String(next));
  };

  const handleVolatilityChange = (level: 'LOW' | 'MEDIUM' | 'HIGH') => {
    setVolatility(level);
    localStorage.setItem('groww_volatility', level);
  };

  const handleTickSpeedChange = (speed: number) => {
    setTickSpeed(speed);
    localStorage.setItem('groww_tick_speed', String(speed));
  };

  const handleResetAccount = async () => {
    if (
      !window.confirm(
        'Reset your virtual trading account? This will clear current stock positions, transaction logs, and restore your virtual balance to ₹5,00,000.'
      )
    ) {
      return;
    }

    setResetting(true);
    try {
      await api.resetAccount();
      setResetSuccess(true);
      await refreshData();
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPwdMsg('New password must be at least 6 characters');
      return;
    }
    setPwdMsg('Password updated successfully (Simulated).');
    setOldPassword('');
    setNewPassword('');
    setTimeout(() => setPwdMsg(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#00d09c]" />
          <span>App & Trading Settings</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize your trading environment, audio alerts, volatility, and display preferences
        </p>
      </div>

      {/* Visual Display: Theme Toggle */}
      <div
        className={`rounded-3xl border p-6 sm:p-7 space-y-4 ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-black flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-sky-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span>Appearance Theme</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Switch between Groww-inspired light mode and night trading dark canvas
            </p>
          </div>

          <button
            id="settings-theme-toggle"
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c0f17] text-xs font-bold transition-all hover:scale-105 active:scale-95"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Switch to Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span>Switch to Dark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Audio & Sound Preferences */}
      <div
        className={`rounded-3xl border p-6 sm:p-7 space-y-4 ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-black flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#00d09c]" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span>Order Execution Audio Alerts</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Play sound effect feedback when virtual market and limit orders fill
            </p>
          </div>

          <button
            id="settings-sound-toggle"
            onClick={toggleSound}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              soundEnabled
                ? 'bg-[#00d09c] text-slate-950 shadow-xs'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}
          >
            {soundEnabled ? 'Enabled' : 'Muted'}
          </button>
        </div>
      </div>

      {/* Market Engine Controls (Volatility & Tick Speed) */}
      <div
        className={`rounded-3xl border p-6 sm:p-7 space-y-6 ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div>
          <h2 className="text-base font-black flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#00d09c]" />
            <span>Market Feed & Volatility Controls</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Fine-tune the price action generator to test risk management in calm vs volatile market conditions
          </p>
        </div>

        {/* Volatility Selection */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Market Volatility Setting
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'LOW', label: 'Low Volatility', desc: '±0.2% price swings' },
              { id: 'MEDIUM', label: 'Normal / Medium', desc: '±0.8% realistic intraday' },
              { id: 'HIGH', label: 'High Volatility', desc: '±2.5% aggressive momentum' }
            ].map((v) => (
              <button
                key={v.id}
                id={`volatility-${v.id.toLowerCase()}`}
                onClick={() => handleVolatilityChange(v.id as any)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  volatility === v.id
                    ? 'bg-[#00d09c]/10 border-[#00d09c] text-slate-900 dark:text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-[#0c0f17] border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <div className="text-xs font-black">{v.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{v.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Price Tick Speed Selection */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Price Tick Speed
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { speed: 1, label: 'Fast (1s)', desc: 'High frequency updates' },
              { speed: 3, label: 'Standard (3s)', desc: 'Real-time feed default' },
              { speed: 5, label: 'Relaxed (5s)', desc: 'Slow analysis mode' }
            ].map((s) => (
              <button
                key={s.speed}
                id={`speed-${s.speed}s`}
                onClick={() => handleTickSpeedChange(s.speed)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  tickSpeed === s.speed
                    ? 'bg-[#00d09c]/10 border-[#00d09c] text-slate-900 dark:text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-[#0c0f17] border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <div className="text-xs font-black">{s.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reset Account to Default State */}
      <div
        className={`rounded-3xl border p-6 sm:p-7 space-y-4 ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-black flex items-center gap-2 text-rose-500">
              <RotateCcw className="w-4 h-4" />
              <span>Reset Account Balance & History</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              Want to start fresh? Resetting will clear all current holdings, orders, and
              restore your trading balance to ₹5,00,000.
            </p>
          </div>

          <button
            id="btn-reset-account"
            disabled={resetting}
            onClick={handleResetAccount}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/30 text-xs font-black transition-all shrink-0 active:scale-95 disabled:opacity-50"
          >
            {resetting ? 'Resetting...' : 'Reset to ₹5,00,000'}
          </button>
        </div>

        {resetSuccess && (
          <div className="p-3 rounded-xl bg-[#00d09c]/10 border border-[#00d09c]/20 text-[#00b386] dark:text-[#00d09c] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Virtual portfolio and cash balance successfully restored to initial state.</span>
          </div>
        )}
      </div>

      {/* Password Management */}
      <div
        className={`rounded-3xl border p-6 sm:p-7 space-y-4 ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <h2 className="text-base font-black flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#00d09c]" />
          <span>Security & Password</span>
        </h2>

        {pwdMsg && (
          <div className="p-3 rounded-xl bg-[#00d09c]/10 border border-[#00d09c]/20 text-[#00b386] dark:text-[#00d09c] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{pwdMsg}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#00d09c] ${
                theme === 'dark'
                  ? 'bg-[#0c0f17] border border-slate-800 text-white'
                  : 'bg-slate-50 border border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#00d09c] ${
                theme === 'dark'
                  ? 'bg-[#0c0f17] border border-slate-800 text-white'
                  : 'bg-slate-50 border border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <button
            type="submit"
            className="py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Bottom Legal & Security Links */}
      <div
        className={`flex items-center justify-between p-4 rounded-2xl border text-xs text-slate-400 ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <button onClick={() => navigateTo('terms')} className="hover:text-slate-900 dark:hover:text-white underline">
          View Disclaimer & Regulatory Terms
        </button>
        {isAdmin && (
          <button onClick={() => navigateTo('admin-dashboard')} className="hover:text-amber-500 font-bold">
            Admin Console Portal →
          </button>
        )}
      </div>
    </div>
  );
};
