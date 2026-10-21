import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Creates a progress (check-in) record for an SR-number-gated member.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { member_id, date, weight, notes } = body || {};
    if (!member_id || !date) return Response.json({ error: 'member_id and date required' }, { status: 400 });

    const progress = await base44.asServiceRole.entities.Progress.create({
      member_id,
      date,
      weight: weight != null ? Number(weight) : null,
      notes: notes || null,
    });

    return Response.json({ progress });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}