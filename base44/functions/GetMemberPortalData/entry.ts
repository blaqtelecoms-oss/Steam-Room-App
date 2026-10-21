import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Returns ALL portal data for a member in one call — payments, agreements,
// programs, progress, trainers, and bookings — using the service role so it
// works for unauthenticated (SR-number-gated) members.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const memberId = body?.member_id;
    if (!memberId) return Response.json({ error: 'member_id required' }, { status: 400 });

    const member = await base44.asServiceRole.entities.Member.get(memberId);
    if (!member) return Response.json({ error: 'Member not found' }, { status: 404 });

    const [payments, agreements, programs, progress, trainers, bookings] = await Promise.all([
      base44.asServiceRole.entities.Payment.filter({ member_id: memberId }, '-date', 200),
      base44.asServiceRole.entities.Agreement.filter({ member_id: memberId }, '-signed_date', 50),
      base44.asServiceRole.entities.Program.filter({}, '-created_date', 50),
      base44.asServiceRole.entities.Progress.filter({ member_id: memberId }, '-date', 100),
      base44.asServiceRole.entities.Trainer.filter({ active: true }, 'order', 100),
      base44.asServiceRole.entities.Booking.filter({ member_id: memberId }, '-date', 50),
    ]);

    return Response.json({
      payments: payments || [],
      agreements: agreements || [],
      programs: programs || [],
      progress: progress || [],
      trainers: trainers || [],
      bookings: bookings || [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}