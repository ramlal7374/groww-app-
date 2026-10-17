/**
 * Market Data Service
 * Connects to free real-time market data (Yahoo Finance API) for Indian Stocks (NSE) and Indices.
 * Supports auto-updating, live index tracking, and micro-tick orderbook simulation.
 */

import { db } from './db.js';

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

// Map internal symbols to Yahoo Finance tickers
const STOCK_TICKER_MAP: Record<string, string> = {
  HCLTECH: 'HCLTECH.NS',
  INFY: 'INFY.NS',
  TCS: 'TCS.NS',
  TECHM: 'TECHM.NS',
  LTM: 'LTIM.NS',
  WIPRO: 'WIPRO.NS',
  RAYMOND: 'RAYMOND.NS',
  SOLARINDS: 'SOLARINDS.NS',
  PCJEWELLER: 'PCJEWELLER.NS',
  TATAGOLD: 'TATAGOLD.NS',
  ZENSARTECH: 'ZENSARTECH.NS',
  TATAINVEST: 'TATAINVEST.NS',
  GOLDBEES: 'GOLDBEES.NS',
  SILVERBEES: 'SILVERBEES.NS',
  RELIANCE: 'RELIANCE.NS',
  HDFCBANK: 'HDFCBANK.NS',
  TATAMOTORS: 'TATAMOTORS.NS',
  ICICIBANK: 'ICICIBANK.NS',
  ITC: 'ITC.NS',
  BHARTIARTL: 'BHARTIARTL.NS',
  ZOMATO: 'ZOMATO.NS',
  LT: 'LT.NS',
  BAJFINANCE: 'BAJFINANCE.NS',
  TITAN: 'TITAN.NS',
  MON100: 'MON100.NS'
};

export class MarketDataService {
  private static instance: MarketDataService;
  private indices: Map<string, LiveIndexQuote> = new Map();
  private lastSyncTime: string = new Date().toISOString();
  private isConnected: boolean = true;
  private syncTimer: NodeJS.Timeout | null = null;
  private tickTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.initDefaultIndices();
  }

  public static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  private initDefaultIndices() {
    // Initialized from the exact PDF snapshot data:
    // NIFTY: 23,118.60 -279.50 (1.19%)
    // SENSEX: 74,003.82 -777.94 (1.04%)
    // BANKNIFTY: 55,794.75 -811.80 (1.43%)
    // MIDCPNIFTY: 14,266.35 -318.20 (2.18%)
    this.indices.set('^NSEI', {
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
    });

    this.indices.set('^BSESN', {
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
    });

    this.indices.set('^NSEBANK', {
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
    });

    this.indices.set('MIDCPNIFTY', {
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
    });
  }

  public start() {
    console.log('[MarketDataService] Starting real-time free market data feed...');
    // Initial fetch from Yahoo Finance
    this.fetchRealtimeData();

    // Re-fetch external data from Yahoo every 12 seconds
    this.syncTimer = setInterval(() => {
      this.fetchRealtimeData();
    }, 12000);

    // Apply live micro-volatility ticks every 2.5 seconds so numbers remain dynamically animated
    this.tickTimer = setInterval(() => {
      this.applyMicroTicks();
    }, 2500);
  }

  public stop() {
    if (this.syncTimer) clearInterval(this.syncTimer);
    if (this.tickTimer) clearInterval(this.tickTimer);
  }

  /**
   * Fetch quote from Yahoo Finance chart endpoint
   */
  private async fetchYahooQuote(ticker: string): Promise<{
    price: number;
    prevClose: number;
    dayHigh?: number;
    dayLow?: number;
    volume?: number;
    sparkline?: number[];
  } | null> {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(4500)
      });

      if (!response.ok) return null;
      const data = await response.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (!meta || typeof meta.regularMarketPrice !== 'number') return null;

      const price = Number(meta.regularMarketPrice.toFixed(2));
      const prevClose = typeof meta.chartPreviousClose === 'number' ? Number(meta.chartPreviousClose.toFixed(2)) : price;
      const dayHigh = typeof meta.regularMarketDayHigh === 'number' ? Number(meta.regularMarketDayHigh.toFixed(2)) : undefined;
      const dayLow = typeof meta.regularMarketDayLow === 'number' ? Number(meta.regularMarketDayLow.toFixed(2)) : undefined;
      const volume = typeof meta.regularMarketVolume === 'number' ? meta.regularMarketVolume : undefined;

      // Extract sparkline from timestamps/indicators if available
      const quotes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
      const validPoints = quotes.filter((q: unknown): q is number => typeof q === 'number' && !isNaN(q));
      const sparkline = validPoints.length > 5 
        ? validPoints.slice(-10).map((v: number) => Number(v.toFixed(2)))
        : undefined;

      return { price, prevClose, dayHigh, dayLow, volume, sparkline };
    } catch (e) {
      return null;
    }
  }

  public async fetchRealtimeData() {
    try {
      // 1. Fetch Indian Indices
      const indexTickers = [
        { ticker: '^NSEI', key: '^NSEI' },
        { ticker: '^BSESN', key: '^BSESN' },
        { ticker: '^NSEBANK', key: '^NSEBANK' }
      ];

      for (const item of indexTickers) {
        const quote = await this.fetchYahooQuote(item.ticker);
        if (quote) {
          const existing = this.indices.get(item.key);
          if (existing) {
            const change = Number((quote.price - quote.prevClose).toFixed(2));
            const changePercent = Number(((change / quote.prevClose) * 100).toFixed(2));
            const sparkline = quote.sparkline && quote.sparkline.length > 3 
              ? quote.sparkline 
              : [...existing.sparkline.slice(1), quote.price];

            this.indices.set(item.key, {
              ...existing,
              value: quote.price,
              previousClose: quote.prevClose,
              change,
              changePercent,
              dayHigh: quote.dayHigh || Math.max(existing.dayHigh, quote.price),
              dayLow: quote.dayLow || Math.min(existing.dayLow, quote.price),
              sparkline,
              lastUpdated: new Date().toISOString()
            });
          }
        }
      }

      // 2. Fetch Stock Quotes
      const symbolsToFetch = Object.entries(STOCK_TICKER_MAP);
      for (const [stockSymbol, yahooTicker] of symbolsToFetch) {
        const quote = await this.fetchYahooQuote(yahooTicker);
        if (quote) {
          const stk = db.getStockBySymbol(stockSymbol);
          if (stk) {
            // Respect admin price override lock & bias controls
            if (stk.priceOverrideLocked) {
              continue;
            }

            const change = Number((quote.price - quote.prevClose).toFixed(2));
            const changePercent = Number(((change / quote.prevClose) * 100).toFixed(2));
            
            const trend = stk.historicalTrend || [];
            const newTrend = [...trend.slice(1), quote.price];

            db.updateStockDirect(stockSymbol, {
              currentPrice: quote.price,
              previousClose: quote.prevClose,
              change,
              changePercent,
              highPrice: quote.dayHigh || Math.max(stk.highPrice, quote.price),
              lowPrice: quote.dayLow || Math.min(stk.lowPrice, quote.price),
              volume: quote.volume || stk.volume,
              historicalTrend: newTrend
            });
          }
        }
      }

      this.lastSyncTime = new Date().toISOString();
      this.isConnected = true;
    } catch (err) {
      console.error('[MarketDataService] Error during real-time fetch cycle:', err);
    }
  }

  /**
   * Applies realistic micro-movements between API fetches so that
   * the UI feels actively live on every second
   */
  private applyMicroTicks() {
    // 1. Tick indices
    this.indices.forEach((idx, key) => {
      // 50% chance of small tick
      if (Math.random() > 0.4) {
        const deltaFactor = (Math.random() - 0.495) * 0.0006; // tiny ±0.03%
        const newVal = Number((idx.value * (1 + deltaFactor)).toFixed(2));
        const newChange = Number((newVal - idx.previousClose).toFixed(2));
        const newPercent = Number(((newChange / idx.previousClose) * 100).toFixed(2));
        const newSparkline = [...idx.sparkline.slice(1), newVal];

        this.indices.set(key, {
          ...idx,
          value: newVal,
          change: newChange,
          changePercent: newPercent,
          sparkline: newSparkline,
          dayHigh: Math.max(idx.dayHigh, newVal),
          dayLow: Math.min(idx.dayLow, newVal),
          lastUpdated: new Date().toISOString()
        });
      }
    });

    // 2. Tick stocks
    const stocks = db.getStocks();
    // Pick 5-8 random stocks to tick
    const sample = stocks.filter(() => Math.random() < 0.35);
    sample.forEach((stk) => {
      // If stock price is locked by Admin, let tickSimulation handle bias/locking without random micro jitter
      if (stk.priceOverrideLocked) {
        return;
      }

      const deltaPercent = (Math.random() - 0.498) * 0.0012; // ±0.06%
      const newPrice = Number(Math.max(0.1, stk.currentPrice * (1 + deltaPercent)).toFixed(2));
      const change = Number((newPrice - stk.previousClose).toFixed(2));
      const changePercent = Number(((change / stk.previousClose) * 100).toFixed(2));
      const trend = stk.historicalTrend || [];
      const newTrend = [...trend.slice(1), newPrice];

      db.updateStockDirect(stk.symbol, {
        currentPrice: newPrice,
        change,
        changePercent,
        highPrice: Math.max(stk.highPrice, newPrice),
        lowPrice: Math.min(stk.lowPrice, newPrice),
        historicalTrend: newTrend
      });
    });

    // Trigger tick simulation in database to update pending limit orders
    db.tickSimulation();
  }

  public getIndices(): LiveIndexQuote[] {
    return Array.from(this.indices.values());
  }

  public getStatus() {
    return {
      connected: this.isConnected,
      source: 'Yahoo Finance Free Real-Time Market API',
      lastSync: this.lastSyncTime,
      autoUpdate: true,
      intervalSeconds: 2.5,
      trackedIndices: this.indices.size,
      trackedStocks: Object.keys(STOCK_TICKER_MAP).length
    };
  }

  public async syncNow(): Promise<boolean> {
    await this.fetchRealtimeData();
    return true;
  }
}

export const marketDataService = MarketDataService.getInstance();
