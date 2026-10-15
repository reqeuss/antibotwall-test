export async function onRequestPost() {
  return new Response(null, {
    status: 303,
    headers: {
      "Location": "/profile.html",
      "Set-Cookie": "abw_profile_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax",
      "Cache-Control": "no-store"
    }
  });
}
