'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';

export default function Chatbot() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTyping, setShowTyping] = useState(false);
  const [pendingReply, setPendingReply] = useState(false);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showTyping]);

  // Human-like delay logic
  useEffect(() => {
    if (isLoading && !pendingReply) {
      // User just sent a message → wait 2.5 seconds before showing typing
      setPendingReply(true);
      setShowTyping(false);

      const timer = setTimeout(() => {
        setShowTyping(true);
      }, 2500); // 2.5 seconds reading delay

      return () => clearTimeout(timer);
    }

    if (!isLoading && pendingReply) {
      // Reply has arrived
      setShowTyping(false);
      setPendingReply(false);
    }
  }, [isLoading, pendingReply]);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[620px]">
      
      {/* Header */}
      <div className="bg-[#1C1C1C] text-white px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#C5A46D] flex items-center justify-center text-sm font-medium">
          PA
        </div>
        <div>
          <h3 className="font-medium text-[15px]">Private Advisor</h3>
          <p className="text-xs text-gray-400">Real Estate Concierge</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#faf9f7]">
        {messages.length === 0 && (
          <div className="text-sm text-stone-600 leading-relaxed">
            <p className="mb-2">Good day.</p>
            <p>How may I assist you with your property search today?</p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[#C5A46D] text-white rounded-br-md'
                  : 'bg-white text-stone-800 border border-stone-200 rounded-bl-md shadow-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {/* Typing Indicator (only after delay) */}
        {showTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
              <div className="flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
        }}
        className="p-3 bg-white border-t border-stone-200"
      >
        <div className="flex gap-2 items-center">
          <input
            className="flex-1 border border-stone-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#C5A46D] transition"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={isLoading || showTyping}
          />
          <button
            type="submit"
            disabled={isLoading || showTyping || !input.trim()}
            className="bg-[#C5A46D] text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 transition hover:bg-[#B8944F]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}