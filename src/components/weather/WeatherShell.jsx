import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { CloudSun, MapPin, Home } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';

const BG_IMAGE = 'https://media.base44.com/images/public/69c9efaf81beb7831e6e5295/684907d34_generated_image.png';

const navItems = [
  { path: '/weather', label: 'Conditions', icon: CloudSun },
  { path: '/map', label: 'Map', icon: MapPin },
];

export default function WeatherShell() {
  const location = useLocation();

  return (
    <div
      className="min-h-screen flex justify-center bg-[#356578]"
      style={{ backgroundImage: `url(${BG_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="w-full max-w-[430px] flex flex-col min-h-screen relative">
        <header className="bg-white/20 backdrop-blur-xl border-b border-white/25 px-4 py-3 flex items-center gap-3 sticky top-0 z-50 text-[#1E3A45]">
          <h1 className="font-heading text-sm tracking-luxe-sm">ISLAND CONDITIONS</h1>
          <div className="ml-auto flex items-center gap-1">
            <Link to="/dashboard" className="p-1.5 rounded-lg hover:bg-white/20 transition-colors" aria-label="Home">
              <Home className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            <GlobalMenu />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/20 backdrop-blur-xl border-t border-white/25 px-2 py-1 z-50">
          <div className="flex justify-around">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${isActive ? 'text-[#1E3A45]' : 'text-[#1E3A45]/45'}`}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}