import React from 'react';
import { useTrade } from '../context/TradeContext';
import { ShieldCheck, AlertTriangle, BookOpen, Scale, ArrowLeft, Info, HelpCircle } from 'lucide-react';

export const TermsAboutPage: React.FC = () => {
  const { navigateTo, theme } = useTrade();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12">
      <button
        onClick={() => navigateTo('dashboard')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#00d09c]/10 text-[#00b386] dark:text-[#00d09c] flex items-center justify-center border border-[#00d09c]/20 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Terms of Use & Platform Policies
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Groww Stock Trading & Investment Platform Policies and Guidelines
            </p>
          </div>
        </div>
      </div>

      {/* Primary Disclosures */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 space-y-7 text-xs leading-relaxed ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
        }`}
      >
        {/* Section 1: Platform Overview */}
        <section className="space-y-3">
          <h2 className="text-sm font-black flex items-center gap-2 text-[#00b386] dark:text-[#00d09c]">
            <ShieldCheck className="w-4 h-4" />
            <span>1. Platform Overview & Terms</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            This platform provides modern tools for stock exchange order mechanics, chart analysis, mutual fund investments, and portfolio tracking.
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800 space-y-2">
            <p className="font-bold text-slate-900 dark:text-white">Operational Guidelines:</p>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>
                <strong>Market Access:</strong> Equities, Mutual Funds, ETFs, and IPO tracking with real-time continuous market quotes.
              </li>
              <li>
                <strong>Secure Balances:</strong> Safe account allocation, instant deposits, and continuous settlement.
              </li>
              <li>
                <strong>Transparent Pricing:</strong> Zero hidden charges, zero account opening fees, and flat pricing structure.
              </li>
              <li>
                <strong>Data Privacy:</strong> 256-bit encrypted data handling and secure session persistence.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 2: Financial Disclaimer */}
        <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-black flex items-center gap-2 text-amber-500">
            <AlertTriangle className="w-4 h-4" />
            <span>2. Advisory & Market Disclosures</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            All market quotes, technical indicators, historical returns, and performance metrics are provided for analytical and informational purposes. Users should conduct their own research before making financial decisions.
          </p>
        </section>

        {/* Section 3: Risk Warning */}
        <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-black flex items-center gap-2 text-rose-500">
            <AlertTriangle className="w-4 h-4" />
            <span>3. Market Risk Notice</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Trading in financial markets involves risk. Market price movements reflect underlying corporate performance, economic data, and supply-demand dynamics.
          </p>
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold">
            Investment in securities markets are subject to market risks. Read all the scheme related documents carefully before investing.
          </div>
        </section>

        {/* Section 4: Indian Market Mechanics Awareness */}
        <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-black flex items-center gap-2 text-sky-500">
            <BookOpen className="w-4 h-4" />
            <span>4. Indian Market Regulatory Architecture</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Groww adheres to standard Indian institutional frameworks:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400">
            <li>
              <strong>T+1 Rolling Settlement:</strong> Indian markets operate on a T+1 settlement cycle where equity shares and pay-ins/pay-outs settle on the next business day.
            </li>
            <li>
              <strong>Depository System:</strong> Real shares are dematerialized with CDSL or NSDL and credited to an investor’s Demat account.
            </li>
            <li>
              <strong>Broker Segregation:</strong> SEBI requires brokers to maintain separate client bank accounts to safeguard investor funds.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};
