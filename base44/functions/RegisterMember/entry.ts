import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Registers a new member and their debit-mandate details in one call.
// Uses the service role so unauthenticated (SR-number-gated) visitors can
// self-register from the portal gate's "Register here" link.
const keepStrings = ["country", "id_type", "account_holder_type", "account_type", "mandate_type", "instalment_occurrence", "frequency", "debit_day"];

function buildMandatePayload(form) {
  const payload = { ...form };
  Object.keys(payload).forEach((k) => {
    if (payload[k] === "" && !keepStrings.includes(k)) payload[k] = null;
  });
  return payload;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    if (!body?.full_name) return Response.json({ error: 'Full name is required' }, { status: 400 });

    const cardId = `SR-${Date.now().toString(36).toUpperCase()}`;
    const member = await base44.asServiceRole.entities.Member.create({
      full_name: body.full_name,
      date_joined: body.date_joined || new Date().toISOString().slice(0, 10),
      membership_tier: body.membership_tier || 'Pro',
      phone: body.cell_number || null,
      email: body.email_address || null,
      id_type: body.id_type || 'RSA ID',
      id_number: body.id_number || null,
      card_id: cardId,
      status: 'active',
    });

    // Save mandate details (best-effort — admin can edit later).
    try {
      await base44.asServiceRole.entities.Mandate.create({
        ...buildMandatePayload(body),
        member_id: member.id,
      });
    } catch { /* mandate is secondary to activation */ }

    return Response.json({ member });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}