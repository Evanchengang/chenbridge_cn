/* ===== ChenBridge Studio ===== */
document.addEventListener('DOMContentLoaded', function() {

  /* --- Logo Intro Animation --- */
  const splash = document.getElementById('splash');
  if (splash) {
    // Force show splash first
    splash.style.display = 'flex';

    // Hide after 3 seconds
    setTimeout(function() {
      splash.classList.add('hide');
      setTimeout(function() {
        splash.style.display = 'none';
      }, 800);
    }, 3000);
  }

  /* --- Header Scroll (throttled) --- */
  const header = document.getElementById('header');
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        if (window.scrollY > 60) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  });

  /* --- Mobile Menu --- */
  const mobileToggle = document.getElementById('mobile-toggle');
  const mainNav = document.getElementById('main-nav');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', function() {
      mainNav.classList.toggle('open');
    });
  }

  /* --- Smooth Scroll --- */
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (mainNav) mainNav.classList.remove('open');
      }
    });
  });

  /* --- Scroll Reveal --- */
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  revealElements.forEach(function(el) { revealObserver.observe(el); });

  /* --- Counter Animation --- */
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const start = performance.now();
        function updateCounter(currentTime) {
          const elapsed = currentTime - start;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          counter.textContent = Math.floor(easeProgress * target);
          if (progress < 1) { requestAnimationFrame(updateCounter); }
          else { counter.textContent = target; }
        }
        requestAnimationFrame(updateCounter);
        counterObserver.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(function(counter) { counterObserver.observe(counter); });

  /* --- Hero Canvas Network Animation (Black bg, White particles, SLOW) --- */
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    const isMobile = window.innerWidth <= 768;
    const nodeCount = isMobile ? 20 : 40;
    const connectionDistance = 200;
    const nodes = [];

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Create nodes - SLOW speed
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        radius: 1.5 + Math.random() * 2.5,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    let mouseX = width * 0.5;
    let mouseY = height * 0.5;
    canvas.addEventListener('mousemove', function(e) {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    function draw() {
      // Pure black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      const time = Date.now() * 0.001;

      // Draw connections - WHITE
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.25;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = 'rgba(255,255,255,' + opacity + ')';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw nodes - WHITE with slow pulse
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const pulse = 1 + 0.2 * Math.sin(time * 1.5 + node.pulsePhase);
        const r = node.radius * pulse;

        // Glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fill();
      }

      // Update positions - VERY SLOW
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        // Mouse parallax - subtle
        const mdx = mouseX - node.x;
        const mdy = mouseY - node.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 250) {
          node.vx += mdx * 0.00002;
          node.vy += mdy * 0.00002;
        }

        // Bounce
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Keep in bounds
        node.x = Math.max(0, Math.min(width, node.x));
        node.y = Math.max(0, Math.min(height, node.y));

        // Speed limit - very slow
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (speed > 0.4) {
          node.vx *= 0.4 / speed;
          node.vy *= 0.4 / speed;
        }
      }

      requestAnimationFrame(draw);
    }
    draw();
  }

});
