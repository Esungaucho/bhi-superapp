import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Bot, User, Loader2, Ship, Package } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import GlobalMenu from '@/components/GlobalMenu';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LogisticsAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const conv = await base44.agents.createConversation({
          agent_name: 'logistics_concierge',
          metadata: { name: 'Logistics Concierge', description: 'Real-time logistics & rental securing' }
        });
        setConversation(conv);
        setMessages(conv.messages || []);
      } catch (err) {
        console.error('Failed to init conversation', err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [conversation?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversation) return;
    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: userMessage });
    } catch (err) {
      setIsLoading(false);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    'What rental items are available?',
    'Find me a golf cart for this weekend',
    'When is the next ferry to the island?',
    'Show my upcoming bookings',
  ];

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen relative">
        {/* Header */}
        <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 sticky top-0 z-50 shadow-md">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-lg hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">Logistics Concierge</h1>
              <p className="text-[10px] text-primary-foreground/60">Real-time rentals & ferry updates</p>
            </div>
          </div>
          <div className="ml-auto"><GlobalMenu /></div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-accent" />
              </div>
              <h2 className="font-heading text-lg text-foreground mb-2">Your Island Logistics Concierge</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                I can help you secure rental items, check availability, and provide real-time ferry and booking updates.
              </p>
              <div className="space-y-2 w-full max-w-xs">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); }}
                    className="w-full text-left px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                    isUser ? 'bg-primary' : 'bg-accent/20'
                  }`}>
                    {isUser ? <User className="w-3.5 h-3.5 text-primary-foreground" /> : <Bot className="w-3.5 h-3.5 text-accent" />}
                  </div>
                  <div className={`px-3.5 py-2.5 rounded-2xl ${
                    isUser
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-card border border-border text-card-foreground rounded-tl-sm'
                  }`}>
                    {msg.content && (isUser
                      ? <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      : <ReactMarkdown className="text-sm prose prose-sm max-w-none">{msg.content}</ReactMarkdown>
                    )}
                    {msg.tool_calls?.map((tc, i) => {
                      const isFailed = ['failed', 'error'].includes(tc.status) ||
                        (typeof tc.results === 'string' && /error|failed/i.test(tc.results));
                      const label = tc.display_projection?.label || tc.name?.replace(/_/g, ' ');
                      return (
                        <div key={i} className="mt-2 text-xs flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/50">
                          {['pending', 'running', 'in_progress'].includes(tc.status)
                            ? <Loader2 className="w-3 h-3 animate-spin text-accent" />
                            : isFailed
                              ? <span className="text-destructive">✕</span>
                              : <span className="text-accent">✓</span>}
                          <span className="capitalize text-muted-foreground">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border bg-card px-3 py-3 pb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about rentals or ferry schedules..."
              className="flex-1 px-4 py-2.5 rounded-full bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}