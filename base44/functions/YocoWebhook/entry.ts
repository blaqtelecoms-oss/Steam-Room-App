import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets, waitUntil } from 'base44:runtime';
import { computeCredit } from '../../shared/credit.ts';

// Receives signed Yoco webhook events for our checkouts. Verifies the
// Standard Webhooks signature (webhook-id, webhook-timestamp, webhook-signature),
// rejects stale (>3 min) or unsigned requests, then reconciles the event to our
// Order and settles it. Yoco's "payment.created" event is the success signal
// (per Yoco docs: "mark an order as paid when a payment.created event arrives").
// The webhook payload only carries event_type + order_id + payment_id, so we
// fetch the checkout from Yoco by order_id to read our metadata.reference and
// the authoritative amount/status, falling back to a direct match on the Yoco
// checkout id stored on the order at creation.
// Runs as the service role (no user auth) — anyone can reach the endpoint, so
// the signature is mandatory.

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function verifySignature(req: Request, rawBody: string): Promise<boolean> {
  const id = req.headers.get('webhook-id');
  const ts = req.headers.get('webhook-timestamp');
  const sig = req.headers.get('webhook-signature');
  if (!id || !ts || !sig) return false;

  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum)) return false;
  const ageMs = Math.abs(Date.now() - tsNum * 1000);
  if (ageMs > 3 * 60 * 1000) return false;

  const secretStr = secrets.get('YOCO_WEBHOOK_SECRET') || '';
  if (!secretStr) return false;
  const cleaned = secretStr.startsWith('whsec_') ? secretStr.slice(6) : secretStr;

  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey(
      'raw',
      base64ToBytes(cleaned) as BufferSource,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
  } catch {
    return false;
  }

  const data = new TextEncoder().encode(`${id}.${ts}.${rawBody}`);
  const signature = await crypto.subtle.sign('HMAC', key, data as BufferSource);
  const expected = bytesToBase64(new Uint8Array(signature));

  // The signature header is space-separated, each value prefixed with "v1,".
  const sigs = sig.split(' ').map((s) => s.split(',')[1]).filter(Boolean);
  return sigs.some((s) => s === expected);
}

async function fetchCheckout(base44: any, secretKey: string, yocoOrderId: string) {
  if (!secretKey || !yocoOrderId) return null;
  try {
    const r = await fetch(`https://payments.yoco.com/api/checkouts/${encodeURIComponent(yocoOrderId)}`, {
      headers: { 'Authorization': `Bearer ${secretKey}` },
    });
    if (!r.ok) return null;
    const c: any = await r.json();
    const ref = c?.metadata?.reference;
    let order: any = null;
    if (ref) {
      const orders = await base44.asServiceRole.entities.Order.filter({ reference: ref });
      order = orders[0];
    }
    return {
      order,
      status: String(c?.status || '').toLowerCase(),
      amountCents: typeof c?.amount === 'number' ? c.amount : null,
    };
  } catch {
    return null;
  }
}

export default async function(req: Request): Promise<Response> {
  try {
    const rawBody = await req.text();
    const ok = await verifySignature(req, rawBody);
    if (!ok) return Response.json({ error: 'Invalid signature' }, { status: 401 });

    const body = JSON.parse(rawBody);
    const eventType = String(body?.event_type || '').toLowerCase();
    const yocoOrderId = body?.order_id || '';
    const yocoPaymentId = body?.payment_id || body?.paymentId || '';

    const base44 = createClientFromRequest(req);
    const secretKey = secrets.get('YOCO_SECRET_KEY') || '';

    // Reconcile: fetch the checkout from Yoco to read metadata, fall back to a
    // direct match on the stored Yoco checkout id (payment_reference).
    let order: any = null;
    let checkoutStatus = '';
    let checkoutAmountCents: number | null = null;

    const fetched = await fetchCheckout(base44, secretKey, yocoOrderId);
    if (fetched) {
      order = fetched.order;
      checkoutStatus = fetched.status;
      checkoutAmountCents = fetched.amountCents;
    }
    if (!order && yocoOrderId) {
      const orders = await base44.asServiceRole.entities.Order.filter({ payment_reference: yocoOrderId });
      order = orders[0];
    }
    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

    // payment.created is Yoco's success signal.
    const isSuccess = eventType === 'payment.created' || eventType === 'payment.succeeded';
    const isRefund = eventType === 'payment.refunded';

    if (isSuccess) {
      // If we fetched the checkout, only settle when it's completed.
      if (checkoutStatus && checkoutStatus !== 'completed') {
        return Response.json({ ok: true, reference: order.reference, status: 'pending' });
      }

      // Verify the charged amount matches (in cents) when available.
      if (checkoutAmountCents != null && Math.round(Number(order.amount) * 100) !== checkoutAmountCents) {
        return Response.json({ error: 'Amount mismatch' }, { status: 400 });
      }

      // Idempotent: already settled.
      if (order.status === 'paid') {
        return Response.json({ ok: true, reference: order.reference, status: 'paid', idempotent: true });
      }

      await base44.asServiceRole.entities.Order.update(order.id, { status: 'paid' });

      if (order.type === 'merchandise') {
        await base44.asServiceRole.entities.Payment.create({
          member_id: order.member_id,
          amount: Number(order.amount),
          date: new Date().toISOString().slice(0, 10),
          type: 'merchandise',
          status: 'paid',
          method: 'Yoco',
          description: `Merchandise order ${order.reference}`,
        });
      } else if (order.payment_id) {
        await base44.asServiceRole.entities.Payment.update(order.payment_id, {
          status: 'paid',
          method: 'Yoco',
        });
      } else {
        await base44.asServiceRole.entities.Payment.create({
          member_id: order.member_id,
          amount: Number(order.amount),
          date: new Date().toISOString().slice(0, 10),
          type: order.type,
          status: 'paid',
          method: 'Yoco',
          description: order.description || order.type,
        });
      }

      // Keep the credit facility in sync for billable dues.
      if (order.member_id && order.type !== 'merchandise') {
        try {
          const payments = await base44.asServiceRole.entities.Payment.filter({ member_id: order.member_id }, '-date', 500);
          const { streak, creditLimit, creditBalance } = computeCredit(payments || []);
          await base44.asServiceRole.entities.Member.update(order.member_id, {
            credit_limit: creditLimit,
            credit_balance: creditBalance,
            credit_streak: streak,
          });
        } catch { /* credit sync is best-effort */ }
      }

      waitUntil(sendFulfillmentEmails(base44, order));
      return Response.json({ ok: true, reference: order.reference, status: 'paid' });
    }

    if (isRefund) {
      return Response.json({ ok: true, reference: order.reference, status: 'refunded' });
    }

    return Response.json({ ok: true, reference: order.reference, status: 'acknowledged' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function sendFulfillmentEmails(base44: any, order: any) {
  try {
    if (order.email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: order.email,
        subject: 'Payment confirmed — SR FITS',
        html: buildCustomerHtml(order),
      });
    }
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    const alertText = `New paid order\nReference: ${order.reference}\nAmount: R${Number(order.amount).toFixed(2)}\nType: ${order.type}\nMember: ${order.member_id || '—'}`;
    for (const a of admins || []) {
      if (a.email) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: a.email,
            subject: 'New paid order — SR FITS',
            text: alertText,
          });
        } catch { /* per-admin best-effort */ }
      }
    }
  } catch { /* fulfillment best-effort */ }
}

function buildCustomerHtml(order: any): string {
  let summary = '';
  if (order.type === 'merchandise' && Array.isArray(order.items) && order.items.length) {
    const lines = order.items.map((i: any) => `<li>${i.name} x${i.qty} — R${(i.price * i.qty).toFixed(2)}</li>`).join('');
    summary = `<p>Order summary:</p><ul>${lines}</ul>`;
  } else {
    summary = `<p>${order.description || order.type}</p>`;
  }
  return `<p>Hi,</p><p>Your payment of <b>R${Number(order.amount).toFixed(2)}</b> was confirmed.</p>${summary}<p>Reference: ${order.reference}</p><p>Thank you — SR FITS</p>`;
}