import { slugify } from './utils.js';

export function getPublishConfig(){
  try {
    return JSON.parse(localStorage.getItem('xu-publish-config') || '{}');
  } catch {
    return {};
  }
}

export function setPublishConfig(cfg){
  localStorage.setItem('xu-publish-config', JSON.stringify(cfg || {}));
}

export async function publishHtmlToGithub({ token, owner, repo, branch='main', slug, html }){
  if(!token) throw new Error('GitHub token belum diisi.');
  if(!owner || !repo) throw new Error('Owner atau repo GitHub belum diisi.');
  const cleanSlug = slugify(slug || 'amp-page');
  const filePath = `${cleanSlug}.html`;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json'
  };

  let sha = null;
  const existing = await fetch(apiUrl, { headers });
  if(existing.ok){
    const ex = await existing.json();
    sha = ex.sha || null;
  }

  const body = {
    message: sha ? `update ${filePath}` : `create ${filePath}`,
    content: btoa(unescape(encodeURIComponent(html))),
    branch
  };
  if(sha) body.sha = sha;

  const res = await fetch(apiUrl, { method:'PUT', headers, body: JSON.stringify(body) });
  const data = await res.json();
  if(!res.ok){
    throw new Error(data.message || 'Gagal publish ke GitHub.');
  }

  return { slug: cleanSlug, filePath, data };
}
