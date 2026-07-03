import { base44 } from '@/api/base44Client';

/**
 * Track a user action to build a proprietary behavioral dataset.
 * Each action is logged with the user's role snapshot for analytics.
 * Fire-and-forget — never blocks UI or throws on failure.
 *
 * @param {Object} params
 * @param {string} params.action_type - One of: page_view, recommendation_tap, search, save, booking, category_browse, profile_update, onboarding_complete, concierge_request, product_view
 * @param {string} [params.action_category] - Broad category e.g. dining, rentals
 * @param {string} [params.action_label] - Human-readable label
 * @param {string} [params.target_path] - Destination path/URL
 * @param {string} [params.entity_type] - Entity type if record-related
 * @param {string} [params.entity_id] - Entity record ID
 * @param {string} [params.search_query] - Search term
 * @param {string} [params.session_context] - Origin page e.g. my_island, dashboard
 * @param {Object} [params.metadata] - Extra context key-values
 */
export async function trackAction(params) {
  try {
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) return;

    const pref = await base44.entities.UserPreference.filter({ user_email: user.email }).catch(() => []);
    const userRole = pref?.[0]?.user_role || pref?.[0]?.visit_purpose || null;

    await base44.entities.UserActionLog.create({
      user_email: user.email,
      user_role: userRole,
      action_type: params.action_type,
      action_category: params.action_category || null,
      action_label: params.action_label || null,
      target_path: params.target_path || null,
      entity_type: params.entity_type || null,
      entity_id: params.entity_id || null,
      search_query: params.search_query || null,
      session_context: params.session_context || null,
      metadata: params.metadata || {},
    });
  } catch (e) {
    // Silent fail — tracking must never break UX
  }
}

/**
 * Fire-and-forget wrapper — call without await.
 */
export function trackActionAsync(params) {
  trackAction(params);
}