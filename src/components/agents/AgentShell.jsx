import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Bot, ChevronLeft, Home } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';
import { useNavigate } from 'react-router-dom';

export default function AgentShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const isChat = location.pathname.includes('/chat/');

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen relative">
        <header className="bg-card border-b border-border/50 px-4 py-3 flex items-center gap-3 sticky top-0 z-50 text-foreground">
          {isChat && (
            <button onClick={() => navigate('/agents')} className="p-1 -ml-1 rounded-lg hover:bg-sand/50 transition-colors">
              <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
            </button>
          )}
          <h1 className="font-heading text-sm tracking-luxe-sm">Island Concierge</h1>
          <div className="ml-auto flex items-center gap-1">
            <Link to="/dashboard" className="p-1.5 rounded-lg hover:bg-sand/50 transition-colors" aria-label="Home">
              <Home className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            <GlobalMenu />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border/50 px-2 py-1 z-50">
          <div className="flex justify-around">
            <Link to="/agents" className="flex flex-col items-center py-2 px-3 rounded-lg transition-colors text-primary">
              <Bot className="w-5 h-5" strokeWidth={2.5} />
              <span className="text-[10px] font-medium mt-0.5">Concierge</span>
            </Link>
            <Link to="/dashboard" className="flex flex-col items-center py-2 px-3 rounded-lg transition-colors text-muted-foreground">
              <Home className="w-5 h-5" strokeWidth={2} />
              <span className="text-[10px] font-medium mt-0.5">Home</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}