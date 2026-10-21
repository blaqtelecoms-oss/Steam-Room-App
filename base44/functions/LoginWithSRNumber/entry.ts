import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const norm = (s) => (s || '').trim().toLowerCase().replace(/[\s-]/g, '');

// SR-number gated entry: the SR number IS the credential. Members don't have
// Base44 accounts — they were admin-created — so we use the service role to
// look up the member by card_id and return it. No auth.me() required.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const sr = norm(body?.srNumber);
    if (!sr) return Response.json({ error: 'Enter your SR number' }, { status: 400 });

    // Service-role lookup: members were admin-created, so RLS by created_by_id won't match.
    const members = await base44.asServiceRole.entities.Member.filter({ status: 'active' }, '-created_date', 500);
    const member = members.find((m) => norm(m.card_id) === sr);
    if (!member) return Response.json({ error: 'No active member found with that SR number' }, { status: 404 });

    return Response.json({ member });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}