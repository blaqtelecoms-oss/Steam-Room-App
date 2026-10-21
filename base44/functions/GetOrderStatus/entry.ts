import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Looks up an order by its reference so the checkout-return page can poll
// its status. Uses the service role so it works for unauthenticated members.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const reference = body?.reference;
    if (!reference) return Response.json({ error: 'reference required' }, { status: 400 });

    const orders = await base44.asServiceRole.entities.Order.filter({ reference });
    const order = orders[0] || null;
    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

    return Response.json({ order });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}