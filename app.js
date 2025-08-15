// ===== Helpers / DOM =====
const wins = Array.from(document.querySelectorAll('.win'));
function randHue() { return Math.floor(Math.random() * 360); }
function buttonForWindow(win) { return document.querySelector(`[data-open="#${win.id}"]`); }
const windowHues = new Map();
wins.forEach((w) => {
  const h = randHue();
  windowHues.set(w.id, h);
  w.style.setProperty('--tint', 'transparent');
  const tb = buttonForWindow(w);
  if (tb) tb.style.setProperty('--hue', String(h));
});

// ===== Safe bounds (não invadir taskbars nem sair do ecrã) =====
function pxVar(name){
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return parseInt(v.replace('px','')) || 0;
}
function getSafeBounds(){
  const pad = 8;
  const top = pxVar('--topbar-h') + 6;
  const bottom = pxVar('--bottombar-h') + 6;
  const minX = pad, minY = top + pad;
  const maxX = window.innerWidth - pad;
  const maxY = window.innerHeight - bottom - pad;
  return { minX, minY, maxX, maxY };
}
function getSafeSize(){
  const sb = getSafeBounds();
  return { safeW: sb.maxX - sb.minX, safeH: sb.maxY - sb.minY };
}
function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }

// Ajusta tamanho e posição para não ultrapassar as taskbars
function fitAndClamp(win){
  const sb = getSafeBounds();
  const { safeW, safeH } = getSafeSize();
  const pad = 8;

  const maxW = Math.max(320, safeW - pad*2);
  const maxH = Math.max(220, safeH - pad*2);

  const curW = win.offsetWidth || maxW;
  const curH = win.offsetHeight || maxH;
  if (curW > maxW) win.style.width  = maxW + 'px';
  if (curH > maxH) win.style.height = maxH + 'px';

  const ww = win.offsetWidth;
  const wh = win.offsetHeight;

  const left = parseInt(getComputedStyle(win).left) || 0;
  const top  = parseInt(getComputedStyle(win).top)  || 0;
  const nx = clamp(left, sb.minX, Math.max(sb.minX, sb.maxX - ww));
  const ny = clamp(top,  sb.minY, Math.max(sb.minY, sb.maxY - wh));
  win.style.left = nx + 'px';
  win.style.top  = ny + 'px';

  win.style.maxHeight = (sb.maxY - ny - pad) + 'px';
}

function centerWindow(win){
  const sb = getSafeBounds();
  const ww = win.offsetWidth, wh = win.offsetHeight;
  const nx = Math.max(sb.minX, Math.round((window.innerWidth - ww)/2));
  const ny = Math.max(sb.minY, Math.round((sb.maxY - sb.minY - wh)/2) + sb.minY);
  win.style.left = nx + 'px';
  win.style.top  = ny + 'px';
  fitAndClamp(win);
}

// ===== THEME + WAVES =====
function wavesMountForTheme(){
  if (!window.WavesController) return;
  const isModern = document.body.classList.contains('theme-modern');
  const mounted = !!window.WavesController._state;
  if (mounted) window.WavesController.unmount();
  window.WavesController.mount({
    backgroundColor: 'transparent',
    lineColor: isModern ? '#ffffff' : '#000000',
    pixelate: !isModern,
    pixelSize: !isModern ? 6 : 1,
    waveAmpX: isModern ? 40 : 28,
    waveAmpY: isModern ? 20 : 16
  });
  if (window.appAnalyser) window.WavesController.attachAnalyser(window.appAnalyser);
}
function applyTheme(theme){
  if (theme === 'modern') document.body.classList.add('theme-modern');
  else document.body.classList.remove('theme-modern');
  localStorage.setItem('theme', theme);
  const sel = document.getElementById('themeSelect'); if (sel) sel.value = theme;
  wavesMountForTheme();
}
const storedTheme = localStorage.getItem('theme') || 'modern';
applyTheme(storedTheme);
const themeSelect = document.getElementById('themeSelect');
if (themeSelect){
  themeSelect.addEventListener('change', (e)=>{
    const v = e.target.value === 'win98' ? 'win98' : 'modern';
    applyTheme(v);
  });
}

// ===== TEXTOS: carregar e injetar a partir de textos.txt =====
let TEXTS = {}; // { "about.pt": "...", "about.en": "...", ... }

async function loadTextDB(){
  const res = await fetch('textos.txt', { cache: 'no-store' });
  if (!res.ok) throw new Error('textos.txt not found');
  const raw = await res.text();
  TEXTS = parseTextDB(raw);
}

function parseTextDB(raw){
  const out = {};
  let cur = null, buf = [];
  const lines = raw.replace(/\r\n?/g, '\n').split('\n');
  function flush(){
    if (cur){ out[cur] = buf.join('\n').trim(); }
    buf = [];
  }
  for (let line of lines){
    if (/^\s*[;#]/.test(line)) continue;
    const m = line.match(/^\s*\[([^\]]+)\]\s*$/);
    if (m){ flush(); cur = m[1].trim(); if (!(cur in out)) out[cur] = ''; continue; }
    if (cur) buf.push(line);
  }
  flush();
  return out;
}

function escapeHTML(s){
  return s.replace(/[&<>"']/g, ch =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function toParagraphs(text){
  const t = (text || '').trim();
  if (!t) return '';
  const parts = t.split(/\n\s*\n/);
  return parts.map(p => `<p>${escapeHTML(p).replace(/\n/g,'<br>')}</p>`).join('\n');
}
function setHTML(id, html){
  const el = document.getElementById(id);
  if (el) el.innerHTML = html || '';
}

// ===== I18N (rótulos UI) =====
function applyI18nLabels(lang){
  const I18N = {
    en:{tbPlayer:'Player',tbPortfolio:'Portfolio',tbEtic:'ETIC',tbPro:'Professional',tbAbout:'About',tbContact:'Contact',
        titlePlayer:'Leitor',titlePortfolio:'Personal Portfolio',titleEtic:'ETIC',titlePro:'Professional',titleAbout:'About',titleContact:'Contact',
        btnPlay:'▶',btnPause:'❚❚',btnStop:'■', nowPlayingLabel:'Now playing:'},
    pt:{tbPlayer:'Leitor',tbPortfolio:'Portfólio',tbEtic:'ETIC',tbPro:'Profissional',tbAbout:'Sobre',tbContact:'Contacto',
        titlePlayer:'Leitor',titlePortfolio:'Portfólio Pessoal',titleEtic:'ETIC',titlePro:'Profissional',titleAbout:'Sobre',titleContact:'Contacto',
        btnPlay:'▶',btnPause:'❚❚',btnStop:'■', nowPlayingLabel:'A tocar:'}
  };
  const t = I18N[lang] || I18N.en;

  document.documentElement.setAttribute('lang', lang === 'pt' ? 'pt-PT' : 'en');
  const ls = document.getElementById('langSelect'); if (ls) ls.value = lang;

  const mapIds = ['titlePlayer','titlePortfolio','titleEtic','titlePro','titleAbout','titleContact','btnPlay','btnPause','btnStop'];
  mapIds.forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent = t[id]; });

  const tbMap = [['tb-player','tbPlayer'],['tb-portfolio','tbPortfolio'],['tb-etic','tbEtic'],['tb-pro','tbPro'],['tb-about','tbAbout'],['tb-contact','tbContact']];
  tbMap.forEach(([id,key])=>{
    const el=document.getElementById(id); if(el) el.textContent=t[key];
    const menuBtn=document.querySelector(`#mobileMenu [data-open="#${id.replace('tb-','win-')}"]`);
    if(menuBtn) menuBtn.textContent=t[key];
  });

  const npLabel = document.getElementById('npLabel'); if (npLabel) npLabel.textContent = t.nowPlayingLabel;
}

// ===== Injetar textos carregados para a UI =====
function injectTextsFor(lang){
  const aboutKey = `about.${lang}`;
  setHTML('aboutCopy', toParagraphs(TEXTS[aboutKey]));
  const portKey = `portfolio.${lang}`;
  const eticKey = `etic.${lang}`;
  const proKey  = `professional.${lang}`;
  const contKey = `contact.${lang}`;
  setHTML('portfolioList', toParagraphs(TEXTS[portKey]));
  setHTML('eticList',      toParagraphs(TEXTS[eticKey]));
  setHTML('proList',       toParagraphs(TEXTS[proKey]));
  const contactEl = document.querySelector('#win-contact .content');
  if (contactEl && TEXTS[contKey]) contactEl.innerHTML = toParagraphs(TEXTS[contKey]);
}

// ===== LOADER & idioma =====
async function startWithLanguage(lang){
  localStorage.setItem('lang', lang);
  try{ await loadTextDB(); } catch(e){ console.error('Falha a carregar textos.txt', e); }
  applyI18nLabels(lang);
  injectTextsFor(lang);
  const p=document.getElementById('preloader'); 
  if(p){ p.style.opacity='0'; setTimeout(()=>p.remove(), 350); }
  try{
    ensureAudioGraph();
    if (ctx && ctx.state === 'suspended') ctx.resume();
    startPlaylist();
  }catch(e){ console.warn('Autoplay error:', e); }
  const about = document.getElementById('win-about');
  if (about){
    about.classList.remove('hidden');
    bringToFront(about);
    setTimeout(()=>centerWindow(about), 10);
  }
}

// cache inicial + listeners do loader
const storedLang = localStorage.getItem('lang');
if (storedLang) {
  applyI18nLabels(storedLang);
  loadTextDB().then(()=> injectTextsFor(storedLang)).catch(()=>{});
  const ls=document.getElementById('langSelect'); if (ls) ls.value = storedLang;
}
const enBtn=document.getElementById('chooseEN'); 
const ptBtn=document.getElementById('choosePT');
if (enBtn && ptBtn){ 
  enBtn.addEventListener('click', ()=> startWithLanguage('en')); 
  ptBtn.addEventListener('click', ()=> startWithLanguage('pt')); 
}
const langSelect = document.getElementById('langSelect');
if (langSelect){
  langSelect.addEventListener('change', async (e)=>{
    const lang = e.target.value === 'pt' ? 'pt' : 'en';
    localStorage.setItem('lang', lang);
    if (!TEXTS || !Object.keys(TEXTS).length){
      try{ await loadTextDB(); }catch(_){}
    }
    applyI18nLabels(lang);
    injectTextsFor(lang);
  });
}

// ===== Window manager =====
let zTop = 100;
function bringToFront(win) {
  document.querySelectorAll('.win').forEach(w => w.classList.remove('active'));
  win.classList.add('active');
  win.style.zIndex = String(++zTop);
}
function visibleWindows(){ return wins.filter(w => !w.classList.contains('hidden')); }

// tiling: ignora o leitor para não alterar o tamanho fixo
function tileWindows(){
  const all = visibleWindows();
  const place = all.filter(w => w.id !== 'win-player');
  if (place.length <= 1) return;

  const pad = 8;
  const sb = getSafeBounds();
  const vw = window.innerWidth;
  const vh = sb.maxY - sb.minY;

  const cols = Math.min( Math.ceil(Math.sqrt(place.length)), 3 );
  const rows = Math.ceil(place.length / cols);

  const cellW = Math.max(320, Math.floor((vw - pad*(cols+1)) / cols));
  const cellH = Math.max(220, Math.floor((vh - pad*(rows+1)) / rows));

  place.forEach((w, idx)=>{
    const c = idx % cols, r = Math.floor(idx / cols);
    const left = pad + c*(cellW + pad);
    const top  = sb.minY + pad + r*(cellH + pad);
    w.style.left = clamp(left, sb.minX, sb.maxX - 200) + 'px';
    w.style.top  = clamp(top, sb.minY, sb.maxY - 140) + 'px';
    w.style.width  = cellW + 'px';
    w.style.height = cellH + 'px';
    w.style.maxHeight = (sb.maxY - parseInt(w.style.top) - pad) + 'px';
  });
}

// garantir limites logo no arranque
wins.forEach(w => fitAndClamp(w));

wins.forEach((win) => {
  win.addEventListener('mousedown', () => bringToFront(win));
  const tb = win.querySelector('[data-drag]');
  if (tb) {
    let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
    tb.addEventListener('mousedown', (e) => {
      dragging = true;
      document.body.classList.add('is-dragging');
      bringToFront(win);
      sx = e.clientX; sy = e.clientY;
      const r = win.getBoundingClientRect(); ox = r.left; oy = r.top;
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      const sb = getSafeBounds();
      const ww = win.offsetWidth, wh = win.offsetHeight;
      let nx = ox + dx, ny = oy + dy;
      nx = clamp(nx, sb.minX, sb.maxX - ww);
      ny = clamp(ny, sb.minY, sb.maxY - wh);
      win.style.left = nx + 'px'; win.style.top = ny + 'px';
      window.getSelection()?.removeAllRanges?.();
      e.preventDefault();
    }, { passive:false });
    window.addEventListener('mouseup', () => { dragging = false; document.body.classList.remove('is-dragging'); });
  }
  win.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sel = btn.getAttribute('data-close');
      const targetWin = document.querySelector(sel);
      if (targetWin) { targetWin.classList.add('hidden'); targetWin.style.setProperty('--tint', 'transparent'); }
      const tb = document.querySelector(`[data-open="#${win.id}"]`);
      if (tb) tb.classList.remove('pulsing-static');
      tileWindows();
    });
  });
  win.querySelectorAll('[data-minimize]').forEach(btn => {
    btn.addEventListener('click', () => {
      const isHidden = win.classList.contains('hidden');
      win.classList.toggle('hidden');
      if (isHidden) {
        setTimeout(() => {
          const hue = windowHues.get(win.id);
          if (hue !== undefined) win.style.setProperty('--tint', `oklch(0.72 0.12 ${hue})`);
          fitAndClamp(win);
        }, 10);
      } else {
        win.style.setProperty('--tint', 'transparent');
      }
      const tb = document.querySelector(`[data-open="#${win.id}"]`);
      if (tb) { if (win.classList.contains('hidden')) tb.classList.remove('pulsing-static'); else tb.classList.add('pulsing-static'); }
      tileWindows();
    });
  });
});

// Tabs + hambúrguer
document.querySelectorAll('[data-open]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const sel = e.currentTarget.getAttribute('data-open');
    const w = document.querySelector(sel);
    if (!w) return;
    const wasHidden = w.classList.contains('hidden');
    const wasActive = w.classList.contains('active');

    if (!wasHidden && wasActive) {
      w.classList.add('hidden');
      w.style.setProperty('--tint','transparent');
      const tb = e.currentTarget; if (tb) tb.classList.remove('pulsing-static');
      tileWindows();
      return;
    }

    w.classList.remove('hidden');
    bringToFront(w);
    setTimeout(() => {
      const hue = windowHues.get(w.id);
      if (hue !== undefined) w.style.setProperty('--tint', `oklch(0.72 0.12 ${hue})`);
      fitAndClamp(w);
      tileWindows();
    }, 10);

    const tb = e.currentTarget;
    if (sel !== '#win-player') tb.classList.add('pulsing-static');

    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) { mobileMenu.setAttribute('aria-hidden','true'); const t = document.getElementById('tb-menu-top'); if (t) t.setAttribute('aria-expanded','false'); }
  });
});
const tbMenuTop = document.getElementById('tb-menu-top');
if (tbMenuTop) {
  tbMenuTop.addEventListener('click', () => {
    const m = document.getElementById('mobileMenu');
    const expanded = tbMenuTop.getAttribute('aria-expanded') === 'true';
    tbMenuTop.setAttribute('aria-expanded', String(!expanded));
    if (m) m.setAttribute('aria-hidden', expanded ? 'true' : 'false');
  });
}
window.addEventListener('resize', () => {
  wins.forEach(w => fitAndClamp(w));
  tileWindows();
});

// ===== Resize apenas no canto inferior direito (br) =====
(function setupResize(){
  const minW = 320, minH = 220;
  let resizing = null;
  function onDown(e){
    const h = e.target.closest('.resize-handle.br');
    if (!h) return;
    e.preventDefault(); e.stopPropagation();
    const win = h.closest('.win');
    const r = win.getBoundingClientRect();
    resizing = { win, sx:e.clientX, sy:e.clientY, startW:r.width, startH:r.height };
    document.body.classList.add('is-resizing');
    bringToFront(win);
  }
  function onMove(e){
    if (!resizing) return;
    e.preventDefault();
    const sb = getSafeBounds();
    const { win, sx, sy, startW, startH } = resizing;
    let newW = startW + (e.clientX - sx);
    let newH = startH + (e.clientY - sy);
    newW = Math.max(minW, newW);
    newH = Math.max(minH, newH);
    const left = parseInt(getComputedStyle(win).left) || 0;
    const top  = parseInt(getComputedStyle(win).top) || 0;
    newW = Math.min(newW, sb.maxX - left);
    newH = Math.min(newH, sb.maxY - top);
    win.style.width  = newW + 'px';
    win.style.height = newH + 'px';
    win.style.maxHeight = (sb.maxY - top - 8) + 'px';
    window.getSelection()?.removeAllRanges?.();
  }
  function onUp(){ resizing=null; document.body.classList.remove('is-resizing'); }
  document.addEventListener('mousedown', onDown, { passive:false });
  window.addEventListener('mousemove', onMove, { passive:false });
  window.addEventListener('mouseup', onUp, { passive:false });
})();

// ===== PLAYER via playlist.txt =====
const PLAYLIST_TXT = 'playlist.txt';
const audio = new Audio();
audio.crossOrigin = 'anonymous';
audio.preload = 'metadata';
audio.loop = false;

const player = document.getElementById('player');
const btnPlay = document.getElementById('btnPlay');
const btnPause = document.getElementById('btnPause');
const btnStop = document.getElementById('btnStop');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const btnMute = document.getElementById('btnMute');
const seek = document.getElementById('seek');
const curTimeEl = document.getElementById('curTime');
const durTimeEl = document.getElementById('durTime');

const bars = ['b1','b2','b3','b4','b5'].map(id => document.getElementById(id));
const winPlayer = document.getElementById('win-player');
winPlayer.style.setProperty('--tint', 'transparent');

// NOW PLAYING (barra superior)
const npEl = document.getElementById('nowPlaying');
const npText = document.getElementById('npText');
function showNowPlaying(show){
  if (!npEl) return;
  if (show) npEl.removeAttribute('hidden'); else npEl.setAttribute('hidden','');
}
if (npEl){
  npEl.addEventListener('click', () => {
    const btn = document.getElementById('tb-player');
    if (btn) btn.click();
  });
}
function setPlayerNpLabel(){
  const playerNpLabel = document.getElementById('playerNpLabel');
  const topLabel = document.getElementById('npLabel');
  if (playerNpLabel && topLabel) playerNpLabel.textContent = topLabel.textContent;
}
function setTrackText(line){
  const el = document.getElementById('trackTitle');
  if (el) el.textContent = line;
}
function inferArtistTitleFromURL(u){
  try{
    const last = decodeURIComponent(new URL(u).pathname.split('/').pop() || '');
    const base = last.replace(/\.(mp3|ogg|m4a|wav)$/i,'').replace(/[_]+/g,' ').trim();
    const parts = base.split(/\s[-—]\s/);
    if (parts.length >= 2){
      const artist = parts.shift().trim();
      const title  = parts.join(' - ').trim();
      return { artist, title, text: `${artist} — ${title}` };
    }
    return { artist:'', title:base, text: base };
  }catch(_){
    return { artist:'', title:'Audio', text:'Audio' };
  }
}
function updateNowPlayingFromURL(u){
  const meta = inferArtistTitleFromURL(u);
  if (npText) npText.textContent = meta.text;
  setTrackText(meta.text);
  setPlayerNpLabel();
  if ('mediaSession' in navigator && navigator.mediaSession){
    navigator.mediaSession.metadata = new MediaMetadata({ title: meta.title || meta.text, artist: meta.artist || 'algarismx', album: 'algarismx', artwork: [] });
  }
  showNowPlaying(true);
}

// Playlist handling
let playlist = [];
let playIdx = 0;

function shuffleArray(arr){ for (let i = arr.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
async function loadPlaylistTxt(){
  const res = await fetch(PLAYLIST_TXT, { cache:'no-store' });
  if (!res.ok) throw new Error('playlist.txt not found');
  const txt = await res.text();
  const lines = txt.split(/\r?\n/).map(s=>s.trim()).filter(s => s && !s.startsWith('#'));
  playlist = shuffleArray(lines);
  playIdx = 0;
}
async function startPlaylist(){
  try{
    await loadPlaylistTxt();
    if (!playlist.length) throw new Error('empty playlist');
    await playCurrent();
  }catch(e){
    console.error('Playlist error:', e);
    alert('Não foi possível carregar a playlist.\nConfirma o ficheiro playlist.txt na raiz (um link por linha).');
  }
}
async function playCurrent(){
  const url = playlist[playIdx % playlist.length];
  audio.src = url;
  ensureAudioGraph();
  if (ctx && ctx.state === 'suspended') await ctx.resume();
  try{
    await audio.play();
    setPlaying(true);
    updateNowPlayingFromURL(url);
  }catch(err){
    console.warn('play failed', err);
  }
}
function nextTrack(){
  if (!playlist.length) return;
  playIdx = (playIdx + 1) % playlist.length;
  playCurrent();
}
function prevTrack(){
  if (!playlist.length) return;
  if (audio.currentTime > 5){
    audio.currentTime = 0;
    return;
  }
  playIdx = (playIdx - 1 + playlist.length) % playlist.length;
  playCurrent();
}
audio.addEventListener('ended', nextTrack);
audio.addEventListener('play', ()=> showNowPlaying(true));
audio.addEventListener('pause', ()=> showNowPlaying(false));

// Time / seek
function fmtTime(sec){
  if (!isFinite(sec)) return '0:00';
  const s = Math.floor(sec % 60).toString().padStart(2,'0');
  const m = Math.floor(sec / 60);
  return `${m}:${s}`;
}
audio.addEventListener('loadedmetadata', ()=>{
  durTimeEl.textContent = fmtTime(audio.duration);
  const mx = isFinite(audio.duration) && audio.duration > 0 ? Math.floor(audio.duration*1000) : 1000;
  seek.max = Math.max(1, mx);
});
audio.addEventListener('timeupdate', ()=>{
  curTimeEl.textContent = fmtTime(audio.currentTime);
  if (isFinite(audio.duration) && audio.duration > 0){
    seek.value = String(Math.floor((audio.currentTime / audio.duration) * seek.max));
  }
});
seek.addEventListener('input', ()=>{
  if (isFinite(audio.duration) && audio.duration > 0){
    const frac = Number(seek.value) / Number(seek.max);
    audio.currentTime = frac * audio.duration;
  }
});

// Web Audio + Visualizer (VU) + Waves analyser
let ctx = null, src = null, analyser = null, data = null;
let vuRAF = 0;
function ensureAudioGraph() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  ctx = new AC();
  src = ctx.createMediaElementSource(audio);
  analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  data = new Uint8Array(analyser.frequencyBinCount);
  src.connect(analyser);
  analyser.connect(ctx.destination);
  window.appAnalyser = analyser;
  if (window.WavesController && window.WavesController.attachAnalyser) window.WavesController.attachAnalyser(analyser);
  function vu(){
    if (!analyser) return;
    analyser.getByteFrequencyData(data);
    let avg = 0; for (let i=0;i<data.length;i++) avg += data[i]; avg/=data.length;
    const level = Math.min(1, avg/255);
    bars.forEach((b,i)=>{ if(b) b.style.setProperty('--l', String(level * (0.6 + 0.4*i/4))); });
    vuRAF = requestAnimationFrame(vu);
  }
  vu();
}
function setPlaying(p) { player.classList.toggle('playing', p); }

// Controlo do leitor
const btnPlayEl  = document.getElementById('btnPlay');
const btnPauseEl = document.getElementById('btnPause');
const btnStopEl  = document.getElementById('btnStop');
btnPlayEl?.addEventListener('click', async () => {
  if (audio.src) {
    try { await audio.play(); setPlaying(true); } catch(_) {}
  } else {
    startPlaylist();
  }
});
btnPauseEl?.addEventListener('click', () => { audio.pause(); setPlaying(false); });
btnStopEl?.addEventListener('click', () => { 
  audio.pause(); 
  audio.currentTime = 0; 
  setPlaying(false); 
  showNowPlaying(false);
});
btnPrev?.addEventListener('click', prevTrack);
btnNext?.addEventListener('click', nextTrack);
btnMute?.addEventListener('click', () => {
  audio.muted = !audio.muted;
  btnMute.classList.toggle('speaker-on', !audio.muted);
  btnMute.classList.toggle('speaker-off', audio.muted);
  btnMute.textContent = audio.muted ? '🔈' : '🔊';
});

// Media Session actions
if ('mediaSession' in navigator){
  try{
    navigator.mediaSession.setActionHandler('play', ()=>btnPlayEl?.click());
    navigator.mediaSession.setActionHandler('pause', ()=>btnPauseEl?.click());
    navigator.mediaSession.setActionHandler('stop', ()=>btnStopEl?.click());
    navigator.mediaSession.setActionHandler('previoustrack', ()=>btnPrev?.click());
    navigator.mediaSession.setActionHandler('nexttrack', ()=>btnNext?.click());
    navigator.mediaSession.setActionHandler('seekto', (d)=>{
      if (d.seekTime != null) audio.currentTime = d.seekTime;
    });
  }catch(_){}
}

// Clock simples
(function clock(){
  const el = document.getElementById('taskClock');
  function tick(){ if(!el) return; const d=new Date(); const s=d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); el.textContent=s; }
  tick(); setInterval(tick, 10000);
})();

// Atalhos de teclado
(function kbd(){
  document.addEventListener('keydown', (e)=>{
    if (e.code === 'Space'){ e.preventDefault(); if (audio.paused) btnPlayEl?.click(); else btnPauseEl?.click(); }
    const meta = e.metaKey || e.ctrlKey;
    if (meta && e.key === 'ArrowLeft'){ e.preventDefault(); document.getElementById('btnPrev')?.click(); }
    if (meta && e.key === 'ArrowRight'){ e.preventDefault(); document.getElementById('btnNext')?.click(); }
    if (e.key.toLowerCase() === 'm'){ const t=document.getElementById('tb-menu-top'); if (t) t.click(); }
    if (e.key === 'Escape'){ const act=document.querySelector('.win.active .ctl[data-close]'); act?.dispatchEvent(new Event('click')); }
  });
})();

// Montar waves no arranque inicial
wavesMountForTheme();