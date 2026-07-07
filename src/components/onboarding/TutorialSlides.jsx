import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Map, CalendarDays, ConciergeBell, ShoppingBag, Baby, MessageCircle, Sparkles, Waves, ClipboardList } from 'lucide-react';

const SLIDES = [
  {
    title: 'Welcome to BHI Concierge',
    text: 'The easiest way to plan, arrive, explore, and enjoy Bald Head Island.',
    Icon: Sparkles,
    gradient: 'from-ocean to-sea-glass',
  },
  {
    title: 'Live Island Map',
    text: 'Find restaurants, beaches, ferry information, turtle nests, rentals, events, transportation, and island resources.',
    Icon: Map,
    gradient: 'from-sea-glass to-ocean',
  },
  {
    title: 'Live Island Calendar',
    text: 'See island events, club activities, live music, family activities, holiday events, and important updates.',
    Icon: CalendarDays,
    gradient: 'from-ocean-deep to-ocean',
  },
  {
    title: 'Concierge Services',
    text: 'Request help with groceries, shopping, babysitting, transportation, rentals, dining, and trip planning.',
    Icon: ConciergeBell,
    gradient: 'from-sea-glass to-sea-glass-deep',
  },
  {
    title: 'Mainland Shoppers',
    text: 'Book verified shoppers in Wilmington or Southport to pick up items and deliver them to the ferry or coordinate island delivery.',
    Icon: ShoppingBag,
    gradient: 'from-ocean to-ocean-deep',
  },
  {
    title: 'Babysitting Agency',
    text: 'Browse trusted babysitters, nannies, mother\u2019s helpers, and family support services.',
    Icon: Baby,
    gradient: 'from-sea-glass-deep to-ocean',
  },
  {
    title: 'Community Chat',
    text: 'Connect with guests and residents through a positive, moderated island chat room.',
    Icon: MessageCircle,
    gradient: 'from-ocean-deep to-sea-glass',
  },
  {
    title: 'Shop Before You Arrive',
    text: 'Shop curated Amazon affiliate links for beach gear, baby essentials, groceries, travel items, and vacation supplies before your trip.',
    Icon: ShoppingBag,
    gradient: 'from-sea-glass to-ocean-deep',
  },
  {
    title: 'Rentals & Experiences',
    text: 'Browse luxury rentals, golf carts, bikes, boats, experiences, dining, and local recommendations.',
    Icon: Waves,
    gradient: 'from-ocean to-sea-glass-deep',
  },
  {
    title: 'My Plans',
    text: 'Save your ferry tickets, reservations, events, shopping lists, concierge requests, and trip itinerary all in one place.',
    Icon: ClipboardList,
    gradient: 'from-ocean-deep to-sea-glass-deep',
  },
];

export default function TutorialSlides({ onComplete }) {
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const next = () => (isLast ? onComplete() : setIndex(i => i + 1));
  const prev = () => setIndex(i => Math.max(0, i - 1));

  const slide = SLIDES[index];
  const Icon = slide.Icon;

  return (
    <div className="fixed inset-0 bg-background z-[10000] flex flex-col">
      <div className="flex justify-end p-4">
        <button onClick={onComplete} className="p-2 rounded-full hover:bg-sand/50 transition-colors">
          <X className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col items-center text-center max-w-md"
          >
            <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center mb-8 shadow-luxe-lg`}>
              <Icon className="w-12 h-12 text-white" strokeWidth={1} />
            </div>
            <h2 className="font-heading text-2xl text-foreground mb-4">{slide.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{slide.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-8 pb-10">
        <div className="flex justify-center gap-1.5 mb-8">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-primary' : 'w-1.5 bg-border'}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            onClick={prev}
            disabled={index === 0}
            className="flex items-center gap-1 text-sm text-muted-foreground disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} /> Back
          </button>

          <button
            onClick={next}
            className="flex-1 max-w-[200px] bg-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold tracking-luxe-xs"
          >
            {isLast ? 'Get Started' : 'Continue'}
            {!isLast && <ChevronRight className="w-4 h-4 inline ml-1" strokeWidth={1.5} />}
          </button>
        </div>
      </div>
    </div>
  );
}