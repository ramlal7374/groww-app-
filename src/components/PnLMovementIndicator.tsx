import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';
import { formatINR } from '../services/api';

interface PnLMovementIndicatorProps {
  currentPrice: number;
  previousPrice?: number;
  symbol?: string;
  className?: string;
  showBadge?: boolean;
}

export const PnLMovementIndicator: React.FC<PnLMovementIndicatorProps> = ({
  currentPrice,
  previousPrice,
  symbol,
  className = '',
  showBadge = true
}) => {
  const lastPriceRef = useRef<number>(currentPrice);
  const [movement, setMovement] = useState<'UP' | 'DOWN' | null>(null);
  const [diff, setDiff] = useState<number>(0);
  const [key, setKey] = useState<number>(0);

  useEffect(() => {
    const prev = previousPrice ?? lastPriceRef.current;
    if (currentPrice > prev && prev > 0) {
      setMovement('UP');
      setDiff(currentPrice - prev);
      setKey((k) => k + 1);
      const timer = setTimeout(() => setMovement(null), 2500);
      return () => clearTimeout(timer);
    } else if (currentPrice < prev && prev > 0) {
      setMovement('DOWN');
      setDiff(prev - currentPrice);
      setKey((k) => k + 1);
      const timer = setTimeout(() => setMovement(null), 2500);
      return () => clearTimeout(timer);
    }
    lastPriceRef.current = currentPrice;
  }, [currentPrice, previousPrice]);

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      {/* Price with Flash glow */}
      <motion.span
        key={`price-${key}`}
        animate={
          movement === 'UP'
            ? {
                color: ['#00d09c', '#ffffff', '#00d09c'],
                scale: [1, 1.04, 1],
                textShadow: '0 0 12px rgba(0, 208, 156, 0.6)'
              }
            : movement === 'DOWN'
            ? {
                color: ['#f43f5e', '#ffffff', '#f43f5e'],
                scale: [1, 1.04, 1],
                textShadow: '0 0 12px rgba(244, 63, 94, 0.6)'
              }
            : {}
        }
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="font-black tracking-tight"
      >
        {formatINR(currentPrice)}
      </motion.span>

      {/* Floating Animated Profit or Loss Badge */}
      <AnimatePresence>
        {showBadge && movement === 'UP' && (
          <motion.div
            key={`profit-${key}`}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-[#00d09c] border border-emerald-500/40 shadow-sm shadow-emerald-500/10 pointer-events-none"
          >
            <ArrowUp className="w-3 h-3 animate-bounce" />
            <span>+₹{diff.toFixed(2)} PROFIT</span>
          </motion.div>
        )}

        {showBadge && movement === 'DOWN' && (
          <motion.div
            key={`loss-${key}`}
            initial={{ opacity: 0, y: -10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm shadow-rose-500/10 pointer-events-none"
          >
            <ArrowDown className="w-3 h-3 animate-bounce" />
            <span>-₹{diff.toFixed(2)} LOSS</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
