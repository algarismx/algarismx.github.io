// Waves background (vanilla). Pixel‑art mode for Win98, smooth for Modern.
// Audio‑reactive via AnalyserNode: call WavesController.attachAnalyser(analyser)

(function(){
  let audioAnalyser = null, audioData = null, audioLevel = 0;

  function Grad(x,y,z){ this.x=x; this.y=y; this.z=z; }
  Grad.prototype.dot2=function(x,y){ return this.x*x + this.y*y; };
  function Noise(seed){
    this.grad3=[new Grad(1,1,0),new Grad(-1,1,0),new Grad(1,-1,0),new Grad(-1,-1,0),new Grad(1,0,1),new Grad(-1,0,1),new Grad(1,0,-1),new Grad(-1,0,-1),new Grad(0,1,1),new Grad(0,-1,1),new Grad(0,1,-1),new Grad(0,-1,-1)];
    this.p=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
    this.perm=new Array(512); this.gradP=new Array(512); this.seed(seed||0);
  }
  Noise.prototype.seed=function(seed){ if(seed>0&&seed<1) seed*=65536; seed=Math.floor(seed); if(seed<256) seed|=seed<<8; for(let i=0;i<256;i++){ let v=(i&1)?(this.p[i]^(seed&255)):(this.p[i]^((seed>>8)&255)); this.perm[i]=this.perm[i+256]=v; this.gradP[i]=this.gradP[i+256]=this.grad3[v%12]; } };
  Noise.prototype.fade=function(t){ return t*t*t*(t*(t*6-15)+10); };
  Noise.prototype.lerp=function(a,b,t){ return (1-t)*a + t*b; };
  Noise.prototype.perlin2=function(x,y){ let X=Math.floor(x), Y=Math.floor(y); x-=X; y-=Y; X&=255; Y&=255; const n00=this.gradP[X+this.perm[Y]].dot2(x,y); const n01=this.gradP[X+this.perm[Y+1]].dot2(x,y-1); const n10=this.gradP[X+1+this.perm[Y]].dot2(x-1,y); const n11=this.gradP[X+1+this.perm[Y+1]].dot2(x-1,y-1); const u=this.fade(x); return this.lerp(this.lerp(n00,n10,u), this.lerp(n01,n11,u), this.fade(y)); };

  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
  function quant(v, grid){ return grid>1 ? Math.round(v / grid) * grid : v; }

  const WavesController = {
    _state: null,
    mount(opts){
      if (this._state) return;
      const cfg = Object.assign({
        backgroundColor: 'transparent',
        lineColor: '#ffffff',
        pixelate: false,
        pixelSize: 6,
        lineWidth: 1.2,
        waveSpeedX: 0.02, waveSpeedY: 0.01,
        waveAmpX: 40, waveAmpY: 20,
        xGap: 12, yGap: 36
      }, opts||{});

      const container = document.createElement('div');
      container.className = 'waves';
      container.style.backgroundColor = cfg.backgroundColor;
      const canvas = document.createElement('canvas');
      canvas.className = 'waves-canvas';
      container.appendChild(canvas);
      document.body.appendChild(container);

      const ctx = canvas.getContext('2d');
      ctx.lineJoin = cfg.pixelate ? 'miter' : 'round';
      ctx.lineCap  = cfg.pixelate ? 'butt'  : 'round';

      const bounding={width:0,height:0,left:0,top:0};
      const noise=new Noise(Math.random());
      let lines=[], frameId=null;
      const mouse={ x:-10,y:0,lx:0,ly:0,sx:0,sy:0, v:0,vs:0,a:0,set:false };

      function setSize(){ const r=container.getBoundingClientRect(); bounding.width=r.width; bounding.height=r.height; canvas.width=r.width; canvas.height=r.height; }
      function setLines(){
        const {width,height}=bounding;
        lines=[];
        const oWidth=width+200, oHeight=height+30;
        const totalLines=Math.ceil(oWidth/cfg.xGap);
        const totalPoints=Math.ceil(oHeight/cfg.yGap);
        const xStart=(width - cfg.xGap*totalLines)/2;
        const yStart=(height - cfg.yGap*totalPoints)/2;
        for(let i=0;i<=totalLines;i++){
          const pts=[];
          for(let j=0;j<=totalPoints;j++){
            pts.push({ x:xStart+cfg.xGap*i, y:yStart+cfg.yGap*j, wave:{x:0,y:0}, cursor:{x:0,y:0,vx:0,vy:0} });
          }
          lines.push(pts);
        }
      }

      // Audio
      let analyser = null, freq = null;
      function updateAudioLevel(){
        if (!analyser) { audioLevel = 0; return; }
        analyser.getByteFrequencyData(freq);
        let s=0; for(let i=0;i<freq.length;i++) s+=freq[i];
        audioLevel = clamp(s / (freq.length*255), 0, 1);
      }

      function movePoints(time){
        updateAudioLevel();
        const ampX = cfg.waveAmpX * (1 + audioLevel * 0.9);
        const ampY = cfg.waveAmpY * (1 + audioLevel * 0.9);

        lines.forEach(pts=>{
          pts.forEach(p=>{
            const move=noise.perlin2((p.x+time*cfg.waveSpeedX)*0.002, (p.y+time*cfg.waveSpeedY)*0.0015)*12;
            p.wave.x=Math.cos(move)*ampX;
            p.wave.y=Math.sin(move)*ampY;
          });
        });
      }

      function moved(p){
        let x = p.x + p.wave.x;
        let y = p.y + p.wave.y;
        if (cfg.pixelate){ x = quant(x, cfg.pixelSize); y = quant(y, cfg.pixelSize); }
        return { x:Math.round(x*10)/10, y:Math.round(y*10)/10 };
      }

      function drawLines(){
        const {width,height}=bounding;
        ctx.clearRect(0,0,width,height);
        ctx.beginPath();
        const a = cfg.pixelate ? (0.35 + audioLevel*0.45) : (0.55 + audioLevel*0.35);
        ctx.lineWidth = (cfg.pixelate?1.0:1.2) + audioLevel*(cfg.pixelate?0.8:1.2);
        ctx.strokeStyle = cfg.lineColor.includes('#000') ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`;

        lines.forEach(points=>{
          let p1=moved(points[0]);
          ctx.moveTo(p1.x,p1.y);
          points.forEach((p)=>{ p1=moved(p); ctx.lineTo(p1.x,p1.y); });
        });
        ctx.stroke();
      }

      function tick(t){ movePoints(t); drawLines(); frameId=requestAnimationFrame(tick); }

      function onResize(){ setSize(); setLines(); }
      setSize(); setLines(); frameId=requestAnimationFrame(tick);
      window.addEventListener('resize', onResize);

      this._state={
        container, canvas, ctx, cfg, frameId, handlers:[onResize],
        attach(an){
          analyser = an || null;
          freq = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
        }
      };
    },

    unmount(){
      const s=this._state; if(!s) return;
      window.removeEventListener('resize', s.handlers[0]);
      cancelAnimationFrame(s.frameId);
      s.container.remove();
      this._state=null;
    },

    attachAnalyser(an){
      try{
        if (this._state && this._state.attach) this._state.attach(an);
      }catch(e){ console.warn('attachAnalyser error', e); }
    }
  };

  window.WavesController = WavesController;
})();