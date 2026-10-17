import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Stock, PricePoint } from '../types';
import { api, formatINR } from '../services/api';
import { useTrade } from '../context/TradeContext';
import {
  BarChart3,
  LineChart,
  CandlestickChart,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface StockChartProps {
  stock: Stock;
}

export type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX';
export type ChartType = 'LINE' | 'CANDLE';

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function formatVolume(val: number): string {
  if (!val || val === 0) return '0';
  if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `${(val / 100000).toFixed(2)} L`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)} K`;
  return val.toLocaleString('en-IN');
}

function formatTimestamp(timeStr: string, timeframe: Timeframe): string {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return timeStr;

  if (timeframe === '1D') {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  if (timeframe === '1W') {
    const day = date.toLocaleDateString('en-IN', { weekday: 'short' });
    const time = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${day}, ${time}`;
  }
  if (timeframe === '1M' || timeframe === '3M' || timeframe === '6M') {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

export const StockChart: React.FC<StockChartProps> = ({ stock }) => {
  const { theme } = useTrade();
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartType, setChartType] = useState<ChartType>('CANDLE');
  const [points, setPoints] = useState<PricePoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Technical Indicators & Controls
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [showVolume, setShowVolume] = useState(true);

  // Zoom & Pan
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartOffsetRef = useRef<number>(0);

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Hover states
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Load history on symbol or timeframe change
  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const res = await api.getStockHistory(stock.symbol, timeframe);
        if (isMounted) {
          setPoints(res.points || []);
          // Reset zoom & pan when timeframe changes
          setZoom(1);
          setPanOffset(0);
          setHoverIndex(null);
        }
      } catch (e) {
        console.error('Failed to load stock history:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [stock.symbol, timeframe]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Normalized Candles list with live 1D update
  const allCandles = useMemo<CandleData[]>(() => {
    if (points.length === 0) return [];

    const list: CandleData[] = points.map((p, idx) => {
      const open = p.open ?? (idx > 0 ? points[idx - 1].price : p.price * 0.998);
      const close = p.close ?? p.price;
      const high = p.high ?? Math.max(open, close) * 1.002;
      const low = p.low ?? Math.min(open, close) * 0.998;
      const volume = p.volume || Math.floor(Math.random() * 50000 + 10000);

      return {
        time: p.time,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume
      };
    });

    // If on 1D timeframe, update the latest candle to match live stock quote
    if (timeframe === '1D' && list.length > 0) {
      const last = { ...list[list.length - 1] };
      last.close = stock.currentPrice;
      if (stock.currentPrice > last.high) last.high = stock.currentPrice;
      if (stock.currentPrice < last.low) last.low = stock.currentPrice;
      list[list.length - 1] = last;
    }

    return list;
  }, [points, stock.currentPrice, timeframe]);

  // Window calculation based on Zoom & Pan
  const totalCount = allCandles.length;
  const visibleCount = Math.max(8, Math.round(totalCount / zoom));
  const maxPanOffset = Math.max(0, totalCount - visibleCount);
  const clampedPanOffset = Math.max(0, Math.min(panOffset, maxPanOffset));

  const visibleCandles = useMemo(() => {
    if (totalCount === 0) return [];
    return allCandles.slice(clampedPanOffset, clampedPanOffset + visibleCount);
  }, [allCandles, clampedPanOffset, visibleCount, totalCount]);

  // Line points extracted from visible candles
  const visibleLinePoints = useMemo(() => {
    return visibleCandles.map((c) => ({
      time: c.time,
      price: c.close,
      volume: c.volume
    }));
  }, [visibleCandles]);

  // Price ranges and min/max
  const { minPrice, maxPrice, priceRange, isBullishTrend, maxVolume } = useMemo(() => {
    if (visibleCandles.length === 0) {
      return { minPrice: 0, maxPrice: 100, priceRange: 100, isBullishTrend: true, maxVolume: 100000 };
    }

    let min = Infinity;
    let max = -Infinity;
    let maxVol = 0;

    visibleCandles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > maxVol) maxVol = c.volume;
    });

    const firstCandle = visibleCandles[0];
    const lastCandle = visibleCandles[visibleCandles.length - 1];
    const isBull = lastCandle.close >= firstCandle.open;
    const range = max - min || 1;

    return {
      minPrice: Math.max(1, min - range * 0.05),
      maxPrice: max + range * 0.05,
      priceRange: range * 1.1,
      isBullishTrend: isBull,
      maxVolume: maxVol || 100000
    };
  }, [visibleCandles]);

  // Calculate Simple Moving Average (SMA 20)
  const smaPoints = useMemo(() => {
    if (!showSMA || visibleLinePoints.length < 5) return [];
    const period = Math.min(15, Math.floor(visibleLinePoints.length / 2.5));
    return visibleLinePoints.map((pt, i) => {
      if (i < period) return pt.price;
      const slice = visibleLinePoints.slice(i - period, i);
      const sum = slice.reduce((a, b) => a + b.price, 0);
      return sum / period;
    });
  }, [visibleLinePoints, showSMA]);

  // Calculate Exponential Moving Average (EMA 50)
  const emaPoints = useMemo(() => {
    if (!showEMA || visibleLinePoints.length < 5) return [];
    const k = 2 / (20 + 1);
    const result: number[] = [];
    let prevEma = visibleLinePoints[0].price;
    visibleLinePoints.forEach((pt) => {
      const ema = pt.price * k + prevEma * (1 - k);
      result.push(ema);
      prevEma = ema;
    });
    return result;
  }, [visibleLinePoints, showEMA]);

  // Active Candle / Point (from hover, or default to last visible candle)
  const activeCandle = useMemo(() => {
    if (visibleCandles.length === 0) return null;
    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < visibleCandles.length) {
      return visibleCandles[hoverIndex];
    }
    return visibleCandles[visibleCandles.length - 1];
  }, [visibleCandles, hoverIndex]);

  // SVG Dimensions & Padding
  const svgWidth = 850;
  const svgHeight = isFullscreen ? 500 : 310;
  const paddingX = 24;
  const paddingTop = 20;
  const paddingBottom = 30;
  const volumeHeight = showVolume ? (isFullscreen ? 90 : 65) : 0;
  const plotAreaHeight = svgHeight - paddingTop - paddingBottom - volumeHeight;

  // Generate SVG coordinates for Line & Candlesticks
  const { pathD, areaD, smaD, emaD, coords } = useMemo(() => {
    if (visibleCandles.length === 0) {
      return { pathD: '', areaD: '', smaD: '', emaD: '', coords: [] };
    }

    const n = visibleCandles.length;
    const stepX = (svgWidth - 2 * paddingX) / Math.max(1, n - 1);

    const calculatedCoords = visibleCandles.map((c, i) => {
      const x = paddingX + i * stepX;
      const normalizedPrice = (c.close - minPrice) / priceRange;
      const y = paddingTop + plotAreaHeight - normalizedPrice * plotAreaHeight;
      return { x, y, candle: c };
    });

    // Build smooth curve path for Line Chart
    let linePath = '';
    let areaPath = '';
    if (calculatedCoords.length > 1) {
      linePath = `M ${calculatedCoords[0].x} ${calculatedCoords[0].y}`;
      for (let i = 1; i < calculatedCoords.length; i++) {
        const prev = calculatedCoords[i - 1];
        const cur = calculatedCoords[i];
        const cx = (prev.x + cur.x) / 2;
        linePath += ` C ${cx} ${prev.y}, ${cx} ${cur.y}, ${cur.x} ${cur.y}`;
      }
      const baselineY = paddingTop + plotAreaHeight;
      areaPath = `${linePath} L ${calculatedCoords[calculatedCoords.length - 1].x} ${baselineY} L ${calculatedCoords[0].x} ${baselineY} Z`;
    }

    // SMA path
    let smaStr = '';
    if (smaPoints.length > 0 && calculatedCoords.length === smaPoints.length) {
      calculatedCoords.forEach((c, idx) => {
        const val = smaPoints[idx];
        const normY = (val - minPrice) / priceRange;
        const y = paddingTop + plotAreaHeight - normY * plotAreaHeight;
        smaStr += idx === 0 ? `M ${c.x} ${y}` : ` L ${c.x} ${y}`;
      });
    }

    // EMA path
    let emaStr = '';
    if (emaPoints.length > 0 && calculatedCoords.length === emaPoints.length) {
      calculatedCoords.forEach((c, idx) => {
        const val = emaPoints[idx];
        const normY = (val - minPrice) / priceRange;
        const y = paddingTop + plotAreaHeight - normY * plotAreaHeight;
        emaStr += idx === 0 ? `M ${c.x} ${y}` : ` L ${c.x} ${y}`;
      });
    }

    return {
      pathD: linePath,
      areaD: areaPath,
      smaD: smaStr,
      emaD: emaStr,
      coords: calculatedCoords
    };
  }, [visibleCandles, minPrice, priceRange, smaPoints, emaPoints, plotAreaHeight, svgHeight, volumeHeight]);

  // Zoom helpers
  const handleZoomIn = () => {
    setZoom((prev) => {
      const next = Math.min(4, Number((prev + 0.5).toFixed(2)));
      // Center or push towards the latest points
      const newVisible = Math.max(8, Math.round(totalCount / next));
      setPanOffset(Math.max(0, totalCount - newVisible));
      return next;
    });
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(1, Number((prev - 0.5).toFixed(2)));
      if (next === 1) setPanOffset(0);
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPanOffset(0);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else if (e.deltaY > 0) {
      handleZoomOut();
    }
  };

  // Drag to pan
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartOffsetRef.current = clampedPanOffset;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;

    if (isDragging && zoom > 1) {
      const deltaPx = e.clientX - dragStartXRef.current;
      const stepWidth = rect.width / visibleCount;
      const candleShift = Math.round(deltaPx / stepWidth);
      const newOffset = dragStartOffsetRef.current - candleShift;
      setPanOffset(Math.max(0, Math.min(newOffset, maxPanOffset)));
      return;
    }

    // Hover detection: find closest candle
    if (coords.length === 0) return;
    let closestIndex = 0;
    let minDist = Infinity;

    coords.forEach((c, idx) => {
      const dist = Math.abs(c.x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = idx;
      }
    });

    setHoverIndex(closestIndex);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoverIndex(null);
  };

  // Direction color definitions (Groww Green: #00D09C, Groww Red: #EB5B3C)
  const greenColor = '#00D09C';
  const redColor = '#EB5B3C';
  const lineColor = isBullishTrend ? greenColor : redColor;
  const gradientId = `stock-chart-grad-${stock.symbol}-${isBullishTrend ? 'bull' : 'bear'}`;

  // Active OHLC values for the header bar
  const ohlcOpen = activeCandle ? activeCandle.open : stock.openPrice;
  const ohlcHigh = activeCandle ? activeCandle.high : stock.highPrice;
  const ohlcLow = activeCandle ? activeCandle.low : stock.lowPrice;
  const ohlcClose = activeCandle ? activeCandle.close : stock.currentPrice;
  const ohlcVolume = activeCandle ? activeCandle.volume : stock.volume;
  const ohlcChange = Number((ohlcClose - ohlcOpen).toFixed(2));
  const ohlcChangePct = ohlcOpen > 0 ? Number(((ohlcChange / ohlcOpen) * 100).toFixed(2)) : 0;
  const isOhlcPositive = ohlcChange >= 0;

  // Grid price ticks
  const gridTicks = useMemo(() => {
    const ticks = [];
    const count = 4;
    for (let i = 0; i <= count; i++) {
      const price = minPrice + (priceRange * (count - i)) / count;
      const y = paddingTop + (plotAreaHeight * i) / count;
      ticks.push({ price: Number(price.toFixed(2)), y });
    }
    return ticks;
  }, [minPrice, priceRange, plotAreaHeight, paddingTop]);

  // Bottom time labels (pick 5 equidistant points)
  const timeLabels = useMemo(() => {
    if (visibleCandles.length === 0) return [];
    const step = Math.max(1, Math.floor(visibleCandles.length / 5));
    const labels = [];
    for (let i = 0; i < visibleCandles.length; i += step) {
      const x = paddingX + i * ((svgWidth - 2 * paddingX) / Math.max(1, visibleCandles.length - 1));
      labels.push({
        x,
        text: formatTimestamp(visibleCandles[i].time, timeframe)
      });
    }
    return labels;
  }, [visibleCandles, timeframe, svgWidth, paddingX]);

  // Selected coordinate for crosshair
  const activeCoord = hoverIndex !== null && coords[hoverIndex] ? coords[hoverIndex] : null;

  const content = (
    <div
      className={`w-full flex flex-col transition-all select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 p-4 sm:p-8 bg-[#0b0e14] text-slate-100 flex flex-col justify-between overflow-y-auto'
          : theme === 'dark'
          ? 'bg-[#111622] rounded-3xl border border-slate-800 p-4 sm:p-6 text-slate-100 shadow-xl'
          : 'bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 text-slate-900 shadow-sm'
      }`}
      onWheel={handleWheel}
    >
      {/* Top Header: Price & Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800/40 dark:border-slate-800/60">
        {/* Left: Current Price & Trend Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tight font-mono">
                {formatINR(ohlcClose)}
              </span>
              <span
                className={`text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  isOhlcPositive
                    ? 'bg-[#00d09c]/15 text-[#00d09c] border border-[#00d09c]/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                {isOhlcPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>
                  {isOhlcPositive ? '+' : ''}
                  {ohlcChange.toFixed(2)} ({isOhlcPositive ? '+' : ''}
                  {ohlcChangePct.toFixed(2)}%)
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#00d09c] animate-pulse" />
              <span>Live Feed: NSE / BSE Continuous Market</span>
              {activeCandle && (
                <span className="text-slate-500">
                  • {formatTimestamp(activeCandle.time, timeframe)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Chart Controls & Fullscreen Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Type: Candle / Line */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800">
            <button
              id="chart-type-candle"
              onClick={() => setChartType('CANDLE')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                chartType === 'CANDLE'
                  ? 'bg-[#00d09c] text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Candlestick Chart"
            >
              <CandlestickChart className="w-3.5 h-3.5" />
              <span>Candle</span>
            </button>
            <button
              id="chart-type-line"
              onClick={() => setChartType('LINE')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                chartType === 'LINE'
                  ? 'bg-[#00d09c] text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Line Chart"
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Line</span>
            </button>
          </div>

          {/* Indicators Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800">
            <button
              id="indicator-sma"
              onClick={() => setShowSMA(!showSMA)}
              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                showSMA ? 'bg-amber-400 text-slate-950' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              SMA 20
            </button>
            <button
              id="indicator-ema"
              onClick={() => setShowEMA(!showEMA)}
              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                showEMA ? 'bg-sky-400 text-slate-950' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              EMA 50
            </button>
            <button
              id="indicator-vol"
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                showVolume ? 'bg-indigo-400 text-slate-950' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Volume
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800">
            <button
              id="chart-zoom-in"
              onClick={handleZoomIn}
              disabled={zoom >= 4}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold px-1 text-slate-500 dark:text-slate-400">
              {zoom.toFixed(1)}x
            </span>
            <button
              id="chart-zoom-out"
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            {zoom > 1 && (
              <button
                id="chart-zoom-reset"
                onClick={handleResetZoom}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Fullscreen Button */}
          <button
            id="chart-fullscreen-toggle"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#00d09c] dark:hover:text-[#00d09c] transition-all"
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* OHLC Bar Header */}
      <div className="py-2.5 px-3 my-2 rounded-2xl bg-slate-50 dark:bg-[#0c0f17]/90 border border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-3 font-mono">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-sans text-[11px] font-bold">O:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{formatINR(ohlcOpen)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-sans text-[11px] font-bold">H:</span>
            <span className="font-bold text-[#00d09c]">{formatINR(ohlcHigh)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-sans text-[11px] font-bold">L:</span>
            <span className="font-bold text-rose-400">{formatINR(ohlcLow)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-sans text-[11px] font-bold">C:</span>
            <span
              className={`font-bold ${
                ohlcClose >= ohlcOpen ? 'text-[#00d09c]' : 'text-rose-400'
              }`}
            >
              {formatINR(ohlcClose)}
            </span>
          </div>
          {showVolume && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-sans text-[11px] font-bold">Vol:</span>
              <span className="font-bold text-indigo-400">{formatVolume(ohlcVolume)}</span>
            </div>
          )}
        </div>

        {/* Timeframe pill tabs */}
        <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-[#151922] p-0.5 rounded-xl">
          {(['1D', '1W', '1M', '3M', '6M', '1Y', '5Y', 'MAX'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              id={`tf-${tf.toLowerCase()}`}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-[#00d09c] text-slate-950 font-black shadow-xs shadow-[#00d09c]/20'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-300/40 dark:hover:bg-slate-800/60'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive SVG Chart Canvas */}
      <div
        className={`relative w-full select-none overflow-hidden ${
          isFullscreen ? 'h-[460px] sm:h-[540px]' : 'h-[270px] sm:h-[310px]'
        }`}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-[#111622]/40 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="w-8 h-8 border-3 border-[#00d09c] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className={`w-full h-full overflow-visible ${
            zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Price axis ticks */}
          {gridTicks.map((tick, i) => (
            <g key={`grid-${i}`}>
              <line
                x1={paddingX}
                y1={tick.y}
                x2={svgWidth - paddingX}
                y2={tick.y}
                stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'}
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={svgWidth - paddingX}
                y={tick.y - 4}
                textAnchor="end"
                fontSize="10"
                fontFamily="monospace"
                fill={theme === 'dark' ? '#64748b' : '#94a3b8'}
              >
                ₹{tick.price.toFixed(2)}
              </text>
            </g>
          ))}

          {/* Divider above volume bar section */}
          {showVolume && (
            <line
              x1={paddingX}
              y1={svgHeight - paddingBottom - volumeHeight}
              x2={svgWidth - paddingX}
              y2={svgHeight - paddingBottom - volumeHeight}
              stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'}
              strokeWidth="1"
            />
          )}

          {/* Volume Histogram Bars */}
          {showVolume &&
            coords.map((c, idx) => {
              const candle = c.candle;
              const isUp = candle.close >= candle.open;
              const barVolRatio = Math.min(1, candle.volume / maxVolume);
              const barHeight = Math.max(3, barVolRatio * (volumeHeight - 12));
              const barY = svgHeight - paddingBottom - barHeight;

              const candleStep = (svgWidth - 2 * paddingX) / Math.max(1, coords.length - 1);
              const barWidth = Math.max(2, Math.min(16, candleStep * 0.7));

              return (
                <rect
                  key={`vol-bar-${idx}`}
                  x={c.x - barWidth / 2}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill={isUp ? greenColor : redColor}
                  opacity={hoverIndex === idx ? 0.8 : 0.4}
                  rx="1"
                />
              );
            })}

          {/* Render Mode: LINE or CANDLE */}
          {chartType === 'LINE' ? (
            <>
              {/* Area Gradient Fill */}
              {areaD && <path d={areaD} fill={`url(#${gradientId})`} />}

              {/* Main Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </>
          ) : (
            /* CANDLESTICKS */
            coords.map((c, idx) => {
              const candle = c.candle;
              const isGreen = candle.close >= candle.open;
              const candleColor = isGreen ? greenColor : redColor;

              const normHigh = (candle.high - minPrice) / priceRange;
              const normLow = (candle.low - minPrice) / priceRange;
              const normOpen = (candle.open - minPrice) / priceRange;
              const normClose = (candle.close - minPrice) / priceRange;

              const yHigh = paddingTop + plotAreaHeight - normHigh * plotAreaHeight;
              const yLow = paddingTop + plotAreaHeight - normLow * plotAreaHeight;
              const yOpen = paddingTop + plotAreaHeight - normOpen * plotAreaHeight;
              const yClose = paddingTop + plotAreaHeight - normClose * plotAreaHeight;

              const bodyTop = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

              const candleStep = (svgWidth - 2 * paddingX) / Math.max(1, coords.length - 1);
              const candleWidth = Math.max(3, Math.min(14, candleStep * 0.72));

              const isHovered = hoverIndex === idx;

              return (
                <g key={`candle-${idx}`} className="transition-opacity">
                  {/* High - Low Wick */}
                  <line
                    x1={c.x}
                    y1={yHigh}
                    x2={c.x}
                    y2={yLow}
                    stroke={candleColor}
                    strokeWidth={isHovered ? '2' : '1.4'}
                  />

                  {/* Real Body */}
                  <rect
                    x={c.x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={candleColor}
                    stroke={candleColor}
                    strokeWidth="1"
                    rx="1"
                    opacity={isHovered ? 1 : 0.95}
                  />
                </g>
              );
            })
          )}

          {/* Technical Indicator Overlays */}
          {showSMA && smaD && (
            <path d={smaD} fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeDasharray="5 3" />
          )}
          {showEMA && emaD && (
            <path d={emaD} fill="none" stroke="#38bdf8" strokeWidth="1.8" />
          )}

          {/* Crosshair & Active Inspector Dot */}
          {activeCoord && (
            <g>
              {/* Vertical Crosshair Line */}
              <line
                x1={activeCoord.x}
                y1={paddingTop}
                x2={activeCoord.x}
                y2={svgHeight - paddingBottom}
                stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Horizontal Crosshair Line */}
              <line
                x1={paddingX}
                y1={activeCoord.y}
                x2={svgWidth - paddingX}
                y2={activeCoord.y}
                stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Price Bubble on Crosshair */}
              <circle
                cx={activeCoord.x}
                cy={activeCoord.y}
                r="6"
                fill={lineColor}
                fillOpacity="0.25"
              />
              <circle
                cx={activeCoord.x}
                cy={activeCoord.y}
                r="3"
                fill="#ffffff"
                stroke={lineColor}
                strokeWidth="2"
              />
            </g>
          )}

          {/* Time axis labels */}
          {timeLabels.map((lbl, idx) => (
            <text
              key={`timelbl-${idx}`}
              x={lbl.x}
              y={svgHeight - 8}
              textAnchor="middle"
              fontSize="10"
              fontFamily="monospace"
              fill={theme === 'dark' ? '#64748b' : '#94a3b8'}
            >
              {lbl.text}
            </text>
          ))}
        </svg>
      </div>

      {/* Footer Legend & Quick Insights */}
      <div className="mt-3 pt-3 border-t border-slate-800/40 dark:border-slate-800/60 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span>52W Low: </span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {formatINR(stock.week52Low)}
            </span>
          </div>
          <div>
            <span>52W High: </span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {formatINR(stock.week52High)}
            </span>
          </div>
          {zoom > 1 && (
            <div className="text-[11px] font-semibold text-[#00d09c] flex items-center gap-1">
              <span>Zoomed: {zoom.toFixed(1)}x (Drag to pan)</span>
            </div>
          )}
        </div>

        {/* Indicators Legend */}
        <div className="flex items-center gap-3 text-[11px]">
          {showSMA && (
            <span className="text-amber-500 dark:text-amber-400 flex items-center gap-1 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> SMA (20)
            </span>
          )}
          {showEMA && (
            <span className="text-sky-500 dark:text-sky-400 flex items-center gap-1 font-bold">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> EMA (50)
            </span>
          )}
          {showVolume && (
            <span className="text-indigo-500 dark:text-indigo-400 flex items-center gap-1 font-bold">
              <span className="w-2 h-2 rounded-full bg-indigo-400" /> Volume
            </span>
          )}
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs"
            >
              Exit Fullscreen (Esc)
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return content;
};
