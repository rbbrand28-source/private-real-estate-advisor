'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';

export default function Chatbot() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showTyping, setShowTyping] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<any[]>([]);
  const processedIds = useRef<Set<string>>(new Set());
  const isProcessing = useRef(false);
  const leadSent = useRef(false);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages, showTyping]);

  // Function to send lead to Formspree
  const sendLeadToEmail = async (name: string, phone: string, notes: string) => {
    if (leadSent.current) return;
    leadSent.current = true;

    try {
      await fetch('https://formspree.io/f/xzezejdr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: name,
          phone: phone,
          notes: notes,
          source: 'Private Real Estate Advisor Chatbot',
        }),
      });
      console.log('Lead sent successfully');
    } catch (error) {
      console.error('Failed to send lead:', error);
    }
  };

  // Detect Name + Phone from user messages
  useEffect(() => {
    if (messages.length === 0 || leadSent.current) return;

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMessage) return;

    const text = lastUserMessage.content.toLowerCase();

    // Simple phone number detection (Indian numbers)
    const phoneMatch = text.match(/(?:\+91[\s-]?)?[6-9]\d{9}/);
    if (!phoneMatch) return;

    const phone = phoneMatch[0];

    // Try to extract name (very basic)
    let name = 'Not provided';
    const nameMatch = lastUserMessage.content.match(/(?:name is|i am|this is|myself)\s+([a-zA-Z\s]{2,30})/i);
    if (nameMatch) {
      name = nameMatch[1].trim();
    } else {
      // Take first few words as name if no clear pattern
      const words = lastUserMessage.content.replace(phone, '').trim().split(/\s+/);
      if (words.length > 0 && words[0].length > 2) {
        name = words.slice(0, 2).join(' ');
      }
    }

    // Collect some context from previous messages
    const recentMessages = messages.slice(-6).map((m) => `${m.role}: ${m.content}`).join('\n');

    sendLeadToEmail(name, phone, recentMessages);
  }, [messages]);

  // Main controlled flow for human-like typing
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    // Show user messages immediately
    if (lastMessage.role === 'user' && !processedIds.current.has(lastMessage.id)) {
      processedIds.current.add(lastMessage.id);
      setVisibleMessages((prev) => [...prev, lastMessage]);
      return;
    }

    // Handle assistant message
    if (
      lastMessage.role === 'assistant' &&
      !processedIds.current.has(lastMessage.id) &&
      !isLoading &&
      !isProcessing.current
    ) {
      isProcessing.current = true;
      processedIds.current.add(lastMessage.id);

      const text = lastMessage.content || '';
      const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

      // Realistic typing speed: 100 words per minute
      let typingDuration = Math.round((wordCount / 100) * 60 * 1000);
      typingDuration = Math.max(2500, Math.min(typingDuration, 12000));

      // Reading delay
      setTimeout(() => {
        setShowTyping(true);

        setTimeout(() => {
          setShowTyping(false);
          setVisibleMessages((prev) => [...prev, lastMessage]);
          isProcessing.current = false;
        }, typingDuration);
      }, 2500);
    }
  }, [messages, isLoading]);

  // Reset on new chat
  useEffect(() => {
    if (messages.length === 0) {
      setVisibleMessages([]);
      processedIds.current.clear();
      setShowTyping(false);
      isProcessing.current = false;
      leadSent.current = false;
    }
  }, [messages.length]);

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
        {visibleMessages.length === 0 && !showTyping && (
          <div className="text-sm text-stone-600 leading-relaxed">
            <p className="mb-2">Good day.</p>
            <p>How may I assist you with your property search today?</p>
          </div>
        )}

        {visibleMessages.map((m) => (
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

        {/* Typing Indicator */}
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