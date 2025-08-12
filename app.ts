// Basic TS types
type Nullable<T> = T | null;
type WebAudioWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };

// Elements
const wins: HTMLElement[] = Array.from(document.querySelectorAll('.win')) as HTMLElement[];
function randHue(): number { return Math.floor(Math.random()*360); }
function buttonForWindow(win: HTMLElement): Nullable<HTMLElement> { return document.querySelector(`[data-open="#${win.id}"]`); }

// Hues per window
const windowHues = new Map<string, number>();

// Seed hues and task buttons, init tint transparent
wins.forEach((w)=>{
  const h = randHue();
  windowHues.set(w.id, h);
  w.style.setProperty('--tint', 'transparent');
  const tb = buttonForWindow(w);
  if (tb) (tb as HTMLElement).style.setProperty('--hue', String(h));
});

// Preloader
window.addEventListener('load', () => {
  setTimeout(()=>{ const p=document.getElementById('preloader'); if(p){ p.style.opacity='0'; setTimeout(()=>p.remove(), 350);} }, 450);
});

// Window Manager
let zTop = 100;
function bringToFront(win: HTMLElement){
  document.querySelectorAll('.win').forEach(w=>w.classList.remove('active'));
  win.classList.add('active');
  win.style.zIndex = String(++zTop);
}
wins.forEach((win)=>{
  win.addEventListener('mousedown', ()=>bringToFront(win));
  const tb = win.querySelector('[data-drag]') as Nullable<HTMLElement>;
  if(tb){
    let sx=0, sy=0, ox=0, oy=0, dragging=false;
    tb.addEventListener('mousedown', (e: MouseEvent)=>{
      dragging=true; bringToFront(win);
      sx=e.clientX; sy=e.clientY; const r=win.getBoundingClientRect(); ox=r.left; oy=r.top; e.preventDefault();
    });
    window.addEventListener('mousemove', (e: MouseEvent)=>{
      if(!dragging) return;
      const dx=e.clientX-sx, dy=e.clientY-sy;
      const vw=innerWidth, vh=innerHeight, ww=win.offsetWidth, wh=win.offsetHeight;
      let nx=ox+dx, ny=oy+dy;
      nx=Math.max(8, Math.min(vw-ww-8, nx)); ny=Math.max(8, Math.min(vh-wh-60, ny));
      win.style.left=nx+'px'; win.style.top=ny+'px';
    });
    window.addEventListener('mouseup', ()=>dragging=false);
  }
  win.querySelectorAll('[data-close]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const sel=(btn as HTMLElement).getAttribute('data-close'); const targetWin = document.querySelector(sel!) as Nullable<HTMLElement>;
      if (targetWin) {
        targetWin.classList.add('hidden');
        targetWin.style.setProperty('--tint', 'transparent');
      }
      const tb = document.querySelector(`[data-open="#${win.id}"]`) as Nullable<HTMLElement>;
      if (tb) tb.classList.remove('pulsing-static');
    });
  });
  win.querySelectorAll('[data-minimize]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
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
      const tb = document.querySelector(`[data-open="#${win.id}"]`) as Nullable<HTMLElement>;
      if (tb) {
        if (win.classList.contains('hidden')) tb.classList.remove('pulsing-static');
        else tb.classList.add('pulsing-static');
      }
    });
  });
});

document.querySelectorAll('[data-open]').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const sel=(e.currentTarget as HTMLElement).getAttribute('data-open'); const w=document.querySelector(sel!) as Nullable<HTMLElement>;
    if(w){ 
      w.classList.remove('hidden'); bringToFront(w);
      setTimeout(() => {
        const hue = windowHues.get(w.id);
        if (hue !== undefined) w.style.setProperty('--tint', `oklch(0.72 0.12 ${hue})`);
      }, 10);
    }
    const tb = e.currentTarget as HTMLElement; if (sel !== '#win-player') tb.classList.add('pulsing-static');
  });
});

// Player
const audio = new Audio('https://radio.plaza.one/mp3');
audio.crossOrigin='anonymous'; audio.preload='none'; audio.loop=false;
const player = document.getElementById('player')!;
const btnPlay = document.getElementById('btnPlay')!;
const btnPause = document.getElementById('btnPause')!;
const btnStop = document.getElementById('btnStop')!;
const vol = document.getElementById('vol') as HTMLInputElement;
const bars = ['b1','b2','b3','b4','b5'].map(id=>document.getElementById(id)!) as HTMLElement[];
const tbPlayer = document.getElementById('tb-player')! as HTMLElement;
const winPlayer = document.getElementById('win-player')! as HTMLElement;
winPlayer.style.setProperty('--tint', 'transparent');

let ctx: AudioContext | null = null, src: MediaElementAudioSourceNode | null = null, analyser: AnalyserNode | null = null, data: Uint8Array | null = null;
function ensureAudioGraph(){
  if(ctx) return;
  const AC = (window as WebAudioWindow).AudioContext || (window as WebAudioWindow).webkitAudioContext!;
  ctx = new AC();
  src = (ctx as AudioContext).createMediaElementSource(audio);
  analyser = (ctx as AudioContext).createAnalyser();
  (analyser as AnalyserNode).fftSize = 256;
  data = new Uint8Array((analyser as AnalyserNode).frequencyBinCount);
  (src as MediaElementAudioSourceNode).connect(analyser as AnalyserNode); (analyser as AnalyserNode).connect((ctx as AudioContext).destination);
}
function setPlaying(p:boolean){ player.classList.toggle('playing', p); }

btnPlay.addEventListener('click', async ()=>{
  try{
    ensureAudioGraph();
    if((ctx as AudioContext).state==='suspended') await (ctx as AudioContext).resume();
    await audio.play();
    setPlaying(true);
  }catch(e){ console.warn(e); }
});
btnPause.addEventListener('click', ()=>{ audio.pause(); setPlaying(false); });
btnStop.addEventListener('click', ()=>{ audio.pause(); audio.currentTime=0; setPlaying(false); });

vol.addEventListener('input', ()=>{ audio.volume=+vol.value; });
audio.volume=+vol.value;

function avg(a:number,b:number){ let s=0,c=0; for(let i=a;i<b&&i<(data as Uint8Array).length;i++){ s+=(data as Uint8Array)[i]; c++; } return c? s/c:0; }
function loop(){
  requestAnimationFrame(loop);
  if(!analyser || !data) return;
  if(!audio.paused){
    (analyser as AnalyserNode).getByteFrequencyData(data as Uint8Array);
    const bands=[avg(0,6), avg(6,12), avg(12,22), avg(22,36), avg(36,64)];
    bands.forEach((v,i)=>{ const n=Math.min(1,v/255); (bars[i] as HTMLElement).style.setProperty('--l',(0.15+0.85*n).toFixed(2)); });
    let num=0, den=0; for(let i=0;i<(data as Uint8Array).length;i++){ num += i*(data as Uint8Array)[i]; den += (data as Uint8Array)[i]; }
    const hz = den ? (num/den) * ((ctx as AudioContext).sampleRate / (analyser as AnalyserNode).fftSize) : 0;
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

// Theme toggle + Clock
const themeSelect = document.getElementById('themeSelect') as Nullable<HTMLSelectElement>;
if (themeSelect){
  themeSelect.addEventListener('change', ()=>{
    document.body.classList.toggle('theme-modern', themeSelect.value === 'modern');
  });
}

const clockEl = document.getElementById('taskClock') as Nullable<HTMLElement>;
function updateClock(){
  if (!clockEl) return;
  const now = new Date();
  const dd = now.toLocaleDateString(undefined, { weekday:'short', day:'2-digit', month:'short' });
  const hh = now.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' });
  clockEl.textContent = `${dd} ${hh}`;
}
updateClock();
setInterval(updateClock, 1000 * 30);


