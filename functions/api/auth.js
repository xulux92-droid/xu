export async function onRequestGet({ request, env }) {
  const expected = env.AUTH_TOKEN || "kopihitam12";
  const received = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected) return Response.json({ error: "AUTH_TOKEN belum dikonfigurasi." }, { status: 500 });
  if (received !== expected) return Response.json({ error: "Token tidak valid." }, { status: 401 });
  return Response.json({ ok: true });
}
