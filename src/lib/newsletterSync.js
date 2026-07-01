import { base44 } from '@/api/base44Client';

/**
 * Syncs newsletter subscription data to the NewsletterSubscription entity.
 * Called during onboarding completion and CommunicationSettings save.
 */
export async function syncNewsletterSubscription(user, prefs) {
  const existing = await base44.entities.NewsletterSubscription.filter({ user_email: user.email });
  const subData = {
    user_id: user.id,
    user_email: user.email,
    name: prefs.user_name || user.full_name || '',
    phone_number: user.phone || '',
    is_subscribed_to_newsletter: prefs.newsletter_subscribed ?? false,
    notif_email: prefs.comm_email ?? true,
    notif_sms: prefs.comm_sms ?? false,
    notif_push: prefs.comm_push ?? true,
    interests: prefs.interests || [],
    frequency: prefs.notification_frequency === 'daily_summary' ? 'daily_digest'
      : prefs.notification_frequency === 'weekly_summary' ? 'weekly_newsletter'
      : prefs.notification_frequency === 'emergency_only' ? 'immediate'
      : 'immediate',
    unsubscribed_at: prefs.newsletter_subscribed ? null : (existing[0]?.unsubscribed_at || new Date().toISOString()),
  };

  if (existing.length > 0) {
    return base44.entities.NewsletterSubscription.update(existing[0].id, subData);
  }
  return base44.entities.NewsletterSubscription.create(subData);
}