import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'bhi_notif_prompt_seen';

export default function NotificationPermissionPrompt() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen) return;

    // Small delay so it appears after the page settles
    const timer = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(timer);
  }, [user?.email]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShow(false);
  };

  const handleResponse = async (accepted) => {
    try {
      if (accepted && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      const existing = await base44.entities.UserPreference.filter({ user_email: user.email });
      const prefData = { user_email: user.email, user_name: user.full_name, comm_push: accepted };
      if (existing.length > 0) {
        await base44.entities.UserPreference.update(existing[0].id, prefData);
      } else {
        await base44.entities.UserPreference.create(prefData);
      }
      queryClient.invalidateQueries({ queryKey: ['userPreference'] });
    } catch (err) {
      console.error('Failed to save notification preference:', err);
    } finally {
      dismiss();
    }
  };

  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-3xl shadow-luxe-lg w-full max-w-sm p-7 animate-fade-up">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center">
            <Bell className="w-8 h-8 text-accent" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="font-heading text-lg text-center text-foreground mb-2">Stay in the loop</h2>
        <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
          We'd like to send you notifications about ferry updates, island events, weather alerts, and more. Would you like to receive them?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleResponse(false)}
            className="flex-1 h-12 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-sand/40 transition-colors flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" strokeWidth={2} />
            No Thanks
          </button>
          <button
            onClick={() => handleResponse(true)}
            className="flex-1 h-12 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" strokeWidth={2} />
            Yes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}