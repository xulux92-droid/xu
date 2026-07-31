export async function onRequestPost({ request, env }) {
  const b=await request.json().catch(()=>null);
  if(!b?.jobId) return Response.json({error:"jobId wajib."},{status:400});
  const key=`jobs/${b.jobId}.json`, f=await env.MEDIA_BUCKET.get(key);
  if(!f) return Response.json({error:"Job tidak ditemukan."},{status:404});
  const job=await f.json();
  Object.assign(job,b,{updatedAt:new Date().toISOString()});
  await env.MEDIA_BUCKET.put(key,JSON.stringify(job,null,2),{httpMetadata:{contentType:"application/json"}});
  return Response.json({ok:true});
}
