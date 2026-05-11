/**
 * @file RateLimitBanner.jsx — Global rate limit warning banner
 *
 * Listens for 429 errors from the API interceptor and shows a
 * non-intrusive banner at the top of the page. Auto-dismisses
 * after the cooldown period.
 */

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import api from '../../config/api';

export default function RateLimitBanner() {
  const [show, setShow] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const trigger = useCallback(() => {
    setShow(true);
    setCountdown(60);
  }, []);

  // Listen for 429 responses via a response interceptor
  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error?.response?.status === 429 || error?.isRateLimited) {
          trigger();
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptorId);
  }, [trigger]);

  // Countdown timer
  useEffect(() => {
    if (!show || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setShow(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [show, countdown]);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] animate-in slide-in-from-top-2 duration-300">
      <div className="bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-xl px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-amber-500/15 rounded-lg">
              <AlertTriangle size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-200">
                Too many requests — please slow down
              </p>
              <p className="text-xs text-amber-400/70">
                You can continue in {countdown}s. This protects the platform from overload.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShow(false)}
            className="p-1 hover:bg-amber-500/10 rounded-lg text-amber-400 hover:text-amber-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
