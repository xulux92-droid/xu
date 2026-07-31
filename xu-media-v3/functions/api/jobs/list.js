export async function onRequestGet({ env }) {
  const r=await env.MEDIA_BUCKET.list({prefix:"jobs/",limit:1000});
  const jobs=[];
  for(const o of r.objects){if(!o.key.endsWith(".json"))continue;const f=await env.MEDIA_BUCKET.get(o.key);try{jobs.push(await f.json())}catch{}}
  jobs.sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")));
  return Response.json({jobs});
}
