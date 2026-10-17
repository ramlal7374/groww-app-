export interface IndexConstituent {
  symbol: string;
  name: string;
  weightage: number; // in %
  price: number;
  change: number;
  changePercent: number;
}

export interface MarketIndexInfo {
  id: string;
  key: string;
  name: string;
  symbol: string;
  exchange: 'NSE' | 'BSE';
  currentValue: number;
  previousClose: number;
  openValue: number;
  highValue: number;
  lowValue: number;
  change: number;
  changePercent: number;
  week52High: number;
  week52Low: number;
  description: string;
  peRatio: number;
  pbRatio: number;
  divYield: number;
  constituents: IndexConstituent[];
  sparkline: number[];
}

export const MARKET_INDICES: Record<string, MarketIndexInfo> = {
  'nifty-50': {
    id: 'idx_nifty50',
    key: 'nifty-50',
    name: 'NIFTY 50',
    symbol: 'NIFTY 50',
    exchange: 'NSE',
    currentValue: 24858.40,
    previousClose: 24723.20,
    openValue: 24780.00,
    highValue: 24890.50,
    lowValue: 24750.10,
    change: 135.20,
    changePercent: 0.55,
    week52High: 26277.35,
    week52Low: 19672.95,
    description: 'The flagship benchmark Indian equity index of the National Stock Exchange (NSE), tracking the 50 largest and most liquid Indian blue-chip companies across 13 major economic sectors.',
    peRatio: 22.8,
    pbRatio: 3.8,
    divYield: 1.25,
    sparkline: [24720, 24740, 24730, 24780, 24810, 24830, 24820, 24858],
    constituents: [
      { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', weightage: 13.5, price: 1678.40, change: 16.20, changePercent: 0.97 },
      { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', weightage: 10.2, price: 2845.50, change: 33.50, changePercent: 1.19 },
      { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', weightage: 7.9, price: 1248.10, change: 10.10, changePercent: 0.82 },
      { symbol: 'INFY', name: 'Infosys Ltd', weightage: 5.8, price: 1892.30, change: 18.50, changePercent: 0.99 },
      { symbol: 'TCS', name: 'Tata Consultancy Services', weightage: 4.2, price: 3912.80, change: -27.20, changePercent: -0.69 },
      { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', weightage: 3.9, price: 1540.60, change: 18.20, changePercent: 1.20 },
      { symbol: 'ITC', name: 'ITC Limited', weightage: 3.8, price: 478.90, change: -3.10, changePercent: -0.64 },
      { symbol: 'LT', name: 'Larsen & Toubro Ltd', weightage: 3.6, price: 3620.00, change: 25.40, changePercent: 0.71 }
    ]
  },
  'bank-nifty': {
    id: 'idx_banknifty',
    key: 'bank-nifty',
    name: 'BANK NIFTY',
    symbol: 'BANK NIFTY',
    exchange: 'NSE',
    currentValue: 51320.10,
    previousClose: 51362.40,
    openValue: 51400.00,
    highValue: 51580.30,
    lowValue: 51210.00,
    change: -42.30,
    changePercent: -0.08,
    week52High: 54467.35,
    week52Low: 43230.15,
    description: 'Tracks the performance of the 12 most liquid and large-cap Indian banking companies from both public and private sectors listed on the NSE.',
    peRatio: 16.4,
    pbRatio: 2.4,
    divYield: 1.15,
    sparkline: [51360, 51420, 51390, 51350, 51300, 51310, 51290, 51320],
    constituents: [
      { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', weightage: 29.1, price: 1678.40, change: 16.20, changePercent: 0.97 },
      { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', weightage: 23.4, price: 1248.10, change: 10.10, changePercent: 0.82 },
      { symbol: 'SBIN', name: 'State Bank of India', weightage: 11.2, price: 815.50, change: 7.30, changePercent: 0.90 },
      { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', weightage: 10.8, price: 1780.00, change: -8.40, changePercent: -0.47 },
      { symbol: 'AXISBANK', name: 'Axis Bank Ltd', weightage: 9.7, price: 1195.20, change: -4.10, changePercent: -0.34 }
    ]
  },
  'sensex': {
    id: 'idx_sensex',
    key: 'sensex',
    name: 'SENSEX',
    symbol: 'SENSEX',
    exchange: 'BSE',
    currentValue: 81420.15,
    previousClose: 81039.95,
    openValue: 81150.00,
    highValue: 81540.00,
    lowValue: 81080.00,
    change: 380.20,
    changePercent: 0.47,
    week52High: 85978.25,
    week52Low: 64831.40,
    description: 'The S&P BSE SENSEX is India’s oldest and most prestigious index, composed of 30 financially sound, actively traded mega-cap companies on the Bombay Stock Exchange (BSE).',
    peRatio: 23.4,
    pbRatio: 3.9,
    divYield: 1.18,
    sparkline: [81040, 81150, 81220, 81300, 81380, 81410, 81400, 81420],
    constituents: [
      { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', weightage: 11.8, price: 2845.50, change: 33.50, changePercent: 1.19 },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', weightage: 14.2, price: 1678.40, change: 16.20, changePercent: 0.97 },
      { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', weightage: 8.9, price: 1248.10, change: 10.10, changePercent: 0.82 },
      { symbol: 'INFY', name: 'Infosys Ltd', weightage: 6.9, price: 1892.30, change: 18.50, changePercent: 0.99 },
      { symbol: 'TCS', name: 'Tata Consultancy Services', weightage: 4.8, price: 3912.80, change: -27.20, changePercent: -0.69 }
    ]
  },
  'midcap-100': {
    id: 'idx_midcap100',
    key: 'midcap-100',
    name: 'MIDCAP 100',
    symbol: 'NIFTY MIDCAP 100',
    exchange: 'NSE',
    currentValue: 58940.30,
    previousClose: 58520.20,
    openValue: 58650.00,
    highValue: 59050.00,
    lowValue: 58600.00,
    change: 420.10,
    changePercent: 0.72,
    week52High: 60120.50,
    week52Low: 39850.10,
    description: 'Designed to capture the movement and emerging growth potential of India’s top 100 mid-cap companies listed on the NSE.',
    peRatio: 32.1,
    pbRatio: 4.5,
    divYield: 0.85,
    sparkline: [58520, 58600, 58710, 58800, 58860, 58910, 58930, 58940],
    constituents: [
      { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', weightage: 4.2, price: 968.40, change: 23.40, changePercent: 2.48 },
      { symbol: 'ZOMATO', name: 'Zomato Ltd', weightage: 3.8, price: 265.40, change: 6.80, changePercent: 2.63 },
      { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', weightage: 3.5, price: 152.80, change: 1.60, changePercent: 1.06 },
      { symbol: 'WIPRO', name: 'Wipro Limited', weightage: 3.1, price: 542.10, change: 4.20, changePercent: 0.78 }
    ]
  },
  'nifty-auto': {
    id: 'idx_niftyauto',
    key: 'nifty-auto',
    name: 'NIFTY AUTO',
    symbol: 'NIFTY AUTO',
    exchange: 'NSE',
    currentValue: 27674.95,
    previousClose: 27576.00,
    openValue: 27600.00,
    highValue: 27720.00,
    lowValue: 27550.00,
    change: 98.95,
    changePercent: 0.36,
    week52High: 28140.00,
    week52Low: 16210.00,
    description: 'Reflects the behavior and performance of the Indian automotive sector including 4-wheelers, 2-wheelers, auto ancillaries and commercial vehicles.',
    peRatio: 24.8,
    pbRatio: 4.1,
    divYield: 1.10,
    sparkline: [27570, 27610, 27640, 27660, 27650, 27670, 27675],
    constituents: [
      { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', weightage: 18.5, price: 968.40, change: 23.40, changePercent: 2.48 }
    ]
  },
  'nifty-small': {
    id: 'idx_niftysmall',
    key: 'nifty-small',
    name: 'NIFTY SMALLCAP',
    symbol: 'NIFTY SMALLCAP 100',
    exchange: 'NSE',
    currentValue: 20067.40,
    previousClose: 20001.20,
    openValue: 20020.00,
    highValue: 20110.00,
    lowValue: 19980.00,
    change: 66.20,
    changePercent: 0.33,
    week52High: 21540.00,
    week52Low: 12450.00,
    description: 'Captures the high-growth trajectory of small-cap companies outside the top 250 by market capitalization.',
    peRatio: 28.5,
    pbRatio: 3.9,
    divYield: 0.72,
    sparkline: [20000, 20020, 20040, 20050, 20060, 20067],
    constituents: [
      { symbol: 'ZOMATO', name: 'Zomato Ltd', weightage: 5.1, price: 265.40, change: 6.80, changePercent: 2.63 }
    ]
  }
};
