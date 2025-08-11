// Generated from app.ts (manual inline) to avoid build step
const wins = Array.from(document.querySelectorAll('.win'));
function randHue() { return Math.floor(Math.random() * 360); }
function buttonForWindow(win) { return document.querySelector(`[data-open="#${win.id}"]`); }
const windowHues = new Map();
wins.forEach((w) => {
    const h = randHue();
    windowHues.set(w.id, h);
    w.style.setProperty('--tint', 'transparent');
    const tb = buttonForWindow(w);
    if (tb)
        tb.style.setProperty('--hue', String(h));
});
window.addEventListener('load', () => {
    setTimeout(() => { const p = document.getElementById('preloader'); if (p) {
        p.style.opacity = '0';
        setTimeout(() => p.remove(), 350);
    } }, 450);
});
let zTop = 100;
function bringToFront(win) {
    document.querySelectorAll('.win').forEach(w => w.classList.remove('active'));
    win.classList.add('active');
    win.style.zIndex = String(++zTop);
}
wins.forEach((win) => {
    win.addEventListener('mousedown', () => bringToFront(win));
    // Touch bring-to-front (mobile)
    win.addEventListener('touchstart', () => bringToFront(win), { passive: true });
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
        // Touch dragging
        tb.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            dragging = true;
            bringToFront(win);
            sx = t.clientX;
            sy = t.clientY;
            const r = win.getBoundingClientRect();
            ox = r.left;
            oy = r.top;
        }, { passive: true });
        window.addEventListener('touchmove', (e) => {
            if (!dragging)
                return;
            const t = e.touches[0];
            const dx = t.clientX - sx, dy = t.clientY - sy;
            const vw = innerWidth, vh = innerHeight, ww = win.offsetWidth, wh = win.offsetHeight;
            let nx = ox + dx, ny = oy + dy;
            nx = Math.max(6, Math.min(vw - ww - 6, nx));
            ny = Math.max(6, Math.min(vh - wh - 80, ny));
            win.style.left = nx + 'px';
            win.style.top = ny + 'px';
        }, { passive: true });
        window.addEventListener('touchend', () => dragging = false, { passive: true });
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
            if (tb) {
                if (win.id === 'win-player') {
                    if (audio.paused)
                        tb.classList.remove('pulsing-static');
                }
                else {
                    if (win.classList.contains('hidden'))
                        tb.classList.remove('pulsing-static');
                    else
                        tb.classList.add('pulsing-static');
                }
            }
        });
    });
    win.querySelectorAll('[data-minimize]').forEach(btn => {
        btn.addEventListener('click', () => {
            const isHidden = win.classList.contains('hidden');
            win.classList.toggle('hidden');
            if (isHidden) {
                setTimeout(() => {
                    const hue = windowHues.get(win.id);
                    if (hue !== undefined) {
                        win.style.setProperty('--tint', `oklch(0.72 0.12 ${hue})`);
                    }
                }, 10);
            }
            else {
                win.style.setProperty('--tint', 'transparent');
            }
            const tb = document.querySelector(`[data-open="#${win.id}"]`);
            if (tb) {
                if (win.id === 'win-player') {
                    if (audio.paused)
                        tb.classList.remove('pulsing-static');
                }
                else {
                    if (win.classList.contains('hidden'))
                        tb.classList.remove('pulsing-static');
                    else
                        tb.classList.add('pulsing-static');
                }
            }
        });
    });
});
document.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const sel = btn.getAttribute('data-open');
        const w = document.querySelector(sel);
        if (!w)
            return;
        const isHidden = w.classList.contains('hidden');
        const isActive = w.classList.contains('active');
        if (isHidden) {
            // Restore minimized window
            w.classList.remove('hidden');
            bringToFront(w);
            setTimeout(() => {
                const hue = windowHues.get(w.id);
                if (hue !== undefined) {
                    w.style.setProperty('--tint', `oklch(0.72 0.12 ${hue})`);
                }
            }, 10);
        }
        else if (isActive) {
            // Active -> minimize (toggle)
            w.classList.add('hidden');
            w.style.setProperty('--tint', 'transparent');
        }
        else {
            // Inactive but visible -> activate
            bringToFront(w);
        }
        const tb = e.currentTarget;
        if (sel !== '#win-player') {
            if (w.classList.contains('hidden'))
                tb.classList.remove('pulsing-static');
            else
                tb.classList.add('pulsing-static');
        }
    });
});
const audio = new Audio('https://radio.plaza.one/mp3');
audio.crossOrigin = 'anonymous';
audio.preload = 'none';
audio.loop = false;
const player = document.getElementById('player');
const btnPlay = document.getElementById('btnPlay');
const btnPause = document.getElementById('btnPause');
const btnStop = document.getElementById('btnStop');
const vol = document.getElementById('vol');
const bars = ['b1', 'b2', 'b3', 'b4', 'b5'].map(id => document.getElementById(id));
const tbPlayer = document.getElementById('tb-player');
const winPlayer = document.getElementById('win-player');
winPlayer.style.setProperty('--tint', 'transparent');
let ctx = null, src = null, analyser = null, data = null;
function ensureAudioGraph() {
    if (ctx)
        return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    src = ctx.createMediaElementSource(audio);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    data = new Uint8Array(analyser.frequencyBinCount);
    src.connect(analyser);
    analyser.connect(ctx.destination);
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
    catch (e) { console.warn(e); }
});
btnPause.addEventListener('click', () => { audio.pause(); setPlaying(false); });
btnStop.addEventListener('click', () => { audio.pause(); audio.currentTime = 0; setPlaying(false); });
vol.addEventListener('input', () => { audio.volume = +vol.value; });
audio.volume = +vol.value;
function avg(a, b) { let s = 0, c = 0; for (let i = a; i < b && i < data.length; i++) {
    s += data[i];
    c++;
} return c ? s / c : 0; }
function loop() {
    requestAnimationFrame(loop);
    if (!analyser)
        return;
    if (!audio.paused) {
        analyser.getByteFrequencyData(data);
        const bands = [avg(0, 6), avg(6, 12), avg(12, 22), avg(22, 36), avg(36, 64)];
        bands.forEach((v, i) => { const n = Math.min(1, v / 255); bars[i].style.setProperty('--l', (0.15 + 0.85 * n).toFixed(2)); });
        let num = 0, den = 0; for (let i = 0; i < data.length; i++) {
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
const themeSelect = document.getElementById('themeSelect');
function applyTheme(){
    if (themeSelect && !themeSelect.dataset.init){ themeSelect.value = 'modern'; themeSelect.dataset.init = '1'; }
    const isModern = themeSelect && themeSelect.value === 'modern';
    document.body.classList.toggle('theme-modern', !!isModern);
    
    // Debug: verificar se WavesController está disponível
    console.log('WavesController available:', !!window.WavesController);
    console.log('Theme:', isModern ? 'modern' : 'win98');
    
    // Waves only on modern theme
    if (window.WavesController){
        if (isModern) {
            console.log('Mounting Waves...');
            try {
                window.WavesController.mount();
                console.log('Waves mounted successfully');
            } catch (e) {
                console.error('Error mounting Waves:', e);
            }
        } else {
            console.log('Unmounting Waves...');
            try {
                window.WavesController.unmount();
                console.log('Waves unmounted successfully');
            } catch (e) {
                console.error('Error unmounting Waves:', e);
            }
        }
    } else {
        console.warn('WavesController not found! Check if waves.js is loaded');
        console.log('Available window objects:', Object.keys(window).filter(k => k.toLowerCase().includes('wave')));
    }
}
if (themeSelect) {
    themeSelect.addEventListener('change', applyTheme);
    // Forçar tema moderno por padrão no carregamento
    themeSelect.value = 'modern';
    themeSelect.dataset.init = '1';
    // Aguardar mais tempo para garantir que waves.js carregou
    setTimeout(() => {
        console.log('Applying theme after delay...');
        applyTheme();
        
        // Teste direto das Waves após 1 segundo
        setTimeout(() => {
            console.log('Testing Waves directly...');
            if (window.WavesController) {
                console.log('WavesController found, testing mount...');
                try {
                    window.WavesController.mount();
                    console.log('Waves mounted successfully in test');
                } catch (e) {
                    console.error('Error in test mount:', e);
                }
            } else {
                console.error('WavesController still not found after delay');
            }
        }, 1000);
    }, 500);
}
// Mobile menu toggle
const tbMenu = document.getElementById('tb-menu');
const mobileMenu = document.getElementById('mobileMenu');
if (tbMenu && mobileMenu){
    tbMenu.addEventListener('click', ()=>{
        const open = mobileMenu.getAttribute('aria-hidden') !== 'false';
        mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
        tbMenu.setAttribute('aria-expanded', (!open).toString());
    });
    mobileMenu.querySelectorAll('[data-open]').forEach(b=>{
        b.addEventListener('click', ()=>{
            mobileMenu.setAttribute('aria-hidden','true');
            tbMenu.setAttribute('aria-expanded','false');
        });
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


