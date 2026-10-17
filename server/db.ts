import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  UserProfile,
  VirtualWallet,
  Stock,
  Order,
  PortfolioHolding,
  Transaction,
  VirtualDeposit,
  VirtualWithdrawal,
  SimulatorSettings,
  StockHistory,
  PricePoint,
  StockBias,
  AdminUserHolding,
  EvEnergySlot,
  EvEnergyConfig
} from '../src/types.js';

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  email: string;
  role: 'SUPER_ADMIN';
  lastLogin?: string;
}

export interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // userId -> passwordHash
  profiles: Record<string, UserProfile>;
  virtual_wallets: Record<string, VirtualWallet>;
  stocks: Stock[];
  simulated_prices: Record<string, Record<string, PricePoint[]>>; // symbol -> timeframe -> points
  orders: Order[];
  portfolios: Record<string, PortfolioHolding[]>; // userId -> holdings
  transactions: Transaction[];
  virtual_deposits: VirtualDeposit[];
  virtual_withdrawals: VirtualWithdrawal[];
  admin_users: AdminUser[];
  simulator_settings: SimulatorSettings;
  ev_energy_slots: EvEnergySlot[];
  ev_energy_config: EvEnergyConfig;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'simulator_db.json');

// Helper to hash password
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_tradex_salt_987').digest('hex');
}

export function generateToken(payload: { id: string; role: string }): string {
  const data = Buffer.from(JSON.stringify({ ...payload, ts: Date.now() })).toString('base64url');
  const signature = crypto.createHmac('sha256', 'tradex_jwt_secret_key_2026').update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifyToken(token: string): { id: string; role: string } | null {
  if (!token || !token.includes('.')) return null;
  const [data, signature] = token.split('.');
  const expectedSignature = crypto.createHmac('sha256', 'tradex_jwt_secret_key_2026').update(data).digest('base64url');
  if (signature !== expectedSignature) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    return payload;
  } catch {
    return null;
  }
}

// Generate realistic initial price points with full OHLC and volume
function generateInitialHistory(basePrice: number): Record<string, PricePoint[]> {
  const timeframes: ('1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX' | 'ALL')[] = [
    '1D', '1W', '1M', '3M', '6M', '1Y', '5Y', 'MAX', 'ALL'
  ];
  const result: Record<string, PricePoint[]> = {};

  timeframes.forEach((tf) => {
    let count = 45;
    let stepMinutes = 5;
    let volatility = 0.006;
    let initialRatio = 0.98;

    if (tf === '1D') {
      count = 45;
      stepMinutes = 8;
      volatility = 0.004;
      initialRatio = 0.99;
    } else if (tf === '1W') {
      count = 40;
      stepMinutes = 60 * 4;
      volatility = 0.008;
      initialRatio = 0.96;
    } else if (tf === '1M') {
      count = 35;
      stepMinutes = 60 * 20;
      volatility = 0.012;
      initialRatio = 0.92;
    } else if (tf === '3M') {
      count = 45;
      stepMinutes = 60 * 24 * 2;
      volatility = 0.015;
      initialRatio = 0.88;
    } else if (tf === '6M') {
      count = 50;
      stepMinutes = 60 * 24 * 3.5;
      volatility = 0.018;
      initialRatio = 0.82;
    } else if (tf === '1Y') {
      count = 52;
      stepMinutes = 60 * 24 * 7;
      volatility = 0.022;
      initialRatio = 0.76;
    } else if (tf === '5Y') {
      count = 60;
      stepMinutes = 60 * 24 * 30;
      volatility = 0.028;
      initialRatio = 0.55;
    } else {
      // MAX / ALL
      count = 70;
      stepMinutes = 60 * 24 * 45;
      volatility = 0.032;
      initialRatio = 0.38;
    }

    const points: PricePoint[] = [];
    let currentBarClose = basePrice * initialRatio;
    const now = Date.now();

    for (let i = count; i >= 0; i--) {
      const timeStr = new Date(now - i * stepMinutes * 60 * 1000).toISOString();
      const pctChange = (Math.random() - 0.485) * volatility;
      const open = Number(currentBarClose.toFixed(2));
      const nextClose = i === 0 ? basePrice : Math.max(10, Number((open * (1 + pctChange)).toFixed(2)));
      
      const wickSpread = Math.abs(nextClose - open) * 0.4 + (basePrice * 0.002);
      const high = Number((Math.max(open, nextClose) + (Math.random() * wickSpread)).toFixed(2));
      const low = Number((Math.max(5, Math.min(open, nextClose) - (Math.random() * wickSpread))).toFixed(2));
      const volume = Math.floor(15000 + Math.random() * 125000);

      points.push({
        time: timeStr,
        price: nextClose,
        open,
        high,
        low,
        close: nextClose,
        volume
      });

      currentBarClose = nextClose;
    }

    // Ensure terminal candle lands on current market price
    if (points.length > 0) {
      const last = points[points.length - 1];
      last.close = basePrice;
      last.price = basePrice;
      if (last.high < basePrice) last.high = basePrice;
      if (last.low > basePrice) last.low = basePrice;
    }

    result[tf] = points;
  });

  return result;
}

const INITIAL_STOCKS: Omit<Stock, 'historicalTrend'>[] = [
  {
    id: 'stk_reliance',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    exchange: 'NSE',
    sector: 'Energy & Telecom',
    currentPrice: 2845.50,
    previousClose: 2812.00,
    openPrice: 2820.00,
    highPrice: 2862.00,
    lowPrice: 2815.00,
    change: 33.50,
    changePercent: 1.19,
    volume: 3845200,
    marketCap: 1925400,
    peRatio: 27.4,
    beta: 0.92,
    week52High: 3024.90,
    week52Low: 2220.30,
    description: 'India’s largest multinational conglomerate spanning petrochemicals, refining, oil & gas, telecom (Jio) and retail.'
  },
  {
    id: 'stk_tcs',
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    exchange: 'NSE',
    sector: 'Information Technology',
    currentPrice: 3912.80,
    previousClose: 3940.00,
    openPrice: 3935.00,
    highPrice: 3955.00,
    lowPrice: 3898.00,
    change: -27.20,
    changePercent: -0.69,
    volume: 1720300,
    marketCap: 1415200,
    peRatio: 30.1,
    beta: 0.78,
    week52High: 4254.75,
    week52Low: 3313.00,
    description: 'Premier global IT services, digital transformation consulting and enterprise business solutions provider.'
  },
  {
    id: 'stk_hdfcbank',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    exchange: 'NSE',
    sector: 'Banking & Finance',
    currentPrice: 1684.20,
    previousClose: 1662.50,
    openPrice: 1668.00,
    highPrice: 1692.00,
    lowPrice: 1665.00,
    change: 21.70,
    changePercent: 1.31,
    volume: 7890400,
    marketCap: 1284000,
    peRatio: 18.5,
    beta: 1.05,
    week52High: 1794.00,
    week52Low: 1363.55,
    description: 'India’s leading private sector bank with pan-India network offering retail, wholesale and treasury operations.'
  },
  {
    id: 'stk_infy',
    symbol: 'INFY',
    name: 'Infosys Ltd',
    exchange: 'NSE',
    sector: 'Information Technology',
    currentPrice: 1842.60,
    previousClose: 1818.00,
    openPrice: 1825.00,
    highPrice: 1858.00,
    lowPrice: 1820.00,
    change: 24.60,
    changePercent: 1.35,
    volume: 4520100,
    marketCap: 765400,
    peRatio: 28.6,
    beta: 0.88,
    week52High: 1953.90,
    week52Low: 1358.35,
    description: 'Global leader in next-generation digital services, Cloud (Infosys Cobalt) and enterprise AI solutions.'
  },
  {
    id: 'stk_tatamotors',
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd',
    exchange: 'NSE',
    sector: 'Automotive & EV',
    currentPrice: 968.40,
    previousClose: 945.00,
    openPrice: 952.00,
    highPrice: 978.50,
    lowPrice: 950.00,
    change: 23.40,
    changePercent: 2.48,
    volume: 9140200,
    marketCap: 356200,
    peRatio: 16.2,
    beta: 1.38,
    week52High: 1179.05,
    week52Low: 608.50,
    description: 'Multinational automobile manufacturer leading the passenger EV revolution and Jaguar Land Rover (JLR) luxury portfolio.'
  },
  {
    id: 'stk_icicibank',
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd',
    exchange: 'NSE',
    sector: 'Banking & Finance',
    currentPrice: 1248.10,
    previousClose: 1238.00,
    openPrice: 1242.00,
    highPrice: 1255.00,
    lowPrice: 1239.00,
    change: 10.10,
    changePercent: 0.82,
    volume: 5310000,
    marketCap: 878000,
    peRatio: 17.8,
    beta: 1.12,
    week52High: 1332.00,
    week52Low: 913.00,
    description: 'Major private financial services institution recognized for strong digital banking platforms and high asset quality.'
  },
  {
    id: 'stk_itc',
    symbol: 'ITC',
    name: 'ITC Limited',
    exchange: 'NSE',
    sector: 'FMCG & Agri',
    currentPrice: 478.90,
    previousClose: 482.00,
    openPrice: 481.50,
    highPrice: 484.00,
    lowPrice: 477.00,
    change: -3.10,
    changePercent: -0.64,
    volume: 8201000,
    marketCap: 598000,
    peRatio: 26.3,
    beta: 0.65,
    week52High: 528.55,
    week52Low: 399.30,
    description: 'Diversified consumer giant spanning packaged foods, personal care, hotels, paperboards, packaging and agribusiness.'
  },
  {
    id: 'stk_bhartiartl',
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd',
    exchange: 'NSE',
    sector: 'Telecom',
    currentPrice: 1592.30,
    previousClose: 1570.00,
    openPrice: 1575.00,
    highPrice: 1604.00,
    lowPrice: 1572.00,
    change: 22.30,
    changePercent: 1.42,
    volume: 3410500,
    marketCap: 945000,
    peRatio: 64.2,
    beta: 0.74,
    week52High: 1680.00,
    week52Low: 918.00,
    description: 'Top communications solutions provider operating across 18 countries in South Asia and Africa with fast-growing 5G subscriber base.'
  },
  {
    id: 'stk_zomato',
    symbol: 'ZOMATO',
    name: 'Zomato Ltd',
    exchange: 'NSE',
    sector: 'Consumer Tech',
    currentPrice: 248.75,
    previousClose: 241.50,
    openPrice: 243.00,
    highPrice: 252.00,
    lowPrice: 242.00,
    change: 7.25,
    changePercent: 3.00,
    volume: 18450000,
    marketCap: 219000,
    peRatio: 112.5,
    beta: 1.45,
    week52High: 298.20,
    week52Low: 98.40,
    description: 'Rapidly growing food delivery and quick-commerce platform (Blinkit) revolutionizing urban hyperlocal retail.'
  },
  {
    id: 'stk_lt',
    symbol: 'LT',
    name: 'Larsen & Toubro Ltd',
    exchange: 'NSE',
    sector: 'Capital Goods & Infra',
    currentPrice: 3580.00,
    previousClose: 3560.00,
    openPrice: 3565.00,
    highPrice: 3610.00,
    lowPrice: 3550.00,
    change: 20.00,
    changePercent: 0.56,
    volume: 1280000,
    marketCap: 492000,
    peRatio: 34.0,
    beta: 0.95,
    week52High: 3948.00,
    week52Low: 2880.00,
    description: 'Engineering, procurement, construction, manufacturing and technology conglomerate executing mega infrastructure projects.'
  },
  {
    id: 'stk_bajfinance',
    symbol: 'BAJFINANCE',
    name: 'Bajaj Finance Ltd',
    exchange: 'NSE',
    sector: 'NBFC & Lending',
    currentPrice: 7120.00,
    previousClose: 7180.00,
    openPrice: 7160.00,
    highPrice: 7210.00,
    lowPrice: 7080.00,
    change: -60.00,
    changePercent: -0.84,
    volume: 890000,
    marketCap: 440000,
    peRatio: 29.8,
    beta: 1.25,
    week52High: 8192.00,
    week52Low: 6355.00,
    description: 'Largest deposit-taking non-banking finance company catering to consumer durables, digital finance and SME business loans.'
  },
  {
    id: 'stk_titan',
    symbol: 'TITAN',
    name: 'Titan Company Ltd',
    exchange: 'NSE',
    sector: 'Consumer Goods',
    currentPrice: 3340.50,
    previousClose: 3310.00,
    openPrice: 3320.00,
    highPrice: 3365.00,
    lowPrice: 3315.00,
    change: 30.50,
    changePercent: 0.92,
    volume: 720000,
    marketCap: 296000,
    peRatio: 78.4,
    beta: 0.82,
    week52High: 3886.95,
    week52Low: 3055.00,
    description: 'Tata Group luxury lifestyle brand dominant in fine jewellery (Tanishq), precision watches, and eyewear.'
  },
  {
    id: 'stk_goldbees',
    symbol: 'GOLDBEES',
    name: 'Nippon India ETF Gold BeES',
    exchange: 'NSE',
    sector: 'Commodities & Metals',
    currentPrice: 65.40,
    previousClose: 64.80,
    openPrice: 64.95,
    highPrice: 65.80,
    lowPrice: 64.70,
    change: 0.60,
    changePercent: 0.93,
    volume: 14500000,
    marketCap: 12500,
    peRatio: 0,
    beta: 0.15,
    week52High: 68.90,
    week52Low: 52.10,
    description: 'Gold ETF backed by 99.5% pure physical gold bullion. Enables fractional gold investment starting from 1 unit.'
  },
  {
    id: 'stk_silverbees',
    symbol: 'SILVERBEES',
    name: 'Nippon India ETF Silver BeES',
    exchange: 'NSE',
    sector: 'Commodities & Metals',
    currentPrice: 86.75,
    previousClose: 85.20,
    openPrice: 85.50,
    highPrice: 87.40,
    lowPrice: 85.10,
    change: 1.55,
    changePercent: 1.82,
    volume: 9800000,
    marketCap: 6200,
    peRatio: 0,
    beta: 0.45,
    week52High: 96.50,
    week52Low: 68.20,
    description: 'Silver ETF tracking physical 99.9% fine silver. Strong demand from photovoltaic solar cells and electronic mobility.'
  },
  {
    id: 'stk_mcxgold',
    symbol: 'GOLD24K',
    name: 'MCX Gold Spot 24K (10g)',
    exchange: 'NSE',
    sector: 'Commodities & Metals',
    currentPrice: 73450.00,
    previousClose: 72800.00,
    openPrice: 72900.00,
    highPrice: 73650.00,
    lowPrice: 72750.00,
    change: 650.00,
    changePercent: 0.89,
    volume: 450000,
    marketCap: 890000,
    peRatio: 0,
    beta: 0.20,
    week52High: 76000.00,
    week52Low: 59000.00,
    description: 'Benchmark spot physical gold rate per 10 grams of 999 purity. Ultimate inflation and currency devaluation hedge.'
  },
  {
    id: 'stk_mcxsilver',
    symbol: 'SILVER1KG',
    name: 'MCX Silver Spot 999 (1 Kg)',
    exchange: 'NSE',
    sector: 'Commodities & Metals',
    currentPrice: 85800.00,
    previousClose: 84400.00,
    openPrice: 84600.00,
    highPrice: 86200.00,
    lowPrice: 84200.00,
    change: 1400.00,
    changePercent: 1.66,
    volume: 380000,
    marketCap: 450000,
    peRatio: 0,
    beta: 0.52,
    week52High: 98000.00,
    week52Low: 71000.00,
    description: 'Standard 1 kilogram physical fine silver bar contract traded on Indian commodity exchanges.'
  },
  {
    id: 'stk_pcjeweller',
    symbol: 'PCJEWELLER',
    name: 'PC Jeweller Ltd',
    exchange: 'NSE',
    sector: 'Gems & Jewellery',
    currentPrice: 12.89,
    previousClose: 13.70,
    openPrice: 13.50,
    highPrice: 13.85,
    lowPrice: 12.75,
    change: -0.81,
    changePercent: -5.91,
    volume: 24500000,
    marketCap: 6020,
    peRatio: 14.2,
    beta: 1.45,
    week52High: 21.50,
    week52Low: 8.90,
    description: 'Leading Indian jewellery design, manufacturing, and retail enterprise.'
  },
  {
    id: 'stk_raymond',
    symbol: 'RAYMOND',
    name: 'Raymond Ltd',
    exchange: 'NSE',
    sector: 'Textiles & Apparel',
    currentPrice: 995.95,
    previousClose: 1002.80,
    openPrice: 1001.00,
    highPrice: 1014.50,
    lowPrice: 992.00,
    change: -6.85,
    changePercent: -0.68,
    volume: 1840000,
    marketCap: 13200,
    peRatio: 19.5,
    beta: 1.15,
    week52High: 1280.00,
    week52Low: 780.00,
    description: 'Iconic suiting, apparel, and lifestyle consumer brand with global retail footprint.'
  },
  {
    id: 'stk_anlon',
    symbol: 'ANLON',
    name: 'Anlon Healthcare Ltd',
    exchange: 'NSE',
    sector: 'Healthcare & Pharma',
    currentPrice: 20.18,
    previousClose: 19.57,
    openPrice: 19.65,
    highPrice: 20.80,
    lowPrice: 19.50,
    change: 0.61,
    changePercent: 3.12,
    volume: 890000,
    marketCap: 410,
    peRatio: 22.0,
    beta: 0.95,
    week52High: 28.50,
    week52Low: 14.20,
    description: 'Specialized healthcare solutions, medical devices, and pharmaceutical manufacturing.'
  },
  {
    id: 'stk_tatagold',
    symbol: 'TATAGOLD',
    name: 'Tata Gold Exchange Traded Fund',
    exchange: 'NSE',
    sector: 'Commodities & ETFs',
    currentPrice: 14.52,
    previousClose: 14.70,
    openPrice: 14.65,
    highPrice: 14.80,
    lowPrice: 14.45,
    change: -0.18,
    changePercent: -1.22,
    volume: 3410000,
    marketCap: 3800,
    peRatio: 0,
    beta: 0.12,
    week52High: 16.20,
    week52Low: 11.50,
    description: 'Tata Mutual Fund open-ended gold ETF tracking physical 24 karat gold bullion.'
  },
  {
    id: 'stk_hcltech',
    symbol: 'HCLTECH',
    name: 'HCL Technologies Ltd',
    exchange: 'NSE',
    sector: 'Information Technology',
    currentPrice: 1253.70,
    previousClose: 1206.10,
    openPrice: 1215.00,
    highPrice: 1262.00,
    lowPrice: 1210.00,
    change: 47.60,
    changePercent: 3.95,
    volume: 4443984,
    marketCap: 340000,
    peRatio: 21.8,
    beta: 0.85,
    week52High: 1380.00,
    week52Low: 980.00,
    description: 'Global tech enterprise helping businesses reimagine their commerce with digital engineering.'
  },
  {
    id: 'stk_techm',
    symbol: 'TECHM',
    name: 'Tech Mahindra Ltd',
    exchange: 'NSE',
    sector: 'Information Technology',
    currentPrice: 1575.90,
    previousClose: 1541.00,
    openPrice: 1545.00,
    highPrice: 1588.00,
    lowPrice: 1540.00,
    change: 34.90,
    changePercent: 2.26,
    volume: 2577135,
    marketCap: 154000,
    peRatio: 38.4,
    beta: 1.02,
    week52High: 1720.00,
    week52Low: 1120.00,
    description: 'Pioneer in digital transformation, 5G networking engineering, and customer experience solutions.'
  },
  {
    id: 'stk_ltm',
    symbol: 'LTM',
    name: 'LTIMindtree Ltd',
    exchange: 'NSE',
    sector: 'Information Technology',
    currentPrice: 4346.60,
    previousClose: 4275.00,
    openPrice: 4280.00,
    highPrice: 4375.00,
    lowPrice: 4260.00,
    change: 71.60,
    changePercent: 1.67,
    volume: 663212,
    marketCap: 128500,
    peRatio: 29.2,
    beta: 0.94,
    week52High: 5450.00,
    week52Low: 3850.00,
    description: 'Global technology consulting and enterprise digital solutions company under Larsen & Toubro Group.'
  },
  {
    id: 'stk_wipro',
    symbol: 'WIPRO',
    name: 'Wipro Ltd',
    exchange: 'NSE',
    sector: 'Information Technology',
    currentPrice: 170.00,
    previousClose: 167.40,
    openPrice: 168.00,
    highPrice: 172.50,
    lowPrice: 167.00,
    change: 2.60,
    changePercent: 1.55,
    volume: 11722173,
    marketCap: 148000,
    peRatio: 23.5,
    beta: 0.88,
    week52High: 215.00,
    week52Low: 145.00,
    description: 'Leading technology services and consulting firm focusing on cloud innovation and cybersecurity.'
  },
  {
    id: 'stk_solarinds',
    symbol: 'SOLARINDS',
    name: 'Solar Industries India Ltd',
    exchange: 'NSE',
    sector: 'Chemicals & Defence',
    currentPrice: 19250.00,
    previousClose: 22290.00,
    openPrice: 22100.00,
    highPrice: 22350.00,
    lowPrice: 18900.00,
    change: -3040.00,
    changePercent: -13.64,
    volume: 850000,
    marketCap: 174000,
    peRatio: 62.0,
    beta: 1.25,
    week52High: 23500.00,
    week52Low: 14200.00,
    description: 'India’s premier industrial explosives, defence munitions, and propellants manufacturer.'
  },
  {
    id: 'stk_urbanco',
    symbol: 'URBANCO',
    name: 'Urban Company Ltd',
    exchange: 'NSE',
    sector: 'Consumer Services Tech',
    currentPrice: 158.22,
    previousClose: 166.89,
    openPrice: 165.00,
    highPrice: 167.50,
    lowPrice: 156.00,
    change: -8.67,
    changePercent: -5.20,
    volume: 3400000,
    marketCap: 18900,
    peRatio: 45.0,
    beta: 1.30,
    week52High: 210.00,
    week52Low: 120.00,
    description: 'Technology-enabled platform for home services, personal grooming, and appliance repairs.'
  },
  {
    id: 'stk_firstcry',
    symbol: 'BRAINBEES',
    name: 'Brainbees Solutions Ltd (FirstCry)',
    exchange: 'NSE',
    sector: 'E-commerce & Retail',
    currentPrice: 171.53,
    previousClose: 168.83,
    openPrice: 169.50,
    highPrice: 174.00,
    lowPrice: 168.00,
    change: 2.70,
    changePercent: 1.60,
    volume: 4890000,
    marketCap: 14200,
    peRatio: 52.0,
    beta: 1.18,
    week52High: 220.00,
    week52Low: 135.00,
    description: 'India’s largest omni-channel retail platform for mothers, babies, and kids goods.'
  },
  {
    id: 'stk_zensartech',
    symbol: 'ZENSARTECH',
    name: 'Zensar Technologies Ltd',
    exchange: 'NSE',
    sector: 'Information Technology',
    currentPrice: 440.20,
    previousClose: 425.25,
    openPrice: 428.00,
    highPrice: 445.00,
    lowPrice: 426.00,
    change: 14.95,
    changePercent: 3.52,
    volume: 2100000,
    marketCap: 10100,
    peRatio: 21.0,
    beta: 1.05,
    week52High: 520.00,
    week52Low: 340.00,
    description: 'RPG Group digital solutions, IT services, and software engineering firm.'
  },
  {
    id: 'stk_tatainvest',
    symbol: 'TATAINVEST',
    name: 'Tata Investment Corporation Ltd',
    exchange: 'NSE',
    sector: 'Finance & Investment',
    currentPrice: 718.35,
    previousClose: 650.90,
    openPrice: 660.00,
    highPrice: 725.00,
    lowPrice: 658.00,
    change: 67.45,
    changePercent: 10.36,
    volume: 1650000,
    marketCap: 36400,
    peRatio: 38.0,
    beta: 1.10,
    week52High: 820.00,
    week52Low: 450.00,
    description: 'Non-banking financial investment arm holding strategic stakes across Tata companies.'
  },
  {
    id: 'stk_mon100',
    symbol: 'MON100',
    name: 'Motilal Oswal NASDAQ 100 ETF',
    exchange: 'NSE',
    sector: 'International ETFs',
    currentPrice: 330.62,
    previousClose: 332.83,
    openPrice: 332.00,
    highPrice: 334.50,
    lowPrice: 329.80,
    change: -2.21,
    changePercent: -0.66,
    volume: 1250000,
    marketCap: 8900,
    peRatio: 0,
    beta: 0.85,
    week52High: 365.00,
    week52Low: 245.00,
    description: 'Exchange-traded fund tracking top 100 non-financial tech giants on the US NASDAQ.'
  },
  {
    id: 'stk_grownifty',
    symbol: 'GROWWNIFTY',
    name: 'Groww Nifty 50 ETF',
    exchange: 'NSE',
    sector: 'Index ETFs',
    currentPrice: 9.41,
    previousClose: 9.49,
    openPrice: 9.47,
    highPrice: 9.55,
    lowPrice: 9.38,
    change: -0.08,
    changePercent: -0.84,
    volume: 8900000,
    marketCap: 4500,
    peRatio: 0,
    beta: 1.0,
    week52High: 11.20,
    week52Low: 7.80,
    description: 'Groww Mutual Fund ultra-low-cost ETF replicating the blue-chip NIFTY 50 index.'
  },
  {
    id: 'stk_tatapower',
    symbol: 'TATAPOWER',
    name: 'Tata Power Company Ltd',
    exchange: 'NSE',
    sector: 'Clean Energy & Utilities',
    currentPrice: 418.65,
    previousClose: 411.20,
    openPrice: 413.00,
    highPrice: 422.50,
    lowPrice: 412.00,
    change: 7.45,
    changePercent: 1.81,
    volume: 16500000,
    marketCap: 133800,
    peRatio: 33.4,
    beta: 1.25,
    week52High: 471.00,
    week52Low: 232.00,
    description: 'Pioneer Indian integrated power utility leading rooftop solar, EV fast charging grids, and green microgrids.'
  },
  {
    id: 'stk_ntpc',
    symbol: 'NTPC',
    name: 'NTPC Limited',
    exchange: 'NSE',
    sector: 'Thermal & Renewable Power',
    currentPrice: 388.40,
    previousClose: 383.15,
    openPrice: 384.00,
    highPrice: 391.20,
    lowPrice: 382.50,
    change: 5.25,
    changePercent: 1.37,
    volume: 18200000,
    marketCap: 376500,
    peRatio: 17.2,
    beta: 0.95,
    week52High: 426.00,
    week52Low: 228.00,
    description: 'India’s largest power conglomerate transitioning aggressively toward 60 GW non-fossil capacity by 2032.'
  },
  {
    id: 'stk_adanigreen',
    symbol: 'ADANIGREEN',
    name: 'Adani Green Energy Ltd',
    exchange: 'NSE',
    sector: 'Solar & Wind Generation',
    currentPrice: 1782.50,
    previousClose: 1735.00,
    openPrice: 1740.00,
    highPrice: 1798.00,
    lowPrice: 1732.00,
    change: 47.50,
    changePercent: 2.74,
    volume: 3800000,
    marketCap: 282400,
    peRatio: 184.0,
    beta: 1.48,
    week52High: 2174.00,
    week52Low: 815.00,
    description: 'Global renewable powerhouse developing the 30,000 MW Khavda renewable energy park in Gujarat.'
  },
  {
    id: 'stk_suzlon',
    symbol: 'SUZLON',
    name: 'Suzlon Energy Ltd',
    exchange: 'NSE',
    sector: 'Wind Turbines & Green Tech',
    currentPrice: 62.45,
    previousClose: 59.80,
    openPrice: 60.10,
    highPrice: 63.20,
    lowPrice: 59.50,
    change: 2.65,
    changePercent: 4.43,
    volume: 88500000,
    marketCap: 85200,
    peRatio: 78.5,
    beta: 1.62,
    week52High: 86.00,
    week52Low: 21.00,
    description: 'Leading wind turbine manufacturer and EPC provider across India and global renewable hubs.'
  },
  {
    id: 'stk_powergrid',
    symbol: 'POWERGRID',
    name: 'Power Grid Corporation of India',
    exchange: 'NSE',
    sector: 'Power Transmission Infra',
    currentPrice: 312.80,
    previousClose: 310.40,
    openPrice: 311.00,
    highPrice: 315.00,
    lowPrice: 309.80,
    change: 2.40,
    changePercent: 0.77,
    volume: 14200000,
    marketCap: 290900,
    peRatio: 18.1,
    beta: 0.72,
    week52High: 366.00,
    week52Low: 195.00,
    description: 'Maharatna PSU transmitting ~85% of India’s interstate power with 99.8% system availability.'
  },
  {
    id: 'stk_ongc',
    symbol: 'ONGC',
    name: 'Oil & Natural Gas Corporation',
    exchange: 'NSE',
    sector: 'Upstream Oil & Gas Energy',
    currentPrice: 296.15,
    previousClose: 292.80,
    openPrice: 293.50,
    highPrice: 298.50,
    lowPrice: 292.00,
    change: 3.35,
    changePercent: 1.14,
    volume: 22100000,
    marketCap: 372600,
    peRatio: 8.9,
    beta: 0.90,
    week52High: 344.00,
    week52Low: 178.00,
    description: 'National upstream oil and gas champion exploring deepwater basins and building green ammonia assets.'
  }
];

class Database {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadData();
    this.ensureAdminUser();
    this.ensureAllStocks();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.ev_energy_slots) parsed.ev_energy_slots = [];
        if (!parsed.ev_energy_config) {
          parsed.ev_energy_config = {
            defaultOutcome: 'FORCE_WIN',
            defaultProfitPercent: 300,
            allowedPrices: [1000, 2000, 3000, 5000, 10000, 15000, 20000, 50000],
            allowedDurationsHours: [1, 2]
          };
        } else if (!parsed.ev_energy_config.defaultProfitPercent || parsed.ev_energy_config.defaultProfitPercent < 300) {
          parsed.ev_energy_config.defaultProfitPercent = 300;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load db file, initializing fresh:', e);
    }
    return this.createInitialData();
  }

  private createInitialData(): DatabaseSchema {
    const stocks: Stock[] = INITIAL_STOCKS.map((s) => {
      // Create a 10-point mini trend
      const trend = [
        s.previousClose,
        s.previousClose * 1.002,
        s.previousClose * 0.998,
        s.openPrice,
        s.lowPrice,
        (s.lowPrice + s.highPrice) / 2,
        s.highPrice,
        s.currentPrice * 0.997,
        s.currentPrice * 1.001,
        s.currentPrice
      ].map((v) => Number(v.toFixed(2)));

      return {
        ...s,
        historicalTrend: trend
      };
    });

    const simulated_prices: Record<string, Record<string, PricePoint[]>> = {};
    stocks.forEach((stk) => {
      simulated_prices[stk.symbol] = generateInitialHistory(stk.currentPrice);
    });

    const demoUserId = 'usr_demo_101';
    const demoUser: User = {
      id: demoUserId,
      email: 'trader@tradex.sim',
      name: 'Simulated Investor',
      phone: '+91 98765 43210',
      role: 'user',
      createdAt: new Date().toISOString()
    };

    const demoProfile: UserProfile = {
      userId: demoUserId,
      avatarUrl: '',
      tradingExperience: 'beginner',
      riskTolerance: 'moderate',
      preferredCurrency: 'INR',
      notificationsEnabled: true,
      theme: 'dark'
    };

    const demoWallet: VirtualWallet = {
      userId: demoUserId,
      balance: 500000, // ₹5,00,000 initial learning funds
      reservedBalance: 0,
      totalDeposited: 500000,
      totalWithdrawn: 0,
      currency: 'INR'
    };

    // Prepopulate a sample portfolio holding so users see realistic P&L immediately
    const sampleHoldings: PortfolioHolding[] = [
      {
        id: 'hld_rel_1',
        userId: demoUserId,
        stockId: 'stk_reliance',
        symbol: 'RELIANCE',
        stockName: 'Reliance Industries Ltd',
        sector: 'Energy & Telecom',
        quantity: 25,
        averageBuyPrice: 2750.00,
        currentPrice: 2845.50,
        investedValue: 25 * 2750.00,
        currentValue: 25 * 2845.50,
        unrealizedPnL: 25 * (2845.50 - 2750.00),
        unrealizedPnLPercent: ((2845.50 - 2750.00) / 2750.00) * 100,
        oneDayPnL: 25 * 33.50,
        oneDayPnLPercent: 1.19
      },
      {
        id: 'hld_tatam_1',
        userId: demoUserId,
        stockId: 'stk_tatamotors',
        symbol: 'TATAMOTORS',
        stockName: 'Tata Motors Ltd',
        sector: 'Automotive & EV',
        quantity: 50,
        averageBuyPrice: 910.00,
        currentPrice: 968.40,
        investedValue: 50 * 910.00,
        currentValue: 50 * 968.40,
        unrealizedPnL: 50 * (968.40 - 910.00),
        unrealizedPnLPercent: ((968.40 - 910.00) / 910.00) * 100,
        oneDayPnL: 50 * 23.40,
        oneDayPnLPercent: 2.48
      }
    ];

    const sampleOrders: Order[] = [
      {
        id: 'ord_init_1',
        userId: demoUserId,
        stockId: 'stk_reliance',
        symbol: 'RELIANCE',
        stockName: 'Reliance Industries Ltd',
        side: 'BUY',
        orderType: 'MARKET',
        quantity: 25,
        price: 2750.00,
        executedPrice: 2750.00,
        status: 'EXECUTED',
        totalAmount: 68750.00,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        executedAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'ord_init_2',
        userId: demoUserId,
        stockId: 'stk_tatamotors',
        symbol: 'TATAMOTORS',
        stockName: 'Tata Motors Ltd',
        side: 'BUY',
        orderType: 'MARKET',
        quantity: 50,
        price: 910.00,
        executedPrice: 910.00,
        status: 'EXECUTED',
        totalAmount: 45500.00,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        executedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    const sampleTransactions: Transaction[] = [
      {
        id: 'txn_init_deposit',
        userId: demoUserId,
        type: 'VIRTUAL_DEPOSIT',
        amount: 500000,
        status: 'COMPLETED',
        description: 'Virtual Welcome Learning Capital Credit',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: 'txn_init_buy_1',
        userId: demoUserId,
        type: 'BUY_ORDER',
        amount: 68750,
        status: 'COMPLETED',
        description: 'Bought 25 shares of RELIANCE at ₹2,750.00',
        referenceId: 'ord_init_1',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'txn_init_buy_2',
        userId: demoUserId,
        type: 'BUY_ORDER',
        amount: 45500,
        status: 'COMPLETED',
        description: 'Bought 50 shares of TATAMOTORS at ₹910.00',
        referenceId: 'ord_init_2',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    const sampleDeposits: VirtualDeposit[] = [
      {
        id: 'dep_init_1',
        userId: demoUserId,
        amount: 500000,
        method: 'INSTANT_CREDIT',
        status: 'COMPLETED',
        step: 4,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ];

    return {
      users: [demoUser],
      passwords: { [demoUserId]: hashPassword('tradex123') },
      profiles: { [demoUserId]: demoProfile },
      virtual_wallets: { [demoUserId]: demoWallet },
      stocks,
      simulated_prices,
      orders: sampleOrders,
      portfolios: { [demoUserId]: sampleHoldings },
      transactions: sampleTransactions,
      virtual_deposits: sampleDeposits,
      virtual_withdrawals: [],
      admin_users: [],
      simulator_settings: {
        marketStatus: 'OPEN',
        tickIntervalMs: 3000,
        volatilityMultiplier: 1.0,
        defaultStartingBalance: 500000,
        enableRandomEvents: true,
        marketTrend: 'BULLISH'
      },
      ev_energy_slots: [],
      ev_energy_config: {
        defaultOutcome: 'FORCE_WIN',
        defaultProfitPercent: 100,
        allowedPrices: [1000, 2000, 3000, 5000, 10000, 15000, 20000, 50000],
        allowedDurationsHours: [1, 2]
      }
    };
  }

  private ensureAdminUser() {
    if (!this.data.admin_users) {
      this.data.admin_users = [];
    }
    let updated = false;

    // Secure authentication credentials sourced from environment variables (No hardcoded credentials)
    const envAdminPassword = process.env.ADMIN_PASSWORD;
    const envAdminUsername = process.env.ADMIN_USERNAME || 'admin';
    const ownerEmail = process.env.ADMIN_EMAIL || 'harigyansinghgurjar44@gmail.com';

    let fallbackSeed = envAdminPassword;
    if (!fallbackSeed) {
      const seedFile = path.join(DATA_DIR, '.admin_seed.key');
      if (fs.existsSync(seedFile)) {
        fallbackSeed = fs.readFileSync(seedFile, 'utf8').trim();
      } else {
        fallbackSeed = crypto.randomBytes(16).toString('hex');
        try {
          fs.writeFileSync(seedFile, fallbackSeed, 'utf8');
        } catch {}
      }
    }

    const adminExists = this.data.admin_users.find((a) => a.username.toLowerCase() === envAdminUsername.toLowerCase());
    if (!adminExists) {
      this.data.admin_users.push({
        id: 'adm_root_001',
        username: envAdminUsername,
        email: 'admin@tradex.sim',
        passwordHash: hashPassword(fallbackSeed),
        role: 'SUPER_ADMIN',
        lastLogin: new Date().toISOString()
      });
      updated = true;
    } else if (envAdminPassword) {
      adminExists.passwordHash = hashPassword(envAdminPassword);
      updated = true;
    }

    const ownerExists = this.data.admin_users.find((a) => a.email.toLowerCase() === ownerEmail.toLowerCase());
    if (!ownerExists) {
      this.data.admin_users.push({
        id: 'adm_owner_002',
        username: 'harigyan',
        email: ownerEmail,
        passwordHash: hashPassword(fallbackSeed),
        role: 'SUPER_ADMIN',
        lastLogin: new Date().toISOString()
      });
      updated = true;
    } else if (envAdminPassword) {
      ownerExists.passwordHash = hashPassword(envAdminPassword);
      updated = true;
    }

    if (updated) {
      this.scheduleSave();
    }
  }

  public ensureAllStocks() {
    if (!this.data.stocks) {
      this.data.stocks = [];
    }
    let modified = false;

    INITIAL_STOCKS.forEach((init) => {
      const exists = this.data.stocks.find((s) => s.symbol.toUpperCase() === init.symbol.toUpperCase());
      if (!exists) {
        const trend = [
          init.previousClose,
          init.previousClose * 1.002,
          init.previousClose * 0.998,
          init.openPrice,
          init.lowPrice,
          (init.lowPrice + init.highPrice) / 2,
          init.highPrice,
          init.currentPrice * 0.997,
          init.currentPrice * 1.001,
          init.currentPrice
        ].map((v) => Number(v.toFixed(2)));

        this.data.stocks.push({
          ...init,
          historicalTrend: trend
        });

        if (!this.data.simulated_prices) {
          this.data.simulated_prices = {};
        }
        this.data.simulated_prices[init.symbol] = generateInitialHistory(init.currentPrice);
        modified = true;
      }
    });

    if (modified) {
      this.scheduleSave();
    }
  }

  public updateStockDirect(symbol: string, updates: Partial<Stock>): Stock | null {
    const stk = this.getStockBySymbol(symbol);
    if (!stk) return null;

    // If stock price is locked by Admin, prevent external Yahoo API or micro-ticks from overriding the price!
    if (stk.priceOverrideLocked && updates.currentPrice !== undefined) {
      const { currentPrice, change, changePercent, highPrice, lowPrice, ...allowed } = updates;
      Object.assign(stk, allowed);
      return stk;
    }

    Object.assign(stk, updates);
    return stk;
  }

  public scheduleSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      try {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (e) {
        console.error('Error saving database:', e);
      }
    }, 500);
  }

  // Raw getter
  public getData(): DatabaseSchema {
    return this.data;
  }

  // --- Users & Auth ---
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(email: string, name: string, passwordPlain: string, phone?: string): User {
    const id = `usr_${crypto.randomUUID().slice(0, 8)}`;
    const newUser: User = {
      id,
      email,
      name,
      phone: phone || '',
      role: 'user',
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.data.passwords[id] = hashPassword(passwordPlain);

    // Profile
    this.data.profiles[id] = {
      userId: id,
      tradingExperience: 'beginner',
      riskTolerance: 'moderate',
      preferredCurrency: 'INR',
      notificationsEnabled: true,
      theme: 'dark'
    };

    // Virtual Wallet
    const initialBalance = this.data.simulator_settings.defaultStartingBalance || 500000;
    this.data.virtual_wallets[id] = {
      userId: id,
      balance: initialBalance,
      reservedBalance: 0,
      totalDeposited: initialBalance,
      totalWithdrawn: 0,
      currency: 'INR'
    };

    // Initial transaction
    this.data.transactions.push({
      id: `txn_${crypto.randomUUID().slice(0, 8)}`,
      userId: id,
      type: 'VIRTUAL_DEPOSIT',
      amount: initialBalance,
      status: 'COMPLETED',
      description: 'Starting Virtual Learning Balance Credited',
      createdAt: new Date().toISOString()
    });

    this.data.portfolios[id] = [];
    this.scheduleSave();
    return newUser;
  }

  public verifyUserPassword(userId: string, passwordPlain: string): boolean {
    const hash = this.data.passwords[userId];
    return hash === hashPassword(passwordPlain);
  }

  public resetUserPassword(userId: string, newPasswordPlain: string): boolean {
    if (!this.data.passwords[userId]) return false;
    this.data.passwords[userId] = hashPassword(newPasswordPlain);
    this.scheduleSave();
    return true;
  }

  public getProfile(userId: string): UserProfile {
    return this.data.profiles[userId] || {
      userId,
      tradingExperience: 'beginner',
      riskTolerance: 'moderate',
      preferredCurrency: 'INR',
      notificationsEnabled: true,
      theme: 'dark'
    };
  }

  public updateProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
    const current = this.getProfile(userId);
    const updated = { ...current, ...updates };
    this.data.profiles[userId] = updated;
    this.scheduleSave();
    return updated;
  }

  // --- Virtual Wallet ---
  public getWallet(userId: string): VirtualWallet {
    if (!this.data.virtual_wallets[userId]) {
      this.data.virtual_wallets[userId] = {
        userId,
        balance: 500000,
        reservedBalance: 0,
        totalDeposited: 500000,
        totalWithdrawn: 0,
        currency: 'INR'
      };
      this.scheduleSave();
    }
    return this.data.virtual_wallets[userId];
  }

  public addVirtualDeposit(
    userId: string,
    amount: number,
    method: VirtualDeposit['method']
  ): { deposit: VirtualDeposit; wallet: VirtualWallet } {
    const wallet = this.getWallet(userId);
    wallet.balance += amount;
    wallet.totalDeposited += amount;

    const deposit: VirtualDeposit = {
      id: `dep_${crypto.randomUUID().slice(0, 8)}`,
      userId,
      amount,
      method,
      status: 'COMPLETED',
      step: 4,
      createdAt: new Date().toISOString()
    };
    this.data.virtual_deposits.push(deposit);

    this.data.transactions.push({
      id: `txn_${crypto.randomUUID().slice(0, 8)}`,
      userId,
      type: 'VIRTUAL_DEPOSIT',
      amount,
      status: 'COMPLETED',
      description: `Virtual Deposit via ${method.replace('_', ' ')}`,
      referenceId: deposit.id,
      createdAt: new Date().toISOString()
    });

    this.scheduleSave();
    return { deposit, wallet };
  }

  public requestVirtualWithdrawal(
    userId: string,
    amount: number,
    simulatedBankName: string,
    simulatedAccountMask: string
  ): { withdrawal: VirtualWithdrawal; wallet: VirtualWallet } | { error: string } {
    const wallet = this.getWallet(userId);
    if (wallet.balance < amount) {
      return { error: 'Insufficient virtual cash balance for withdrawal learning flow' };
    }
    wallet.balance -= amount;
    wallet.totalWithdrawn += amount;

    const withdrawal: VirtualWithdrawal = {
      id: `wth_${crypto.randomUUID().slice(0, 8)}`,
      userId,
      amount,
      simulatedBankName,
      simulatedAccountMask,
      status: 'PROCESSING',
      settlementCycle: 'T+1',
      createdAt: new Date().toISOString(),
      estimatedSettlementAt: new Date(Date.now() + 86400000).toISOString()
    };
    this.data.virtual_withdrawals.push(withdrawal);

    this.data.transactions.push({
      id: `txn_${crypto.randomUUID().slice(0, 8)}`,
      userId,
      type: 'VIRTUAL_WITHDRAWAL',
      amount,
      status: 'PENDING',
      description: `Virtual Withdrawal to ${simulatedBankName} (${simulatedAccountMask})`,
      referenceId: withdrawal.id,
      createdAt: new Date().toISOString()
    });

    this.scheduleSave();
    return { withdrawal, wallet };
  }

  // --- Stocks ---
  public getStocks(): Stock[] {
    return this.data.stocks;
  }

  public getStockBySymbol(symbol: string): Stock | undefined {
    return this.data.stocks.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
  }

  public getStockHistory(symbol: string, timeframe: StockHistory['timeframe']): PricePoint[] {
    const sym = symbol.toUpperCase();
    if (!this.data.simulated_prices) {
      this.data.simulated_prices = {};
    }
    const map = this.data.simulated_prices[sym] || {};
    const key = timeframe === 'MAX' ? (map['MAX'] ? 'MAX' : 'ALL') : timeframe;

    if (!map[key]) {
      const stk = this.getStockBySymbol(sym);
      const generated = generateInitialHistory(stk ? stk.currentPrice : 1000);
      this.data.simulated_prices[sym] = { ...map, ...generated };
      this.scheduleSave();
      return this.data.simulated_prices[sym][timeframe] || this.data.simulated_prices[sym][key] || this.data.simulated_prices[sym]['1D'] || [];
    }
    return map[key] || map['1D'] || [];
  }

  // --- Orders & Portfolio ---
  public getOrders(userId: string): Order[] {
    return this.data.orders.filter((o) => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getRealizedPnL(userId: string): number {
    const wallet = this.getWallet(userId);
    return Number((wallet.realizedPnL || 0).toFixed(2));
  }

  public getPortfolioHoldings(userId: string): PortfolioHolding[] {
    const holdings = this.data.portfolios[userId] || [];
    // Recalculate current market prices & returns dynamically
    return holdings.map((h) => {
      const stock = this.getStockBySymbol(h.symbol);
      const curPrice = stock ? stock.currentPrice : h.averageBuyPrice;
      const curVal = Number((h.quantity * curPrice).toFixed(2));
      const pnl = Number((curVal - h.investedValue).toFixed(2));
      const pnlPercent = h.investedValue > 0 ? Number(((pnl / h.investedValue) * 100).toFixed(2)) : 0;
      const oneDayChange = stock ? stock.change : 0;
      const dayPnL = Number((h.quantity * oneDayChange).toFixed(2));
      const dayPnLPercent = stock ? stock.changePercent : 0;

      return {
        ...h,
        currentPrice: curPrice,
        currentValue: curVal,
        unrealizedPnL: pnl,
        unrealizedPnLPercent: pnlPercent,
        oneDayPnL: dayPnL,
        oneDayPnLPercent: dayPnLPercent
      };
    });
  }

  public placeOrder(
    userId: string,
    symbol: string,
    side: 'BUY' | 'SELL',
    orderType: 'MARKET' | 'LIMIT',
    quantity: number,
    limitPrice?: number
  ): { order: Order; wallet: VirtualWallet } | { error: string } {
    const stock = this.getStockBySymbol(symbol);
    if (!stock) return { error: 'Invalid stock symbol' };
    if (quantity <= 0 || !Number.isInteger(quantity)) return { error: 'Quantity must be a positive whole number' };

    const wallet = this.getWallet(userId);
    const executionPrice = orderType === 'MARKET' ? stock.currentPrice : (limitPrice || stock.currentPrice);
    const totalCost = Number((executionPrice * quantity).toFixed(2));

    if (side === 'BUY') {
      if (orderType === 'MARKET') {
        if (wallet.balance < totalCost) {
          return { error: `Insufficient virtual cash. Required: ₹${totalCost.toLocaleString('en-IN')}, Available: ₹${wallet.balance.toLocaleString('en-IN')}` };
        }
        // Deduct balance
        wallet.balance = Number((wallet.balance - totalCost).toFixed(2));

        // Update portfolio
        let holdings = this.data.portfolios[userId] || [];
        const existingIndex = holdings.findIndex((h) => h.symbol === stock.symbol);

        if (existingIndex >= 0) {
          const prev = holdings[existingIndex];
          const newQty = prev.quantity + quantity;
          const newInvested = Number((prev.investedValue + totalCost).toFixed(2));
          const newAvg = Number((newInvested / newQty).toFixed(2));
          holdings[existingIndex] = {
            ...prev,
            quantity: newQty,
            averageBuyPrice: newAvg,
            investedValue: newInvested,
            currentPrice: stock.currentPrice,
            currentValue: Number((newQty * stock.currentPrice).toFixed(2))
          };
        } else {
          holdings.push({
            id: `hld_${crypto.randomUUID().slice(0, 8)}`,
            userId,
            stockId: stock.id,
            symbol: stock.symbol,
            stockName: stock.name,
            sector: stock.sector,
            quantity,
            averageBuyPrice: executionPrice,
            currentPrice: stock.currentPrice,
            investedValue: totalCost,
            currentValue: totalCost,
            unrealizedPnL: 0,
            unrealizedPnLPercent: 0,
            oneDayPnL: Number((quantity * stock.change).toFixed(2)),
            oneDayPnLPercent: stock.changePercent
          });
        }
        this.data.portfolios[userId] = holdings;

        // Create Order
        const order: Order = {
          id: `ord_${crypto.randomUUID().slice(0, 8)}`,
          userId,
          stockId: stock.id,
          symbol: stock.symbol,
          stockName: stock.name,
          side: 'BUY',
          orderType: 'MARKET',
          quantity,
          price: executionPrice,
          executedPrice: executionPrice,
          status: 'EXECUTED',
          totalAmount: totalCost,
          createdAt: new Date().toISOString(),
          executedAt: new Date().toISOString()
        };
        this.data.orders.push(order);

        // Transaction
        this.data.transactions.push({
          id: `txn_${crypto.randomUUID().slice(0, 8)}`,
          userId,
          type: 'BUY_ORDER',
          amount: totalCost,
          status: 'COMPLETED',
          description: `Bought ${quantity} shares of ${stock.symbol} @ ₹${executionPrice.toFixed(2)}`,
          referenceId: order.id,
          stock: stock.symbol,
          quantity,
          price: executionPrice,
          orderType: 'MARKET',
          createdAt: new Date().toISOString()
        });

        this.scheduleSave();
        return { order, wallet };
      } else {
        // LIMIT BUY
        if (wallet.balance < totalCost) {
          return { error: `Insufficient virtual cash for limit order. Required: ₹${totalCost.toLocaleString('en-IN')}` };
        }
        // Reserve balance
        wallet.balance = Number((wallet.balance - totalCost).toFixed(2));
        wallet.reservedBalance = Number(((wallet.reservedBalance || 0) + totalCost).toFixed(2));

        const order: Order = {
          id: `ord_${crypto.randomUUID().slice(0, 8)}`,
          userId,
          stockId: stock.id,
          symbol: stock.symbol,
          stockName: stock.name,
          side: 'BUY',
          orderType: 'LIMIT',
          quantity,
          price: executionPrice,
          status: 'PENDING',
          totalAmount: totalCost,
          createdAt: new Date().toISOString()
        };
        this.data.orders.push(order);
        this.scheduleSave();
        return { order, wallet };
      }
    } else {
      // SELL ORDER
      const holdings = this.data.portfolios[userId] || [];
      const holding = holdings.find((h) => h.symbol === stock.symbol);
      if (!holding || holding.quantity < quantity) {
        return { error: `Insufficient holdings. You own ${holding ? holding.quantity : 0} shares of ${stock.symbol}` };
      }

      if (orderType === 'MARKET') {
        const proceeds = Number((stock.currentPrice * quantity).toFixed(2));
        wallet.balance = Number((wallet.balance + proceeds).toFixed(2));

        // Deduct from holding
        if (holding.quantity === quantity) {
          this.data.portfolios[userId] = holdings.filter((h) => h.symbol !== stock.symbol);
        } else {
          holding.quantity -= quantity;
          holding.investedValue = Number((holding.quantity * holding.averageBuyPrice).toFixed(2));
          holding.currentValue = Number((holding.quantity * stock.currentPrice).toFixed(2));
        }

        const realizedGain = Number(((stock.currentPrice - holding.averageBuyPrice) * quantity).toFixed(2));
        wallet.realizedPnL = Number(((wallet.realizedPnL || 0) + realizedGain).toFixed(2));

        const order: Order = {
          id: `ord_${crypto.randomUUID().slice(0, 8)}`,
          userId,
          stockId: stock.id,
          symbol: stock.symbol,
          stockName: stock.name,
          side: 'SELL',
          orderType: 'MARKET',
          quantity,
          price: stock.currentPrice,
          executedPrice: stock.currentPrice,
          status: 'EXECUTED',
          totalAmount: proceeds,
          createdAt: new Date().toISOString(),
          executedAt: new Date().toISOString()
        };
        this.data.orders.push(order);

        this.data.transactions.push({
          id: `txn_${crypto.randomUUID().slice(0, 8)}`,
          userId,
          type: 'SELL_ORDER',
          amount: proceeds,
          status: 'COMPLETED',
          description: `Sold ${quantity} shares of ${stock.symbol} @ ₹${stock.currentPrice.toFixed(2)} (${realizedGain >= 0 ? '+' : ''}₹${realizedGain.toFixed(2)} P&L)`,
          referenceId: order.id,
          stock: stock.symbol,
          quantity,
          price: stock.currentPrice,
          orderType: 'MARKET',
          createdAt: new Date().toISOString()
        });

        this.scheduleSave();
        return { order, wallet };
      } else {
        // LIMIT SELL
        const order: Order = {
          id: `ord_${crypto.randomUUID().slice(0, 8)}`,
          userId,
          stockId: stock.id,
          symbol: stock.symbol,
          stockName: stock.name,
          side: 'SELL',
          orderType: 'LIMIT',
          quantity,
          price: executionPrice,
          status: 'PENDING',
          totalAmount: totalCost,
          createdAt: new Date().toISOString()
        };
        this.data.orders.push(order);
        this.scheduleSave();
        return { order, wallet };
      }
    }
  }

  public cancelOrder(userId: string, orderId: string): { success: boolean; error?: string } {
    const order = this.data.orders.find((o) => o.id === orderId && o.userId === userId);
    if (!order) return { success: false, error: 'Order not found' };
    if (order.status !== 'PENDING') return { success: false, error: 'Only pending orders can be cancelled' };

    order.status = 'CANCELLED';

    // If BUY limit order was pending, refund reserved balance back to free balance
    if (order.side === 'BUY' && order.orderType === 'LIMIT') {
      const wallet = this.getWallet(userId);
      wallet.reservedBalance = Math.max(0, Number((wallet.reservedBalance - order.totalAmount).toFixed(2)));
      wallet.balance = Number((wallet.balance + order.totalAmount).toFixed(2));
    }

    this.scheduleSave();
    return { success: true };
  }

  public getTransactions(userId: string): Transaction[] {
    return this.data.transactions
      .filter((t) => t.userId === userId || t.isPublicInvestorEntry === true)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getCommunityTransactions(): Transaction[] {
    return this.data.transactions
      .filter((t) => t.isPublicInvestorEntry === true)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getSettings(): SimulatorSettings {
    return this.data.simulator_settings;
  }

  public updateSettings(updates: Partial<SimulatorSettings>): SimulatorSettings {
    this.data.simulator_settings = { ...this.data.simulator_settings, ...updates };
    this.scheduleSave();
    return this.data.simulator_settings;
  }

  // --- Admin features ---
  public findAdminByUsername(identifier: string): AdminUser | undefined {
    return this.data.admin_users?.find(
      (a) => a.username.toLowerCase() === identifier.toLowerCase() ||
             a.email.toLowerCase() === identifier.toLowerCase()
    );
  }

  public verifyAdminPassword(admin: AdminUser, passwordPlain: string): boolean {
    return admin.passwordHash === hashPassword(passwordPlain);
  }

  public getAdminStats() {
    const totalUsers = this.data.users.length;
    const totalOrders = this.data.orders.length;
    const totalTradingVolume = this.data.orders.reduce((sum, o) => sum + (o.status === 'EXECUTED' ? o.totalAmount : 0), 0);
    const totalVirtualDeposits = this.data.virtual_deposits.reduce((sum, d) => sum + d.amount, 0);
    const totalVirtualWithdrawals = this.data.virtual_withdrawals.reduce((sum, w) => sum + w.amount, 0);

    return {
      totalUsers,
      totalOrders,
      totalTradingVolume,
      totalVirtualDeposits,
      totalVirtualWithdrawals,
      activeStocksCount: this.data.stocks.length,
      marketStatus: this.data.simulator_settings.marketStatus,
      volatility: this.data.simulator_settings.volatilityMultiplier
    };
  }

  public adminUpdateStock(symbol: string, updates: Partial<Stock>): Stock | null {
    const stk = this.getStockBySymbol(symbol);
    if (!stk) return null;
    Object.assign(stk, updates);
    if (updates.currentPrice !== undefined) {
      stk.change = Number((stk.currentPrice - stk.previousClose).toFixed(2));
      stk.changePercent = Number(((stk.change / stk.previousClose) * 100).toFixed(2));
      if (stk.currentPrice > stk.highPrice) stk.highPrice = stk.currentPrice;
      if (stk.currentPrice < stk.lowPrice) stk.lowPrice = stk.currentPrice;
      if (!stk.historicalTrend) stk.historicalTrend = [];
      stk.historicalTrend.push(stk.currentPrice);
      if (stk.historicalTrend.length > 15) stk.historicalTrend.shift();
    }
    this.scheduleSave();
    return stk;
  }

  public getAllUserHoldings(): AdminUserHolding[] {
    const result: AdminUserHolding[] = [];
    const users = this.data.users || [];

    for (const u of users) {
      const holdings = this.getPortfolioHoldings(u.id) || [];
      for (const h of holdings) {
        const stk = this.getStockBySymbol(h.symbol);
        result.push({
          userId: u.id,
          userName: u.name,
          userEmail: u.email,
          holdingId: h.id,
          stockId: h.stockId,
          symbol: h.symbol,
          stockName: h.stockName,
          sector: h.sector,
          quantity: h.quantity,
          averageBuyPrice: h.averageBuyPrice,
          currentPrice: h.currentPrice,
          investedValue: h.investedValue,
          currentValue: h.currentValue,
          unrealizedPnL: h.unrealizedPnL,
          unrealizedPnLPercent: h.unrealizedPnLPercent,
          priceOverrideLocked: stk?.priceOverrideLocked,
          targetBias: stk?.targetBias || 'NONE'
        });
      }
    }
    return result;
  }

  public adminManipulateHoldingPnL(params: {
    userId?: string;
    symbol: string;
    mode: 'TARGET_PNL_PERCENT' | 'TARGET_PNL_AMOUNT' | 'EXACT_PRICE' | 'SET_BIAS' | 'RESET';
    targetPercent?: number;
    targetAmount?: number;
    exactPrice?: number;
    targetBias?: StockBias;
    lockPrice?: boolean;
    biasSpeed?: number;
  }): { stock: Stock; message: string; calculatedPrice?: number } | { error: string } {
    const stk = this.getStockBySymbol(params.symbol);
    if (!stk) return { error: `Stock ${params.symbol} not found.` };

    let targetPrice = stk.currentPrice;

    // If userId is provided, look up that user's holding
    let holding: PortfolioHolding | undefined;
    if (params.userId) {
      const userHoldings = this.getPortfolioHoldings(params.userId);
      holding = userHoldings.find((h) => h.symbol.toUpperCase() === params.symbol.toUpperCase());
    }

    const refAvgPrice = holding ? holding.averageBuyPrice : stk.currentPrice;
    const refQuantity = holding ? holding.quantity : 1;

    switch (params.mode) {
      case 'TARGET_PNL_PERCENT': {
        const pct = params.targetPercent ?? 10;
        targetPrice = Number(Math.max(1, (refAvgPrice * (1 + pct / 100))).toFixed(2));
        stk.currentPrice = targetPrice;
        stk.priceOverrideLocked = true;
        stk.adminControlled = true;
        break;
      }
      case 'TARGET_PNL_AMOUNT': {
        const amt = params.targetAmount ?? 5000;
        targetPrice = Number(Math.max(1, (refAvgPrice + (amt / refQuantity))).toFixed(2));
        stk.currentPrice = targetPrice;
        stk.priceOverrideLocked = true;
        stk.adminControlled = true;
        break;
      }
      case 'EXACT_PRICE': {
        if (!params.exactPrice || params.exactPrice <= 0) {
          return { error: 'Invalid exact price provided.' };
        }
        targetPrice = Number(params.exactPrice.toFixed(2));
        stk.currentPrice = targetPrice;
        stk.priceOverrideLocked = params.lockPrice !== undefined ? params.lockPrice : true;
        stk.adminControlled = true;
        break;
      }
      case 'SET_BIAS': {
        stk.targetBias = params.targetBias || 'NONE';
        stk.priceOverrideLocked = true;
        stk.adminControlled = true;
        if (params.biasSpeed) stk.biasSpeed = params.biasSpeed;
        if (stk.targetBias === 'UPPER_CIRCUIT') {
          targetPrice = Number((stk.previousClose * 1.20).toFixed(2));
          stk.currentPrice = targetPrice;
        } else if (stk.targetBias === 'LOWER_CIRCUIT') {
          targetPrice = Number((stk.previousClose * 0.80).toFixed(2));
          stk.currentPrice = targetPrice;
        }
        break;
      }
      case 'RESET': {
        stk.priceOverrideLocked = false;
        stk.targetBias = 'NONE';
        stk.adminControlled = false;
        break;
      }
    }

    if (params.mode !== 'RESET') {
      stk.change = Number((stk.currentPrice - stk.previousClose).toFixed(2));
      stk.changePercent = Number(((stk.change / stk.previousClose) * 100).toFixed(2));
      stk.highPrice = Math.max(stk.highPrice, stk.currentPrice);
      stk.lowPrice = Math.min(stk.lowPrice, stk.currentPrice);

      if (!stk.historicalTrend) stk.historicalTrend = [];
      stk.historicalTrend.push(stk.currentPrice);
      if (stk.historicalTrend.length > 15) stk.historicalTrend.shift();

      const nowIso = new Date().toISOString();
      if (!this.data.simulated_prices[stk.symbol]) {
        this.data.simulated_prices[stk.symbol] = generateInitialHistory(stk.currentPrice);
      }
      const history1D = this.data.simulated_prices[stk.symbol]['1D'];
      if (history1D) {
        history1D.push({
          time: nowIso,
          price: stk.currentPrice,
          volume: stk.volume
        });
        if (history1D.length > 60) history1D.shift();
      }
    }

    this.scheduleSave();
    this.tickSimulation();

    return {
      stock: stk,
      message: `Price movement updated for ${stk.symbol} (New Price: ₹${stk.currentPrice})`,
      calculatedPrice: stk.currentPrice
    };
  }

  public adminAddStock(stockData: Omit<Stock, 'historicalTrend'>): Stock {
    const existing = this.getStockBySymbol(stockData.symbol);
    if (existing) return existing;
    const trend = [
      stockData.previousClose,
      stockData.openPrice,
      stockData.lowPrice,
      stockData.highPrice,
      stockData.currentPrice
    ];
    const newStock: Stock = {
      ...stockData,
      id: `stk_${crypto.randomUUID().slice(0, 8)}`,
      historicalTrend: trend
    };
    this.data.stocks.push(newStock);
    this.data.simulated_prices[newStock.symbol] = generateInitialHistory(newStock.currentPrice);
    this.scheduleSave();
    return newStock;
  }

  public adminAdjustUserBalance(userId: string, newBalance: number): VirtualWallet | null {
    const wallet = this.getWallet(userId);
    if (!wallet) return null;
    wallet.balance = newBalance;
    this.data.transactions.push({
      id: `txn_${crypto.randomUUID().slice(0, 8)}`,
      userId,
      type: 'VIRTUAL_DEPOSIT',
      amount: newBalance,
      status: 'COMPLETED',
      description: 'Simulator Admin Manual Virtual Balance Adjustment',
      createdAt: new Date().toISOString()
    });
    this.scheduleSave();
    return wallet;
  }

  public resetUserAccount(userId: string): { wallet: VirtualWallet } {
    const wallet = this.getWallet(userId);
    wallet.balance = 500000;
    wallet.reservedBalance = 0;
    this.data.portfolios[userId] = [];
    this.data.orders = this.data.orders.filter((o) => o.userId !== userId);
    this.scheduleSave();
    return { wallet };
  }

  public creditSimulatedDividend(userId: string, symbol: string, amountPerShare: number): { wallet: VirtualWallet; transaction: Transaction } | { error: string } {
    const wallet = this.getWallet(userId);
    const holdings = this.data.portfolios[userId] || [];
    const holding = holdings.find((h) => h.symbol === symbol);
    if (!holding || holding.quantity <= 0) {
      return { error: `No shares held in ${symbol} for dividend distribution.` };
    }
    const totalDividend = Number((holding.quantity * amountPerShare).toFixed(2));
    wallet.balance = Number((wallet.balance + totalDividend).toFixed(2));

    const transaction: Transaction = {
      id: `txn_${crypto.randomUUID().slice(0, 8)}`,
      userId,
      type: 'DIVIDEND_CREDIT',
      amount: totalDividend,
      status: 'COMPLETED',
      description: `Simulated Corporate Action: Dividend payout of ₹${amountPerShare.toFixed(2)}/share on ${holding.quantity} shares of ${symbol}`,
      createdAt: new Date().toISOString()
    };
    this.data.transactions.push(transaction);
    this.scheduleSave();
    return { wallet, transaction };
  }

  // --- Detailed User Simulated Investment, P&L, and Ledger History ---
  public getAdminUsersDetailed(): any[] {
    const users = this.data.users || [];
    return users.map((u) => {
      const wallet = this.getWallet(u.id);
      const holdings = this.getPortfolioHoldings(u.id) || [];
      const orders = (this.data.orders || []).filter((o) => o.userId === u.id);
      const deposits = (this.data.virtual_deposits || []).filter((d) => d.userId === u.id);
      const withdrawals = (this.data.virtual_withdrawals || []).filter((w) => w.userId === u.id);
      const transactions = (this.data.transactions || []).filter((t) => t.userId === u.id);

      const totalInvested = holdings.reduce((sum, h) => sum + (h.investedValue || 0), 0);
      const currentPortfolioValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
      const unrealizedPnL = Number((currentPortfolioValue - totalInvested).toFixed(2));
      const unrealizedPnLPercent = totalInvested > 0 ? Number(((unrealizedPnL / totalInvested) * 100).toFixed(2)) : 0;
      const realizedPnL = wallet.realizedPnL || 0;
      const netPnL = Number((unrealizedPnL + realizedPnL).toFixed(2));
      const netPnLPercent = totalInvested > 0 ? unrealizedPnLPercent : 0;
      const totalNetWorth = Number((wallet.balance + currentPortfolioValue).toFixed(2));

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        createdAt: u.createdAt,
        simulatedWallet: {
          balance: wallet.balance,
          reservedBalance: wallet.reservedBalance,
          totalDeposited: wallet.totalDeposited,
          totalWithdrawn: wallet.totalWithdrawn,
          realizedPnL: wallet.realizedPnL || 0,
          currency: wallet.currency
        },
        simulatedInvestment: {
          totalInvested: Number(totalInvested.toFixed(2)),
          currentPortfolioValue: Number(currentPortfolioValue.toFixed(2)),
          totalNetWorth: Number(totalNetWorth.toFixed(2))
        },
        simulatedPnL: {
          unrealizedPnL,
          unrealizedPnLPercent,
          realizedPnL,
          netPnL,
          netPnLPercent
        },
        holdings: holdings.map((h) => {
          const stk = this.getStockBySymbol(h.symbol);
          return {
            ...h,
            priceOverrideLocked: stk?.priceOverrideLocked || false,
            targetBias: stk?.targetBias || 'NONE'
          };
        }),
        transactionHistory: {
          orders: [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
          deposits: [...deposits].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
          withdrawals: [...withdrawals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
          transactions: [...transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }
      };
    });
  }

  // Edit simulated holding (quantity, averageBuyPrice) directly for a user
  public adminEditUserHolding(userId: string, symbol: string, quantity: number, averageBuyPrice: number): { success: boolean; message: string; holdings: PortfolioHolding[] } {
    if (!this.data.portfolios[userId]) {
      this.data.portfolios[userId] = [];
    }
    const holdings = this.data.portfolios[userId];
    const stock = this.getStockBySymbol(symbol);
    const stockName = stock?.name || symbol;
    const sector = stock?.sector || 'Diversified';
    const curPrice = stock ? stock.currentPrice : averageBuyPrice;

    const existingIndex = holdings.findIndex((h) => h.symbol.toUpperCase() === symbol.toUpperCase());

    if (quantity <= 0) {
      if (existingIndex >= 0) {
        holdings.splice(existingIndex, 1);
        this.scheduleSave();
        return { success: true, message: `Removed simulated holding ${symbol} from user`, holdings: this.getPortfolioHoldings(userId) };
      }
      return { success: false, message: `Holding ${symbol} not found`, holdings: this.getPortfolioHoldings(userId) };
    }

    const investedValue = Number((quantity * averageBuyPrice).toFixed(2));
    const currentValue = Number((quantity * curPrice).toFixed(2));
    const pnl = Number((currentValue - investedValue).toFixed(2));
    const pnlPercent = investedValue > 0 ? Number(((pnl / investedValue) * 100).toFixed(2)) : 0;

    if (existingIndex >= 0) {
      holdings[existingIndex] = {
        ...holdings[existingIndex],
        quantity,
        averageBuyPrice,
        investedValue,
        currentPrice: curPrice,
        currentValue,
        unrealizedPnL: pnl,
        unrealizedPnLPercent: pnlPercent
      };
    } else {
      holdings.push({
        id: `hld_${crypto.randomUUID().slice(0, 8)}`,
        userId,
        stockId: stock?.id || `stk_${symbol.toLowerCase()}`,
        symbol: symbol.toUpperCase(),
        stockName,
        sector,
        quantity,
        averageBuyPrice,
        currentPrice: curPrice,
        investedValue,
        currentValue,
        unrealizedPnL: pnl,
        unrealizedPnLPercent: pnlPercent,
        oneDayPnL: 0,
        oneDayPnLPercent: 0,
        createdAt: new Date().toISOString()
      });
    }

    this.data.transactions.push({
      id: `txn_${crypto.randomUUID().slice(0, 8)}`,
      userId,
      type: 'SIMULATED_PORTFOLIO_OVERRIDE',
      amount: investedValue,
      status: 'COMPLETED',
      description: `Admin updated simulated holding: ${quantity} shares of ${symbol} @ ₹${averageBuyPrice}`,
      createdAt: new Date().toISOString()
    });

    this.scheduleSave();
    return { success: true, message: `Updated simulated holding ${symbol} for user`, holdings: this.getPortfolioHoldings(userId) };
  }

  // Delete simulated holding from user
  public adminDeleteUserHolding(userId: string, symbol: string): { success: boolean; message: string; holdings: PortfolioHolding[] } {
    if (!this.data.portfolios[userId]) {
      return { success: false, message: 'User has no holdings', holdings: [] };
    }
    const holdings = this.data.portfolios[userId];
    const idx = holdings.findIndex((h) => h.symbol.toUpperCase() === symbol.toUpperCase());
    if (idx >= 0) {
      holdings.splice(idx, 1);
      this.data.transactions.push({
        id: `txn_${crypto.randomUUID().slice(0, 8)}`,
        userId,
        type: 'SIMULATED_PORTFOLIO_OVERRIDE',
        amount: 0,
        status: 'COMPLETED',
        description: `Admin removed simulated holding ${symbol}`,
        createdAt: new Date().toISOString()
      });
      this.scheduleSave();
      return { success: true, message: `Removed simulated holding ${symbol}`, holdings: this.getPortfolioHoldings(userId) };
    }
    return { success: false, message: `Holding ${symbol} not found`, holdings: this.getPortfolioHoldings(userId) };
  }

  // Inject profit or loss directly into user's simulated account
  public adminInjectUserPnL(userId: string, amount: number, type: 'PROFIT' | 'LOSS', reason?: string): { success: boolean; wallet: VirtualWallet; message: string } {
    const wallet = this.getWallet(userId);
    const note = reason || (type === 'PROFIT' ? 'Admin Simulated Profit Credit' : 'Admin Simulated Loss Adjustment');
    if (type === 'PROFIT') {
      wallet.balance = Number((wallet.balance + amount).toFixed(2));
      wallet.realizedPnL = Number(((wallet.realizedPnL || 0) + amount).toFixed(2));
    } else {
      wallet.balance = Math.max(0, Number((wallet.balance - amount).toFixed(2)));
      wallet.realizedPnL = Number(((wallet.realizedPnL || 0) - amount).toFixed(2));
    }

    this.data.transactions.push({
      id: `txn_${crypto.randomUUID().slice(0, 8)}`,
      userId,
      type: type === 'PROFIT' ? 'SIMULATED_PROFIT_INJECTION' : 'SIMULATED_LOSS_DEDUCTION',
      amount,
      status: 'COMPLETED',
      description: `${note}: ${type === 'PROFIT' ? '+' : '-'}₹${amount.toLocaleString('en-IN')}`,
      createdAt: new Date().toISOString()
    });

    this.scheduleSave();
    return { success: true, wallet, message: `Successfully injected simulated ${type} of ₹${amount.toLocaleString('en-IN')}` };
  }

  // Change Admin Password securely without hardcoding
  public adminChangePassword(adminId: string, currentPlain: string, newPlain: string): { success: boolean; message: string } {
    const admin = this.data.admin_users?.find((a) => a.id === adminId || a.username.toLowerCase() === adminId.toLowerCase());
    if (!admin) {
      return { success: false, message: 'Admin account not found' };
    }
    if (admin.passwordHash !== hashPassword(currentPlain)) {
      return { success: false, message: 'Current password does not match' };
    }
    if (!newPlain || newPlain.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters' };
    }
    admin.passwordHash = hashPassword(newPlain);
    this.scheduleSave();
    return { success: true, message: 'Admin password successfully updated' };
  }

  // --- Background Tick Simulation Engine ---
  public tickSimulation() {
    const settings = this.data.simulator_settings;
    if (settings.marketStatus !== 'OPEN') return;

    const volatility = settings.volatilityMultiplier || 1.0;
    const nowIso = new Date().toISOString();

    // 1. Update prices for all stocks
    this.data.stocks.forEach((stk) => {
      let shock = 0;
      if (stk.targetBias === 'PUMP') {
        // Continuous upward rally: +0.6% to +1.8% per tick
        const speed = stk.biasSpeed || 0.012;
        shock = speed * (0.8 + Math.random() * 0.4);
      } else if (stk.targetBias === 'DUMP') {
        // Continuous downward crash: -0.6% to -1.8% per tick
        const speed = stk.biasSpeed || 0.012;
        shock = -speed * (0.8 + Math.random() * 0.4);
      } else if (stk.targetBias === 'UPPER_CIRCUIT') {
        const circuitLimit = Number((stk.previousClose * 1.20).toFixed(2));
        if (stk.currentPrice < circuitLimit) {
          stk.currentPrice = circuitLimit;
        }
        shock = 0;
      } else if (stk.targetBias === 'LOWER_CIRCUIT') {
        const circuitLimit = Number((stk.previousClose * 0.80).toFixed(2));
        if (stk.currentPrice > circuitLimit) {
          stk.currentPrice = circuitLimit;
        }
        shock = 0;
      } else if (stk.priceOverrideLocked) {
        // Admin locked this fixed price; ignore random brownian jitter
        shock = 0;
      } else {
        // Random walk with drift based on market trend
        const trendBias = settings.marketTrend === 'BULLISH' ? 0.0003 : settings.marketTrend === 'BEARISH' ? -0.0003 : 0;
        shock = (Math.random() - 0.495 + trendBias) * 0.003 * volatility;
      }

      const oldPrice = stk.currentPrice;
      const newPrice = shock !== 0 ? Math.max(1, Number((oldPrice * (1 + shock)).toFixed(2))) : oldPrice;

      stk.currentPrice = newPrice;
      stk.change = Number((newPrice - stk.previousClose).toFixed(2));
      stk.changePercent = Number(((stk.change / stk.previousClose) * 100).toFixed(2));
      if (newPrice > stk.highPrice) stk.highPrice = newPrice;
      if (newPrice < stk.lowPrice) stk.lowPrice = newPrice;
      stk.volume += Math.floor(Math.random() * 500) + 50;

      // Update sparkline trend
      if (!stk.historicalTrend) stk.historicalTrend = [];
      stk.historicalTrend.push(newPrice);
      if (stk.historicalTrend.length > 15) stk.historicalTrend.shift();

      // Append to 1D price history
      if (!this.data.simulated_prices[stk.symbol]) {
        this.data.simulated_prices[stk.symbol] = generateInitialHistory(newPrice);
      }
      const history1D = this.data.simulated_prices[stk.symbol]['1D'];
      if (history1D) {
        history1D.push({
          time: nowIso,
          price: newPrice,
          volume: stk.volume
        });
        if (history1D.length > 60) history1D.shift();
      }
    });

    // 2. Evaluate Pending Limit Orders
    this.data.orders.forEach((ord) => {
      if (ord.status !== 'PENDING') return;
      const stock = this.getStockBySymbol(ord.symbol);
      if (!stock) return;

      // Check buy limit: executed when market price <= limit price
      if (ord.side === 'BUY' && stock.currentPrice <= ord.price) {
        ord.status = 'EXECUTED';
        ord.executedPrice = stock.currentPrice;
        ord.executedAt = nowIso;

        const wallet = this.getWallet(ord.userId);
        const actualCost = Number((stock.currentPrice * ord.quantity).toFixed(2));
        const reservedDifference = ord.totalAmount - actualCost;

        // Refund any price-improvement back to balance
        wallet.reservedBalance = Math.max(0, Number((wallet.reservedBalance - ord.totalAmount).toFixed(2)));
        if (reservedDifference > 0) {
          wallet.balance = Number((wallet.balance + reservedDifference).toFixed(2));
        }

        // Add to portfolio
        let holdings = this.data.portfolios[ord.userId] || [];
        const existingIndex = holdings.findIndex((h) => h.symbol === stock.symbol);
        if (existingIndex >= 0) {
          const prev = holdings[existingIndex];
          const newQty = prev.quantity + ord.quantity;
          const newInvested = Number((prev.investedValue + actualCost).toFixed(2));
          holdings[existingIndex] = {
            ...prev,
            quantity: newQty,
            averageBuyPrice: Number((newInvested / newQty).toFixed(2)),
            investedValue: newInvested,
            currentPrice: stock.currentPrice,
            currentValue: Number((newQty * stock.currentPrice).toFixed(2))
          };
        } else {
          holdings.push({
            id: `hld_${crypto.randomUUID().slice(0, 8)}`,
            userId: ord.userId,
            stockId: stock.id,
            symbol: stock.symbol,
            stockName: stock.name,
            sector: stock.sector,
            quantity: ord.quantity,
            averageBuyPrice: stock.currentPrice,
            currentPrice: stock.currentPrice,
            investedValue: actualCost,
            currentValue: actualCost,
            unrealizedPnL: 0,
            unrealizedPnLPercent: 0,
            oneDayPnL: Number((ord.quantity * stock.change).toFixed(2)),
            oneDayPnLPercent: stock.changePercent
          });
        }
        this.data.portfolios[ord.userId] = holdings;

        this.data.transactions.push({
          id: `txn_${crypto.randomUUID().slice(0, 8)}`,
          userId: ord.userId,
          type: 'BUY_ORDER',
          amount: actualCost,
          status: 'COMPLETED',
          description: `Limit Order Executed: Bought ${ord.quantity} ${ord.symbol} @ ₹${stock.currentPrice.toFixed(2)}`,
          referenceId: ord.id,
          stock: ord.symbol,
          quantity: ord.quantity,
          price: stock.currentPrice,
          orderType: 'LIMIT',
          createdAt: nowIso
        });
      }

      // Check sell limit: executed when market price >= limit price
      if (ord.side === 'SELL' && stock.currentPrice >= ord.price) {
        const holdings = this.data.portfolios[ord.userId] || [];
        const holding = holdings.find((h) => h.symbol === stock.symbol);
        if (holding && holding.quantity >= ord.quantity) {
          ord.status = 'EXECUTED';
          ord.executedPrice = stock.currentPrice;
          ord.executedAt = nowIso;

          const proceeds = Number((stock.currentPrice * ord.quantity).toFixed(2));
          const wallet = this.getWallet(ord.userId);
          wallet.balance = Number((wallet.balance + proceeds).toFixed(2));

          const realizedGain = Number(((stock.currentPrice - holding.averageBuyPrice) * ord.quantity).toFixed(2));
          wallet.realizedPnL = Number(((wallet.realizedPnL || 0) + realizedGain).toFixed(2));

          if (holding.quantity === ord.quantity) {
            this.data.portfolios[ord.userId] = holdings.filter((h) => h.symbol !== stock.symbol);
          } else {
            holding.quantity -= ord.quantity;
            holding.investedValue = Number((holding.quantity * holding.averageBuyPrice).toFixed(2));
            holding.currentValue = Number((holding.quantity * stock.currentPrice).toFixed(2));
          }

          this.data.transactions.push({
            id: `txn_${crypto.randomUUID().slice(0, 8)}`,
            userId: ord.userId,
            type: 'SELL_ORDER',
            amount: proceeds,
            status: 'COMPLETED',
            description: `Limit Order Executed: Sold ${ord.quantity} ${ord.symbol} @ ₹${stock.currentPrice.toFixed(2)} (${realizedGain >= 0 ? '+' : ''}₹${realizedGain.toFixed(2)} P&L)`,
            referenceId: ord.id,
            stock: ord.symbol,
            quantity: ord.quantity,
            price: stock.currentPrice,
            orderType: 'LIMIT',
            createdAt: nowIso
          });
        }
      }
    });

    this.scheduleSave();
  }

  // ==========================================================
  // EV ENERGY STOCK SIMULATOR ENGINE & FULL ADMIN CONTROL
  // ==========================================================
  public getEvEnergySlots(userId?: string): EvEnergySlot[] {
    if (!this.data.ev_energy_slots) {
      this.data.ev_energy_slots = [];
    }
    if (userId) {
      return this.data.ev_energy_slots.filter((s) => s.userId === userId);
    }
    return [...this.data.ev_energy_slots].reverse();
  }

  public getEvEnergyConfig(): EvEnergyConfig {
    if (!this.data.ev_energy_config) {
      this.data.ev_energy_config = {
        defaultOutcome: 'FORCE_WIN',
        defaultProfitPercent: 300,
        allowedPrices: [1000, 2000, 3000, 5000, 10000, 15000, 20000, 50000],
        allowedDurationsHours: [1, 2]
      };
    }
    // Ensure default profit is 300% if not set
    if (!this.data.ev_energy_config.defaultProfitPercent || this.data.ev_energy_config.defaultProfitPercent < 300) {
      this.data.ev_energy_config.defaultProfitPercent = 300;
    }
    return this.data.ev_energy_config;
  }

  public updateEvEnergyConfig(cfg: Partial<EvEnergyConfig>): EvEnergyConfig {
    const current = this.getEvEnergyConfig();
    this.data.ev_energy_config = {
      ...current,
      ...cfg
    };
    this.scheduleSave();
    return this.data.ev_energy_config;
  }

  public bookEvEnergySlot(
    userId: string,
    tierPrice: number,
    durationHours: number,
    sharesQuantity: number = 1
  ): { success: boolean; slot?: EvEnergySlot; error?: string } {
    const config = this.getEvEnergyConfig();

    // Verify exact price allowed by user brief
    const validPrices = [1000, 2000, 3000, 5000, 10000, 15000, 20000, 50000];
    if (!validPrices.includes(tierPrice)) {
      return {
        success: false,
        error: `Invalid EV Energy share price. Allowed prices: ₹1,000, ₹2,000, ₹3,000, ₹5,000, ₹10,000, ₹15,000, ₹20,000, ₹50,000`
      };
    }

    // Verify duration: 1 or 2 hours
    if (durationHours !== 1 && durationHours !== 2) {
      return { success: false, error: 'EV Energy Stock duration must be 1 Hour or 2 Hours.' };
    }

    const qty = Math.max(1, Math.floor(sharesQuantity || 1));
    const totalInvested = tierPrice * qty;

    const wallet = this.getWallet(userId);
    if (wallet.balance < totalInvested) {
      return {
        success: false,
        error: `Insufficient virtual wallet balance. Needed: ₹${totalInvested.toLocaleString()}, Available: ₹${wallet.balance.toLocaleString()}`
      };
    }

    const user = this.findUserById(userId);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationHours * 3600 * 1000).toISOString();

    // Deduct virtual capital for slot booking
    wallet.balance = Number((wallet.balance - totalInvested).toFixed(2));

    const defaultProfit = Math.round(totalInvested * (config.defaultProfitPercent / 100));

    const slot: EvEnergySlot = {
      id: `EVSLOT-${Math.floor(100000 + Math.random() * 900000)}`,
      userId,
      userName: user?.name || 'Trader',
      userEmail: user?.email || '',
      tierPrice,
      durationHours,
      sharesQuantity: qty,
      totalInvested,
      bookedAt: now.toISOString(),
      expiresAt,
      status: 'ACTIVE',
      adminOutcome: config.defaultOutcome || 'FORCE_WIN',
      profitAmount: defaultProfit,
      lossAmount: totalInvested,
      notes: `EV Energy Stock ${durationHours}-Hour Node Slot`
    };

    if (!this.data.ev_energy_slots) {
      this.data.ev_energy_slots = [];
    }
    this.data.ev_energy_slots.push(slot);

    // Record ledger entry
    this.data.transactions.push({
      id: `txn_${crypto.randomUUID().slice(0, 8)}`,
      userId,
      type: 'EV_ENERGY_SLOT_BOOK',
      amount: totalInvested,
      status: 'COMPLETED',
      description: `Booked EV Energy Stock Slot #${slot.id} (${durationHours}h) @ ₹${tierPrice.toLocaleString()}`,
      referenceId: slot.id,
      createdAt: now.toISOString()
    });

    this.scheduleSave();
    return { success: true, slot };
  }

  public updateEvEnergySlot(
    slotId: string,
    updates: {
      adminOutcome?: 'FORCE_WIN' | 'FORCE_LOSS' | 'PENDING';
      profitAmount?: number;
      lossAmount?: number;
      notes?: string;
    }
  ): { success: boolean; slot?: EvEnergySlot; error?: string } {
    if (!this.data.ev_energy_slots) {
      return { success: false, error: 'No EV energy slots found' };
    }
    const slot = this.data.ev_energy_slots.find((s) => s.id === slotId);
    if (!slot) {
      return { success: false, error: 'EV Energy slot not found' };
    }

    if (updates.adminOutcome !== undefined) {
      slot.adminOutcome = updates.adminOutcome;
    }
    if (updates.profitAmount !== undefined && !isNaN(updates.profitAmount)) {
      slot.profitAmount = Math.max(0, updates.profitAmount);
    }
    if (updates.lossAmount !== undefined && !isNaN(updates.lossAmount)) {
      slot.lossAmount = Math.max(0, updates.lossAmount);
    }
    if (updates.notes !== undefined) {
      slot.notes = updates.notes;
    }

    this.scheduleSave();
    return { success: true, slot };
  }

  public settleEvEnergySlot(
    slotId: string,
    forceOutcome?: 'FORCE_WIN' | 'FORCE_LOSS'
  ): { success: boolean; slot?: EvEnergySlot; result?: 'WIN' | 'LOSS'; payout?: number; error?: string } {
    if (!this.data.ev_energy_slots) {
      return { success: false, error: 'No EV energy slots found' };
    }
    const slot = this.data.ev_energy_slots.find((s) => s.id === slotId);
    if (!slot) {
      return { success: false, error: 'EV Energy slot not found' };
    }

    if (slot.status !== 'ACTIVE') {
      return {
        success: true,
        slot,
        result: slot.status === 'SETTLED_WIN' ? 'WIN' : 'LOSS',
        payout: slot.payoutAmount || 0
      };
    }

    // Determine outcome based on admin full control
    let outcome: 'WIN' | 'LOSS' = 'WIN';
    if (forceOutcome === 'FORCE_WIN') {
      outcome = 'WIN';
    } else if (forceOutcome === 'FORCE_LOSS') {
      outcome = 'LOSS';
    } else if (slot.adminOutcome === 'FORCE_WIN') {
      outcome = 'WIN';
    } else if (slot.adminOutcome === 'FORCE_LOSS') {
      outcome = 'LOSS';
    } else {
      const cfg = this.getEvEnergyConfig();
      outcome = cfg.defaultOutcome === 'FORCE_LOSS' ? 'LOSS' : 'WIN';
    }

    const wallet = this.getWallet(slot.userId);
    const nowIso = new Date().toISOString();

    if (outcome === 'WIN') {
      const payout = Number((slot.totalInvested + slot.profitAmount).toFixed(2));
      wallet.balance = Number((wallet.balance + payout).toFixed(2));
      wallet.realizedPnL = Number(((wallet.realizedPnL || 0) + slot.profitAmount).toFixed(2));

      slot.status = 'SETTLED_WIN';
      slot.payoutAmount = payout;
      slot.settledAt = nowIso;

      this.data.transactions.push({
        id: `txn_${crypto.randomUUID().slice(0, 8)}`,
        userId: slot.userId,
        type: 'EV_ENERGY_PROFIT_PAYOUT',
        amount: payout,
        status: 'COMPLETED',
        description: `EV Energy Slot #${slot.id} Won! Returned principal ₹${slot.totalInvested.toLocaleString()} + profit ₹${slot.profitAmount.toLocaleString()}`,
        referenceId: slot.id,
        createdAt: nowIso
      });

      this.scheduleSave();
      return { success: true, slot, result: 'WIN', payout };
    } else {
      // LOSS
      wallet.realizedPnL = Number(((wallet.realizedPnL || 0) - slot.lossAmount).toFixed(2));

      slot.status = 'SETTLED_LOSS';
      slot.payoutAmount = 0;
      slot.settledAt = nowIso;

      this.data.transactions.push({
        id: `txn_${crypto.randomUUID().slice(0, 8)}`,
        userId: slot.userId,
        type: 'SIMULATED_LOSS_DEDUCTION',
        amount: slot.lossAmount,
        status: 'COMPLETED',
        description: `EV Energy Slot #${slot.id} Expired Out of Range (Loss: ₹${slot.lossAmount.toLocaleString()})`,
        referenceId: slot.id,
        createdAt: nowIso
      });

      this.scheduleSave();
      return { success: true, slot, result: 'LOSS', payout: 0 };
    }
  }
}

export const db = new Database();
