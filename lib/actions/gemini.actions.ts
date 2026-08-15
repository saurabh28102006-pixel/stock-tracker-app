'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getNews } from '@/lib/actions/finnhub.actions';

const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function askStockCopilot(
  query: string,
  symbol?: string,
  history: Array<{ role: 'user' | 'model'; parts: { text: string }[] }> = []
): Promise<{ text: string; success: boolean }> {
  try {
    if (!apiKey) {
      return { text: 'Gemini API key is not configured. Please check your .env file.', success: false };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemInstruction = `You are TradePulse AI Copilot, an elite quantitative financial analyst and stock market advisor.
You provide concise, high-value, accurate, and insightful market analysis.
${symbol ? `The user is currently analyzing the stock: ${symbol.toUpperCase()}. Provide specific context for this ticker when relevant.` : ''}
Use markdown formatting with bullet points and bold highlights.
Always include a brief disclaimer at the very end reminding users that this is AI educational analysis, not financial advice.`;

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: `System Prompt: ${systemInstruction}` }],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood. I am ready to provide insightful, accurate financial analysis.' }],
        },
        ...history,
      ],
    });

    const result = await chat.sendMessage(query);
    const responseText = result.response.text();

    return { text: responseText, success: true };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in askStockCopilot:', error);
    return {
      text: `Sorry, I encountered an issue analyzing your request: ${errorMsg}. Please try again.`,
      success: false,
    };
  }
}

export interface SentimentAnalysis {
  score: number; // 0 to 100
  verdict: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  summary: string;
  catalysts: string[];
  risks: string[];
}

export async function getStockSentiment(symbol: string): Promise<SentimentAnalysis> {
  const fallback: SentimentAnalysis = {
    score: 65,
    verdict: 'NEUTRAL',
    summary: `Market sentiment for ${symbol.toUpperCase()} remains balanced based on recent market conditions.`,
    catalysts: ['Steady institutional interest', 'Industry resilience', 'Solid market positioning'],
    risks: ['Broad market volatility', 'Macroeconomic interest rate sensitivity', 'Sector competition'],
  };

  try {
    if (!apiKey) return fallback;

    const articles = await getNews([symbol]);
    const cleanNews = (articles || []).slice(0, 5).map((a) => ({
      headline: a.headline,
      summary: a.summary,
      source: a.source,
    }));

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze the current market sentiment for stock symbol: ${symbol.toUpperCase()} based on these latest news headlines:
${JSON.stringify(cleanNews, null, 2)}

Respond ONLY with a valid JSON object matching this exact TypeScript structure:
{
  "score": number (0 to 100, where 0=very bearish, 50=neutral, 100=very bullish),
  "verdict": "BULLISH" | "BEARISH" | "NEUTRAL",
  "summary": "2-3 sentences summarizing the immediate news sentiment and investor mood",
  "catalysts": ["catalyst 1", "catalyst 2", "catalyst 3"],
  "risks": ["risk factor 1", "risk factor 2", "risk factor 3"]
}
Do NOT include markdown formatting or backticks around the JSON. Just pure JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json/i, '').replace(/```$/i, '').trim();

    const parsed = JSON.parse(text);
    return {
      score: typeof parsed.score === 'number' ? parsed.score : 60,
      verdict: ['BULLISH', 'BEARISH', 'NEUTRAL'].includes(parsed.verdict) ? parsed.verdict : 'NEUTRAL',
      summary: parsed.summary || fallback.summary,
      catalysts: Array.isArray(parsed.catalysts) ? parsed.catalysts.slice(0, 3) : fallback.catalysts,
      risks: Array.isArray(parsed.risks) ? parsed.risks.slice(0, 3) : fallback.risks,
    };
  } catch (error) {
    console.error('Error fetching stock sentiment:', error);
    return fallback;
  }
}

export async function compareStocksAI(
  stockA: { symbol: string; name: string },
  stockB: { symbol: string; name: string }
): Promise<{ verdict: string; winner: string; analysis: string }> {
  try {
    if (!apiKey) {
      return {
        verdict: 'Both stocks represent solid leaders in their respective segments.',
        winner: stockA.symbol,
        analysis: 'Comparison analysis requires active Gemini API key.',
      };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Compare these two stocks for a modern investor:
Stock 1: ${stockA.symbol} (${stockA.name})
Stock 2: ${stockB.symbol} (${stockB.name})

Provide a comprehensive breakdown with:
1. Winner pick (which one has higher risk-reward balance right now)
2. Strengths of ${stockA.symbol}
3. Strengths of ${stockB.symbol}
4. Clear Conclusion & Recommendation

Keep the tone professional, insightful, and formatted cleanly with markdown bolding and bullet points.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return {
      winner: text.includes(stockA.symbol) && !text.includes(stockB.symbol) ? stockA.symbol : stockA.symbol,
      verdict: `Comparative analysis between ${stockA.symbol} and ${stockB.symbol}`,
      analysis: text,
    };
  } catch (error: unknown) {
    console.error('Error in compareStocksAI:', error);
    return {
      verdict: 'Comparison temporarily unavailable',
      winner: stockA.symbol,
      analysis: 'Could not complete AI comparison at this moment.',
    };
  }
}