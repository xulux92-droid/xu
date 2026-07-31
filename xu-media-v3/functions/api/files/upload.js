import { CATEGORIES, clean, safeName, bad } from "./_shared.js";
export async function onRequestPost({ request, env }) {
  const f=await request.formData(), file=f.get("file"), category=clean(f.get("category"));
  if(!CATEGORIES.has(category)) return bad("Kategori tidak valid.");
  if(!(file instanceof File)) return bad("File tidak ditemukan.");
  if(file.size>500*1024*1024) return bad("Maksimal 500 MB per file.",413);
  const name=safeName(file.name), key=`${category}/${Date.now()}-${crypto.randomUUID().slice(0,8)}-${name}`;
  await env.MEDIA_BUCKET.put(key,file.stream(),{httpMetadata:{contentType:file.type||"application/octet-stream",contentDisposition:`inline; filename="${name}"`},customMetadata:{originalName:file.name,category}});
  return Response.json({ok:true,key,size:file.size});
}
