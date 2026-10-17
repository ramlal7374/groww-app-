export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  avatarUrl?: string;
  tradingExperience: 'beginner' | 'intermediate' | 'advanced';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  preferredCurrency: 'INR' | 'USD';
  notificationsEnabled: boolean;
  theme: 'dark' | 'light';
}

export interface VirtualWallet {
  userId: string;
  balance: number;
  reservedBalance: number; // for pending limit orders
  totalDeposited: number;
  totalWithdrawn: number;
  currency: string;
  realizedPnL?: number;
}

export type StockBias = 'NONE' | 'PUMP' | 'DUMP' | 'UPPER_CIRCUIT' | 'LOWER_CIRCUIT';

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE' | 'NASDAQ';
  sector: string;
  currentPrice: number;
  previousClose: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number; // in Cr or B
  peRatio: number;
  beta: number;
  week52High: number;
  week52Low: number;
  description: string;
  historicalTrend: number[]; // mini sparkline for cards
  // Admin simulated price movement & control fields
  priceOverrideLocked?: boolean;
  targetBias?: StockBias;
  biasSpeed?: number;
  adminControlled?: boolean;
}

export interface AdminUserHolding {
  userId: string;
  userName: string;
  userEmail: string;
  holdingId: string;
  stockId: string;
  symbol: string;
  stockName: string;
  sector: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  priceOverrideLocked?: boolean;
  targetBias?: StockBias;
}

export interface AdminUserDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  simulatedWallet: {
    balance: number;
    reservedBalance: number;
    totalDeposited: number;
    totalWithdrawn: number;
    realizedPnL?: number;
    currency: string;
  };
  simulatedInvestment: {
    totalInvested: number;
    currentPortfolioValue: number;
    totalNetWorth: number;
  };
  simulatedPnL: {
    unrealizedPnL: number;
    unrealizedPnLPercent: number;
    realizedPnL: number;
    netPnL: number;
    netPnLPercent: number;
  };
  holdings: Array<{
    id: string;
    symbol: string;
    stockName?: string;
    name?: string;
    sector?: string;
    quantity: number;
    averageBuyPrice: number;
    currentPrice: number;
    investedValue: number;
    currentValue: number;
    unrealizedPnL: number;
    unrealizedPnLPercent: number;
    priceOverrideLocked?: boolean;
    targetBias?: StockBias;
  }>;
  transactionHistory: {
    orders: Order[];
    deposits: VirtualDeposit[];
    withdrawals: VirtualWithdrawal[];
    transactions: Transaction[];
  };
}

export interface LiveIndexQuote {
  symbol: string;
  name: string;
  value: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  sparkline: number[];
  lastUpdated: string;
}

export interface LiveMarketStatus {
  connected: boolean;
  source: string;
  lastSync: string;
  autoUpdate: boolean;
  intervalSeconds: number;
  trackedIndices: number;
  trackedStocks: number;
}

export interface PricePoint {
  time: string;
  price: number;
  volume: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

export interface StockHistory {
  symbol: string;
  timeframe: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX' | 'ALL';
  points: PricePoint[];
}

export type OrderType = 'MARKET' | 'LIMIT';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'EXECUTED' | 'PENDING' | 'CANCELLED' | 'REJECTED';

export interface Order {
  id: string;
  userId: string;
  stockId: string;
  symbol: string;
  stockName: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  price: number; // limit price or executed price
  executedPrice?: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  executedAt?: string;
}

export interface PortfolioHolding {
  id: string;
  userId: string;
  stockId: string;
  symbol: string;
  stockName: string;
  sector: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  oneDayPnL: number;
  oneDayPnLPercent: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  unrealizedPnL?: number;
  realizedPnL?: number;
  oneDayPnL: number;
  oneDayPnLPercent: number;
  holdingsCount: number;
  availableVirtualCash: number;
}

export interface Portfolio {
  holdings: PortfolioHolding[];
  summary: PortfolioSummary;
}

export type TransactionType =
  | 'BUY_ORDER'
  | 'SELL_ORDER'
  | 'VIRTUAL_DEPOSIT'
  | 'VIRTUAL_WITHDRAWAL'
  | 'DIVIDEND_CREDIT'
  | 'COMMODITY_BUY'
  | 'COMMODITY_SELL'
  | 'SIMULATED_PORTFOLIO_OVERRIDE'
  | 'SIMULATED_PROFIT_INJECTION'
  | 'SIMULATED_LOSS_DEDUCTION'
  | 'EV_ENERGY_SLOT_BOOK'
  | 'EV_ENERGY_PROFIT_PAYOUT';
export type TransactionStatus = 'COMPLETED' | 'PROCESSING' | 'PENDING' | 'CANCELLED' | 'FAILED';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  referenceId?: string;
  stock?: string;
  relatedAsset?: string;
  quantity?: number;
  price?: number;
  orderType?: OrderType;
  createdAt: string;
  // EV Energy and Public Investor Ledger fields
  investorName?: string;
  investPrice?: number;
  profitOrLoss?: {
    type: 'PROFIT' | 'LOSS';
    amount: number;
    percent?: number;
  };
  bankName?: string;
  withdrawalStatus?: 'SUCCESS' | 'PROCESSING' | 'FAILED';
  timeToWithdraw?: string;
  isPublicInvestorEntry?: boolean;
}

export interface VirtualDeposit {
  id: string;
  userId: string;
  amount: number;
  method: 'UPI_SIMULATED' | 'NETBANKING_SIMULATED' | 'IMPS_SIMULATED' | 'INSTANT_CREDIT';
  status: 'COMPLETED' | 'PROCESSING';
  step: number;
  createdAt: string;
}

export interface VirtualWithdrawal {
  id: string;
  userId: string;
  amount: number;
  simulatedBankName: string;
  simulatedAccountMask: string;
  status: 'SETTLED' | 'PROCESSING' | 'CANCELLED';
  settlementCycle: 'T+1' | 'T+2';
  createdAt: string;
  estimatedSettlementAt: string;
}

export interface SimulatorSettings {
  marketStatus: 'OPEN' | 'CLOSED';
  tickIntervalMs: number;
  volatilityMultiplier: number;
  defaultStartingBalance: number;
  enableRandomEvents: boolean;
  marketTrend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalTradingVolume: number;
  totalVirtualDeposits: number;
  totalVirtualWithdrawals: number;
  activeStocksCount: number;
  marketStatus: 'OPEN' | 'CLOSED';
  volatility: number;
}

export interface MutualFundInvestment {
  id: string;
  fundId: string;
  fundName: string;
  category: string;
  investmentType: 'SIP' | 'LUMPSUM';
  monthlyAmount?: number;
  totalInvested: number;
  currentValue: number;
  unitsAllocated: number;
  navAtPurchase: number;
  currentNav: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  purchaseDate: string;
  nextSipDate?: string;
}

export interface IpoApplication {
  id: string;
  ipoId: string;
  companyName: string;
  symbol: string;
  lots: number;
  sharesCount: number;
  bidPrice: number;
  totalAmount: number;
  upiId: string;
  status: 'APPLIED' | 'MANDATE_APPROVED' | 'ALLOTTED' | 'REFUNDED';
  appliedAt: string;
  allotmentDate: string;
}

export interface WatchlistGroup {
  id: string;
  name: string;
  symbols: string[];
  isDefault?: boolean;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  stockName: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  percentMovement?: number;
  enabled: boolean;
  triggered: boolean;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  accountHolderName: string;
  bankName: string;
  accountNumberMasked: string;
  ifsc: string;
  accountType: 'Savings' | 'Current';
  isPrimary: boolean;
  verifiedAt: string;
}

export interface EvEnergySlot {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  tierPrice: number; // 1000 | 2000 | 3000 | 5000 | 10000 | 15000 | 20000 | 50000
  durationHours: number; // 1 or 2
  sharesQuantity: number;
  totalInvested: number;
  bookedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'SETTLED_WIN' | 'SETTLED_LOSS' | 'CANCELLED';
  adminOutcome: 'PENDING' | 'FORCE_WIN' | 'FORCE_LOSS';
  profitAmount: number;
  lossAmount: number;
  payoutAmount?: number;
  settledAt?: string;
  notes?: string;
}

export interface EvEnergyConfig {
  defaultOutcome: 'FORCE_WIN' | 'FORCE_LOSS' | 'PENDING';
  defaultProfitPercent: number; // e.g. 100 for 2x return
  allowedPrices: number[];
  allowedDurationsHours: number[];
}

