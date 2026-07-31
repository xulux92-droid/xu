
import { storage, notify } from './utils.js';
export const themes = [
  { id:'red-rainbow', name:'Red Rainbow', desc:'Merah + tombol pelangi' },
  { id:'sky-blue', name:'Sky Blue', desc:'Biru langit + hijau kuning' },
  { id:'green-tosca', name:'Green Tosca', desc:'Hijau tosca + biru merah' },
  { id:'golden-luxury', name:'Golden Luxury', desc:'Gold + silver neon putih' },
  { id:'dark-purple-cyber', name:'Dark Purple Cyber', desc:'Ungu gelap + pink cyan' }
];
export function applyTheme(themeId){
  const id = themes.find(t => t.id===themeId)?.id || 'red-rainbow';
  document.body.dataset.theme = id;
  storage.set('xu-theme', id);
  notify(`Theme aktif: ${themes.find(t => t.id===id)?.name}`);
}
export function currentTheme(){ return storage.get('xu-theme', 'red-rainbow'); }
