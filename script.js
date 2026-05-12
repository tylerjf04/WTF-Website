/* ═══════════════════════════════════════════════
   WTF — What The Fork | script.js
═══════════════════════════════════════════════ */

/* ─── Nav scroll ─────────────────────────────── */
const nav       = document.getElementById('nav');
const navBurger = document.getElementById('navBurger');
const navMobile = document.getElementById('navMobile');
const stickyCta = document.getElementById('stickyCta');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  stickyCta.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });

/* ─── Mobile nav toggle ──────────────────────── */
navBurger.addEventListener('click', () => {
  const open = navMobile.classList.toggle('open');
  navBurger.classList.toggle('open', open);
});
navMobile.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    navMobile.classList.remove('open');
    navBurger.classList.remove('open');
  })
);

/* ─── Catering quote form ────────────────────── */
document.getElementById('quoteForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name  = document.getElementById('firstName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const date  = document.getElementById('eventDate').value;
  if (!name || !phone || !email || !date) {
    const btn = this.querySelector('button[type="submit"]');
    btn.style.animation = 'shake 0.4s ease';
    btn.addEventListener('animationend', () => btn.style.animation = '', { once: true });
    return;
  }
  document.querySelector('.form-step.active').classList.remove('active');
  document.getElementById('formSuccess').style.display = 'block';
});

/* ─── FAQ accordion ──────────────────────────── */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.faq-question').forEach(other => {
      other.setAttribute('aria-expanded', 'false');
      other.nextElementSibling.classList.remove('open');
    });
    btn.setAttribute('aria-expanded', String(!expanded));
    btn.nextElementSibling.classList.toggle('open', !expanded);
  });
});

/* ─── Scroll reveal ──────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('revealed'), i * 70);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

[
  '.menu-cat', '.catering-card', '.review-card',
  '.gallery-item', '.faq-item', '.contact-card',
  '.hours-row', '.about-stat', '.quote-sidebar__card',
].forEach(sel => {
  document.querySelectorAll(sel).forEach(el => {
    el.setAttribute('data-reveal', '');
    observer.observe(el);
  });
});

/* ─── Smooth anchor scroll (nav offset) ─────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ─── Expose form step nav globally ─────────── */
window.nextStep = function(n) {
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  const next = document.getElementById('step' + (n + 1));
  if (next) next.classList.add('active');
};
window.prevStep = function(n) {
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  const prev = document.getElementById('step' + (n - 1));
  if (prev) prev.classList.add('active');
};
