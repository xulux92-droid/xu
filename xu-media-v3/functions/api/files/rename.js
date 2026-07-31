import { safeName, bad } from "./_shared.js";
const ext=n=>{const i=n.lastIndexOf(".");return i>-1?n.slice(i):""};
export async function onRequestPost({ request, env }) {
  const b=await request.json().catch(()=>null), key=b?.key, nn=b?.newName;
  if(!key||!nn||key.includes("..")) return bad("Data rename tidak valid.");
  const src=await env.MEDIA_BUCKET.get(key); if(!src) return bad("File tidak ditemukan.",404);
  const prefix=key.slice(0,key.lastIndexOf("/")+1), old=key.split("/").pop(), e=ext(old);
  let n=safeName(nn); if(ext(n).toLowerCase()!==e.toLowerCase()) n+=e;
  const nk=`${prefix}${Date.now()}-${n}`;
  await env.MEDIA_BUCKET.put(nk,src.body,{httpMetadata:src.httpMetadata,customMetadata:{...(src.customMetadata||{}),renamedFrom:key}});
  await env.MEDIA_BUCKET.delete(key);
  return Response.json({ok:true,newKey:nk});
}
