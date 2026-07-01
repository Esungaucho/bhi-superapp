import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Download, Trash2, ChevronRight, Shield, FileText, Mail, AlertTriangle, Loader2, X, KeyRound } from 'lucide-react';

export default function Privacy() {
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const [downloading, setDownloading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showPolicy, setShowPolicy] = useState(null);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await base44.functions.invoke('downloadUserData', {});
      const data = response.data || response;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bhi-account-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleting(true);
    try {
      const prefs = await base44.entities.UserPreference.filter({ user_email: user.email });
      for (const p of prefs) {
        await base44.entities.UserPreference.update(p.id, { newsletter_subscribed: false });
      }
      const subs = await base44.entities.NewsletterSubscription.filter({ user_email: user.email });
      for (const s of subs) {
        await base44.entities.NewsletterSubscription.update(s.id, { is_subscribed_to_newsletter: false, unsubscribed_at: new Date().toISOString() });
      }
      await base44.auth.updateMe({
        first_name: 'Deleted',
        last_name: 'User',
        phone: '',
        avatar: '',
        onboarding_complete: false,
      });
      base44.auth.logout(window.location.origin);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="px-4 pt-4 pb-8 animate-fade-in">
      <header className="mb-6">
        <h1 className="font-heading text-2xl text-foreground">Privacy & Data</h1>
        <p className="text-sm text-muted-foreground mt-1">Your data, your control</p>
      </header>

      {/* Data & Privacy */}
      <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 px-1">Your Data</h3>
      <div className="bg-card border border-border/50 rounded-2xl mb-6 overflow-hidden">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full flex items-center gap-3 p-4 border-b border-border/50 hover:bg-sand/40 transition-colors text-left disabled:opacity-50"
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-sand text-navy flex-shrink-0">
            {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" strokeWidth={1.5} />}
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Download My Data</p>
            <p className="text-xs text-muted-foreground mt-0.5">Export all your account information</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" strokeWidth={1.5} />
        </button>

        <Link to="/communication" className="flex items-center gap-3 p-4 border-b border-border/50 hover:bg-sand/40 transition-colors">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-sand text-navy flex-shrink-0">
            <Mail className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Communication Preferences</p>
            <p className="text-xs text-muted-foreground mt-0.5">Manage notification & newsletter settings</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" strokeWidth={1.5} />
        </Link>

        <button
          onClick={() => setShowDelete(true)}
          className="w-full flex items-center gap-3 p-4 hover:bg-red-50/50 transition-colors text-left"
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 text-destructive flex-shrink-0">
            <Trash2 className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Delete My Account</p>
            <p className="text-xs text-muted-foreground mt-0.5">Permanently remove your account & data</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" strokeWidth={1.5} />
        </button>
      </div>

      {/* Change Password */}
      <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 px-1">Account Security</h3>
      <div className="bg-card border border-border/50 rounded-2xl mb-6">
        <button
          onClick={() => base44.auth.redirectToLogin()}
          className="w-full flex items-center gap-3 p-4 hover:bg-sand/40 transition-colors text-left"
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-sand text-navy flex-shrink-0">
            <KeyRound className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Reset Password</p>
            <p className="text-xs text-muted-foreground mt-0.5">Use the login page's "Forgot Password" link</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" strokeWidth={1.5} />
        </button>
      </div>

      {/* Legal */}
      <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 px-1">Legal</h3>
      <div className="bg-card border border-border/50 rounded-2xl mb-6">
        <button
          onClick={() => setShowPolicy('privacy')}
          className="w-full flex items-center gap-3 p-4 border-b border-border/50 hover:bg-sand/40 transition-colors text-left"
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-sand text-navy flex-shrink-0">
            <Shield className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Privacy Policy</p>
            <p className="text-xs text-muted-foreground mt-0.5">How we collect and use your data</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => setShowPolicy('terms')}
          className="w-full flex items-center gap-3 p-4 hover:bg-sand/40 transition-colors text-left"
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-sand text-navy flex-shrink-0">
            <FileText className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Terms of Service</p>
            <p className="text-xs text-muted-foreground mt-0.5">The rules for using BHI SuperApp</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" strokeWidth={1.5} />
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed px-4">
        Bald Head Island SuperApp is committed to protecting your privacy. Contact Base44 support for any data-related requests.
      </p>

      {/* Policy Modal */}
      {showPolicy && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-4" onClick={() => setShowPolicy(null)}>
          <div className="bg-card rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-card flex items-center justify-between px-5 py-4 border-b border-border/50">
              <h3 className="font-heading text-lg text-foreground">
                {showPolicy === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h3>
              <button onClick={() => setShowPolicy(null)} className="p-1.5 rounded-lg hover:bg-secondary">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 py-4 text-sm text-muted-foreground leading-relaxed space-y-3">
              {showPolicy === 'privacy' ? (
                <>
                  <p><strong className="text-foreground">Last updated: July 2026</strong></p>
                  <p>Bald Head Island SuperApp ("we", "us") is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.</p>
                  <p><strong className="text-foreground">Information We Collect</strong></p>
                  <p>Profile data (name, email, phone, photo), preferences (interests, notification settings), booking records (ferry, lodging, rentals, food orders), and community contributions (posts, submissions).</p>
                  <p><strong className="text-foreground">How We Use Your Data</strong></p>
                  <p>To provide ferry schedules, bookings, local recommendations, and personalized notifications. We only send notifications related to your selected interests and chosen frequency.</p>
                  <p><strong className="text-foreground">Newsletter</strong></p>
                  <p>If you subscribe to our weekly newsletter, we'll send island updates by your preferred method (email, SMS, or push). You can unsubscribe at any time in Communication Preferences.</p>
                  <p><strong className="text-foreground">Data Sharing</strong></p>
                  <p>We do not sell your personal data. Booking information is shared with the relevant service providers (ferry operators, lodging partners, restaurants) solely to fulfill your reservations.</p>
                  <p><strong className="text-foreground">Your Rights</strong></p>
                  <p>You can download your data, manage preferences, or delete your account at any time from this Privacy page.</p>
                  <p><strong className="text-foreground">Contact</strong></p>
                  <p>For privacy questions or data requests, contact Base44 support.</p>
                </>
              ) : (
                <>
                  <p><strong className="text-foreground">Last updated: July 2026</strong></p>
                  <p>By using Bald Head Island SuperApp, you agree to these terms:</p>
                  <p><strong className="text-foreground">1. Acceptance of Terms</strong></p>
                  <p>By creating an account and using the app, you agree to these Terms of Service and our Privacy Policy.</p>
                  <p><strong className="text-foreground">2. User Conduct</strong></p>
                  <p>You agree to use the app respectfully. Community posts and submissions must be civil, accurate, and relevant. We reserve the right to remove content that violates our community guidelines.</p>
                  <p><strong className="text-foreground">3. Bookings & Payments</strong></p>
                  <p>Ferry, lodging, rental, and food bookings are subject to availability and the terms of the respective service providers. Cancellation and refund policies vary by provider.</p>
                  <p><strong className="text-foreground">4. Newsletter</strong></p>
                  <p>Newsletter subscription is optional. You can unsubscribe at any time. We are not liable for missed notifications if you have disabled notification methods.</p>
                  <p><strong className="text-foreground">5. Limitation of Liability</strong></p>
                  <p>The app is provided "as is" for informational and booking purposes. We are not liable for ferry delays, weather events, or third-party service issues.</p>
                  <p><strong className="text-foreground">6. Account Termination</strong></p>
                  <p>You may delete your account at any time. We may suspend accounts that violate these terms.</p>
                  <p><strong className="text-foreground">7. Changes</strong></p>
                  <p>We may update these terms periodically. Continued use after changes constitutes acceptance.</p>
                </>
              )}
            </div>
            <div className="sticky bottom-0 bg-card px-5 py-3 border-t border-border/50">
              <button
                onClick={() => setShowPolicy(null)}
                className="w-full h-11 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-4" onClick={() => setShowDelete(false)}>
          <div className="bg-card rounded-2xl w-full max-w-sm p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center mb-4">
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 text-destructive">
                <AlertTriangle className="w-7 h-7" strokeWidth={1.5} />
              </span>
            </div>
            <h3 className="font-heading text-lg text-foreground text-center">Delete Account?</h3>
            <p className="text-sm text-muted-foreground text-center mt-2 leading-relaxed">
              This will permanently remove your profile, preferences, and saved items. This action cannot be undone.
            </p>
            <div className="mt-5">
              <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}
                className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== 'DELETE' || deleting}
                className="flex-1 h-11 rounded-xl bg-destructive text-white text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-40"
              >
                {deleting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}