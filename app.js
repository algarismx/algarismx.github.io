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
function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }

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

// ===== I18N + LOADER + Now Playing label =====
function applyI18n(lang){
  const I18N = {
    en:{tbPlayer:'Player',tbPortfolio:'Portfolio',tbEtic:'ETIC',tbPro:'Professional',tbAbout:'About',tbContact:'Contact',
        titlePlayer:'Leitor',titlePortfolio:'Personal Portfolio',titleEtic:'ETIC',titlePro:'Professional',titleAbout:'About',titleContact:'Contact',
        btnPlay:'▶',btnPause:'❚❚',btnStop:'■', nowPlayingLabel:'Now playing:',
        portfolioHTML:'<div class="item"><strong>SoundCloud — algarismx</strong><br><span class="muted">Original tracks, mixes and sound experiments.</span></div><div class="item"><strong>Demos &amp; unreleased</strong><br><span class="muted">“Sempre Que Eu Quiser”, “Making Love”, “Gal”, “Boombap 101”, “Amen Dubplate Contest”, “Porque Eu”, “Paddy”, “Drum Pattern”, “Japanese Jungle”.</span></div><div class="item"><strong>Global Game Jam 2023 — <em>Hair We Go!</em></strong><br><span class="muted">SFX and OST (Main Theme, Secondary Menu, Menu).</span></div>',
        eticHTML:'<div class="item"><strong>ETIC Algarve — 2020–2023</strong><br><span class="muted">Projects in music production, foley, sound design and recording for video/games.</span></div><div class="item">Podcast — “J Dilla…”</div><div class="item">Mestre da Vida (short film)</div><div class="item">Foley — Cinema/Video</div><div class="item">Project “Lábia — Human Trafficking”</div><div class="item">Videogame Music Production</div><div class="item">Mastering</div><div class="item">Podcast — “Genesis of Sound”</div><div class="item">“Bankruptcy”</div><div class="item">LiveInsight Performance</div><div class="item">Erasmus+ — “Sampling Prague”</div>',
        proHTML:'<div class="item"><strong>ETIC Algarve — Diploma Delivery (2024)</strong><br><span class="muted">Continuous composition per course + specific SFX.</span></div><div class="item"><strong>Internal technical support</strong><br><span class="muted">Recordings with students and teachers; equipment maintenance and management.</span></div><div class="item"><strong>Short films and documentaries</strong><br><span class="muted">Sound direction, timecode sync and multi‑monitoring.</span></div>',
        aboutHTML:`<p>Hi! My name is Ricardo a.k.a downware and I'm 24 years old.</p><p>I am a music producer, sound designer and sound technician with a love for sampling and audio manipulation.</p><p>Since I was a kid, I have been interested in music, with my main influences being 80s and 90s Pop, Hip-Hop, and R&amp;B.</p><p>Currently, I produce Jungle, Drum&amp;Bass, Vaporwave, and Hip-Hop.</p><p>I primarily work with Ableton Live but also have experience working with Pro Tools.</p><p>I have a background in programming, but producing music has been a hobby of mine since I was 16. This hobby led me to pursue a course in Music Creation and Production Techniques at ETIC_Algarve in Faro, which turned me into a professional in the field of sound and music.</p><p>Towards the end of my course, I had an internship at the studio of music producer and DJ, Sickonce (Rafael Correia), in Portimão. During the internship, I had the opportunity to participate in various recording, editing, and post-production sessions for different artists.</p><p>I was fortunate to receive an Erasmus+ scholarship from ETIC_Algarve, which allowed me to intern for three months at Soundsgate, a company in Prague, Czech Republic. Among various projects, I highlight my role as a sound technician and assistant at the Composers Summit 2023 event.</p>`},
    pt:{tbPlayer:'Leitor',tbPortfolio:'Portfólio',tbEtic:'ETIC',tbPro:'Profissional',tbAbout:'Sobre',tbContact:'Contacto',
        titlePlayer:'Leitor',titlePortfolio:'Portfólio Pessoal',titleEtic:'ETIC',titlePro:'Profissional',titleAbout:'Sobre',titleContact:'Contacto',
        btnPlay:'▶',btnPause:'❚❚',btnStop:'■', nowPlayingLabel:'A tocar:',
        portfolioHTML:'<div class="item"><strong>SoundCloud — algarismx</strong><br><span class="muted">Faixas originais, mixes e experiências sonoras.</span></div><div class="item"><strong>Demos &amp; inéditas</strong><br><span class="muted">“Sempre Que Eu Quiser”, “Making Love”, “Gal”, “Boombap 101”, “Amen Dubplate Contest”, “Porque Eu”, “Paddy”, “Drum Pattern”, “Japanese Jungle”.</span></div><div class="item"><strong>Global Game Jam 2023 — <em>Hair We Go!</em></strong><br><span class="muted">SFX e OST (Tema Principal, Menu Secundário, Menu).</span></div>',
        eticHTML:'<div class="item"><strong>ETIC Algarve — 2020–2023</strong><br><span class="muted">Projetos em produção musical, foley, sound design e gravação para vídeo/jogos.</span></div><div class="item">Podcast — “J Dilla…”</div><div class="item">Mestre da Vida (curta-metragem)</div><div class="item">Foley — Cinema/Vídeo</div><div class="item">Projeto “Lábia — Tráfico Humano”</div><div class="item">Produção de Música para Jogos</div><div class="item">Masterização</div><div class="item">Podcast — “Génesis do Som”</div><div class="item">“Bankruptcy”</div><div class="item">LiveInsight Performance</div><div class="item">Erasmus+ — “Sampling Prague”</div>',
        aboutHTML:`<p>Olá! Sou o Ricardo, também conhecido como downware, e tenho 24 anos.</p><p>Sou produtor musical, sound designer e técnico de som, com paixão por sampling e manipulação de áudio.</p><p>Desde pequeno que me interesso por música; as minhas principais influências são o Pop, Hip-Hop e R&amp;B dos anos 80 e 90.</p><p>Atualmente produzo Jungle, Drum&amp;Bass, Vaporwave e Hip-Hop.</p><p>Trabalho principalmente com Ableton Live, mas também tenho experiência em Pro Tools.</p><p>Tenho background em programação, mas produzir música é um hobby desde os 16 anos. Esse hobby levou-me a tirar o curso de Técnicas de Criação e Produção Musical na ETIC_Algarve, em Faro, que me tornou profissional na área do som e da música.</p><p>No final do curso, estagiei no estúdio do produtor e DJ Sickonce (Rafael Correia), em Portimão. Durante o estágio, participei em várias sessões de gravação, edição e pós-produção para diferentes artistas.</p><p>Tive a felicidade de receber uma bolsa Erasmus+ da ETIC_Algarve, que me permitiu estagiar durante três meses na Soundsgate, em Praga (República Checa). Entre vários projetos, destaco o trabalho como técnico e assistente de som no evento Composers Summit 2023.</p>`}
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

  const pList=document.getElementById('portfolioList'); if(pList) pList.innerHTML=t.portfolioHTML;
  const eList=document.getElementById('eticList'); if(eList) eList.innerHTML=t.eticHTML;
  const proList=document.getElementById('proList'); if(proList) proList.innerHTML=t.proHTML;
  const aboutCopy=document.getElementById('aboutCopy'); if(aboutCopy) aboutCopy.innerHTML=t.aboutHTML;

  const npLabel = document.getElementById('npLabel'); if (npLabel) npLabel.textContent = t.nowPlayingLabel;
}
function startWithLanguage(lang){
  localStorage.setItem('lang', lang);
  applyI18n(lang);

  const p=document.getElementById('preloader'); 
  if(p){ p.style.opacity='0'; setTimeout(()=>p.remove(), 350); }

  // autoplay após loader
  try{
    ensureAudioGraph();
    if (ctx && ctx.state === 'suspended') ctx.resume();
    audio.play().then(()=>{
      setPlaying(true); showNowPlaying(true); updateNowPlaying();
      clearInterval(window.__np_timer);
      window.__np_timer = setInterval(pollNowPlaying, META_CFG.intervalMs);
      pollNowPlaying();
    }).catch(e=>console.warn('Autoplay blocked:', e));
  }catch(e){ console.warn('Autoplay error:', e); }
}
// cache: aplica tradução, mas mantém loader até escolha
const storedLang = localStorage.getItem('lang');
if (storedLang) { applyI18n(storedLang); const ls=document.getElementById('langSelect'); if (ls) ls.value = storedLang; }
const enBtn=document.getElementById('chooseEN'); const ptBtn=document.getElementById('choosePT');
if (enBtn && ptBtn){ enBtn.addEventListener('click', ()=> startWithLanguage('en')); ptBtn.addEventListener('click', ()=> startWithLanguage('pt')); }
const langSelect = document.getElementById('langSelect');
if (langSelect){
  langSelect.addEventListener('change', (e)=>{
    const lang = e.target.value === 'pt' ? 'pt' : 'en';
    localStorage.setItem('lang', lang);
    applyI18n(lang);
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
function tileWindows(){
  const open = visibleWindows();
  if (open.length <= 1) return;
  const pad = 8;
  const sb = getSafeBounds();
  const vw = window.innerWidth;
  const vh = sb.maxY - sb.minY;
  const cols = Math.min( Math.ceil(Math.sqrt(open.length)), 3 );
  const rows = Math.ceil(open.length / cols);
  const cellW = Math.max(320, Math.floor((vw - pad*(cols+1)) / cols));
  const cellH = Math.max(220, Math.floor((vh - pad*(rows+1)) / rows));
  open.forEach((w, idx)=>{
    const c = idx % cols, r = Math.floor(idx / cols);
    const left = pad + c*(cellW + pad);
    const top  = sb.minY + pad + r*(cellH + pad);
    w.style.left = clamp(left, sb.minX, sb.maxX - 200) + 'px';
    w.style.top  = clamp(top, sb.minY, sb.maxY - 140) + 'px';
    w.style.maxHeight = (sb.maxY - parseInt(w.style.top) - pad) + 'px';
  });
}
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
    });
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

// Tabs: toggle minimizar se já ativa
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
      tileWindows();
    }, 10);

    const tb = e.currentTarget;
    if (sel !== '#win-player') tb.classList.add('pulsing-static');

    // Fechar menu móvel ao escolher
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) { mobileMenu.setAttribute('aria-hidden','true'); const t = document.getElementById('tb-menu-top'); if (t) t.setAttribute('aria-expanded','false'); }
  });
});
window.addEventListener('resize', () => tileWindows());

// ===== Resize pelas handles (br & bl) =====
(function setupResize(){
  const minW = 320, minH = 200;
  let resizing = null;
  function onDown(e){
    const h = e.target.closest('.resize-handle');
    if (!h) return;
    const win = h.closest('.win');
    const mode = h.dataset.resize;
    const r = win.getBoundingClientRect();
    resizing = { win, mode, sx:e.clientX, sy:e.clientY, startW:r.width, startH:r.height, startL:r.left, startTop:r.top };
    e.preventDefault();
    document.body.classList.add('is-dragging');
    bringToFront(win);
  }
  function onMove(e){
    if (!resizing) return;
    const sb = getSafeBounds();
    const { win, mode, sx, sy, startW, startH, startL, startTop } = resizing;
    let newW = startW + (mode==='br' ? (e.clientX - sx) : -(e.clientX - sx));
    let newH = startH + (e.clientY - sy);
    newW = Math.max(minW, newW);
    newH = Math.max(minH, newH);
    const left = parseInt(getComputedStyle(win).left) || startL;
    const top  = parseInt(getComputedStyle(win).top) || startTop;
    newW = Math.min(newW, sb.maxX - left);
    newH = Math.min(newH, sb.maxY - top);
    win.style.width  = newW + 'px';
    win.style.height = newH + 'px';
    if (mode === 'bl'){
      const dx = (newW - startW);
      const nx = clamp(startL - dx, sb.minX, sb.maxX - newW);
      win.style.left = nx + 'px';
    }
  }
  function onUp(){ resizing=null; document.body.classList.remove('is-dragging'); }
  document.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
})();

// ===== PLAYER =====
const audio = new Audio('https://radio.plaza.one/mp3');
audio.crossOrigin = 'anonymous';
audio.preload = 'none';
audio.loop = false;
const player = document.getElementById('player');
const btnPlay = document.getElementById('btnPlay');
const btnPause = document.getElementById('btnPause');
const btnStop = document.getElementById('btnStop');
const btnMute = document.getElementById('btnMute');
const bars = ['b1','b2','b3','b4','b5'].map(id => document.getElementById(id));
const winPlayer = document.getElementById('win-player');
winPlayer.style.setProperty('--tint', 'transparent');

// NOW PLAYING (barra superior)
const npEl = document.getElementById('nowPlaying');
const npText = document.getElementById('npText');
if (npEl){
  npEl.addEventListener('click', (e) => {
    if (e.target && e.target.closest && e.target.closest('#npLink')) return;
    const btn = document.getElementById('tb-player');
    if (btn) btn.click();
  });
}
function updateNowPlaying(){
  let title = '', artist = '';
  if ('mediaSession' in navigator && navigator.mediaSession && navigator.mediaSession.metadata){
    const md = navigator.mediaSession.metadata;
    title  = md.title || '';
    artist = md.artist || '';
  }
  const line = (artist || title) ? [artist, title].filter(Boolean).join(' — ') : 'Radio — Live';
  if (npText) npText.textContent = line;
  const track = document.getElementById('trackTitle');
  if (track) track.textContent = line;
  const playerNpLabel = document.getElementById('playerNpLabel');
  const topLabel = document.getElementById('npLabel');
  if (playerNpLabel && topLabel) playerNpLabel.textContent = topLabel.textContent;
}
function showNowPlaying(show){
  if (!npEl) return;
  if (show) npEl.removeAttribute('hidden'); else npEl.setAttribute('hidden','');
}

// Meta (Icecast/Shoutcast)
const META_CFG = {
  candidates: [
    'https://radio.plaza.one/status-json.xsl',
    'https://radio.plaza.one/status.xsl',
    'https://radio.plaza.one/7?'
  ],
  intervalMs: 15000,
  corsProxy: ''
};
function withProxy(u){ return META_CFG.corsProxy ? META_CFG.corsProxy + encodeURIComponent(u) : u; }
async function fetchText(u){
  const res = await fetch(withProxy(u), { mode:'cors', cache:'no-store' });
  if (!res.ok) throw new Error('HTTP '+res.status);
  return res.text();
}
function formatNP(artist, title){
  if (artist && title) return `${artist} — ${title}`;
  return artist || title || 'Radio — Live';
}
async function fetchIcecastJSON(u){
  try{
    const txt = await fetchText(u);
    const json = JSON.parse(txt);
    const src = Array.isArray(json?.icestats?.source) ? json.icestats.source[0] : json?.icestats?.source;
    if (src){
      const artist = src.artist || '';
      const title  = src.title || src.server_name || '';
      return { artist, title, text: formatNP(artist, title) };
    }
  }catch(e){}
  return null;
}
async function fetchShoutcast7(u){
  try{
    const txt = (await fetchText(u)).trim();
    const line = txt.split('\n').pop() || '';
    const parts = line.split(',');
    const last = parts[parts.length-1] || '';
    if (last){
      const split = last.split(' - ');
      if (split.length >= 2){
        const artist = split.shift().trim();
        const title = split.join(' - ').trim();
        return { artist, title, text: formatNP(artist, title) };
      }
      return { text: last.trim() };
    }
  }catch(e){}
  return null;
}
async function pollNowPlaying(){
  for (const c of META_CFG.candidates){
    let np = null;
    if (c.endsWith('/7?')) np = await fetchShoutcast7(c);
    else if (c.includes('status-json.xsl')) np = await fetchIcecastJSON(c);
    if (np && (np.artist || np.title || np.text)){
      const line = np.text || formatNP(np.artist, np.title);
      if (npText) npText.textContent = line;
      const track = document.getElementById('trackTitle');
      if (track) track.textContent = line;
      return;
    }
  }
  if ('mediaSession' in navigator && navigator.mediaSession && navigator.mediaSession.metadata){
    const md = navigator.mediaSession.metadata;
    const text = formatNP(md.artist, md.title);
    if (npText) npText.textContent = text;
    const track = document.getElementById('trackTitle');
    if (track) track.textContent = text;
  }
}

// Web Audio + Visualizer
let ctx = null, src = null, analyser = null, data = null;
let vuRAF = 0;
function ensureAudioGraph() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  ctx = new AC();
  src = ctx.createMediaElementSource(audio);
  analyser = ctx.createAnalyser();
  analyser.fftSize = 256;            // mais responsivo
  data = new Uint8Array(analyser.frequencyBinCount);
  src.connect(analyser);
  analyser.connect(ctx.destination);
  window.appAnalyser = analyser;
  if (window.WavesController && window.WavesController.attachAnalyser) {
    window.WavesController.attachAnalyser(analyser);
  }
}
function vuLoop(){
  if (!analyser) return;
  analyser.getByteFrequencyData(data);
  const bands = [0, 2, 6, 12, 24, data.length-1];
  for (let i=0;i<5;i++){
    let s=0,c=0;
    for (let j=bands[i]; j<bands[i+1]; j++){ s+=data[j]; c++; }
    const v = c? (s/c)/255 : 0;
    const el = document.getElementById(['b1','b2','b3','b4','b5'][i]);
    if (el) el.style.setProperty('--l', String(v.toFixed(3)));
  }
  vuRAF = requestAnimationFrame(vuLoop);
}
function setPlaying(p) { 
  player.classList.toggle('playing', p); 
  if (p){ if (!vuRAF) vuLoop(); }
  else { if (vuRAF) cancelAnimationFrame(vuRAF); vuRAF=0; }
}

// Controlo do leitor
btnPlay.addEventListener('click', async () => {
  try {
    ensureAudioGraph();
    if (ctx.state === 'suspended') await ctx.resume();
    await audio.play();
    setPlaying(true);
    showNowPlaying(true);
    updateNowPlaying();
    clearInterval(window.__np_timer);
    window.__np_timer = setInterval(pollNowPlaying, META_CFG.intervalMs);
    pollNowPlaying();
  } catch (e) { console.warn(e); }
});
btnPause.addEventListener('click', () => { audio.pause(); setPlaying(false); /* mantém texto */ });
btnStop.addEventListener('click', () => {
  audio.pause();
  audio.currentTime = 0;
  setPlaying(false);
});

if (btnMute){
  btnMute.addEventListener('click', ()=>{
    audio.muted = !audio.muted;
    if (audio.muted){
      btnMute.textContent = '🔇';
      btnMute.classList.remove('speaker-on');
      btnMute.classList.add('speaker-off');
    } else {
      btnMute.textContent = '🔊';
      btnMute.classList.remove('speaker-off');
      btnMute.classList.add('speaker-on');
    }
  });
}

// Sem fader de volume: volume a 100% por defeito
audio.volume = 1;

// Clock
(function clockTick(){
  const el = document.getElementById('taskClock');
  if (el){
    const d = new Date();
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    el.textContent = `${hh}:${mm}`;
  }
  setTimeout(clockTick, 15000);
})();

// ===== TOP HAMBURGER (tabs colapsadas) =====
const tbMenuTop = document.getElementById('tb-menu-top');
const mobileMenu = document.getElementById('mobileMenu');
if (tbMenuTop && mobileMenu){
  tbMenuTop.addEventListener('click', ()=>{
    const open = mobileMenu.getAttribute('aria-hidden') === 'false';
    mobileMenu.setAttribute('aria-hidden', open ? 'true' : 'false');
    tbMenuTop.setAttribute('aria-expanded', open ? 'false' : 'true');
  });
}

// ===== WAVES on load =====
window.addEventListener('load', () => {
  wavesMountForTheme();
});