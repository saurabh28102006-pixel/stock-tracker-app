import React from 'react';
import { getPortfolio, getTradeHistory } from '@/lib/actions/portfolio.actions';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Clock, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import TradeModal from '@/components/TradeModal';
import Link from 'next/link';

interface TradeItem {
  type: 'BUY' | 'SELL';
  symbol: string;
  shares: number;
  price: number;
  totalAmount: number;
  executedAt: string | Date;
}

export default async function PortfolioPage() {
  const portfolio = await getPortfolio();
  const rawHistory = await getTradeHistory();
  const history = rawHistory as TradeItem[];

  if (!portfolio) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-gray-200">Please Sign In</h2>
        <p className="text-sm text-gray-400 mt-2">Sign in to access your $100,000 Paper Trading virtual portfolio.</p>
        <Link href="/sign-in" className="mt-4 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-black hover:bg-emerald-400">
          Sign In
        </Link>
      </div>
    );
  }

  const isProfit = portfolio.totalUnrealizedPnL >= 0;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-100 flex items-center gap-2.5">
            <Wallet className="h-7 w-7 text-emerald-400" />
            Paper Trading Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time simulated trading with $100,000 starting virtual capital.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-2.5 text-xs font-semibold text-gray-200 hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
          >
            Find Stocks to Trade
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio Equity */}
        <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-[#161922] to-[#101217] p-5 shadow-lg">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Total Net Worth</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-gray-100">
            ${portfolio.totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className={`flex items-center font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isProfit ? <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> : <TrendingDown className="h-3.5 w-3.5 mr-0.5" />}
              {isProfit ? '+' : ''}{portfolio.totalUnrealizedPnLPercent.toFixed(2)}%
            </span>
            <span className="text-gray-500">all time</span>
          </div>
        </div>

        {/* Virtual Cash Available */}
        <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-[#161922] to-[#101217] p-5 shadow-lg">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Available Cash</span>
            <Wallet className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold text-gray-100">
            ${portfolio.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-2">Ready to deploy</p>
        </div>

        {/* Total Stock Value */}
        <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-[#161922] to-[#101217] p-5 shadow-lg">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Stock Holdings Value</span>
            <Layers className="h-4 w-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-extrabold text-gray-100">
            ${portfolio.totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-2">{portfolio.holdings.length} Active Positions</p>
        </div>

        {/* Total Unrealized Profit/Loss */}
        <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-[#161922] to-[#101217] p-5 shadow-lg">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Unrealized P&L</span>
            {isProfit ? <TrendingUp className="h-4 w-4 text-emerald-400" /> : <TrendingDown className="h-4 w-4 text-rose-400" />}
          </div>
          <p className={`text-2xl font-extrabold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isProfit ? '+' : ''}${portfolio.totalUnrealizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-2">Open returns</p>
        </div>
      </div>

      {/* Active Holdings Table */}
      <div className="rounded-2xl border border-gray-800 bg-[#12141a] overflow-hidden shadow-xl">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-100">Open Positions</h2>
            <p className="text-xs text-gray-400">Current shares owned in your paper portfolio</p>
          </div>
        </div>

        {portfolio.holdings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">You have no open stock positions yet.</p>
            <p className="text-xs text-gray-500 mt-1">Explore stocks and use the &quot;Paper Trade&quot; button to buy your first stock!</p>
            <Link href="/search" className="inline-block mt-4 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-black hover:bg-emerald-400">
              Browse Stocks
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#171a22] text-gray-400 uppercase text-[11px] font-semibold border-b border-gray-800">
                <tr>
                  <th className="p-4">Asset</th>
                  <th className="p-4">Shares</th>
                  <th className="p-4">Avg Cost</th>
                  <th className="p-4">Current Price</th>
                  <th className="p-4">Market Value</th>
                  <th className="p-4">Gain / Loss</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {portfolio.holdings.map((h) => {
                  const itemProfit = h.unrealizedPnL >= 0;
                  return (
                    <tr key={h.symbol} className="hover:bg-[#181b24] transition-colors">
                      <td className="p-4">
                        <Link href={`/stocks/${h.symbol.toLowerCase()}`} className="group">
                          <span className="font-bold text-gray-100 group-hover:text-emerald-400 transition-colors">
                            {h.symbol}
                          </span>
                          <span className="block text-[11px] text-gray-500 truncate max-w-[140px]">{h.company}</span>
                        </Link>
                      </td>
                      <td className="p-4 font-semibold text-gray-200">{h.shares}</td>
                      <td className="p-4 text-gray-300">${h.avgBuyPrice.toFixed(2)}</td>
                      <td className="p-4 font-semibold text-gray-100">${h.currentPrice.toFixed(2)}</td>
                      <td className="p-4 font-bold text-gray-100">${h.currentValue.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`font-bold ${itemProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {itemProfit ? '+' : ''}${h.unrealizedPnL.toFixed(2)} ({itemProfit ? '+' : ''}{h.unrealizedPnLPercent.toFixed(2)}%)
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <TradeModal
                            symbol={h.symbol}
                            company={h.company}
                            currentPrice={h.currentPrice}
                            triggerButton={
                              <button className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:border-emerald-500 hover:text-emerald-400">
                                Trade
                              </button>
                            }
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

      {/* Trade History */}
      <div className="rounded-2xl border border-gray-800 bg-[#12141a] overflow-hidden shadow-xl">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <h2 className="text-base font-bold text-gray-100">Trade History</h2>
          </div>
          <span className="text-xs text-gray-500">Last 50 executions</span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">No trade history recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#171a22] text-gray-400 uppercase text-[11px] font-semibold border-b border-gray-800">
                <tr>
                  <th className="p-4">Type</th>
                  <th className="p-4">Symbol</th>
                  <th className="p-4">Shares</th>
                  <th className="p-4">Execution Price</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4 text-right">Executed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {history.map((t: TradeItem, idx: number) => {
                  const isBuy = t.type === 'BUY';
                  return (
                    <tr key={idx} className="hover:bg-[#181b24] transition-colors">
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                            isBuy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {isBuy ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {t.type}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-gray-100">{t.symbol}</td>
                      <td className="p-4 text-gray-300">{t.shares}</td>
                      <td className="p-4 text-gray-300">${t.price?.toFixed(2)}</td>
                      <td className="p-4 font-bold text-gray-100">${t.totalAmount?.toFixed(2)}</td>
                      <td className="p-4 text-right text-gray-500 text-[11px]">
                        {new Date(t.executedAt).toLocaleString()}
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