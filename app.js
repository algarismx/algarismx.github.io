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
    if (tb)
        tb.style.setProperty('--hue', String(h));
});
// Preloader
window.addEventListener('load', () => {
    setTimeout(() => { const p = document.getElementById('preloader'); if (p) {
        p.style.opacity = '0';
        setTimeout(() => p.remove(), 350);
    } }, 450);
    // Aguardar que waves.js carregue
    setTimeout(() => {
        if (window.WavesController) {
            console.log('Waves loaded successfully on page load');
        }
        else {
            console.warn('Waves not loaded on page load');
        }
    }, 500);
});
// Window Manager
let zTop = 100;
function bringToFront(win) {
    document.querySelectorAll('.win').forEach(w => w.classList.remove('active'));
    win.classList.add('active');
    win.style.zIndex = String(++zTop);
}
wins.forEach((win) => {
    win.addEventListener('mousedown', () => bringToFront(win));
    const tb = win.querySelector('[data-drag]');
    if (tb) {
        let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
        tb.addEventListener('mousedown', (e) => {
            dragging = true;
            bringToFront(win);
            sx = e.clientX;
            sy = e.clientY;
            const r = win.getBoundingClientRect();
            ox = r.left;
            oy = r.top;
            e.preventDefault();
        });
        window.addEventListener('mousemove', (e) => {
            if (!dragging)
                return;
            const dx = e.clientX - sx, dy = e.clientY - sy;
            const vw = innerWidth, vh = innerHeight, ww = win.offsetWidth, wh = win.offsetHeight;
            let nx = ox + dx, ny = oy + dy;
            nx = Math.max(8, Math.min(vw - ww - 8, nx));
            ny = Math.max(8, Math.min(vh - wh - 60, ny));
            win.style.left = nx + 'px';
            win.style.top = ny + 'px';
        });
        window.addEventListener('mouseup', () => dragging = false);
    }
    win.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const sel = btn.getAttribute('data-close');
            const targetWin = document.querySelector(sel);
            if (targetWin) {
                targetWin.classList.add('hidden');
                targetWin.style.setProperty('--tint', 'transparent');
            }
            const tb = document.querySelector(`[data-open="#${win.id}"]`);
            if (tb)
                tb.classList.remove('pulsing-static');
        });
    });
    win.querySelectorAll('[data-minimize]').forEach(btn => {
        btn.addEventListener('click', () => {
            const isHidden = win.classList.contains('hidden');
            win.classList.toggle('hidden');
            if (isHidden) {
                setTimeout(() => {
                    const hue = windowHues.get(win.id);
                    if (hue !== undefined)
                        win.style.setProperty('--tint', `oklch(0.72 0.12 ${hue})`);
                }, 10);
            }
            else {
                win.style.setProperty('--tint', 'transparent');
            }
            const tb = document.querySelector(`[data-open="#${win.id}"]`);
            if (tb) {
                if (win.classList.contains('hidden'))
                    tb.classList.remove('pulsing-static');
                else
                    tb.classList.add('pulsing-static');
            }
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
                if (hue !== undefined)
                    w.style.setProperty('--tint', `oklch(0.72 0.12 ${hue})`);
            }, 10);
        }
        const tb = e.currentTarget;
        if (sel !== '#win-player')
            tb.classList.add('pulsing-static');
    });
});
// Player
const audio = new Audio('https://radio.plaza.one/mp3');
audio.crossOrigin = 'anonymous';
audio.preload = 'none';
audio.loop = false;
const player = document.getElementById('player');
const btnPlay = document.getElementById('btnPlay');
const btnPause = document.getElementById('btnPause');
const btnStop = document.getElementById('btnStop');
const vol = document.getElementById('vol');
const sens = document.getElementById('sens');
const bars = ['b1', 'b2', 'b3', 'b4', 'b5'].map(id => document.getElementById(id));
const tbPlayer = document.getElementById('tb-player');
const winPlayer = document.getElementById('win-player');
winPlayer.style.setProperty('--tint', 'transparent');
let ctx = null, src = null, analyser = null, data = null;
function ensureAudioGraph() {
    if (ctx)
        return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    src = ctx.createMediaElementSource(audio);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    data = new Uint8Array(analyser.frequencyBinCount);
    src.connect(analyser);
    analyser.connect(ctx.destination);
    // Expose analyser globally for Waves
    window.appAnalyser = analyser;
    if (window.WavesController && window.WavesController.attachAnalyser) {
      window.WavesController.attachAnalyser(analyser);
    }
}
function setPlaying(p) { player.classList.toggle('playing', p); }
btnPlay.addEventListener('click', async () => {
    try {
        ensureAudioGraph();
        if (ctx.state === 'suspended')
            await ctx.resume();
        await audio.play();
        setPlaying(true);
    }
    catch (e) {
        console.warn(e);
    }
});
btnPause.addEventListener('click', () => { audio.pause(); setPlaying(false); });
btnStop.addEventListener('click', () => {
    audio.pause();
    audio.currentTime = 0;
    setPlaying(false);
});
vol.addEventListener('input', () => { audio.volume = +vol.value; });
audio.volume = +vol.value;
if (sens){
  sens.addEventListener('input', ()=>{
    const v = parseFloat(sens.value);
    if (window.WavesController && window.WavesController.setSensitivity){
      window.WavesController.setSensitivity(v);
    } else {
      window._pendingSensitivity = v;
    }
  });
  const pv = window._pendingSensitivity; if (pv && (window.WavesController && window.WavesController.setSensitivity)){ window.WavesController.setSensitivity(pv); }
}
function avg(a, b) { let s = 0, c = 0; for (let i = a; i < b && i < data.length; i++) {
    s += data[i];
    c++;
} return c ? s / c : 0; }
function loop() {
    requestAnimationFrame(loop);
    if (!analyser || !data)
        return;
    if (!audio.paused) {
        analyser.getByteFrequencyData(data);
        const bands = [avg(0, 6), avg(6, 12), avg(12, 22), avg(22, 36), avg(36, 64)];
        bands.forEach((v, i) => { const n = Math.min(1, v / 255); bars[i].style.setProperty('--l', (0.15 + 0.85 * n).toFixed(2)); });
        let num = 0, den = 0;
        for (let i = 0; i < data.length; i++) {
            num += i * data[i];
            den += data[i];
        }
        const hz = den ? (num / den) * (ctx.sampleRate / analyser.fftSize) : 0;
        const hue = Math.max(0, Math.min(360, (hz / 8000) * 360));
        tbPlayer.style.setProperty('--hue', hue.toFixed(0));
        const minimized = winPlayer.classList.contains('hidden');
        if (minimized) {
            tbPlayer.classList.add('pulsing');
            tbPlayer.classList.remove('pulsing-static');
            const level = bands.reduce((a, b) => a + b, 0) / bands.length / 255;
            tbPlayer.style.setProperty('--pulse', (0.15 + 0.85 * level).toFixed(2));
        }
        else {
            tbPlayer.classList.remove('pulsing');
            tbPlayer.style.setProperty('--pulse', '0');
        }
    }
    else {
        tbPlayer.classList.remove('pulsing');
        tbPlayer.style.setProperty('--pulse', '0');
        if (winPlayer.classList.contains('hidden'))
            tbPlayer.classList.remove('pulsing-static');
    }
}
loop();
// Theme toggle + Clock
const themeSelect = document.getElementById('themeSelect');
if (themeSelect) {
    // Inicializar com tema Windows ME
    themeSelect.value = 'win98';
    document.body.classList.remove('theme-modern');
    themeSelect.addEventListener('change', () => {
        const isModern = themeSelect.value === 'modern';
        document.body.classList.toggle('theme-modern', isModern);
        // Waves only on modern theme
        if (window.WavesController) {
            if (isModern) {
                console.log('Mounting Waves...');
                try {
                    window.WavesController.mount();
                    console.log('Waves mounted successfully');
                    // Attach analyser again if present
                    if (window.WavesController && window.WavesController.attachAnalyser && analyser) {
                      window.WavesController.attachAnalyser(analyser);
                    }
                    const pv = window._pendingSensitivity; if (pv && (window.WavesController && window.WavesController.setSensitivity)){ window.WavesController.setSensitivity(pv); }
                }
                catch (e) {
                    console.error('Error mounting Waves:', e);
                }
            }
            else {
                console.log('Unmounting Waves...');
                try {
                    window.WavesController.unmount();
                    console.log('Waves unmounted successfully');
                }
                catch (e) {
                    console.error('Error unmounting Waves:', e);
                }
            }
        }
    });
}
const clockEl = document.getElementById('taskClock');
function updateClock() {
    if (!clockEl)
        return;
    const now = new Date();
    const dd = now.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' });
    const hh = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    clockEl.textContent = `${dd} ${hh}`;
}
updateClock();
setInterval(updateClock, 1000 * 30);
// Hamburger menu behavior (works on both themes)
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
    const t = e.target;
    if (t && (t.classList.contains('menu-item') || t.hasAttribute('data-open'))){
      setTimeout(()=> setMenu(false), 0);
    }
  });
  document.addEventListener('click', (e)=>{
    const isOpen = tbMenu.getAttribute('aria-expanded') === 'true';
    if (!isOpen) return;
    if (!mobileMenu.contains(e.target) && e.target !== tbMenu){ setMenu(false); }
  });
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') setMenu(false); });
}

// Keyboard shortcuts
window.addEventListener('keydown', (e)=>{
  if (e.code === 'Space'){
    e.preventDefault();
    if (audio.paused) btnPlay.click(); else btnPause.click();
  }
  if (e.key === 'm' || e.key === 'M'){
    const tb = document.getElementById('tb-menu');
    if (tb) tb.click();
  }
});
