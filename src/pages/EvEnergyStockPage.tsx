import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrade } from '../context/TradeContext';
import { formatINR } from '../services/api';
import { api } from '../services/api';
import { EvEnergySlot, EvEnergyConfig } from '../types';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Trophy,
  Flame,
  ArrowRight,
  ChevronRight,
  BatteryCharging,
  Cpu,
  Layers,
  History,
  Info,
  Wallet,
  Play,
  Volume2,
  VolumeX,
  X,
  BarChart2,
  Users,
  Search,
  Filter,
  Landmark,
  Building2,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { COMMUNITY_INVESTOR_TRANSACTIONS, CommunityInvestorEntry } from '../data/communityTransactionsData';

// Exact prices specified by user
const ALLOWED_PRICES = [1000, 2000, 3000, 5000, 10000, 15000, 20000, 50000];

// EV Energy Stock Tier definitions
interface EvTierOption {
  price: number;
  label: string;
  sublabel: string;
  badge: string;
  color: string;
  borderColor: string;
  profit: number; // Exact profit as requested by user
  multiplier: number; // 4.0 (1x principal + 3x profit = 300% profit)
}

const EV_TIERS: EvTierOption[] = [
  {
    price: 1000,
    profit: 3000,
    label: 'EV Starter Node',
    sublabel: 'Smart Charging Grid Unit',
    badge: 'Profit +₹3,000 (3x)',
    color: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'border-emerald-500/30',
    multiplier: 4.0
  },
  {
    price: 2000,
    profit: 6000,
    label: 'EV Fast-Charge Hub',
    sublabel: 'Urban Highway High-Speed Charger',
    badge: 'Profit +₹6,000 (3x)',
    color: 'from-blue-500/20 to-indigo-500/10',
    borderColor: 'border-blue-500/30',
    multiplier: 4.0
  },
  {
    price: 3000,
    profit: 9000,
    label: 'Mega-Volt Power Unit',
    sublabel: 'Commercial EV Superstation',
    badge: 'Profit +₹9,000 (3x)',
    color: 'from-purple-500/20 to-pink-500/10',
    borderColor: 'border-purple-500/30',
    multiplier: 4.0
  },
  {
    price: 5000,
    profit: 15000,
    label: 'High-Density Lithium Pack',
    sublabel: 'Next-Gen Battery Swapping Depot',
    badge: 'Profit +₹15,000 (3x)',
    color: 'from-amber-500/20 to-orange-500/10',
    borderColor: 'border-amber-500/30',
    multiplier: 4.0
  },
  {
    price: 10000,
    profit: 30000,
    label: 'Interstate Clean Corridor',
    sublabel: 'Power Grid High-Capacity Feeder',
    badge: 'Profit +₹30,000 (3x)',
    color: 'from-cyan-500/20 to-blue-600/10',
    borderColor: 'border-cyan-500/30',
    multiplier: 4.0
  },
  {
    price: 15000,
    profit: 45000,
    label: 'Gigawatt Solar-EV Substation',
    sublabel: 'Sovereign Clean Power Infrastructure',
    badge: 'Profit +₹45,000 (3x)',
    color: 'from-emerald-600/25 to-lime-600/10',
    borderColor: 'border-emerald-500/40',
    multiplier: 4.0
  },
  {
    price: 20000,
    profit: 60000,
    label: 'National Fleet Power Cluster',
    sublabel: 'Multi-City Commercial Transport Fleet',
    badge: 'Profit +₹60,000 (3x)',
    color: 'from-violet-600/25 to-purple-600/10',
    borderColor: 'border-violet-500/40',
    multiplier: 4.0
  },
  {
    price: 50000,
    profit: 150000,
    label: 'Sovereign Energy Grid Reserve',
    sublabel: 'Institutional Clean-Tech Capital Tier',
    badge: 'Profit +₹1,50,000 (3x)',
    color: 'from-amber-500/30 to-yellow-600/15',
    borderColor: 'border-amber-500/50',
    multiplier: 4.0
  }
];

// Web Audio synthesizer for animations & sound effects
function playSound(type: 'BOOKING' | 'WIN' | 'LOSS') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'BOOKING') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'WIN') {
      // Victory Arpeggio (C5, E5, G5, C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.45);
      });
    } else if (type === 'LOSS') {
      // Gentle Descending Minor tone
      const freqs = [440, 392, 349.23, 311.13];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.4);
      });
    }
  } catch {
    // Audio context may be restricted by user gesture policy
  }
}

// Confetti burst for profit celebration
const ConfettiBurst: React.FC = () => {
  const pieces = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      color: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#eab308'][i % 7],
      delay: Math.random() * 0.3,
      duration: Math.random() * 1.5 + 1
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, scale: 0, y: -20, rotate: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 1, 0.8],
            y: [0, p.y * 3.5],
            x: [(Math.random() - 0.5) * 50, (Math.random() - 0.5) * 150],
            rotate: p.rotation + 360
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut'
          }}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '15%',
            width: `${p.size}px`,
            height: `${p.size * 1.4}px`,
            backgroundColor: p.color,
            borderRadius: p.size > 8 ? '50%' : '2px'
          }}
        />
      ))}
    </div>
  );
};

export const EvEnergyStockPage: React.FC = () => {
  const { wallet, setQuickAddModalOpen, navigateTo, theme, addNotification, refreshWallet } = useTrade();

  // Tier selection: default to ₹2,000 (one of the exact prices requested)
  const [selectedPrice, setSelectedPrice] = useState<number>(2000);
  // Duration: 1 or 2 hours
  const [selectedDuration, setSelectedDuration] = useState<1 | 2>(1);
  const [sharesQty, setSharesQty] = useState<number>(1);

  // Slots state from backend
  const [slots, setSlots] = useState<EvEnergySlot[]>([]);
  const [config, setConfig] = useState<EvEnergyConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Live Chart & Candlestick State
  const [candlestickTimeframe, setCandlestickTimeframe] = useState<'1m' | '5m' | '15m' | '1h'>('5m');
  const [livePrice, setLivePrice] = useState<number>(2480.5);
  const [priceChange, setPriceChange] = useState<number>(+46.8);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(+1.92);

  // Booking Animation Modal state
  const [showBookingAnimation, setShowBookingAnimation] = useState<boolean>(false);
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [bookedSlotInfo, setBookedSlotInfo] = useState<EvEnergySlot | null>(null);

  // Resolution Animation Modal state (Profit / Loss)
  const [resolutionModal, setResolutionModal] = useState<{
    isOpen: boolean;
    type: 'WIN' | 'LOSS';
    slot: EvEnergySlot | null;
    payout: number;
    profit: number;
  }>({
    isOpen: false,
    type: 'WIN',
    slot: null,
    payout: 0,
    profit: 0
  });

  // Sound enabled toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Fetch slots from API
  const loadSlots = async () => {
    try {
      const res = await api.getEvEnergySlots();
      setSlots(res.slots || []);
      setConfig(res.config || null);
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
    const interval = setInterval(loadSlots, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Live price tick simulation for EV Energy Index (for live chart & candlestick)
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrice((prev) => {
        const delta = (Math.random() - 0.48) * 4.5;
        const next = Math.max(1800, Number((prev + delta).toFixed(2)));
        const chg = Number((next - 2433.7).toFixed(2));
        setPriceChange(chg);
        setPriceChangePercent(Number(((chg / 2433.7) * 100).toFixed(2)));
        return next;
      });
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  // Selected Tier object
  const currentTier = useMemo(() => {
    return EV_TIERS.find((t) => t.price === selectedPrice) || EV_TIERS[0];
  }, [selectedPrice]);

  const totalInvestedAmount = selectedPrice * sharesQty;
  const projectedProfit = Math.round(totalInvestedAmount * (currentTier.multiplier - 1));
  const projectedGrossPayout = totalInvestedAmount + projectedProfit;

  // Community Investor Ledger States (125+ Verified Entries)
  const [commSearch, setCommSearch] = useState('');
  const [commFilter, setCommFilter] = useState<'ALL' | 'SUCCESS' | 'PROCESSING' | 'FAILED' | 'HIGH_PROFIT'>('ALL');
  const [commPage, setCommPage] = useState(1);
  const commPageSize = 10;

  const filteredCommunity = useMemo(() => {
    return COMMUNITY_INVESTOR_TRANSACTIONS.filter((entry) => {
      if (commFilter === 'SUCCESS' && entry.withdrawalStatus !== 'SUCCESS') return false;
      if (commFilter === 'PROCESSING' && entry.withdrawalStatus !== 'PROCESSING') return false;
      if (commFilter === 'FAILED' && entry.withdrawalStatus !== 'FAILED') return false;
      if (commFilter === 'HIGH_PROFIT' && (entry.profitOrLoss?.amount || 0) < 30000) return false;

      if (!commSearch.trim()) return true;
      const q = commSearch.toLowerCase().trim();
      return (
        entry.investorName.toLowerCase().includes(q) ||
        entry.bankName.toLowerCase().includes(q) ||
        entry.investPrice.toString().includes(q) ||
        entry.referenceId?.toLowerCase().includes(q)
      );
    });
  }, [commSearch, commFilter]);

  const totalCommPages = Math.ceil(filteredCommunity.length / commPageSize);
  const paginatedCommunity = useMemo(() => {
    const start = (commPage - 1) * commPageSize;
    return filteredCommunity.slice(start, start + commPageSize);
  }, [filteredCommunity, commPage]);

  // Aggregate Community stats
  const communityStats = useMemo(() => {
    let totalInvested = 0;
    let totalProfitPaid = 0;
    let successCount = 0;
    COMMUNITY_INVESTOR_TRANSACTIONS.forEach((e) => {
      totalInvested += e.investPrice;
      if (e.profitOrLoss.type === 'PROFIT') {
        totalProfitPaid += e.profitOrLoss.amount;
      }
      if (e.withdrawalStatus === 'SUCCESS') {
        successCount++;
      }
    });
    return {
      totalInvested,
      totalProfitPaid,
      totalInvestors: COMMUNITY_INVESTOR_TRANSACTIONS.length,
      successRate: Number(((successCount / COMMUNITY_INVESTOR_TRANSACTIONS.length) * 100).toFixed(1))
    };
  }, []);

  // Handle Slot Booking
  const handleBookSlot = async () => {
    const currentBal = wallet?.balance || 0;
    if (currentBal < totalInvestedAmount) {
      addNotification(
        `Insufficient virtual balance (₹${currentBal.toLocaleString()}). Needed: ₹${totalInvestedAmount.toLocaleString()}`,
        'warning'
      );
      setQuickAddModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    setBookingStep(1);
    setShowBookingAnimation(true);
    if (soundEnabled) playSound('BOOKING');

    try {
      // Step 1: Connecting
      await new Promise((r) => setTimeout(r, 700));
      setBookingStep(2);

      // Step 2: Quota Allocation
      await new Promise((r) => setTimeout(r, 800));
      const res = await api.bookEvEnergySlot(selectedPrice, selectedDuration, sharesQty);

      setBookingStep(3);
      setBookedSlotInfo(res.slot);
      await loadSlots();
      if (refreshWallet) refreshWallet();

      addNotification(
        `⚡ EV Energy Stock ${selectedDuration}-Hour Slot #${res.slot.id} Activated!`,
        'success'
      );
    } catch (err: any) {
      setShowBookingAnimation(false);
      addNotification(err.message || 'Failed to book EV Energy slot', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Settle / Check Slot Result
  const handleCheckSlotOutcome = async (slot: EvEnergySlot) => {
    try {
      const res = await api.settleEvEnergySlot(slot.id);
      await loadSlots();
      if (refreshWallet) refreshWallet();

      if (res.result === 'WIN') {
        if (soundEnabled) playSound('WIN');
        setResolutionModal({
          isOpen: true,
          type: 'WIN',
          slot: res.slot,
          payout: res.payout || res.slot.totalInvested + res.slot.profitAmount,
          profit: res.slot.profitAmount
        });
      } else {
        if (soundEnabled) playSound('LOSS');
        setResolutionModal({
          isOpen: true,
          type: 'LOSS',
          slot: res.slot,
          payout: 0,
          profit: 0
        });
      }
    } catch (err: any) {
      addNotification(err.message || 'Error settling slot', 'error');
    }
  };

  // Mock live candlestick data
  const candleData = useMemo(() => {
    const base = livePrice;
    return [
      { time: '09:15', open: base - 28, high: base - 10, low: base - 35, close: base - 15, isGreen: true },
      { time: '09:30', open: base - 15, high: base - 5, low: base - 25, close: base - 20, isGreen: false },
      { time: '09:45', open: base - 20, high: base - 8, low: base - 22, close: base - 10, isGreen: true },
      { time: '10:00', open: base - 10, high: base + 8, low: base - 14, close: base + 2, isGreen: true },
      { time: '10:15', open: base + 2, high: base + 15, low: base - 5, close: base + 8, isGreen: true },
      { time: '10:30', open: base + 8, high: base + 22, low: base + 4, close: base + 18, isGreen: true },
      { time: '10:45', open: base + 18, high: base + 20, low: base + 5, close: base + 10, isGreen: false },
      { time: '11:00', open: base + 10, high: base + 25, low: base + 8, close: base + 22, isGreen: true },
      { time: '11:15', open: base + 22, high: base + 35, low: base + 16, close: base + 30, isGreen: true },
      { time: '11:30', open: base + 30, high: base + 42, low: base + 25, close: base + 38, isGreen: true },
      { time: '11:45', open: base + 38, high: base + 45, low: base + 32, close: base + 34, isGreen: false },
      { time: '12:00 (Live)', open: base + 34, high: base + 48, low: base + 30, close: base + 40, isGreen: true }
    ];
  }, [livePrice]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 pb-24">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-[#07090e] border-b border-emerald-500/20 px-4 sm:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 animate-pulse">
                <Zap className="w-3.5 h-3.5" />
                <span>Live Energy Trading Grid</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                1 - 2 Hour Short-Cycle Slots
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>EV Energy Stock Terminal</span>
              <BatteryCharging className="w-6 h-6 text-emerald-400" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Trade India’s Electric Vehicle & Clean Energy Power Grid short-cycle slots. Book a fixed price tier (₹1,000 to ₹50,000) with rapid 1 to 2-hour settlement cycles.
            </p>
          </div>

          {/* Quick Wallet & Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
              className="p-2.5 rounded-2xl bg-[#0f131c] border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <div className="bg-[#0f131c] border border-emerald-500/30 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Available Virtual Balance</span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {formatINR(wallet?.balance || 0)}
                </span>
              </div>
              <button
                onClick={() => setQuickAddModalOpen(true)}
                className="ml-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shadow-sm shadow-emerald-500/30"
              >
                + Add Cash
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-8">
        {/* LIVE TICKER BANNER: RECENT BANK WITHDRAWALS & PROFITS */}
        <div className="bg-[#0b0f19] border border-emerald-500/30 rounded-2xl p-2.5 sm:p-3 overflow-hidden shadow-lg flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1.5 border border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Live Withdrawals</span>
          </div>

          <div className="flex-1 overflow-x-auto scrollbar-none whitespace-nowrap text-xs text-slate-300 flex items-center gap-6 animate-pulse">
            <span className="inline-flex items-center gap-1.5">
              <strong className="text-white">Harigyan Singh Gurjar:</strong>
              <span className="text-emerald-400 font-bold font-mono">₹2,00,000 Payout</span>
              <span className="text-slate-400">(+₹1,50,000 Profit on ₹50K)</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30">SBI IMPS Success</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1.5">
              <strong className="text-white">Rajesh Kumar Sharma:</strong>
              <span className="text-emerald-400 font-bold font-mono">₹80,000 Payout</span>
              <span className="text-slate-400">(+₹60,000 Profit on ₹20K)</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30">HDFC IMPS Success</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1.5">
              <strong className="text-white">Priya Mehra:</strong>
              <span className="text-emerald-400 font-bold font-mono">₹40,000 Payout</span>
              <span className="text-slate-400">(+₹30,000 Profit on ₹10K)</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30">ICICI IMPS Success</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1.5">
              <strong className="text-white">Vikramaditya Rao:</strong>
              <span className="text-emerald-400 font-bold font-mono">₹20,000 Payout</span>
              <span className="text-slate-400">(+₹15,000 Profit on ₹5K)</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30">PNB IMPS Success</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1.5">
              <strong className="text-white">Amit Verma:</strong>
              <span className="text-emerald-400 font-bold font-mono">₹4,000 Payout</span>
              <span className="text-slate-400">(+₹3,000 Profit on ₹1K)</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30">Axis Bank Success</span>
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 1: LIVE CANDLESTICK & EV ENERGY INDEX CHART       */}
        {/* ======================================================== */}
        <div className="bg-[#0e131f] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white">INDEX: EV-ENERGY / INR</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    NSE Clean Grid
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-2xl font-black text-white font-mono">
                    ₹{livePrice.toFixed(2)}
                  </span>
                  <span className={`text-xs font-bold font-mono flex items-center gap-1 ${
                    priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {priceChange >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center gap-1 bg-[#090c13] p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
              {(['1m', '5m', '15m', '1h'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setCandlestickTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    candlestickTimeframe === tf
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Live Candlestick Canvas & Grid */}
          <div className="pt-5 pb-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-mono">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>Live Feed Active • Real-Time Energy Demand Surge</span>
              </span>
              <span className="hidden sm:inline">High: ₹{(livePrice + 38).toFixed(2)} | Low: ₹{(livePrice - 42).toFixed(2)} | Vol: 4.8M Units</span>
            </div>

            {/* Candlestick visual bars */}
            <div className="h-44 sm:h-52 w-full bg-[#080b11] border border-slate-800/60 rounded-2xl p-4 flex items-end justify-between gap-1 sm:gap-2 relative overflow-hidden">
              {/* Background horizontal grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 p-2">
                <div className="border-b border-dashed border-slate-600 w-full" />
                <div className="border-b border-dashed border-slate-600 w-full" />
                <div className="border-b border-dashed border-slate-600 w-full" />
              </div>

              {candleData.map((c, i) => {
                const minPrice = livePrice - 50;
                const maxPrice = livePrice + 60;
                const range = maxPrice - minPrice;
                const wickBottom = ((c.low - minPrice) / range) * 100;
                const wickHeight = Math.max(10, ((c.high - c.low) / range) * 100);
                const bodyBottom = ((Math.min(c.open, c.close) - minPrice) / range) * 100;
                const bodyHeight = Math.max(8, (Math.abs(c.close - c.open) / range) * 100);

                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full relative group">
                    {/* Wick */}
                    <div
                      className={`w-[1.5px] absolute ${c.isGreen ? 'bg-emerald-400' : 'bg-rose-400'}`}
                      style={{ bottom: `${wickBottom}%`, height: `${wickHeight}%` }}
                    />
                    {/* Body */}
                    <div
                      className={`w-3 sm:w-5 absolute rounded-xs transition-all duration-300 ${
                        c.isGreen
                          ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50'
                          : 'bg-rose-500 shadow-xs shadow-rose-500/50'
                      }`}
                      style={{ bottom: `${bodyBottom}%`, height: `${bodyHeight}%` }}
                    />
                    {/* Time tooltip */}
                    <div className="absolute bottom-1 text-[9px] text-slate-500 font-mono hidden sm:block">
                      {c.time.split(' ')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 2: EXACT PRICES SELECTION & 1-2 HOUR DURATION     */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>Select EV Energy Share Price Tier</span>
                <Flame className="w-5 h-5 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400">
                Choose an official EV Energy stock price tier. Return settlement resolves in only 1 to 2 hours.
              </p>
            </div>

            {/* Duration Selector (1 or 2 Hours) */}
            <div className="flex items-center gap-2 bg-[#0e131f] p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
              <span className="text-xs text-slate-400 px-2 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Slot Duration:</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedDuration(1)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDuration === 1
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                ⚡ 1 Hour Slot
              </button>
              <button
                type="button"
                onClick={() => setSelectedDuration(2)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDuration === 2
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🚀 2 Hours Slot
              </button>
            </div>
          </div>

          {/* Pricing Grid (Exactly: 1000, 2000, 3000, 5000, 10000, 15000, 20000, 50000) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {EV_TIERS.map((tier) => {
              const isSelected = selectedPrice === tier.price;
              const expectedProfit = tier.price * (tier.multiplier - 1);
              const grossPayout = tier.price + expectedProfit;

              return (
                <div
                  key={tier.price}
                  onClick={() => setSelectedPrice(tier.price)}
                  className={`relative p-4 rounded-3xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#111928] to-[#0c101a] border-emerald-500 shadow-xl shadow-emerald-500/10 scale-[1.01]'
                      : 'bg-[#0b0e15] border-slate-800/80 hover:border-slate-700 hover:bg-[#0f1420]'
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800/80 text-slate-300 border border-slate-700">
                      {tier.badge}
                    </span>
                    <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedDuration}h Cycle
                    </span>
                  </div>

                  {/* Share Price */}
                  <div className="space-y-1 mb-4">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Share Price Tier
                    </div>
                    <div className="text-2xl font-black text-white font-mono tracking-tight">
                      {formatINR(tier.price, false)}
                    </div>
                    <div className="text-xs font-bold text-slate-200">{tier.label}</div>
                    <div className="text-[10px] text-slate-500">{tier.sublabel}</div>
                  </div>

                  {/* Payout Metric */}
                  <div className="p-2.5 rounded-2xl bg-[#07090e] border border-slate-800/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Profit Potential</span>
                      <span className="text-emerald-400 font-bold font-mono">+{formatINR(expectedProfit, false)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300 font-bold border-t border-slate-800/60 pt-1">
                      <span>Total Payout</span>
                      <span className="text-cyan-400 font-mono">{formatINR(grossPayout, false)}</span>
                    </div>
                  </div>

                  {/* Selection indicator */}
                  <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-800/40 text-[11px]">
                    <span className={isSelected ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {isSelected ? '✓ Selected Tier' : 'Click to Select'}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 3: BOOKING SUMMARY & ANIMATED TRIGGER BUTTON     */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-br from-[#101726] to-[#090d16] border border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Ready To Deploy
                </span>
                <span className="text-xs text-slate-400">EV Short-Cycle Grid Reservation</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Book {currentTier.label} ({formatINR(selectedPrice, false)}) for {selectedDuration} Hour
              </h3>
              <p className="text-xs text-slate-400">
                Your investment is backed by virtual clean-tech simulated energy quotas. Outcome resolves at completion.
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 bg-[#080b11] p-2.5 rounded-2xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Units / Shares:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSharesQty(Math.max(1, sharesQty - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-sm font-mono font-bold text-white px-2">{sharesQty}</span>
                <button
                  type="button"
                  onClick={() => setSharesQty(sharesQty + 1)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#080b11]/80 p-4 rounded-2xl border border-slate-800/80">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block">Total Investment</span>
              <span className="text-base font-black text-white font-mono">
                {formatINR(totalInvestedAmount, false)}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block">Cycle Timeframe</span>
              <span className="text-base font-black text-cyan-400 font-mono">
                {selectedDuration} Hour ({selectedDuration * 60} Min)
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block">Projected Profit</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                +{formatINR(projectedProfit, false)}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block">Gross Return Value</span>
              <span className="text-base font-black text-amber-400 font-mono">
                {formatINR(projectedGrossPayout, false)}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleBookSlot}
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/25 active:scale-[0.99] disabled:opacity-50"
          >
            <Zap className="w-5 h-5" />
            <span>Confirm & Book EV Energy Slot ({formatINR(totalInvestedAmount, false)})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* SECTION 4: MY BOOKED EV ENERGY SLOTS & LIVE COUNTDOWN    */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>My EV Energy Stock Slots</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
                  {slots.length} Total
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Track your active short-cycle contracts and claim profits upon settlement.
              </p>
            </div>

            <button
              onClick={loadSlots}
              className="px-3 py-1.5 rounded-xl bg-[#0f131c] border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {slots.length === 0 ? (
            <div className="bg-[#0b0e14] border border-slate-800 rounded-3xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                <BatteryCharging className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">No EV Energy Slots Booked Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Select a price tier above (₹1,000 to ₹50,000) and book your first 1-2 hour power contract to start participating in the clean energy simulation.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map((slot) => {
                const now = Date.now();
                const expiryTime = new Date(slot.expiresAt).getTime();
                const isExpired = now >= expiryTime;
                const remainingMs = Math.max(0, expiryTime - now);
                const remainingMinutes = Math.floor(remainingMs / 60000);
                const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);

                const isSettled = slot.status !== 'ACTIVE';
                const isWin = slot.status === 'SETTLED_WIN';
                const isLoss = slot.status === 'SETTLED_LOSS';

                return (
                  <div
                    key={slot.id}
                    className={`bg-[#0c101a] border rounded-3xl p-5 space-y-3.5 flex flex-col justify-between transition-all ${
                      isSettled
                        ? isWin
                          ? 'border-emerald-500/40 bg-gradient-to-b from-[#0c1a14] to-[#0c101a]'
                          : 'border-rose-500/40 bg-gradient-to-b from-[#1a0c0c] to-[#0c101a]'
                        : 'border-slate-800 hover:border-slate-700 shadow-md'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: {slot.id}</div>
                        <h4 className="text-sm font-black text-white">
                          ₹{slot.tierPrice.toLocaleString()} Tier ({slot.durationHours}h)
                        </h4>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isSettled
                          ? isWin
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse'
                      }`}>
                        {isSettled ? (isWin ? 'PROFIT WON' : 'LOSS') : 'ACTIVE GRID'}
                      </span>
                    </div>

                    {/* Investment Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-[#07090e] p-2 rounded-xl border border-slate-800/60">
                        <span className="text-[10px] text-slate-400 block">Total Invested</span>
                        <span className="font-bold text-white">{formatINR(slot.totalInvested)}</span>
                      </div>
                      <div className="bg-[#07090e] p-2 rounded-xl border border-slate-800/60">
                        <span className="text-[10px] text-slate-400 block">Target Profit</span>
                        <span className="font-bold text-emerald-400">+{formatINR(slot.profitAmount)}</span>
                      </div>
                    </div>

                    {/* Countdown / Status Box */}
                    {!isSettled ? (
                      <div className="p-3 rounded-2xl bg-[#07090e] border border-cyan-500/30 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Cycle Countdown</span>
                          </span>
                          <span className="font-black text-cyan-400 font-mono text-sm">
                            {isExpired ? 'Ready to Settle' : `${remainingMinutes}m ${remainingSeconds}s`}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-1000"
                            style={{
                              width: `${Math.min(100, Math.max(0, 100 - (remainingMs / (slot.durationHours * 3600 * 1000)) * 100))}%`
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className={`p-3 rounded-2xl border text-xs font-mono space-y-1 ${
                        isWin ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Outcome Result</span>
                          <span className={`font-black ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isWin ? `+${formatINR(slot.profitAmount)} Won` : `-${formatINR(slot.lossAmount)} Loss`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Settled At</span>
                          <span>{slot.settledAt ? new Date(slot.settledAt).toLocaleTimeString() : 'Completed'}</span>
                        </div>
                      </div>
                    )}

                    {/* Action button */}
                    {!isSettled ? (
                      <button
                        type="button"
                        onClick={() => handleCheckSlotOutcome(slot)}
                        className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Check / Settle Slot Result</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (isWin) {
                            setResolutionModal({
                              isOpen: true,
                              type: 'WIN',
                              slot,
                              payout: slot.payoutAmount || slot.totalInvested + slot.profitAmount,
                              profit: slot.profitAmount
                            });
                          } else {
                            setResolutionModal({
                              isOpen: true,
                              type: 'LOSS',
                              slot,
                              payout: 0,
                              profit: 0
                            });
                          }
                        }}
                        className="w-full py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors"
                      >
                        View Result Details
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* SECTION 5: LIVE COMMUNITY EV ENERGY INVESTOR & PAYOUT LEDGER (125+ ENTRIES) */}
        {/* ======================================================== */}
        <div className="bg-[#0b0e16] border border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Public Proof Ledger</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  125+ Active Records
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Live Community EV Investors & Bank Withdrawal Ledger</span>
                <Landmark className="w-5 h-5 text-emerald-400" />
              </h2>
              <p className="text-xs text-slate-400 max-w-2xl">
                Real-time verified ledger showing every investor’s deposit tier, exact 3x net profit payout, destination bank, instant withdrawal status, and settlement time.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className="flex items-center gap-2 bg-[#06080e] p-2.5 rounded-2xl border border-slate-800 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-semibold">Instant Bank IMPS:</span>
              <span className="text-emerald-400 font-bold font-mono">98.4% Success Rate</span>
            </div>
          </div>

          {/* Key KPI Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#080b12] p-4 rounded-2xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3 text-cyan-400" /> Total Verified Investors
              </span>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                {communityStats.totalInvestors}
              </div>
              <span className="text-[10px] text-slate-500">Across 28 Indian States</span>
            </div>

            <div className="bg-[#080b12] p-4 rounded-2xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ArrowDownLeft className="w-3 h-3 text-emerald-400" /> Total Capital Invested
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                {formatINR(communityStats.totalInvested, false)}
              </div>
              <span className="text-[10px] text-slate-500">In 1-2h Power Quotas</span>
            </div>

            <div className="bg-[#080b12] p-4 rounded-2xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-amber-400" /> Total Profit Paid Out
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                {formatINR(communityStats.totalProfitPaid, false)}
              </div>
              <span className="text-[10px] text-amber-400/80 font-bold">Exact 3x Profit Ratio</span>
            </div>

            <div className="bg-[#080b12] p-4 rounded-2xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-sky-400" /> Bank Settlement Rate
              </span>
              <div className="text-xl sm:text-2xl font-black text-sky-400 font-mono">
                {communityStats.successRate}%
              </div>
              <span className="text-[10px] text-slate-500">RBI/NPCI IMPS Validated</span>
            </div>
          </div>

          {/* Search Bar & Filter Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              <span className="text-[11px] text-slate-500 font-bold uppercase mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {[
                { id: 'ALL', label: `All (${COMMUNITY_INVESTOR_TRANSACTIONS.length})` },
                { id: 'SUCCESS', label: 'Withdrawal Success' },
                { id: 'PROCESSING', label: 'Processing' },
                { id: 'FAILED', label: 'Failed / Loss' },
                { id: 'HIGH_PROFIT', label: 'High Profit (≥₹30K)' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => {
                    setCommFilter(btn.id as any);
                    setCommPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    commFilter === btn.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-[#0f1422] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={commSearch}
                onChange={(e) => {
                  setCommSearch(e.target.value);
                  setCommPage(1);
                }}
                placeholder="Search investor, bank, or price..."
                className="w-full bg-[#080b12] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-[#070a10]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#0e1422] border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Investor Name</th>
                    <th className="py-3 px-3">Invest Price</th>
                    <th className="py-3 px-3">Profit / Loss</th>
                    <th className="py-3 px-3">Gross Return</th>
                    <th className="py-3 px-3">Bank Name</th>
                    <th className="py-3 px-3">Withdrawal Status</th>
                    <th className="py-3 px-4">Withdrawal Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {paginatedCommunity.length > 0 ? (
                    paginatedCommunity.map((entry) => {
                      const isProfit = entry.profitOrLoss.type === 'PROFIT';
                      const isSuccess = entry.withdrawalStatus === 'SUCCESS';
                      const isProcessing = entry.withdrawalStatus === 'PROCESSING';

                      return (
                        <tr
                          key={entry.id}
                          className="hover:bg-slate-800/30 transition-colors"
                        >
                          {/* Investor Name */}
                          <td className="py-3 px-4">
                            <div className="font-sans font-bold text-white text-xs flex items-center gap-1.5">
                              <span>{entry.investorName}</span>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Ref: {entry.referenceId}
                            </div>
                          </td>

                          {/* Invest Price */}
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-200">
                              {formatINR(entry.investPrice, false)}
                            </span>
                            <div className="text-[9px] text-slate-500 font-sans">
                              EV Stock Tier
                            </div>
                          </td>

                          {/* Profit or Loss */}
                          <td className="py-3 px-3">
                            {isProfit ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs">
                                +{formatINR(entry.profitOrLoss.amount, false)}
                                <span className="text-[9px] font-sans font-normal opacity-80">(3x)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 font-black text-xs">
                                -{formatINR(entry.profitOrLoss.amount, false)}
                              </span>
                            )}
                          </td>

                          {/* Gross Return */}
                          <td className="py-3 px-3">
                            <span className="font-bold text-cyan-400">
                              {entry.amount > 0 ? formatINR(entry.amount, false) : '₹0'}
                            </span>
                          </td>

                          {/* Bank Name */}
                          <td className="py-3 px-3">
                            <div className="font-sans font-semibold text-slate-300 flex items-center gap-1.5">
                              <Landmark className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[140px]">{entry.bankName}</span>
                            </div>
                          </td>

                          {/* Withdrawal Status */}
                          <td className="py-3 px-3">
                            {isSuccess && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-sans">
                                <CheckCircle2 className="w-3 h-3" /> Success
                              </span>
                            )}
                            {isProcessing && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-sans">
                                <Clock className="w-3 h-3 animate-spin" /> Processing
                              </span>
                            )}
                            {!isSuccess && !isProcessing && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-sans">
                                <AlertTriangle className="w-3 h-3" /> Failed
                              </span>
                            )}
                          </td>

                          {/* Time to Withdraw */}
                          <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap font-sans">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{entry.timeToWithdraw}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                        No investor records match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalCommPages > 1 && (
              <div className="p-3 bg-[#0a0e18] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Showing {(commPage - 1) * commPageSize + 1} to{' '}
                  {Math.min(commPage * commPageSize, filteredCommunity.length)} of{' '}
                  {filteredCommunity.length} investor entries
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCommPage(Math.max(1, commPage - 1))}
                    disabled={commPage === 1}
                    className="px-3 py-1 rounded-lg bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-white font-bold transition-colors"
                  >
                    Previous
                  </button>
                  <span className="font-mono font-bold text-white px-2">
                    {commPage} / {totalCommPages}
                  </span>
                  <button
                    onClick={() => setCommPage(Math.min(totalCommPages, commPage + 1))}
                    disabled={commPage === totalCommPages}
                    className="px-3 py-1 rounded-lg bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-white font-bold transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: SLOT BOOKING ANIMATION MODAL                     */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showBookingAnimation && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0e1320] border border-emerald-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 text-center shadow-2xl relative overflow-hidden"
            >
              {/* Lightning aura */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Animated Icon */}
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/40"
                />
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/30"
                >
                  <BatteryCharging className="w-10 h-10" />
                </motion.div>
              </div>

              {/* Steps Progress */}
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">
                  {bookingStep === 1 && 'Connecting to Energy Grid...'}
                  {bookingStep === 2 && 'Allocating Power Node Quota...'}
                  {bookingStep === 3 && '⚡ EV Energy Slot Activated!'}
                </h3>
                <p className="text-xs text-slate-400">
                  {bookingStep === 1 && 'Verifying simulated exchange connectivity & authorization...'}
                  {bookingStep === 2 && `Reserving ₹${selectedPrice.toLocaleString()} tier contract for ${selectedDuration} hour cycle...`}
                  {bookingStep === 3 && 'Contract is live! Settlements will resolve in 1-2 hours.'}
                </p>
              </div>

              {/* Step indicator bar */}
              <div className="flex gap-2 justify-center">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      bookingStep >= step
                        ? 'w-10 bg-emerald-500 shadow-sm shadow-emerald-500/50'
                        : 'w-4 bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              {/* Done button */}
              {bookingStep === 3 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  type="button"
                  onClick={() => setShowBookingAnimation(false)}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-colors shadow-lg shadow-emerald-500/25"
                >
                  View My Booked Slot
                </motion.button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 2: PROFIT (CONGRATULATIONS) OR LOSS RESOLUTION      */}
      {/* ======================================================== */}
      <AnimatePresence>
        {resolutionModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className={`rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 text-center shadow-2xl relative overflow-hidden ${
                resolutionModal.type === 'WIN'
                  ? 'bg-gradient-to-b from-[#0c2217] via-[#0b1b13] to-[#07090e] border-2 border-emerald-500 shadow-emerald-500/20'
                  : 'bg-gradient-to-b from-[#220c0c] via-[#1b0b0b] to-[#07090e] border-2 border-rose-500/70 shadow-rose-500/20'
              }`}
            >
              {/* Confetti Burst on Win */}
              {resolutionModal.type === 'WIN' && <ConfettiBurst />}

              {/* Close button */}
              <button
                onClick={() => setResolutionModal({ ...resolutionModal, isOpen: false })}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/60 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon Animation */}
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                {resolutionModal.type === 'WIN' ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-xl shadow-emerald-500/40"
                  >
                    <Trophy className="w-10 h-10" />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ scale: [1, 0.95, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-rose-300 shadow-xl shadow-rose-500/30"
                  >
                    <AlertTriangle className="w-10 h-10" />
                  </motion.div>
                )}
              </div>

              {/* Result Title */}
              <div className="space-y-2">
                {resolutionModal.type === 'WIN' ? (
                  <>
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 inline-flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>🎉 CONGRATULATIONS! 🎉</span>
                    </span>
                    <h3 className="text-2xl font-black text-white">Your EV Energy Slot Won!</h3>
                    <p className="text-xs text-slate-300 max-w-sm mx-auto">
                      The short-cycle clean energy contract hit the designated target in profit territory. Payout has been credited to your virtual wallet!
                    </p>
                  </>
                ) : (
                  <>
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 inline-flex items-center gap-1.5">
                      <span>😔 SORRY! TRY AGAIN YOUR LUCK</span>
                    </span>
                    <h3 className="text-2xl font-black text-white">Better Luck Next Time!</h3>
                    <p className="text-xs text-slate-300 max-w-sm mx-auto">
                      This short-cycle node closed out of profit range. New short-cycle power grid slots are ready for booking right now!
                    </p>
                  </>
                )}
              </div>

              {/* Metric Box */}
              <div className={`p-4 rounded-2xl border font-mono ${
                resolutionModal.type === 'WIN'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-white'
                  : 'bg-rose-950/40 border-rose-500/30 text-white'
              }`}>
                {resolutionModal.type === 'WIN' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Invested Amount</span>
                      <span className="font-bold">{formatINR(resolutionModal.slot?.totalInvested || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                      <span>Net Simulated Profit</span>
                      <span>+{formatINR(resolutionModal.profit)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-black border-t border-emerald-500/30 pt-2 text-cyan-300">
                      <span>Total Payout Credited</span>
                      <span>{formatINR(resolutionModal.payout)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Invested Tier</span>
                      <span className="font-bold">{formatINR(resolutionModal.slot?.totalInvested || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-rose-400 font-bold">
                      <span>Result</span>
                      <span>Loss (-{formatINR(resolutionModal.slot?.lossAmount || 0)})</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {resolutionModal.type === 'WIN' ? (
                  <button
                    type="button"
                    onClick={() => setResolutionModal({ ...resolutionModal, isOpen: false })}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-colors shadow-lg shadow-emerald-500/30"
                  >
                    Collect Winnings & Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setResolutionModal({ ...resolutionModal, isOpen: false });
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm transition-colors shadow-lg shadow-amber-500/25"
                  >
                    ⚡ Try Again - Book Next EV Slot
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
