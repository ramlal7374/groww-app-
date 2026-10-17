import React, { useState, useEffect, useMemo } from 'react';
import { useTrade } from '../context/TradeContext';
import { api, formatINR } from '../services/api';
import { AdminUserHolding, AdminUserDetails, StockBias, EvEnergySlot, EvEnergyConfig } from '../types';
import {
  ShieldAlert,
  Sliders,
  Users,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Zap,
  LogOut,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  Target,
  Activity,
  Search,
  Filter,
  Edit3,
  Trash2,
  Plus,
  History,
  CreditCard,
  Key,
  Receipt,
  ChevronRight,
  Wallet,
  ExternalLink,
  FileText,
  Layers,
  Eye,
  BarChart2,
  X,
  PlusCircle,
  Check,
  Clock,
  BatteryCharging
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { navigateTo, refreshData, stocks, isAdmin, setAdminToken } = useTrade();
  const [stats, setStats] = useState<any>(null);
  const [userList, setUserList] = useState<AdminUserDetails[]>([]);
  const [holdingsList, setHoldingsList] = useState<AdminUserHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState<'POSITIONS' | 'STOCKS' | 'ENGINE' | 'USERS' | 'EV_ENERGY'>('POSITIONS');

  // EV Energy Stock Control State
  const [adminEvSlots, setAdminEvSlots] = useState<EvEnergySlot[]>([]);
  const [adminEvConfig, setAdminEvConfig] = useState<EvEnergyConfig | null>(null);
  const [adminEvSearch, setAdminEvSearch] = useState<string>('');
  const [adminEvStatusFilter, setAdminEvStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SETTLED'>('ALL');
  const [editingEvSlot, setEditingEvSlot] = useState<EvEnergySlot | null>(null);
  const [editSlotProfit, setEditSlotProfit] = useState<string>('0');
  const [editSlotLoss, setEditSlotLoss] = useState<string>('0');
  const [editSlotOutcome, setEditSlotOutcome] = useState<'FORCE_WIN' | 'FORCE_LOSS' | 'PENDING'>('FORCE_WIN');
  const [isUpdatingEvSlot, setIsUpdatingEvSlot] = useState(false);

  // Search filter for positions
  const [positionSearch, setPositionSearch] = useState('');

  // Simulator control state
  const [volatility, setVolatility] = useState<number>(1.0);
  const [marketOpen, setMarketOpen] = useState<boolean>(true);
  const [trend, setTrend] = useState<'BULLISH' | 'BEARISH' | 'NEUTRAL'>('NEUTRAL');

  // Global Stock price injector
  const [targetStock, setTargetStock] = useState<string>('RELIANCE');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [lockOnSet, setLockOnSet] = useState<boolean>(true);

  // Position custom manipulator modal state
  const [activeModalHolding, setActiveModalHolding] = useState<AdminUserHolding | null>(null);
  const [customTargetType, setCustomTargetType] = useState<'PERCENT' | 'RUPEES' | 'PRICE'>('PERCENT');
  const [customTargetValue, setCustomTargetValue] = useState<string>('20');
  const [isApplyingCustom, setIsApplyingCustom] = useState(false);

  // User Management & Simulation Data Editing State
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<AdminUserDetails | null>(null);
  const [userDetailSubTab, setUserDetailSubTab] = useState<'PORTFOLIO' | 'BALANCE_PNL' | 'TRANSACTIONS'>('PORTFOLIO');
  const [txFilter, setTxFilter] = useState<'ALL' | 'ORDERS' | 'TRANSFERS' | 'SIMULATED'>('ALL');

  // Edit Holding Modal State
  const [editingHolding, setEditingHolding] = useState<{ userId: string; symbol: string; quantity: number; averageBuyPrice: number } | null>(null);
  const [editHoldingQty, setEditHoldingQty] = useState<string>('0');
  const [editHoldingPrice, setEditHoldingPrice] = useState<string>('0');

  // Add Holding Modal State
  const [isAddingHolding, setIsAddingHolding] = useState(false);
  const [newHoldingUserId, setNewHoldingUserId] = useState<string>('');
  const [newHoldingSymbol, setNewHoldingSymbol] = useState<string>('');
  const [newHoldingQty, setNewHoldingQty] = useState<string>('10');
  const [newHoldingBuyPrice, setNewHoldingBuyPrice] = useState<string>('1000');

  // Inject P&L Modal State
  const [injectingUser, setInjectingUser] = useState<AdminUserDetails | null>(null);
  const [injectPnLAmount, setInjectPnLAmount] = useState<string>('50000');
  const [injectPnLType, setInjectPnLType] = useState<'PROFIT' | 'LOSS'>('PROFIT');
  const [injectPnLReason, setInjectPnLReason] = useState<string>('');

  // Edit Balance Modal State
  const [editingBalanceUser, setEditingBalanceUser] = useState<AdminUserDetails | null>(null);
  const [customBalanceInput, setCustomBalanceInput] = useState<string>('500000');

  // Security & Password Management Modal State
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [currentAdminPassword, setCurrentAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);

  const token = localStorage.getItem('tradex_admin_token');

  const showStatus = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => {
      setStatusMsg((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  const loadAdminData = async (silent: boolean = false) => {
    if (!token && !isAdmin) {
      navigateTo('dashboard');
      return;
    }
    if (!silent) setLoading(true);
    try {
      const [sData, uData, hData, evData] = await Promise.all([
        api.adminGetStats(),
        api.adminGetUsers(),
        api.adminGetHoldings(),
        api.adminGetEvEnergySlots()
      ]);
      setStats(sData.stats);
      setUserList(uData.users || []);
      setHoldingsList(hData.holdings || []);
      setAdminEvSlots(evData.slots || []);
      setAdminEvConfig(evData.config || null);
      if (sData.stats?.volatility) setVolatility(sData.stats.volatility);
      if (sData.stats?.marketStatus) setMarketOpen(sData.stats.marketStatus === 'OPEN');

      // Keep open user detail modal synced
      if (selectedUserForDetails) {
        const freshUser = (uData.users || []).find((u: AdminUserDetails) => u.id === selectedUserForDetails.id);
        if (freshUser) {
          setSelectedUserForDetails(freshUser);
        }
      }
    } catch (err: any) {
      console.error(err);
      if (!silent) {
        setAdminToken(null);
        navigateTo('dashboard');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    // Auto refresh positions every 3.5 seconds to observe simulated live movement
    const interval = setInterval(() => {
      loadAdminData(true);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Filtered user holdings list
  const filteredHoldings = useMemo(() => {
    if (!positionSearch.trim()) return holdingsList;
    const q = positionSearch.toLowerCase();
    return holdingsList.filter(
      (h) =>
        h.symbol.toLowerCase().includes(q) ||
        h.stockName.toLowerCase().includes(q) ||
        h.userName.toLowerCase().includes(q) ||
        h.userEmail.toLowerCase().includes(q)
    );
  }, [holdingsList, positionSearch]);

  // Selected stock object in the Global Command Center
  const selectedStockObj = useMemo(() => {
    return stocks.find((s) => s.symbol === targetStock) || stocks[0];
  }, [stocks, targetStock]);

  // 1. One-click Profit Target for user holding
  const handleSetProfitPercent = async (holding: AdminUserHolding, targetPercent: number) => {
    try {
      const res = await api.adminManipulateHoldingPnL({
        userId: holding.userId,
        symbol: holding.symbol,
        mode: 'TARGET_PNL_PERCENT',
        targetPercent: Math.abs(targetPercent)
      });
      showStatus(
        `🚀 Profit Target +${targetPercent}% applied for ${holding.userName}'s ${holding.symbol} position! (Price: ${formatINR(res.calculatedPrice || 0)})`,
        'success'
      );
      await refreshData();
      loadAdminData(true);
    } catch (err: any) {
      showStatus(err.message || 'Failed to apply profit target', 'error');
    }
  };

  // 2. One-click Loss Target for user holding
  const handleSetLossPercent = async (holding: AdminUserHolding, targetLossPercent: number) => {
    try {
      const res = await api.adminManipulateHoldingPnL({
        userId: holding.userId,
        symbol: holding.symbol,
        mode: 'TARGET_PNL_PERCENT',
        targetPercent: -Math.abs(targetLossPercent)
      });
      showStatus(
        `📉 Loss Target -${targetLossPercent}% applied for ${holding.userName}'s ${holding.symbol} position! (Price: ${formatINR(res.calculatedPrice || 0)})`,
        'info'
      );
      await refreshData();
      loadAdminData(true);
    } catch (err: any) {
      showStatus(err.message || 'Failed to apply loss target', 'error');
    }
  };

  // 3. Set Continuous Drift / Bias (Bull Pump vs Bear Dump)
  const handleSetHoldingBias = async (symbol: string, bias: StockBias, speed: number = 0.012) => {
    try {
      await api.adminManipulateHoldingPnL({
        symbol,
        mode: 'SET_BIAS',
        targetBias: bias,
        biasSpeed: speed
      });
      const biasLabel =
        bias === 'PUMP'
          ? 'Continuous Bull Pump (+1.2%/tick)'
          : bias === 'DUMP'
          ? 'Continuous Bear Crash (-1.2%/tick)'
          : bias === 'UPPER_CIRCUIT'
          ? 'Upper Circuit Locked (+20%)'
          : bias === 'LOWER_CIRCUIT'
          ? 'Lower Circuit Locked (-20%)'
          : 'Neutral';
      showStatus(`⚡ Set ${symbol} trend to: ${biasLabel}`, 'success');
      await refreshData();
      loadAdminData(true);
    } catch (err: any) {
      showStatus(err.message || 'Failed to set movement bias', 'error');
    }
  };

  // 4. Freeze or Reset Stock to Live Market
  const handleResetStock = async (symbol: string) => {
    try {
      await api.adminResetStock(symbol);
      showStatus(`🔄 ${symbol} unlocked and re-synced with real market quotes!`, 'info');
      await refreshData();
      loadAdminData(true);
    } catch (err: any) {
      showStatus(err.message || 'Failed to reset stock', 'error');
    }
  };

  // 5. Freeze exact price
  const handleFreezeExactPrice = async (symbol: string, price: number) => {
    try {
      await api.adminManipulateHoldingPnL({
        symbol,
        mode: 'EXACT_PRICE',
        exactPrice: price,
        lockPrice: true,
        targetBias: 'NONE'
      });
      showStatus(`❄️ ${symbol} price frozen at ${formatINR(price)}!`, 'info');
      await refreshData();
      loadAdminData(true);
    } catch (err: any) {
      showStatus(err.message || 'Failed to freeze price', 'error');
    }
  };

  // 6. Submit custom target modal
  const handleApplyCustomModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalHolding) return;
    const val = parseFloat(customTargetValue);
    if (isNaN(val)) {
      showStatus('Please enter a valid numeric value', 'error');
      return;
    }

    setIsApplyingCustom(true);
    try {
      if (customTargetType === 'PERCENT') {
        await api.adminManipulateHoldingPnL({
          userId: activeModalHolding.userId,
          symbol: activeModalHolding.symbol,
          mode: 'TARGET_PNL_PERCENT',
          targetPercent: val
        });
        showStatus(
          `Target ${val >= 0 ? '+' : ''}${val}% P&L applied to ${activeModalHolding.userName}'s ${activeModalHolding.symbol}!`,
          'success'
        );
      } else if (customTargetType === 'RUPEES') {
        await api.adminManipulateHoldingPnL({
          userId: activeModalHolding.userId,
          symbol: activeModalHolding.symbol,
          mode: 'TARGET_PNL_AMOUNT',
          targetAmount: val
        });
        showStatus(
          `Target ${val >= 0 ? '+' : ''}${formatINR(val)} P&L applied to ${activeModalHolding.userName}'s ${activeModalHolding.symbol}!`,
          'success'
        );
      } else {
        await api.adminManipulateHoldingPnL({
          userId: activeModalHolding.userId,
          symbol: activeModalHolding.symbol,
          mode: 'EXACT_PRICE',
          exactPrice: Math.max(1, val),
          lockPrice: true
        });
        showStatus(
          `Set ${activeModalHolding.symbol} price directly to ${formatINR(val)}!`,
          'success'
        );
      }
      setActiveModalHolding(null);
      await refreshData();
      loadAdminData(true);
    } catch (err: any) {
      showStatus(err.message || 'Failed to apply custom target', 'error');
    } finally {
      setIsApplyingCustom(false);
    }
  };

  // Global Stock Price Injector form
  const handleStockOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !customPrice) return;
    const priceNum = parseFloat(customPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    try {
      await api.adminManipulateHoldingPnL({
        symbol: targetStock,
        mode: 'EXACT_PRICE',
        exactPrice: priceNum,
        lockPrice: lockOnSet
      });
      showStatus(
        `Overrode ${targetStock} simulated price to ${formatINR(priceNum)} (${lockOnSet ? 'Locked' : 'Unlocked'})!`,
        'success'
      );
      setCustomPrice('');
      await refreshData();
      loadAdminData(true);
    } catch (err: any) {
      showStatus(err.message || 'Failed to override stock price', 'error');
    }
  };

  // Update simulator settings
  const handleUpdateConfig = async () => {
    if (!token) return;
    try {
      await api.adminUpdateSettings({
        volatilityMultiplier: volatility,
        marketStatus: marketOpen ? 'OPEN' : 'CLOSED',
        marketTrend: trend
      });
      showStatus('Simulator market parameters updated successfully!', 'success');
      loadAdminData(true);
    } catch (err: any) {
      showStatus(err.message || 'Failed to update market settings', 'error');
    }
  };

  const handleTriggerTick = async () => {
    if (!token) return;
    try {
      await api.adminTriggerTick();
      showStatus('Manual simulation tick executed! All prices updated & orders evaluated.', 'success');
      await refreshData();
      loadAdminData(true);
    } catch (err: any) {
      showStatus(err.message || 'Failed to trigger tick', 'error');
    }
  };

  const handleAdjustBalance = async (userId: string, added: number) => {
    if (!token) return;
    try {
      const user = userList.find((u) => u.id === userId);
      const current = user?.simulatedWallet?.balance ?? 0;
      await api.adminSetUserBalance(userId, current + added);
      showStatus(`Added ${formatINR(added)} to ${user?.name || 'user'}!`, 'success');
      await refreshData();
      loadAdminData(true);
    } catch (err: any) {
      showStatus(err.message || 'Failed to adjust balance', 'error');
    }
  };

  const handleSaveCustomBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBalanceUser) return;
    const bal = parseFloat(customBalanceInput);
    if (isNaN(bal) || bal < 0) {
      showStatus('Please enter a valid balance', 'error');
      return;
    }
    try {
      await api.adminSetUserBalance(editingBalanceUser.id, bal);
      showStatus(`Simulated cash balance for ${editingBalanceUser.name} updated to ${formatINR(bal)}`, 'success');
      setEditingBalanceUser(null);
      await refreshData();
      loadAdminData(true);
    } catch (err: any) {
      showStatus(err.message || 'Failed to update balance', 'error');
    }
  };

  const handleSaveHoldingEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHolding) return;
    const qty = parseInt(editHoldingQty, 10);
    const price = parseFloat(editHoldingPrice);
    if (isNaN(qty) || qty < 0 || isNaN(price) || price < 0) {
      showStatus('Please enter valid positive quantity and price', 'error');
      return;
    }
    try {
      const res = await api.adminEditUserHolding(editingHolding.userId, {
        symbol: editingHolding.symbol,
        quantity: qty,
        averageBuyPrice: price
      });
      showStatus(res.message, 'success');
      setEditingHolding(null);
      await refreshData();
      loadAdminData(true);
    } catch (err: any) {
      showStatus(err.message || 'Failed to edit simulated holding', 'error');
    }
  };

  const handleDeleteHolding = async (userId: string, symbol: string) => {
    if (!confirm(`Are you sure you want to remove simulated holding ${symbol} from this user?`)) return;
    try {
      const res = await api.adminDeleteUserHolding(userId, symbol);
      showStatus(res.message, 'success');
      await refreshData();
      loadAdminData(true);
    } catch (err: any) {
      showStatus(err.message || 'Failed to delete simulated holding', 'error');
    }
  };

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHoldingUserId || !newHoldingSymbol) {
      showStatus('Stock symbol is required', 'error');
      return;
    }
    const qty = parseInt(newHoldingQty, 10);
    const price = parseFloat(newHoldingBuyPrice);
    if (isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
      showStatus('Please enter valid positive quantity and price', 'error');
      return;
    }
    try {
      const res = await api.adminEditUserHolding(newHoldingUserId, {
        symbol: newHoldingSymbol,
        quantity: qty,
        averageBuyPrice: price
      });
      showStatus(`Simulated holding ${newHoldingSymbol} added successfully!`, 'success');
      setIsAddingHolding(false);
      await refreshData();
      loadAdminData(true);
    } catch (err: any) {
      showStatus(err.message || 'Failed to add simulated holding', 'error');
    }
  };

  const handleInjectPnL = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!injectingUser) return;
    const amt = parseFloat(injectPnLAmount);
    if (isNaN(amt) || amt <= 0) {
      showStatus('Please enter a valid positive amount', 'error');
      return;
    }
    try {
      const res = await api.adminInjectUserPnL(injectingUser.id, {
        amount: amt,
        type: injectPnLType,
        reason: injectPnLReason || undefined
      });
      showStatus(res.message, 'success');
      setInjectingUser(null);
      setInjectPnLAmount('50000');
      setInjectPnLReason('');
      await refreshData();
      loadAdminData(true);
    } catch (err: any) {
      showStatus(err.message || 'Failed to inject simulated P&L', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdminPassword || !newAdminPassword) {
      showStatus('Please enter current and new passwords', 'error');
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      showStatus('New passwords do not match', 'error');
      return;
    }
    if (newAdminPassword.length < 6) {
      showStatus('New password must be at least 6 characters', 'error');
      return;
    }
    setPasswordChangeLoading(true);
    try {
      const res = await api.adminChangePassword({
        currentPassword: currentAdminPassword,
        newPassword: newAdminPassword
      });
      showStatus(res.message || 'Admin password updated securely!', 'success');
      setIsSecurityModalOpen(false);
      setCurrentAdminPassword('');
      setNewAdminPassword('');
      setConfirmAdminPassword('');
    } catch (err: any) {
      showStatus(err.message || 'Failed to update password', 'error');
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  // EV Energy Slot Admin Actions
  const handleSetSlotOutcome = async (
    slotId: string,
    adminOutcome: 'FORCE_WIN' | 'FORCE_LOSS' | 'PENDING'
  ) => {
    try {
      await api.adminSetEvEnergySlotOutcome(slotId, { adminOutcome });
      showStatus(`Slot #${slotId} outcome designated as: ${adminOutcome}`, 'success');
      setAdminEvSlots((prev) =>
        prev.map((s) => (s.id === slotId ? { ...s, adminOutcome } : s))
      );
    } catch (err: any) {
      showStatus(err.message || 'Failed to update slot outcome', 'error');
    }
  };

  const handleForceSettleSlot = async (
    slotId: string,
    forceOutcome: 'FORCE_WIN' | 'FORCE_LOSS'
  ) => {
    try {
      await api.adminForceSettleEvEnergySlot(slotId, forceOutcome);
      showStatus(
        `Slot #${slotId} resolved immediately as ${forceOutcome === 'FORCE_WIN' ? 'WIN (+Profit Credited)' : 'LOSS'}!`,
        'success'
      );
      loadAdminData(true);
    } catch (err: any) {
      showStatus(err.message || 'Failed to settle slot', 'error');
    }
  };

  const handleSaveEditEvSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvSlot) return;
    setIsUpdatingEvSlot(true);
    try {
      const profit = parseFloat(editSlotProfit) || 0;
      const loss = parseFloat(editSlotLoss) || 0;
      await api.adminSetEvEnergySlotOutcome(editingEvSlot.id, {
        adminOutcome: editSlotOutcome,
        profitAmount: profit,
        lossAmount: loss
      });
      showStatus(`EV Energy Slot #${editingEvSlot.id} values saved successfully!`, 'success');
      setEditingEvSlot(null);
      loadAdminData(true);
    } catch (err: any) {
      showStatus(err.message || 'Failed to save slot changes', 'error');
    } finally {
      setIsUpdatingEvSlot(false);
    }
  };

  const handleUpdateEvConfig = async (newCfg: Partial<EvEnergyConfig>) => {
    try {
      const res = await api.adminUpdateEvEnergyConfig(newCfg);
      setAdminEvConfig(res.config);
      showStatus('EV Energy Stock global configuration updated!', 'success');
    } catch (err: any) {
      showStatus(err.message || 'Failed to update configuration', 'error');
    }
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    navigateTo('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-20 md:pb-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111622] p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight">Admin Price & Market Control Console</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Control simulated price movements, trigger target profit/loss on user positions, & tune volatility
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSecurityModalOpen(true)}
            title="Secure Admin Password & Authentication Settings"
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin Password</span>
          </button>
          <button
            onClick={() => loadAdminData(false)}
            title="Refresh All Simulator Data"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigateTo('dashboard')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            ← Back to App
          </button>
          <button
            onClick={handleAdminLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-500/15 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all border border-rose-500/30 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Floating Status Notification */}
      {statusMsg && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-lg transition-all animate-fadeIn ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : statusMsg.type === 'error'
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : statusMsg.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <Sparkles className="w-4 h-4 shrink-0 text-cyan-400" />
            )}
            <span className="font-semibold">{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-slate-400 hover:text-white text-[11px] font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" /> Registered Traders
          </span>
          <div className="text-2xl font-black text-white mt-1">{stats?.totalUsers || 0}</div>
        </div>
        <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400" /> Active Bought Positions
          </span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{holdingsList.length}</div>
        </div>
        <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" /> Total Orders Placed
          </span>
          <div className="text-2xl font-black text-amber-400 mt-1">{stats?.totalOrders || 0}</div>
        </div>
        <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-cyan-400" /> Traded Volume
          </span>
          <div className="text-xl font-black text-cyan-300 mt-1">
            {formatINR(stats?.totalTradingVolume || 0, false)}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('POSITIONS')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'POSITIONS'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>User Bought Positions & P&L Manipulator ({holdingsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('STOCKS')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'STOCKS'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Stock Price Command Center ({stocks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ENGINE')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'ENGINE'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Market Engine & Volatility</span>
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'USERS'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Traders, Simulated Investment & P&L ({userList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('EV_ENERGY')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'EV_ENERGY'
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>⚡ EV Energy Stock Control Room ({adminEvSlots.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: USER BOUGHT POSITIONS & P&L MANIPULATOR (PRIMARY) */}
      {/* ======================================================== */}
      {activeTab === 'POSITIONS' && (
        <div className="space-y-4">
          <div className="bg-[#111622] rounded-3xl border border-slate-800 p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <span>Live User Holdings — Target Profit & Loss Controller</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Jab koi user stock buy kare, toh yahan uski holding show hoti hai. Aap 1-click me jitna chahe utna profit (+10%, +50%, +100%) ya loss (-20%, -50%) karwa sakte hain, ya continuous upward/downward drift chalu kar sakte hain.
                </p>
              </div>

              {/* Search filter */}
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user, email, stock..."
                  value={positionSearch}
                  onChange={(e) => setPositionSearch(e.target.value)}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {filteredHoldings.length === 0 ? (
            <div className="bg-[#111622] rounded-3xl border border-slate-800 p-12 text-center">
              <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Active Bought Positions Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Currently, no users hold open stock positions. When a user buys a stock (e.g. RELIANCE, TCS, INFY), it will instantly appear here with full P&L manipulation controls.
              </p>
              <button
                onClick={() => navigateTo('market')}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Go to Market & Buy a Stock
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHoldings.map((h) => {
                const isProfitable = h.unrealizedPnL >= 0;
                const hasBias = h.targetBias && h.targetBias !== 'NONE';

                return (
                  <div
                    key={`${h.userId}_${h.symbol}_${h.holdingId}`}
                    className={`bg-[#111622] rounded-3xl border p-5 transition-all shadow-md ${
                      h.priceOverrideLocked
                        ? 'border-amber-500/40 bg-gradient-to-r from-[#111622] to-[#1a1811]'
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Top Row: User & Stock Info */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-emerald-400 text-sm shrink-0">
                          {h.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-white text-base">{h.symbol}</span>
                            <span className="text-xs text-slate-400 font-medium">({h.stockName})</span>
                            {h.priceOverrideLocked && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" /> Locked
                              </span>
                            )}
                            {hasBias && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                                  h.targetBias === 'PUMP'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                                    : h.targetBias === 'DUMP'
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                                }`}
                              >
                                {h.targetBias === 'PUMP'
                                  ? '🚀 Continuous Bull Pump'
                                  : h.targetBias === 'DUMP'
                                  ? '📉 Continuous Bear Crash'
                                  : h.targetBias}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Trader: <span className="text-slate-200 font-semibold">{h.userName}</span> ({h.userEmail})
                          </div>
                        </div>
                      </div>

                      {/* Position Financials Banner */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0b0e14] p-3 rounded-2xl border border-slate-800/80 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">Quantity</span>
                          <span className="font-extrabold text-white">{h.quantity} shares</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">Avg Buy Price</span>
                          <span className="font-extrabold text-slate-300">{formatINR(h.averageBuyPrice)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">Current Market Price</span>
                          <span className="font-extrabold text-white">{formatINR(h.currentPrice)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">Unrealized P&L</span>
                          <span
                            className={`font-black flex items-center gap-1 ${
                              isProfitable ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isProfitable ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                            {isProfitable ? '+' : ''}
                            {formatINR(h.unrealizedPnL)} ({h.unrealizedPnLPercent >= 0 ? '+' : ''}
                            {h.unrealizedPnLPercent.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Controls for this position */}
                    <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* One Click Profit Targets */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> Make Immediate Profit:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => handleSetProfitPercent(h, 5)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 text-emerald-400 font-bold text-xs transition-colors"
                          >
                            +5%
                          </button>
                          <button
                            onClick={() => handleSetProfitPercent(h, 10)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 text-emerald-400 font-bold text-xs transition-colors"
                          >
                            +10%
                          </button>
                          <button
                            onClick={() => handleSetProfitPercent(h, 25)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-colors"
                          >
                            +25%
                          </button>
                          <button
                            onClick={() => handleSetProfitPercent(h, 50)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/25 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/50 text-emerald-300 font-bold text-xs transition-colors"
                          >
                            +50%
                          </button>
                          <button
                            onClick={() => handleSetProfitPercent(h, 100)}
                            className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-colors shadow-sm"
                          >
                            +100% (2x Rally)
                          </button>
                        </div>
                      </div>

                      {/* One Click Loss Targets */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" /> Make Immediate Loss:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => handleSetLossPercent(h, 5)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/30 text-rose-400 font-bold text-xs transition-colors"
                          >
                            -5%
                          </button>
                          <button
                            onClick={() => handleSetLossPercent(h, 10)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500 hover:text-white border border-rose-500/30 text-rose-400 font-bold text-xs transition-colors"
                          >
                            -10%
                          </button>
                          <button
                            onClick={() => handleSetLossPercent(h, 25)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 hover:text-white border border-rose-500/40 text-rose-300 font-bold text-xs transition-colors"
                          >
                            -25%
                          </button>
                          <button
                            onClick={() => handleSetLossPercent(h, 50)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/25 hover:bg-rose-500 hover:text-white border border-rose-500/50 text-rose-300 font-bold text-xs transition-colors"
                          >
                            -50%
                          </button>
                          <button
                            onClick={() => handleSetLossPercent(h, 80)}
                            className="px-3 py-1 rounded-lg bg-rose-600 text-white font-black text-xs hover:bg-rose-500 transition-colors shadow-sm"
                          >
                            -80% (Crash)
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Drift & Precision Controls */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5" /> Drift & Control:
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() => handleSetHoldingBias(h.symbol, 'PUMP')}
                            title="Continuously pump stock on every tick"
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1"
                          >
                            🚀 Bull Pump
                          </button>
                          <button
                            onClick={() => handleSetHoldingBias(h.symbol, 'DUMP')}
                            title="Continuously dump stock on every tick"
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1"
                          >
                            📉 Bear Dump
                          </button>
                          <button
                            onClick={() => {
                              setActiveModalHolding(h);
                              setCustomTargetValue('25');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition-colors"
                          >
                            Exact ₹ / %...
                          </button>
                          {h.priceOverrideLocked ? (
                            <button
                              onClick={() => handleResetStock(h.symbol)}
                              title="Revert to natural Yahoo Market Feed"
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1"
                            >
                              <Unlock className="w-3 h-3 text-amber-400" /> Reset
                            </button>
                          ) : (
                            <button
                              onClick={() => handleFreezeExactPrice(h.symbol, h.currentPrice)}
                              title="Lock price exactly here"
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1"
                            >
                              <Lock className="w-3 h-3" /> Freeze
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: GLOBAL STOCK COMMAND CENTER                      */}
      {/* ======================================================== */}
      {activeTab === 'STOCKS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Selector & Status Card */}
          <div className="bg-[#111622] rounded-3xl border border-slate-800 p-6 space-y-4">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Select Simulator Stock</span>
            </h2>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Listed Stock Symbol</label>
              <select
                value={targetStock}
                onChange={(e) => setTargetStock(e.target.value)}
                className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {stocks.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} — {s.name} ({formatINR(s.currentPrice)})
                  </option>
                ))}
              </select>
            </div>

            {selectedStockObj && (
              <div className="bg-[#0b0e14] p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold">{selectedStockObj.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-extrabold">
                    {selectedStockObj.exchange}
                  </span>
                </div>
                <div className="text-2xl font-black text-white">{formatINR(selectedStockObj.currentPrice)}</div>
                <div
                  className={`text-xs font-bold flex items-center gap-1 ${
                    selectedStockObj.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {selectedStockObj.change >= 0 ? '+' : ''}
                  {formatINR(selectedStockObj.change)} ({selectedStockObj.changePercent >= 0 ? '+' : ''}
                  {selectedStockObj.changePercent.toFixed(2)}%)
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Day High:</span>
                    <span className="text-slate-200 font-semibold">{formatINR(selectedStockObj.highPrice)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Day Low:</span>
                    <span className="text-slate-200 font-semibold">{formatINR(selectedStockObj.lowPrice)}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Lock Status:</span>
                  {selectedStockObj.priceOverrideLocked ? (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Admin Locked
                    </span>
                  ) : (
                    <span className="text-slate-500 font-bold">Natural Market Feed</span>
                  )}
                </div>
              </div>
            )}

            {/* Quick Reset Button */}
            <button
              onClick={() => handleResetStock(targetStock)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Unlock & Revert to Real Market Feed</span>
            </button>
          </div>

          {/* Quick Price Multipliers & Circuit Triggers */}
          <div className="bg-[#111622] rounded-3xl border border-slate-800 p-6 space-y-4">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Quick Multiplier Price Shocks</span>
            </h2>
            <p className="text-xs text-slate-400">
              Instantly pump or dump {targetStock} price by fixed percentages to trigger limit orders or adjust portfolio values.
            </p>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-emerald-400 block mb-2">Bullish Pumps:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      const cur = selectedStockObj?.currentPrice || 1000;
                      handleFreezeExactPrice(targetStock, Number((cur * 1.05).toFixed(2)));
                    }}
                    className="py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs"
                  >
                    +5% Pump
                  </button>
                  <button
                    onClick={() => {
                      const cur = selectedStockObj?.currentPrice || 1000;
                      handleFreezeExactPrice(targetStock, Number((cur * 1.10).toFixed(2)));
                    }}
                    className="py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 font-bold text-xs"
                  >
                    +10% Pump
                  </button>
                  <button
                    onClick={() => handleSetHoldingBias(targetStock, 'UPPER_CIRCUIT')}
                    className="py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400"
                  >
                    +20% Upper Circuit
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-rose-400 block mb-2">Bearish Dumps:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      const cur = selectedStockObj?.currentPrice || 1000;
                      handleFreezeExactPrice(targetStock, Number((cur * 0.95).toFixed(2)));
                    }}
                    className="py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs"
                  >
                    -5% Drop
                  </button>
                  <button
                    onClick={() => {
                      const cur = selectedStockObj?.currentPrice || 1000;
                      handleFreezeExactPrice(targetStock, Number((cur * 0.90).toFixed(2)));
                    }}
                    className="py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400 font-bold text-xs"
                  >
                    -10% Drop
                  </button>
                  <button
                    onClick={() => handleSetHoldingBias(targetStock, 'LOWER_CIRCUIT')}
                    className="py-2 rounded-xl bg-rose-600 text-white font-black text-xs hover:bg-rose-500"
                  >
                    -20% Lower Circuit
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs font-bold text-cyan-400 block mb-2">Continuous Auto-Drift Mode:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSetHoldingBias(targetStock, 'PUMP')}
                    className="py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <span>🚀 Start Bull Rally</span>
                  </button>
                  <button
                    onClick={() => handleSetHoldingBias(targetStock, 'DUMP')}
                    className="py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <span>📉 Start Bear Dump</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Exact Custom Price Setter Form */}
          <div className="bg-[#111622] rounded-3xl border border-slate-800 p-6 space-y-4">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Direct Exact Price Injector</span>
            </h2>
            <p className="text-xs text-slate-400">
              Type the exact price you want {targetStock} to become. Limit orders will re-evaluate immediately.
            </p>

            <form onSubmit={handleStockOverride} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">New Exact Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    step="0.05"
                    placeholder={`e.g. ${selectedStockObj?.currentPrice || 2500}`}
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="lockPriceCheckbox"
                  checked={lockOnSet}
                  onChange={(e) => setLockOnSet(e.target.checked)}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="lockPriceCheckbox" className="text-xs text-slate-300 font-medium">
                  Lock Price Override (Prevents Yahoo API from overwriting)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20"
              >
                Inject Exact Price Now
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MARKET ENGINE & BROWNIAN VOLATILITY CONTROLLER    */}
      {/* ======================================================== */}
      {activeTab === 'ENGINE' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111622] rounded-3xl border border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Brownian Volatility Controller</span>
              </h2>
              <button
                onClick={handleTriggerTick}
                className="px-3 py-1 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-xs rounded-xl border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Force Tick Now</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-400">Market Volatility Multiplier</span>
                  <span className="text-emerald-400">{volatility.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={3.0}
                  step={0.1}
                  value={volatility}
                  onChange={(e) => setVolatility(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Market Status</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMarketOpen(true)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      marketOpen
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-[#0b0e14] border-slate-800 text-slate-400'
                    }`}
                  >
                    🟢 Market OPEN
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarketOpen(false)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      !marketOpen
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-[#0b0e14] border-slate-800 text-slate-400'
                    }`}
                  >
                    🔴 Market CLOSED
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">General Market Drift</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['BULLISH', 'NEUTRAL', 'BEARISH'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setTrend(b)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                        trend === b
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-extrabold'
                          : 'bg-[#0b0e14] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleUpdateConfig}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20"
              >
                Apply Simulation Parameters
              </button>
            </div>
          </div>

          <div className="bg-[#111622] rounded-3xl border border-slate-800 p-6 space-y-4">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Simulated Engine Rules & Details</span>
            </h2>
            <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <p>
                <strong className="text-white">Price Movement Rules:</strong> In TradeX, when Admin sets an exact price or target profit/loss percentage on any stock, the stock is marked as <span className="text-amber-400 font-bold">Locked</span>. This prevents Yahoo Finance background synchronization from reverting the custom simulated price.
              </p>
              <p>
                <strong className="text-white">Active Limit Orders:</strong> Whenever a stock's price is updated (manually or via tick), all pending limit buy/sell orders across all traders are immediately checked and automatically executed if conditions are met.
              </p>
              <p>
                <strong className="text-white">Continuous Bull/Bear Drift:</strong> Choosing "Bull Pump" or "Bear Dump" causes the simulation engine to pump or drop that specific stock on every cycle, giving users a live animated experience of active price movement.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: TRADERS, SIMULATED INVESTMENT, P&L & LEDGER        */}
      {/* ======================================================== */}
      {activeTab === 'USERS' && (
        <div className="space-y-6">
          {/* Scope Constraint Notice */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-200 block mb-0.5">
                Simulated Data Scope & Admin Override Notice
              </span>
              <p className="text-amber-300/80 leading-relaxed">
                All values shown below—including simulated investments, paper portfolios, virtual cash balances, profit/loss records, and transaction histories—are strictly confined to the paper-trading simulation engine. Admin modifications apply exclusively to user simulation records and have zero effect on real external broker accounts or live financial entities.
              </p>
            </div>
          </div>

          {/* Aggregate Simulation Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" /> Total Traders
              </span>
              <div className="text-xl font-black text-white">{userList.length}</div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Active paper accounts</span>
            </div>

            <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-cyan-400" /> Total Invested Capital
              </span>
              <div className="text-xl font-black text-cyan-300">
                {formatINR(userList.reduce((acc, u) => acc + (u.simulatedInvestment?.totalInvested || 0), 0), false)}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">In active stock holdings</span>
            </div>

            <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-blue-400" /> Portfolio Market Value
              </span>
              <div className="text-xl font-black text-blue-300">
                {formatINR(userList.reduce((acc, u) => acc + (u.simulatedInvestment?.currentPortfolioValue || 0), 0), false)}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Current market worth</span>
            </div>

            <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Total Virtual Cash
              </span>
              <div className="text-xl font-black text-emerald-300">
                {formatINR(userList.reduce((acc, u) => acc + (u.simulatedWallet?.balance || 0), 0), false)}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Available trading cash</span>
            </div>

            <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Net Simulated P&L
              </span>
              {(() => {
                const totalNetPnL = userList.reduce((acc, u) => acc + (u.simulatedPnL?.netPnL || 0), 0);
                return (
                  <div className={`text-xl font-black ${totalNetPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {totalNetPnL >= 0 ? '+' : ''}{formatINR(totalNetPnL, false)}
                  </div>
                );
              })()}
              <span className="text-[10px] text-slate-500 mt-0.5 block">Unrealized + Realized</span>
            </div>
          </div>

          {/* User Search & Action Bar */}
          <div className="bg-[#111622] rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Trader Accounts & Simulated Portfolios ({userList.length})</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  View full simulated investment metrics, profit/loss, and complete transaction history. Click any trader to edit values.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search name, email, ID..."
                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  {userSearch && (
                    <button
                      onClick={() => setUserSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Traders Table / Cards */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold pl-2">Trader</th>
                    <th className="pb-3 font-semibold text-right">Simulated Investment</th>
                    <th className="pb-3 font-semibold text-right">Portfolio Value</th>
                    <th className="pb-3 font-semibold text-right">Virtual Cash</th>
                    <th className="pb-3 font-semibold text-right">Profit / Loss</th>
                    <th className="pb-3 font-semibold text-center">Active Holdings</th>
                    <th className="pb-3 font-semibold text-center">History</th>
                    <th className="pb-3 font-semibold text-right pr-2">Simulated Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {userList
                    .filter((u) => {
                      if (!userSearch.trim()) return true;
                      const q = userSearch.toLowerCase();
                      return (
                        u.name.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q) ||
                        u.id.toLowerCase().includes(q)
                      );
                    })
                    .map((u) => {
                      const netPnL = u.simulatedPnL?.netPnL || 0;
                      const pnlPct = u.simulatedPnL?.unrealizedPnLPercent || 0;
                      const holdingsCount = (u.holdings || []).length;
                      const ordersCount = (u.transactionHistory?.orders || []).length;

                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-[#0b0e14]/50 transition-colors group cursor-pointer"
                          onClick={() => {
                            setSelectedUserForDetails(u);
                            setUserDetailSubTab('PORTFOLIO');
                          }}
                        >
                          {/* Trader Profile */}
                          <td className="py-3.5 pl-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-slate-700 text-white font-black flex items-center justify-center text-xs shrink-0">
                                {u.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {u.role === 'admin' && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Simulated Investment */}
                          <td className="py-3.5 text-right font-semibold text-slate-200">
                            {formatINR(u.simulatedInvestment?.totalInvested || 0)}
                          </td>

                          {/* Portfolio Market Value */}
                          <td className="py-3.5 text-right font-bold text-blue-400">
                            {formatINR(u.simulatedInvestment?.currentPortfolioValue || 0)}
                          </td>

                          {/* Virtual Cash Balance */}
                          <td className="py-3.5 text-right font-bold text-emerald-400">
                            {formatINR(u.simulatedWallet?.balance || 0)}
                          </td>

                          {/* Profit / Loss */}
                          <td className="py-3.5 text-right">
                            <div className="flex flex-col items-end">
                              <span
                                className={`font-black flex items-center gap-1 ${
                                  netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {netPnL >= 0 ? (
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                ) : (
                                  <ArrowDownRight className="w-3.5 h-3.5" />
                                )}
                                {netPnL >= 0 ? '+' : ''}{formatINR(netPnL)}
                              </span>
                              <span
                                className={`text-[10px] font-semibold ${
                                  pnlPct >= 0 ? 'text-emerald-400/80' : 'text-rose-400/80'
                                }`}
                              >
                                {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}% ret
                              </span>
                            </div>
                          </td>

                          {/* Active Holdings */}
                          <td className="py-3.5 text-center">
                            <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold text-[11px]">
                              {holdingsCount} {holdingsCount === 1 ? 'stock' : 'stocks'}
                            </span>
                          </td>

                          {/* History */}
                          <td className="py-3.5 text-center text-slate-400 text-[11px]">
                            <span className="flex items-center justify-center gap-1 text-slate-400">
                              <History className="w-3 h-3 text-slate-500" />
                              {ordersCount} orders
                            </span>
                          </td>

                          {/* Controls */}
                          <td className="py-3.5 text-right pr-2" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedUserForDetails(u);
                                  setUserDetailSubTab('PORTFOLIO');
                                }}
                                title="Inspect & Edit User Simulation Data"
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 hover:text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Inspect & Edit</span>
                              </button>

                              <button
                                onClick={() => {
                                  setEditingBalanceUser(u);
                                  setCustomBalanceInput(String(u.simulatedWallet?.balance || 500000));
                                }}
                                title="Edit Virtual Cash Balance"
                                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                              >
                                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                              </button>

                              <button
                                onClick={() => {
                                  setInjectingUser(u);
                                  setInjectPnLAmount('50000');
                                  setInjectPnLType('PROFIT');
                                  setInjectPnLReason('');
                                }}
                                title="Inject Simulated Profit / Loss"
                                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                              >
                                <Zap className="w-3.5 h-3.5 text-amber-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              {userList.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No registered users found. Users will appear here automatically upon signup.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: EV ENERGY STOCK FULL ADMIN CONTROL ROOM           */}
      {/* ======================================================== */}
      {activeTab === 'EV_ENERGY' && (
        <div className="space-y-6">
          {/* Top Banner & Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> Total Booked Slots
              </span>
              <div className="text-2xl font-black text-white mt-1">{adminEvSlots.length}</div>
            </div>

            <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Active 1-2h Contracts
              </span>
              <div className="text-2xl font-black text-cyan-400 mt-1">
                {adminEvSlots.filter((s) => s.status === 'ACTIVE').length}
              </div>
            </div>

            <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Won / Profit Slots
              </span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {adminEvSlots.filter((s) => s.status === 'SETTLED_WIN').length}
              </div>
            </div>

            <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Loss / Try Again Slots
              </span>
              <div className="text-2xl font-black text-rose-400 mt-1">
                {adminEvSlots.filter((s) => s.status === 'SETTLED_LOSS').length}
              </div>
            </div>
          </div>

          {/* Global Policy & Win/Loss Default Configuration */}
          <div className="bg-[#111622] rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <span>EV Energy Global Win/Loss Master Policy</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set the default outcome for new 1-2 hour EV Energy contracts booked by any trader.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Current Default:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  adminEvConfig?.defaultOutcome === 'FORCE_WIN'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  {adminEvConfig?.defaultOutcome === 'FORCE_WIN' ? '🟢 Always Profit (Win)' : '🔴 Always Loss (Try Again)'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Default Outcome for New Slots
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateEvConfig({ defaultOutcome: 'FORCE_WIN' })}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      adminEvConfig?.defaultOutcome === 'FORCE_WIN'
                        ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-[#0b0e14] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Always Win (+Profit)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateEvConfig({ defaultOutcome: 'FORCE_LOSS' })}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      adminEvConfig?.defaultOutcome === 'FORCE_LOSS'
                        ? 'bg-rose-500 text-slate-950 font-black border-rose-400 shadow-md shadow-rose-500/20'
                        : 'bg-[#0b0e14] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Always Loss (Try Again)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Default Profit Multiplier (% of Invested Tier)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="10"
                    max="500"
                    step="5"
                    value={adminEvConfig?.defaultProfitPercent || 300}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val)) {
                        handleUpdateEvConfig({ defaultProfitPercent: val });
                      }
                    }}
                    className="flex-1 bg-[#0b0e14] border border-slate-800 rounded-2xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center px-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-emerald-400 font-bold font-mono">
                    % Profit
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slot Bookings Ledger & Real-Time Controller Table */}
          <div className="bg-[#111622] rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <BatteryCharging className="w-5 h-5 text-cyan-400" />
                  <span>EV Energy User Slot Ledger & Outcome Manipulator</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full admin control: Override win/loss for any user, edit exact profit or loss amounts, and force instant resolution.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={adminEvSearch}
                    onChange={(e) => setAdminEvSearch(e.target.value)}
                    placeholder="Search user, email, slot ID..."
                    className="bg-[#0b0e14] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-52"
                  />
                </div>

                <div className="flex bg-[#0b0e14] p-1 rounded-xl border border-slate-800 text-xs">
                  {(['ALL', 'ACTIVE', 'SETTLED'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setAdminEvStatusFilter(f)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        adminEvStatusFilter === f
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-800/80 rounded-2xl bg-[#0b0e14]/50">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="p-3.5 font-semibold">Trader & Slot ID</th>
                    <th className="p-3.5 font-semibold text-right">Price Tier</th>
                    <th className="p-3.5 font-semibold text-center">Duration</th>
                    <th className="p-3.5 font-semibold text-right">Target Profit</th>
                    <th className="p-3.5 font-semibold text-center">Admin Outcome</th>
                    <th className="p-3.5 font-semibold text-center">Status</th>
                    <th className="p-3.5 font-semibold text-right">Instant Admin Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {adminEvSlots
                    .filter((s) => {
                      if (adminEvStatusFilter === 'ACTIVE' && s.status !== 'ACTIVE') return false;
                      if (adminEvStatusFilter === 'SETTLED' && s.status === 'ACTIVE') return false;
                      if (!adminEvSearch) return true;
                      const q = adminEvSearch.toLowerCase();
                      return (
                        s.userName.toLowerCase().includes(q) ||
                        s.userEmail.toLowerCase().includes(q) ||
                        s.id.toLowerCase().includes(q)
                      );
                    })
                    .map((slot) => {
                      const isSettled = slot.status !== 'ACTIVE';
                      const isWin = slot.status === 'SETTLED_WIN';
                      const isLoss = slot.status === 'SETTLED_LOSS';

                      return (
                        <tr key={slot.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-white font-sans">{slot.userName}</div>
                            <div className="text-[10px] text-slate-400 font-sans">{slot.userEmail}</div>
                            <div className="text-[9px] text-cyan-400 font-mono mt-0.5">#{slot.id}</div>
                          </td>

                          <td className="p-3.5 text-right font-bold text-white">
                            {formatINR(slot.tierPrice, false)}
                          </td>

                          <td className="p-3.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              {slot.durationHours}h ({slot.durationHours * 60}m)
                            </span>
                          </td>

                          <td className="p-3.5 text-right font-bold text-emerald-400">
                            +{formatINR(slot.profitAmount, false)}
                          </td>

                          <td className="p-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              slot.adminOutcome === 'FORCE_WIN'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : slot.adminOutcome === 'FORCE_LOSS'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {slot.adminOutcome === 'FORCE_WIN' ? 'WIN (+)' : slot.adminOutcome === 'FORCE_LOSS' ? 'LOSS (-)' : 'PENDING'}
                            </span>
                          </td>

                          <td className="p-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isSettled
                                ? isWin
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse'
                            }`}>
                              {slot.status}
                            </span>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1 font-sans">
                              {!isSettled ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleSetSlotOutcome(slot.id, 'FORCE_WIN')}
                                    title="Set outcome to Win"
                                    className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                                      slot.adminOutcome === 'FORCE_WIN'
                                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                                        : 'bg-slate-900 border-slate-800 text-emerald-400 hover:bg-emerald-500/20'
                                    }`}
                                  >
                                    Win
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleSetSlotOutcome(slot.id, 'FORCE_LOSS')}
                                    title="Set outcome to Loss"
                                    className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                                      slot.adminOutcome === 'FORCE_LOSS'
                                        ? 'bg-rose-500 text-slate-950 border-rose-400 font-black'
                                        : 'bg-slate-900 border-slate-800 text-rose-400 hover:bg-rose-500/20'
                                    }`}
                                  >
                                    Loss
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleForceSettleSlot(slot.id, 'FORCE_WIN')}
                                    title="Instantly settle as WIN (Credits wallet now)"
                                    className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-[10px] font-bold transition-all border border-emerald-500/40"
                                  >
                                    ⚡ Settle Win
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleForceSettleSlot(slot.id, 'FORCE_LOSS')}
                                    title="Instantly settle as LOSS (Marks lost now)"
                                    className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-slate-950 text-[10px] font-bold transition-all border border-rose-500/40"
                                  >
                                    ❌ Settle Loss
                                  </button>
                                </>
                              ) : (
                                <span className="text-[11px] text-slate-500 mr-2">Settled</span>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingEvSlot(slot);
                                  setEditSlotProfit(String(slot.profitAmount));
                                  setEditSlotLoss(String(slot.lossAmount));
                                  setEditSlotOutcome(slot.adminOutcome);
                                }}
                                title="Edit Slot Profit & Loss Values"
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                  {adminEvSlots.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                        No EV Energy slots booked by users yet. Bookings will appear here in real time.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CUSTOM TARGET P&L DIALOG                         */}
      {/* ======================================================== */}
      {activeModalHolding && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">Custom Target P&L Manipulator</h3>
                <p className="text-xs text-slate-400">
                  {activeModalHolding.userName}'s {activeModalHolding.symbol} ({activeModalHolding.quantity} shares @ {formatINR(activeModalHolding.averageBuyPrice)})
                </p>
              </div>
              <button
                onClick={() => setActiveModalHolding(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyCustomModal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">Calculation Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomTargetType('PERCENT');
                      setCustomTargetValue('25');
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      customTargetType === 'PERCENT'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                        : 'bg-[#0b0e14] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Target % P&L
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomTargetType('RUPEES');
                      setCustomTargetValue('10000');
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      customTargetType === 'RUPEES'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                        : 'bg-[#0b0e14] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Target ₹ P&L
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomTargetType('PRICE');
                      setCustomTargetValue(String(activeModalHolding.currentPrice));
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      customTargetType === 'PRICE'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                        : 'bg-[#0b0e14] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Exact Price ₹
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  {customTargetType === 'PERCENT'
                    ? 'Target P&L Percent (e.g. +30 for profit, -15 for loss)'
                    : customTargetType === 'RUPEES'
                    ? 'Target Total Position Profit/Loss in Rupees (e.g. +15000 or -5000)'
                    : 'Target Exact Stock Price (₹)'}
                </label>
                <input
                  type="number"
                  step="any"
                  value={customTargetValue}
                  onChange={(e) => setCustomTargetValue(e.target.value)}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder={customTargetType === 'PERCENT' ? '25' : '10000'}
                  autoFocus
                />
              </div>

              <div className="bg-[#0b0e14] p-3 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-1">
                <span className="font-bold text-slate-300">Live Preview:</span>
                <div>
                  Buy Price: <span className="text-white">{formatINR(activeModalHolding.averageBuyPrice)}</span> | Invested: <span className="text-white">{formatINR(activeModalHolding.investedValue)}</span>
                </div>
                {customTargetType === 'PERCENT' && (
                  <div className="text-emerald-400 font-semibold">
                    Result Price: ~{formatINR(activeModalHolding.averageBuyPrice * (1 + (parseFloat(customTargetValue) || 0) / 100))}
                  </div>
                )}
                {customTargetType === 'RUPEES' && (
                  <div className="text-emerald-400 font-semibold">
                    Result Price: ~{formatINR(activeModalHolding.averageBuyPrice + ((parseFloat(customTargetValue) || 0) / activeModalHolding.quantity))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalHolding(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplyingCustom}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isApplyingCustom ? 'Applying...' : 'Apply Simulated Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: COMPLETE USER SIMULATION DRAWER / INSPECTOR     */}
      {/* ======================================================== */}
      {selectedUserForDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#111622] border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0b0e14]/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-slate-700 text-white font-black flex items-center justify-center text-sm">
                  {selectedUserForDetails.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">{selectedUserForDetails.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                      ID: {selectedUserForDetails.id}
                    </span>
                    {selectedUserForDetails.role === 'admin' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedUserForDetails.email} • Joined {new Date(selectedUserForDetails.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Net Simulated Worth</span>
                  <span className="text-sm font-black text-emerald-400">
                    {formatINR(selectedUserForDetails.simulatedInvestment?.totalNetWorth || 0)}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedUserForDetails(null)}
                  className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 bg-[#0f131c]">
              <button
                onClick={() => setUserDetailSubTab('PORTFOLIO')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  userDetailSubTab === 'PORTFOLIO'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Simulated Holdings ({selectedUserForDetails.holdings?.length || 0})</span>
              </button>

              <button
                onClick={() => setUserDetailSubTab('BALANCE_PNL')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  userDetailSubTab === 'BALANCE_PNL'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Cash & P&L Direct Controls</span>
              </button>

              <button
                onClick={() => setUserDetailSubTab('TRANSACTIONS')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  userDetailSubTab === 'TRANSACTIONS'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Transaction & Order Ledger ({selectedUserForDetails.transactionHistory?.transactions?.length || 0})</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* SUBTAB 1: PORTFOLIO HOLDINGS & VALUE EDITOR */}
              {userDetailSubTab === 'PORTFOLIO' && (
                <div className="space-y-4">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0b0e14] p-3.5 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Total Invested</span>
                      <span className="text-sm font-black text-white">
                        {formatINR(selectedUserForDetails.simulatedInvestment?.totalInvested || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Market Value</span>
                      <span className="text-sm font-black text-blue-400">
                        {formatINR(selectedUserForDetails.simulatedInvestment?.currentPortfolioValue || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Unrealized P&L</span>
                      <span className={`text-sm font-black ${
                        (selectedUserForDetails.simulatedPnL?.unrealizedPnL || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {(selectedUserForDetails.simulatedPnL?.unrealizedPnL || 0) >= 0 ? '+' : ''}
                        {formatINR(selectedUserForDetails.simulatedPnL?.unrealizedPnL || 0)}
                        {' '}({(selectedUserForDetails.simulatedPnL?.unrealizedPnLPercent || 0).toFixed(2)}%)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Virtual Cash</span>
                      <span className="text-sm font-black text-emerald-400">
                        {formatINR(selectedUserForDetails.simulatedWallet?.balance || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Actions Header */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300">Active Stock Holdings</h4>
                    <button
                      onClick={() => {
                        setNewHoldingUserId(selectedUserForDetails.id);
                        setNewHoldingSymbol(stocks[0]?.symbol || 'RELIANCE');
                        setNewHoldingQty('10');
                        setNewHoldingBuyPrice(String(stocks[0]?.currentPrice || 1000));
                        setIsAddingHolding(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Simulated Holding</span>
                    </button>
                  </div>

                  {/* Holdings Table */}
                  <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-[#0b0e14]/50">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="p-3 font-semibold">Stock</th>
                          <th className="p-3 font-semibold text-right">Shares (Qty)</th>
                          <th className="p-3 font-semibold text-right">Avg Buy Price</th>
                          <th className="p-3 font-semibold text-right">Current Price</th>
                          <th className="p-3 font-semibold text-right">Invested Value</th>
                          <th className="p-3 font-semibold text-right">Current Value</th>
                          <th className="p-3 font-semibold text-right">P&L</th>
                          <th className="p-3 font-semibold text-right">Holding Controls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {(selectedUserForDetails.holdings || []).map((h) => {
                          const pnl = h.unrealizedPnL || 0;
                          const pnlPct = h.unrealizedPnLPercent || 0;

                          return (
                            <tr key={h.id || h.symbol} className="hover:bg-slate-900/50 transition-colors">
                              <td className="p-3">
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{h.symbol}</span>
                                  {h.priceOverrideLocked && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                      Locked
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500">{h.stockName || h.name || h.symbol}</div>
                              </td>

                              <td className="p-3 text-right font-mono font-bold text-white">
                                {h.quantity}
                              </td>

                              <td className="p-3 text-right font-mono text-slate-300">
                                {formatINR(h.averageBuyPrice)}
                              </td>

                              <td className="p-3 text-right font-mono font-bold text-blue-400">
                                {formatINR(h.currentPrice)}
                              </td>

                              <td className="p-3 text-right font-mono text-slate-300">
                                {formatINR(h.investedValue)}
                              </td>

                              <td className="p-3 text-right font-mono font-bold text-white">
                                {formatINR(h.currentValue)}
                              </td>

                              <td className="p-3 text-right">
                                <span className={`font-mono font-bold block ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {pnl >= 0 ? '+' : ''}{formatINR(pnl)}
                                </span>
                                <span className={`text-[10px] font-semibold ${pnlPct >= 0 ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                                  {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                                </span>
                              </td>

                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingHolding({
                                        userId: selectedUserForDetails.id,
                                        symbol: h.symbol,
                                        quantity: h.quantity,
                                        averageBuyPrice: h.averageBuyPrice
                                      });
                                      setEditHoldingQty(String(h.quantity));
                                      setEditHoldingPrice(String(h.averageBuyPrice));
                                    }}
                                    title="Edit Quantity or Avg Buy Price"
                                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold transition-colors flex items-center gap-1"
                                  >
                                    <Edit3 className="w-3 h-3 text-emerald-400" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveModalHolding({
                                        userId: selectedUserForDetails.id,
                                        userName: selectedUserForDetails.name,
                                        userEmail: selectedUserForDetails.email,
                                        holdingId: h.id,
                                        stockId: `stk_${h.symbol.toLowerCase()}`,
                                        symbol: h.symbol,
                                        stockName: h.stockName || h.name || h.symbol,
                                        sector: h.sector || 'Equities',
                                        quantity: h.quantity,
                                        averageBuyPrice: h.averageBuyPrice,
                                        currentPrice: h.currentPrice,
                                        investedValue: h.investedValue,
                                        currentValue: h.currentValue,
                                        unrealizedPnL: h.unrealizedPnL,
                                        unrealizedPnLPercent: h.unrealizedPnLPercent
                                      });
                                    }}
                                    title="Trigger 1-Click Profit or Loss target on Stock Price"
                                    className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold transition-colors"
                                  >
                                    Target P&L
                                  </button>

                                  <button
                                    onClick={() => handleDeleteHolding(selectedUserForDetails.id, h.symbol)}
                                    title="Delete Simulated Holding"
                                    className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {(!selectedUserForDetails.holdings || selectedUserForDetails.holdings.length === 0) && (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                              User has no active simulated stock holdings. Click "Add Simulated Holding" above to grant positions.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: CASH & P&L DIRECT CONTROLS */}
              {userDetailSubTab === 'BALANCE_PNL' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Virtual Balance Management */}
                  <div className="bg-[#0b0e14] p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-sm font-bold text-white">Virtual Wallet Cash Balance</h4>
                    </div>

                    <div className="p-3 bg-[#111622] rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-semibold block">Current Balance</span>
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        {formatINR(selectedUserForDetails.simulatedWallet?.balance || 0)}
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">Quick Cash Additions</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[50000, 100000, 500000, 1000000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => handleAdjustBalance(selectedUserForDetails.id, amt)}
                            className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/30 text-emerald-400 font-bold text-xs transition-colors"
                          >
                            +{formatINR(amt, false)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">Set Exact New Balance</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="any"
                          value={customBalanceInput}
                          onChange={(e) => setCustomBalanceInput(e.target.value)}
                          placeholder="e.g. 500000"
                          className="flex-1 bg-[#111622] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBalanceUser(selectedUserForDetails);
                            handleSaveCustomBalance({ preventDefault: () => {} } as any);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-emerald-500/20"
                        >
                          Save Balance
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Direct P&L Injector */}
                  <div className="bg-[#0b0e14] p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <h4 className="text-sm font-bold text-white">Direct Simulated P&L Injector</h4>
                    </div>

                    <p className="text-xs text-slate-400">
                      Inject a direct simulated profit or loss adjustment into this trader’s account ledger.
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setInjectPnLType('PROFIT')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                          injectPnLType === 'PROFIT'
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Inject Profit (+)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setInjectPnLType('LOSS')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                          injectPnLType === 'LOSS'
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span>Inject Loss (-)</span>
                      </button>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">Amount (₹)</label>
                      <input
                        type="number"
                        step="any"
                        value={injectPnLAmount}
                        onChange={(e) => setInjectPnLAmount(e.target.value)}
                        placeholder="e.g. 50000"
                        className="w-full bg-[#111622] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">Reason / Audit Note</label>
                      <input
                        type="text"
                        value={injectPnLReason}
                        onChange={(e) => setInjectPnLReason(e.target.value)}
                        placeholder="e.g. Bonus Trade Profit Credit or Margin Adjustment"
                        className="w-full bg-[#111622] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setInjectingUser(selectedUserForDetails);
                        handleInjectPnL({ preventDefault: () => {} } as any);
                      }}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-md shadow-amber-500/20"
                    >
                      Apply {injectPnLType} Adjustment of {formatINR(parseFloat(injectPnLAmount) || 0)}
                    </button>
                  </div>
                </div>
              )}

              {/* SUBTAB 3: COMPLETE TRANSACTION & ORDER HISTORY */}
              {userDetailSubTab === 'TRANSACTIONS' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTxFilter('ALL')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          txFilter === 'ALL'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        All Transactions
                      </button>

                      <button
                        onClick={() => setTxFilter('ORDERS')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          txFilter === 'ORDERS'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        Trade Orders ({selectedUserForDetails.transactionHistory?.orders?.length || 0})
                      </button>

                      <button
                        onClick={() => setTxFilter('TRANSFERS')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          txFilter === 'TRANSFERS'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        Deposits / Cash ({(selectedUserForDetails.transactionHistory?.deposits?.length || 0) + (selectedUserForDetails.transactionHistory?.withdrawals?.length || 0)})
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-500">
                      Total Ledger Entries: {selectedUserForDetails.transactionHistory?.transactions?.length || 0}
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-[#0b0e14]/50 max-h-96">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-[#0b0e14] z-10">
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="p-3 font-semibold">Date & Time</th>
                          <th className="p-3 font-semibold">Type</th>
                          <th className="p-3 font-semibold">Details & Symbol</th>
                          <th className="p-3 font-semibold text-right">Amount (₹)</th>
                          <th className="p-3 font-semibold text-center">Status</th>
                          <th className="p-3 font-semibold text-right">Reference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {selectedUserForDetails.transactionHistory?.transactions
                          ?.filter((t) => {
                            if (txFilter === 'ORDERS') {
                              return t.type.includes('ORDER') || t.type.includes('BUY') || t.type.includes('SELL');
                            }
                            if (txFilter === 'TRANSFERS') {
                              return t.type.includes('DEPOSIT') || t.type.includes('WITHDRAW');
                            }
                            return true;
                          })
                          .map((t) => (
                            <tr key={t.id} className="hover:bg-slate-900/50 transition-colors">
                              <td className="p-3 text-slate-400 font-mono text-[11px]">
                                {new Date(t.createdAt).toLocaleString()}
                              </td>

                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  t.type.includes('BUY')
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : t.type.includes('SELL')
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : t.type.includes('PROFIT')
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : t.type.includes('LOSS')
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    : 'bg-slate-800 text-slate-300'
                                }`}>
                                  {t.type.replace(/_/g, ' ')}
                                </span>
                              </td>

                              <td className="p-3 font-medium text-white max-w-xs truncate">
                                {t.description || (t.stock ? `${t.quantity} shares of ${t.stock} @ ${formatINR(t.price || 0)}` : 'Simulated Ledger Entry')}
                              </td>

                              <td className="p-3 text-right font-mono font-bold text-white">
                                {formatINR(t.amount || 0)}
                              </td>

                              <td className="p-3 text-center">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {t.status || 'COMPLETED'}
                                </span>
                              </td>

                              <td className="p-3 text-right text-slate-500 font-mono text-[10px]">
                                {t.id}
                              </td>
                            </tr>
                          ))}

                        {(!selectedUserForDetails.transactionHistory?.transactions ||
                          selectedUserForDetails.transactionHistory?.transactions.length === 0) && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                              No transaction ledger records recorded for this user yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-[#0b0e14]/60 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>All modifications apply directly to this user's simulated records.</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedUserForDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 font-bold text-slate-300 hover:text-white"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT USER SIMULATED HOLDING (QTY & BUY PRICE)   */}
      {/* ======================================================== */}
      {editingHolding && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">Edit Simulated Holding</h3>
                <p className="text-xs text-slate-400">
                  Override {editingHolding.symbol} shares & cost basis to alter user P&L
                </p>
              </div>
              <button
                onClick={() => setEditingHolding(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveHoldingEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Quantity (Shares)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={editHoldingQty}
                  onChange={(e) => setEditHoldingQty(e.target.value)}
                  required
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Setting quantity to 0 removes this holding.</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Average Buy Price (₹)</label>
                <input
                  type="number"
                  min="0.05"
                  step="0.05"
                  value={editHoldingPrice}
                  onChange={(e) => setEditHoldingPrice(e.target.value)}
                  required
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Changing buy price instantly recalculates the user's profit or loss.
                </span>
              </div>

              <div className="bg-[#0b0e14] p-3 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-1 font-mono">
                <div>
                  New Invested Value: <span className="text-white font-bold">
                    {formatINR((parseFloat(editHoldingQty) || 0) * (parseFloat(editHoldingPrice) || 0))}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingHolding(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shadow-md shadow-emerald-500/20"
                >
                  Save Simulated Holding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADD NEW SIMULATED HOLDING TO USER               */}
      {/* ======================================================== */}
      {isAddingHolding && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">Add Simulated Stock Holding</h3>
                <p className="text-xs text-slate-400">
                  Grant a paper stock position directly to this user's portfolio
                </p>
              </div>
              <button
                onClick={() => setIsAddingHolding(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddHolding} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Select Stock</label>
                <select
                  value={newHoldingSymbol}
                  onChange={(e) => {
                    setNewHoldingSymbol(e.target.value);
                    const selected = stocks.find((s) => s.symbol === e.target.value);
                    if (selected) {
                      setNewHoldingBuyPrice(String(selected.currentPrice));
                    }
                  }}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {stocks.map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol} - {s.name} (₹{s.currentPrice})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Quantity (Shares)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={newHoldingQty}
                  onChange={(e) => setNewHoldingQty(e.target.value)}
                  required
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Average Cost Basis (₹)</label>
                <input
                  type="number"
                  min="0.05"
                  step="0.05"
                  value={newHoldingBuyPrice}
                  onChange={(e) => setNewHoldingBuyPrice(e.target.value)}
                  required
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="bg-[#0b0e14] p-3 rounded-2xl border border-slate-800/80 text-xs text-slate-400 font-mono">
                Total Simulated Cost: <span className="text-emerald-400 font-bold">
                  {formatINR((parseFloat(newHoldingQty) || 0) * (parseFloat(newHoldingBuyPrice) || 0))}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingHolding(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shadow-md shadow-emerald-500/20"
                >
                  Add Holding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: INJECT P&L DIRECTLY                            */}
      {/* ======================================================== */}
      {injectingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">Inject Simulated Profit / Loss</h3>
                <p className="text-xs text-slate-400">
                  Target user: {injectingUser.name} ({injectingUser.email})
                </p>
              </div>
              <button
                onClick={() => setInjectingUser(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInjectPnL} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setInjectPnLType('PROFIT')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                    injectPnLType === 'PROFIT'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Profit Credit (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInjectPnLType('LOSS')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                    injectPnLType === 'LOSS'
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Loss Deduction (-)</span>
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={injectPnLAmount}
                  onChange={(e) => setInjectPnLAmount(e.target.value)}
                  required
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Reason / Description</label>
                <input
                  type="text"
                  value={injectPnLReason}
                  onChange={(e) => setInjectPnLReason(e.target.value)}
                  placeholder="e.g. Simulated Arbitrage Profit or Trading Loss Deduction"
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInjectingUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-md shadow-amber-500/20"
                >
                  Apply {injectPnLType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: EDIT VIRTUAL CASH BALANCE                      */}
      {/* ======================================================== */}
      {editingBalanceUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">Edit Virtual Balance</h3>
                <p className="text-xs text-slate-400">
                  Trader: {editingBalanceUser.name} ({editingBalanceUser.email})
                </p>
              </div>
              <button
                onClick={() => setEditingBalanceUser(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomBalance} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">New Virtual Balance (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={customBalanceInput}
                  onChange={(e) => setCustomBalanceInput(e.target.value)}
                  required
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[500000, 1000000, 2500000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCustomBalanceInput(String(preset))}
                    className="py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300"
                  >
                    {formatINR(preset, false)}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBalanceUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shadow-md shadow-emerald-500/20"
                >
                  Save Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: SECURE ADMIN PASSWORD MANAGEMENT                */}
      {/* ======================================================== */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Admin Password & Security</h3>
                  <p className="text-xs text-slate-400">Salted & Hashed Authentication</p>
                </div>
              </div>
              <button
                onClick={() => setIsSecurityModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Security Explanation */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[11px] text-emerald-300 leading-relaxed">
              <div className="font-bold flex items-center gap-1 text-emerald-200 mb-0.5">
                <Check className="w-3.5 h-3.5" />
                <span>Zero Hardcoded Passwords in Code</span>
              </div>
              Passwords are securely hashed with a cryptographic salt on the server. Change your credentials here or configure them via environment variables (<code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-400">ADMIN_PASSWORD</code>).
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentAdminPassword}
                  onChange={(e) => setCurrentAdminPassword(e.target.value)}
                  required
                  placeholder="Enter your current password"
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">New Password</label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmAdminPassword}
                  onChange={(e) => setConfirmAdminPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Confirm new password"
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSecurityModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordChangeLoading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {passwordChangeLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 7: EDIT EV ENERGY SLOT VALUES & OUTCOME            */}
      {/* ======================================================== */}
      {editingEvSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">Edit EV Energy Slot Values</h3>
                <p className="text-xs text-slate-400">
                  {editingEvSlot.userName} • Slot #{editingEvSlot.id}
                </p>
              </div>
              <button
                onClick={() => setEditingEvSlot(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditEvSlot} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Designated Outcome</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditSlotOutcome('FORCE_WIN')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      editSlotOutcome === 'FORCE_WIN'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                        : 'bg-[#0b0e14] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Win (Profit)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditSlotOutcome('FORCE_LOSS')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      editSlotOutcome === 'FORCE_LOSS'
                        ? 'bg-rose-500 text-slate-950 border-rose-400 font-black'
                        : 'bg-[#0b0e14] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Loss (Loss)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditSlotOutcome('PENDING')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      editSlotOutcome === 'PENDING'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                        : 'bg-[#0b0e14] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Pending
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Custom Profit Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={editSlotProfit}
                  onChange={(e) => setEditSlotProfit(e.target.value)}
                  required
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Amount to disburse as profit on top of principal investment.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Loss Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={editSlotLoss}
                  onChange={(e) => setEditSlotLoss(e.target.value)}
                  required
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEvSlot(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingEvSlot}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isUpdatingEvSlot ? 'Saving...' : 'Save Slot Controls'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
