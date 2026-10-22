import { adminClient, genId, nowISO } from "../_shared/supabase.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

// Creates a pending Order for a member, then calls Yoco's Checkout API
// server-side and returns the hosted-checkout redirectUrl.
// member_id is passed from the frontend (SR-number-gated portal — no user auth).

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = adminClient();
    const body = await req.json();
    const { amount, type, items, description, payment_id, member_id, return_base } = body || {};

    if (!amount || !type) return jsonResponse({ error: "amount and type are required" }, 400);

    // Get member email (best-effort)
    let email = "";
    if (member_id) {
      const { data: member } = await supabase
        .from("member")
        .select("email")
        .eq("id", member_id)
        .maybeSingle();
      email = member?.email || "";
    }

    const reference = `SR-ORD-${Date.now().toString(36).toUpperCase()}`;
    const now = nowISO();

    // Create a pending order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        id: genId(),
        reference,
        member_id: member_id || null,
        email,
        amount: Number(amount),
        type,
        items: type === "merchandise" ? (items || []) : null,
        description: type !== "merchandise" ? (description || type) : null,
        payment_id: payment_id || null,
        status: "pending",
        created_date: now,
        updated_date: now,
      })
      .select("*")
      .single();

    if (orderError) return jsonResponse({ error: orderError.message }, 500);

    // Call Yoco Checkout API
    const secretKey = Deno.env.get("YOCO_SECRET_KEY");
    if (!secretKey) return jsonResponse({ error: "Yoco secret key not configured" }, 500);

    const base = return_base || new URL(req.url).origin;
    const returnUrl = `${base}/checkout/return?reference=${encodeURIComponent(reference)}`;
    const amountInCents = Math.round(Number(amount) * 100);

    const yocoRes = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInCents,
        currency: "ZAR",
        successUrl: returnUrl,
        cancelUrl: returnUrl,
        failureUrl: returnUrl,
        metadata: {
          reference,
          order_id: order.id,
          member_id: member_id || "",
        },
      }),
    });

    if (!yocoRes.ok) {
      const errText = await yocoRes.text().catch(() => "");
      return jsonResponse({ error: `Yoco checkout failed (${yocoRes.status}): ${errText}` }, 502);
    }

    const yocoData: any = await yocoRes.json();
    const redirectUrl = yocoData.redirectUrl || yocoData.redirect_url;
    if (!redirectUrl) return jsonResponse({ error: "No redirect URL returned by Yoco" }, 502);

    // Store Yoco's checkout id on the order for webhook reconciliation
    const yocoCheckoutId = yocoData.id || "";
    if (yocoCheckoutId) {
      await supabase
        .from("orders")
        .update({ payment_reference: yocoCheckoutId, updated_date: nowISO() })
        .eq("id", order.id);
    }

    return jsonResponse({ reference, order_id: order.id, redirectUrl });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});
