// Loader
const loader = document.getElementById('loader');
if (loader) {
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 400);
  });
}

// Light / dark mode toggle
// (initial theme is already set by the inline script in <head> to avoid a flash)
const themeToggle = document.getElementById('theme-toggle');
const THEME_KEY = 'lxa-theme';

if (themeToggle) {
  const themeColorMeta = document.getElementById('theme-color-meta');

  const setThemeIcon = (theme) => {
    const icon = themeToggle.querySelector('i');
    if (!icon) return;
    icon.classList.toggle('fa-sun', theme === 'light');
    icon.classList.toggle('fa-moon', theme !== 'light');
  };

  setThemeIcon(document.documentElement.getAttribute('data-theme') || 'dark');

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    setThemeIcon(next);
    if (themeColorMeta) themeColorMeta.setAttribute('content', next === 'light' ? '#FAFAF9' : '#050505');
  });
}

// Header scroll state
const header = document.querySelector('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// Mobile nav toggle
const menuBtn = document.querySelector('.menu-btn');
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelector('.nav-links');

const closeMobileMenu = () => {
  if (!navbar || !menuBtn) return;
  navbar.classList.remove('active');
  document.body.classList.remove('nav-open');
  menuBtn.setAttribute('aria-expanded', 'false');
  const icon = menuBtn.querySelector('i');
  if (icon) {
    icon.classList.add('fa-bars');
    icon.classList.remove('fa-xmark');
  }
};

if (menuBtn && navbar && navLinks) {
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.setAttribute('aria-label', 'Toggle navigation menu');

  menuBtn.addEventListener('click', () => {
    const isOpen = navbar.classList.toggle('active');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('nav-open', isOpen);
    const icon = menuBtn.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-xmark');
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
}

// Page-switching for About / Projects / Contact —
// these open as standalone pages (everything else hidden, view resets to top).
// Home, Services, and Process stay together as the main scrolling page.
const MAIN_VIEW_IDS = ['home', 'services', 'process', 'testimonials', 'faq'];
const STANDALONE_IDS = ['about', 'projects', 'contact', 'privacy'];
const ALL_VIEW_IDS = [...MAIN_VIEW_IDS, ...STANDALONE_IDS];

const showMainView = () => {
  ALL_VIEW_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('page-hidden', !MAIN_VIEW_IDS.includes(id));
  });
  setFloatingCtaVisibility(true);
  // The hero canvas may be stale if the window was resized while it was hidden.
  window.dispatchEvent(new Event('resize'));
};

const setFloatingCtaVisibility = (visible) => {
  const cta = document.querySelector('.floating-cta');
  if (cta) cta.classList.toggle('page-hidden', !visible);
};

const showStandalonePage = (targetId) => {
  ALL_VIEW_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('page-hidden', id !== targetId);
  });

  // The Contact page already has its own Book Now / Call buttons — no need for the floating duplicate there.
  setFloatingCtaVisibility(targetId !== 'contact');

  // Move focus to the new "page" so keyboard and screen-reader users land there too.
  const target = document.getElementById(targetId);
  if (target) {
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
};

// Normalize to the default view on load (HTML already encodes this via classes,
// this just keeps things consistent if markup and script ever drift apart).
showMainView();

// If the page was loaded with a hash already in the URL (a bookmark, a shared link,
// or a refresh while on a standalone page), route to it immediately instead of
// silently falling back to the homepage.
(function routeInitialHash() {
  const initialId = window.location.hash.slice(1);
  if (!initialId || !ALL_VIEW_IDS.includes(initialId)) return;

  if (STANDALONE_IDS.includes(initialId)) {
    showStandalonePage(initialId);
    window.scrollTo(0, 0);
  } else {
    requestAnimationFrame(() => {
      const target = document.getElementById(initialId);
      if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  }
})();

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href').slice(1);
    if (!ALL_VIEW_IDS.includes(targetId)) return;

    e.preventDefault();

    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', `#${targetId}`);
    }

    if (STANDALONE_IDS.includes(targetId)) {
      showStandalonePage(targetId);
      window.scrollTo(0, 0);
    } else {
      showMainView();
      requestAnimationFrame(() => {
        const target = document.getElementById(targetId);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  });
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

if (sections.length && navAnchors.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(sec => sectionObserver.observe(sec));
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Shared "project form" logic — used by both the Contact section form
// and the Start a Project modal form. They're two separate <form> elements
// (different ids so they don't collide), wired up identically here.
const BOOKING_EMAIL = 'acenobs@gmail.com';

// Get a free access key at https://web3forms.com (just an email signup, no domain
// verification needed) and paste it below. Until you do, submissions automatically
// fall back to opening the visitor's email app instead — same as before.
const WEB3FORMS_ACCESS_KEY = '9fc1de5d-1586-4a6e-b0f7-18298ce7730c';

// Service checkboxes reveal their own detail textarea when checked
document.querySelectorAll('.service-checkbox input[type="checkbox"]').forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    const option = checkbox.closest('.service-option');
    if (option) option.classList.toggle('active', checkbox.checked);
  });
});

function initProjectForm(formEl) {
  if (!formEl) return;

  const wrapper = formEl.closest('.project-form-wrapper');
  const statusEl = formEl.querySelector('.form-status');
  const successEl = wrapper ? wrapper.querySelector('.form-success') : null;
  const submitBtn = formEl.querySelector('button[type="submit"]');

  const showSuccess = () => {
    if (successEl) {
      formEl.hidden = true;
      successEl.hidden = false;
    } else if (statusEl) {
      statusEl.classList.remove('error');
      statusEl.textContent = "Thanks — we'll get back to you within 24 hours to talk more.";
    }
  };

  const sendViaMailto = (subject, body) => {
    const mailtoLink = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    showSuccess();
  };

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();

    const checkedServices = Array.from(
      formEl.querySelectorAll('input[name="services"]:checked')
    );

    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      if (statusEl) {
        statusEl.textContent = 'Please fill in the required fields.';
        statusEl.classList.add('error');
      }
      return;
    }

    if (checkedServices.length === 0) {
      if (statusEl) {
        statusEl.textContent = 'Please select at least one service.';
        statusEl.classList.add('error');
      }
      return;
    }

    const getValue = (name) => {
      const el = formEl.querySelector(`[name="${name}"]`);
      return el ? el.value.trim() : '';
    };

    const name = getValue('name');
    const email = getValue('email');
    const message = getValue('message');

    const serviceLines = checkedServices.map(checkbox => {
      const detail = formEl.querySelector(`.service-detail[data-slug="${checkbox.dataset.slug}"]`);
      const detailText = detail && detail.value.trim() ? detail.value.trim() : 'No details provided';
      return `- ${checkbox.value}: ${detailText}`;
    }).join('\n');

    const subject = `New Project Inquiry from ${name}`;
    let body =
      `Name: ${name}\n` +
      `Email: ${email}\n\n` +
      `Services requested:\n${serviceLines}`;

    if (message) body += `\n\nAdditional notes:\n${message}`;

    if (statusEl) statusEl.classList.remove('error');

    // No access key set up yet — go straight to the mailto fallback rather than
    // firing a request that will just fail with a placeholder key.
    if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === 'YOUR_WEB3FORMS_ACCESS_KEY') {
      sendViaMailto(subject, body);
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (statusEl) statusEl.textContent = 'Sending…';

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: subject,
        from_name: name,
        email: email,
        message: body
      })
    })
      .then(res => res.json())
      .then(data => {
        if (submitBtn) submitBtn.disabled = false;
        if (data.success) {
          showSuccess();
        } else {
          // Request reached Web3Forms but it rejected it — fall back rather than leave the visitor stuck.
          sendViaMailto(subject, body);
        }
      })
      .catch(() => {
        // Network error, blocked request, etc. — fall back to mailto so the visitor still has a path through.
        if (submitBtn) submitBtn.disabled = false;
        sendViaMailto(subject, body);
      });
  });
}

initProjectForm(document.getElementById('contact-form'));
initProjectForm(document.getElementById('modal-form'));

// Start a Project modal open/close
const projectModal = document.getElementById('project-modal');
const startProjectBtn = document.getElementById('start-project-btn');
const startProjectBtnMobile = document.getElementById('start-project-btn-mobile');
const modalCloseBtn = document.getElementById('modal-close-btn');

if (projectModal && (startProjectBtn || startProjectBtnMobile)) {
  const openModal = () => {
    closeMobileMenu();
    projectModal.classList.add('open');
    document.body.classList.add('modal-open');
    const firstField = projectModal.querySelector('input, textarea, select');
    if (firstField) firstField.focus();
  };

  const closeModal = () => {
    projectModal.classList.remove('open');
    document.body.classList.remove('modal-open');
    if (startProjectBtn) startProjectBtn.focus();
  };

  if (startProjectBtn) startProjectBtn.addEventListener('click', openModal);
  if (startProjectBtnMobile) startProjectBtnMobile.addEventListener('click', openModal);

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

  projectModal.addEventListener('click', (e) => {
    if (e.target === projectModal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal.classList.contains('open')) closeModal();
  });
}

// Nexus network canvas animation in hero
(function nexusCanvas() {
  const canvas = document.getElementById('nexus-canvas');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, nodes;
  let running = true;
  const NODE_COUNT = 46;
  const LINK_DIST = 140;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    width = hero.offsetWidth;
    height = hero.offsetHeight;
    if (!width || !height) return; // hero is hidden (e.g. on a standalone page) — skip until it's visible again
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initNodes() {
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3
    }));
  }

  function step() {
    if (!running) return;

    ctx.clearRect(0, 0, width, height);

    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.strokeStyle = `rgba(37,99,235,${(1 - dist / LINK_DIST) * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach(n => {
      ctx.fillStyle = 'rgba(212,175,55,0.7)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!prefersReducedMotion) requestAnimationFrame(step);
  }

  resize();
  initNodes();
  step();

  window.addEventListener('resize', () => {
    resize();
    initNodes();
  }, { passive: true });

  // Pause the animation loop when the hero scrolls out of view
  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const wasRunning = running;
      running = entry.isIntersecting;
      if (running && !wasRunning && !prefersReducedMotion) step();
    });
  }, { threshold: 0 });

  visibilityObserver.observe(hero);
})();
