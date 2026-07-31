export async function onRequestPost({ request, env }) {
  const p=await request.json().catch(()=>null);
  if(!p||!p.name) return Response.json({error:"Nama project wajib."},{status:400});
  p.id=p.id||crypto.randomUUID();
  p.createdAt=p.createdAt||new Date().toISOString();
  p.updatedAt=new Date().toISOString();
  await env.MEDIA_BUCKET.put(`projects/${p.id}.json`,JSON.stringify(p,null,2),{httpMetadata:{contentType:"application/json"}});
  return Response.json({ok:true,project:p});
}
