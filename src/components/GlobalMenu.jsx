import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, ChevronDown, User, Bird, CalendarDays, ShoppingBag, Waves,
  UtensilsCrossed, Baby, Home, Hammer, CalendarHeart, Handshake, Shield, MessageCircle
} from 'lucide-react';
import { useUserAccess } from '@/hooks/useUserAccess';

const SECTIONS = [
  {
    label: 'My Island', path: '/my-island', Icon: User,
    children: [
      { label: 'Personalized Dashboard', path: '/dashboard' },
      { label: 'Favorites', path: '/saved' },
      { label: 'Saved Rentals', path: '/saved' },
      { label: 'Saved Restaurants', path: '/saved' },
      { label: 'Saved Businesses', path: '/saved' },
      { label: 'Saved Itineraries', path: '/saved' },
      { label: 'Saved Events', path: '/calendar/saved' },
      { label: 'Notifications', path: '/notifications' },
    ],
  },
  {
    label: 'Birdie Concierge', path: '/birdie', Icon: Bird,
    children: [
      { label: 'Ask Birdie (AI Assistant)', path: '/birdie' },
      { label: 'Personalized Trip Planning', path: '/birdie' },
      { label: 'Plan My Stay', path: '/birdie/new' },
      { label: 'Concierge Requests', path: '/birdie' },
      { label: 'Custom Itineraries', path: '/birdie' },
      { label: 'Transportation', path: '/concierge' },
      { label: 'Grocery Delivery', path: '/birdie/new' },
      { label: 'Private Chef Booking', path: '/concierge' },
    ],
  },
  {
    label: 'Island Chat', path: '/community', Icon: MessageCircle,
    children: [
      { label: 'Community Feed', path: '/community' },
      { label: 'Share a Post', path: '/community/submit' },
      { label: 'Lost & Found', path: '/community' },
      { label: 'Weather Alerts', path: '/community' },
      { label: 'Ferry Updates', path: '/community' },
      { label: 'Beach Conditions', path: '/community' },
      { label: 'Wildlife Sightings', path: '/community' },
      { label: 'Recommendations', path: '/community' },
      { label: 'Help Needed', path: '/community' },
    ],
  },
  {
    label: 'Island Calendar', path: '/calendar', Icon: CalendarDays,
    children: [
      { label: 'Community Events', path: '/calendar' },
      { label: 'Live Music', path: '/calendar' },
      { label: 'Holiday Events', path: '/calendar' },
      { label: 'Markets', path: '/calendar' },
      { label: 'Family Activities', path: '/calendar' },
      { label: 'Festivals', path: '/calendar' },
      { label: 'Weddings', path: '/events' },
      { label: 'Private Events', path: '/events' },
    ],
  },
  {
    label: 'Island Shop', path: '/island-shop', Icon: ShoppingBag,
    children: [
      { label: 'Local Boutiques', path: '/shops' },
      { label: 'Gifts', path: '/island-shop' },
      { label: 'Apparel', path: '/island-shop' },
      { label: 'Home Decor', path: '/island-shop' },
      { label: 'Art', path: '/island-shop' },
      { label: 'Local Products', path: '/island-shop' },
    ],
  },
  {
    label: 'Experiences', path: '/experiences', Icon: Waves,
    children: [
      { label: 'Boat Charters', path: '/experiences' },
      { label: 'Fishing Charters', path: '/experiences' },
      { label: 'Golf', path: '/experiences' },
      { label: 'Tennis', path: '/experiences' },
      { label: 'Spa', path: '/experiences' },
      { label: 'Wellness', path: '/experiences' },
      { label: 'Fitness', path: '/experiences' },
      { label: 'Kids Activities', path: '/experiences' },
      { label: 'Golf Cart Rentals', path: '/equipment' },
      { label: 'Bike Rentals', path: '/equipment' },
      { label: 'Water Sports', path: '/experiences' },
      { label: 'Sunset Cruises', path: '/experiences' },
    ],
  },
  {
    label: 'Dining', path: '/food', Icon: UtensilsCrossed,
    children: [
      { label: 'Restaurants', path: '/food' },
      { label: 'Coffee Shops', path: '/food' },
      { label: 'Bakeries', path: '/food' },
      { label: 'Breweries', path: '/food' },
      { label: 'Wine Bars', path: '/food' },
      { label: 'Private Chefs', path: '/events/vendors' },
      { label: 'Catering', path: '/events/vendors' },
      { label: 'Grocery Delivery', path: '/birdie/new' },
    ],
  },
  {
    label: 'Babysitting & Childcare', path: '/babysitting', Icon: Baby,
    children: [
      { label: 'Babysitters', path: '/babysitting' },
      { label: 'Professional Nannies', path: '/babysitting' },
      { label: 'Date Night Care', path: '/babysitting' },
      { label: 'Event Childcare', path: '/babysitting' },
      { label: 'Vacation Childcare', path: '/babysitting' },
      { label: 'Family Concierge', path: '/babysitting' },
      { label: 'Emergency Childcare', path: '/babysitting' },
      { label: 'Newborn Care', path: '/babysitting' },
      { label: 'Babysitting Request Form', path: '/babysitting' },
    ],
  },
  {
    label: 'Luxury Real Estate & Rentals', path: '/rentals', Icon: Home,
    children: [
      { label: 'Homes for Sale', path: '/real-estate' },
      { label: 'Luxury Vacation Rentals', path: '/rentals' },
      { label: 'Long-Term Rentals', path: '/rentals' },
      { label: 'Waterfront Homes', path: '/rentals' },
      { label: 'Featured Realtors', path: '/real-estate' },
      { label: 'Featured Listings', path: '/rentals' },
      { label: 'Brokerages', path: '/real-estate' },
      { label: 'Property Management', path: '/rentals' },
      { label: 'Event-Friendly Rentals', path: '/events/rentals' },
    ],
  },
  {
    label: 'Builders & Home', path: '/builders', Icon: Hammer,
    children: [
      { label: 'Custom Builders', path: '/builders' },
      { label: 'General Contractors', path: '/builders' },
      { label: 'Architects', path: '/builders' },
      { label: 'Interior Designers', path: '/builders' },
      { label: 'Landscapers', path: '/builders' },
      { label: 'Dock Builders', path: '/builders' },
      { label: 'Home Watch', path: '/builders' },
      { label: 'Property Managers', path: '/builders' },
      { label: 'Home Services', path: '/builders' },
    ],
  },
  {
    label: 'Events & Weddings', path: '/events', Icon: CalendarHeart,
    children: [
      { label: 'Wedding Planning', path: '/events' },
      { label: 'Private Events', path: '/events' },
      { label: 'Event-Friendly Rentals', path: '/events/rentals' },
      { label: 'Preferred Vendors', path: '/events/vendors' },
      { label: 'Wedding Planners', path: '/events/vendors' },
      { label: 'Event Planners', path: '/events/vendors' },
      { label: 'Private Chefs', path: '/events/vendors' },
      { label: 'Caterers', path: '/events/vendors' },
      { label: 'Florists', path: '/events/vendors' },
      { label: 'Photographers', path: '/events/vendors' },
      { label: 'Videographers', path: '/events/vendors' },
      { label: 'Wedding Content Creators', path: '/events/vendors' },
      { label: 'DJs', path: '/events/vendors' },
      { label: 'Live Musicians', path: '/events/vendors' },
      { label: 'Hair & Makeup', path: '/events/vendors' },
      { label: 'Transportation', path: '/events/vendors' },
      { label: 'Rental Companies', path: '/events/vendors' },
      { label: 'Bartenders', path: '/events/vendors' },
      { label: 'Officiants', path: '/events/vendors' },
      { label: 'Cake Designers', path: '/events/vendors' },
      { label: 'Childcare', path: '/babysitting' },
      { label: 'Beach Setup Services', path: '/events/vendors' },
    ],
  },
  {
    label: 'Community Partners', path: '/community-partners', Icon: Handshake,
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