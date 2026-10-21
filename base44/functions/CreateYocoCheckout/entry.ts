import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// Creates a pending Order for a member, then calls Yoco's Checkout API
// server-side and returns the hosted-checkout redirectUrl.
// member_id is passed from the frontend (SR-number-gated portal — no auth.me()).
const RETURN_BASE = 'https://srfits-app.com';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { amount, type, items, description, payment_id, member_id, return_base } = body || {};
    if (!amount || !type) return Response.json({ error: 'amount and type are required' }, { status: 400 });

    let email = '';
    if (member_id) {
      try {
        const member = await base44.asServiceRole.entities.Member.get(member_id);
        email = member?.email || '';
      } catch { /* best-effort */ }
    }

    const reference = `SR-ORD-${Date.now().toString(36).toUpperCase()}`;
    const order = await base44.asServiceRole.entities.Order.create({
      reference,
      member_id: member_id || '',
      email,
      amount: Number(amount),
      type,
      items: type === 'merchandise' ? (items || []) : null,
      description: type !== 'merchandise' ? (description || type) : null,
      payment_id: payment_id || null,
      status: 'pending',
    });

    const secretKey = secrets.get('YOCO_SECRET_KEY');
    if (!secretKey) return Response.json({ error: 'Yoco secret key not configured' }, { status: 500 });

    const base = return_base || RETURN_BASE;
    const returnUrl = `${base}/checkout/return?reference=${encodeURIComponent(reference)}`;
    const amountInCents = Math.round(Number(amount) * 100);

    const yocoRes = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInCents,
        currency: 'ZAR',
        successUrl: returnUrl,
        cancelUrl: returnUrl,
        failureUrl: returnUrl,
        metadata: {
          reference,
          order_id: order.id,
          member_id: member_id || '',
        },
      }),
    });

    if (!yocoRes.ok) {
      const errText = await yocoRes.text().catch(() => '');
      return Response.json({ error: `Yoco checkout failed (${yocoRes.status}): ${errText}` }, { status: 502 });
    }

    const yocoData: any = await yocoRes.json();
    const redirectUrl = yocoData.redirectUrl || yocoData.redirect_url;
    if (!redirectUrl) return Response.json({ error: 'No redirect URL returned by Yoco' }, { status: 502 });

    // Store Yoco's checkout id on the order so the webhook can reconcile it.
    const yocoCheckoutId = yocoData.id || '';
    if (yocoCheckoutId) {
      try {
        await base44.asServiceRole.entities.Order.update(order.id, { payment_reference: yocoCheckoutId });
      } catch { /* best-effort */ }
    }

    return Response.json({ reference, order_id: order.id, redirectUrl });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}