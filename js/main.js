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
    grad.addColorStop(0,'#1F5A43');
    grad.addColorStop(0.5,'#0F3D2E');
    grad.addColorStop(1,'#0A2B20');
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
      ctx.strokeStyle='rgba(242,140,40,0.14)';
      ctx.lineWidth=1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(signalX,signalY,2.2+Math.sin(time*4+routeIndex)*0.8,0,Math.PI*2);
      ctx.fillStyle='rgba(255,248,235,0.9)';
      ctx.shadowColor='rgba(242,140,40,0.8)';
      ctx.shadowBlur=12;
      ctx.fill();
      ctx.shadowBlur=0;
    }

    ctx.beginPath();
    ctx.ellipse(routeCenterX,routeCenterY,routeRadius*1.12,routeRadius*0.34,rotationY*0.2,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,0.16)';
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
          ctx.strokeStyle='rgba(242,140,40,'+opacity+')';
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
        ctx.fillStyle='rgba(242,140,40,'+(0.06+glow*0.15)+')';
        ctx.fill();
      }

      // Middle glow
      ctx.beginPath();
      ctx.arc(p.sx,p.sy,r*2.5,0,Math.PI*2);
      ctx.fillStyle='rgba(242,140,40,'+(0.1+glow*0.2)+')';
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(p.sx,p.sy,r,0,Math.PI*2);
      if(p.isBig){
        ctx.fillStyle='rgba(255,248,235,'+Math.min(1,alpha+glow)+')';
      }else{
        ctx.fillStyle='rgba(229,231,235,'+Math.min(1,alpha*0.8+glow*0.6)+')';
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
      ctx.fillStyle='rgba(242,140,40,0.12)';
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }
  draw();
}

function initGlobalNetwork(canvasId){
  const canvas=document.getElementById(canvasId);
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  let width,height,time=0,mouseX=-9999,mouseY=-9999;
  const nodes=[
    [0.08,0.45],[0.17,0.30],[0.22,0.63],[0.34,0.40],[0.40,0.70],
    [0.51,0.28],[0.56,0.55],[0.66,0.37],[0.72,0.68],[0.83,0.30],
    [0.91,0.52],[0.77,0.50],[0.30,0.20],[0.46,0.48]
  ];
  const routes=[[0,1],[1,3],[3,5],[5,7],[7,9],[9,10],[2,4],[4,6],[6,8],[8,11],[3,13],[13,6],[5,6],[7,11]];
  const stars=[];
  for(let starIndex=0;starIndex<72;starIndex++){
    stars.push({x:(starIndex*47%101)/100,y:(starIndex*29%97)/96,size:0.5+(starIndex%4)*0.35,phase:starIndex*0.8});
  }

  function resize(){width=canvas.width=canvas.offsetWidth;height=canvas.height=canvas.offsetHeight;}
  resize();
  window.addEventListener('resize',resize);
  canvas.addEventListener('mousemove',function(e){const rect=canvas.getBoundingClientRect();mouseX=e.clientX-rect.left;mouseY=e.clientY-rect.top;});
  canvas.addEventListener('mouseleave',function(){mouseX=-9999;mouseY=-9999;});

  function point(node){return{x:width*(width<768?0.5+(node[0]-0.5)*0.95:0.18+node[0]*0.8),y:height*(0.18+node[1]*0.64)};}
  function draw(){
    time+=0.016;
    const centerX=width*(width<768?0.5:0.72),centerY=height*0.5;
    const grad=ctx.createRadialGradient(centerX,centerY,0,centerX,centerY,Math.max(width,height));
    grad.addColorStop(0,'#1F5A43');grad.addColorStop(0.48,'#0F3D2E');grad.addColorStop(1,'#0A2B20');
    ctx.fillStyle=grad;ctx.fillRect(0,0,width,height);

    // Layered atmosphere gives the network a deeper sense of distance.
    const glow=ctx.createRadialGradient(width*0.78,height*0.45,0,width*0.78,height*0.45,width*0.55);
    glow.addColorStop(0,'rgba(242,140,40,0.13)');glow.addColorStop(0.45,'rgba(31,90,67,0.07)');glow.addColorStop(1,'rgba(10,43,32,0)');
    ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    stars.forEach(function(star){
      const twinkle=0.25+0.35*(0.5+0.5*Math.sin(time*1.3+star.phase));
      ctx.beginPath();ctx.arc(width*star.x,height*star.y,star.size,0,Math.PI*2);
      ctx.fillStyle='rgba(255,255,255,'+twinkle+')';ctx.fill();
    });

    ctx.save();
    ctx.translate(width*0.73,height*0.5);ctx.rotate(-0.12+Math.sin(time*0.18)*0.04);
    const beam=ctx.createLinearGradient(-width*0.42,0,width*0.42,0);
    beam.addColorStop(0,'rgba(242,140,40,0)');beam.addColorStop(0.5,'rgba(242,140,40,0.08)');beam.addColorStop(1,'rgba(242,140,40,0)');
    ctx.fillStyle=beam;ctx.fillRect(-width*0.5,-height*0.015,width,height*0.03);ctx.restore();

    // Faint latitude bands create a global coordinate field without a globe.
    for(let band=0;band<5;band++){
      const y=height*(0.16+band*0.17);
      ctx.beginPath();ctx.moveTo(width*0.12,y);
      ctx.bezierCurveTo(width*0.38,y-22,width*0.62,y+22,width*0.92,y);
      ctx.strokeStyle='rgba(255,255,255,0.11)';ctx.lineWidth=1;ctx.stroke();
    }
    for(let meridian=0;meridian<4;meridian++){
      const x=width*(0.42+meridian*0.12)+Math.sin(time*0.3+meridian)*12;
      ctx.beginPath();ctx.moveTo(x,height*0.16);ctx.bezierCurveTo(x-55,height*0.38,x+55,height*0.62,x,height*0.84);
      ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;ctx.stroke();
    }

    routes.forEach(function(route,routeIndex){
      const start=point(nodes[route[0]]),end=point(nodes[route[1]]);
      const controlX=(start.x+end.x)/2,controlY=Math.min(start.y,end.y)-height*(0.08+routeIndex%3*0.035);
      ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.quadraticCurveTo(controlX,controlY,end.x,end.y);
      ctx.strokeStyle=routeIndex%3===0?'rgba(242,140,40,0.25)':'rgba(255,255,255,0.28)';ctx.lineWidth=1.2+(routeIndex%3)*0.35;ctx.stroke();
      const progress=(time*(0.12+routeIndex%3*0.035)+routeIndex*0.11)%1;
      const inverse=1-progress;
      const signalX=inverse*inverse*start.x+2*inverse*progress*controlX+progress*progress*end.x;
      const signalY=inverse*inverse*start.y+2*inverse*progress*controlY+progress*progress*end.y;
      ctx.beginPath();ctx.arc(signalX,signalY,2.4+Math.sin(time*5+routeIndex)*0.7,0,Math.PI*2);
      ctx.fillStyle='rgba(255,248,235,0.95)';ctx.shadowColor='rgba(242,140,40,0.8)';ctx.shadowBlur=14;ctx.fill();ctx.shadowBlur=0;
    });

    nodes.forEach(function(node,nodeIndex){
      const position=point(node),dx=mouseX-position.x,dy=mouseY-position.y;
      const distance=Math.sqrt(dx*dx+dy*dy),focus=distance<150?1-distance/150:0;
      const pulse=1+Math.sin(time*2.2+nodeIndex)*0.2;
      ctx.beginPath();ctx.arc(position.x,position.y,(nodeIndex%4===0?5:3)*pulse+focus*3,0,Math.PI*2);
      ctx.fillStyle='rgba(255,248,235,0.95)';ctx.shadowColor='rgba(242,140,40,0.75)';ctx.shadowBlur=10+focus*14;ctx.fill();ctx.shadowBlur=0;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

initGlobalNetwork('hero-canvas');

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
