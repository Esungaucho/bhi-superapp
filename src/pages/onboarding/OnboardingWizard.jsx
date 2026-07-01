import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { syncNewsletterSubscription } from '@/lib/newsletterSync';
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import StepVisitPurpose from './StepVisitPurpose';
import StepProfile from './StepProfile';
import StepInterests from './StepInterests';
import StepCommunications from './StepCommunications';
import StepNotifications from './StepNotifications';

const STEPS = [
  { id: 'visit_purpose', title: 'Welcome', subtitle: 'Why are you visiting Bald Head Island?' },
  { id: 'profile', title: 'Your Profile', subtitle: 'Let\'s get to know you' },
  { id: 'interests', title: 'Your Interests', subtitle: 'What are you into?' },
  { id: 'communications', title: 'Stay Connected', subtitle: 'How would you like to hear from us?' },
  { id: 'notifications', title: 'Notification Style', subtitle: 'When should we reach out?' },
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [visitPurpose, setVisitPurpose] = useState('');
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    tier: '',
    phone: '',
    avatar: '',
  });
  const [interests, setInterests] = useState([]);
  const [communications, setCommunications] = useState({
    comm_push: true,
    comm_email: true,
    comm_sms: false,
    newsletter_subscribed: false,
  });
  const [notifications, setNotifications] = useState({
    notification_frequency: 'immediate',
    dnd_enabled: false,
    dnd_start: '22:00',
    dnd_end: '07:00',
  });

  const isStepValid = () => {
    if (step === 0) return !!visitPurpose;
    if (step === 1) return profile.first_name.trim() && profile.last_name.trim() && profile.tier;
    if (step === 2) return interests.length > 0;
    if (step === 3) return communications.comm_push || communications.comm_email || communications.comm_sms;
    return true;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const { data: user } = await base44.auth.me();
      await base44.auth.updateMe({
        first_name: profile.first_name.trim(),
        last_name: profile.last_name.trim(),
        tier: profile.tier,
        phone: profile.phone.trim(),
        avatar: profile.avatar,
        onboarding_complete: true,
      });

      const existing = await base44.entities.UserPreference.filter({ user_email: user.email });
      const prefData = {
        user_email: user.email,
        user_name: `${profile.first_name} ${profile.last_name}`.trim(),
        visit_purpose: visitPurpose,
        interests,
        comm_push: communications.comm_push,
        comm_email: communications.comm_email,
        comm_sms: communications.comm_sms,
        newsletter_subscribed: communications.newsletter_subscribed,
        notification_frequency: notifications.notification_frequency,
        dnd_enabled: notifications.dnd_enabled,
        dnd_start: notifications.dnd_start,
        dnd_end: notifications.dnd_end,
        onboarding_completed: true,
      };

      if (existing.length > 0) {
        await base44.entities.UserPreference.update(existing[0].id, prefData);
      } else {
        await base44.entities.UserPreference.create(prefData);
      }

      await syncNewsletterSubscription(user, prefData);

      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const currentStep = STEPS[step];

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen">
        {/* Progress bar */}
        <div className="px-5 pt-6 pb-2">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                  i <= step ? 'bg-accent' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-32">
          <div key={step} className="animate-fade-in">
            <h1 className="font-heading text-2xl text-foreground">{currentStep.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{currentStep.subtitle}</p>

            <div className="mt-6">
              {step === 0 && <StepVisitPurpose visitPurpose={visitPurpose} setVisitPurpose={setVisitPurpose} />}
              {step === 1 && <StepProfile profile={profile} setProfile={setProfile} />}
              {step === 2 && <StepInterests interests={interests} setInterests={setInterests} />}
              {step === 3 && <StepCommunications communications={communications} setCommunications={setCommunications} />}
              {step === 4 && <StepNotifications notifications={notifications} setNotifications={setNotifications} />}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background/90 backdrop-blur-md border-t border-border/50 px-5 py-4 z-50">
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center justify-center w-12 h-12 rounded-xl border border-border text-foreground hover:bg-secondary transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!isStepValid() || saving}
              className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : step === STEPS.length - 1 ? (
                'Enter Bald Head Island'
              ) : (
                <>
                  Continue <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}