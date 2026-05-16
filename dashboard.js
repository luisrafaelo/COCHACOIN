/* =========================================
   COCHACOIN – dashboard.js
   Dashboard Municipal · Parte 1
   ========================================= */

/* ─────────────────────────────────────────
   1. DATOS MOCK
   ─────────────────────────────────────────*/
const MOCK = {

  // Barras: residuos por tipo
  barras: {
    labels: ['Plástico', 'Papel', 'Vidrio', 'Metal', 'Orgánico', 'Electrónico', 'Textil'],
    validado: [2840, 1920, 980,  760, 4120, 340, 290],
    pendiente:[420,   310,  140, 120,  680,  80,  60],
  },

  // Línea: tendencia mensual kg
  linea: {
    labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
    actual: [5200, 5800, 6100, 7400, 8200, 9100, 8700, 9800, 10400, 11200, 12100, 12847],
    meta:   [6000, 6000, 7000, 7000, 8000, 8000, 9000, 9000, 10000, 10000, 11000, 12000],
  },

  // Heatmap: [lat, lng, intensidad]
  heatmap: [
    [-17.3935, -66.1570, 0.95],
    [-17.3960, -66.1540, 0.85],
    [-17.3910, -66.1600, 0.78],
    [-17.3880, -66.1520, 0.65],
    [-17.4010, -66.1590, 0.72],
    [-17.3850, -66.1480, 0.55],
    [-17.4050, -66.1540, 0.48],
    [-17.3990, -66.1620, 0.60],
    [-17.3920, -66.1490, 0.42],
    [-17.4000, -66.1660, 0.70],
    [-17.3870, -66.1550, 0.38],
    [-17.4030, -66.1510, 0.52],
  ],

  // Puntos limpios
  puntosLimpios: [
    { lat: -17.3935, lng: -66.1570, nombre: 'Punto Limpio Central', tipo: 'limpio', descripcion: 'Acepta: plástico, papel, vidrio' },
    { lat: -17.3890, lng: -66.1510, nombre: 'Punto Limpio Norte', tipo: 'limpio', descripcion: 'Acepta: metal, electrónico' },
    { lat: -17.4020, lng: -66.1600, nombre: 'Punto Limpio Sur', tipo: 'limpio', descripcion: 'Acepta: orgánico, papel' },
    { lat: -17.3960, lng: -66.1470, nombre: 'Reporte: Zona Mercado', tipo: 'reporte', descripcion: '⚠️ Acumulación reportada hace 2h' },
    { lat: -17.3910, lng: -66.1640, nombre: 'Reporte: Av. Blanco', tipo: 'reporte', descripcion: '⚠️ Acumulación reportada hace 5h' },
  ],
};


/* ─────────────────────────────────────────
   2. NAVEGACIÓN POR SECCIONES
   ─────────────────────────────────────────*/
const navItems  = document.querySelectorAll('.nav-item[data-section]');
const sections  = document.querySelectorAll('.dash-section');
const topbarTitle = document.querySelector('.topbar-title');

const sectionNames = {
  overview:   'Resumen general',
  registros:  'Gestión de registros',
  campanas:   'Campañas y retos',
  prediccion: 'Predicción IA',
  rutas:      'Rutas óptimas',
};

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const target = item.dataset.section;

    navItems.forEach(n => n.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));

    item.classList.add('active');
    document.getElementById(target)?.classList.add('active');
    if (topbarTitle) topbarTitle.textContent = sectionNames[target] || target;

    // Cerrar sidebar en móvil
    sidebar?.classList.remove('open');
  });
});


/* ─────────────────────────────────────────
   3. SIDEBAR MOBILE
   ─────────────────────────────────────────*/
const sidebar      = document.getElementById('sidebar');
const menuToggle   = document.getElementById('menuToggle');
const sidebarClose = document.getElementById('sidebarClose');

menuToggle?.addEventListener('click', () => sidebar?.classList.add('open'));
sidebarClose?.addEventListener('click', () => sidebar?.classList.remove('open'));

// Cerrar al hacer click fuera en móvil
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 768 &&
      sidebar?.classList.contains('open') &&
      !sidebar.contains(e.target) &&
      e.target !== menuToggle) {
    sidebar.classList.remove('open');
  }
});


/* ─────────────────────────────────────────
   4. CONTADORES ANIMADOS DE KPI
   ─────────────────────────────────────────*/
function animateCounter(el) {
  const target   = parseInt(el.dataset.count, 10);
  const suffix   = el.dataset.suffix  || '';
  const prefix   = el.dataset.prefix  || '';
  const duration = 1600;
  const steps    = 60;
  const stepTime = duration / steps;
  let current    = 0;

  const timer = setInterval(() => {
    current += target / steps;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = prefix + Math.floor(current).toLocaleString('es-BO') + suffix;
  }, stepTime);
}

// Observer para KPIs
const kpiObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.kpi-value[data-count]').forEach(animateCounter);
      kpiObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

const kpiGrid = document.querySelector('.kpi-grid');
if (kpiGrid) kpiObserver.observe(kpiGrid);


/* ─────────────────────────────────────────
   5. ANIMACIONES DE ENTRADA
   ─────────────────────────────────────────*/
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = Number(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('visible'), delay);
      animObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('[data-animate]').forEach(el => animObserver.observe(el));


/* ─────────────────────────────────────────
   6. CHART.JS — CONFIGURACIÓN BASE
   ─────────────────────────────────────────*/
Chart.defaults.color           = '#7a9e7c';
Chart.defaults.borderColor     = 'rgba(102,187,106,0.08)';
Chart.defaults.font.family     = "'DM Sans', sans-serif";
Chart.defaults.font.size       = 11;

const VERDE  = '#66BB6A';
const AZUL   = '#0288D1';
const VERDE_D= '#2E7D32';
const MARRON = '#8D6E63';


/* ─── 6a. GRÁFICO DE BARRAS ─── */
const ctxBarras = document.getElementById('chartBarras');
if (ctxBarras) {
  new Chart(ctxBarras, {
    type: 'bar',
    data: {
      labels: MOCK.barras.labels,
      datasets: [
        {
          label: 'Validado (kg)',
          data: MOCK.barras.validado,
          backgroundColor: VERDE + 'cc',
          borderColor: VERDE,
          borderWidth: 1,
          borderRadius: 5,
          borderSkipped: false,
        },
        {
          label: 'Pendiente (kg)',
          data: MOCK.barras.pendiente,
          backgroundColor: AZUL + '88',
          borderColor: AZUL,
          borderWidth: 1,
          borderRadius: 5,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111f12',
          borderColor: 'rgba(102,187,106,0.3)',
          borderWidth: 1,
          titleColor: '#F1F8E9',
          bodyColor: '#7a9e7c',
          padding: 10,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('es-BO')} kg`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#7a9e7c' },
        },
        y: {
          grid: { color: 'rgba(102,187,106,0.06)' },
          ticks: {
            color: '#7a9e7c',
            callback: v => v.toLocaleString('es-BO'),
          },
        },
      },
    },
  });
}


/* ─── 6b. GRÁFICO DE LÍNEA ─── */
const ctxLinea = document.getElementById('chartLinea');
if (ctxLinea) {
  new Chart(ctxLinea, {
    type: 'line',
    data: {
      labels: MOCK.linea.labels,
      datasets: [
        {
          label: 'kg recolectados',
          data: MOCK.linea.actual,
          borderColor: VERDE,
          backgroundColor: VERDE + '15',
          borderWidth: 2,
          pointBackgroundColor: VERDE,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Meta mensual',
          data: MOCK.linea.meta,
          borderColor: MARRON + 'aa',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderDash: [6, 4],
          pointRadius: 0,
          tension: 0.4,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: '#7a9e7c',
            usePointStyle: true,
            pointStyleWidth: 10,
            padding: 16,
            font: { size: 11 },
          },
        },
        tooltip: {
          backgroundColor: '#111f12',
          borderColor: 'rgba(102,187,106,0.3)',
          borderWidth: 1,
          titleColor: '#F1F8E9',
          bodyColor: '#7a9e7c',
          padding: 10,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('es-BO')} kg`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#7a9e7c' },
        },
        y: {
          grid: { color: 'rgba(102,187,106,0.06)' },
          ticks: {
            color: '#7a9e7c',
            callback: v => v.toLocaleString('es-BO'),
          },
        },
      },
    },
  });
}


/* ─────────────────────────────────────────
   7. MAPA LEAFLET + HEATMAP
   ─────────────────────────────────────────*/
let mapa        = null;
let heatLayer   = null;
let markersLayer= null;
let modoActual  = 'heatmap';

function initMapa() {
  if (mapa) return; // ya inicializado

  mapa = L.map('mapa', {
    center: [-17.3935, -66.1570],
    zoom: 14,
    zoomControl: true,
    attributionControl: false,
  });

  // Tiles oscuros de OpenStreetMap (CartoDB Dark)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_matter/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(mapa);

  renderHeatmap();
}

function renderHeatmap() {
  if (markersLayer) { mapa.removeLayer(markersLayer); markersLayer = null; }
  if (heatLayer)    { mapa.removeLayer(heatLayer); }

  heatLayer = L.heatLayer(
    MOCK.heatmap.map(p => [p[0], p[1], p[2]]),
    {
      radius: 35,
      blur: 25,
      maxZoom: 17,
      gradient: { 0.0: '#2E7D32', 0.4: '#ffa500', 0.7: '#ff6600', 1.0: '#ff2200' },
    }
  ).addTo(mapa);
}

function renderPuntos() {
  if (heatLayer) { mapa.removeLayer(heatLayer); heatLayer = null; }
  if (markersLayer) { mapa.removeLayer(markersLayer); markersLayer = null; }

  markersLayer = L.layerGroup();

  MOCK.puntosLimpios.forEach(p => {
    const isLimpio = p.tipo === 'limpio';
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:28px; height:28px;
        background:${isLimpio ? '#66BB6A' : '#E53935'};
        border-radius:50%;
        border: 2.5px solid ${isLimpio ? '#2E7D32' : '#b71c1c'};
        display:flex; align-items:center; justify-content:center;
        font-size:14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      ">${isLimpio ? '♻️' : '⚠️'}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const marker = L.marker([p.lat, p.lng], { icon });
    marker.bindPopup(`
      <strong style="color:#66BB6A;">${p.nombre}</strong><br/>
      <span style="color:#7a9e7c;">${p.descripcion}</span>
    `);
    markersLayer.addLayer(marker);
  });

  markersLayer.addTo(mapa);
}

// Inicializar mapa cuando el elemento sea visible
const mapaEl = document.getElementById('mapa');
if (mapaEl) {
  const mapaObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      initMapa();
      mapaObserver.disconnect();
    }
  }, { threshold: 0.1 });
  mapaObserver.observe(mapaEl);
}

// Botones de capa
document.getElementById('btnHeatmap')?.addEventListener('click', function () {
  document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));
  this.classList.add('active');
  modoActual = 'heatmap';
  if (mapa) renderHeatmap();
});

document.getElementById('btnPuntos')?.addEventListener('click', function () {
  document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));
  this.classList.add('active');
  modoActual = 'puntos';
  if (mapa) renderPuntos();
});


/* ─────────────────────────────────────────
   8. EXPORTAR CSV (mock)
   ─────────────────────────────────────────*/
document.getElementById('btnExportCSV')?.addEventListener('click', () => {
  const headers = ['Tipo,kg Validado,kg Pendiente'];
  const rows = MOCK.barras.labels.map((label, i) =>
    `${label},${MOCK.barras.validado[i]},${MOCK.barras.pendiente[i]}`
  );
  const csv     = [headers, ...rows].join('\n');
  const blob    = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url     = URL.createObjectURL(blob);
  const link    = document.createElement('a');
  link.href     = url;
  link.download = 'cochacoin-datos.csv';
  link.click();
  URL.revokeObjectURL(url);
});


/* ─────────────────────────────────────────
   9. LOG
   ─────────────────────────────────────────*/
console.log('%c🌿 COCHACOIN Dashboard v0.1 · Parte 1 cargada', 'color:#66BB6A;font-weight:bold;');
