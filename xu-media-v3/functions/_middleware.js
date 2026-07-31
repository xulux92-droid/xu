export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) return next();
  if (url.pathname === "/api/auth" || url.pathname === "/api/jobs/callback") return next();

  const expected = env.AUTH_TOKEN || "kopihitam12";
  const received = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected) return Response.json({ error: "AUTH_TOKEN belum dikonfigurasi." }, { status: 500 });
  if (!received || received !== expected) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return next();
}
