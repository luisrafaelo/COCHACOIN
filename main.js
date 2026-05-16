/* =========================================
   COCHACOIN – main.js
   ========================================= */

/* ----- 1. MENÚ HAMBURGUESA (móvil) ----- */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  // Cerrar menú al hacer clic en un enlace
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}


/* ----- 2. ANIMACIONES DE ENTRADA (Intersection Observer) ----- */
const animatedEls = document.querySelectorAll('[data-animate]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('visible'), Number(delay));
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

animatedEls.forEach(el => observer.observe(el));


/* ----- 3. CONTADOR ANIMADO DE ESTADÍSTICAS ----- */
function animateCounter(el) {
  const target  = parseInt(el.dataset.count, 10);
  const suffix  = el.dataset.suffix || '';
  const duration = 1800; // ms
  const steps    = 60;
  const stepTime = duration / steps;
  let current    = 0;

  const timer = setInterval(() => {
    current += target / steps;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    // Formato con separador de miles
    el.textContent = Math.floor(current).toLocaleString('es-BO') + suffix;
  }, stepTime);
}

// Disparar cuando la stats-bar entre en viewport
const statsBar = document.querySelector('.stats-bar');
if (statsBar) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.stat-num[data-count]').forEach(animateCounter);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  statsObserver.observe(statsBar);
}


/* ----- 4. NAVBAR: sombra al hacer scroll ----- */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.4)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });
}


/* ----- 5. PLACEHOLDER QR (listo para reemplazar con imagen real) ----- */
/*
  Cuando tengas tu QR generado, reemplaza el div.qr-placeholder en index.html por:

  <img
    src="assets/qr-cochacoin.png"
    alt="QR para descargar COCHACOIN"
    width="180"
    height="180"
    style="border-radius: 12px;"
  />

  O puedes generarlo dinámicamente aquí con la librería qrcode.js:

  import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js';
  QRCode.toCanvas(document.getElementById('qrCanvas'), 'https://cochacoin.github.io', { width: 180 });
*/


/* ----- 6. DATOS MOCK (para demo / hackatón) ----- */
// Cuando conectes Supabase, reemplaza estos valores con llamadas a la API.
const mockStats = {
  kgReciclados:  12400,
  usuariosActivos: 3280,
  co2Evitado:    8200,
  barriosActivos: 14,
};

// Exportar para uso en otros módulos si lo necesitas
window.COCHACOIN = {
  stats: mockStats,
  version: '0.1.0-hackathon',
};

console.log('%c🌿 COCHACOIN v0.1 · Cochabamba Smart City', 'color:#66BB6A;font-weight:bold;font-size:14px;');
