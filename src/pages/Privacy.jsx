import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Download, Trash2, ChevronRight, Shield, FileText, Mail, AlertTriangle, Loader2 } from 'lucide-react';

export default function Privacy() {
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const [downloading, setDownloading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

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
        await base44.entities.UserPreference.delete(p.id);
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

      {/* Legal */}
      <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 px-1">Legal</h3>
      <div className="bg-card border border-border/50 rounded-2xl mb-6">
        <div className="flex items-center gap-3 p-4 border-b border-border/50">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-sand text-navy flex-shrink-0">
            <Shield className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Privacy Policy</p>
            <p className="text-xs text-muted-foreground mt-0.5">How we collect and use your data</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-sand text-navy flex-shrink-0">
            <FileText className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Terms of Service</p>
            <p className="text-xs text-muted-foreground mt-0.5">The rules for using BHI SuperApp</p>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed px-4">
        Bald Head Island SuperApp is committed to protecting your privacy. Contact Base44 support for any data-related requests.
      </p>

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