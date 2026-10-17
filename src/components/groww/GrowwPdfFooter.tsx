import React from 'react';
import { useTrade } from '../../context/TradeContext';
import { ShieldCheck, Smartphone, ExternalLink, Heart } from 'lucide-react';

export const GrowwPdfFooter: React.FC = () => {
  const { theme, navigateTo } = useTrade();

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <footer
      className={`mt-14 pt-10 pb-16 border-t transition-colors text-xs ${
        theme === 'dark'
          ? 'bg-[#0e1118] border-slate-800/80 text-slate-400'
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Groww Company Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#00d09c] text-slate-950 font-black flex items-center justify-center text-sm">
                G
              </div>
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">Groww</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Vaishnavi Tech Park, 3rd & 4th Floor, Sarjapur Main Road, Bellandur, Bengaluru, Karnataka 560103
            </p>
            <div className="pt-2 text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">Contact Us</div>
              <div className="text-[#00b386] dark:text-[#00d09c] font-medium">support@groww.in</div>
            </div>
          </div>

          {/* Column 2: Products */}
          <div className="space-y-2">
            <h5 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Products on Groww
            </h5>
            <ul className="space-y-1.5 text-xs">
              <li><button onClick={() => navigateTo('markets')} className="hover:text-[#00d09c] transition-colors">Stocks & Intra-day</button></li>
              <li><button onClick={() => navigateTo('index-details')} className="hover:text-[#00d09c] transition-colors">Futures & Options (F&O)</button></li>
              <li><button onClick={() => navigateTo('investment')} className="hover:text-[#00d09c] transition-colors">Direct Mutual Funds</button></li>
              <li><button onClick={() => navigateTo('investment')} className="hover:text-[#00d09c] transition-colors">IPO & Sovereign Gold Bonds</button></li>
              <li><button onClick={() => navigateTo('markets')} className="hover:text-[#00d09c] transition-colors">Margin Trading Facility (MTF)</button></li>
            </ul>
          </div>

          {/* Column 3: Groww Platform */}
          <div className="space-y-2">
            <h5 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Groww Platform
            </h5>
            <ul className="space-y-1.5 text-xs">
              <li><button onClick={() => navigateTo('dashboard')} className="hover:text-[#00d09c] transition-colors">About Us</button></li>
              <li><button onClick={() => navigateTo('pricing')} className="hover:text-[#00d09c] transition-colors">Pricing & Charges</button></li>
              <li><button onClick={() => navigateTo('terms')} className="hover:text-[#00d09c] transition-colors">Trust & Safety</button></li>
              <li><button onClick={() => navigateTo('terms')} className="hover:text-[#00d09c] transition-colors">Terms & Disclosures</button></li>
              <li><button onClick={() => navigateTo('news')} className="hover:text-[#00d09c] transition-colors">Market Pulse & News</button></li>
            </ul>
          </div>

          {/* Column 4: App Download & Badges */}
          <div className="space-y-3">
            <h5 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Download Groww App
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trade anytime, anywhere with India's most loved investing platform.
            </p>
            <div className="flex flex-col gap-2">
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-[#00d09c]" />
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">GET IT ON</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Google Play & App Store</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Directory: Stocks A to Z from PDF */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Stocks Directory (A to Z)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => navigateTo('markets')}
                className="w-6 h-6 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#00d09c] hover:text-[#00d09c] text-center font-bold text-[11px] transition-colors cursor-pointer"
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Regulatory & Risk Disclosures matching Groww PDF */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-[#00d09c]" />
            <span>Nextbillion Technology Private Limited</span>
          </div>
          <p>
            SEBI Registration No. INZ000301838 | BSE Member Code: 6699 | NSE Member Code: 90177 | Depository Participant (CDSL): IN-DP-417-2019 | Research Analyst: INH000008593 | AMFI Registered Mutual Fund Distributor: ARN-111686.
          </p>
          <p>
            Investments in securities market are subject to market risks, read all the related documents carefully before investing. Brokerage will not exceed SEBI prescribed limit. Standard statutory charges apply.
          </p>
          <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400">
            <span>© {new Date().getFullYear()} Groww. All rights reserved. Version 7.9.9</span>
            <span>Made for Indian Retail Investors</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
