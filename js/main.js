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

/* Night-sky network — 深邃夜空 + 连线 + 数据流（无大球） */
function initNightSky(canvasId){
  const canvas=document.getElementById(canvasId);
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  let W=0,H=0,dpr=Math.min(window.devicePixelRatio||1,2);
  let stars=[],links=[],packets=[],mx=-1e4,my=-1e4,mobile=window.innerWidth<=768;
  function count(){const dens=mobile?1/11000:1/7500;return Math.max(mobile?40:70,Math.min(mobile?90:160,Math.floor(W*H*dens)));}
  function resize(){const r=canvas.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);seed();}
  function seed(){stars=[];const n=count();for(let i=0;i<n;i++){let x;if(Math.random()<0.72){const bias=Math.pow(Math.random(),0.65);x=(0.32+bias*0.68)*W;}else x=Math.random()*W;stars.push({x:x,y:Math.random()*H,vx:(Math.random()-0.5)*0.25,vy:(Math.random()-0.5)*0.25,r:0.7+Math.random()*1.7,tw:Math.random()*Math.PI*2,a:0.3+Math.random()*0.5});}buildLinks();}
  function buildLinks(){links=[];const ld=mobile?95:130;for(let i=0;i<stars.length;i++){for(let j=i+1;j<stars.length;j++){const dx=stars[i].x-stars[j].x,dy=stars[i].y-stars[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<ld)links.push({a:i,b:j,d:d});}}}
  function spawn(){if(links.length<1)return;const L=links[Math.floor(Math.random()*links.length)];packets.push({a:L.a,b:L.b,t:0,sp:0.007+Math.random()*0.012});}
  canvas.addEventListener('mousemove',function(e){const r=canvas.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;});
  canvas.addEventListener('mouseleave',function(){mx=-1e4;my=-1e4;});
  window.addEventListener('resize',function(){mobile=window.innerWidth<=768;resize();});
  resize();
  function draw(now){
    const time=now*0.001;
    /* 与 GitHub 原版 Hero 绿阶一致 */
    const base=ctx.createLinearGradient(0,0,W,H);
    base.addColorStop(0,'#0A2B20');
    base.addColorStop(0.48,'#0F3D2E');
    base.addColorStop(1,'#1F5A43');
    ctx.fillStyle=base;ctx.fillRect(0,0,W,H);
    const g1=ctx.createRadialGradient(W*0.72,H*0.38,0,W*0.72,H*0.38,Math.max(W,H)*0.65);
    g1.addColorStop(0,'rgba(31,90,67,0.45)');
    g1.addColorStop(0.5,'rgba(15,61,46,0.2)');
    g1.addColorStop(1,'rgba(10,43,32,0)');
    ctx.fillStyle=g1;ctx.fillRect(0,0,W,H);
    const g2=ctx.createRadialGradient(W*0.2,H*0.7,0,W*0.2,H*0.7,W*0.45);
    g2.addColorStop(0,'rgba(10,43,32,0.35)');
    g2.addColorStop(1,'rgba(10,43,32,0)');
    ctx.fillStyle=g2;ctx.fillRect(0,0,W,H);
    const px=mx>0?(mx-W/2)*0.012:0,py=my>0?(my-H/2)*0.012:0;
    if(Math.floor(now/480)!==Math.floor((now-16)/480))buildLinks();
    for(let i=0;i<links.length;i++){const L=links[i],a=stars[L.a],b=stars[L.b];if(!a||!b)continue;const op=(1-L.d/130)*0.3;ctx.beginPath();ctx.moveTo(a.x+px,a.y+py);ctx.lineTo(b.x+px,b.y+py);ctx.strokeStyle='rgba(176,141,87,'+op+')';ctx.lineWidth=0.65;ctx.stroke();}
    for(let k=0;k<stars.length;k++){const s=stars[k];s.x+=s.vx;s.y+=s.vy;if(s.x<0||s.x>W)s.vx*=-1;if(s.y<0||s.y>H)s.vy*=-1;const tw=0.55+0.45*Math.sin(time*2.1+s.tw);const near=Math.hypot(mx-s.x,my-s.y)<105;const rr=s.r*tw*(near?1.55:1),al=s.a*tw;ctx.beginPath();ctx.arc(s.x+px,s.y+py,rr*2.3,0,Math.PI*2);ctx.fillStyle=near?'rgba(176,141,87,0.14)':'rgba(255,255,255,0.025)';ctx.fill();ctx.beginPath();ctx.arc(s.x+px,s.y+py,rr,0,Math.PI*2);ctx.fillStyle=near?'rgba(255,230,180,'+al+')':'rgba(210,225,220,'+(al*0.9)+')';ctx.fill();}
    if(packets.length<(mobile?7:14)&&Math.random()<0.1)spawn();
    for(let p=packets.length-1;p>=0;p--){const pk=packets[p];pk.t+=pk.sp;if(pk.t>=1){packets.splice(p,1);continue;}const sa=stars[pk.a],sb=stars[pk.b];if(!sa||!sb)continue;const x=sa.x+(sb.x-sa.x)*pk.t+px,y=sa.y+(sb.y-sa.y)*pk.t+py;ctx.beginPath();ctx.arc(x,y,1.9,0,Math.PI*2);ctx.fillStyle='rgba(255,220,160,0.95)';ctx.fill();ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fillStyle='rgba(176,141,87,0.16)';ctx.fill();}
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
