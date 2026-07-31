import { bad } from "./_shared.js";
export async function onRequestDelete({ request, env }) {
  const b=await request.json().catch(()=>null), key=b?.key;
  if(!key||key.includes("..")) return bad("Key tidak valid.");
  await env.MEDIA_BUCKET.delete(key); return Response.json({ok:true});
}
