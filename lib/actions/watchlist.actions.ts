'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { fetchJSON } from '@/lib/actions/finnhub.actions';
import { revalidatePath } from 'next/cache';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? '';

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });
    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

export async function toggleWatchlist(params: {
  symbol: string;
  company: string;
}): Promise<{ success: boolean; isInWatchlist: boolean; message: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, isInWatchlist: false, message: 'Please sign in to manage your watchlist' };
    }

    const { symbol, company } = params;
    const upper = symbol.trim().toUpperCase();

    await connectToDatabase();

    const existing = await Watchlist.findOne({ userId: session.user.id, symbol: upper });

    if (existing) {
      await Watchlist.deleteOne({ _id: existing._id });
      revalidatePath('/watchlist');
      revalidatePath(`/stocks/${upper.toLowerCase()}`);
      return {
        success: true,
        isInWatchlist: false,
        message: `Removed ${upper} from your watchlist`,
      };
    } else {
      await Watchlist.create({
        userId: session.user.id,
        symbol: upper,
        company: company || upper,
        addedAt: new Date(),
      });
      revalidatePath('/watchlist');
      revalidatePath(`/stocks/${upper.toLowerCase()}`);
      return {
        success: true,
        isInWatchlist: true,
        message: `Added ${upper} to your watchlist`,
      };
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to update watchlist';
    console.error('Error toggling watchlist:', error);
    return { success: false, isInWatchlist: false, message: errorMsg };
  }
}

export async function isStockInWatchlist(symbol: string): Promise<boolean> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return false;

    await connectToDatabase();
    const item = await Watchlist.findOne({ userId: session.user.id, symbol: symbol.toUpperCase() }).lean();
    return !!item;
  } catch {
    return false;
  }
}

export interface WatchlistStockData {
  symbol: string;
  company: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  addedAt: Date;
}

export async function getUserWatchlist(): Promise<WatchlistStockData[]> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return [];

    await connectToDatabase();
    const items = await Watchlist.find({ userId: session.user.id }).sort({ addedAt: -1 }).lean();

    const itemsWithData: WatchlistStockData[] = await Promise.all(
      items.map(async (item) => {
        let currentPrice = 0;
        let change = 0;
        let changePercent = 0;

        try {
          if (FINNHUB_API_KEY) {
            const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(item.symbol)}&token=${FINNHUB_API_KEY}`;
            const quote = await fetchJSON<{ c: number; d: number; dp: number }>(url, 60);
            if (quote && typeof quote.c === 'number') {
              currentPrice = quote.c;
              change = quote.d || 0;
              changePercent = quote.dp || 0;
            }
          }
        } catch (e) {
          console.error('Error fetching quote for watchlist symbol:', item.symbol, e);
        }

        return {
          symbol: item.symbol,
          company: item.company,
          currentPrice,
          change,
          changePercent,
          addedAt: item.addedAt,
        };
      })
    );

    return itemsWithData;
  } catch (error) {
    console.error('Error in getUserWatchlist:', error);
    return [];
  }
}