export const groups = [
  { key:'home', label:'Home', items:['dashboard'] },
  { key:'amp', label:'AMP System', items:['ampmanager','templateengine'] },
  { key:'cdn', label:'CDN & Assets', items:['cdnmanager','uploader','filemanager'] },
  { key:'seo', label:'SEO Tools', items:['keyworddensity','domainchecker','scanner','seoxu','seo-expert'] },
  { key:'content', label:'Content Tools', items:['wordtohtml','wordcounter','notepad','htmlcleaner'] },
  { key:'mechanism', label:'Mechanism', items:['codeeditor','terminal','base64','phpobfuscator','calculator'] },
  { key:'ai', label:'AI Tools', items:['aitools'] },
  { key:'media', label:'Media', items:['mediaplayer'] },
  { key:'communication', label:'Communication', items:['minidiscord'] },
  { key:'settings', label:'Settings', items:['auth','settings'] }
];

export const tools = [
  { id:'dashboard', title:'Home', desc:'Ringkasan tools dan akses cepat.', icon:'🏠', roles:['owner','admin','user'] },
  { id:'ampmanager', title:'AMP Builder Pro', desc:'Membuat, preview, dan publish halaman AMP.', icon:'⚡', roles:['owner','admin'] },
  { id:'templateengine', title:'Template Engine Pro', desc:'Mengisi template, generate HTML, preview, dan publish.', icon:'🧩', roles:['owner'] },
  { id:'cdnmanager', title:'CDN Manager', desc:'Mengelola upload aset, URL CDN, preview, dan copy link.', icon:'🌐', roles:['owner','admin'] },
  { id:'uploader', title:'Uploader', desc:'Upload file dan membuat link, wget, curl, serta command Linux.', icon:'🚀', roles:['owner','admin','user'] },
  { id:'filemanager', title:'File Manager', desc:'Mengelola file, folder, URL, dan daftar upload.', icon:'📁', roles:['owner','admin','user'] },
  { id:'keyworddensity', title:'Keyword Density', desc:'Menghitung kepadatan keyword 1 sampai 4 kata.', icon:'📊', roles:['owner','admin','user'] },
  { id:'domainchecker', title:'Domain Checker', desc:'Mengecek metrik dasar domain, DNS, dan status akses.', icon:'🔎', roles:['owner','admin'] },
  { id:'scanner', title:'Scanner', desc:'Memindai pola mencurigakan pada teks atau source code.', icon:'🛡️', roles:['owner','admin'] },
  { id:'seoxu', title:'SEO-XU', desc:'Membuat checklist audit SEO dan shortcut pemeriksaan halaman.', icon:'🚦', roles:['owner','admin','user'] },
  { id:'seo-expert', title:'SEO Expert', desc:'Workspace SEO lanjutan untuk riset, audit, dan optimasi.', icon:'🚀', roles:['owner','admin'] },
  { id:'wordtohtml', title:'Word to HTML', desc:'Mengubah konten visual menjadi HTML bersih.', icon:'🔤', roles:['owner','admin','user'] },
  { id:'wordcounter', title:'Word Counter', desc:'Menghitung kata, karakter, kalimat, dan paragraf.', icon:'📝', roles:['owner','admin','user'] },
  { id:'notepad', title:'Notepad', desc:'Menyimpan catatan kerja cepat di browser.', icon:'📒', roles:['owner','admin','user'] },
  { id:'htmlcleaner', title:'HTML Cleaner', desc:'Membersihkan HTML dan merapikan output.', icon:'🧼', roles:['owner','admin','user'] },
  { id:'codeeditor', title:'Code Editor', desc:'Mengedit kode HTML, CSS, JavaScript, dan teks.', icon:'💻', roles:['owner','admin'] },
  { id:'terminal', title:'Terminal', desc:'Membuat command helper, slug, daftar tools, wget, dan curl.', icon:'⌨️', roles:['owner','admin','user'] },
  { id:'base64', title:'Base64', desc:'Encode dan decode teks atau file Base64.', icon:'🔐', roles:['owner','admin','user'] },
  { id:'phpobfuscator', title:'PHP Obfuscator', desc:'Menyamarkan source PHP untuk kebutuhan testing internal.', icon:'🧬', roles:['owner','admin'] },
  { id:'calculator', title:'Calculator', desc:'Menghitung operasi matematika dasar dengan input keyboard.', icon:'🧮', roles:['owner','admin','user'] },
  { id:'aitools', title:'AI Tools', desc:'Membuat ide konten, outline, CTA, rewrite, dan meta SEO.', icon:'🤖', roles:['owner','admin','user'] },
  { id:'mediaplayer', title:'Media Player', desc:'Membuka preview audio, video, dan gambar lokal.', icon:'🎬', roles:['owner','admin','user'] },
  { id:'minidiscord', title:'Mini Discord', desc:'Chat, DM, voice call, video call, dan group call.', icon:'💬', roles:['owner','admin','user'] },
  { id:'auth', title:'User & Access', desc:'Mengelola login, role, dan daftar pengguna.', icon:'🔐', roles:['owner','admin','user'] },
  { id:'settings', title:'Settings', desc:'Mengatur theme, konfigurasi GitHub, CDN, dan AMP.', icon:'⚙️', roles:['owner','admin','user'] }
];

export const toolMap = Object.fromEntries(tools.map(t => [t.id, t]));
