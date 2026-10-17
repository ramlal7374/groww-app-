import React from 'react';
import { useTrade } from '../context/TradeContext';
import { BellRing, X, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { formatINR } from '../services/api';

export const NotificationBanner: React.FC = () => {
  const { triggeredAlert, dismissTriggeredAlert, navigateTo, stocks } = useTrade();

  if (!triggeredAlert) return null;

  const currentStock = stocks.find((s) => s.symbol === triggeredAlert.symbol);
  const currentPrice = currentStock?.currentPrice || triggeredAlert.targetPrice;

  return (
    <div className="fixed top-16 right-4 z-50 max-w-md w-full animate-bounce-short">
      <div className="bg-[#111622] text-white border-2 border-[#00d09c] rounded-2xl p-4 shadow-2xl shadow-[#00d09c]/20 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#00d09c]/20 border border-[#00d09c] flex items-center justify-center text-[#00d09c] shrink-0 animate-pulse">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00d09c] text-slate-950">
                  Price Alert Triggered
                </span>
                <span className="text-xs text-slate-400 font-mono">Just Now</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1">
                {triggeredAlert.symbol} has reached {formatINR(triggeredAlert.targetPrice)}!
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Target was set to trigger when price is {triggeredAlert.condition.toLowerCase()} {formatINR(triggeredAlert.targetPrice)}. Current simulated market price: <strong className="text-[#00d09c]">{formatINR(currentPrice)}</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={dismissTriggeredAlert}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={dismissTriggeredAlert}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white font-semibold transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              dismissTriggeredAlert();
              navigateTo('stock-details', triggeredAlert.symbol);
            }}
            className="px-3.5 py-1.5 bg-[#00d09c] hover:bg-[#00b386] text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-1 shadow-sm"
          >
            <span>Trade {triggeredAlert.symbol}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
