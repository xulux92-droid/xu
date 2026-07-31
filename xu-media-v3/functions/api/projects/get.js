export async function onRequestGet({ request, env }) {
  const id=new URL(request.url).searchParams.get("id");
  if(!id) return Response.json({error:"ID wajib."},{status:400});
  const f=await env.MEDIA_BUCKET.get(`projects/${id}.json`);
  if(!f) return Response.json({error:"Project tidak ditemukan."},{status:404});
  return Response.json({project:await f.json()});
}
