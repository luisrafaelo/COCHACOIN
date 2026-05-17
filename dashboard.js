/* =========================================
   ECOLLAJTA – dashboard.js
   Paleta unificada con index.html
   ========================================= */

/* ─────────────────────────────────────────
   1. DATOS MOCK
   ─────────────────────────────────────────*/
const MOCK = {

  barras: {
    labels: ['Plástico', 'Papel', 'Vidrio', 'Metal', 'Orgánico', 'Electrónico', 'Textil'],
    validado:  [2840, 1920,  980, 760, 4120, 340, 290],
    pendiente: [ 420,  310,  140, 120,  680,  80,  60],
  },

  linea: {
    labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
    actual: [5200, 5800, 6100, 7400, 8200, 9100, 8700, 9800, 10400, 11200, 12100, 12847],
    meta:   [6000, 6000, 7000, 7000, 8000, 8000, 9000, 9000, 10000, 10000, 11000, 12000],
  },

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

  puntosLimpios: [
    { lat: -17.3935, lng: -66.1570, nombre: 'Punto Limpio Central',  tipo: 'limpio',  descripcion: 'Acepta: plástico, papel, vidrio' },
    { lat: -17.3890, lng: -66.1510, nombre: 'Punto Limpio Norte',    tipo: 'limpio',  descripcion: 'Acepta: metal, electrónico' },
    { lat: -17.4020, lng: -66.1600, nombre: 'Punto Limpio Sur',      tipo: 'limpio',  descripcion: 'Acepta: orgánico, papel' },
    { lat: -17.3960, lng: -66.1470, nombre: 'Reporte: Zona Mercado', tipo: 'reporte', descripcion: '⚠️ Acumulación reportada hace 2h' },
    { lat: -17.3910, lng: -66.1640, nombre: 'Reporte: Av. Blanco',   tipo: 'reporte', descripcion: '⚠️ Acumulación reportada hace 5h' },
  ],
};

/* ─────────────────────────────────────────
   PALETA (alineada con style.css del landing)
   ─────────────────────────────────────────*/
const COLOR = {
  verde:   '#00C853',
  verdeSuave: '#69F0AE',
  celeste: '#4FC3F7',
  muted:   '#A8C7E6',
  surface: '#123C66',
};


/* ─────────────────────────────────────────
   2. NAVEGACIÓN POR SECCIONES
   ─────────────────────────────────────────*/
const navItems    = document.querySelectorAll('.nav-item[data-section]');
const sections    = document.querySelectorAll('.dash-section');
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
Chart.defaults.color       = COLOR.muted;
Chart.defaults.borderColor = 'rgba(79,195,247,0.08)';
Chart.defaults.font.family = "'DM Sans', sans-serif";
Chart.defaults.font.size   = 11;

const tooltipDefaults = {
  backgroundColor: '#0B1F3A',
  borderColor: 'rgba(79,195,247,0.3)',
  borderWidth: 1,
  titleColor: '#EAF6FF',
  bodyColor: COLOR.muted,
  padding: 10,
};


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
          backgroundColor: COLOR.verde + 'bb',
          borderColor: COLOR.verde,
          borderWidth: 1,
          borderRadius: 5,
          borderSkipped: false,
        },
        {
          label: 'Pendiente (kg)',
          data: MOCK.barras.pendiente,
          backgroundColor: COLOR.celeste + '88',
          borderColor: COLOR.celeste,
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
          ...tooltipDefaults,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('es-BO')} kg`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: COLOR.muted },
        },
        y: {
          grid: { color: 'rgba(79,195,247,0.06)' },
          ticks: {
            color: COLOR.muted,
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
          borderColor: COLOR.verde,
          backgroundColor: COLOR.verde + '18',
          borderWidth: 2,
          pointBackgroundColor: COLOR.verde,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Meta mensual',
          data: MOCK.linea.meta,
          borderColor: COLOR.celeste + '88',
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
            color: COLOR.muted,
            usePointStyle: true,
            pointStyleWidth: 10,
            padding: 16,
            font: { size: 11 },
          },
        },
        tooltip: {
          ...tooltipDefaults,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('es-BO')} kg`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: COLOR.muted },
        },
        y: {
          grid: { color: 'rgba(79,195,247,0.06)' },
          ticks: {
            color: COLOR.muted,
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
let mapa         = null;
let heatLayer    = null;
let markersLayer = null;

function initMapa() {
  if (mapa) return;

  mapa = L.map('mapa', {
    center: [-17.3935, -66.1570],
    zoom: 14,
    zoomControl: true,
    attributionControl: false,
  });

  // Tiles oscuros — tono azulado para coincidir con el tema
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
      // Gradiente alineado con la paleta: verde → celeste → naranja → rojo
      gradient: { 0.0: '#00C853', 0.4: '#4FC3F7', 0.7: '#ffa500', 1.0: '#ff2200' },
    }
  ).addTo(mapa);
}

function renderPuntos() {
  if (heatLayer)    { mapa.removeLayer(heatLayer); heatLayer = null; }
  if (markersLayer) { mapa.removeLayer(markersLayer); markersLayer = null; }

  markersLayer = L.layerGroup();

  MOCK.puntosLimpios.forEach(p => {
    const isLimpio = p.tipo === 'limpio';
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:28px; height:28px;
        background:${isLimpio ? '#00C853' : '#E53935'};
        border-radius:50%;
        border: 2.5px solid ${isLimpio ? '#69F0AE' : '#b71c1c'};
        display:flex; align-items:center; justify-content:center;
        font-size:14px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.5);
      ">${isLimpio ? '♻️' : '⚠️'}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const marker = L.marker([p.lat, p.lng], { icon });
    marker.bindPopup(`
      <strong style="color:#69F0AE;">${p.nombre}</strong><br/>
      <span style="color:#A8C7E6;">${p.descripcion}</span>
    `);
    markersLayer.addLayer(marker);
  });

  markersLayer.addTo(mapa);
}

// Inicializar mapa cuando sea visible
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

document.getElementById('btnHeatmap')?.addEventListener('click', function () {
  document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));
  this.classList.add('active');
  if (mapa) renderHeatmap();
});

document.getElementById('btnPuntos')?.addEventListener('click', function () {
  document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));
  this.classList.add('active');
  if (mapa) renderPuntos();
});


/* ─────────────────────────────────────────
   8. EXPORTAR CSV
   ─────────────────────────────────────────*/
document.getElementById('btnExportCSV')?.addEventListener('click', () => {
  const headers = ['Tipo,kg Validado,kg Pendiente'];
  const rows = MOCK.barras.labels.map((label, i) =>
    `${label},${MOCK.barras.validado[i]},${MOCK.barras.pendiente[i]}`
  );
  const csv  = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = 'ecollajta-datos.csv';
  link.click();
  URL.revokeObjectURL(url);
});


/* ─────────────────────────────────────────
   9. LOG
   ─────────────────────────────────────────*/
console.log('%c🌿 ECOLLAJTA Dashboard v0.1 · Tema unificado', 'color:#69F0AE;font-weight:bold;');
