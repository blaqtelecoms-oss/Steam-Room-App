import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const norm = (s) => (s || '').trim().toLowerCase().replace(/[\s-]/g, '');

// Trainer login: the SR code IS the credential. Trainers don't have Base44
// accounts — we use the service role to look up the trainer by sr_code.
// Admin override: entering "Admin2026" grants full access to all bookings.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const sr = norm(body?.srCode);
    if (!sr) return Response.json({ error: 'Enter your SR code' }, { status: 400 });

    // Admin override
    if (sr === 'admin2026') {
      return Response.json({
        trainer: {
          id: 'admin',
          name: 'Administrator',
          specialty: 'Full access — all trainers',
          is_admin: true,
        },
      });
    }

    const trainers = await base44.asServiceRole.entities.Trainer.filter({ active: true }, 'order', 200);
    const trainer = trainers.find((t) => norm(t.sr_code) === sr);
    if (!trainer) return Response.json({ error: 'No active trainer found with that SR code' }, { status: 404 });

    return Response.json({ trainer });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}