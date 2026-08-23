document.addEventListener('DOMContentLoaded',function(){

/* Splash */
const splash=document.getElementById('splash');
if(splash){
  let splashSeen=false;
  try{splashSeen=sessionStorage.getItem('chenbridge-splash-seen')==='1';}catch(error){splashSeen=false;}
  if(splashSeen){
    splash.style.display='none';
  }else{
    try{sessionStorage.setItem('chenbridge-splash-seen','1');}catch(error){}
    splash.style.display='flex';
    setTimeout(function(){splash.classList.add('hide');setTimeout(function(){splash.style.display='none';},800);},3000);
  }
}

/* Header scroll */
const header=document.getElementById('header');
let ticking=false;
window.addEventListener('scroll',function(){
  if(!ticking){window.requestAnimationFrame(function(){
    if(window.scrollY>60)header.classList.add('scrolled');else header.classList.remove('scrolled');
    ticking=false;
  });ticking=true;}
});

/* Mobile menu */
const mobileToggle=document.getElementById('mobile-toggle');
const mainNav=document.getElementById('main-nav');
if(mobileToggle){
  mobileToggle.addEventListener('click',function(){mainNav.classList.toggle('open');});
}

/* Smooth scroll */
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click',function(e){
    const href=this.getAttribute('href');
    if(href==='#')return;
    e.preventDefault();
    const target=document.querySelector(href);
    if(target){target.scrollIntoView({behavior:'smooth',block:'start'});if(mainNav)mainNav.classList.remove('open');}
  });
});

/* Scroll reveal */
const revealElements=document.querySelectorAll('.reveal');
const revealObserver=new IntersectionObserver(function(entries){
  entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('active');revealObserver.unobserve(entry.target);}});
},{threshold:0.15,rootMargin:'0px 0px -50px 0px'});
revealElements.forEach(function(el){revealObserver.observe(el);});

/* Counter */
const counters=document.querySelectorAll('.counter');
const counterObserver=new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if(entry.isIntersecting){
      const counter=entry.target;
      const target=parseInt(counter.getAttribute('data-target'));
      const duration=2000;
      const start=performance.now();
      function updateCounter(currentTime){
        const elapsed=currentTime-start;
        const progress=Math.min(elapsed/duration,1);
        const easeProgress=1-Math.pow(1-progress,3);
        counter.textContent=Math.floor(easeProgress*target);
        if(progress<1)requestAnimationFrame(updateCounter);
        else counter.textContent=target;
      }
      requestAnimationFrame(updateCounter);
      counterObserver.unobserve(counter);
    }
  });
},{threshold:0.5});
counters.forEach(function(counter){counterObserver.observe(counter);});

/* ===== 3D EARTH SPHERE PARTICLE SYSTEM ===== */

/* Night-sky network — 右侧更密 + 淡标注「中国工厂 → 海外买家」 */
function initNightSky(canvasId){
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let stars = [], links = [], packets = [];
  let mx = -1e4, my = -1e4, mobile = window.innerWidth <= 768;
  /* 叙事锚点：左（中国工厂）→ 右（海外买家） */
  let anchorUS = { x: 0, y: 0 }, anchorCN = { x: 0, y: 0 }, anchorEU = { x: 0, y: 0 };

  function count() {
    /* 整体更密，上限提高 */
    const dens = mobile ? 1 / 8500 : 1 / 5200;
    return Math.max(mobile ? 55 : 100, Math.min(mobile ? 110 : 220, Math.floor(W * H * dens)));
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    /* 地理方位：西(左)=美国，东(右)=中国，北(上)=欧洲 */
    anchorUS = { x: W * (mobile ? 0.16 : 0.14), y: H * 0.52 };
    anchorCN = { x: W * (mobile ? 0.86 : 0.84), y: H * 0.48 };
    anchorEU = { x: W * (mobile ? 0.48 : 0.50), y: H * (mobile ? 0.18 : 0.16) };
    seed();
  }

  function seed() {
    stars = [];
    const n = count();
    for (let i = 0; i < n; i++) {
      let x, y;
      const roll = Math.random();
      if (roll < 0.55) {
        /* 右侧主区更密 */
        const bias = Math.pow(Math.random(), 0.55);
        x = (0.48 + bias * 0.50) * W;
        y = (0.12 + Math.random() * 0.76) * H;
      } else if (roll < 0.78) {
        /* 中部过渡带 */
        x = (0.28 + Math.random() * 0.28) * W;
        y = (0.15 + Math.random() * 0.7) * H;
      } else {
        /* 左侧少量星点，避免全空 */
        x = Math.random() * W * 0.35;
        y = (0.2 + Math.random() * 0.6) * H;
      }
      stars.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 0.7 + Math.random() * 1.8,
        tw: Math.random() * Math.PI * 2,
        a: 0.28 + Math.random() * 0.55
      });
    }
    /* 中国（东）与美国（西）附近加节点 */
    const hubs = [anchorCN, anchorUS, anchorEU];
    for (let k = 0; k < (mobile ? 8 : 14); k++) {
      const hub = hubs[k % hubs.length];
      const ang = Math.random() * Math.PI * 2;
      const dist = 18 + Math.random() * 48;
      stars.push({
        x: hub.x + Math.cos(ang) * dist,
        y: hub.y + Math.sin(ang) * dist,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: 1.2 + Math.random() * 1.5,
        tw: Math.random() * Math.PI * 2,
        a: 0.5 + Math.random() * 0.35
      });
    }
    buildLinks();
  }

  function buildLinks() {
    links = [];
    const ld = mobile ? 100 : 138;
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < ld) links.push({ a: i, b: j, d: d });
      }
    }
  }

  function spawn() {
    if (links.length < 1) return;
    /* 优先从东(中国)向西/北流动 */
    let L = links[Math.floor(Math.random() * links.length)];
    for (let t = 0; t < 8; t++) {
      const c = links[Math.floor(Math.random() * links.length)];
      const ax = stars[c.a].x, bx = stars[c.b].x;
      if (Math.max(ax, bx) > W * 0.55) { L = c; break; }
    }
    const fromEast = stars[L.a].x >= stars[L.b].x;
    packets.push({
      a: fromEast ? L.a : L.b,
      b: fromEast ? L.b : L.a,
      t: 0,
      sp: 0.006 + Math.random() * 0.012
    });
  }

  canvas.addEventListener('mousemove', function (e) {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', function () { mx = -1e4; my = -1e4; });
  window.addEventListener('resize', function () {
    mobile = window.innerWidth <= 768;
    resize();
  });
  resize();

  function drawLabels(time, px, py) {
    if (mobile && W < 400) return;
    const fade = 0.30 + 0.08 * Math.sin(time * 0.9);
    const us = { x: anchorUS.x + px, y: anchorUS.y + py };
    const cn = { x: anchorCN.x + px, y: anchorCN.y + py };
    const eu = { x: anchorEU.x + px, y: anchorEU.y + py };

    ctx.save();
    ctx.font = '500 12px "Noto Sans SC","PingFang SC",sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    function curve(a, b, lift) {
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = 'rgba(176,141,87,' + (fade * 0.5) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + lift, b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    /* 中国(东) → 美国(西)、中国 → 欧洲(北) */
    curve(cn, us, H * 0.04);
    curve(cn, eu, -H * 0.02);

    function endpoint(pt, isChina) {
      const pulse = isChina ? (0.72 + 0.28 * Math.sin(time * 2.6)) : (0.5 + fade * 0.25);
      const glowR = isChina ? (11 + 3.5 * Math.sin(time * 2.6)) : 10;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isChina ? 4.0 : 3.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,230,180,' + pulse + ')';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, glowR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(176,141,87,' + (isChina ? (0.22 + 0.18 * Math.sin(time * 2.6)) : (fade * 0.35)) + ')';
      ctx.lineWidth = isChina ? 1.3 : 1;
      ctx.stroke();
      if (isChina) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, glowR + 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(176,141,87,' + (0.07 + 0.05 * Math.sin(time * 2.6)) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    endpoint(us, false);
    endpoint(cn, true);
    endpoint(eu, false);

    ctx.fillStyle = 'rgba(255,255,255,' + fade + ')';
    ctx.fillText('美国', us.x, us.y + 22);
    ctx.fillText('中国工厂', cn.x, cn.y + 22);
    ctx.fillText('欧洲', eu.x, eu.y - 18);

    ctx.font = '400 11px "Noto Sans SC","PingFang SC",sans-serif';
    ctx.fillStyle = 'rgba(196,167,107,' + (fade * 0.85) + ')';
    ctx.fillText('连接全球客户', (cn.x + us.x) / 2, (cn.y + us.y) / 2 - 12);

    ctx.restore();
  }

  function draw(now) {
    const time = now * 0.001;
    const base = ctx.createLinearGradient(0, 0, W, H);
    base.addColorStop(0, '#0A2B20');
    base.addColorStop(0.48, '#0F3D2E');
    base.addColorStop(1, '#1F5A43');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    const g1 = ctx.createRadialGradient(W * 0.72, H * 0.38, 0, W * 0.72, H * 0.38, Math.max(W, H) * 0.65);
    g1.addColorStop(0, 'rgba(31,90,67,0.45)');
    g1.addColorStop(0.5, 'rgba(15,61,46,0.2)');
    g1.addColorStop(1, 'rgba(10,43,32,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    const g2 = ctx.createRadialGradient(W * 0.2, H * 0.7, 0, W * 0.2, H * 0.7, W * 0.45);
    g2.addColorStop(0, 'rgba(10,43,32,0.35)');
    g2.addColorStop(1, 'rgba(10,43,32,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    const px = mx > 0 ? (mx - W / 2) * 0.012 : 0;
    const py = my > 0 ? (my - H / 2) * 0.012 : 0;
    if (Math.floor(now / 480) !== Math.floor((now - 16) / 480)) buildLinks();

    for (let i = 0; i < links.length; i++) {
      const L = links[i], a = stars[L.a], b = stars[L.b];
      if (!a || !b) continue;
      const op = (1 - L.d / 138) * 0.32;
      ctx.beginPath();
      ctx.moveTo(a.x + px, a.y + py);
      ctx.lineTo(b.x + px, b.y + py);
      ctx.strokeStyle = 'rgba(176,141,87,' + op + ')';
      ctx.lineWidth = 0.65;
      ctx.stroke();
    }

    for (let k = 0; k < stars.length; k++) {
      const s = stars[k];
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 0 || s.x > W) s.vx *= -1;
      if (s.y < 0 || s.y > H) s.vy *= -1;
      const tw = 0.55 + 0.45 * Math.sin(time * 2.1 + s.tw);
      const near = Math.hypot(mx - s.x, my - s.y) < 105;
      const rr = s.r * tw * (near ? 1.55 : 1);
      const al = s.a * tw;
      ctx.beginPath();
      ctx.arc(s.x + px, s.y + py, rr * 2.3, 0, Math.PI * 2);
      ctx.fillStyle = near ? 'rgba(176,141,87,0.14)' : 'rgba(255,255,255,0.03)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s.x + px, s.y + py, rr, 0, Math.PI * 2);
      ctx.fillStyle = near
        ? 'rgba(255,230,180,' + al + ')'
        : 'rgba(210,225,220,' + (al * 0.9) + ')';
      ctx.fill();
    }

    if (packets.length < (mobile ? 8 : 18) && Math.random() < 0.12) spawn();
    for (let p = packets.length - 1; p >= 0; p--) {
      const pk = packets[p];
      pk.t += pk.sp;
      if (pk.t >= 1) { packets.splice(p, 1); continue; }
      const sa = stars[pk.a], sb = stars[pk.b];
      if (!sa || !sb) continue;
      const x = sa.x + (sb.x - sa.x) * pk.t + px;
      const y = sa.y + (sb.y - sa.y) * pk.t + py;
      ctx.beginPath();
      ctx.arc(x, y, 1.9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,220,160,0.95)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(176,141,87,0.16)';
      ctx.fill();
    }

    drawLabels(time, px, py);
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}
initNightSky('hero-canvas');



/* ===== HERO TEXT CAROUSEL ===== */
const slides=document.querySelectorAll('.carousel-slide');
const dots=document.querySelectorAll('.carousel-dot');
if(slides.length>0){
  let current=0;
  function showSlide(idx){
    slides.forEach(function(s,i){s.classList.toggle('active',i===idx);});
    dots.forEach(function(d,i){d.classList.toggle('active',i===idx);});
  }
  dots.forEach(function(d,i){d.addEventListener('click',function(){current=i;showSlide(current);});});
  setInterval(function(){current=(current+1)%slides.length;showSlide(current);},5000);
}

});
