'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Portfolio } from '@/database/models/portfolio.model';
import { Trade, type TradeDocument } from '@/database/models/trade.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { fetchJSON } from '@/lib/actions/finnhub.actions';
import { revalidatePath } from 'next/cache';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? '';

export interface HoldingWithCurrentData {
  symbol: string;
  company: string;
  shares: number;
  avgBuyPrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface PortfolioSummary {
  cashBalance: number;
  totalInvested: number;
  totalCurrentValue: number;
  totalEquity: number;
  totalUnrealizedPnL: number;
  totalUnrealizedPnLPercent: number;
  holdings: HoldingWithCurrentData[];
}

export async function getPortfolio(): Promise<PortfolioSummary | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return null;

    await connectToDatabase();

    let portfolio = await Portfolio.findOne({ userId: session.user.id });
    if (!portfolio) {
      portfolio = await Portfolio.create({
        userId: session.user.id,
        cashBalance: 100000,
        holdings: [],
      });
    }

    const holdingsWithData: HoldingWithCurrentData[] = await Promise.all(
      portfolio.holdings.map(async (holding) => {
        let currentPrice = holding.avgBuyPrice;
        try {
          if (FINNHUB_API_KEY) {
            const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(holding.symbol)}&token=${FINNHUB_API_KEY}`;
            const quote = await fetchJSON<{ c: number }>(url, 60);
            if (quote && typeof quote.c === 'number' && quote.c > 0) {
              currentPrice = quote.c;
            }
          }
        } catch (e) {
          console.error('Error fetching live quote for portfolio holding:', holding.symbol, e);
        }

        const totalCost = holding.shares * holding.avgBuyPrice;
        const currentValue = holding.shares * currentPrice;
        const unrealizedPnL = currentValue - totalCost;
        const unrealizedPnLPercent = totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0;

        return {
          symbol: holding.symbol,
          company: holding.company,
          shares: holding.shares,
          avgBuyPrice: holding.avgBuyPrice,
          currentPrice,
          totalCost,
          currentValue,
          unrealizedPnL,
          unrealizedPnLPercent,
        };
      })
    );

    const totalInvested = holdingsWithData.reduce((sum, h) => sum + h.totalCost, 0);
    const totalCurrentValue = holdingsWithData.reduce((sum, h) => sum + h.currentValue, 0);
    const totalEquity = portfolio.cashBalance + totalCurrentValue;
    const totalUnrealizedPnL = totalCurrentValue - totalInvested;
    const totalUnrealizedPnLPercent = totalInvested > 0 ? (totalUnrealizedPnL / totalInvested) * 100 : 0;

    return {
      cashBalance: portfolio.cashBalance,
      totalInvested,
      totalCurrentValue,
      totalEquity,
      totalUnrealizedPnL,
      totalUnrealizedPnLPercent,
      holdings: holdingsWithData,
    };
  } catch (error) {
    console.error('Error in getPortfolio:', error);
    return null;
  }
}

export async function executeTrade(params: {
  symbol: string;
  company: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
}): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: 'You must be signed in to execute trades' };
    }

    const { symbol, company, type, shares, price } = params;
    if (!shares || shares <= 0 || !price || price <= 0) {
      return { success: false, message: 'Invalid shares or price amount' };
    }

    await connectToDatabase();

    let portfolio = await Portfolio.findOne({ userId: session.user.id });
    if (!portfolio) {
      portfolio = await Portfolio.create({
        userId: session.user.id,
        cashBalance: 100000,
        holdings: [],
      });
    }

    const totalAmount = shares * price;
    const upperSymbol = symbol.toUpperCase();

    if (type === 'BUY') {
      if (portfolio.cashBalance < totalAmount) {
        return {
          success: false,
          message: `Insufficient virtual cash. Required: $${totalAmount.toFixed(2)}, Available: $${portfolio.cashBalance.toFixed(2)}`,
        };
      }

      portfolio.cashBalance -= totalAmount;

      const existingIndex = portfolio.holdings.findIndex((h) => h.symbol === upperSymbol);
      if (existingIndex >= 0) {
        const existing = portfolio.holdings[existingIndex];
        const existingTotalCost = existing.shares * existing.avgBuyPrice;
        const newTotalCost = existingTotalCost + totalAmount;
        const newTotalShares = existing.shares + shares;
        existing.shares = newTotalShares;
        existing.avgBuyPrice = newTotalCost / newTotalShares;
      } else {
        portfolio.holdings.push({
          symbol: upperSymbol,
          company: company || upperSymbol,
          shares,
          avgBuyPrice: price,
        });
      }
    } else {
      // SELL
      const existingIndex = portfolio.holdings.findIndex((h) => h.symbol === upperSymbol);
      if (existingIndex < 0 || portfolio.holdings[existingIndex].shares < shares) {
        const owned = existingIndex >= 0 ? portfolio.holdings[existingIndex].shares : 0;
        return {
          success: false,
          message: `Cannot sell ${shares} shares. You only own ${owned} shares of ${upperSymbol}.`,
        };
      }

      portfolio.cashBalance += totalAmount;
      const existing = portfolio.holdings[existingIndex];
      existing.shares -= shares;

      if (existing.shares === 0) {
        portfolio.holdings.splice(existingIndex, 1);
      }
    }

    await portfolio.save();

    await Trade.create({
      userId: session.user.id,
      symbol: upperSymbol,
      company: company || upperSymbol,
      type,
      shares,
      price,
      totalAmount,
      executedAt: new Date(),
    });

    revalidatePath('/portfolio');
    return {
      success: true,
      message: `Successfully executed ${type} order for ${shares} shares of ${upperSymbol} at $${price.toFixed(2)}!`,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Trade execution failed';
    console.error('Error executing trade:', error);
    return { success: false, message: errorMsg };
  }
}

export async function getTradeHistory(): Promise<TradeDocument[]> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return [];

    await connectToDatabase();
    const trades = await Trade.find({ userId: session.user.id }).sort({ executedAt: -1 }).limit(50).lean();
    return JSON.parse(JSON.stringify(trades)) as TradeDocument[];
  } catch (error) {
    console.error('Error in getTradeHistory:', error);
    return [];
  }
}

export async function resetPortfolio(): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: 'You must be signed in' };
    }

    await connectToDatabase();
    await Portfolio.findOneAndUpdate(
      { userId: session.user.id },
      { $set: { cashBalance: 100000, holdings: [] } },
      { upsert: true }
    );

    await Trade.deleteMany({ userId: session.user.id });

    revalidatePath('/portfolio');
    return { success: true, message: 'Portfolio has been reset to $100,000 cash balance.' };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to reset portfolio';
    return { success: false, message: errorMsg };
  }
}