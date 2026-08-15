'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { askStockCopilot } from '@/lib/actions/gemini.actions';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AICopilotButtonProps {
  currentSymbol?: string;
}

export default function AICopilotButton({ currentSymbol }: AICopilotButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: currentSymbol
        ? `Hello! I am your **TradePulse AI Copilot**. I have loaded context for **${currentSymbol.toUpperCase()}**. How can I assist with your trading strategy or analysis today?`
        : `Hello! I am your **TradePulse AI Financial Copilot**. Ask me anything about stock valuations, market news, technical indicators, or investment strategies!`,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (customQuery?: string) => {
    const queryToSend = customQuery || input;
    if (!queryToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: queryToSend };
    setMessages((prev) => [...prev, userMessage]);
    if (!customQuery) setInput('');
    setIsLoading(true);

    const historyForAPI = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    try {
      const response = await askStockCopilot(queryToSend, currentSymbol, historyForAPI);
      setMessages((prev) => [...prev, { role: 'model', text: response.text }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: 'Sorry, I ran into an issue connecting to Gemini AI. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = currentSymbol
    ? [
        `What are the bull & bear cases for ${currentSymbol}?`,
        `Explain ${currentSymbol}'s valuation metrics`,
        `Key risks for ${currentSymbol} right now?`,
      ]
    : [
        'Top market trends right now?',
        'How to evaluate high P/E stocks?',
        'Best defensive sector stocks for volatility?',
      ];

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-3.5 px-5 font-semibold text-black shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/40 active:scale-95"
      >
        <Sparkles className="h-5 w-5 animate-pulse" />
        <span className="text-sm font-bold tracking-tight">AI Copilot</span>
      </button>

      {/* Slide-in Chat Drawer / Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[580px] w-[92vw] max-w-[420px] flex-col rounded-2xl border border-gray-800 bg-[#121418] shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 bg-[#161920] px-4 py-3 rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-100 flex items-center gap-1.5">
                  TradePulse AI Copilot
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
                <p className="text-[11px] text-gray-400">
                  {currentSymbol ? `Context: ${currentSymbol.toUpperCase()}` : 'Global Financial Intelligence'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Action Chips */}
          <div className="flex gap-1.5 overflow-x-auto p-2.5 border-b border-gray-800/60 bg-[#0e1014] scrollbar-none">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap rounded-full border border-gray-800 bg-gray-900/80 px-2.5 py-1 text-[11px] text-gray-300 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-300"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none shadow-md'
                      : 'bg-[#1a1e26] border border-gray-800/80 text-gray-200 rounded-bl-none prose prose-invert prose-xs'
                  }`}
                  style={{ wordBreak: 'break-word' }}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-none border border-gray-800 bg-[#1a1e26] px-3.5 py-2.5 text-xs text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                  <span>Analyzing market data with Gemini AI...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="border-t border-gray-800 bg-[#161920] p-3 rounded-b-2xl"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about stocks, metrics, analysis..."
                className="flex-1 rounded-xl border border-gray-700/80 bg-[#0e1014] px-3.5 py-2 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                size="sm"
                className="rounded-xl bg-emerald-500 px-3 text-black hover:bg-emerald-400 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}