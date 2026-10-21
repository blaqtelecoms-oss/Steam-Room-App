import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Creates a PT booking for an SR-number-gated member using the service role.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const booking = await base44.asServiceRole.entities.Booking.create(body);
    return Response.json({ booking });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}