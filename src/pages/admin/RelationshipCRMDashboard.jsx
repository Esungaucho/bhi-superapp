import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, X, Loader2, Search, Users, Calendar, Gift, Mail, Phone } from 'lucide-react';
import { RELATIONSHIP_STRENGTH } from '@/lib/marketplaceConstants';

export default function RelationshipCRMDashboard() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['crmContacts'],
    queryFn: () => base44.entities.RelationshipCRM.list('-next_follow_up', 200),
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  return (
    <div className="p-4 pb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-lg text-foreground">Relationship CRM</h2>
          <p className="text-xs text-muted-foreground">Private — admin only</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium">
          <Plus className="w-4 h-4" strokeWidth={1.5} /> Add
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" strokeWidth={1.5} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search contacts..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-accent"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-30" strokeWidth={1} />
          <p className="text-sm">No contacts yet</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(c => {
            const strength = RELATIONSHIP_STRENGTH[c.relationship_strength] || RELATIONSHIP_STRENGTH.new;
            return (
              <div key={c.id} className="bg-card border border-border/50 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{c.name}</p>
                    {c.company && <p className="text-[11px] text-muted-foreground">{c.company}{c.position ? ` · ${c.position}` : ''}</p>}
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${strength.className}`}>{strength.label}</span>
                </div>

                <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-muted-foreground">
                  {c.email && <span className="flex items-center gap-0.5"><Mail className="w-2.5 h-2.5" /> {c.email}</span>}
                  {c.phone && <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" /> {c.phone}</span>}
                  {c.favorite_restaurant && <span>Favorite: {c.favorite_restaurant}</span>}
                </div>

                {c.next_follow_up && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <Calendar className="w-3 h-3 text-amber-600" strokeWidth={1.5} />
                    <p className="text-[10px] text-amber-600">Follow up: {new Date(c.next_follow_up).toLocaleDateString()}</p>
                  </div>
                )}

                {(c.holiday_card_sent || c.gift_sent) && (
                  <div className="flex gap-1.5 mt-1.5">
                    {c.holiday_card_sent && <span className="text-[9px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded">Holiday Card Sent</span>}
                    {c.gift_sent && <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded"><Gift className="w-2.5 h-2.5" /> Gift Sent</span>}
                  </div>
                )}

                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/30">
                  <button onClick={() => { setEditing(c); setShowForm(true); }} className="text-[11px] font-medium text-accent px-2 py-1">Edit</button>
                  <button
                    onClick={async () => { await base44.entities.RelationshipCRM.delete(c.id); queryClient.invalidateQueries(['crmContacts']); }}
                    className="ml-auto p-1 rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <ContactForm contact={editing} onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); queryClient.invalidateQueries(['crmContacts']); }} />}
    </div>
  );
}

function ContactForm({ contact, onClose, onSave }) {
  const [form, setForm] = useState({
    name: contact?.name || '',
    company: contact?.company || '',
    position: contact?.position || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    birthday: contact?.birthday || '',
    anniversary: contact?.anniversary || '',
    spouse_partner: contact?.spouse_partner || '',
    children_names: contact?.children_names || '',
    pet_names: contact?.pet_names || '',
    favorite_restaurant: contact?.favorite_restaurant || '',
    interests: contact?.interests || [],
    meeting_notes: contact?.meeting_notes || '',
    next_follow_up: contact?.next_follow_up || '',
    holiday_card_sent: contact?.holiday_card_sent || false,
    gift_sent: contact?.gift_sent || false,
    referral_history: contact?.referral_history || '',
    relationship_strength: contact?.relationship_strength || 'new',
  });
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (contact?.id) {
        await base44.entities.RelationshipCRM.update(contact.id, form);
      } else {
        await base44.entities.RelationshipCRM.create(form);
      }
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-md p-5 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-base">{contact ? 'Edit Contact' : 'New Contact'}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <F label="Name"><input value={form.name} onChange={e => set('name', e.target.value)} className={inp} /></F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Company"><input value={form.company} onChange={e => set('company', e.target.value)} className={inp} /></F>
            <F label="Position"><input value={form.position} onChange={e => set('position', e.target.value)} className={inp} /></F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Email"><input value={form.email} onChange={e => set('email', e.target.value)} className={inp} /></F>
            <F label="Phone"><input value={form.phone} onChange={e => set('phone', e.target.value)} className={inp} /></F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Birthday"><input type="date" value={form.birthday} onChange={e => set('birthday', e.target.value)} className={inp} /></F>
            <F label="Anniversary"><input type="date" value={form.anniversary} onChange={e => set('anniversary', e.target.value)} className={inp} /></F>
          </div>
          <F label="Spouse / Partner"><input value={form.spouse_partner} onChange={e => set('spouse_partner', e.target.value)} className={inp} /></F>
          <F label="Children's Names"><input value={form.children_names} onChange={e => set('children_names', e.target.value)} className={inp} /></F>
          <F label="Pet Names"><input value={form.pet_names} onChange={e => set('pet_names', e.target.value)} className={inp} /></F>
          <F label="Favorite Restaurant"><input value={form.favorite_restaurant} onChange={e => set('favorite_restaurant', e.target.value)} className={inp} /></F>
          <F label="Relationship Strength">
            <select value={form.relationship_strength} onChange={e => set('relationship_strength', e.target.value)} className={inp}>
              {Object.entries(RELATIONSHIP_STRENGTH).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </F>
          <F label="Meeting Notes"><textarea value={form.meeting_notes} onChange={e => set('meeting_notes', e.target.value)} rows={3} className={inp} /></F>
          <F label="Referral History"><textarea value={form.referral_history} onChange={e => set('referral_history', e.target.value)} rows={2} className={inp} /></F>
          <F label="Next Follow Up"><input type="date" value={form.next_follow_up?.split('T')[0]} onChange={e => set('next_follow_up', e.target.value)} className={inp} /></F>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.holiday_card_sent} onChange={e => set('holiday_card_sent', e.target.checked)} /> Holiday Card Sent</label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.gift_sent} onChange={e => set('gift_sent', e.target.checked)} /> Gift Sent</label>
          </div>
          <button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium mt-2 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Contact'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inp = 'w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-accent';
function F({ label, children }) {
  return <div><label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block">{label}</label>{children}</div>;
}