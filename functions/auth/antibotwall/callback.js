const API_ISSUER = "https://antibotwall.reqeuss.com";
const COOKIE_NAME = "abw_profile_session";
const SESSION_SECONDS = 60 * 60 * 24 * 30;

const encode = (value) => btoa(String.fromCharCode(...new TextEncoder().encode(value)))
  .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
const decode = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return new TextDecoder().decode(Uint8Array.from(atob(normalized + "=".repeat((4 - normalized.length % 4) % 4)), c => c.charCodeAt(0)));
};
async function sign(value, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}
function redirect(path) {
  return new Response(null, { status: 303, headers: { Location: path, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}
export async function onRequestGet() {
  return new Response(
    "AntiBotWall callback actif. Cette URL doit être appelée en POST avec un champ token ; elle ne se teste pas en ouvrant le lien directement.",
    {
      status: 405,
      headers: {
        "Allow": "POST",
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store"
      }
    }
  );
}

export async function onRequestPost({ request, env }) {
  if (!env.ABW_SITE_KEY || !env.ABW_SITE_SECRET) {
    return new Response("AntiBotWall integration is not configured.", { status: 503 });
  }
  const type = request.headers.get("content-type") || "";
  let token = "";
  if (type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data")) {
    const form = await request.formData();
    token = String(form.get("token") || "");
  } else if (type.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    token = typeof body.token === "string" ? body.token : "";
  }
  if (!token || token.length > 12000) return new Response("Missing or invalid token.", { status: 400 });

  const parts = token.split(".");
  if (parts.length !== 2) return new Response("Invalid AntiBotWall token.", { status: 401 });
  const [payloadPart, signature] = parts;
  let payload;
  try { payload = JSON.parse(decode(payloadPart)); } catch { return new Response("Invalid token payload.", { status: 401 }); }

  const expected = await sign(payloadPart, env.ABW_SITE_SECRET);
  const supplied = signature;
  if (!safeEqual(expected, supplied)) return new Response("Token signature verification failed.", { status: 401 });
  const now = Math.floor(Date.now() / 1000);
  if (payload.iss !== API_ISSUER || payload.aud !== env.ABW_SITE_KEY ||
      !Number.isFinite(payload.exp) || payload.exp <= now ||
      !Number.isFinite(payload.iat) || payload.iat > now + 30 ||
      payload.exp - payload.iat > 600 ||
      typeof payload.sub !== "string" || !payload.user || typeof payload.user !== "object") {
    return new Response("Token claims are invalid or expired.", { status: 401 });
  }

  const user = {
    id: String(payload.user.id || payload.sub.split(":").slice(1).join(":") || ""),
    provider: String(payload.provider || payload.user.provider || "unknown"),
    name: String(payload.user.name || payload.user.username || "Utilisateur").slice(0, 100),
    email: typeof payload.user.email === "string" ? payload.user.email.slice(0, 254) : null,
    avatar: typeof payload.user.avatar === "string" ? payload.user.avatar : null,
    sub: payload.sub
  };
  const sessionPayload = encode(JSON.stringify({ user, iat: now, exp: now + SESSION_SECONDS }));
  const sessionSignature = await sign(sessionPayload, env.ABW_SITE_SECRET);
  const cookie = `${COOKIE_NAME}=${sessionPayload}.${sessionSignature}; Max-Age=${SESSION_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Lax`;
  return new Response(null, {
    status: 303,
    headers: {
      Location: "/profile.html?connected=1",
      "Set-Cookie": cookie,
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer"
    }
  });
}
