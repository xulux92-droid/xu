export async function onRequestDelete({ request, env }) {
  const b=await request.json().catch(()=>null);
  if(!b?.id) return Response.json({error:"ID wajib."},{status:400});
  await env.MEDIA_BUCKET.delete(`projects/${b.id}.json`);
  return Response.json({ok:true});
}
