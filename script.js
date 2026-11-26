// Loader
const loader = document.getElementById('loader');
if (loader) {
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 400);
  });
}

// Light / dark mode toggle
// (initial theme is already set by the inline script in <head> to avoid a flash)
const themeToggleButtons = document.querySelectorAll('.theme-toggle-btn');
const THEME_KEY = 'lxa-theme';

if (themeToggleButtons.length) {
  const themeColorMeta = document.getElementById('theme-color-meta');

  const setThemeUI = (theme) => {
    themeToggleButtons.forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-sun', theme === 'light');
        icon.classList.toggle('fa-moon', theme !== 'light');
      }
      const label = btn.querySelector('span');
      if (label) label.textContent = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
    });
  };

  setThemeUI(document.documentElement.getAttribute('data-theme') || 'dark');

  themeToggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
      setThemeUI(next);
      if (themeColorMeta) themeColorMeta.setAttribute('content', next === 'light' ? '#f8faff' : '#171b28');
    });
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

// Independent page navigation
const currentFile = window.location.pathname.split('/').pop() || 'index.html';
const isProjectDetailPage = window.location.pathname.includes('/projects/');
const serviceDetailPages = ['web-development.html', 'cybersecurity.html', 'cloud-solutions.html', 'artificial-intelligence.html', 'it-consulting.html'];
const trainingDetailPages = ['training-starter.html', 'training-frontend.html', 'training-fullstack.html', 'training-pro.html'];

// On independent pages, enquiry buttons lead to the Contact page.
// The homepage retains its existing enquiry modal.
if (currentFile !== 'index.html') {
  const replaceEnquiryButton = (id) => {
    const button = document.getElementById(id);
    if (!button) return;

    const link = document.createElement('a');
    link.href = isProjectDetailPage ? '../contact.html' : 'contact.html';
    link.className = button.className;
    link.innerHTML = button.innerHTML;

    const label = button.getAttribute('aria-label');
    if (label) link.setAttribute('aria-label', label);

    button.replaceWith(link);

    if (id === 'start-project-btn-mobile') {
      link.addEventListener('click', closeMobileMenu);
    }
  };

  replaceEnquiryButton('start-project-btn');
  replaceEnquiryButton('start-project-btn-mobile');
}

// Highlight the current page in the navigation.
const navAnchors = document.querySelectorAll('.nav-links a');

if (currentFile !== 'index.html') {
  navAnchors.forEach(link => {
    const href = link.getAttribute('href') || '';
    const targetFile = href.split('#')[0];
    const isCurrentPage = isProjectDetailPage
      ? targetFile === '../projects.html'
      : targetFile === currentFile ||
        (serviceDetailPages.includes(currentFile) && targetFile === 'services.html') ||
        (trainingDetailPages.includes(currentFile) && targetFile === 'training.html');

    link.classList.toggle('active', isCurrentPage);

    if (isCurrentPage) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
} else {
  navAnchors.forEach(link => {
    const isHome = link.getAttribute('href') === 'index.html';
    link.classList.toggle('active', isHome);
    if (isHome) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}
// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Shared "project form" logic â€” used by both the Contact section form
// and the Start a Project modal form. They're two separate <form> elements
// (different ids so they don't collide), wired up identically here.
const BOOKING_EMAIL = 'acenobs@gmail.com';

// Get a free access key at https://web3forms.com (just an email signup, no domain
// verification needed) and paste it below. Until you do, submissions automatically
// fall back to opening the visitor's email app instead â€” same as before.
const WEB3FORMS_ACCESS_KEY = '9fc1de5d-1586-4a6e-b0f7-18298ce7730c';

// Service checkboxes reveal their own detail textarea when checked
document.querySelectorAll('.service-checkbox input[type="checkbox"]').forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    const option = checkbox.closest('.service-option');
    if (option) option.classList.toggle('active', checkbox.checked);
  });
});

const requestedPackage = new URLSearchParams(window.location.search).get('package');
const requestedService = new URLSearchParams(window.location.search).get('service');
if (currentFile === 'contact.html' && ['web', 'security', 'cloud', 'ai', 'consulting'].includes(requestedService)) {
  const serviceCheckbox = document.getElementById(`contact-svc-${requestedService}`);
  if (serviceCheckbox) {
    serviceCheckbox.checked = true;
    serviceCheckbox.dispatchEvent(new Event('change'));
  }
}
if (currentFile === 'contact.html' && ['starter', 'frontend', 'fullstack', 'pro'].includes(requestedPackage)) {
  const trainingCheckbox = document.getElementById('contact-svc-training');
  const packageRadio = document.getElementById(`contact-pkg-${requestedPackage}`);
  if (trainingCheckbox && packageRadio) {
    trainingCheckbox.checked = true;
    trainingCheckbox.dispatchEvent(new Event('change'));
    packageRadio.checked = true;
  }
}

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
      statusEl.textContent = "Thanks â€” we'll get back to you within 24 hours to talk more.";
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
      let detailText = 'No details provided';

      if (checkbox.dataset.slug === 'training' && detail) {
        const packages = Array.from(
          detail.querySelectorAll('input[name="training-package"]:checked')
        ).map(pkg => pkg.value);
        const notesField = detail.querySelector('textarea');
        const notes = notesField && notesField.value.trim() ? notesField.value.trim() : '';

        const parts = [];
        if (packages.length) parts.push(`Package(s): ${packages.join(', ')}`);
        if (notes) parts.push(`Notes: ${notes}`);
        if (parts.length) detailText = parts.join(' | ');
      } else if (detail && detail.value && detail.value.trim()) {
        detailText = detail.value.trim();
      }

      return `- ${checkbox.value}: ${detailText}`;
    }).join('\n');

    const subject = `New Project Inquiry from ${name}`;
    let body =
      `Name: ${name}\n` +
      `Email: ${email}\n\n` +
      `Services requested:\n${serviceLines}`;

    if (message) body += `\n\nAdditional notes:\n${message}`;

    if (statusEl) statusEl.classList.remove('error');

    // No access key set up yet â€” go straight to the mailto fallback rather than
    // firing a request that will just fail with a placeholder key.
    if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === 'YOUR_WEB3FORMS_ACCESS_KEY') {
      sendViaMailto(subject, body);
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (statusEl) statusEl.textContent = 'Sendingâ€¦';

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
          // Request reached Web3Forms but it rejected it â€” fall back rather than leave the visitor stuck.
          sendViaMailto(subject, body);
        }
      })
      .catch(() => {
        // Network error, blocked request, etc. â€” fall back to mailto so the visitor still has a path through.
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
    if (!width || !height) return; // hero is hidden (e.g. on a standalone page) â€” skip until it's visible again
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
      ctx.fillStyle = 'rgba(142,174,255,0.7)';
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

