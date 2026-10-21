import { base44 } from "@/api/base44Client";

// Creates a pending Order server-side, then redirects the member to Yoco's
// hosted checkout page. Yoco redirects back to /checkout/return on completion;
// the signed YocoWebhook is the authoritative confirmation path.
// Same call signature as the former GlobalPay helper so callers stay simple.
export async function startYocoCheckout({
  amount,
  type,
  items,
  description,
  payment_id,
  member_id,
  onSuccess,
  onError,
  onClose,
}) {
  try {
    const res = await base44.functions.invoke("CreateYocoCheckout", {
      amount,
      type,
      items,
      description,
      payment_id,
      member_id,
    });
    const { redirectUrl, reference } = res.data;
    if (!redirectUrl) throw new Error("No checkout URL returned.");
    if (onSuccess) onSuccess(reference);
    window.location.href = redirectUrl;
    return reference;
  } catch (e) {
    if (onError) onError(e);
    if (onClose) onClose();
    throw e;
  }
}