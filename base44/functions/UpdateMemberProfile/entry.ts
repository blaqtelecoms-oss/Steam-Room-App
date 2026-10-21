import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Updates a member's editable profile fields (full_name, phone, email).
// Uses service role so SR-number-gated members can update their own records.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { member_id, full_name, phone, email } = body || {};
    if (!member_id) return Response.json({ error: 'member_id required' }, { status: 400 });

    const updated = await base44.asServiceRole.entities.Member.update(member_id, {
      full_name,
      phone,
      email,
    });

    return Response.json({ member: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}