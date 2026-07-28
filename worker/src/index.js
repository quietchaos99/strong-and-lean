export default {
  async fetch(request, env) {
    const cors = {"access-control-allow-origin":env.ALLOWED_ORIGIN||"*","access-control-allow-headers":"content-type,x-backup-key","access-control-allow-methods":"POST,OPTIONS"};
    if(request.method==="OPTIONS") return new Response(null,{headers:cors});
    const url=new URL(request.url);
    if(request.method!=="POST"||url.pathname!=="/backup") return new Response("Not found",{status:404,headers:cors});
    if(!env.APP_BACKUP_KEY||request.headers.get("x-backup-key")!==env.APP_BACKUP_KEY) return new Response("Unauthorized",{status:401,headers:cors});
    const body=await request.json(); const day=new Date().toISOString().slice(0,10); const path=`journal/${day}.json`;
    const api=`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`;
    const headers={"authorization":`Bearer ${env.GITHUB_TOKEN}`,"accept":"application/vnd.github+json","x-github-api-version":"2022-11-28","user-agent":"strong-lean-backup"};
    const current=await fetch(`${api}?ref=${env.GITHUB_BRANCH}`,{headers}); let sha;
    if(current.ok) sha=(await current.json()).sha; else if(current.status!==404) return new Response("GitHub read failed",{status:502,headers:cors});
    const payload={message:`Backup workout journal for ${day}`,content:btoa(unescape(encodeURIComponent(JSON.stringify(body,null,2)))),branch:env.GITHUB_BRANCH,...(sha?{sha}:{})};
    const saved=await fetch(api,{method:"PUT",headers:{...headers,"content-type":"application/json"},body:JSON.stringify(payload)});
    return new Response(saved.ok?"Backed up":"GitHub write failed",{status:saved.ok?200:502,headers:cors});
  }
};
