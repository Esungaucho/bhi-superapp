import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MessageBubble from '@/components/agents/MessageBubble';

const AGENT_META = {
  logistics_assistant: {
    title: 'Logistics & Rentals',
    greeting: "Hello! I'm your Logistics & Rentals assistant. I can help you find and book golf carts, bikes, and beach gear, or give you real-time availability updates. What do you need today?",
  },
  trip_planner: {
    title: 'Trip Planning Concierge',
    greeting: "Welcome! I'm your Trip Planning Concierge. Tell me your travel dates, group size, and what you're looking for — I'll recommend ferry routes, lodging, dining, and activities for your Bald Head Island getaway.",
  },
  reservation_support: {
    title: 'Reservation Support',
    greeting: "Hi there! I'm here to help with your ferry and parking reservations. I can look up bookings, check statuses, and help with modifications or cancellations. What email did you book with?",
  },
};

export default function AgentChat() {
  const { agentName } = useParams();
  const meta = AGENT_META[agentName];
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let unsub = null;
    async function init() {
      try {
        const convos = await base44.agents.listConversations({ agent_name: agentName });
        if (convos && convos.length > 0) {
          const existing = convos[0];
          setConversation(existing);
          setMessages(existing.messages || []);
          setLoading(false);
          unsub = base44.agents.subscribeToConversation(existing.id, (data) => {
            setMessages(data.messages || []);
          });
        } else {
          const newConv = await base44.agents.createConversation({
            agent_name: agentName,
            metadata: { name: meta.title },
          });
          setConversation(newConv);
          setMessages(newConv.messages || [
            { role: 'assistant', content: meta.greeting },
          ]);
          setLoading(false);
          unsub = base44.agents.subscribeToConversation(newConv.id, (data) => {
            setMessages(data.messages || []);
          });
        }
      } catch (err) {
        setLoading(false);
      }
    }
    init();
    return () => { if (unsub) unsub(); };
  }, [agentName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversation || sending) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: userMsg.content });
    } catch (err) {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-128px)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-card border border-border/60 rounded-2xl px-4 py-3 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border bg-card px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 max-h-24"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}