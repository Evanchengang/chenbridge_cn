/* ===== ChenBridge Studio ===== */
document.addEventListener('DOMContentLoaded', function() {

  /* --- Splash Screen --- */
  const splash = document.getElementById('splash');
  if (splash) {
    setTimeout(function() {
      splash.classList.add('hide');
      setTimeout(function() {
        splash.style.display = 'none';
      }, 800);
    }, 2500);
  }

  /* --- Header Scroll --- */
  const header = document.getElementById('header');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  /* --- Mobile Menu --- */
  const mobileToggle = document.getElementById('mobile-toggle');
  const mainNav = document.getElementById('main-nav');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', function() {
      mainNav.classList.toggle('open');
      const spans = mobileToggle.querySelectorAll('span');
      if (mainNav.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '1';
        spans[2].style.transform = '';
      }
    });
  }

  /* --- Smooth Scroll --- */
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (mainNav) mainNav.classList.remove('open');
      }
    });
  });

  /* --- Hero Slider --- */
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('#hero-dots span');
  let currentSlide = 0;
  const slideInterval = 5000;

  function showSlide(index) {
    slides.forEach(function(s) { s.classList.remove('active'); });
    dots.forEach(function(d) { d.classList.remove('active'); });
    slides[index].classList.add('active');
    dots[index].classList.add('active');
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  if (slides.length > 1) {
    setInterval(nextSlide, slideInterval);
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        currentSlide = i;
        showSlide(currentSlide);
      });
    });
  }

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

  revealElements.forEach(function(el) {
    revealObserver.observe(el);
  });

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
          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target;
          }
        }
        requestAnimationFrame(updateCounter);
        counterObserver.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function(counter) {
    counterObserver.observe(counter);
  });

});
