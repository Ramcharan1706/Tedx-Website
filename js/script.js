document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger');
  const navMenu = document.getElementById('navMenu');
  const mobileMenu = document.getElementById('mobileMenu'); // Optional mobile-specific menu
  const header = document.getElementById('siteHeader');
  const toTop = document.getElementById('toTop');

  // Mobile menu toggle
  if (burger) {
    burger.addEventListener('click', () => {
      const expanded = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!expanded));

      // If you use a separate mobile menu container
      if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
      } else if (navMenu) {
        navMenu.classList.toggle('open'); // Fallback if navMenu is reused
        navMenu.setAttribute('aria-hidden', String(expanded));
      }
    });
  }

  // Close mobile menu on link click (mobile UX best practice)
  const navLinks = document.querySelectorAll('#navMenu a, #mobileMenu a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1024) {
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
          burger.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // Scroll-related effects
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

  // Reveal animations
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Footer year
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Spline loading fallback
  const spline = document.getElementById('splineCanvas');
  const splineFallback = document.getElementById('splineFallback');
  let splineReady = false;

  if (spline) {
    const timeout = setTimeout(() => {
      if (!splineReady && splineFallback) {
        splineFallback.style.opacity = '1';
      }
    }, 4000);

    spline.addEventListener('load', () => {
      splineReady = true;
      if (splineFallback) splineFallback.style.opacity = '0';
      clearTimeout(timeout);
    });
  }

  // Subtle parallax (disable on mobile for performance)
  const splineWrap = document.querySelector('.spline-wrap');
  let ticking = false;

  const parallax = () => {
    if (!splineWrap || window.innerWidth < 768) return;

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

  // Contact form submission with validation
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());

      if (!data.name || !data.email || !data.message) {
        status.textContent = 'Please fill in all required fields.';
        status.style.color = 'var(--accent)';
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(data.email)) {
        status.textContent = 'Please enter a valid email address.';
        status.style.color = 'var(--accent)';
        return;
      }

      status.textContent = 'Sending...';
      status.style.color = 'var(--ink)';

      setTimeout(() => {
        status.textContent = `Thanks ${data.name}! Your message has been received. Our team will get back soon.`;
        status.style.color = 'var(--ink)';
        form.reset();
      }, 800);
    });
  }

  // Active nav highlighting (section spy)
  const sections = Array.from(document.querySelectorAll('section[id]'));

  let activeTicking = false;
  const spy = () => {
    if (!activeTicking) {
      window.requestAnimationFrame(() => {
        const pos = window.scrollY + 120;

        sections.forEach(sec => {
          const top = sec.offsetTop;
          const bottom = top + sec.offsetHeight;
          const href = `#${sec.id}`;

          navLinks.forEach(link => {
            if (link.getAttribute('href') === href) {
              if (pos >= top && pos < bottom) {
                link.classList.add('text-white');
              } else {
                link.classList.remove('text-white');
              }
            }
          });
        });

        activeTicking = false;
      });

      activeTicking = true;
    }
  };

  window.addEventListener('scroll', spy, { passive: true });
  spy(); // Run once on load

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});



// About Section Tabs
document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.tab;

      // Remove active state from all buttons & panes
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));

      // Add active state to clicked button & corresponding pane
      button.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });
});
