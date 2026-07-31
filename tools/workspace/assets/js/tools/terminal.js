import { $, escapeHtml } from '../core/utils.js';

const help = `Commands:
help
whoami
date
themes
tools
echo [text]
slug [text]
wget [url] [filename]
curl [url] [filename]
clear`;
const slugify = (s='') => s.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-+|-+$/g,'');
const cleanName = (s='file') => (s || 'file').replace(/[^a-zA-Z0-9._-]+/g,'-');

export function render(){
  return `<div class="card-grid"><section class="card">
    <div class="section-head"><div><h3>Terminal Helper</h3><p class="helper-text">Membuat command helper, slug, daftar tools, wget, dan curl.</p></div></div>
    <input id="termInput" placeholder="ketik help, wget https://domain/file.zip file.zip, curl https://domain/file.zip file.zip" />
    <div class="action-row"><button class="btn primary" id="termRun">Run</button><button class="btn ghost" id="termClear">Clear</button></div>
    <div id="termOutput" class="terminal-box">XU Terminal ready. Ketik help.</div>
  </section></div>`;
}

export function init(app){
  const out=$('#termOutput');
  const run=()=>{
    const cmd=$('#termInput').value.trim();
    if(!cmd) return;
    const [base,...rest]=cmd.split(/\s+/);
    let response='';
    if(base==='help') response=help;
    else if(base==='date') response=new Date().toString();
    else if(base==='whoami') response=`${app.getUser().username || 'Guest'} · ${app.getUser().role || 'guest'}`;
    else if(base==='themes') response=app.themes.map(t=>`${t.id} - ${t.name}`).join('\n');
    else if(base==='tools') response=app.tools.filter(t=>app.hasAccess?.(t.id) ?? true).map(t=>`${t.id} - ${t.title}`).join('\n');
    else if(base==='echo') response=rest.join(' ');
    else if(base==='slug') response=slugify(rest.join(' '));
    else if(base==='wget') { const url=rest[0] || ''; const name=cleanName(rest[1] || url.split('/').pop() || 'file'); response = url ? `wget -O "${name}" "${url}"` : 'Format: wget [url] [filename]'; }
    else if(base==='curl') { const url=rest[0] || ''; const name=cleanName(rest[1] || url.split('/').pop() || 'file'); response = url ? `curl -L "${url}" -o "${name}"` : 'Format: curl [url] [filename]'; }
    else if(base==='clear'){ out.textContent='XU Terminal ready. Ketik help.'; $('#termInput').value=''; return; }
    else response=`Unknown command: ${escapeHtml(cmd)}`;
    out.textContent += `\n> ${cmd}\n${response}`;
    out.scrollTop = out.scrollHeight;
    $('#termInput').value='';
  };
  $('#termRun').onclick=run;
  $('#termClear').onclick=()=>{ out.textContent='XU Terminal ready. Ketik help.'; };
  $('#termInput').addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); run(); } });
}
