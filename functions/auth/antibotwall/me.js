const COOKIE_NAME = "abw_profile_session";
const decode = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return new TextDecoder().decode(Uint8Array.from(atob(normalized + "=".repeat((4 - normalized.length % 4) % 4)), c => c.charCodeAt(0)));
};
async function sign(value, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function response(data, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}
export async function onRequestGet({ request, env }) {
  if (!env.ABW_SITE_SECRET) return response({ error: "Integration is not configured." }, 503);
  const cookieHeader = request.headers.get("Cookie") || "";
  const raw = cookieHeader.split(";").map(v => v.trim()).find(v => v.startsWith(COOKIE_NAME + "="))?.slice(COOKIE_NAME.length + 1);
  if (!raw) return response({ authenticated: false }, 200);
  const parts = raw.split(".");
  if (parts.length !== 2) return response({ authenticated: false }, 200);
  const [payloadPart, supplied] = parts;
  const expected = await sign(payloadPart, env.ABW_SITE_SECRET);
  if (expected.length !== supplied.length || ![...expected].every((c, i) => c === supplied[i])) return response({ authenticated: false }, 200);
  let session;
  try { session = JSON.parse(decode(payloadPart)); } catch { return response({ authenticated: false }, 200); }
  if (!session.user || !Number.isFinite(session.exp) || session.exp <= Math.floor(Date.now() / 1000)) return response({ authenticated: false }, 200);
  return response({ authenticated: true, user: session.user, expiresAt: session.exp });
}
