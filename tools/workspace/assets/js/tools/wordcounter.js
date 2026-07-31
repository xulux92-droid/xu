
import { $, debounce } from '../core/utils.js';
function calc(){ const text = $('#wcText').value; const trimmed=text.trim(); const words=trimmed?trimmed.split(/\s+/).length:0; const chars=text.length; const paragraphs=trimmed?text.split(/\n\s*\n|\n/).filter(Boolean).length:0; const read=Math.ceil(words/3.3)||0; $('#wcStats').innerHTML=`<div class="stat-card"><span>Kata</span><strong>${words}</strong></div><div class="stat-card"><span>Karakter</span><strong>${chars}</strong></div><div class="stat-card"><span>Paragraf</span><strong>${paragraphs}</strong></div><div class="stat-card"><span>Baca</span><strong>${read} dtk</strong></div>`; }
export function render(){ return `<div class="card-grid"><section class="card"><textarea id="wcText" placeholder="Tempel teks di sini..."></textarea><div class="stat-grid" id="wcStats"></div></section></div>`; }
export function init(){ const run=debounce(calc,120); $('#wcText').addEventListener('input',run); calc(); }
