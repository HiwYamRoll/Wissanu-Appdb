/* ============================================
   HANDMADE PROFILE CARD — script.js
   Vanilla JS. No frameworks.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initCardTilt();
  initCrownInteraction();
  initProjectFilter();
  initSmoothScroll();
  initRevealOnScroll();
  initProgressBar();
});

/* ------------------------------------------
   1. DARK / LIGHT THEME
   ------------------------------------------ */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  const icon = toggle.querySelector('.theme-icon');
  const root = document.documentElement;

  const saved = getSavedTheme();
  if (saved) {
    root.setAttribute('data-theme', saved);
    icon.textContent = saved === 'dark' ? '☾' : '☀';
  }

  toggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    icon.textContent = next === 'dark' ? '☾' : '☀';
    saveTheme(next);
  });
}

// In-memory fallback since localStorage may be unavailable in some sandboxes
let themeMemory = null;
function getSavedTheme() {
  try {
    return localStorage.getItem('profile-theme') || themeMemory;
  } catch (e) {
    return themeMemory;
  }
}
function saveTheme(value) {
  themeMemory = value;
  try {
    localStorage.setItem('profile-theme', value);
  } catch (e) {
    /* ignore, use in-memory only */
  }
}

/* ------------------------------------------
   2. CARD TILT (mouse-follow, subtle)
   ------------------------------------------ */
function initCardTilt() {
  const card = document.getElementById('idCard');
  if (!card) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const MAX_TILT = 6; // degrees, kept subtle

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const tiltX = x * MAX_TILT * 2;   // rotateY
    const tiltY = -y * MAX_TILT * 2;  // rotateX

    card.style.setProperty('--tilt-x', `${tiltX}deg`);
    card.style.setProperty('--tilt-y', `${tiltY}deg`);
  });

  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  });
}

/* ------------------------------------------
   3. CROWN CLICK: sparkles + card shake
   ------------------------------------------ */
function initCrownInteraction() {
  const crownBtn = document.getElementById('crownBtn');
  const card = document.getElementById('idCard');
  const sparkleLayer = crownBtn ? crownBtn.querySelector('.sparkles') : null;
  if (!crownBtn || !card || !sparkleLayer) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  crownBtn.addEventListener('click', () => {
    spawnSparkles(sparkleLayer, prefersReduced);

    if (!prefersReduced) {
      card.classList.remove('shake');
      // force reflow so animation can restart if clicked repeatedly
      void card.offsetWidth;
      card.classList.add('shake');
    }
  });
}

function spawnSparkles(layer, prefersReduced) {
  const count = prefersReduced ? 0 : 6;
  const glyphs = ['✦', '✧', '☆', '♡'];

  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];

    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const distance = 30 + Math.random() * 20;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    s.style.left = '50%';
    s.style.top = '50%';
    s.style.transform = 'translate(-50%, -50%)';
    s.style.transition = 'transform 0.7s ease-out, opacity 0.7s ease-out';

    layer.appendChild(s);

    // trigger animation on next frame
    requestAnimationFrame(() => {
      s.style.opacity = '1';
      s.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1.2)`;
    });

    setTimeout(() => {
      s.style.opacity = '0';
    }, 500);

    setTimeout(() => {
      s.remove();
    }, 750);
  }
}

/* ------------------------------------------
   4. PROJECT FILTER
   ------------------------------------------ */
function initProjectFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  const emptyNote = document.getElementById('emptyNote');
  if (!buttons.length || !cards.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filter = btn.dataset.filter;
      let visibleCount = 0;

      cards.forEach((card) => {
        const match = filter === 'all' || card.dataset.cat === filter;
        card.classList.toggle('is-hidden', !match);
        if (match) visibleCount++;
      });

      if (emptyNote) emptyNote.hidden = visibleCount !== 0;
    });
  });
}

/* ------------------------------------------
   5. SMOOTH SCROLL for nav links
   ------------------------------------------ */
function initSmoothScroll() {
  document.querySelectorAll('.hand-nav a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ------------------------------------------
   6. REVEAL ON SCROLL (Intersection Observer)
   ------------------------------------------ */
function initRevealOnScroll() {
  const sections = document.querySelectorAll('.reveal');
  if (!sections.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    sections.forEach((s) => s.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  sections.forEach((s) => observer.observe(s));
}

/* ------------------------------------------
   7. PROGRESS BAR fill (animate once visible)
   ------------------------------------------ */
function initProgressBar() {
  const track = document.querySelector('.progress-track');
  if (!track) return;

  if (!('IntersectionObserver' in window)) {
    track.classList.add('animate');
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          track.classList.add('animate');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  observer.observe(track);
}
