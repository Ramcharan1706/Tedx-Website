
document.addEventListener('DOMContentLoaded', () => {
  
  const burger = document.getElementById('burger');
  const navMenu = document.getElementById('navMenu');

  if (burger && navMenu) {
    burger.addEventListener('click', () => {
      const expanded = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('open');
      
      navMenu.setAttribute('aria-hidden', String(expanded));
    });
  }


  const header = document.getElementById('siteHeader');
  const toTop = document.getElementById('toTop');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 12;

    if (header) {
      header.style.boxShadow = scrolled ? '0 10px 30px rgba(0,0,0,.25)' : 'none';
    }

    if (toTop) {
      if (window.scrollY > 480) {
        toTop.classList.add('show');
      } else {
        toTop.classList.remove('show');
      }
    }
  });

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Set current year in footer
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Spline fallback detection (Improved)
  const spline = document.getElementById('splineCanvas');
  const splineFallback = document.getElementById('splineFallback');
  let splineReady = false;

  // Assuming splineCanvas is an iframe or img; canvas doesn't fire load
  if (spline) {
    const readyTimeout = setTimeout(() => {
      if (!splineReady && splineFallback) {
        splineFallback.style.opacity = '1';
      }
    }, 4000);

    // If iframe or img:
    spline.addEventListener('load', () => {
      splineReady = true;
      if (splineFallback) {
        splineFallback.style.opacity = '0';
      }
      clearTimeout(readyTimeout);
    });
  }

  // Subtle parallax on scroll for hero 3D with throttling
  const splineWrap = document.querySelector('.spline-wrap');
  let ticking = false;

  const parallax = () => {
    if (!splineWrap) return;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 400);
        splineWrap.style.transform = `translateY(${y * -0.06}px) scale(${1 + y / 10000})`;
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', parallax, { passive: true });

  // Contact form handling with basic validation
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(form).entries());

      // Basic validation
      if (!data.name || !data.email || !data.message) {
        status.textContent = 'Please fill in all required fields.';
        status.style.color = 'var(--accent)';
        return;
      }

      // Simple email regex check (basic)
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(data.email)) {
        status.textContent = 'Please enter a valid email address.';
        status.style.color = 'var(--accent)';
        return;
      }

      status.textContent = 'Sending...';
      status.style.color = 'var(--ink)';

      // Simulate form submission
      setTimeout(() => {
        status.textContent = `Thanks ${data.name}! Your message has been received. Our team will get back soon.`;
        status.style.color = 'var(--ink)';
        form.reset();
      }, 800);
    });
  }

  // Active navigation highlighting with throttling
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = Array.from(document.querySelectorAll('#navMenu a[href^="#"]'));

  let activeTicking = false;
  const spy = () => {
    if (!activeTicking) {
      window.requestAnimationFrame(() => {
        const pos = window.scrollY + 120;

        sections.forEach(sec => {
          const top = sec.offsetTop;
          const bottom = top + sec.offsetHeight;
          const link = navLinks.find(a => a.getAttribute('href') === '#' + sec.id);

          if (!link) return;

          if (pos >= top && pos < bottom) {
            link.classList.add('text-white');
          } else {
            link.classList.remove('text-white');
          }
        });

        activeTicking = false;
      });

      activeTicking = true;
    }
  };

  window.addEventListener('scroll', spy, { passive: true });
  spy(); // Initial call

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });
});
