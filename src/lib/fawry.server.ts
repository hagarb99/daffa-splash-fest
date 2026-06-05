import { createHash } from "crypto";

export interface FawryCheckoutInput {
  merchantRefNumber: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  amount: number; // EGP
  description: string;
  returnUrl: string;
}

/**
 * Build a Fawry hosted checkout URL with proper SHA-256 signature.
 * Docs: https://developer.fawrystaging.com/docs/pay-using-checkout-page/checkout
 */
export function buildFawryCheckoutUrl(input: FawryCheckoutInput) {
  const merchantCode = process.env.FAWRY_MERCHANT_CODE!;
  const secureKey = process.env.FAWRY_SECURE_KEY!;
  const baseUrl = process.env.FAWRY_BASE_URL || "https://atfawry.fawrystaging.com";
  if (!merchantCode || !secureKey) throw new Error("Fawry credentials missing");

  const itemId = "BOOKING";
  const quantity = 1;
  const amountStr = input.amount.toFixed(2);
  const signature = createHash("sha256").update(
    merchantCode + input.merchantRefNumber + input.customerMobile + input.customerEmail + itemId + String(quantity) + amountStr + secureKey,
  ).digest("hex");

  const url = new URL(`${baseUrl}/ECommerceWeb/Fawry/payments/charge`);
  url.searchParams.set("merchantCode", merchantCode);
  url.searchParams.set("merchantRefNumber", input.merchantRefNumber);
  url.searchParams.set("customerName", input.customerName);
  url.searchParams.set("customerMobile", input.customerMobile);
  url.searchParams.set("customerEmail", input.customerEmail);
  url.searchParams.set("description", input.description);
  url.searchParams.set("paymentExpiry", String(Date.now() + 15 * 60 * 1000));
  url.searchParams.set("language", "en-gb");
  url.searchParams.set("chargeItems[0].itemId", itemId);
  url.searchParams.set("chargeItems[0].quantity", String(quantity));
  url.searchParams.set("chargeItems[0].price", amountStr);
  url.searchParams.set("chargeItems[0].description", input.description);
  url.searchParams.set("returnUrl", input.returnUrl);
  url.searchParams.set("signature", signature);
  return url.toString();
}

/** Verify Fawry callback signature.
 *  Fawry sends `messageSignature` = sha256(fawryRefNumber + merchantRefNumber + paymentAmount + orderAmount + orderStatus + paymentMethod + paymentRefrenceNumber? + secureKey)
 */
export function verifyFawrySignature(payload: Record<string, unknown>): boolean {
  const secureKey = process.env.FAWRY_SECURE_KEY!;
  const provided = String(payload.messageSignature || "");
  if (!provided) return false;
  const fields = [
    payload.fawryRefNumber,
    payload.merchantRefNumber,
    Number(payload.paymentAmount ?? 0).toFixed(2),
    Number(payload.orderAmount ?? 0).toFixed(2),
    payload.orderStatus,
    payload.paymentMethod,
    payload.paymentRefrenceNumber ?? "",
    secureKey,
  ].map((v) => (v == null ? "" : String(v))).join("");
  const expected = createHash("sha256").update(fields).digest("hex");
  return expected.toLowerCase() === provided.toLowerCase();
}

export function fawryMerchantCodeMatches(payload: Record<string, unknown>): boolean {
  const code = process.env.FAWRY_MERCHANT_CODE!;
  // Fawry includes merchantCode in some callbacks, not always — if present must match
  if (payload.merchantCode && String(payload.merchantCode) !== code) return false;
  return true;
}
