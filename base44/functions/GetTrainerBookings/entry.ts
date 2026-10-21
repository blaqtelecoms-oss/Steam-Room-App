import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Public endpoint: trainers (who may not have app accounts) select their profile
// and view their bookings. Reads via service role since the caller is unauthenticated.
// Admin mode: trainer_id "admin" returns ALL bookings across every trainer.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const trainerId = body?.trainer_id;
    if (!trainerId) return Response.json({ error: 'trainer_id required' }, { status: 400 });

    let bookings;
    if (trainerId === 'admin') {
      bookings = await base44.asServiceRole.entities.Booking.filter({}, '-date', 500);
    } else {
      bookings = await base44.asServiceRole.entities.Booking.filter({ trainer_id: trainerId }, 'date', 200);
    }
    return Response.json({ bookings });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}