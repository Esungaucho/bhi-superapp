import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ALLOWED_ENTITIES = [
  'Babysitter', 'BabysitterBooking', 'BabysitterReview', 'BabysitterPrivateInfo',
  'EventPlan', 'EventVendor', 'EventQuoteRequest', 'EventConciergeRequest',
  'PreferredPartner', 'PartnerReferralEvent', 'WeddingInquiry', 'PartnerReview',
  'Restaurant', 'Shop', 'RentalProperty', 'BuilderHomeService', 'CommunityPartner',
  'RealEstateAgent', 'ConciergeProvider', 'ConciergeRequest', 'TurtleNest',
  'Sponsorship', 'RelationshipCRM', 'ReferralInquiry', 'IslandShopProduct',
  'CommunitySubmission', 'CommunityPost', 'CommunityComment',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });

    const body = await req.json();
    const { entity, operation, id, data, query, sort, limit } = body;

    if (!ALLOWED_ENTITIES.includes(entity)) {
      return Response.json({ error: `Entity '${entity}' not permitted` }, { status: 400 });
    }

    const collection = base44.asServiceRole.entities[entity];
    if (!collection) return Response.json({ error: `Entity '${entity}' not found` }, { status: 400 });

    let result;
    switch (operation) {
      case 'list':
        result = await collection.list(sort, limit || 100);
        break;
      case 'filter':
        result = await collection.filter(query || {}, sort, limit || 100);
        break;
      case 'get':
        result = await collection.get(id);
        break;
      case 'create':
        result = await collection.create(data);
        break;
      case 'update':
        result = await collection.update(id, data);
        break;
      case 'delete':
        result = await collection.delete(id);
        break;
      case 'bulkCreate':
        result = await collection.bulkCreate(data);
        break;
      default:
        return Response.json({ error: `Invalid operation '${operation}'` }, { status: 400 });
    }

    return Response.json(result);
  } catch (error) {
    console.error('admin-ops error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});