import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Updates booking statuses for trainer-managed bookings using the service role.
// Admin mode: trainer_id "admin" bypasses the trainer-ownership check.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { booking_id, status, trainer_id } = body;

    if (!booking_id) return Response.json({ error: 'booking_id required' }, { status: 400 });
    const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!allowed.includes(status)) return Response.json({ error: 'Invalid status' }, { status: 400 });

    const booking = await base44.asServiceRole.entities.Booking.get(booking_id).catch(() => null);
    if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 });

    // Admin bypasses trainer authorization
    if (trainer_id !== 'admin' && booking.trainer_id !== trainer_id) {
      return Response.json({ error: 'Not authorized for this booking' }, { status: 403 });
    }

    const updated = await base44.asServiceRole.entities.Booking.update(booking_id, { status });
    return Response.json({ booking: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}