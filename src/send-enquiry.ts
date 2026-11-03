/**
 * Live enquiry delivery. Every submission goes to:
 *  1. Email: FormSubmit (static-host friendly, no server needed) → ENQUIRY_EMAIL.
 *  2. WhatsApp: a wa.me link with the full brief prefilled opens for the visitor to send.
 *  3. Lead relay: a fire-and-forget JSON POST. Skipped when the honeypot is filled.
 *     A relay failure never blocks email or WhatsApp.
 * To change the inbox, edit ENQUIRY_EMAIL (FormSubmit sends a one-time activation
 * email to a new address; click it once to start receiving submissions).
 */
export const ENQUIRY_EMAIL = "info@maaipropertycare.com";
export const WHATSAPP_NUMBER = "917589490641";
const LEAD_RELAY_URL = "https://nss-n8n.nbnexa.com/webhook/leads/maai/website_public";

/** Posts one lead to the public relay. Never throws and never awaits the response. */
export function relayLead(formId: string, fields: Record<string, unknown>): void {
  try {
    void fetch(LEAD_RELAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, formId, page: window.location.href }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    return;
  }
}

export function whatsappUrl(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function briefLines(title: string, data: FormData) {
  const lines = [title, ""];
  for (const [key, raw] of data.entries()) {
    if (key.startsWith("_")) continue;
    const value = String(raw).trim();
    if (value) lines.push(`${key.replace(/_/g, " ").replace(/^./, (l) => l.toUpperCase())}: ${value}`);
  }
  return lines;
}

/** Opens WhatsApp synchronously (inside the submit gesture, so it is not popup-blocked)
 *  and posts the email in the background. Resolves true when the email was accepted. */
export async function sendEnquiry(subject: string, brief: string, data: FormData, formId: string): Promise<boolean> {
  const wa = whatsappUrl(brief);
  const opened = window.open(wa, "_blank", "noopener");
  if (!opened && window.matchMedia("(max-width: 700px)").matches) {
    // Some mobile browsers block new tabs; fall back after the email request below.
    setTimeout(() => { window.location.href = wa; }, 900);
  }
  if (String(data.get("_honey") ?? "")) return true; // spam trap
  const payload: Record<string, string> = { _subject: subject, _template: "table", _captcha: "false", Page: window.location.href };
  const relayFields: Record<string, string> = { subject, brief };
  for (const [key, raw] of data.entries()) {
    if (key === "_honey") continue;
    const value = String(raw).trim();
    if (!value) continue;
    payload[key] = value;
    if (!key.startsWith("_")) relayFields[key] = value;
  }
  payload.Brief = brief;
  relayLead(formId, relayFields);
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${ENQUIRY_EMAIL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch {
    return false;
  }
}
