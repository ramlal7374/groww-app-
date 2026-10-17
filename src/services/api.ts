import {
  User,
  UserProfile,
  VirtualWallet,
  Stock,
  Order,
  PortfolioHolding,
  PortfolioSummary,
  Transaction,
  VirtualDeposit,
  VirtualWithdrawal,
  SimulatorSettings,
  AdminStats,
  StockHistory,
  LiveIndexQuote,
  LiveMarketStatus,
  AdminUserHolding,
  AdminUserDetails,
  StockBias,
  EvEnergySlot,
  EvEnergyConfig
} from '../types';

const TOKEN_KEY = 'tradex_auth_token';
const ADMIN_TOKEN_KEY = 'tradex_admin_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  getAdminToken: () => localStorage.getItem(ADMIN_TOKEN_KEY),
  setAdminToken: (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token),
  clearAdminToken: () => localStorage.removeItem(ADMIN_TOKEN_KEY)
};

async function fetchJson<T>(url: string, options: RequestInit = {}, isAdmin: boolean = false): Promise<T> {
  const token = isAdmin ? authStorage.getAdminToken() : authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Network error occurred');
  }

  return data;
}

export const api = {
  // Auth
  register: (payload: { email: string; password: string; name: string; phone?: string }) =>
    fetchJson<{ message: string; user: User; token: string; profile: UserProfile; wallet: VirtualWallet }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  login: (payload: { email: string; password: string }) =>
    fetchJson<{ message: string; user: User; token: string; profile: UserProfile; wallet: VirtualWallet }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  demoLogin: () =>
    fetchJson<{ message: string; user: User; token: string; profile: UserProfile; wallet: VirtualWallet }>('/api/auth/demo-login', {
      method: 'POST'
    }),

  forgotPassword: (email: string) =>
    fetchJson<{ message: string; simulatedCode: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  resetPassword: (payload: { email: string; code: string; newPassword: string }) =>
    fetchJson<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMe: () =>
    fetchJson<{ user: User; profile: UserProfile; wallet: VirtualWallet }>('/api/auth/me'),

  updateProfile: (profile: Partial<UserProfile>) =>
    fetchJson<{ profile: UserProfile }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    }),

  // Stocks & Real-Time Market
  getStocks: () =>
    fetchJson<{ stocks: Stock[]; settings: SimulatorSettings }>('/api/stocks'),

  getStock: (symbol: string) =>
    fetchJson<{ stock: Stock }>(`/api/stocks/${symbol}`),

  getStockHistory: (symbol: string, timeframe: StockHistory['timeframe']) =>
    fetchJson<StockHistory>(`/api/stocks/${symbol}/history?timeframe=${timeframe}`),

  getLiveIndices: () =>
    fetchJson<{ indices: LiveIndexQuote[] }>('/api/market/indices'),

  getLiveMarketFeed: () =>
    fetchJson<{ indices: LiveIndexQuote[]; stocks: Stock[]; status: LiveMarketStatus }>('/api/market/live-feed'),

  syncMarketNow: () =>
    fetchJson<{ success: boolean; indices: LiveIndexQuote[]; stocks: Stock[]; status: LiveMarketStatus }>('/api/market/sync-now', {
      method: 'POST'
    }),

  getMarketStatus: () =>
    fetchJson<LiveMarketStatus>('/api/market/status'),

  // Wallet
  getWallet: () =>
    fetchJson<{ wallet: VirtualWallet }>('/api/wallet'),

  quickAddCash: (amount: number) =>
    fetchJson<{ message: string; wallet: VirtualWallet; deposit: VirtualDeposit }>('/api/wallet/quick-add', {
      method: 'POST',
      body: JSON.stringify({ amount })
    }),

  depositVirtualCash: (payload: { amount: number; method: string }) =>
    fetchJson<{ message: string; wallet: VirtualWallet; deposit: VirtualDeposit }>('/api/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  withdrawVirtualCash: (payload: { amount: number; simulatedBankName: string; simulatedAccountMask: string }) =>
    fetchJson<{ message: string; wallet: VirtualWallet; withdrawal: VirtualWithdrawal }>('/api/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  simulateDividend: (payload: { symbol?: string; amountPerShare?: number }) =>
    fetchJson<{ message: string; wallet: VirtualWallet; transaction: Transaction }>('/api/wallet/simulate-dividend', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Trading & Orders
  getOrders: () =>
    fetchJson<{ orders: Order[] }>('/api/orders'),

  placeOrder: (payload: {
    symbol: string;
    side: 'BUY' | 'SELL';
    orderType: 'MARKET' | 'LIMIT';
    quantity: number;
    limitPrice?: number;
  }) =>
    fetchJson<{ message: string; order: Order; wallet: VirtualWallet }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  cancelOrder: (orderId: string) =>
    fetchJson<{ message: string; wallet: VirtualWallet }>(`/api/orders/${orderId}/cancel`, {
      method: 'POST'
    }),

  // Portfolio
  getPortfolio: () =>
    fetchJson<{ holdings: PortfolioHolding[]; summary: PortfolioSummary }>('/api/portfolio'),

  getTransactions: () =>
    fetchJson<{ transactions: Transaction[] }>('/api/transactions'),

  getCommunityTransactions: () =>
    fetchJson<{ transactions: Transaction[]; total: number }>('/api/community/transactions'),

  resetAccount: () =>
    fetchJson<{ message: string; wallet: VirtualWallet }>('/api/wallet/reset', {
      method: 'POST'
    }),

  getSimulatorStatus: () =>
    fetchJson<{ settings: SimulatorSettings; serverTime: string; disclosure: string }>('/api/simulator/status'),

  // Admin
  adminLogin: (payload: { username: string; password: string }) =>
    fetchJson<{ message: string; token: string; admin: any }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  adminGetStats: () =>
    fetchJson<{ stats: AdminStats }>('/api/admin/stats', {}, true),

  adminGetUsers: () =>
    fetchJson<{ users: AdminUserDetails[] }>('/api/admin/users', {}, true),

  adminSetUserBalance: (userId: string, newBalance: number) =>
    fetchJson<{ message: string; wallet: VirtualWallet }>(`/api/admin/users/${userId}/balance`, {
      method: 'POST',
      body: JSON.stringify({ newBalance })
    }, true),

  adminEditUserHolding: (userId: string, data: { symbol: string; quantity: number; averageBuyPrice: number }) =>
    fetchJson<{ success: boolean; message: string; holdings: PortfolioHolding[] }>(`/api/admin/users/${userId}/holding`, {
      method: 'POST',
      body: JSON.stringify(data)
    }, true),

  adminDeleteUserHolding: (userId: string, symbol: string) =>
    fetchJson<{ success: boolean; message: string; holdings: PortfolioHolding[] }>(`/api/admin/users/${userId}/holding/${symbol}`, {
      method: 'DELETE'
    }, true),

  adminInjectUserPnL: (userId: string, data: { amount: number; type: 'PROFIT' | 'LOSS'; reason?: string }) =>
    fetchJson<{ success: boolean; wallet: VirtualWallet; message: string }>(`/api/admin/users/${userId}/inject-pnl`, {
      method: 'POST',
      body: JSON.stringify(data)
    }, true),

  adminChangePassword: (data: { currentPassword: string; newPassword: string }) =>
    fetchJson<{ success: boolean; message: string }>('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    }, true),

  adminGetStocks: () =>
    fetchJson<{ stocks: Stock[] }>('/api/admin/stocks', {}, true),

  adminGetHoldings: () =>
    fetchJson<{ holdings: AdminUserHolding[] }>('/api/admin/holdings', {}, true),

  adminManipulateHoldingPnL: (payload: {
    userId?: string;
    symbol: string;
    mode: 'TARGET_PNL_PERCENT' | 'TARGET_PNL_AMOUNT' | 'EXACT_PRICE' | 'SET_BIAS' | 'RESET';
    targetPercent?: number;
    targetAmount?: number;
    exactPrice?: number;
    targetBias?: StockBias;
    lockPrice?: boolean;
    biasSpeed?: number;
  }) =>
    fetchJson<{ message: string; stock: Stock; calculatedPrice?: number }>('/api/admin/manipulate-holding', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, true),

  adminResetStock: (symbol: string) =>
    fetchJson<{ message: string; stock: Stock }>(`/api/admin/reset-stock/${symbol}`, {
      method: 'POST'
    }, true),

  adminUpdateStock: (symbol: string, updates: Partial<Stock>) =>
    fetchJson<{ message: string; stock: Stock }>(`/api/admin/stocks/${symbol}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }, true),

  adminTriggerTick: () =>
    fetchJson<{ message: string; settings: SimulatorSettings }>('/api/admin/tick', {
      method: 'POST'
    }, true),

  adminAddStock: (stock: Omit<Stock, 'id' | 'historicalTrend'>) =>
    fetchJson<{ message: string; stock: Stock }>('/api/admin/stocks', {
      method: 'POST',
      body: JSON.stringify(stock)
    }, true),

  adminGetOrders: () =>
    fetchJson<{ orders: Order[] }>('/api/admin/orders', {}, true),

  adminGetTransactions: () =>
    fetchJson<{ transactions: Transaction[] }>('/api/admin/transactions', {}, true),

  adminGetDeposits: () =>
    fetchJson<{ deposits: VirtualDeposit[] }>('/api/admin/deposits', {}, true),

  adminGetWithdrawals: () =>
    fetchJson<{ withdrawals: VirtualWithdrawal[] }>('/api/admin/withdrawals', {}, true),

  adminGetSettings: () =>
    fetchJson<{ settings: SimulatorSettings }>('/api/admin/settings', {}, true),

  adminUpdateSettings: (settings: Partial<SimulatorSettings>) =>
    fetchJson<{ message: string; settings: SimulatorSettings }>('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    }, true),

  // EV Energy Stock Client & Admin API
  getEvEnergySlots: () =>
    fetchJson<{ slots: EvEnergySlot[]; config: EvEnergyConfig; serverTime: string }>('/api/ev-energy/slots'),

  bookEvEnergySlot: (tierPrice: number, durationHours: number, sharesQuantity?: number) =>
    fetchJson<{ message: string; slot: EvEnergySlot; wallet: VirtualWallet }>('/api/ev-energy/book-slot', {
      method: 'POST',
      body: JSON.stringify({ tierPrice, durationHours, sharesQuantity: sharesQuantity || 1 })
    }),

  settleEvEnergySlot: (slotId: string) =>
    fetchJson<{ message: string; slot: EvEnergySlot; result: 'WIN' | 'LOSS'; payout: number; wallet: VirtualWallet }>(
      `/api/ev-energy/settle-slot/${slotId}`,
      { method: 'POST' }
    ),

  adminGetEvEnergySlots: () =>
    fetchJson<{ slots: EvEnergySlot[]; config: EvEnergyConfig; serverTime: string }>('/api/admin/ev-energy/slots', {}, true),

  adminGetEvEnergyConfig: () =>
    fetchJson<{ config: EvEnergyConfig }>('/api/admin/ev-energy/config', {}, true),

  adminUpdateEvEnergyConfig: (config: Partial<EvEnergyConfig>) =>
    fetchJson<{ message: string; config: EvEnergyConfig }>('/api/admin/ev-energy/config', {
      method: 'POST',
      body: JSON.stringify(config)
    }, true),

  adminSetEvEnergySlotOutcome: (
    slotId: string,
    data: {
      adminOutcome?: 'FORCE_WIN' | 'FORCE_LOSS' | 'PENDING';
      profitAmount?: number;
      lossAmount?: number;
      notes?: string;
    }
  ) =>
    fetchJson<{ message: string; slot: EvEnergySlot }>(`/api/admin/ev-energy/slot/${slotId}/set-outcome`, {
      method: 'POST',
      body: JSON.stringify(data)
    }, true),

  adminForceSettleEvEnergySlot: (slotId: string, forceOutcome: 'FORCE_WIN' | 'FORCE_LOSS') =>
    fetchJson<{ message: string; slot: EvEnergySlot; result: 'WIN' | 'LOSS'; payout: number }>(
      `/api/admin/ev-energy/slot/${slotId}/settle-now`,
      {
        method: 'POST',
        body: JSON.stringify({ forceOutcome })
      },
      true
    )
};

// Currency & formatting helpers
export function formatINR(val: number, withDecimals: boolean = true): string {
  if (isNaN(val)) return '₹0.00';
  const parts = Math.abs(val).toFixed(withDecimals ? 2 : 0).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] ? `.${parts[1]}` : '';

  // Indian numbering format: 12,34,567
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  const sign = val < 0 ? '-' : '';
  return `${sign}₹${formattedInteger}${decimalPart}`;
}

export function formatPercent(val: number): string {
  if (isNaN(val)) return '+0.00%';
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(2)}%`;
}
