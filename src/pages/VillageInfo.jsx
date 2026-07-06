import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ExternalLink, Megaphone, Siren, CalendarDays, Ship, ShieldCheck, Waves, Bike, Trash2, Dog, BookOpen, Phone } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';

const SOURCE_LABEL = 'Official Village of Bald Head Island';

const CARDS = [
  {
    id: 'announcements',
    title: 'Announcements',
    description: 'Official Village news, project updates, and public notices from Village Hall.',
    url: 'https://villagebhi.org/announcement-category/announcements/',
    Icon: Megaphone,
  },
  {
    id: 'emergency-alerts',
    title: 'Emergency Alerts',
    description: 'Subscribe to CodeRED notifications and review storm preparedness resources.',
    url: 'https://live-village-bhi.pantheonsite.io/departments-services/public-safety/emergency-preparedness/',
    Icon: Siren,
  },
  {
    id: 'village-calendar',
    title: 'Village Calendar',
    description: 'Holiday closures, trash and yard debris pick-up dates, Council meetings, and more.',
    url: 'https://villagebhi.org/residents-owners/view/village-calendar/',
    Icon: CalendarDays,
  },
  {
    id: 'ferry-info',
    title: 'Ferry Information',
    description: 'Schedules, fares, and reservations for the Bald Head Island ferry.',
    url: 'http://baldheadislandferry.com/',
    Icon: Ship,
  },
  {
    id: 'beach-safety',
    title: 'Beach Safety',
    description: 'Rip current forecasts, beach regulations, and lifeguard information.',
    url: 'https://villagebhi.org/beach-forecast/',
    Icon: ShieldCheck,
  },
  {
    id: 'beach-access',
    title: 'Public Beach Accesses',
    description: 'Locations and status of all public beach access points on BHI.',
    url: 'https://villagebhi.org/visitors/public-beach-accesses/',
    Icon: Waves,
  },
  {
    id: 'golf-cart-registration',
    title: 'Golf Cart Registration',
    description: 'Register your golf cart or low-speed vehicle with the Village.',
    url: 'https://villagebhi.org/residents-owners/submit-a/golf-cart-electric-vehicle-registration/',
    Icon: Bike,
  },
  {
    id: 'trash-recycling',
    title: 'Trash & Recycling',
    description: 'Collection schedules, recycling center hours, and waste guidelines.',
    url: 'https://villagebhi.org/departments-services/public-works/trash-collection/',
    Icon: Trash2,
  },
  {
    id: 'dogs-on-bhi',
    title: 'Dogs on BHI',
    description: 'Leash rules, turtle-season restrictions, and waste disposal ordinances.',
    url: 'https://villagebhi.org/visitors/dogs-on-bhi/',
    Icon: Dog,
  },
  {
    id: 'island-directory',
    title: 'Island Directory',
    description: 'Contact info for utilities, POAs, nonprofits, and island services.',
    url: 'https://villagebhi.org/visitors/island-directory/',
    Icon: BookOpen,
  },
  {
    id: 'contact-village-hall',
    title: 'Contact Village Hall',
    description: 'Phone, hours, and service request options for Village Hall.',
    url: 'https://villagebhi.org/contact/',
    Icon: Phone,
  },
];

export default function VillageInfo() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border/30 px-4 h-14 flex items-center gap-3">
        <Link to="/dashboard" className="p-1.5 -ml-1 rounded-full hover:bg-sand/50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
        </Link>
        <h1 className="font-heading text-base text-foreground flex-1">Official Village Info</h1>
        <GlobalMenu />
      </header>

      <div className="px-4 py-5">
        {/* Intro */}
        <div className="mb-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Quick links to official information from the Village of Bald Head Island. Always visit the Village website for the most current and complete details.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-3">
          {CARDS.map(({ id, title, description, url, Icon }) => (
            <div key={id} className="bg-card rounded-2xl border border-border/50 p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-sm font-semibold text-foreground">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">{description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-luxe-xs">
                  {SOURCE_LABEL}
                </span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent/10 hover:bg-accent/15 rounded-full px-3 py-1.5 transition-colors"
                >
                  View Official Info
                  <ExternalLink className="w-3 h-3" strokeWidth={2} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-[11px] text-muted-foreground/60 text-center mt-6 leading-relaxed">
          Information summaries are provided for convenience only. The Village of Bald Head Island website is the authoritative source for all official content.
        </p>
      </div>
    </div>
  );
}