'use client';

import React, { useState } from 'react';
import { toggleWatchlist } from '@/lib/actions/watchlist.actions';
import { toast } from 'sonner';
import { Star, Trash2, Loader2 } from 'lucide-react';

interface WatchlistButtonProps {
  symbol: string;
  company: string;
  isInWatchlist?: boolean;
  showTrashIcon?: boolean;
  type?: 'button' | 'icon';
  onWatchlistChange?: (symbol: string, isAdded: boolean) => void;
}

export default function WatchlistButton({
  symbol,
  company,
  isInWatchlist = false,
  showTrashIcon = false,
  type = 'button',
  onWatchlistChange,
}: WatchlistButtonProps) {
  const [added, setAdded] = useState<boolean>(!!isInWatchlist);
  const [loading, setLoading] = useState<boolean>(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    const previousState = added;
    const optimisticState = !added;
    setAdded(optimisticState);
    setLoading(true);

    try {
      const res = await toggleWatchlist({ symbol, company });
      if (res.success) {
        setAdded(res.isInWatchlist);
        onWatchlistChange?.(symbol, res.isInWatchlist);
        toast.success(res.message);
      } else {
        setAdded(previousState);
        toast.error(res.message);
      }
    } catch (err: unknown) {
      setAdded(previousState);
      const errorMsg = err instanceof Error ? err.message : 'Failed to update watchlist';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (type === 'icon') {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        title={added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
        aria-label={added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
        className={`rounded-lg border p-2 transition-all ${
          added
            ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400'
            : 'border-gray-800 bg-gray-900/80 text-gray-400 hover:border-gray-700 hover:text-gray-200'
        } disabled:opacity-50`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
        ) : (
          <Star className={`h-4 w-4 ${added ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all shadow-md ${
        added
          ? 'border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
          : 'border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
      } disabled:opacity-50`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : showTrashIcon && added ? (
        <Trash2 className="h-4 w-4 text-rose-400" />
      ) : (
        <Star className={`h-4 w-4 ${added ? 'fill-yellow-400' : ''}`} />
      )}
      <span>{added ? 'In Watchlist' : 'Add to Watchlist'}</span>
    </button>
  );
}