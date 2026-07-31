
import { $, notify, downloadText } from '../core/utils.js';
let editor;
async function loadMonaco(){
  if(window.monaco && window.require) return;
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/monaco-editor@0.52.2/min/vs/loader.js';
    script.onload = resolve; script.onerror = reject; document.body.appendChild(script);
  });
  await new Promise((resolve) => {
    window.require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.52.2/min/vs' } });
    window.require(['vs/editor/editor.main'], resolve);
  });
}
export function render(){ return `<div class="card-grid"><section class="card"><div class="action-row"><select id="codeLang"><option value="html">HTML</option><option value="javascript">JavaScript</option><option value="css">CSS</option><option value="json">JSON</option></select><input id="codeFilename" placeholder="nama-file.html" value="index.html" /><input id="codeFile" type="file" /><button class="btn primary" id="codeSaveBtn">Save</button><button class="btn ghost" id="codeFormatBtn">Format Basic</button></div><div id="monacoEditor"><div class="loader" style="padding:18px">Memuat Monaco Editor...</div></div></section></div>`; }
export async function init(){ try{ await loadMonaco(); editor = monaco.editor.create(document.getElementById('monacoEditor'), { value:'<h1>Hello Xu_Seo</h1>\n<p>Editor siap dipakai.</p>', language:'html', theme:'vs-dark', automaticLayout:true, minimap:{enabled:false}, fontSize:14, wordWrap:'on' }); notify('Code editor siap.'); } catch(err){ document.getElementById('monacoEditor').innerHTML = `<div class="info-box">Gagal memuat Monaco. Cek koneksi internet. ${err.message}</div>`; return; } $('#codeLang').addEventListener('change', e=>monaco.editor.setModelLanguage(editor.getModel(), e.target.value)); $('#codeSaveBtn').onclick=()=>downloadText($('#codeFilename').value || 'code.txt', editor.getValue()); $('#codeFormatBtn').onclick=()=>{ const val=editor.getValue().replace(/></g,'>\n<'); editor.setValue(val); }; $('#codeFile').addEventListener('change', e=>{ const f=e.target.files?.[0]; if(!f) return; $('#codeFilename').value=f.name; const r=new FileReader(); r.onload=()=>editor.setValue(r.result); r.readAsText(f); }); }
