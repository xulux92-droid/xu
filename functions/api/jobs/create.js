export async function onRequestPost({ request, env }) {
  const payload=await request.json().catch(()=>null);
  if(!payload?.project) return Response.json({error:"Project wajib."},{status:400});
  const id=crypto.randomUUID(), now=new Date().toISOString();
  const job={id,status:"queued",progress:0,createdAt:now,updatedAt:now,projectId:payload.project.id,projectName:payload.project.name,mode:payload.mode||"external",message:"Queued"};
  await env.MEDIA_BUCKET.put(`jobs/${id}.json`,JSON.stringify(job,null,2),{httpMetadata:{contentType:"application/json"}});

  if(payload.endpoint){
    try{
      const res=await fetch(payload.endpoint,{method:"POST",headers:{"content-type":"application/json",...(payload.apiKey?{"authorization":`Bearer ${payload.apiKey}`}:{})},body:JSON.stringify({...payload,jobId:id})});
      const data=await res.json().catch(()=>({}));
      job.externalJobId=data.jobId||null; job.status=res.ok?(data.status||"submitted"):"failed"; job.message=res.ok?"Submitted to external API":`External API error ${res.status}`;
    }catch(e){job.status="failed";job.message=e.message}
    job.updatedAt=new Date().toISOString();
    await env.MEDIA_BUCKET.put(`jobs/${id}.json`,JSON.stringify(job,null,2),{httpMetadata:{contentType:"application/json"}});
  }
  return Response.json({ok:true,job});
}
