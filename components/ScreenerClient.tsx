'use client';

import React, { useState } from 'react';
import { Filter, Search, Eye, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import TradeModal from '@/components/TradeModal';
import WatchlistButton from '@/components/WatchlistButton';

interface ScreenerStock {
  symbol: string;
  name: string;
  sector: string;
  capCategory: 'Mega Cap ($200B+)' | 'Large Cap ($10B-$200B)' | 'Mid Cap ($2B-$10B)';
  exchange: string;
  priceEstimate: number;
}

const SCREENER_STOCKS: ScreenerStock[] = [
  // Technology
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', capCategory: 'Mega Cap ($200B+)', exchange: 'NASDAQ', priceEstimate: 125.5 },
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', capCategory: 'Mega Cap ($200B+)', exchange: 'NASDAQ', priceEstimate: 230.2 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', capCategory: 'Mega Cap ($200B+)', exchange: 'NASDAQ', priceEstimate: 420.8 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', capCategory: 'Mega Cap ($200B+)', exchange: 'NASDAQ', priceEstimate: 175.4 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', capCategory: 'Large Cap ($10B-$200B)', exchange: 'NASDAQ', priceEstimate: 155.0 },
  { symbol: 'CRM', name: 'Salesforce, Inc.', sector: 'Technology', capCategory: 'Large Cap ($10B-$200B)', exchange: 'NYSE', priceEstimate: 290.1 },
  { symbol: 'PLTR', name: 'Palantir Technologies', sector: 'Technology', capCategory: 'Large Cap ($10B-$200B)', exchange: 'NYSE', priceEstimate: 32.5 },
  { symbol: 'DDOG', name: 'Datadog Inc.', sector: 'Technology', capCategory: 'Mid Cap ($2B-$10B)', exchange: 'NASDAQ', priceEstimate: 110.0 },

  // Finance
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Finance', capCategory: 'Mega Cap ($200B+)', exchange: 'NYSE', priceEstimate: 215.0 },
  { symbol: 'BAC', name: 'Bank of America Corp', sector: 'Finance', capCategory: 'Mega Cap ($200B+)', exchange: 'NYSE', priceEstimate: 40.2 },
  { symbol: 'WFC', name: 'Wells Fargo & Company', sector: 'Finance', capCategory: 'Large Cap ($10B-$200B)', exchange: 'NYSE', priceEstimate: 58.6 },
  { symbol: 'GS', name: 'Goldman Sachs Group', sector: 'Finance', capCategory: 'Large Cap ($10B-$200B)', exchange: 'NYSE', priceEstimate: 480.0 },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Finance', capCategory: 'Mega Cap ($200B+)', exchange: 'NYSE', priceEstimate: 275.5 },
  { symbol: 'MA', name: 'Mastercard Incorporated', sector: 'Finance', capCategory: 'Mega Cap ($200B+)', exchange: 'NYSE', priceEstimate: 465.0 },

  // Healthcare
  { symbol: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare', capCategory: 'Mega Cap ($200B+)', exchange: 'NYSE', priceEstimate: 890.0 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', capCategory: 'Mega Cap ($200B+)', exchange: 'NYSE', priceEstimate: 160.2 },
  { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare', capCategory: 'Mega Cap ($200B+)', exchange: 'NYSE', priceEstimate: 540.0 },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', capCategory: 'Large Cap ($10B-$200B)', exchange: 'NYSE', priceEstimate: 28.5 },
  { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', capCategory: 'Mega Cap ($200B+)', exchange: 'NYSE', priceEstimate: 185.0 },

  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', capCategory: 'Mega Cap ($200B+)', exchange: 'NYSE', priceEstimate: 118.0 },
  { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy', capCategory: 'Large Cap ($10B-$200B)', exchange: 'NYSE', priceEstimate: 145.0 },
  { symbol: 'COP', name: 'ConocoPhillips', sector: 'Energy', capCategory: 'Large Cap ($10B-$200B)', exchange: 'NYSE', priceEstimate: 110.5 },
  { symbol: 'SLB', name: 'Schlumberger Limited', sector: 'Energy', capCategory: 'Large Cap ($10B-$200B)', exchange: 'NYSE', priceEstimate: 45.0 },

  // Consumer Goods & Retail
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Goods', capCategory: 'Mega Cap ($200B+)', exchange: 'NASDAQ', priceEstimate: 185.0 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', sector: 'Consumer Goods', capCategory: 'Mega Cap ($200B+)', exchange: 'NASDAQ', priceEstimate: 220.0 },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Goods', capCategory: 'Mega Cap ($200B+)', exchange: 'NYSE', priceEstimate: 72.5 },
  { symbol: 'COST', name: 'Costco Wholesale', sector: 'Consumer Goods', capCategory: 'Mega Cap ($200B+)', exchange: 'NASDAQ', priceEstimate: 870.0 },
  { symbol: 'NKE', name: 'NIKE, Inc.', sector: 'Consumer Goods', capCategory: 'Large Cap ($10B-$200B)', exchange: 'NYSE', priceEstimate: 82.0 },
];

const SECTORS = ['All Sectors', 'Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer Goods'];
const CAP_FILTERS = ['All Market Caps', 'Mega Cap ($200B+)', 'Large Cap ($10B-$200B)', 'Mid Cap ($2B-$10B)'];

export default function ScreenerClient() {
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [selectedCap, setSelectedCap] = useState('All Market Caps');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = SCREENER_STOCKS.filter((s) => {
    const matchesSector = selectedSector === 'All Sectors' || s.sector === selectedSector;
    const matchesCap = selectedCap === 'All Market Caps' || s.capCategory === selectedCap;
    const matchesSearch =
      !searchQuery.trim() ||
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSector && matchesCap && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-gray-800 bg-[#12141a] p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker or company..."
              className="w-full rounded-xl border border-gray-700 bg-[#0e1014] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Sector Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {SECTORS.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedSector === sec
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'border border-gray-800 bg-gray-900/80 text-gray-300 hover:border-gray-700 hover:text-white'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* Market Cap Filter */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-800/70 text-xs">
          <Filter className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-400 font-medium">Market Cap:</span>
          <div className="flex flex-wrap gap-1.5">
            {CAP_FILTERS.map((cap) => (
              <button
                key={cap}
                onClick={() => setSelectedCap(cap)}
                className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                  selectedCap === cap
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {cap}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Found <strong className="text-gray-200">{filtered.length}</strong> matching stocks</span>
      </div>

      {/* Screener Table */}
      <div className="rounded-2xl border border-gray-800 bg-[#12141a] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#171a22] text-gray-400 uppercase text-[11px] font-semibold border-b border-gray-800">
              <tr>
                <th className="p-4">Symbol</th>
                <th className="p-4">Company Name</th>
                <th className="p-4">Sector</th>
                <th className="p-4">Market Cap</th>
                <th className="p-4">Exchange</th>
                <th className="p-4">Estimated Price</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.map((stock) => (
                <tr key={stock.symbol} className="hover:bg-[#181b24] transition-colors">
                  <td className="p-4 font-black text-gray-100">
                    <Link
                      href={`/stocks/${stock.symbol.toLowerCase()}`}
                      className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                    >
                      {stock.symbol}
                      <ArrowUpRight className="h-3 w-3 text-gray-500" />
                    </Link>
                  </td>
                  <td className="p-4 text-gray-300 font-medium">{stock.name}</td>
                  <td className="p-4">
                    <span className="inline-block rounded-md bg-gray-800/80 px-2 py-0.5 text-[11px] font-semibold text-gray-300">
                      {stock.sector}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-[11px]">{stock.capCategory}</td>
                  <td className="p-4 text-gray-400 font-mono">{stock.exchange}</td>
                  <td className="p-4 font-bold text-gray-100">${stock.priceEstimate.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/stocks/${stock.symbol.toLowerCase()}`}
                        className="rounded-lg border border-gray-700 bg-gray-800 p-2 text-gray-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                        title="View Interactive Chart"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>

                      <WatchlistButton
                        symbol={stock.symbol}
                        company={stock.name}
                        isInWatchlist={false}
                        type="icon"
                      />

                      <TradeModal
                        symbol={stock.symbol}
                        company={stock.name}
                        currentPrice={stock.priceEstimate}
                        triggerButton={
                          <button className="rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-bold text-black hover:bg-emerald-400 transition-colors">
                            Trade
                          </button>
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}