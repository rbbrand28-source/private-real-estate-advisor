'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';

export default function Chatbot() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState<any[]>([]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedMessages, isThinking]);

  // Handle new AI messages with human-like delay + multi-bubble effect
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    // Only process new assistant messages
    if (lastMessage.role === 'assistant') {
      const alreadyDisplayed = displayedMessages.some((m) => m.id === lastMessage.id);
      if (alreadyDisplayed) return;

      // Step 1: Show "thinking" for 2.5 seconds
      setIsThinking(true);

      setTimeout(() => {
        setIsThinking(false);

        // Step 2: Split the reply into natural parts
        const text = lastMessage.content || '';
        const parts = text
          .split(/(?<=[.!?])\s+/)
          .filter((part) => part.trim().length > 0);

        // If only one short part, just show it
        if (parts.length <= 1) {
          setDisplayedMessages((prev) => [...prev, lastMessage]);
          return;
        }

        // Show parts one by one
        let currentIndex = 0;

        const showNextPart = () => {
          if (currentIndex >= parts.length) return;

          const partialMessage = {
            ...lastMessage,
            id: `\( {lastMessage.id}-part- \){currentIndex}`,
            content: parts[currentIndex],
          };

          setDisplayedMessages((prev) => [...prev, partialMessage]);
          currentIndex++;

          if (currentIndex < parts.length) {
            // Small delay between bubbles (like WhatsApp)
            setTimeout(showNextPart, 1200);
          }
        };

        showNextPart();
      }, 2500); // 2.5 seconds reading delay
    }

    // Always show user messages immediately
    if (lastMessage.role === 'user') {
      const alreadyDisplayed = displayedMessages.some((m) => m.id === lastMessage.id);
      if (!alreadyDisplayed) {
        setDisplayedMessages((prev) => [...prev, lastMessage]);
      }
    }
  }, [messages]);

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
        {displayedMessages.length === 0 && (
          <div className="text-sm text-stone-600 leading-relaxed">
            <p className="mb-2">Good day.</p>
            <p>How may I assist you with your property search today?</p>
          </div>
        )}

        {displayedMessages.map((m) => (
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

        {/* Thinking / Typing Indicator */}
        {isThinking && (
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
            disabled={isLoading || isThinking}
          />
          <button
            type="submit"
            disabled={isLoading || isThinking || !input.trim()}
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