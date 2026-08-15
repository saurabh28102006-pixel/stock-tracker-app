import React from 'react';
import { getUserWatchlist } from '@/lib/actions/watchlist.actions';
import { Star, TrendingUp, TrendingDown, Eye, ArrowUpRight, Search } from 'lucide-react';
import Link from 'next/link';
import TradeModal from '@/components/TradeModal';
import WatchlistButton from '@/components/WatchlistButton';

export default async function WatchlistPage() {
  const watchlist = await getUserWatchlist();

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-100 flex items-center gap-2.5">
            <Star className="h-7 w-7 text-yellow-400 fill-yellow-400" />
            My Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Track real-time prices, percentage moves, and receive automated market news digests.
          </p>
        </div>

        <Link
          href="/search"
          className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900 px-4 py-2.5 text-xs font-semibold text-gray-200 hover:border-yellow-500/40 hover:text-yellow-400 transition-colors w-fit"
        >
          <Search className="h-4 w-4" />
          Add More Stocks
        </Link>
      </div>

      {/* Watchlist Table / Empty State */}
      <div className="rounded-2xl border border-gray-800 bg-[#12141a] overflow-hidden shadow-xl">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-100">Saved Assets ({watchlist.length})</h2>
            <p className="text-xs text-gray-400">Real-time market quotes and quick trading actions</p>
          </div>
        </div>

        {watchlist.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-400">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-gray-200">Your Watchlist is Empty</h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              Start building your watchlist by searching for stocks like Apple (AAPL), Tesla (TSLA), or Nvidia (NVDA).
            </p>
            <div className="pt-2">
              <Link
                href="/screener"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-5 py-2.5 text-xs font-bold text-black hover:from-yellow-400 hover:to-amber-400 shadow-md transition-all"
              >
                Browse Stock Screener
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#171a22] text-gray-400 uppercase text-[11px] font-semibold border-b border-gray-800">
                <tr>
                  <th className="p-4">Asset</th>
                  <th className="p-4">Market Price</th>
                  <th className="p-4">24h Change</th>
                  <th className="p-4">Date Added</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {watchlist.map((item) => {
                  const isPositive = item.change >= 0;
                  return (
                    <tr key={item.symbol} className="hover:bg-[#181b24] transition-colors">
                      <td className="p-4">
                        <Link
                          href={`/stocks/${item.symbol.toLowerCase()}`}
                          className="group flex items-center gap-2"
                        >
                          <div>
                            <span className="font-extrabold text-gray-100 group-hover:text-yellow-400 transition-colors flex items-center gap-1">
                              {item.symbol}
                              <ArrowUpRight className="h-3 w-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                            <span className="text-[11px] text-gray-500 block truncate max-w-[180px]">
                              {item.company}
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td className="p-4 font-bold text-gray-100 text-sm">
                        ${item.currentPrice > 0 ? item.currentPrice.toFixed(2) : '--'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                            isPositive
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5" />
                          )}
                          {isPositive ? '+' : ''}
                          {item.change.toFixed(2)} ({isPositive ? '+' : ''}
                          {item.changePercent.toFixed(2)}%)
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-xs">
                        {new Date(item.addedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/stocks/${item.symbol.toLowerCase()}`}
                            className="rounded-lg border border-gray-700 bg-gray-800 p-2 text-gray-300 hover:border-yellow-500 hover:text-yellow-400 transition-colors"
                            title="Open Chart & Technicals"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>

                          <TradeModal
                            symbol={item.symbol}
                            company={item.company}
                            currentPrice={item.currentPrice}
                            triggerButton={
                              <button className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-emerald-400 transition-colors">
                                Trade
                              </button>
                            }
                          />

                          <WatchlistButton
                            symbol={item.symbol}
                            company={item.company}
                            isInWatchlist={true}
                            type="icon"
                            showTrashIcon={true}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}