import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Creates or updates an agreement for an SR-number-gated member.
// If `id` is provided, updates the existing record; otherwise creates a new one.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { id, member_id, type, agreed, signature, signed_date, answers } = body || {};
    if (!member_id || !type) return Response.json({ error: 'member_id and type required' }, { status: 400 });

    const payload = {
      member_id,
      type,
      agreed,
      signature,
      signed_date,
      answers: answers || null,
    };

    let agreement;
    if (id) {
      agreement = await base44.asServiceRole.entities.Agreement.update(id, payload);
    } else {
      agreement = await base44.asServiceRole.entities.Agreement.create(payload);
    }

    return Response.json({ agreement });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}