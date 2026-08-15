'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus, ShieldAlert, Zap, RefreshCw } from 'lucide-react';
import { getStockSentiment, type SentimentAnalysis } from '@/lib/actions/gemini.actions';

export default function SentimentCard({ symbol }: { symbol: string }) {
  const [data, setData] = useState<SentimentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSentiment = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStockSentiment(symbol);
      setData(res);
    } catch (e) {
      console.error('Failed to fetch sentiment:', e);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchSentiment();
  }, [fetchSentiment]);

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'BULLISH':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: <TrendingUp className="h-4 w-4" />,
          label: 'Bullish Outlook',
        };
      case 'BEARISH':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: <TrendingDown className="h-4 w-4" />,
          label: 'Bearish Outlook',
        };
      default:
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: <Minus className="h-4 w-4" />,
          label: 'Neutral / Balanced',
        };
    }
  };

  const verdictInfo = getVerdictBadge(data?.verdict || 'NEUTRAL');

  return (
    <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-[#161922] to-[#101217] p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800/80 pb-3.5 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
              Gemini AI Sentiment
            </h3>
            <p className="text-xs text-gray-400">Live News & Fundamental Momentum</p>
          </div>
        </div>

        <button
          onClick={fetchSentiment}
          disabled={loading}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors disabled:opacity-50"
          title="Refresh AI Analysis"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-gray-400 text-sm">
          <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
          <span>Gemini AI is analyzing latest news for {symbol.toUpperCase()}...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Score & Verdict Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#0d0f14] p-3.5 border border-gray-800">
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${verdictInfo.bg}`}>
                {verdictInfo.icon}
                {verdictInfo.label}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">Sentiment Score:</span>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-24 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      (data?.score || 50) >= 60
                        ? 'bg-emerald-400'
                        : (data?.score || 50) <= 40
                        ? 'bg-rose-400'
                        : 'bg-amber-400'
                    }`}
                    style={{ width: `${data?.score || 50}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-200">{data?.score || 50}/100</span>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-[#13151c] p-3.5 rounded-xl border border-gray-800/60">
            {data?.summary}
          </p>

          {/* Catalysts and Risks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Catalysts */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-2">
                <Zap className="h-3.5 w-3.5" />
                <span>Key Growth Catalysts</span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-300">
                {data?.catalysts?.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">-</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 mb-2">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Risk Factors to Monitor</span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-300">
                {data?.risks?.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">-</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}