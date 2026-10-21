import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const uEmail = (user.email || '').trim().toLowerCase();
    if (!uEmail) return Response.json({ error: 'No email on your account' }, { status: 400 });

    const members = await base44.asServiceRole.entities.Member.filter({ status: 'active' }, '-created_date', 500);
    const member = members.find((m) => (m.email || '').trim().toLowerCase() === uEmail);
    if (!member) return Response.json({ error: 'No active member found for your email. Contact the gym.' }, { status: 404 });
    if (!member.card_id) return Response.json({ error: 'Your SR number has not been assigned yet. Contact the gym.' }, { status: 400 });

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: 'Your SR FITS SR Number',
      body: `Hi ${member.full_name || ''},\n\nYour SR number (membership number) is: ${member.card_id}\n\nUse it to access your member portal.\n\nSteam Room Fitness Center`,
    });

    return Response.json({ sent: true, email: user.email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}