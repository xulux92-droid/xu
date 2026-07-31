import { bad } from "./_shared.js";
export async function onRequestGet({ request, env }) {
  const u=new URL(request.url), key=u.searchParams.get("key");
  if(!key||key.includes("..")) return bad("Key tidak valid.");
  const o=await env.MEDIA_BUCKET.get(key); if(!o) return bad("File tidak ditemukan.",404);
  const h=new Headers(); o.writeHttpMetadata(h); h.set("etag",o.httpEtag); h.set("cache-control","private,max-age=3600");
  if(u.searchParams.get("download")==="1") h.set("content-disposition",`attachment; filename="${key.split("/").pop()}"`);
  return new Response(o.body,{headers:h});
}
