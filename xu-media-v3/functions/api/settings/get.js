export async function onRequestGet({ env }) {
  const f=await env.MEDIA_BUCKET.get("settings/app.json");
  return Response.json({settings:f?await f.json():{}});
}
