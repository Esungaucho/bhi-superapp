import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
  AlertTriangle, Ban, Flag, MessageSquareOff, ShieldAlert, UserX
} from 'lucide-react';

const REASONS = [
  { id: 'harassment_bullying', label: 'Harassment or Bullying', icon: UserX },
  { id: 'hate_speech', label: 'Hate Speech', icon: Ban },
  { id: 'inappropriate_photo', label: 'Inappropriate Photo', icon: AlertTriangle },
  { id: 'spam_scam', label: 'Spam or Scam', icon: ShieldAlert },
  { id: 'misinformation', label: 'Misinformation', icon: Flag },
  { id: 'unsafe_behavior', label: 'Unsafe Behavior', icon: AlertTriangle },
  { id: 'offensive_language', label: 'Offensive Language', icon: MessageSquareOff },
  { id: 'other', label: 'Other', icon: Flag },
];

export default function ReportModal({
  open,
  onClose,
  onSubmit,
  reportedUserName,
  contentType = 'post',
}) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      await onSubmit({ reason, reason_details: details.trim() });
      setReason('');
      setDetails('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const typeLabel = contentType === 'comment' ? 'comment' : contentType === 'profile' ? 'profile' : 'post';

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-navy-deep/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-sm w-full max-h-[85vh] overflow-y-auto animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-border/40">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-secondary/60 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <Flag className="w-5 h-5 text-destructive" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-heading text-lg text-foreground">Report {typeLabel}</h2>
              <p className="text-xs text-muted-foreground">Help keep our island community positive</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {reportedUserName && (
            <p className="text-xs text-muted-foreground">
              Reporting content by <span className="font-semibold text-foreground">{reportedUserName}</span>
            </p>
          )}

          <div className="space-y-2">
            {REASONS.map(r => {
              const Icon = r.icon;
              const selected = reason === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setReason(r.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-colors ${
                    selected ? 'bg-accent/10 border-accent text-foreground' : 'bg-card border-border text-muted-foreground hover:bg-sand/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${selected ? 'text-accent' : ''}`} strokeWidth={1.5} />
                  <span className="text-sm font-medium">{r.label}</span>
                </button>
              );
            })}
          </div>

          <div>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Optional: add more context about the issue..."
              rows={2}
              className="w-full bg-secondary/50 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-secondary text-secondary-foreground rounded-full py-3 text-sm font-semibold hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || submitting}
            className="flex-1 bg-destructive text-destructive-foreground rounded-full py-3 text-sm font-semibold disabled:opacity-40 transition-opacity"
          >
            {submitting ? 'Sending...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}