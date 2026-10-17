import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface AnimatedOtpInputProps {
  length?: number;
  onComplete: (otp: string) => Promise<boolean> | boolean;
  isLoading?: boolean;
  errorMessage?: string | null;
  onResend?: () => void;
  title?: string;
  subtitle?: string;
}

export const AnimatedOtpInput: React.FC<AnimatedOtpInputProps> = ({
  length = 6,
  onComplete,
  isLoading = false,
  errorMessage = null,
  onResend,
  title = 'Verify 6-Digit Security OTP',
  subtitle = 'Enter the one-time code sent to your mobile & email'
}) => {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  // Resend countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (errorMessage) {
      setHasError(true);
      const timer = setTimeout(() => setHasError(false), 800);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleChange = async (val: string, index: number) => {
    // Only accept numbers
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);

    if (cleanVal && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }

    // Check if full OTP is entered
    if (newDigits.every((d) => d !== '')) {
      const fullOtp = newDigits.join('');
      setIsVerifying(true);
      setHasError(false);

      try {
        const result = await onComplete(fullOtp);
        if (result) {
          setIsSuccess(true);
        } else {
          setHasError(true);
          // Auto clear and focus first on invalid
          setTimeout(() => {
            setDigits(Array(length).fill(''));
            inputRefs.current[0]?.focus();
            setActiveIndex(0);
          }, 600);
        }
      } catch {
        setHasError(true);
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;

    const newDigits = [...digits];
    pasted.split('').forEach((char, i) => {
      newDigits[i] = char;
    });
    setDigits(newDigits);

    const nextIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
    setActiveIndex(nextIndex);

    if (pasted.length === length) {
      handleChange(newDigits[length - 1], length - 1);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setDigits(Array(length).fill(''));
    setCountdown(30);
    inputRefs.current[0]?.focus();
    setActiveIndex(0);
    if (onResend) onResend();
  };

  return (
    <div className="w-full space-y-6 text-center">
      <div>
        <h3 className="text-xl font-black tracking-tight text-white">{title}</h3>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
          Demo verification code: <span className="font-mono font-bold tracking-wider">123456</span>
        </div>
      </div>

      {/* OTP Digit Boxes with Shake Animation on Invalid */}
      <motion.div
        animate={
          hasError
            ? { x: [-12, 12, -8, 8, -4, 4, 0] }
            : { x: 0 }
        }
        transition={{ duration: 0.4 }}
        className="flex items-center justify-center gap-2 sm:gap-3"
      >
        {digits.map((digit, idx) => {
          const isFilled = digit !== '';
          const isCurrent = activeIndex === idx;

          return (
            <motion.div
              key={idx}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{
                scale: isFilled ? [1, 1.15, 1] : isCurrent ? 1.05 : 1,
                opacity: 1
              }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <input
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                disabled={isVerifying || isSuccess || isLoading}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                onFocus={() => setActiveIndex(idx)}
                onPaste={handlePaste}
                id={`otp-box-${idx}`}
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-black rounded-2xl border transition-all duration-200 outline-none select-none ${
                  hasError
                    ? 'border-rose-500 bg-rose-500/10 text-rose-300 shadow-lg shadow-rose-500/20'
                    : isSuccess
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-lg shadow-emerald-500/20'
                    : isFilled
                    ? 'border-emerald-500/80 bg-[#0f172a] text-white shadow-md shadow-emerald-500/10'
                    : isCurrent
                    ? 'border-emerald-400 bg-[#0b0e14] text-white ring-2 ring-emerald-500/30 ring-offset-2 ring-offset-[#111622]'
                    : 'border-slate-800 bg-[#0b0e14] text-slate-400 hover:border-slate-700'
                }`}
              />
              {/* Bottom indicator dot */}
              {isFilled && !hasError && !isSuccess && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400 mx-auto mt-1.5"
                />
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Dynamic Feedback State */}
      <div className="h-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isVerifying || isLoading ? (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2 text-xs font-bold text-emerald-400"
            >
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Verifying authorization token with depository...</span>
            </motion.div>
          ) : isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="flex items-center gap-2 text-xs font-black text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/30"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>OTP Authenticated! Setting up your Demat account...</span>
            </motion.div>
          ) : hasError || errorMessage ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-400"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage || 'Invalid OTP. Please enter 123456 or try again.'}</span>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-slate-500"
            >
              Didn't receive the code?
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Resend and Actions */}
      <div className="flex items-center justify-center gap-2 pt-1 border-t border-slate-800/80">
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0 || isVerifying || isSuccess}
          className={`text-xs font-bold transition-all flex items-center gap-1 ${
            countdown > 0
              ? 'text-slate-500 cursor-not-allowed'
              : 'text-emerald-400 hover:text-emerald-300 hover:underline'
          }`}
        >
          <RefreshCw className={`w-3 h-3 ${countdown > 0 ? '' : 'animate-spin-slow'}`} />
          <span>
            {countdown > 0 ? `Resend Code in ${countdown}s` : 'Resend OTP Now'}
          </span>
        </button>
      </div>
    </div>
  );
};
