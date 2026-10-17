import React, { useState } from 'react';
import { useTrade } from '../context/TradeContext';
import { formatINR } from '../services/api';
import { Stock } from '../types';
import { Bell, X, Check, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';

interface PriceAlertModalProps {
  stock: Stock;
  isOpen: boolean;
  onClose: () => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({ stock, isOpen, onClose }) => {
  const { addPriceAlert, priceAlerts, togglePriceAlert, deletePriceAlert, theme } = useTrade();

  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [targetPrice, setTargetPrice] = useState<string>((stock.currentPrice * 1.05).toFixed(2));
  const [percentDelta, setPercentDelta] = useState<number>(5);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const stockAlerts = priceAlerts.filter((a) => a.symbol === stock.symbol);

  const handleSetPercent = (pct: number) => {
    setPercentDelta(pct);
    const multiplier = 1 + pct / 100;
    const calcPrice = (stock.currentPrice * multiplier).toFixed(2);
    setTargetPrice(calcPrice);
    setCondition(pct >= 0 ? 'ABOVE' : 'BELOW');
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(targetPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    addPriceAlert(stock.symbol, priceNum, condition, percentDelta);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 ${
          theme === 'dark' ? 'bg-[#111622] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">Set Price Alert</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {stock.symbol} • Current: {formatINR(stock.currentPrice)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#00d09c]/20 text-[#00b386] dark:text-[#00d09c] flex items-center justify-center animate-bounce">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="text-sm font-black">Alert Created Successfully!</h4>
            <p className="text-xs text-slate-400">
              We'll notify you when {stock.symbol} reaches {formatINR(parseFloat(targetPrice))}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreateAlert} className="space-y-4">
            {/* Quick Percentage Presets */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                Quick Move Preset
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[-5, -2, 2, 5].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleSetPercent(pct)}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      percentDelta === pct
                        ? 'bg-[#00d09c] text-slate-950 border-[#00d09c]'
                        : pct > 0
                        ? 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
                        : 'border-rose-500/30 text-rose-500 hover:bg-rose-500/10'
                    }`}
                  >
                    {pct > 0 ? `+${pct}%` : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition: Above or Below */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                Trigger When Price Goes
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCondition('ABOVE')}
                  className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    condition === 'ABOVE'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  <span>Above / Greater Than</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('BELOW')}
                  className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    condition === 'BELOW'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 text-rose-400" />
                  <span>Below / Less Than</span>
                </button>
              </div>
            </div>

            {/* Target Price Input */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                Target Price (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="0.05"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0b0e14] text-sm font-bold focus:outline-none focus:border-[#00d09c]"
                  placeholder="Enter target price"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-[#00d09c]/20 flex items-center justify-center gap-1.5 mt-2"
            >
              <Bell className="w-4 h-4" />
              <span>Create Active Alert</span>
            </button>
          </form>
        )}

        {/* Existing Alerts on this Stock */}
        {stockAlerts.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Existing Alerts ({stockAlerts.length})
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {stockAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <div>
                    <span className="font-bold">
                      {alt.condition} {formatINR(alt.targetPrice)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {alt.triggered ? 'Triggered' : alt.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => togglePriceAlert(alt.id)}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        alt.enabled ? 'bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c]' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {alt.enabled ? 'On' : 'Off'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePriceAlert(alt.id)}
                      className="text-rose-500 hover:text-rose-400 font-bold text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
