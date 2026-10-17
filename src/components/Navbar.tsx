import React, { useState, useRef } from 'react';
import { useTrade, PageId } from '../context/TradeContext';
import { formatINR } from '../services/api';
import { GrowwLogo } from './GrowwLogo';
import {
  Wallet,
  PlusCircle,
  User,
  Search,
  Settings,
  Shield,
  FileText,
  LogOut,
  ChevronDown,
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Sun,
  Moon,
  Menu,
  X,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    user,
    wallet,
    settings,
    currentPage,
    navigateTo,
    setQuickAddModalOpen,
    logout,
    stocks,
    setSelectedSymbol,
    theme,
    toggleTheme,
    isAdmin
  } = useTrade();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredStocks = searchQuery.trim()
    ? stocks.filter(
        (s) =>
          s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleNavClick = (page: PageId) => {
    navigateTo(page);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  // Secret 5 consecutive taps/clicks on main site logo to open Admin Login
  const logoTapTimestampsRef = useRef<number[]>([]);

  const handleBrandLogoClick = (e: React.MouseEvent) => {
    const now = Date.now();
    // Rolling 3.5-second window for 5 taps
    const recentTaps = [...logoTapTimestampsRef.current.filter((t) => now - t < 3500), now];
    logoTapTimestampsRef.current = recentTaps;

    if (recentTaps.length >= 5) {
      logoTapTimestampsRef.current = [];
      // 5 consecutive taps triggered!
      if (isAdmin) {
        navigateTo('admin-dashboard');
      } else {
        navigateTo('admin-login');
      }
      return;
    }

    // Default single-tap behavior
    handleNavClick(user ? 'dashboard' : 'landing');
  };

  const handleStockSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
    navigateTo('stock-details', symbol);
    setSearchQuery('');
    setSearchOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors border-b backdrop-blur-md ${
        theme === 'dark'
          ? 'bg-[#0c0f17]/90 border-slate-800/80 text-slate-100'
          : 'bg-white/90 border-slate-200/90 text-slate-900 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand & Market Status */}
        <div className="flex items-center gap-3">
          <button
            id="nav-brand"
            onClick={handleBrandLogoClick}
            className="flex items-center gap-2 text-left group touch-manipulation select-none active:scale-[0.98] transition-transform cursor-pointer"
          >
            <GrowwLogo size="md" showBadge={true} />
          </button>

          {/* Market Status Live Indicator */}
          <div
            className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              theme === 'dark'
                ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                settings?.marketStatus === 'OPEN'
                  ? 'bg-[#00d09c] animate-pulse'
                  : 'bg-rose-500'
              }`}
            />
            <span>{settings?.marketStatus === 'OPEN' ? 'Market Active' : 'Market Closed'}</span>
          </div>
        </div>

        {/* Global Live Search Bar (Desktop) */}
        <div className="relative hidden md:block w-72 lg:w-96">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              id="desktop-search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search stocks (e.g. RELIANCE, TCS, HDFC)..."
              className={`w-full rounded-2xl pl-9 pr-3 py-1.5 text-xs transition-all focus:outline-none focus:ring-1 focus:ring-[#00d09c] ${
                theme === 'dark'
                  ? 'bg-[#151922] border border-slate-800 text-white placeholder-slate-500 focus:border-[#00d09c]'
                  : 'bg-slate-100/90 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#00d09c]'
              }`}
            />
          </div>

          {/* Instant Search Dropdown */}
          {searchOpen && searchQuery && (
            <div
              className={`absolute top-full left-0 mt-1.5 w-full rounded-2xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto border ${
                theme === 'dark'
                  ? 'bg-[#151922] border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              {filteredStocks.length > 0 ? (
                filteredStocks.map((stk) => (
                  <button
                    key={stk.symbol}
                    id={`search-item-${stk.symbol}`}
                    onClick={() => handleStockSelect(stk.symbol)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors border-b last:border-0 ${
                      theme === 'dark'
                        ? 'hover:bg-slate-800/80 border-slate-800/50'
                        : 'hover:bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#00d09c]/10 text-[#00b386] dark:text-[#00d09c] font-black text-xs flex items-center justify-center border border-[#00d09c]/20 shrink-0">
                        {stk.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{stk.symbol}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                          {stk.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold">{formatINR(stk.currentPrice)}</div>
                      <div
                        className={`text-[10px] font-bold ${
                          stk.change >= 0 ? 'text-[#00b386] dark:text-[#00d09c]' : 'text-rose-500'
                        }`}
                      >
                        {stk.change >= 0 ? '+' : ''}
                        {stk.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-xs text-slate-400 text-center">
                  No stocks found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
          <button
            id="nav-btn-stocks"
            onClick={() => handleNavClick('markets')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              currentPage === 'markets' || currentPage === 'stock-details'
                ? 'text-[#00D09C] font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#00D09C]'
            }`}
          >
            Stocks
          </button>
          <button
            id="nav-btn-commodities"
            onClick={() => handleNavClick('commodities')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              currentPage === 'commodities'
                ? 'text-[#00D09C] font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#00D09C]'
            }`}
          >
            Gold & Silver
          </button>
          <button
            id="nav-btn-mf"
            onClick={() => handleNavClick('mutual-funds')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              currentPage === 'mutual-funds'
                ? 'text-[#00D09C] font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#00D09C]'
            }`}
          >
            Mutual Funds
          </button>
          <button
            id="nav-btn-ipo"
            onClick={() => handleNavClick('ipos')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              currentPage === 'ipos'
                ? 'text-[#00D09C] font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#00D09C]'
            }`}
          >
            IPO
          </button>
          <button
            id="nav-btn-etf"
            onClick={() => handleNavClick('etfs')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              currentPage === 'etfs'
                ? 'text-[#00D09C] font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#00D09C]'
            }`}
          >
            ETFs
          </button>
          <button
            id="nav-btn-watchlists"
            onClick={() => handleNavClick('watchlists')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              currentPage === 'watchlists'
                ? 'text-[#00D09C] font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#00D09C]'
            }`}
          >
            Watchlist
          </button>
          <button
            id="nav-btn-fno"
            onClick={() => handleNavClick('index-details')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              currentPage === 'index-details'
                ? 'text-[#00D09C] font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#00D09C]'
            }`}
          >
            F&O
          </button>

          {/* EV Energy Stock Button */}
          <button
            id="nav-btn-ev-energy"
            onClick={() => handleNavClick('ev-energy-stock')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              currentPage === 'ev-energy-stock'
                ? 'bg-gradient-to-r from-emerald-500/25 to-cyan-500/25 text-emerald-300 font-black border border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                : 'text-emerald-400 hover:text-white hover:bg-emerald-500/10 font-bold'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400 fill-current animate-pulse" />
            <span>EV Energy Stock</span>
            <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase">
              1-2h
            </span>
          </button>

          {/* Indians Energy Button */}
          <button
            id="nav-btn-indians-energy"
            onClick={() => handleNavClick('indians-energy')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              currentPage === 'indians-energy'
                ? 'bg-[#00D09C]/15 text-[#00D09C] font-black border border-[#00D09C]/30'
                : 'text-emerald-500 hover:text-[#00D09C] font-bold'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span>Indians Energy</span>
          </button>

          {/* More Dropdown */}
          <div className="relative group">
            <button
              className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#00D09C] flex items-center gap-1 transition-all"
            >
              <span>More</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-56 rounded-2xl shadow-xl py-2 z-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all border bg-white dark:bg-[#151922] border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => handleNavClick('indians-energy')}
                className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium flex flex-col cursor-pointer border-b border-slate-100 dark:border-slate-800/60"
              >
                <div className="flex items-center gap-1.5 font-bold text-emerald-500">
                  <Zap className="w-3 h-3 text-amber-400 fill-current" />
                  <span>Indians Energy Plans</span>
                </div>
                <span className="text-[10px] text-slate-400">Green Power &amp; Profit/Loss models</span>
              </button>
              <button
                onClick={() => handleNavClick('pnl-sheet')}
                className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium flex flex-col cursor-pointer"
              >
                <span className="font-bold text-slate-900 dark:text-white">P&L Statement</span>
                <span className="text-[10px] text-slate-400">Profit & Loss tax sheet</span>
              </button>
              <button
                onClick={() => handleNavClick('transactions')}
                className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium flex flex-col cursor-pointer"
              >
                <span className="font-bold text-slate-900 dark:text-white">Transaction History</span>
                <span className="text-[10px] text-slate-400">Deposits, withdrawals & orders</span>
              </button>
              <button
                onClick={() => handleNavClick('bank-accounts')}
                className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium flex flex-col cursor-pointer"
              >
                <span className="font-bold text-slate-900 dark:text-white">Bank Accounts</span>
                <span className="text-[10px] text-slate-400">Manage linked bank accounts</span>
              </button>
              <button
                onClick={() => handleNavClick('investment')}
                className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium flex flex-col cursor-pointer"
              >
                <span className="font-bold text-slate-900 dark:text-white">SIP Calculator</span>
                <span className="text-[10px] text-slate-400">Estimate compounding returns</span>
              </button>
              <button
                onClick={() => handleNavClick('terms')}
                className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium flex flex-col cursor-pointer"
              >
                <span className="font-bold text-slate-900 dark:text-white">Pricing & Charges</span>
                <span className="text-[10px] text-slate-400">Zero commission breakdown</span>
              </button>
            </div>
          </div>

          <button
            id="nav-btn-dashboard"
            onClick={() => handleNavClick('dashboard')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              currentPage === 'dashboard'
                ? 'bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] font-black'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Dashboard
          </button>
          <button
            id="nav-btn-portfolio"
            onClick={() => handleNavClick('portfolio')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              currentPage === 'portfolio'
                ? 'bg-[#00d09c]/15 text-[#00b386] dark:text-[#00d09c] font-black'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Portfolio
          </button>
        </nav>

        {/* Right Section: Theme Toggle, Virtual Wallet & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            className={`p-2 rounded-xl border transition-colors ${
              theme === 'dark'
                ? 'bg-[#151922] border-slate-800 text-amber-300 hover:text-amber-200'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {user ? (
            <>
              {/* Wallet Pill */}
              <div
                className={`flex items-center rounded-2xl border p-1 ${
                  theme === 'dark'
                    ? 'bg-[#151922] border-slate-800'
                    : 'bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  id="nav-wallet-btn"
                  onClick={() => handleNavClick('wallet')}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs hover:text-[#00b386] dark:text-[#00d09c] transition-colors font-bold"
                >
                  <Wallet className="w-3.5 h-3.5 text-[#00b386] dark:text-[#00d09c]" />
                  <span>{formatINR(wallet?.balance || 0, false)}</span>
                </button>
                <button
                  id="nav-quick-add-btn"
                  onClick={() => setQuickAddModalOpen(true)}
                  title="Add Money"
                  className="bg-[#00d09c] hover:bg-[#00b386] text-slate-950 px-2.5 py-1 rounded-xl text-[11px] font-black transition-all active:scale-95 flex items-center gap-1 shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Money</span>
                </button>
              </div>

              {/* Real Trading indicator */}
              <span className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#00D09C]/15 text-[#00b386] dark:text-[#00D09C] border border-[#00D09C]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D09C] animate-pulse" />
                Real Trading — Real Money
              </span>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  id="nav-profile-menu-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center gap-1.5 p-1 rounded-2xl border transition-all ${
                    theme === 'dark'
                      ? 'bg-[#151922] border-slate-800 hover:border-slate-700'
                      : 'bg-slate-100 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-[#00d09c]/20 text-[#00b386] dark:text-[#00d09c] font-black flex items-center justify-center text-xs border border-[#00d09c]/30">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                </button>

                {profileDropdownOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 border ${
                      theme === 'dark'
                        ? 'bg-[#151922] border-slate-800 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div
                      className={`px-4 py-2.5 border-b ${
                        theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
                      }`}
                    >
                      <p className="text-xs font-bold truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold text-[#00b386] dark:text-[#00d09c] bg-[#00d09c]/10 px-2 py-0.5 rounded-full border border-[#00d09c]/20">
                        Active Trading Account
                      </span>
                    </div>

                    <div className="py-1 text-xs font-medium">
                      <button
                        id="menu-item-profile"
                        onClick={() => handleNavClick('profile')}
                        className={`w-full px-4 py-2 text-left flex items-center gap-2.5 transition-colors ${
                          theme === 'dark'
                            ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                        }`}
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Profile & KYC</span>
                      </button>
                      <button
                        id="menu-item-pnl"
                        onClick={() => handleNavClick('pnl-sheet')}
                        className={`w-full px-4 py-2 text-left flex items-center gap-2.5 transition-colors ${
                          theme === 'dark'
                            ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                        }`}
                      >
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>Profit & Loss (P&L) Sheet</span>
                      </button>
                      <button
                        id="menu-item-transactions"
                        onClick={() => handleNavClick('transactions')}
                        className={`w-full px-4 py-2 text-left flex items-center gap-2.5 transition-colors ${
                          theme === 'dark'
                            ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                        }`}
                      >
                        <Activity className="w-4 h-4 text-sky-400" />
                        <span>Transaction Ledger & History</span>
                      </button>
                      <button
                        id="menu-item-commodities"
                        onClick={() => handleNavClick('commodities')}
                        className={`w-full px-4 py-2 text-left flex items-center gap-2.5 transition-colors ${
                          theme === 'dark'
                            ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                        }`}
                      >
                        <TrendingUp className="w-4 h-4 text-amber-400" />
                        <span>Gold & Silver Bullion</span>
                      </button>
                      <button
                        id="menu-item-bank-accounts"
                        onClick={() => handleNavClick('bank-accounts')}
                        className={`w-full px-4 py-2 text-left flex items-center gap-2.5 transition-colors ${
                          theme === 'dark'
                            ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                        }`}
                      >
                        <Shield className="w-4 h-4 text-slate-400" />
                        <span>Bank Accounts</span>
                      </button>
                      <button
                        id="menu-item-wallet"
                        onClick={() => handleNavClick('wallet')}
                        className={`w-full px-4 py-2 text-left flex items-center gap-2.5 transition-colors ${
                          theme === 'dark'
                            ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                        }`}
                      >
                        <Wallet className="w-4 h-4 text-slate-400" />
                        <span>Groww Balance & Wallet</span>
                      </button>
                      <button
                        id="menu-item-orders"
                        onClick={() => handleNavClick('orders')}
                        className={`w-full px-4 py-2 text-left flex items-center gap-2.5 transition-colors ${
                          theme === 'dark'
                            ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                        }`}
                      >
                        <Activity className="w-4 h-4 text-slate-400" />
                        <span>All Orders & History</span>
                      </button>
                      <button
                        id="menu-item-settings"
                        onClick={() => handleNavClick('settings')}
                        className={`w-full px-4 py-2 text-left flex items-center gap-2.5 transition-colors ${
                          theme === 'dark'
                            ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                        }`}
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Trading Settings</span>
                      </button>
                      <button
                        id="menu-item-terms"
                        onClick={() => handleNavClick('terms')}
                        className={`w-full px-4 py-2 text-left flex items-center gap-2.5 transition-colors ${
                          theme === 'dark'
                            ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                        }`}
                      >
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span>Terms & Regulatory Disclosures</span>
                      </button>
                      <button
                        id="menu-item-admin"
                        onClick={() => handleNavClick(isAdmin ? 'admin-dashboard' : 'admin-login')}
                        className={`w-full px-4 py-2 text-left flex items-center gap-2.5 text-amber-500 hover:bg-amber-500/10 border-t ${
                          theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
                        }`}
                      >
                        <Shield className="w-4 h-4 text-amber-500" />
                        <span>{isAdmin ? 'Admin Console (Dashboard)' : 'Admin Portal Login'}</span>
                      </button>
                    </div>

                    <div
                      className={`pt-1 border-t ${
                        theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
                      }`}
                    >
                      <button
                        id="menu-item-logout"
                        onClick={logout}
                        className="w-full px-4 py-2 text-left text-xs text-rose-500 hover:bg-rose-500/10 flex items-center gap-2.5 font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="nav-login-btn"
                onClick={() => handleNavClick('login')}
                className="px-4 py-2 text-xs font-black text-slate-950 bg-[#00d09c] hover:bg-[#00b386] rounded-xl transition-all shadow-md shadow-[#00d09c]/20 active:scale-95"
              >
                Login/Sign up
              </button>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl border transition-colors ${
              theme === 'dark'
                ? 'bg-[#151922] border-slate-800 text-slate-300'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-b px-4 py-4 space-y-3 ${
            theme === 'dark'
              ? 'bg-[#0c0f17] border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900 shadow-lg'
          }`}
        >
          {/* Mobile Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              id="mobile-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stocks (RELIANCE, TCS)..."
              className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00d09c] ${
                theme === 'dark'
                  ? 'bg-[#151922] border border-slate-800 text-white placeholder-slate-500'
                  : 'bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Mobile search results if any */}
          {searchQuery && (
            <div
              className={`rounded-xl border max-h-48 overflow-y-auto ${
                theme === 'dark'
                  ? 'bg-[#151922] border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              {filteredStocks.map((stk) => (
                <button
                  key={stk.symbol}
                  onClick={() => handleStockSelect(stk.symbol)}
                  className="w-full px-3 py-2 text-left flex items-center justify-between border-b last:border-0 border-slate-800/40 text-xs"
                >
                  <span className="font-bold">{stk.symbol}</span>
                  <span className="font-bold">{formatINR(stk.currentPrice)}</span>
                </button>
              ))}
            </div>
          )}

          {/* Mobile Quick Add Funds Button */}
          <button
            id="mobile-quick-add-btn"
            onClick={() => {
              setMobileMenuOpen(false);
              setQuickAddModalOpen(true);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#00d09c] hover:bg-[#00b386] text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm active:scale-98 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Add Funds (Instant UPI & NetBanking)</span>
          </button>

          {/* Mobile EV Energy Stock Button */}
          <button
            id="mobile-ev-energy-btn"
            onClick={() => handleNavClick('ev-energy-stock')}
            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer ${
              currentPage === 'ev-energy-stock'
                ? 'bg-gradient-to-r from-emerald-500/25 to-cyan-500/25 border-emerald-500 text-emerald-300 font-black shadow-md shadow-emerald-500/10'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 font-bold'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400 fill-current animate-pulse" />
              <span>EV Energy Stock (1-2h Slots)</span>
            </div>
            <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
              1h-2h
            </span>
          </button>

          {/* Mobile Indians Energy Button */}
          <button
            id="mobile-indians-energy-btn"
            onClick={() => handleNavClick('indians-energy')}
            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer ${
              currentPage === 'indians-energy'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-black'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20 font-bold'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 fill-current" />
              <span>Indians Energy (Plans &amp; Profit/Loss)</span>
            </div>
            <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
              New
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`p-2.5 rounded-xl border text-left ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleNavClick('markets')}
              className={`p-2.5 rounded-xl border text-left ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              Stocks
            </button>
            <button
              onClick={() => handleNavClick('commodities')}
              className={`p-2.5 rounded-xl border text-left text-amber-400 font-bold ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              Gold & Silver
            </button>
            <button
              onClick={() => handleNavClick('pnl-sheet')}
              className={`p-2.5 rounded-xl border text-left text-emerald-400 font-bold ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              P&L Sheet
            </button>
            <button
              onClick={() => handleNavClick('portfolio')}
              className={`p-2.5 rounded-xl border text-left ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              Portfolio
            </button>
            <button
              onClick={() => handleNavClick('orders')}
              className={`p-2.5 rounded-xl border text-left ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => handleNavClick('transactions')}
              className={`p-2.5 rounded-xl border text-left ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => handleNavClick('bank-accounts')}
              className={`p-2.5 rounded-xl border text-left ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              Bank Accounts
            </button>
            <button
              onClick={() => handleNavClick('wallet')}
              className={`p-2.5 rounded-xl border text-left ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              Virtual Wallet
            </button>
            <button
              onClick={() => handleNavClick('investment')}
              className={`p-2.5 rounded-xl border text-left text-[#00b386] dark:text-[#00d09c] ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              SIP Calculator
            </button>
            <button
              onClick={() => handleNavClick('terms')}
              className={`p-2.5 rounded-xl border text-left text-slate-500 col-span-2 ${
                theme === 'dark' ? 'bg-[#151922] border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              Legal & Disclosures
            </button>
            <button
              onClick={() => handleNavClick(isAdmin ? 'admin-dashboard' : 'admin-login')}
              className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left font-bold text-amber-500 col-span-2 flex items-center justify-between"
            >
              <span>{isAdmin ? 'Admin Console' : 'Admin Portal Login'}</span>
              <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded">
                Super Admin
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
