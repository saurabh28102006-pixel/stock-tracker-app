'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { executeTrade } from '@/lib/actions/portfolio.actions';
import { DollarSign, ArrowUpRight, ArrowDownRight, Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';

interface TradeModalProps {
  symbol: string;
  company: string;
  currentPrice?: number;
  triggerButton?: React.ReactNode;
}

export default function TradeModal({
  symbol,
  company,
  currentPrice = 150.0,
  triggerButton,
}: TradeModalProps) {
  const [open, setOpen] = useState(false);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [shares, setShares] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const price = currentPrice > 0 ? currentPrice : 150.0;
  const totalAmount = shares * price;

  const handleExecute = async () => {
    if (shares <= 0) {
      toast.error('Please enter a valid share quantity');
      return;
    }

    setLoading(true);
    try {
      const res = await executeTrade({
        symbol,
        company,
        type: tradeType,
        shares,
        price,
      });

      if (res.success) {
        toast.success(res.message);
        setOpen(false);
      } else {
        toast.error(res.message);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Trade execution failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold text-black hover:from-emerald-400 hover:to-teal-400 shadow-md">
            <DollarSign className="h-4 w-4" />
            <span>Paper Trade</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md border-gray-800 bg-[#14171e] text-gray-100 p-6 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-100">{symbol.toUpperCase()} Paper Trade</h3>
                <p className="text-xs text-gray-400 font-normal">{company}</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-emerald-400">${price.toFixed(2)}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Buy / Sell Tabs */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#0e1014] p-1 border border-gray-800">
            <button
              onClick={() => setTradeType('BUY')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                tradeType === 'BUY'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <ArrowUpRight className="h-4 w-4" />
              BUY (Long)
            </button>

            <button
              onClick={() => setTradeType('SELL')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                tradeType === 'SELL'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <ArrowDownRight className="h-4 w-4" />
              SELL (Exit)
            </button>
          </div>

          {/* Shares Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Quantity (Shares)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                step="1"
                value={shares}
                onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-xl border border-gray-700 bg-[#0e1014] px-4 py-2.5 text-sm text-gray-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <div className="flex gap-1">
                {[5, 10, 50, 100].map((quick) => (
                  <button
                    key={quick}
                    onClick={() => setShares(quick)}
                    className="rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-2 text-xs text-gray-300 hover:border-emerald-500/40 hover:text-emerald-400"
                  >
                    +{quick}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calculation Summary */}
          <div className="rounded-xl border border-gray-800 bg-[#0e1014] p-4 space-y-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Estimated Price</span>
              <span className="text-gray-200">${price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Shares</span>
              <span className="text-gray-200">{shares}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Commission & Fees</span>
              <span className="text-emerald-400">$0.00 (Virtual)</span>
            </div>
            <div className="border-t border-gray-800 pt-2 flex justify-between text-sm font-bold">
              <span className="text-gray-100">Total Order Value</span>
              <span className={tradeType === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Execute Button */}
          <Button
            onClick={handleExecute}
            disabled={loading}
            className={`w-full rounded-xl py-5 text-sm font-bold transition-all ${
              tradeType === 'BUY'
                ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                : 'bg-rose-500 text-white hover:bg-rose-600'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Executing Order...</span>
              </div>
            ) : (
              `Confirm ${tradeType} ${shares} Shares`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}