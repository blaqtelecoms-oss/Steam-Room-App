import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Admin-only: marks one or more bookings as paid to the trainer.
// Accepts either booking_id (single) or booking_ids (array).
// Sets trainer_paid=true and records the payment date.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const bookingIds = body?.booking_ids || (body?.booking_id ? [body.booking_id] : []);
    if (!bookingIds.length) return Response.json({ error: 'booking_id or booking_ids required' }, { status: 400 });

    const today = new Date().toISOString().slice(0, 10);
    const updates = bookingIds.map((id) => ({
      id,
      trainer_paid: true,
      trainer_paid_date: today,
    }));

    const result = await base44.asServiceRole.entities.Booking.bulkUpdate(updates);
    return Response.json({ updated: bookingIds.length, date: today });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}