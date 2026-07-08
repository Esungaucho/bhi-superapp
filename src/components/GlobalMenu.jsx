import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, ChevronDown, User, Bird, CalendarDays, ShoppingBag, Waves,
  UtensilsCrossed, Baby, Home, Hammer, CalendarHeart, Handshake, Shield, MessageCircle, Turtle, Landmark, Heart, Anchor, Map, ClipboardList, Crown, Car
} from 'lucide-react';
import { useUserAccess } from '@/hooks/useUserAccess';

const SECTIONS = [
  { label: 'Home / Daily Brief', path: '/dashboard', Icon: Home },
  {
    label: 'My Island', path: '/my-island', Icon: User,
    children: [
      { label: 'Personalized Dashboard', path: '/dashboard' },
      { label: 'Favorites', path: '/saved' },
      { label: 'Saved Events', path: '/calendar/saved' },
      { label: 'Notifications', path: '/notifications' },
    ],
  },
  {
    label: 'Bertie AI Concierge', path: '/birdie', Icon: Bird,
    children: [
      { label: 'Ask Birdie (AI Assistant)', path: '/birdie' },
      { label: 'Plan My Stay', path: '/birdie/itinerary' },
      { label: 'Concierge Requests', path: '/concierge' },
      { label: 'Grocery Delivery', path: '/birdie/new' },
    ],
  },
  { label: 'My Plans', path: '/my-plans', Icon: ClipboardList },
  { label: 'Live Map', path: '/map', Icon: Map },
  {
    label: 'Live Calendar', path: '/calendar', Icon: CalendarDays,
    children: [
      { label: 'Community Events', path: '/calendar' },
      { label: 'Live Music', path: '/calendar' },
      { label: 'Holiday Events', path: '/calendar' },
      { label: 'Markets', path: '/calendar' },
      { label: 'Family Activities', path: '/calendar' },
    ],
  },
  {
    label: 'Transportation & Parking', path: '/transportation', Icon: Car,
    children: [
      { label: 'Ferry + Tram Hub', path: '/ferry-tram' },
      { label: 'Ferry Schedule', path: '/ferry' },
      { label: 'Ferry Status', path: '/ferry/status' },
      { label: 'Ferry Ticket Reservations', path: '/ferry/book' },
      { label: 'Ferry Parking', path: '/ferry/parking' },
      { label: 'Car Locator', path: '/car-locator' },
      { label: 'Golf Cart Rentals', path: '/equipment' },
      { label: 'Bike Rentals', path: '/equipment' },
    ],
  },
  {
    label: 'Island Shop', path: '/island-shop', Icon: ShoppingBag,
    children: [
      { label: 'Local Boutiques', path: '/shops' },
      { label: 'Shop Before You Arrive', path: '/shop-before-arrive' },
      { label: 'Gifts & Apparel', path: '/island-shop' },
    ],
  },
  {
    label: 'Experiences', path: '/experiences', Icon: Waves,
    children: [
      { label: 'Boat Charters', path: '/experiences' },
      { label: 'Fishing Charters', path: '/experiences' },
      { label: 'Golf & Tennis', path: '/experiences' },
      { label: 'Spa & Wellness', path: '/experiences' },
      { label: 'Water Sports', path: '/experiences' },
    ],
  },
  {
    label: 'Dining', path: '/food', Icon: UtensilsCrossed,
    children: [
      { label: 'Restaurants', path: '/food' },
      { label: 'Coffee & Bakeries', path: '/food' },
      { label: 'Private Chefs', path: '/events/vendors' },
    ],
  },
  {
    label: 'Babysitting & Childcare', path: '/babysitting', Icon: Baby,
    children: [
      { label: 'Browse Sitters', path: '/babysitting' },
      { label: 'Nannies & Helpers', path: '/babysitting' },
      { label: 'Request Form', path: '/babysitting' },
    ],
  },
  {
    label: 'Mainland Shoppers', path: '/mainland-shoppers', Icon: ShoppingBag,
    children: [
      { label: 'New Shopping Request', path: '/mainland-shoppers' },
      { label: 'Wilmington Shoppers', path: '/mainland-shoppers' },
      { label: 'Southport Shoppers', path: '/mainland-shoppers' },
    ],
  },
  {
    label: 'Rentals & Real Estate', path: '/rentals', Icon: Home,
    children: [
      { label: 'Luxury Vacation Rentals', path: '/rentals' },
      { label: 'Homes for Sale', path: '/real-estate' },
      { label: 'Property Management', path: '/rentals' },
      { label: 'Builders & Home', path: '/builders' },
    ],
  },
  {
    label: 'Island Chat', path: '/community', Icon: MessageCircle,
    children: [
      { label: 'Community Feed', path: '/community' },
      { label: 'Share a Post', path: '/community/submit' },
      { label: 'Lost & Found', path: '/community' },
    ],
  },
  {
    label: 'Events & Weddings', path: '/events', Icon: CalendarHeart,
    children: [
      { label: 'Wedding Planning', path: '/events' },
      { label: 'Private Events', path: '/events' },
      { label: 'Preferred Vendors', path: '/events/vendors' },
      { label: 'Event-Friendly Rentals', path: '/events/rentals' },
    ],
  },
  {
    label: 'Sea Turtles', path: '/turtles', Icon: Turtle,
    children: [
      { label: 'Turtle Education', path: '/turtles' },
      { label: 'Nest Tracker Map', path: '/turtles/map' },
    ],
  },
  { label: 'Membership', path: '/membership', Icon: Crown },
  { label: 'Community Partners', path: '/community-partners', Icon: Handshake },
  { label: 'About the Founders', path: '/founders', Icon: Heart },
  {
    label: 'Official Village Info', path: '/village-info', Icon: Landmark,
    children: [
      { label: 'Announcements', path: '/village-info' },
      { label: 'Beach Safety', path: '/village-info' },
      { label: 'Golf Cart Registration', path: '/village-info' },
      { label: 'Contact Village Hall', path: '/village-info' },
    ],
  },
];

export default function GlobalMenu() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const location = useLocation();
  const { showAdmin } = useUserAccess();

  const allSections = [
    ...SECTIONS,
    ...(showAdmin ? [{ label: 'Admin Console', path: '/admin/revenue', Icon: Shield }] : []),
  ];

  const toggleExpand = (label) => {
    setExpanded(prev => prev === label ? null : label);
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-[18px] h-[18px]" strokeWidth={1.5} />
      </button>

      {createPortal(
        <>
          {open && (
            <div
              className="fixed inset-0 bg-black/40 z-[9998] backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
          )}

          <div
            className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-card shadow-luxe-lg z-[9999] transition-transform duration-300 ease-out ${
              open ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between px-7 h-16 border-b border-border/30">
              <span className="font-heading text-sm tracking-luxe-sm text-foreground">Bald Head Island</span>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-sand/50 transition-colors">
                <X className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={1.5} />
              </button>
            </div>

            <nav className="py-2 overflow-y-auto h-[calc(100%-65px)] no-scrollbar">
              {allSections.map(({ label, path, Icon, children }) => {
                const isExpanded = expanded === label;
                const active = isActive(path);

                return (
                  <div key={path}>
                    <div className="flex items-stretch">
                      <Link
                        to={path}
                        onClick={() => setOpen(false)}
                        className={`flex-1 flex items-center gap-4 px-7 py-3.5 text-sm font-medium transition-colors ${
                          active ? 'text-accent' : 'text-foreground hover:bg-sand/40'
                        }`}
                      >
                        <Icon className="w-[18px] h-[18px] text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                        {label}
                      </Link>
                      {children && children.length > 0 && (
                        <button
                          onClick={() => toggleExpand(label)}
                          className="px-5 flex items-center justify-center hover:bg-sand/40 transition-colors"
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          <ChevronDown
                            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            strokeWidth={1.5}
                          />
                        </button>
                      )}
                    </div>

                    {children && children.length > 0 && isExpanded && (
                      <div className="pb-1.5">
                        {children.map(({ label: childLabel, path: childPath }) => (
                          <Link
                            key={childLabel}
                            to={childPath}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 pl-14 pr-7 py-2 text-[13px] transition-colors ${
                              isActive(childPath) ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-sand/30'
                            }`}
                          >
                            {childLabel}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </>,
        document.body
      )}
    </>
  );
}