import React, { useState } from 'react';
import { useTrade } from '../context/TradeContext';
import { IPOS_DATA, IpoItem } from '../data/marketAssetsData';
import { formatINR } from '../services/api';
import {
  Sparkles,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building,
  Smartphone,
  Info,
  X,
  Plus,
  Minus
} from 'lucide-react';

export const IpoPage: React.FC = () => {
  const { wallet, ipoApplications, applyForIpo, theme } = useTrade();

  const [filterTab, setFilterTab] = useState<'OPEN' | 'UPCOMING' | 'LISTED' | 'MY_APPLICATIONS'>('OPEN');
  const [selectedIpo, setSelectedIpo] = useState<IpoItem | null>(null);

  // Apply Modal state
  const [lots, setLots] = useState<number>(1);
  const [useCutoffPrice, setUseCutoffPrice] = useState<boolean>(true);
  const [customBidPrice, setCustomBidPrice] = useState<number>(0);
  const [upiId, setUpiId] = useState<string>('trader@okhdfcbank');
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [mandateStep, setMandateStep] = useState<'IDLE' | 'BID_SUBMITTING' | 'MANDATE_SENT' | 'SUCCESS'>('IDLE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableCash = wallet?.balance || 0;

  const filteredIpos = IPOS_DATA.filter((i) => {
    if (filterTab === 'OPEN') return i.status === 'OPEN';
    if (filterTab === 'UPCOMING') return i.status === 'UPCOMING';
    if (filterTab === 'LISTED') return i.status === 'LISTED';
    return true;
  });

  const handleOpenApplyModal = (ipo: IpoItem) => {
    setSelectedIpo(ipo);
    setLots(1);
    setUseCutoffPrice(true);
    setCustomBidPrice(ipo.priceBandMax);
    setMandateStep('IDLE');
    setErrorMsg(null);
  };

  const effectiveBidPrice = useCutoffPrice && selectedIpo ? selectedIpo.priceBandMax : customBidPrice;
  const totalAmount = selectedIpo ? lots * selectedIpo.lotSize * effectiveBidPrice : 0;

  const handleSubmitIpoApplication = async () => {
    if (!selectedIpo) return;
    setErrorMsg(null);

    if (!upiId.includes('@')) {
      setErrorMsg('Please enter a valid simulated UPI ID (e.g. name@okaxis)');
      return;
    }

    if (totalAmount > availableCash) {
      setErrorMsg(`Insufficient virtual balance. Need ${formatINR(totalAmount)}, available is ${formatINR(availableCash)}.`);
      return;
    }

    setIsApplying(true);
    setMandateStep('BID_SUBMITTING');

    setTimeout(() => {
      setMandateStep('MANDATE_SENT');
      setTimeout(async () => {
        await applyForIpo(selectedIpo, lots, effectiveBidPrice, upiId);
        setMandateStep('SUCCESS');
        setIsApplying(false);
        setTimeout(() => {
          setSelectedIpo(null);
          setFilterTab('MY_APPLICATIONS');
        }, 1800);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12">
      {/* Header Banner */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Initial Public Offerings (IPO)</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Apply for high-demand Indian IPOs with simulated UPI mandate block
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <span className="text-slate-400 block text-[10px]">Available Virtual Cash</span>
            <span className="text-sm font-black text-[#00b386] dark:text-[#00d09c]">{formatINR(availableCash)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setFilterTab('OPEN')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            filterTab === 'OPEN'
              ? 'bg-[#00d09c] text-slate-950 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Open for Bidding ({IPOS_DATA.filter((i) => i.status === 'OPEN').length})
        </button>

        <button
          onClick={() => setFilterTab('UPCOMING')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            filterTab === 'UPCOMING'
              ? 'bg-[#00d09c] text-slate-950 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Upcoming IPOs ({IPOS_DATA.filter((i) => i.status === 'UPCOMING').length})
        </button>

        <button
          onClick={() => setFilterTab('LISTED')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            filterTab === 'LISTED'
              ? 'bg-[#00d09c] text-slate-950 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Recently Listed ({IPOS_DATA.filter((i) => i.status === 'LISTED').length})
        </button>

        <button
          onClick={() => setFilterTab('MY_APPLICATIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
            filterTab === 'MY_APPLICATIONS'
              ? 'bg-[#00d09c] text-slate-950 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>My Applications</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800">
            {ipoApplications.length}
          </span>
        </button>
      </div>

      {/* TAB: MY APPLICATIONS */}
      {filterTab === 'MY_APPLICATIONS' ? (
        <div className="space-y-4">
          {ipoApplications.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Clock className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold">No IPO Applications Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You haven't bid on any IPOs. Check out current Open IPOs and submit a simulated application.
              </p>
              <button
                onClick={() => setFilterTab('OPEN')}
                className="px-4 py-2 rounded-xl bg-[#00d09c] text-slate-950 font-black text-xs"
              >
                Browse Open IPOs
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {ipoApplications.map((app) => (
                <div
                  key={app.id}
                  className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                        {app.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">App ID: {app.id}</span>
                    </div>
                    <h4 className="text-sm font-black">{app.companyName}</h4>
                    <p className="text-xs text-slate-500">
                      {app.lots} Lot ({app.sharesCount} Shares) @ {formatINR(app.bidPrice)} • UPI: {app.upiId}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Amount Blocked</span>
                      <span className="font-black text-sm">{formatINR(app.totalAmount)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] uppercase block">Allotment Date</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{app.allotmentDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* LIST OF IPOS */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIpos.map((ipo) => (
            <div
              key={ipo.id}
              className={`rounded-3xl border p-5 sm:p-6 flex flex-col justify-between transition-all hover:border-[#00d09c] ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c]">
                      {ipo.status}
                    </span>
                    <h3 className="text-base font-black mt-1">{ipo.companyName}</h3>
                    <p className="text-xs text-slate-400 font-mono">{ipo.symbol}</p>
                  </div>
                  {ipo.gmp && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Est. GMP</span>
                      <span className="text-xs font-black text-[#00b386] dark:text-[#00d09c]">
                        +{formatINR(ipo.gmp)} ({ipo.expectedListingGain}%)
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 my-2">{ipo.description}</p>

                <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-2xl bg-slate-50 dark:bg-[#0b0e14] border border-slate-100 dark:border-slate-800 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Price Band</span>
                    <span className="font-black">₹{ipo.priceBandMin} - ₹{ipo.priceBandMax}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Lot Size</span>
                    <span className="font-black">{ipo.lotSize} Shares</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Issue Size</span>
                    <span className="font-black">₹{ipo.issueSizeCr.toLocaleString()} Cr</span>
                  </div>
                </div>

                {/* Subscription Progress */}
                {ipo.subscription.total > 0 && (
                  <div className="space-y-1.5 text-xs mb-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Total Subscription:</span>
                      <span className="font-black text-[#00b386] dark:text-[#00d09c]">{ipo.subscription.total}x</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500">
                      <div>QIB: <strong className="text-slate-700 dark:text-slate-300">{ipo.subscription.qib}x</strong></div>
                      <div>NII: <strong className="text-slate-700 dark:text-slate-300">{ipo.subscription.nii}x</strong></div>
                      <div>Retail: <strong className="text-slate-700 dark:text-slate-300">{ipo.subscription.retail}x</strong></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Bidding: {ipo.openDate} - {ipo.closeDate}</span>
                  <span>Listing: {ipo.listingDate}</span>
                </div>
              </div>

              <div className="mt-4 pt-2">
                {ipo.status === 'OPEN' ? (
                  <button
                    onClick={() => handleOpenApplyModal(ipo)}
                    className="w-full py-2.5 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs transition-all shadow-md shadow-[#00d09c]/20 flex items-center justify-center gap-1.5"
                  >
                    <span>Apply for IPO (Min {formatINR(ipo.lotSize * ipo.priceBandMax)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs cursor-not-allowed text-center"
                  >
                    {ipo.status === 'UPCOMING' ? 'Opens Soon' : 'Closed / Listed'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* APPLY MODAL */}
      {selectedIpo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in duration-200 ${
              theme === 'dark' ? 'bg-[#111622] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black">Apply for {selectedIpo.companyName}</h3>
                <p className="text-xs text-slate-400">
                  Price Band: ₹{selectedIpo.priceBandMin} - ₹{selectedIpo.priceBandMax} • Lot Size: {selectedIpo.lotSize}
                </p>
              </div>
              <button
                onClick={() => setSelectedIpo(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {mandateStep === 'SUCCESS' ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#00d09c]/20 text-[#00b386] dark:text-[#00d09c] flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h4 className="text-base font-black">IPO Application Submitted!</h4>
                <p className="text-xs text-slate-400">
                  UPI Mandate of {formatINR(totalAmount)} approved and funds successfully reserved until allotment ({selectedIpo.allotmentDate}).
                </p>
              </div>
            ) : mandateStep === 'MANDATE_SENT' || mandateStep === 'BID_SUBMITTING' ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-10 h-10 mx-auto border-3 border-[#00d09c] border-t-transparent rounded-full animate-spin" />
                <h4 className="text-sm font-black">
                  {mandateStep === 'BID_SUBMITTING' ? 'Submitting Bid to Exchange...' : 'Authorizing Simulated UPI Mandate...'}
                </h4>
                <p className="text-xs text-slate-400">Please wait while the simulated bank approves the lien amount.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Lot Selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Number of Lots</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setLots((prev) => Math.max(1, prev - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800 flex items-center justify-center font-black"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1 text-center py-2 rounded-xl bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800">
                      <span className="text-base font-black">{lots} Lot</span>
                      <span className="text-xs text-slate-400 block">({lots * selectedIpo.lotSize} Shares)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLots((prev) => Math.min(15, prev + 1))}
                      className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800 flex items-center justify-center font-black"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Cutoff price toggle */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block">Apply at Cut-off Price</span>
                    <span className="text-[11px] text-slate-400">Bid automatically at upper band (₹{selectedIpo.priceBandMax})</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={useCutoffPrice}
                    onChange={(e) => setUseCutoffPrice(e.target.checked)}
                    className="w-4 h-4 accent-[#00d09c]"
                  />
                </div>

                {/* UPI ID entry */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                    UPI ID for Mandate Verification
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@oksbi or name@okhdfcbank"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0b0e14] text-xs font-bold focus:outline-none focus:border-[#00d09c]"
                    />
                  </div>
                </div>

                {/* Total amount breakdown */}
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Payable / Blocked:</span>
                    <span className="text-base font-black text-[#00b386] dark:text-[#00d09c]">{formatINR(totalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Available Virtual Cash:</span>
                    <span className="font-bold">{formatINR(availableCash)}</span>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 font-medium">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSubmitIpoApplication}
                  disabled={isApplying}
                  className="w-full py-3 bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-[#00d09c]/20 flex items-center justify-center gap-1.5"
                >
                  <span>Authorize Mandate & Apply ({formatINR(totalAmount)})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
