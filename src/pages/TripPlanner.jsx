import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Sparkles, Calendar, BedDouble, Ship, Loader2 } from 'lucide-react';
import MessageBubble from '@/components/agents/MessageBubble';

const SUGGESTIONS = [
  { icon: Calendar, label: 'Plan a weekend trip for 4', prompt: "I'd like to plan a weekend trip to Bald Head Island for 4 people. What ferry route and lodging would you recommend?" },
  { icon: BedDouble, label: 'Find a beachfront rental', prompt: "Can you find a beachfront lodging option with at least 3 bedrooms for a family getaway?" },
  { icon: Ship, label: 'Best ferry route for a day trip', prompt: "What's the best ferry route and schedule for a day trip to the island?" },
];

export default function TripPlanner() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const convos = await base44.agents.listConversations({ agent_name: 'trip_planner' });
        if (convos && convos.length > 0) {
          const existing = convos[0];
          setConversation(existing);
          setMessages(existing.messages || []);
        } else {
          const newConvo = await base44.agents.createConversation({
            agent_name: 'trip_planner',
            metadata: { name: 'Trip Planning', description: 'Plan your Bald Head Island trip' },
          });
          setConversation(newConvo);
          setMessages(newConvo.messages || []);
        }
      } catch (e) {
        console.error('Failed to load conversation', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
      setSending(false);
    });
    return () => unsubscribe();
  }, [conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const content = (text ?? input).trim();
    if (!content || !conversation || sending) return;
    setInput('');
    setSending(true);
    setMessages(prev => [...prev, { role: 'user', content }]);
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content });
    } catch (e) {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = !loading && messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem-3.5rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-accent" strokeWidth={1.5} />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-accent" strokeWidth={1.5} />
            </div>
            <h2 className="font-heading text-xl text-foreground mb-1.5">Plan Your Island Trip</h2>
            <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
              Tell me about your travel dates, group size, and preferences — I'll recommend ferry routes and lodging tailored to you.
            </p>
            <div className="space-y-2 w-full max-w-xs">
              {SUGGESTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    onClick={() => handleSend(s.prompt)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:border-accent/40 hover:bg-accent/5 transition-colors text-left"
                  >
                    <Icon className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-sm text-foreground font-medium">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
            {sending && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '120ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '240ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-3 py-2.5">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about routes, lodging, or your trip…"
            rows={1}
            className="flex-1 resize-none bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40 max-h-28"
            style={{ minHeight: '42px' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || sending}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-navy-deep transition-colors"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}