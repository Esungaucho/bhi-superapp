import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, MapPinned, Ticket, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const AGENTS = [
  {
    name: 'logistics_assistant',
    title: 'Logistics & Rentals',
    subtitle: 'Real-time rental availability, bookings & gear',
    icon: Truck,
    description: 'Find and reserve golf carts, bikes, and beach gear. Get live updates on rental availability and pickup logistics.',
    accent: 'bg-sea-glass/15 text-sea-glass-deep',
  },
  {
    name: 'trip_planner',
    title: 'Trip Planning Concierge',
    subtitle: 'Routes, lodging, dining & activities',
    icon: MapPinned,
    description: 'Plan your island trip end to end — ferry routes, lodging recommendations, dining, and activities tailored to you.',
    accent: 'bg-driftwood-light/20 text-driftwood',
  },
  {
    name: 'reservation_support',
    title: 'Reservation Support',
    subtitle: 'Ferry & parking booking management',
    icon: Ticket,
    description: 'Look up, modify, or cancel your existing ferry bookings and parking reservations. Get status updates and schedule changes.',
    accent: 'bg-sand/40 text-navy',
  },
];

export default function Agents() {
  const [conversationsByAgent, setConversationsByAgent] = useState({});

  useEffect(() => {
    AGENTS.forEach(async (agent) => {
      try {
        const convos = await base44.agents.listConversations({ agent_name: agent.name });
        setConversationsByAgent(prev => ({ ...prev, [agent.name]: convos.length }));
      } catch {
        setConversationsByAgent(prev => ({ ...prev, [agent.name]: 0 }));
      }
    });
  }, []);

  return (
    <div className="px-4 pt-6 pb-8">
      <div className="text-center mb-6">
        <h2 className="font-heading text-2xl text-foreground">Your Island Concierge</h2>
        <p className="text-sm text-muted-foreground mt-1 font-display">Always here to help, whenever you need.</p>
      </div>

      <div className="space-y-4">
        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          return (
            <Link
              key={agent.name}
              to={`/agents/chat/${agent.name}`}
              className="block bg-card border border-border/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${agent.accent} flex-shrink-0`}>
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-base text-foreground">{agent.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 tracking-luxe-sm uppercase">{agent.subtitle}</p>
                  <p className="text-sm text-foreground/70 mt-2 leading-relaxed">{agent.description}</p>
                  {conversationsByAgent[agent.name] > 0 && (
                    <p className="text-xs text-accent mt-2">{conversationsByAgent[agent.name]} active conversation(s)</p>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}