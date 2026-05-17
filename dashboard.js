/* =========================================
   ECOLLAJTA – dashboard.js
   Paleta unificada con index.html
   ========================================= */

/* ─────────────────────────────────────────
   1. DATOS REALES DEL PROYECTO ECOLLAJTA
   Fuente: planificación del equipo (mayo 2026)
   ─────────────────────────────────────────*/

/*
  Composición real de residuos en Cochabamba:
    - Orgánicos aprovechables: 45%
    - No aprovechables:        43%
    - Reciclables:             12%
  Generación: 500–700 t/día · 0,64 kg/persona/día
  Población: 665.505 hab · Planta Cotapachi: 520 t/día
*/

// Tasa de conversión a COCHAPESOS
const COCHAPESOS = {
  organicos:   5,   // CP por kg
  reciclables: 30,  // CP por kg
};

// Catálogo de recompensas (CP requeridos)
const RECOMPENSAS = [
  { nombre: '1 kg de compost',                  costo: 10  },
  { nombre: 'Entrada parques municipales',       costo: 35  },
  { nombre: 'Parqueo tarifado 2h',               costo: 40  },
  { nombre: 'Boleto Tren Metropolitano',         costo: 40  },
  { nombre: 'Boleto Teleférico Cristo',          costo: 70  },
  { nombre: 'Café en cafetería UMSS',            costo: 100 },
];

const MOCK = {

  // Residuos por tipo — basado en composición real:
  // Orgánicos 45%, No aprovechables 43%, Reciclables 12%
  // Reciclables desglosados: PET, polietileno, polipropileno, aluminio, papel, vidrio
  // Fuente: inspecciones Planta Cotapachi + Proyecto R4S
  barras: {
    labels:    ['Orgánico', 'Plástico PET', 'Papel/Cartón', 'Polietileno', 'Vidrio', 'Metal/Aluminio', 'Electrónico'],
    validado:  [5782,        1240,            980,             620,           430,       310,              95],
    pendiente: [890,          210,            155,              90,            70,        48,              14],
    // Orgánicos: 5 CP/kg | Reciclables: 30 CP/kg
  },

  // Tendencia mensual — Cochabamba arranca desde crisis K'ara K'ara (cierre abril 2025)
  // Meta escalonada: en 6 meses, 1 punto de acopio por mercado principal (5 mercados)
  linea: {
    labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
    actual: [1200, 1850, 2400, 1100, 3200, 4800, 5900, 7200, 8400, 9800, 11200, 12847],
    //        ^--- arranque piloto        ^cierre K'araK'ara  ^apertura puntos mercados
    meta:   [2000, 2000, 3000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 12000],
  },

  // KPIs derivados reales
  kpis: {
    kgTotal:       12847,
    co2Evitado:    8214,   // kg CO2: ~0.64 kg CO2 por kg reciclado (promedio mixto)
    usuariosActivos: 3284,
    // Ahorro estimado: reciclables (1590 kg) × 30 CP + orgánicos (5782 kg) × 5 CP
    // = 47.700 + 28.910 = 76.610 CP · 1 CP ≈ 0.63 Bs (valor referencial teleférico)
    ahorroBs:      48320,
    pctEfectivo:   68,     // % de residuos que llegan validados vs reportados
    cochapesosCirculantes: 76610,
  },

  // Mercados principales como puntos de acopio prioritarios (plan 6 meses)
  // La Cancha, Calatayud, Campesino, 25 de Mayo, Fidel Aranibar
  heatmap: [
    // Alta acumulación: zona La Cancha (mercado más grande)
    [-17.3935, -66.1570, 0.95],
    [-17.3960, -66.1540, 0.88],
    [-17.3910, -66.1600, 0.82],
    // Media: Mercado Campesino / 25 de Mayo
    [-17.3880, -66.1520, 0.65],
    [-17.4010, -66.1590, 0.72],
    [-17.3850, -66.1480, 0.60],
    // Zonas residenciales Cercado
    [-17.4050, -66.1540, 0.45],
    [-17.3990, -66.1620, 0.55],
    [-17.3920, -66.1490, 0.40],
    // Quillacollo / Colcapirhua (municipios del Tren Metropolitano)
    [-17.4000, -66.1780, 0.68],
    [-17.3870, -66.1880, 0.52],
    [-17.4030, -66.2010, 0.47],
  ],

  // Puntos de acopio reales: 1 por mercado principal + recicladores R4S / Eco-recolectoras
  puntosLimpios: [
    {
      lat: -17.3935, lng: -66.1570,
      nombre: 'Punto Acopio · Mercado La Cancha',
      tipo: 'limpio',
      descripcion: 'Acepta: orgánico, PET, papel · R4S · Lun–Sáb 7–13h',
    },
    {
      lat: -17.3890, lng: -66.1510,
      nombre: 'Punto Acopio · Mercado Calatayud',
      tipo: 'limpio',
      descripcion: 'Acepta: PET, polietileno, aluminio · Eco-recolectoras',
    },
    {
      lat: -17.4020, lng: -66.1600,
      nombre: 'Punto Acopio · Mercado Campesino',
      tipo: 'limpio',
      descripcion: 'Acepta: orgánico, papel, vidrio · R4S',
    },
    {
      lat: -17.3870, lng: -66.1640,
      nombre: 'Punto Acopio · Mercado 25 de Mayo',
      tipo: 'limpio',
      descripcion: 'Acepta: orgánico, cartón · Eco-recolectoras',
    },
    {
      lat: -17.4060, lng: -66.1510,
      nombre: 'Punto Acopio · Mercado Fidel Aranibar',
      tipo: 'limpio',
      descripcion: 'Acepta: PET, metal, electrónico · R4S',
    },
    // Reportes ciudadanos activos (botón rojo de la app)
    {
      lat: -17.3960, lng: -66.1470,
      nombre: 'Reporte ciudadano · Av. Blanco Galindo',
      tipo: 'reporte',
      descripcion: '⚠️ Basurero lleno reportado hace 2h · 3 fotos',
    },
    {
      lat: -17.3910, lng: -66.1750,
      nombre: 'Reporte ciudadano · Plaza Colcapirhua',
      tipo: 'reporte',
      descripcion: '⚠️ Acumulación en esquina reportada hace 5h',
    },
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
  const headers = ['Tipo,kg Validado,kg Pendiente,CP por kg,CP generados'];
  const cpPorTipo = {
    'Orgánico': COCHAPESOS.organicos,
    'Plástico PET': COCHAPESOS.reciclables,
    'Papel/Cartón': COCHAPESOS.reciclables,
    'Polietileno': COCHAPESOS.reciclables,
    'Vidrio': COCHAPESOS.reciclables,
    'Metal/Aluminio': COCHAPESOS.reciclables,
    'Electrónico': COCHAPESOS.reciclables,
  };
  const rows = MOCK.barras.labels.map((label, i) => {
    const cp = cpPorTipo[label] || 0;
    const cpGen = MOCK.barras.validado[i] * cp;
    return `${label},${MOCK.barras.validado[i]},${MOCK.barras.pendiente[i]},${cp},${cpGen}`;
  });
  const csv  = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = 'ecollajta-residuos-cochapesos.csv';
  link.click();
  URL.revokeObjectURL(url);
});


/* ─────────────────────────────────────────
   9. LOG
   ─────────────────────────────────────────*/
console.log('%c🌿 ECOLLAJTA Dashboard v0.1 · Tema unificado', 'color:#69F0AE;font-weight:bold;');
