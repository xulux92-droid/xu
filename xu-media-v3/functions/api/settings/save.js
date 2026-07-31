export async function onRequestPost({ request, env }) {
  const settings=await request.json().catch(()=>null);
  if(!settings) return Response.json({error:"Settings tidak valid."},{status:400});
  await env.MEDIA_BUCKET.put("settings/app.json",JSON.stringify(settings,null,2),{httpMetadata:{contentType:"application/json"}});
  return Response.json({ok:true});
}
