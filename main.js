/* global */
document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile navigation toggle ---- */
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.querySelector('.main-nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('is-open', !expanded);
    });

    // Close nav when a link is clicked (mobile)
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      });
    });
  }

  /* ---- Smooth scrolling for in-page anchors ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', id);
      }
    });
  });

  /* ---- Scrollspy: highlight current nav link ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = nav ? nav.querySelectorAll('a[href^="#"]') : [];

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const setActive = id => {
      navLinks.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
      });
    };

    // Track which sections are currently on screen; the topmost wins so the
    // nav doesn't flicker when two sections straddle the header offset.
    const visible = new Set();
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        const current = [...sections]
          .map(s => s.id)
          .find(id => visible.has(id));
        if (current) setActive(current);
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach(section => observer.observe(section));
  }

  /* ---- Contact form client-side validation ---- */
  const form = document.getElementById('trial-form');
  if (form) {
    const fields = form.querySelectorAll('input:not([type="hidden"]), select');
    function fieldMessage(input) {
      const v = input.validity;
      if (v.valueMissing) {
        return input.type === 'checkbox'
          ? 'Please confirm before sending.'
          : 'This field is required.';
      }
      if (v.typeMismatch) return 'Please enter a valid email address.';
      if (v.patternMismatch) return 'Please use 7-16 digits, spaces or + only.';
      if (v.tooShort) return `Please enter at least ${input.minLength} characters.`;
      return 'Please check this field.';
    }

    function showError(input, msg) {
      const errorEl = document.getElementById(`${input.id}-error`);
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) {
        errorEl.textContent = msg || errorEl.textContent;
        errorEl.hidden = false;
      }
    }

    function clearError(input) {
      const errorEl = document.getElementById(`${input.id}-error`);
      input.removeAttribute('aria-invalid');
      if (errorEl) errorEl.hidden = true;
    }

    fields.forEach(input => {
      const evt = input.type === 'checkbox' || input.tagName === 'SELECT' ? 'change' : 'blur';
      input.addEventListener(evt, () => {
        if (input.validity.valid) clearError(input);
        else showError(input, fieldMessage(input));
      });

      input.addEventListener('input', () => {
        if (input.validity.valid) clearError(input);
      });
    });

    const status = form.querySelector('.form-status');

    form.addEventListener('submit', e => {
      e.preventDefault();
      let firstInvalid = null;
      fields.forEach(input => {
        if (!input.validity.valid) {
          showError(input, fieldMessage(input));
          if (!firstInvalid) firstInvalid = input;
        } else {
          clearError(input);
        }
      });

      if (firstInvalid) {
        status.textContent = 'Please fix the highlighted fields and try again.';
        status.classList.remove('is-success');
        status.classList.add('is-error');
        firstInvalid.focus();
        return;
      }

      const name = form.querySelector('#name').value.trim().split(' ')[0];
      form.reset();
      fields.forEach(clearError);
      status.textContent = `Thanks, ${name}! Your free week is booked — we'll email your confirmation shortly.`;
      status.classList.remove('is-error');
      status.classList.add('is-success');
    });
  }

  /* ---- Header elevation on scroll ---- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Footer year ---- */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = String(new Date().getFullYear());
  });

});