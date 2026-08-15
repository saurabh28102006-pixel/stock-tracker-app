'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRightLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { compareStocksAI } from '@/lib/actions/gemini.actions';
import TradeModal from '@/components/TradeModal';
import Link from 'next/link';

const POPULAR_MATCHUPS = [
  { s1: 'NVDA', s2: 'AMD', label: 'AI Chips (NVDA vs AMD)' },
  { s1: 'AAPL', s2: 'MSFT', label: 'Tech Titans (AAPL vs MSFT)' },
  { s1: 'TSLA', s2: 'RIVN', label: 'EV Innovators (TSLA vs RIVN)' },
  { s1: 'GOOGL', s2: 'META', label: 'Ad & AI Giants (GOOGL vs META)' },
  { s1: 'JPM', s2: 'BAC', label: 'Wall Street Mega Banks (JPM vs BAC)' },
];

export default function CompareClient() {
  const [symA, setSymA] = useState('NVDA');
  const [symB, setSymB] = useState('AMD');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleGenerateAI = async () => {
    setLoadingAI(true);
    try {
      const res = await compareStocksAI(
        { symbol: symA.toUpperCase(), name: symA.toUpperCase() },
        { symbol: symB.toUpperCase(), name: symB.toUpperCase() }
      );
      setAiAnalysis(res.analysis);
    } catch {
      setAiAnalysis('Could not complete AI analysis at this moment.');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Selection Bar */}
      <div className="rounded-2xl border border-gray-800 bg-[#12141a] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <label className="text-xs font-semibold text-gray-400 block mb-1.5">First Stock (Ticker A)</label>
            <input
              type="text"
              value={symA}
              onChange={(e) => setSymA(e.target.value.toUpperCase())}
              placeholder="e.g. NVDA"
              className="w-full rounded-xl border border-gray-700 bg-[#0e1014] px-4 py-2.5 text-sm font-bold text-gray-100 uppercase focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-center pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
          </div>

          <div className="flex-1 w-full">
            <label className="text-xs font-semibold text-gray-400 block mb-1.5">Second Stock (Ticker B)</label>
            <input
              type="text"
              value={symB}
              onChange={(e) => setSymB(e.target.value.toUpperCase())}
              placeholder="e.g. AMD"
              className="w-full rounded-xl border border-gray-700 bg-[#0e1014] px-4 py-2.5 text-sm font-bold text-gray-100 uppercase focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Popular Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-800/80">
          <span className="text-xs text-gray-500 font-medium">Quick Matchups:</span>
          {POPULAR_MATCHUPS.map((m, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSymA(m.s1);
                setSymB(m.s2);
                setAiAnalysis(null);
              }}
              className="rounded-lg border border-gray-800 bg-gray-900/80 px-2.5 py-1 text-xs text-gray-300 hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Matrix Header & Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-100">
            {symA.toUpperCase()} vs {symB.toUpperCase()} Head-to-Head
          </h2>
          <p className="text-xs text-gray-400">Evaluate key fundamentals and technicals</p>
        </div>

        <Button
          onClick={handleGenerateAI}
          disabled={loadingAI || !symA || !symB}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 font-bold text-black hover:from-emerald-400 hover:to-cyan-400 shadow-md"
        >
          {loadingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span>Gemini AI Breakdown</span>
        </Button>
      </div>

      {/* Side-by-Side Stock Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stock A Card */}
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-[#141820] to-[#101217] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Stock A</span>
              <h3 className="text-2xl font-black text-gray-100">{symA.toUpperCase()}</h3>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/stocks/${symA.toLowerCase()}`}
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:text-emerald-400"
              >
                View Charts
              </Link>
              <TradeModal symbol={symA.toUpperCase()} company={symA.toUpperCase()} />
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-800/60">
              <span className="text-gray-400">Asset Class</span>
              <span className="font-semibold text-gray-200">US Equities / Common Stock</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-800/60">
              <span className="text-gray-400">Trading Ticker</span>
              <span className="font-bold text-emerald-400">{symA.toUpperCase()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-800/60">
              <span className="text-gray-400">Trading Exchange</span>
              <span className="font-semibold text-gray-200">NASDAQ / NYSE</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">Currency</span>
              <span className="font-semibold text-gray-200">USD ($)</span>
            </div>
          </div>
        </div>

        {/* Stock B Card */}
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#141820] to-[#101217] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Stock B</span>
              <h3 className="text-2xl font-black text-gray-100">{symB.toUpperCase()}</h3>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/stocks/${symB.toLowerCase()}`}
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:text-cyan-400"
              >
                View Charts
              </Link>
              <TradeModal symbol={symB.toUpperCase()} company={symB.toUpperCase()} />
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-800/60">
              <span className="text-gray-400">Asset Class</span>
              <span className="font-semibold text-gray-200">US Equities / Common Stock</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-800/60">
              <span className="text-gray-400">Trading Ticker</span>
              <span className="font-bold text-cyan-400">{symB.toUpperCase()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-800/60">
              <span className="text-gray-400">Trading Exchange</span>
              <span className="font-semibold text-gray-200">NASDAQ / NYSE</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">Currency</span>
              <span className="font-semibold text-gray-200">USD ($)</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Comparative Breakdown Box */}
      {aiAnalysis && (
        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-[#151c24] to-[#101318] p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Sparkles className="h-5 w-5" />
            <h3 className="text-base font-bold text-gray-100">
              Gemini AI Quantitative Comparative Thesis
            </h3>
          </div>
          <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-wrap bg-[#0d0f14] p-5 rounded-xl border border-gray-800">
            {aiAnalysis}
          </div>
        </div>
      )}
    </div>
  );
}