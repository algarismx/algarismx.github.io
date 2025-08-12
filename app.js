// Elements
const wins = Array.from(document.querySelectorAll('.win'));
function randHue() { return Math.floor(Math.random() * 360); }
function buttonForWindow(win) { return document.querySelector(`[data-open="#${win.id}"]`); }

// Hues per window
const windowHues = new Map();
// Seed hues and task buttons, init tint transparent
wins.forEach((w) => {
  const h = randHue();
  windowHues.set(w.id, h);
  w.style.setProperty('--tint', 'transparent');
  const tb = buttonForWindow(w);
  if (tb) tb.style.setProperty('--hue', String(h));
});

// -------- Preloader + Idioma (fica até escolher) --------
function applyI18n(lang){
  const I18N = {
    en:{tbPlayer:'Player',tbPortfolio:'Portfolio',tbEtic:'ETIC',tbPro:'Professional',tbAbout:'About',tbContact:'Contact',
        titlePlayer:'Winamp — plaza.one radio',titlePortfolio:'Personal Portfolio',titleEtic:'ETIC',titlePro:'Professional',titleAbout:'About',titleContact:'Contact',
        btnPlay:'Play',btnPause:'Pause',btnStop:'Stop',
        portfolioHTML:'<div class="item"><strong>SoundCloud — algarismx</strong><br><span class="muted">Original tracks, mixes and sound experiments.</span></div><div class="item"><strong>Demos &amp; unreleased</strong><br><span class="muted">“Sempre Que Eu Quiser”, “Making Love”, “Gal”, “Boombap 101”, “Amen Dubplate Contest”, “Porque Eu”, “Paddy”, “Drum Pattern”, “Japanese Jungle”.</span></div><div class="item"><strong>Global Game Jam 2023 — <em>Hair We Go!</em></strong><br><span class="muted">SFX and OST (Main Theme, Secondary Menu, Menu).</span></div>',
        eticHTML:'<div class="item"><strong>ETIC Algarve — 2020–2023</strong><br><span class="muted">Projects in music production, foley, sound design and recording for video/games.</span></div><div class="item">Podcast — “J Dilla…”</div><div class="item">Mestre da Vida (short film)</div><div class="item">Foley — Cinema/Video</div><div class="item">Project “Lábia — Human Trafficking”</div><div class="item">Videogame Music Production</div><div class="item">Mastering</div><div class="item">Podcast — “Genesis of Sound”</div><div class="item">“Bankruptcy”</div><div class="item">LiveInsight Performance</div><div class="item">Erasmus+ — “Sampling Prague”</div>',
        proHTML:'<div class="item"><strong>ETIC Algarve — Diploma Delivery (2024)</strong><br><span class="muted">Continuous composition per course + specific SFX.</span></div><div class="item"><strong>Internal technical support</strong><br><span class="muted">Recordings with students and teachers; equipment maintenance and management.</span></div><div class="item"><strong>Short films and documentaries</strong><br><span class="muted">Sound direction, timecode sync and multi‑monitoring.</span></div>',
        aboutHTML:`<p>Hi! My name is Ricardo a.k.a downware and I'm 24 years old.</p><p>I am a music producer, sound designer and sound technician with a love for sampling and audio manipulation.</p><p>Since I was a kid, I have been interested in music, with my main influences being 80s and 90s Pop, Hip-Hop, and R&amp;B.</p><p>Currently, I produce Jungle, Drum&amp;Bass, Vaporwave, and Hip-Hop.</p><p>I primarily work with Ableton Live but also have experience working with Pro Tools.</p><p>I have a background in programming, but producing music has been a hobby of mine since I was 16. This hobby led me to pursue a course in Music Creation and Production Techniques at ETIC_Algarve in Faro, which turned me into a professional in the field of sound and music.</p><p>Towards the end of my course, I had an internship at the studio of music producer and DJ, Sickonce (Rafael Correia), in Portimão. During the internship, I had the opportunity to participate in various recording, editing, and post-production sessions for different artists.</p><p>I was fortunate to receive an Erasmus+ scholarship from ETIC_Algarve, which allowed me to intern for three months at Soundsgate, a company in Prague, Czech Republic. Among various projects, I highlight my role as a sound technician and assistant at the Composers Summit 2023 event.</p>`},
    pt:{tbPlayer:'Leitor',tbPortfolio:'Portfólio',tbEtic:'ETIC',tbPro:'Profissional',tbAbout:'Sobre',tbContact:'Contacto',
        titlePlayer:'Winamp — rádio plaza.one',titlePortfolio:'Portfólio Pessoal',titleEtic:'ETIC',titlePro:'Profissional',titleAbout:'Sobre',titleContact:'Contacto',
        btnPlay:'Reproduzir',btnPause:'Pausar',btnStop:'Parar',
        portfolioHTML:'<div class="item"><strong>SoundCloud — algarismx</strong><br><span class="muted">Faixas originais, mixes e experiências sonoras.</span></div><div class="item"><strong>Demos &amp; inéditas</strong><br><span class="muted">“Sempre Que Eu Quiser”, “Making Love”, “Gal”, “Boombap 101”, “Amen Dubplate Contest”, “Porque Eu”, “Paddy”, “Drum Pattern”, “Japanese Jungle”.</span></div><div class="item"><strong>Global Game Jam 2023 — <em>Hair We Go!</em></strong><br><span class="muted">SFX e OST (Tema Principal, Menu Secundário, Menu).</span></div>',
        eticHTML:'<div class="item"><strong>ETIC Algarve — 2020–2023</strong><br><span class="muted">Projetos em produção musical, foley, sound design e gravação para vídeo/jogos.</span></div><div class="item">Podcast — “J Dilla…”</div><div class="item">Mestre da Vida (curta-metragem)</div><div class="item">Foley — Cinema/Vídeo</div><div class="item">Projeto “Lábia — Tráfico Humano”</div><div class="item">Produção de Música para Jogos</div><div class="item">Masterização</div><div class="item">Podcast — “Génesis do Som”</div><div class="item">“Bankruptcy”</div><div class="item">LiveInsight Performance</div><div class="item">Erasmus+ — “Sampling Prague”</div>',
        proHTML:'<div class="item"><strong>ETIC Algarve — Entrega de Diplomas (2024)</strong><br><span class="muted">Composição contínua por curso + SFX específicos.</span></div><div class="item"><strong>Apoio técnico interno</strong><br><span class="muted">Gravações com alunos e professores; manutenção e gestão de equipamento.</span></div><div class="item"><strong>Curta-metragens e documentários</strong><br><span class="muted">Direção de som, sincronização de timecode e multi-monitorização.</span></div>',
        aboutHTML:`<p>Olá! Sou o Ricardo, também conhecido como downware, e tenho 24 anos.</p><p>Sou produtor musical, sound designer e técnico de som, com paixão por sampling e manipulação de áudio.</p><p>Desde pequeno que me interesso por música; as minhas principais influências são o Pop, Hip-Hop e R&amp;B dos anos 80 e 90.</p><p>Atualmente produzo Jungle, Drum&amp;Bass, Vaporwave e Hip-Hop.</p><p>Trabalho principalmente com Ableton Live, mas também tenho experiência em Pro Tools.</p><p>Tenho background em programação, mas produzir música é um hobby desde os 16 anos. Esse hobby levou-me a tirar o curso de Técnicas de Criação e Produção Musical na ETIC_Algarve, em Faro, que me tornou profissional na área do som e da música.</p><p>No final do curso, estagiei no estúdio do produtor e DJ Sickonce (Rafael Correia), em Portimão. Durante o estágio, participei em várias sessões de gravação, edição e pós-produção para diferentes artistas.</p><p>Tive a felicidade de receber uma bolsa Erasmus+ da ETIC_Algarve, que me permitiu estagiar durante três meses na Soundsgate, em Praga (República Checa). Entre vários projetos, destaco o trabalho como técnico e assistente de som no evento Composers Summit 2023.</p>`}
  };
  const t = I18N[lang] || I18N.en;
  document.documentElement.setAttribute('lang', lang === 'pt' ? 'pt-PT' : 'en');
  const mapIds = ['titlePlayer','titlePortfolio','titleEtic','titlePro','titleAbout','titleContact','btnPlay','btnPause','btnStop'];
  mapIds.forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent = t[id]; });
  const tbMap = [['tb-player','tbPlayer'],['tb-portfolio','tbPortfolio'],['tb-etic','tbEtic'],['tb-pro','tbPro'],['tb-about','tbAbout'],['tb-contact','tbContact']];
  tbMap.forEach(([id,key])=>{ const el=document.getElementById(id); if(el) el.textContent=t[key]; const menuBtn=document.querySelector(`#mobileMenu [data-open="#${id.replace('tb-','win-')}"]`); if(menuBtn) menuBtn.textContent=t[key]; });
  const pList=document.getElementById('portfolioList'); if(pList) pList.innerHTML=t.portfolioHTML;
  const eList=document.getElementById('eticList'); if(eList) eList.innerHTML=t.eticHTML;
  const proList=document.getElementById('proList'); if(proList) proList.innerHTML=t.proHTML;
  const aboutCopy=document.getElementById('aboutCopy'); if(aboutCopy) aboutCopy.innerHTML=t.aboutHTML;
}
function startWithLanguage(lang){
  localStorage.setItem('lang', lang);
  applyI18n(lang);
  const p=document.getElementById('preloader'); if(p){ p.style.opacity='0'; setTimeout(()=>p.remove(), 350); }
}
const storedLang = localStorage.getItem('lang');
if (storedLang) applyI18n(storedLang);
const enBtn=document.getElementById('chooseEN'); const ptBtn=document.getElementById('choosePT');
if (enBtn && ptBtn){ enBtn.addEventListener('click', ()=> startWithLanguage('en')); ptBtn.addEventListener('click', ()=> startWithLanguage('pt')); }

// Aguardar waves.js
window.addEventListener('load', () => {
  setTimeout(() => {
    if (window.WavesController) console.log('Waves loaded successfully on page load');
  }, 500);
});

// -------- Window Manager + Auto-arrange (tiling) --------
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
  const vw = window.innerWidth, vh = window.innerHeight - 64;
  const cols = Math.min( Math.ceil(Math.sqrt(open.length)), 3 );
  const rows = Math.ceil(open.length / cols);
  const cellW = Math.max(320, Math.floor((vw - pad*(cols+1)) / cols));
  const cellH = Math.max(220, Math.floor((vh - pad*(rows+1)) / rows));
  open.forEach((w, idx)=>{
    const c = idx % cols, r = Math.floor(idx / cols);
    const left = pad + c*(cellW + pad);
    const top  = pad + r*(cellH + pad);
    w.style.left = left + 'px';
    w.style.top  = top + 'px';
  });
}
wins.forEach((win) => {
  win.addEventListener('mousedown', () => bringToFront(win));
  const tb = win.querySelector('[data-drag]');
  if (tb) {
    let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
    tb.addEventListener('mousedown', (e) => {
      dragging = true;
      bringToFront(win);
      sx = e.clientX; sy = e.clientY;
      const r = win.getBoundingClientRect(); ox = r.left; oy = r.top;
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      const vw = innerWidth, vh = innerHeight, ww = win.offsetWidth, wh = win.offsetHeight;
      let nx = ox + dx, ny = oy + dy;
      nx = Math.max(8, Math.min(vw - ww - 8, nx));
      ny = Math.max(8, Math.min(vh - wh - 60, ny));
      win.style.left = nx + 'px'; win.style.top = ny + 'px';
    });
    window.addEventListener('mouseup', () => dragging = false);
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
document.querySelectorAll('[data-open]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const sel = e.currentTarget.getAttribute('data-open');
    const w = document.querySelector(sel);
    if (w) {
      w.classList.remove('hidden');
      bringToFront(w);
      setTimeout(() => {
        const hue = windowHues.get(w.id);
        if (hue !== undefined) w.style.setProperty('--tint', `oklch(0.72 0.12 ${hue})`);
        tileWindows();
      }, 10);
    }
    const tb = e.currentTarget;
    if (sel !== '#win-player') tb.classList.add('pulsing-static');
  });
});
window.addEventListener('resize', () => tileWindows());

// -------- Player --------
const audio = new Audio('https://radio.plaza.one/mp3');
audio.crossOrigin = 'anonymous';
audio.preload = 'none';
audio.loop = false;
const player = document.getElementById('player');
const btnPlay = document.getElementById('btnPlay');
const btnPause = document.getElementById('btnPause');
const btnStop = document.getElementById('btnStop');
const vol = document.getElementById('vol');
const bars = ['b1','b2','b3','b4','b5'].map(id => document.getElementById(id));
const tbPlayer = document.getElementById('tb-player');
const winPlayer = document.getElementById('win-player');
winPlayer.style.setProperty('--tint', 'transparent');

// NOW PLAYING (taskbar)
const npEl = document.getElementById('nowPlaying');
const npText = document.getElementById('npText');
function updateNowPlaying(){
  let title = '', artist = '';
  if ('mediaSession' in navigator && navigator.mediaSession && navigator.mediaSession.metadata){
    const md = navigator.mediaSession.metadata;
    title  = md.title || '';
    artist = md.artist || '';
  }
  const line = (artist || title) ? [artist, title].filter(Boolean).join(' — ') : 'Radio — Live';
  if (npText) npText.textContent = line;
}
function showNowPlaying(show){
  if (!npEl) return;
  if (show) npEl.removeAttribute('hidden'); else npEl.setAttribute('hidden','');
}

// --- Now Playing via Icecast/Shoutcast (poll) ---
const META_CFG = {
  candidates: [
    'https://radio.plaza.one/status-json.xsl',
    'https://radio.plaza.one/status.xsl',
    'https://radio.plaza.one/7?'
  ],
  intervalMs: 15000,
  corsProxy: '' // se precisares: 'https://teu-worker.workers.dev/?url='
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
      if (npText) npText.textContent = np.text || formatNP(np.artist, np.title);
      return;
    }
  }
  if ('mediaSession' in navigator && navigator.mediaSession && navigator.mediaSession.metadata){
    const md = navigator.mediaSession.metadata;
    const text = formatNP(md.artist, md.title);
    if (npText) npText.textContent = text;
  }
}

let ctx = null, src = null, analyser = null, data = null;
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
  if (window.WavesController && window.WavesController.attachAnalyser) {
    window.WavesController.attachAnalyser(analyser);
  }
}
function setPlaying(p) { player.classList.toggle('playing', p); }

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
btnPause.addEventListener('click', () => { audio.pause(); setPlaying(false); showNowPlaying(false); clearInterval(window.__np_timer); });
btnStop.addEventListener('click', () => {
  audio.pause();
  audio.currentTime = 0;
  setPlaying(false);
  showNowPlaying(false);
  clearInterval(window.__np_timer);
});
vol.addEventListener('input', () => { audio.volume = +vol.value; });
audio.volume = +vol.value;

function avg(a, b) {
  if (!data) return 0;
  let s = 0, c = 0;
  for (let i = a; i < b && i < data.length; i++) { s += data[i]; c++; }
  return c ? s / c : 0;
}
function loop() {
  requestAnimationFrame(loop);
  if (!analyser || !data) return;
  if (!audio.paused) {
    analyser.getByteFrequencyData(data);
    const bands = [avg(0, 6), avg(6, 12), avg(12, 22), avg(22, 36), avg(36, 64)];
    bands.forEach((v, i) => {
      const n = Math.min(1, v / 255);
      bars[i].style.setProperty('--l', (0.15 + 0.85 * n).toFixed(2));
    });
    // player button pulse hue/power
    let num=0, den=0;
    for (let i=0;i<data.length;i++){ num += i*data[i]; den += data[i]; }
    const hz = den ? (num/den) * (ctx.sampleRate / analyser.fftSize) : 0;
    const hue = Math.max(0, Math.min(360, (hz/8000)*360));
    tbPlayer.style.setProperty('--hue', hue.toFixed(0));
    const minimized = winPlayer.classList.contains('hidden');
    if(minimized){
      tbPlayer.classList.add('pulsing');
      tbPlayer.classList.remove('pulsing-static');
      const level = bands.reduce((a,b)=>a+b,0)/bands.length/255;
      tbPlayer.style.setProperty('--pulse', (0.15+0.85*level).toFixed(2));
    } else {
      tbPlayer.classList.remove('pulsing');
      tbPlayer.style.setProperty('--pulse','0');
    }
  } else {
    tbPlayer.classList.remove('pulsing');
    tbPlayer.style.setProperty('--pulse','0');
    if (winPlayer.classList.contains('hidden')) tbPlayer.classList.remove('pulsing-static');
  }
}
loop();

// -------- HAMBURGER MENU --------
const tbMenu = document.getElementById('tb-menu');
const mobileMenu = document.getElementById('mobileMenu');
function setMenu(open){
  if (!tbMenu || !mobileMenu) return;
  tbMenu.setAttribute('aria-expanded', String(open));
  mobileMenu.setAttribute('aria-hidden', String(!open));
  mobileMenu.classList.toggle('open', open);
}
if (tbMenu && mobileMenu){
  tbMenu.addEventListener('click', (e)=>{
    e.stopPropagation();
    const isOpen = tbMenu.getAttribute('aria-expanded') === 'true';
    setMenu(!isOpen);
  });
  mobileMenu.addEventListener('click', (e)=>{
    const target = e.target;
    if (target && (target.classList.contains('menu-item') || target.hasAttribute('data-open'))){
      setTimeout(()=> setMenu(false), 0);
    }
  });
  document.addEventListener('click', (e)=>{
    const isOpen = tbMenu.getAttribute('aria-expanded') === 'true';
    if (!isOpen) return;
    const target = e.target;
    if (target && !mobileMenu.contains(target) && target !== tbMenu){
      setMenu(false);
    }
  });
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') setMenu(false);
  });
}

// -------- THEME + CLOCK (Modern = Waves / Win98 = Dither) --------
const themeSelect = document.getElementById('themeSelect');
if (themeSelect){
  // Start in Modern
  themeSelect.value = 'modern';
  document.body.classList.add('theme-modern');
  if (window.DitherController){ try{ window.DitherController.unmount(); }catch(e){} }
  if (window.WavesController){
    try{
      window.WavesController.mount();
      if (window.WavesController.attachAnalyser && window.appAnalyser){
        window.WavesController.attachAnalyser(window.appAnalyser);
      }
    }catch(e){ console.error('Error mounting Waves on init:', e); }
  }

  themeSelect.addEventListener('change', ()=>{
    const isModern = themeSelect.value === 'modern';
    document.body.classList.toggle('theme-modern', isModern);

    // Waves for Modern
    if (window.WavesController){
      if (isModern) {
        try {
          window.WavesController.mount();
          if (window.WavesController.attachAnalyser && window.appAnalyser) {
            window.WavesController.attachAnalyser(window.appAnalyser);
          }
        } catch (e) { console.error('Error mounting Waves:', e); }
      } else {
        try { window.WavesController.unmount(); }
        catch (e) { console.error('Error unmounting Waves:', e); }
      }
    }
    // Dither for Win98/ME
    if (window.DitherController){
      if (!isModern){
        try { window.DitherController.mount({
          palette: ['#008080','#20A0A0','#C0C0C0','#F0F0F0'],
          speed: 0.06,
          noiseScale: 0.0018
        }); } catch(e){ console.error('Error mounting Dither:', e); }
      } else {
        try { window.DitherController.unmount(); } catch(e){ console.error('Error unmounting Dither:', e); }
      }
    }
  });
}

const clockEl = document.getElementById('taskClock');
function updateClock(){
  if (!clockEl) return;
  const now = new Date();
  const dd = now.toLocaleDateString(undefined, { weekday:'short', day:'2-digit', month:'short' });
  const hh = now.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' });
  clockEl.textContent = `${dd} ${hh}`;
}
updateClock();
setInterval(updateClock, 1000 * 30);

// -------- SHORTCUTS --------
window.addEventListener('keydown', (e)=>{
  if (e.code === 'Space'){
    e.preventDefault();
    if (audio.paused) btnPlay.click(); else btnPause.click();
  }
  if (e.key === 'm' || e.key === 'M'){
    if (tbMenu) tbMenu.click();
  }
});