import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home, Compass, Waves, CalendarDays, Users, User, Anchor, Shield, ShoppingBag } from 'lucide-react';
import { useUserAccess } from '@/hooks/useUserAccess';

const SECTIONS = [
  { label: 'Home', path: '/dashboard', Icon: Home },
  { label: 'Discovery', path: '/discovery', Icon: Compass },
  { label: 'Book Experiences', path: '/experiences', Icon: Waves },
  { label: 'Island Calendar', path: '/calendar', Icon: CalendarDays },
  { label: 'Community', path: '/community', Icon: Users },
  { label: 'Island Shop', path: '/island-shop', Icon: ShoppingBag },
  { label: 'My Island', path: '/my-island', Icon: User },
];

export default function GlobalMenu() {
  const [open, setOpen] = useState(false);
  const { showCaptainHub, showAdmin } = useUserAccess();

  const allSections = [
    ...SECTIONS.map(s => ({ ...s, children: [] })),
    ...(showAdmin ? [{ label: 'Admin Console', path: '/admin/revenue', Icon: Shield, children: [] }] : []),
  ];

  if (showCaptainHub) {
    const bookExp = allSections.find(s => s.path === '/experiences');
    if (bookExp) {
      bookExp.children = [{ label: 'Captain Hub', path: '/captain/dashboard', Icon: Anchor }];
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-[18px] h-[18px]" strokeWidth={1.5} />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-card shadow-luxe-lg z-[101] transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-7 h-16 border-b border-border/30">
          <span className="font-heading text-sm tracking-luxe-sm text-foreground">Bald Head Island</span>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-sand/50 transition-colors">
            <X className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="py-3 overflow-y-auto h-[calc(100%-65px)]">
          {allSections.map(({ label, path, Icon, children }) => (
            <React.Fragment key={path}>
              <Link
                to={path}
                onClick={() => setOpen(false)}
                className="flex items-center gap-4 px-7 py-4 text-sm font-medium text-foreground hover:bg-sand/40 transition-colors"
              >
                <Icon className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={1.5} />
                {label}
              </Link>
              {children?.map(({ label: childLabel, path: childPath, Icon: ChildIcon }) => (
                <Link
                  key={childPath}
                  to={childPath}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 pl-12 pr-7 py-3 text-sm text-muted-foreground hover:bg-sand/40 hover:text-foreground transition-colors"
                >
                  <ChildIcon className="w-[16px] h-[16px]" strokeWidth={1.5} />
                  {childLabel}
                </Link>
              ))}
            </React.Fragment>
          ))}
        </nav>
      </div>
    </>
  );
}