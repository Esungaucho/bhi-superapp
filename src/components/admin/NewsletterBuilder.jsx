import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Loader2, Send, Check, ChevronRight, ShoppingBag, Plus } from 'lucide-react';
import { COLLECTIONS, NEWSLETTER_SECTIONS, SHOP_CONTENT_TYPES, getCollection } from '@/lib/islandShopConstants';

export default function NewsletterBuilder({ subscribers, onClose }) {
  const [subject, setSubject] = useState('');
  const [enabledSections, setEnabledSections] = useState({
    this_week: true,
    upcoming_events: true,
    ferry_weather: true,
    restaurant_highlights: false,
    wildlife_turtle: false,
    featured_experience: false,
    island_shop_picks: true,
  });
  const [sectionContent, setSectionContent] = useState({});
  const [shopContentType, setShopContentType] = useState('featured_products');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['islandShopProducts'],
    queryFn: () => base44.entities.IslandShopProduct.list('-created_date', 200),
  });

  const newsletterProducts = useMemo(() => {
    const picks = selectedProducts.map(id => products.find(p => p.id === id)).filter(Boolean);
    if (picks.length > 0) return picks;
    return products.filter(p => p.is_featured_in_newsletter);
  }, [products, selectedProducts]);

  const emailSubs = useMemo(() => subscribers.filter(s => s.notif_email && s.is_subscribed_to_newsletter && !s.unsubscribed_at), [subscribers]);

  const toggleSection = (id) => {
    setEnabledSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setSectionText = (id, text) => {
    setSectionContent(prev => ({ ...prev, [id]: text }));
  };

  const toggleProduct = (id) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const generateBody = () => {
    let body = `<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2B2B2B;">\n`;
    body += `<h1 style="font-size: 24px; color: #3F6D80; margin-bottom: 20px;">${subject || 'Bald Head Island Newsletter'}</h1>\n`;

    if (enabledSections.this_week && sectionContent.this_week) {
      body += `<h2 style="font-size: 18px; color: #3F6D80; border-bottom: 1px solid #E8E2D9; padding-bottom: 6px;">This Week on the Island</h2>\n<p>${sectionContent.this_week}</p>\n`;
    }
    if (enabledSections.upcoming_events && sectionContent.upcoming_events) {
      body += `<h2 style="font-size: 18px; color: #3F6D80; border-bottom: 1px solid #E8E2D9; padding-bottom: 6px;">Upcoming Events</h2>\n<p>${sectionContent.upcoming_events}</p>\n`;
    }
    if (enabledSections.ferry_weather && sectionContent.ferry_weather) {
      body += `<h2 style="font-size: 18px; color: #3F6D80; border-bottom: 1px solid #E8E2D9; padding-bottom: 6px;">Ferry & Weather Updates</h2>\n<p>${sectionContent.ferry_weather}</p>\n`;
    }
    if (enabledSections.restaurant_highlights && sectionContent.restaurant_highlights) {
      body += `<h2 style="font-size: 18px; color: #3F6D80; border-bottom: 1px solid #E8E2D9; padding-bottom: 6px;">Restaurant Highlights</h2>\n<p>${sectionContent.restaurant_highlights}</p>\n`;
    }
    if (enabledSections.wildlife_turtle && sectionContent.wildlife_turtle) {
      body += `<h2 style="font-size: 18px; color: #3F6D80; border-bottom: 1px solid #E8E2D9; padding-bottom: 6px;">Wildlife & Turtle Season</h2>\n<p>${sectionContent.wildlife_turtle}</p>\n`;
    }
    if (enabledSections.featured_experience && sectionContent.featured_experience) {
      body += `<h2 style="font-size: 18px; color: #3F6D80; border-bottom: 1px solid #E8E2D9; padding-bottom: 6px;">Featured Experience</h2>\n<p>${sectionContent.featured_experience}</p>\n`;
    }

    if (enabledSections.island_shop_picks && newsletterProducts.length > 0) {
      const contentTypeLabel = SHOP_CONTENT_TYPES.find(t => t.id === shopContentType)?.label || 'Featured Products';
      body += `<h2 style="font-size: 18px; color: #3F6D80; border-bottom: 1px solid #E8E2D9; padding-bottom: 6px;">Island Shop Picks — ${contentTypeLabel}</h2>\n`;
      if (sectionContent.island_shop_picks) {
        body += `<p>${sectionContent.island_shop_picks}</p>\n`;
      }
      body += `<div style="display: flex; flex-wrap: wrap; gap: 16px; margin-top: 16px;">\n`;
      newsletterProducts.forEach(p => {
        body += `<div style="width: 45%; text-align: center;">\n`;
        if (p.image_url) body += `<img src="${p.image_url}" alt="${p.name}" style="width: 100%; border-radius: 8px; margin-bottom: 8px;" />\n`;
        body += `<p style="font-weight: 600; font-size: 14px;">${p.name}</p>\n`;
        if (p.retailer_name) body += `<p style="font-size: 12px; color: #7B7B7B;">${p.retailer_name}</p>\n`;
        if (p.price_range) body += `<p style="font-size: 13px; color: #3F6D80;">${p.price_range}</p>\n`;
        body += `<a href="${p.affiliate_link}" style="display: inline-block; margin-top: 8px; padding: 6px 16px; background: #3F6D80; color: #FAF8F5; border-radius: 20px; text-decoration: none; font-size: 12px;">Shop Now</a>\n`;
        body += `</div>\n`;
      });
      body += `</div>\n`;
      body += `<p style="font-size: 10px; color: #7B7B7B; margin-top: 12px;">Some links may be affiliate links. We may earn a small commission at no additional cost to you.</p>\n`;
    }

    body += `</div>`;
    return body;
  };

  const handleSend = async () => {
    if (!subject.trim()) return;
    setSending(true);
    try {
      const body = generateBody();
      for (const r of emailSubs) {
        await base44.integrations.Core.SendEmail({ to: r.user_email, subject, body });
      }
      setSent(true);
      setTimeout(() => { setSent(false); onClose(); }, 2000);
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-4">
      <div className="bg-card rounded-2xl w-full max-w-lg p-5 animate-fade-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading text-lg text-foreground">Newsletter Builder</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Will be sent to <strong>{emailSubs.length}</strong> email subscribers.
        </p>

        {/* Subject */}
        <div className="mb-4">
          <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="This Week on Bald Head Island"
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        {/* Section Toggles */}
        <div className="mb-4">
          <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 block">Newsletter Sections</label>
          <div className="space-y-1">
            {NEWSLETTER_SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-sand/30 transition-colors text-left"
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${enabledSections[section.id] ? 'border-accent bg-accent' : 'border-border'}`}>
                  {enabledSections[section.id] && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                <span className="text-sm text-foreground">{section.label}</span>
                {enabledSections[section.id] && <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* Section Content Fields */}
        <div className="space-y-3 mb-4">
          {NEWSLETTER_SECTIONS.filter(s => enabledSections[s.id]).map(section => (
            <div key={section.id}>
              <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block">{section.label}</label>
              {section.id === 'island_shop_picks' ? (
                <>
                  <select
                    value={shopContentType}
                    onChange={e => setShopContentType(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-accent mb-2"
                  >
                    {SHOP_CONTENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                  <textarea
                    value={sectionContent.island_shop_picks || ''}
                    onChange={e => setSectionText('island_shop_picks', e.target.value)}
                    placeholder="Intro text for shopping picks (optional)…"
                    rows={2}
                    className="w-full p-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-accent resize-none mb-2"
                  />
                  {/* Product Picker */}
                  <div className="border border-border rounded-xl p-2 max-h-40 overflow-y-auto space-y-1">
                    {products.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-3">No products available.</p>
                    ) : products.map(p => (
                      <button
                        key={p.id}
                        onClick={() => toggleProduct(p.id)}
                        className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-sand/30 transition-colors text-left"
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${selectedProducts.includes(p.id) ? 'border-accent bg-accent' : 'border-border'}`}>
                          {selectedProducts.includes(p.id) && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </div>
                        <div className="w-8 h-8 rounded bg-sand/40 overflow-hidden flex-shrink-0">
                          {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <span className="text-xs text-foreground truncate flex-1">{p.name}</span>
                        {p.price_range && <span className="text-[10px] text-muted-foreground">{p.price_range}</span>}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {selectedProducts.length > 0 ? `${selectedProducts.length} product${selectedProducts.length !== 1 ? 's' : ''} selected` : 'Showing newsletter-featured products by default'}
                  </p>
                </>
              ) : (
                <textarea
                  value={sectionContent[section.id] || ''}
                  onChange={e => setSectionText(section.id, e.target.value)}
                  placeholder={`Write content for "${section.label}"…`}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-accent resize-none"
                />
              )}
            </div>
          ))}
        </div>

        {/* Send */}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!subject.trim() || sending || sent}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-40"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : sent ? <><Check className="w-4 h-4" /> Sent!</> : <><Send className="w-4 h-4" /> Send to {emailSubs.length}</>}
          </button>
        </div>
      </div>
    </div>
  );
}