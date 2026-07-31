import { CATEGORIES, clean, bad } from "./_shared.js";
export async function onRequestGet({ request, env }) {
  const u=new URL(request.url), category=clean(u.searchParams.get("category"));
  if(!CATEGORIES.has(category)) return bad("Kategori tidak valid.");
  const r=await env.MEDIA_BUCKET.list({prefix:`${category}/`,limit:1000,include:["httpMetadata","customMetadata"]});
  return Response.json({objects:r.objects.map(o=>({key:o.key,size:o.size,uploaded:o.uploaded,httpMetadata:o.httpMetadata||{},customMetadata:o.customMetadata||{}}))});
}
