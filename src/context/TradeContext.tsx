import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserProfile,
  VirtualWallet,
  Stock,
  Order,
  PortfolioHolding,
  PortfolioSummary,
  Transaction,
  SimulatorSettings,
  MutualFundInvestment,
  IpoApplication,
  WatchlistGroup,
  PriceAlert,
  BankAccount,
  LiveIndexQuote,
  LiveMarketStatus
} from '../types';
import { api, authStorage } from '../services/api';

export type PageId =
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'markets'
  | 'stock-details'
  | 'index-details'
  | 'buy-sell'
  | 'portfolio'
  | 'orders'
  | 'transactions'
  | 'wallet'
  | 'deposit-learn'
  | 'withdraw-learn'
  | 'investment'
  | 'mutual-funds'
  | 'ipos'
  | 'etfs'
  | 'watchlists'
  | 'bank-accounts'
  | 'commodities'
  | 'pnl-sheet'
  | 'profile'
  | 'settings'
  | 'terms'
  | 'indians-energy'
  | 'ev-energy-stock'
  | 'admin-login'
  | 'admin-dashboard';

interface TradeContextType {
  user: User | null;
  profile: UserProfile | null;
  wallet: VirtualWallet | null;
  stocks: Stock[];
  selectedSymbol: string;
  selectedStock: Stock | null;
  selectedIndex: string;
  portfolio: { holdings: PortfolioHolding[]; summary: PortfolioSummary } | null;
  orders: Order[];
  transactions: Transaction[];
  settings: SimulatorSettings | null;
  currentPage: PageId;
  previousPriceMap: Record<string, number>;
  orderModal: { isOpen: boolean; stock: Stock | null; side: 'BUY' | 'SELL' };
  quickAddModalOpen: boolean;
  isLoading: boolean;
  error: string | null;
  theme: 'dark' | 'light';
  watchlist: string[];

  // Multiple Watchlists
  watchlistGroups: WatchlistGroup[];
  activeWatchlistId: string;
  setActiveWatchlistId: (id: string) => void;
  createWatchlistGroup: (name: string) => void;
  renameWatchlistGroup: (id: string, newName: string) => void;
  deleteWatchlistGroup: (id: string) => void;
  addStockToGroup: (groupId: string, symbol: string) => void;
  removeStockFromGroup: (groupId: string, symbol: string) => void;

  // Price Alerts
  priceAlerts: PriceAlert[];
  addPriceAlert: (symbol: string, targetPrice: number, condition: 'ABOVE' | 'BELOW', percentMovement?: number) => void;
  togglePriceAlert: (id: string) => void;
  deletePriceAlert: (id: string) => void;
  triggeredAlert: PriceAlert | null;
  dismissTriggeredAlert: () => void;

  // Bank Accounts
  bankAccounts: BankAccount[];
  addBankAccount: (account: Omit<BankAccount, 'id' | 'verifiedAt'>) => void;
  removeBankAccount: (id: string) => void;
  setPrimaryBankAccount: (id: string) => void;

  // Mutual Funds & IPO
  mutualFundInvestments: MutualFundInvestment[];
  investInMutualFund: (fund: any, amount: number, type: 'SIP' | 'LUMPSUM') => Promise<boolean>;
  ipoApplications: IpoApplication[];
  applyForIpo: (ipo: any, lots: number, bidPrice: number, upiId: string) => Promise<boolean>;

  // Actions
  navigateTo: (page: PageId, symbol?: string) => void;
  setSelectedSymbol: (symbol: string) => void;
  setSelectedIndex: (indexKey: string) => void;
  navigateToIndex: (indexKey: string) => void;
  openOrderModal: (stock: Stock, side: 'BUY' | 'SELL') => void;
  closeOrderModal: () => void;
  setQuickAddModalOpen: (open: boolean) => void;
  refreshData: () => Promise<void>;
  login: (token: string, user: User, profile: UserProfile, wallet: VirtualWallet) => void;
  logout: () => void;
  quickAddCash: (amount: number) => Promise<boolean>;
  clearError: () => void;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleWatchlist: (symbol: string) => void;

  // Real-Time Market API
  liveIndices: LiveIndexQuote[];
  liveMarketStatus: LiveMarketStatus | null;
  isAutoUpdating: boolean;
  toggleAutoUpdate: () => void;
  syncMarketNow: () => Promise<void>;

  // Admin Access Guard
  isAdmin: boolean;
  setAdminToken: (token: string | null) => void;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<VirtualWallet | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedSymbol, setSelectedSymbolState] = useState<string>('RELIANCE');
  const [selectedIndex, setSelectedIndexState] = useState<string>('nifty-50');
  const [portfolio, setPortfolio] = useState<{ holdings: PortfolioHolding[]; summary: PortfolioSummary } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<SimulatorSettings | null>(null);
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [previousPriceMap, setPreviousPriceMap] = useState<Record<string, number>>({});
  
  // Real-Time API state
  const [liveIndices, setLiveIndices] = useState<LiveIndexQuote[]>([
    {
      symbol: '^NSEI',
      name: 'NIFTY',
      value: 23118.60,
      previousClose: 23398.10,
      change: -279.50,
      changePercent: -1.19,
      dayHigh: 23415.20,
      dayLow: 23080.40,
      sparkline: [23398.1, 23350.4, 23290.0, 23210.5, 23160.0, 23105.2, 23118.6],
      lastUpdated: new Date().toISOString()
    },
    {
      symbol: '^BSESN',
      name: 'SENSEX',
      value: 74003.82,
      previousClose: 74781.76,
      change: -777.94,
      changePercent: -1.04,
      dayHigh: 74850.00,
      dayLow: 73910.15,
      sparkline: [74781.76, 74620.0, 74450.5, 74210.0, 74090.2, 73980.0, 74003.82],
      lastUpdated: new Date().toISOString()
    },
    {
      symbol: '^NSEBANK',
      name: 'BANKNIFTY',
      value: 55794.75,
      previousClose: 56606.55,
      change: -811.80,
      changePercent: -1.43,
      dayHigh: 56650.00,
      dayLow: 55680.20,
      sparkline: [56606.55, 56410.0, 56200.0, 55950.0, 55820.0, 55750.0, 55794.75],
      lastUpdated: new Date().toISOString()
    },
    {
      symbol: 'MIDCPNIFTY',
      name: 'MIDCPNIFTY',
      value: 14266.35,
      previousClose: 14584.55,
      change: -318.20,
      changePercent: -2.18,
      dayHigh: 14610.00,
      dayLow: 14220.00,
      sparkline: [14584.55, 14500.0, 14420.0, 14350.0, 14290.0, 14240.0, 14266.35],
      lastUpdated: new Date().toISOString()
    }
  ]);
  const [liveMarketStatus, setLiveMarketStatus] = useState<LiveMarketStatus | null>({
    connected: true,
    source: 'Yahoo Finance Free Real-Time Market API',
    lastSync: new Date().toISOString(),
    autoUpdate: true,
    intervalSeconds: 2.5,
    trackedIndices: 4,
    trackedStocks: 25
  });
  const [isAutoUpdating, setIsAutoUpdating] = useState<boolean>(true);
  const [orderModal, setOrderModal] = useState<{ isOpen: boolean; stock: Stock | null; side: 'BUY' | 'SELL' }>({
    isOpen: false,
    stock: null,
    side: 'BUY'
  });
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin access state (Strictly hidden for normal users)
  const [adminToken, setAdminTokenState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('tradex_admin_token');
    } catch {
      return null;
    }
  });

  const setAdminToken = useCallback((token: string | null) => {
    setAdminTokenState(token);
    try {
      if (token) {
        localStorage.setItem('tradex_admin_token', token);
      } else {
        localStorage.removeItem('tradex_admin_token');
      }
    } catch {}
  }, []);

  const isAdmin = Boolean((user && user.role === 'admin') || adminToken);

  // Theme support (Groww default is light)
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('groww_theme');
      return (saved === 'light' || saved === 'dark') ? saved : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('groww_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((t: 'dark' | 'light') => {
    setThemeState(t);
  }, []);

  // Watchlist support (single legacy list kept in sync with active group)
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('groww_watchlist');
      return saved ? JSON.parse(saved) : ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'];
    } catch {
      return ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'];
    }
  });

  // Multiple Watchlists
  const [watchlistGroups, setWatchlistGroups] = useState<WatchlistGroup[]>(() => {
    try {
      const saved = localStorage.getItem('groww_watchlist_groups');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'wl-1', name: 'Primary Watchlist', symbols: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'], isDefault: true },
      { id: 'wl-2', name: 'Banking & Finance', symbols: ['HDFCBANK', 'ICICIBANK', 'SBIN', 'KOTAKBANK', 'BAJFINANCE'] },
      { id: 'wl-3', name: 'Tech & High Growth', symbols: ['TCS', 'INFY', 'WIPRO', 'HCLTECH', 'TATATECH'] }
    ];
  });
  const [activeWatchlistId, setActiveWatchlistId] = useState<string>('wl-1');

  useEffect(() => {
    try {
      localStorage.setItem('groww_watchlist_groups', JSON.stringify(watchlistGroups));
    } catch {}
    const active = watchlistGroups.find((g) => g.id === activeWatchlistId);
    if (active) {
      setWatchlist(active.symbols);
      try {
        localStorage.setItem('groww_watchlist', JSON.stringify(active.symbols));
      } catch {}
    }
  }, [watchlistGroups, activeWatchlistId]);

  const createWatchlistGroup = useCallback((name: string) => {
    const newGroup: WatchlistGroup = {
      id: 'wl-' + Date.now(),
      name: name.trim() || 'My Watchlist',
      symbols: []
    };
    setWatchlistGroups((prev) => [...prev, newGroup]);
    setActiveWatchlistId(newGroup.id);
  }, []);

  const renameWatchlistGroup = useCallback((id: string, newName: string) => {
    setWatchlistGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, name: newName.trim() || g.name } : g))
    );
  }, []);

  const deleteWatchlistGroup = useCallback((id: string) => {
    setWatchlistGroups((prev) => {
      if (prev.length <= 1) return prev;
      const filtered = prev.filter((g) => g.id !== id);
      return filtered;
    });
    setActiveWatchlistId((prevId) => (prevId === id ? 'wl-1' : prevId));
  }, []);

  const addStockToGroup = useCallback((groupId: string, symbol: string) => {
    const sym = symbol.toUpperCase();
    setWatchlistGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId && !g.symbols.includes(sym)) {
          return { ...g, symbols: [...g.symbols, sym] };
        }
        return g;
      })
    );
  }, []);

  const removeStockFromGroup = useCallback((groupId: string, symbol: string) => {
    const sym = symbol.toUpperCase();
    setWatchlistGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return { ...g, symbols: g.symbols.filter((s) => s !== sym) };
        }
        return g;
      })
    );
  }, []);

  const toggleWatchlist = useCallback((symbol: string) => {
    const sym = symbol.toUpperCase();
    setWatchlistGroups((prev) =>
      prev.map((g) => {
        if (g.id === activeWatchlistId) {
          const has = g.symbols.includes(sym);
          const nextSymbols = has ? g.symbols.filter((s) => s !== sym) : [...g.symbols, sym];
          return { ...g, symbols: nextSymbols };
        }
        return g;
      })
    );
  }, [activeWatchlistId]);

  // Price Alerts
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('groww_price_alerts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'alert-1',
        symbol: 'RELIANCE',
        stockName: 'Reliance Industries Ltd',
        targetPrice: 3000,
        condition: 'ABOVE',
        enabled: true,
        triggered: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'alert-2',
        symbol: 'HDFCBANK',
        stockName: 'HDFC Bank Ltd',
        targetPrice: 1650,
        condition: 'ABOVE',
        enabled: true,
        triggered: false,
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [triggeredAlert, setTriggeredAlert] = useState<PriceAlert | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('groww_price_alerts', JSON.stringify(priceAlerts));
    } catch {}
  }, [priceAlerts]);

  const addPriceAlert = useCallback(
    (symbol: string, targetPrice: number, condition: 'ABOVE' | 'BELOW', percentMovement?: number) => {
      const foundStock = stocks.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
      const newAlert: PriceAlert = {
        id: 'alert-' + Date.now(),
        symbol: symbol.toUpperCase(),
        stockName: foundStock ? foundStock.name : symbol.toUpperCase(),
        targetPrice,
        condition,
        percentMovement,
        enabled: true,
        triggered: false,
        createdAt: new Date().toISOString()
      };
      setPriceAlerts((prev) => [newAlert, ...prev]);
    },
    [stocks]
  );

  const togglePriceAlert = useCallback((id: string) => {
    setPriceAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  }, []);

  const deletePriceAlert = useCallback((id: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const dismissTriggeredAlert = useCallback(() => {
    setTriggeredAlert(null);
  }, []);

  // Bank Accounts
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    try {
      const saved = localStorage.getItem('groww_bank_accounts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'bank-1',
        accountHolderName: 'Arjun Mehta',
        bankName: 'HDFC Bank',
        accountNumberMasked: '•••• •••• 4912',
        ifsc: 'HDFC0000128',
        accountType: 'Savings',
        isPrimary: true,
        verifiedAt: new Date(Date.now() - 86400000 * 30).toISOString()
      },
      {
        id: 'bank-2',
        accountHolderName: 'Arjun Mehta',
        bankName: 'State Bank of India',
        accountNumberMasked: '•••• •••• 8821',
        ifsc: 'SBIN0001423',
        accountType: 'Savings',
        isPrimary: false,
        verifiedAt: new Date(Date.now() - 86400000 * 15).toISOString()
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('groww_bank_accounts', JSON.stringify(bankAccounts));
    } catch {}
  }, [bankAccounts]);

  const addBankAccount = useCallback((acc: Omit<BankAccount, 'id' | 'verifiedAt'>) => {
    const newAcc: BankAccount = {
      ...acc,
      id: 'bank-' + Date.now(),
      verifiedAt: new Date().toISOString()
    };
    setBankAccounts((prev) => {
      if (newAcc.isPrimary) {
        return [newAcc, ...prev.map((a) => ({ ...a, isPrimary: false }))];
      }
      return [newAcc, ...prev];
    });
  }, []);

  const removeBankAccount = useCallback((id: string) => {
    setBankAccounts((prev) => {
      const remaining = prev.filter((a) => a.id !== id);
      if (remaining.length > 0 && !remaining.some((a) => a.isPrimary)) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
  }, []);

  const setPrimaryBankAccount = useCallback((id: string) => {
    setBankAccounts((prev) =>
      prev.map((a) => ({ ...a, isPrimary: a.id === id }))
    );
  }, []);

  // Mutual Fund Investments
  const [mutualFundInvestments, setMutualFundInvestments] = useState<MutualFundInvestment[]>(() => {
    try {
      const saved = localStorage.getItem('groww_mf_investments');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'mfi-1',
        fundId: 'mf-1',
        fundName: 'Parag Parikh Flexi Cap Fund Direct-Growth',
        category: 'Flexi Cap',
        investmentType: 'SIP',
        monthlyAmount: 5000,
        totalInvested: 25000,
        currentValue: 28450,
        unitsAllocated: 337.40,
        navAtPurchase: 74.10,
        currentNav: 84.32,
        unrealizedPnL: 3450,
        unrealizedPnLPercent: 13.8,
        purchaseDate: new Date(Date.now() - 86400000 * 90).toISOString(),
        nextSipDate: '5th of next month'
      },
      {
        id: 'mfi-2',
        fundId: 'mf-2',
        fundName: 'Quant Small Cap Fund Direct Plan-Growth',
        category: 'Small Cap',
        investmentType: 'LUMPSUM',
        totalInvested: 20000,
        currentValue: 23680,
        unitsAllocated: 88.21,
        navAtPurchase: 226.70,
        currentNav: 268.45,
        unrealizedPnL: 3680,
        unrealizedPnLPercent: 18.4,
        purchaseDate: new Date(Date.now() - 86400000 * 60).toISOString()
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('groww_mf_investments', JSON.stringify(mutualFundInvestments));
    } catch {}
  }, [mutualFundInvestments]);

  const investInMutualFund = useCallback(
    async (fund: any, amount: number, type: 'SIP' | 'LUMPSUM'): Promise<boolean> => {
      if (!wallet || wallet.balance < amount) return false;
      const units = Number((amount / fund.nav).toFixed(3));
      const newInv: MutualFundInvestment = {
        id: 'mfi-' + Date.now(),
        fundId: fund.id,
        fundName: fund.name,
        category: fund.category,
        investmentType: type,
        monthlyAmount: type === 'SIP' ? amount : undefined,
        totalInvested: amount,
        currentValue: amount,
        unitsAllocated: units,
        navAtPurchase: fund.nav,
        currentNav: fund.nav,
        unrealizedPnL: 0,
        unrealizedPnLPercent: 0,
        purchaseDate: new Date().toISOString(),
        nextSipDate: type === 'SIP' ? '5th of next month' : undefined
      };

      setMutualFundInvestments((prev) => [newInv, ...prev]);
      // Deduct from wallet
      setWallet((prev) => (prev ? { ...prev, balance: Math.max(0, prev.balance - amount) } : prev));
      return true;
    },
    [wallet]
  );

  // IPO Applications
  const [ipoApplications, setIpoApplications] = useState<IpoApplication[]>(() => {
    try {
      const saved = localStorage.getItem('groww_ipo_apps');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'ipo-app-1',
        ipoId: 'ipo-1',
        companyName: 'Swiggy Limited',
        symbol: 'SWIGGY',
        lots: 1,
        sharesCount: 38,
        bidPrice: 390,
        totalAmount: 14820,
        upiId: 'arjun@oksbi',
        status: 'MANDATE_APPROVED',
        appliedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        allotmentDate: '11 Nov 2024'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('groww_ipo_apps', JSON.stringify(ipoApplications));
    } catch {}
  }, [ipoApplications]);

  const applyForIpo = useCallback(
    async (ipo: any, lots: number, bidPrice: number, upiId: string): Promise<boolean> => {
      const totalAmount = lots * ipo.lotSize * bidPrice;
      if (!wallet || wallet.balance < totalAmount) return false;

      const newApp: IpoApplication = {
        id: 'ipo-app-' + Date.now(),
        ipoId: ipo.id,
        companyName: ipo.companyName,
        symbol: ipo.symbol,
        lots,
        sharesCount: lots * ipo.lotSize,
        bidPrice,
        totalAmount,
        upiId,
        status: 'MANDATE_APPROVED',
        appliedAt: new Date().toISOString(),
        allotmentDate: ipo.allotmentDate
      };

      setIpoApplications((prev) => [newApp, ...prev]);
      // Block/reserve amount
      setWallet((prev) =>
        prev
          ? {
              ...prev,
              balance: Math.max(0, prev.balance - totalAmount),
              reservedBalance: (prev.reservedBalance || 0) + totalAmount
            }
          : prev
      );
      return true;
    },
    [wallet]
  );


  // Set selected symbol helper
  const setSelectedSymbol = useCallback((symbol: string) => {
    setSelectedSymbolState(symbol.toUpperCase());
  }, []);

  // Set selected index helper
  const setSelectedIndex = useCallback((indexKey: string) => {
    setSelectedIndexState(indexKey);
  }, []);

  // Navigation router helper
  const navigateTo = useCallback((page: PageId, symbol?: string) => {
    if (symbol) {
      setSelectedSymbolState(symbol.toUpperCase());
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToIndex = useCallback((indexKey: string) => {
    setSelectedIndexState(indexKey);
    setCurrentPage('index-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openOrderModal = useCallback((stock: Stock, side: 'BUY' | 'SELL') => {
    setOrderModal({ isOpen: true, stock, side });
  }, []);

  const closeOrderModal = useCallback(() => {
    setOrderModal({ isOpen: false, stock: null, side: 'BUY' });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // Fetch real-time market feed (public)
  const fetchMarketData = useCallback(async () => {
    try {
      const feed = await api.getLiveMarketFeed();
      if (feed.indices && feed.indices.length > 0) {
        setLiveIndices(feed.indices);
      }
      if (feed.status) {
        setLiveMarketStatus(feed.status);
      }
      if (feed.stocks && feed.stocks.length > 0) {
        setStocks((prev) => {
          // Track price jumps for green/red flash
          const priceMap: Record<string, number> = {};
          prev.forEach((s) => {
            priceMap[s.symbol] = s.currentPrice;
          });
          setPreviousPriceMap(priceMap);

          // Check price alerts
          feed.stocks.forEach((st: Stock) => {
            priceAlerts.forEach((alert) => {
              if (alert.enabled && !alert.triggered && alert.symbol === st.symbol) {
                const hit =
                  (alert.condition === 'ABOVE' && st.currentPrice >= alert.targetPrice) ||
                  (alert.condition === 'BELOW' && st.currentPrice <= alert.targetPrice);
                if (hit) {
                  setTriggeredAlert(alert);
                  setPriceAlerts((prevA) =>
                    prevA.map((a) => (a.id === alert.id ? { ...a, triggered: true } : a))
                  );
                }
              }
            });
          });

          return feed.stocks;
        });
      }
    } catch (err: any) {
      console.warn('Failed to fetch live market data feed:', err);
    }
  }, [priceAlerts]);

  const syncMarketNow = useCallback(async () => {
    try {
      const res = await api.syncMarketNow();
      if (res.indices) setLiveIndices(res.indices);
      if (res.stocks) setStocks(res.stocks);
      if (res.status) setLiveMarketStatus(res.status);
    } catch (err) {
      console.error('Manual sync failed:', err);
    }
  }, []);

  const toggleAutoUpdate = useCallback(() => {
    setIsAutoUpdating((prev) => !prev);
  }, []);

  // Fetch authenticated user data (wallet, portfolio, orders, transactions)
  const fetchUserData = useCallback(async () => {
    if (!authStorage.getToken()) return;
    try {
      const [walletRes, portfolioRes, ordersRes, txRes] = await Promise.all([
        api.getWallet(),
        api.getPortfolio(),
        api.getOrders(),
        api.getTransactions()
      ]);
      setWallet(walletRes.wallet);
      setPortfolio(portfolioRes);
      setOrders(ordersRes.orders);
      setTransactions(txRes.transactions);
    } catch (err: any) {
      console.warn('Failed to fetch user data:', err);
      if (err.message && (err.message.includes('expired') || err.message.includes('required'))) {
        authStorage.clearToken();
        setUser(null);
      }
    }
  }, []);

  // Combined refresh
  const refreshData = useCallback(async () => {
    await Promise.all([fetchMarketData(), fetchUserData()]);
  }, [fetchMarketData, fetchUserData]);

  // Initial Auth Check
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchMarketData();

      const token = authStorage.getToken();
      if (token) {
        try {
          const me = await api.getMe();
          setUser(me.user);
          setProfile(me.profile);
          setWallet(me.wallet);
          await fetchUserData();
        } catch {
          authStorage.clearToken();
          try {
            const demo = await api.demoLogin();
            authStorage.setToken(demo.token);
            setUser(demo.user);
            setProfile(demo.profile);
            setWallet(demo.wallet);
            await fetchUserData();
          } catch {}
        }
      } else {
        try {
          const demo = await api.demoLogin();
          authStorage.setToken(demo.token);
          setUser(demo.user);
          setProfile(demo.profile);
          setWallet(demo.wallet);
          await fetchUserData();
        } catch (e) {
          console.warn('Demo session auto-init:', e);
        }
      }
      setIsLoading(false);
    };

    init();
  }, [fetchMarketData, fetchUserData]);

  // Periodic polling for real-time market ticks & live quotes (every 2.5s)
  useEffect(() => {
    if (!isAutoUpdating) return;
    const interval = setInterval(() => {
      fetchMarketData();
      if (authStorage.getToken()) {
        fetchUserData();
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [isAutoUpdating, fetchMarketData, fetchUserData]);

  const login = useCallback(
    (token: string, loggedUser: User, loggedProfile: UserProfile, loggedWallet: VirtualWallet) => {
      authStorage.setToken(token);
      setUser(loggedUser);
      setProfile(loggedProfile);
      setWallet(loggedWallet);
      fetchUserData();
      setCurrentPage('dashboard');
    },
    [fetchUserData]
  );

  const logout = useCallback(() => {
    authStorage.clearToken();
    try {
      localStorage.removeItem('tradex_admin_token');
    } catch {}
    setAdminTokenState(null);
    setUser(null);
    setProfile(null);
    setWallet(null);
    setPortfolio(null);
    setOrders([]);
    setTransactions([]);
    setCurrentPage('landing');
  }, []);

  const quickAddCash = useCallback(
    async (amount: number) => {
      try {
        const res = await api.quickAddCash(amount);
        setWallet(res.wallet);
        await fetchUserData();
        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to add funds');
        return false;
      }
    },
    [fetchUserData]
  );

  const selectedStock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0] || null;

  return (
    <TradeContext.Provider
      value={{
        user,
        profile,
        wallet,
        stocks,
        selectedSymbol,
        selectedStock,
        selectedIndex,
        portfolio,
        orders,
        transactions,
        settings,
        currentPage,
        previousPriceMap,
        orderModal,
        quickAddModalOpen,
        isLoading,
        error,
        navigateTo,
        setSelectedSymbol,
        setSelectedIndex,
        navigateToIndex,
        openOrderModal,
        closeOrderModal,
        setQuickAddModalOpen,
        refreshData,
        login,
        logout,
        quickAddCash,
        clearError,
        theme,
        toggleTheme,
        setTheme,
        watchlist,
        toggleWatchlist,
        watchlistGroups,
        activeWatchlistId,
        setActiveWatchlistId,
        createWatchlistGroup,
        renameWatchlistGroup,
        deleteWatchlistGroup,
        addStockToGroup,
        removeStockFromGroup,
        priceAlerts,
        addPriceAlert,
        togglePriceAlert,
        deletePriceAlert,
        triggeredAlert,
        dismissTriggeredAlert,
        bankAccounts,
        addBankAccount,
        removeBankAccount,
        setPrimaryBankAccount,
        mutualFundInvestments,
        investInMutualFund,
        ipoApplications,
        applyForIpo,
        liveIndices,
        liveMarketStatus,
        isAutoUpdating,
        toggleAutoUpdate,
        syncMarketNow,
        isAdmin,
        setAdminToken
      }}
    >
      {children}
    </TradeContext.Provider>
  );
};

export const useTrade = () => {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error('useTrade must be used within a TradeProvider');
  }
  return context;
};
