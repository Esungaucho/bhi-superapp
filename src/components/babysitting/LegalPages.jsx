import React, { useState } from 'react';
import { ShieldCheck, ChevronRight } from 'lucide-react';
import { MARKETPLACE_DISCLAIMER, CANCELLATION_POLICY } from '@/lib/babysittingConstants';

const LEGAL_SECTIONS = [
  {
    title: 'Babysitting Terms of Service',
    body: `By using the Bald Head Island Concierge Babysitting marketplace, you agree to these terms. This platform connects families with independent childcare providers. The app does not employ, supervise, or control sitters. Families are solely responsible for selecting, vetting, and supervising the childcare relationship. All bookings, payments, and interactions are subject to these terms.`,
  },
  {
    title: 'Parent Liability Waiver',
    body: `I understand that childcare involves inherent risks. I assume full responsibility for my child(ren)'s safety and well-being during any booking arranged through this platform. I acknowledge that the app is a marketplace and does not guarantee the qualifications, background, or performance of any sitter. I agree to vet sitters, check references, and make informed decisions. I release the app, its operators, and affiliates from any liability arising from childcare arrangements.`,
  },
  {
    title: 'Sitter Agreement',
    body: `As an independent childcare provider, I agree to provide safe, responsible care. I will not engage in any activity that endangers children. I consent to share my verified contact and safety information with a family only after I accept a confirmed booking. I understand that my private verification documents (government ID, driver's license, background check) will not be shown publicly. I agree to follow all safety guidelines, water safety policies, and golf cart transportation policies.`,
  },
  {
    title: 'Safety Guidelines',
    body: `All participants must follow these safety guidelines: (1) Never leave children unattended near water. (2) Use life jackets for all water activities involving young children. (3) Always buckle seatbelts before operating a golf cart with children. (4) Follow all parent instructions regarding activities, food, and bedtime. (5) Complete required safety check-ins when applicable. (6) Contact emergency services (911) for any life-threatening situation, then notify the family and app administrators.`,
  },
  {
    title: 'Water Safety Policy',
    body: `Water activities are only permitted when the parent has explicitly granted beach/pool permission. Sitters must: (1) Ensure children wear properly fitted life jackets when near or in water. (2) Maintain constant visual supervision of children near water. (3) Complete a water safety check-in with photo confirmation before entering water areas. (4) Never allow rough play near water. (5) Exit the water immediately if conditions change (weather, currents, marine life). If water permission is not granted, no water activities are permitted under any circumstances.`,
  },
  {
    title: 'Golf Cart Transportation Policy',
    body: `Golf cart transportation is only permitted when the parent has explicitly granted golf cart permission. Sitters must: (1) Ensure all children are properly buckled with seatbelts before the cart moves. (2) Complete a start-of-trip photo check-in confirming children are buckled. (3) Obey all island speed limits and traffic rules. (4) Never operate a golf cart under the influence of alcohol or drugs. (5) Complete an end-of-trip check-in. If golf cart permission is not granted, children must not be transported by golf cart under any circumstances.`,
  },
  {
    title: 'Cancellation Policy',
    body: CANCELLATION_POLICY.text,
  },
  {
    title: 'Emergency Protocol',
    body: `In case of emergency: (1) Call 911 immediately for any life-threatening situation. (2) Contact the parent using the emergency contact information provided in the booking. (3) Contact BHI Public Safety at (910) 457-5252 if on Bald Head Island. (4) Report the incident to app administrators through the messaging system or safety report feature. (5) Document the incident with photos if safe to do so. All serious safety concerns are escalated to admin review.`,
  },
];

export default function LegalPages({ initialSection }) {
  const [openSection, setOpenSection] = React.useState(initialSection || null);

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-navy" strokeWidth={1.5} />
        <h2 className="font-heading text-lg text-foreground">Legal & Safety</h2>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-xs text-amber-800 leading-relaxed">{MARKETPLACE_DISCLAIMER}</p>
      </div>

      <div className="space-y-2">
        {LEGAL_SECTIONS.map((section) => (
          <div key={section.title} className="bg-card border border-border/50 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenSection(openSection === section.title ? null : section.title)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-sand/40 transition-colors"
            >
              <span className="text-sm font-medium text-foreground">{section.title}</span>
              <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${openSection === section.title ? 'rotate-90' : ''}`} strokeWidth={1.5} />
            </button>
            {openSection === section.title && (
              <p className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">{section.body}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}