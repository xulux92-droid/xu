
export const $ = (sel, ctx=document) => ctx.querySelector(sel);
export const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
export const escapeHtml = (s='') => s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
export const formatBytes = (bytes=0) => {
  if (!bytes) return '0 B';
  const u=['B','KB','MB','GB'];
  const i=Math.min(Math.floor(Math.log(bytes)/Math.log(1024)),u.length-1);
  return `${(bytes/1024**i).toFixed(i?2:0)} ${u[i]}`;
};
export const copyText = async (text) => { await navigator.clipboard.writeText(String(text ?? '')); };
export const downloadText = (filename, text, type='text/plain;charset=utf-8') => {
  const blob = new Blob([text], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
};
export const debounce = (fn, delay=250) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), delay); }; };
export const slugify = (s='') => s.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-+|-+$/g,'');
export const storage = {
  get(key, fallback=null){ try{ const raw=localStorage.getItem(key); return raw===null?fallback:JSON.parse(raw);}catch{return fallback;} },
  set(key, value){ localStorage.setItem(key, JSON.stringify(value)); },
  remove(key){ localStorage.removeItem(key); }
};
export const notify = (message) => window.dispatchEvent(new CustomEvent('xu:toast', { detail: { message } }));
export const rand = (arr=[]) => arr[Math.floor(Math.random()*arr.length)] || '';
export const unique = (arr=[]) => [...new Set(arr)];
export const sanitizeDomain = (input='') => input.trim().replace(/^https?:\/\//i,'').replace(/^www\./i,'').split('/')[0].toLowerCase();
export const plain = (html='') => html.replace(/<[^>]+>/g,' ');
