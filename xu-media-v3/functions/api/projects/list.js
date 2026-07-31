export async function onRequestGet({ env }) {
  const r=await env.MEDIA_BUCKET.list({prefix:"projects/",limit:1000});
  const projects=[];
  for(const o of r.objects){
    if(!o.key.endsWith(".json")) continue;
    const f=await env.MEDIA_BUCKET.get(o.key);
    if(!f) continue;
    try{projects.push(await f.json())}catch{}
  }
  projects.sort((a,b)=>String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")));
  return Response.json({projects});
}
