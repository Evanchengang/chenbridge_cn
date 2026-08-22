document.addEventListener('DOMContentLoaded',function(){

/* Splash */
const splash=document.getElementById('splash');
if(splash){
  splash.style.display='flex';
  setTimeout(function(){splash.classList.add('hide');setTimeout(function(){splash.style.display='none';},800);},3000);
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
function initSphere(canvasId){
  const canvas=document.getElementById(canvasId);
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  let width,height;

  // Sphere config
  const PARTICLE_COUNT=280;
  const CONNECTION_DIST=90;
  const MOUSE_RADIUS=200;

  let centerX,centerY,sphereR;
  let rotationY=0;
  let rotationX=0.3;
  let mouseX=-9999,mouseY=-9999;
  let time=0;

  function resize(){
    width=canvas.width=canvas.offsetWidth;
    height=canvas.height=canvas.offsetHeight;
    centerX=width*0.72;  // 偏右侧
    centerY=height*0.5;
    sphereR=Math.min(width,height)*0.38;
    if(width<768){centerX=width*0.5;sphereR=Math.min(width,height)*0.42;}
  }
  resize();
  window.addEventListener('resize',resize);

  // Create particles on sphere surface (Fibonacci sphere)
  const particles=[];
  const goldenAngle=Math.PI*(3-Math.sqrt(5));
  for(let i=0;i<PARTICLE_COUNT;i++){
    const y=1-(i/(PARTICLE_COUNT-1))*2;
    const radiusAtY=Math.sqrt(1-y*y);
    const theta=goldenAngle*i;
    const x=Math.cos(theta)*radiusAtY;
    const z=Math.sin(theta)*radiusAtY;
    particles.push({
      ox:x,oy:y,oz:z,  // original positions
      x:0,y:0,z:0,      // rotated positions
      sx:0,sy:0,        // screen positions
      isBig:(i%35===0), // every 35th is a big node
      pulsePhase:Math.random()*Math.PI*2,
      brightness:0.5+Math.random()*0.5
    });
  }

  canvas.addEventListener('mousemove',function(e){
    const rect=canvas.getBoundingClientRect();
    mouseX=e.clientX-rect.left;
    mouseY=e.clientY-rect.top;
  });
  canvas.addEventListener('mouseleave',function(){mouseX=-9999;mouseY=-9999;});

  function project(x,y,z){
    const fov=800;
    const scale=fov/(fov+z);
    return {
      x:centerX+x*sphereR*scale,
      y:centerY+y*sphereR*scale,
      scale:scale,
      z:z
    };
  }

  function rotate(x,y,z,rx,ry){
    // rotate around X
    let y1=y*Math.cos(rx)-z*Math.sin(rx);
    let z1=y*Math.sin(rx)+z*Math.cos(rx);
    // rotate around Y
    let x1=x*Math.cos(ry)+z1*Math.sin(ry);
    let z2=-x*Math.sin(ry)+z1*Math.cos(ry);
    return{x:x1,y:y1,z:z2};
  }

  function draw(){
    time+=0.016;
    rotationY+=0.003;  // auto rotate
    rotationX=0.25+Math.sin(time*0.3)*0.08;

    // Background gradient
    const grad=ctx.createRadialGradient(centerX,centerY,0,centerX,centerY,Math.max(width,height));
    grad.addColorStop(0,'#0F3D2E');
    grad.addColorStop(0.5,'#0A2B20');
    grad.addColorStop(1,'#051a12');
    ctx.fillStyle=grad;
    ctx.fillRect(0,0,width,height);

    // Draw animated orbital routes to suggest a live global network.
    const routeCenterX=width*0.72;
    const routeCenterY=height*0.5;
    const routeRadius=Math.min(width,height)*0.34;
    for(let routeIndex=0;routeIndex<5;routeIndex++){
      const routeAngle=routeIndex*1.2+time*0.08;
      const routeStartX=routeCenterX+Math.cos(routeAngle)*routeRadius;
      const routeStartY=routeCenterY+Math.sin(routeAngle)*routeRadius*0.42;
      const routeEndX=routeCenterX+Math.cos(routeAngle+1.7)*routeRadius;
      const routeEndY=routeCenterY+Math.sin(routeAngle+1.7)*routeRadius*0.42;
      const routeLift=routeRadius*(0.28+routeIndex*0.025);
      const routeProgress=(time*0.16+routeIndex*0.2)%1;
      const signalX=routeStartX+(routeEndX-routeStartX)*routeProgress;
      const signalY=routeStartY+(routeEndY-routeStartY)*routeProgress-routeLift*Math.sin(Math.PI*routeProgress);

      ctx.beginPath();
      ctx.moveTo(routeStartX,routeStartY);
      ctx.quadraticCurveTo(routeCenterX,routeCenterY-routeLift,routeEndX,routeEndY);
      ctx.strokeStyle='rgba(108,218,195,0.14)';
      ctx.lineWidth=1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(signalX,signalY,2.2+Math.sin(time*4+routeIndex)*0.8,0,Math.PI*2);
      ctx.fillStyle='rgba(242,185,153,0.9)';
      ctx.shadowColor='rgba(217,108,74,0.8)';
      ctx.shadowBlur=12;
      ctx.fill();
      ctx.shadowBlur=0;
    }

    ctx.beginPath();
    ctx.ellipse(routeCenterX,routeCenterY,routeRadius*1.12,routeRadius*0.34,rotationY*0.2,0,Math.PI*2);
    ctx.strokeStyle='rgba(185,236,220,0.16)';
    ctx.lineWidth=1;
    ctx.stroke();

    // Rotate and project all particles
    for(let i=0;i<particles.length;i++){
      const p=particles[i];
      const r=rotate(p.ox,p.oy,p.oz,rotationX,rotationY);
      p.x=r.x;p.y=r.y;p.z=r.z;
      const proj=project(r.x,r.y,r.z);
      p.sx=proj.x;p.sy=proj.y;p.scale=proj.scale;
    }

    // Sort by Z for proper depth rendering
    particles.sort(function(a,b){return a.z-b.z;});

    // Draw connections (only for visible/front particles)
    for(let i=0;i<particles.length;i++){
      const p1=particles[i];
      if(p1.z<-0.3)continue; // skip back-facing
      for(let j=i+1;j<particles.length;j++){
        const p2=particles[j];
        if(p2.z<-0.3)continue;
        const dx=p1.sx-p2.sx;
        const dy=p1.sy-p2.sy;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<CONNECTION_DIST){
          const opacity=(1-dist/CONNECTION_DIST)*0.25*Math.min(p1.scale,p2.scale);
          ctx.beginPath();
          ctx.moveTo(p1.sx,p1.sy);
          ctx.lineTo(p2.sx,p2.sy);
          ctx.strokeStyle='rgba(176,141,87,'+opacity+')';
          ctx.lineWidth=0.6*p1.scale;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for(let i=0;i<particles.length;i++){
      const p=particles[i];
      if(p.z<-0.5)continue; // hide deep back

      const pulse=1+0.25*Math.sin(time*2.5+p.pulsePhase);
      const baseR=p.isBig?3.2:1.4;
      const r=baseR*p.scale*pulse;

      // Mouse glow
      const mdx=mouseX-p.sx,mdy=mouseY-p.sy;
      const mdist=Math.sqrt(mdx*mdx+mdy*mdy);
      let glow=0;
      if(mdist<MOUSE_RADIUS)glow=(1-mdist/MOUSE_RADIUS);

      const alpha=Math.max(0.15,(p.z+1)/2*0.9+glow*0.4);

      // Outer glow for big nodes
      if(p.isBig||glow>0.1){
        ctx.beginPath();
        ctx.arc(p.sx,p.sy,r*(p.isBig?6:4),0,Math.PI*2);
        ctx.fillStyle='rgba(176,141,87,'+(0.06+glow*0.15)+')';
        ctx.fill();
      }

      // Middle glow
      ctx.beginPath();
      ctx.arc(p.sx,p.sy,r*2.5,0,Math.PI*2);
      ctx.fillStyle='rgba(200,180,140,'+(0.1+glow*0.2)+')';
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(p.sx,p.sy,r,0,Math.PI*2);
      if(p.isBig){
        ctx.fillStyle='rgba(255,245,220,'+Math.min(1,alpha+glow)+')';
      }else{
        ctx.fillStyle='rgba(220,210,190,'+Math.min(1,alpha*0.8+glow*0.6)+')';
      }
      ctx.fill();

      // Sparkle near mouse
      if(glow>0.3){
        ctx.beginPath();
        ctx.arc(p.sx,p.sy,r*4,0,Math.PI*2);
        ctx.fillStyle='rgba(255,255,255,'+glow*0.15+')';
        ctx.fill();
      }
    }

    // Ambient floating particles around sphere (atmosphere)
    const ambientCount=40;
    for(let i=0;i<ambientCount;i++){
      const angle=time*0.2+i*(Math.PI*2/ambientCount);
      const distR=sphereR*(1.15+0.15*Math.sin(time*0.5+i));
      const ax=centerX+Math.cos(angle)*distR;
      const ay=centerY+Math.sin(angle*0.7+time*0.1)*distR*0.3;
      const aR=0.8+0.5*Math.sin(time*2+i);
      ctx.beginPath();
      ctx.arc(ax,ay,aR,0,Math.PI*2);
      ctx.fillStyle='rgba(176,141,87,0.12)';
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }
  draw();
}

initSphere('hero-canvas');

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
