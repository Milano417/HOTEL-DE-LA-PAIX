/* =========================================================
   Hôtel de la Paix — Daoukro · Interactions
   ========================================================= */

// Numéro WhatsApp de la réception, au format international sans « + » ni espaces.
// À CONFIRMER avec la direction avant la mise en ligne.
const WHATSAPP_NUMBER = '2250101535274';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ---------- Préchargeur ---------- */
document.body.classList.add('is-loading');
let pageReady = false;
function revealPage() {
  if (pageReady) return;
  pageReady = true;
  $('#preloader').classList.add('is-done');
  document.body.classList.remove('is-loading');
  document.body.classList.add('is-ready');
}
window.addEventListener('load', () => setTimeout(revealPage, reduceMotion ? 0 : 900));
// sur une connexion lente, on n'attend pas la carte et toutes les images
setTimeout(revealPage, 2500);

/* ---------- En-tête, barre de progression, bouton WhatsApp ---------- */
const header = $('#header');
const progress = $('.progress');
const waFloat = $('.wa-float');
let lastY = 0;

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header.classList.toggle('is-scrolled', y > 40);
  header.classList.toggle('is-hidden', y > lastY && y > 600 && !document.body.classList.contains('menu-open'));
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  waFloat.classList.toggle('is-visible', y > 500);
  lastY = y;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Menu mobile ---------- */
const burger = $('#burger');
const nav = $('#nav');

function toggleMenu(open) {
  nav.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  document.body.classList.toggle('menu-open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
burger.addEventListener('click', () => toggleMenu(!nav.classList.contains('is-open')));
$$('a', nav).forEach(a => a.addEventListener('click', () => toggleMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) toggleMenu(false); });

/* ---------- Lien actif selon la section ---------- */
const navLinks = $$('.nav__link');
const spy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(s => spy.observe(s));

/* ---------- Diaporama du héro ---------- */
const slides = $$('.hero__slide');
const dots = $$('.hero__dots button');
let current = 0;
let slideTimer;

function goTo(i) {
  slides[current].classList.remove('is-active');
  dots[current].classList.remove('is-active');
  current = (i + slides.length) % slides.length;
  slides[current].classList.add('is-active');
  dots[current].classList.add('is-active');
}
function autoplay() {
  clearInterval(slideTimer);
  if (!reduceMotion) slideTimer = setInterval(() => goTo(current + 1), 6000);
}
dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); autoplay(); }));
autoplay();

/* ---------- Apparition au défilement (avec cascade) ---------- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('is-visible');
    revealObserver.unobserve(el);
    // une fois apparu, l'élément retrouve ses propres transitions (survol, etc.)
    el.addEventListener('transitionend', function done(e) {
      if (e.target !== el) return;
      el.classList.remove('reveal', 'is-visible');
      el.style.removeProperty('--d');
      el.removeEventListener('transitionend', done);
    });
  });
}, { threshold: .15, rootMargin: '0px 0px -40px 0px' });

$$('.reveal').forEach(el => {
  const siblings = $$(':scope > .reveal', el.parentElement);
  el.style.setProperty('--d', `${siblings.indexOf(el) * 0.1}s`);
  revealObserver.observe(el);
});

/* ---------- Compteurs ---------- */
function animateCount(el) {
  const target = +el.dataset.count;
  const duration = 1800;
  const start = performance.now();
  const step = now => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    reduceMotion ? (entry.target.textContent = entry.target.dataset.count) : animateCount(entry.target);
    countObserver.unobserve(entry.target);
  });
}, { threshold: .6 });
$$('[data-count]').forEach(el => countObserver.observe(el));

/* ---------- Parallaxe ---------- */
const parallaxEls = $$('.parallax');
let ticking = false;

function updateParallax() {
  const vh = window.innerHeight;
  parallaxEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > vh) return;
    const offset = (rect.top + rect.height / 2 - vh / 2) * parseFloat(el.dataset.speed || 0.1);
    el.style.transform = `translate3d(0, ${offset}px, 0)`;
  });
  ticking = false;
}
if (!reduceMotion) {
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
  }, { passive: true });
  updateParallax();
}

/* ---------- Effet 3D sur l'image des séminaires + halo du curseur ---------- */
const canHover = window.matchMedia('(hover: hover)').matches;

if (canHover && !reduceMotion) {
  $$('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  const glow = $('.cursor-glow');
  window.addEventListener('mousemove', e => {
    glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
  }, { passive: true });
}

/* ---------- Galerie : filtres ---------- */
const galleryItems = $$('.masonry__item');

$$('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.filter').forEach(b => b.classList.toggle('is-active', b === btn));
    const f = btn.dataset.filter;
    galleryItems.forEach(item => {
      const show = f === 'all' || item.dataset.cat === f;
      item.classList.toggle('is-hidden', !show);
      item.classList.remove('is-entering');
      if (show) { void item.offsetWidth; item.classList.add('is-entering'); }
    });
  });
});

/* ---------- Galerie : visionneuse ---------- */
const lightbox = $('#lightbox');
const lbImg = $('img', lightbox);
const lbCaption = $('figcaption', lightbox);
let lbIndex = 0;

const visibleItems = () => galleryItems.filter(i => !i.classList.contains('is-hidden'));

function showImage(i) {
  const items = visibleItems();
  lbIndex = (i + items.length) % items.length;
  const item = items[lbIndex];
  lbImg.src = item.getAttribute('href');
  lbImg.alt = $('img', item).alt;
  lbCaption.textContent = item.dataset.caption;
  // relance l'animation d'entrée
  lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
}
function openLightbox(i) {
  showImage(i);
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  $('.lightbox__close', lightbox).focus();
}
function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = '';
}

galleryItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    openLightbox(visibleItems().indexOf(item));
  });
});
$('.lightbox__close', lightbox).addEventListener('click', closeLightbox);
$('.lightbox__prev', lightbox).addEventListener('click', () => showImage(lbIndex - 1));
$('.lightbox__next', lightbox).addEventListener('click', () => showImage(lbIndex + 1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showImage(lbIndex - 1);
  if (e.key === 'ArrowRight') showImage(lbIndex + 1);
});

let touchX = null;
lightbox.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) showImage(lbIndex + (dx < 0 ? 1 : -1));
  touchX = null;
});

/* ---------- WhatsApp ---------- */
const waLink = text => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
const formatDate = v => v ? new Date(v + 'T00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

$$('[data-wa]').forEach(a => {
  a.href = waLink("Bonjour, je souhaite avoir des informations sur l'Hôtel de la Paix de Daoukro.");
  a.target = '_blank';
  a.rel = 'noopener';
});

// Dates minimales : aujourd'hui pour l'arrivée, lendemain de l'arrivée pour le départ
const today = new Date().toISOString().split('T')[0];
function linkDates(form) {
  const arr = $('[name="arrivee"]', form);
  const dep = $('[name="depart"]', form);
  arr.min = today;
  dep.min = today;
  arr.addEventListener('change', () => {
    if (!arr.value) return;
    const next = new Date(arr.value + 'T00:00');
    next.setDate(next.getDate() + 1);
    dep.min = next.toISOString().split('T')[0];
    if (!dep.value || dep.value < dep.min) dep.value = dep.min;
  });
}

// Formulaire rapide : pré-remplit le formulaire complet puis y défile
const quickbook = $('#quickbook');
const bookingForm = $('#booking-form');
linkDates(quickbook);
linkDates(bookingForm);

quickbook.addEventListener('submit', e => {
  e.preventDefault();
  const q = new FormData(quickbook);
  bookingForm.arrivee.value = q.get('arrivee');
  bookingForm.depart.value = q.get('depart');
  bookingForm.categorie.value = q.get('categorie');
  bookingForm.personnes.value = parseInt(q.get('personnes'), 10) || 2;
  $('#reservation').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  setTimeout(() => bookingForm.nom.focus({ preventScroll: true }), 800);
});

// Boutons « Réserver » des cartes : présélectionne la prestation
$$('[data-room]').forEach(btn => {
  btn.addEventListener('click', () => { bookingForm.categorie.value = btn.dataset.room; });
});

bookingForm.addEventListener('submit', e => {
  e.preventDefault();
  const error = $('#form-error');
  const required = ['nom', 'tel', 'arrivee', 'depart'];
  let firstInvalid = null;

  $$('.field', bookingForm).forEach(f => f.classList.remove('is-invalid'));
  required.forEach(name => {
    const input = bookingForm[name];
    if (!input.value.trim()) {
      input.closest('.field').classList.add('is-invalid');
      firstInvalid = firstInvalid || input;
    }
  });

  if (firstInvalid) {
    error.textContent = 'Merci de compléter les champs indiqués.';
    firstInvalid.focus();
    return;
  }
  if (bookingForm.depart.value <= bookingForm.arrivee.value) {
    bookingForm.depart.closest('.field').classList.add('is-invalid');
    error.textContent = "La date de départ doit être postérieure à la date d'arrivée.";
    return;
  }
  error.textContent = '';

  const d = new FormData(bookingForm);
  const lines = [
    "Bonjour, je souhaite faire une demande de réservation à l'Hôtel de la Paix de Daoukro.",
    '',
    `• Nom : ${d.get('nom')}`,
    `• Téléphone : ${d.get('tel')}`,
    `• Prestation : ${d.get('categorie')}`,
    `• Arrivée : ${formatDate(d.get('arrivee'))}`,
    `• Départ : ${formatDate(d.get('depart'))}`,
    `• Nombre de personnes : ${d.get('personnes')}`
  ];
  if (d.get('message').trim()) lines.push(`• Message : ${d.get('message').trim()}`);
  lines.push('', 'Merci de me confirmer la disponibilité et le tarif.');

  window.open(waLink(lines.join('\n')), '_blank', 'noopener');
});

/* ---------- Année du pied de page ---------- */
$('#year').textContent = new Date().getFullYear();
