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
/* — Verificación de sesión — */
(function() {
  const sesion = sessionStorage.getItem('ecollajta_session');
  const rol    = sessionStorage.getItem('ecollajta_rol');
  if (!sesion || rol !== 'municipio') {
    window.location.href = 'login.html';
  }
})();
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
        /* FIX MAPAS — invalidar tamaño al mostrar sección */
    setTimeout(() => {
      if (target === 'overview' && mapa) {
        mapa.invalidateSize();
      }
      if (target === 'rutas') {
        if (mapaRutas) {
          mapaRutas.invalidateSize();
        } else {
          initMapaRutas();
        }
      }
    }, 80);
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
  if (mapa) {
    mapa.invalidateSize();
    return;
  }

  const contenedor = document.getElementById('mapa');
  if (!contenedor) return;

  /* Forzar dimensiones antes de inicializar */
  contenedor.style.height = '420px';
  contenedor.style.width  = '100%';

  mapa = L.map('mapa', {
    center: [-17.3935, -66.1570],
    zoom: 14,
    zoomControl: true,
    attributionControl: false,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_matter/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(mapa);

  setTimeout(() => {
    mapa.invalidateSize();
    renderHeatmap();
  }, 300);
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
      /* FIX — forzar redibujado tras render */
      setTimeout(() => { if (mapa) mapa.invalidateSize(); }, 200);
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
/* ═══════════════════════════════════════
   SECCIÓN REGISTROS
   ═══════════════════════════════════════ */

/* — Datos mock de registros — */
const REGISTROS_MOCK = [
  { id:1,  nombre:'Ana Mamani',     email:'ana@gmail.com',     tipo:'Orgánico',      peso:3.2,  barrio:'Cala Cala',    fecha:'2026-05-14', iaScore:94, estado:'pendiente', gps:'-17.3891, -66.1520', obs:'Residuos de cocina bien separados',       cochapesos:16  },
  { id:2,  nombre:'Carlos Quispe',  email:'cquispe@gmail.com', tipo:'Plástico PET',  peso:1.8,  barrio:'Quillacollo',  fecha:'2026-05-14', iaScore:88, estado:'pendiente', gps:'-17.3920, -66.1780', obs:'Botellas aplastadas, sin tapa',            cochapesos:54  },
  { id:3,  nombre:'Lucia Flores',   email:'lflores@gmail.com', tipo:'Papel/Cartón',  peso:5.0,  barrio:'La Cancha',    fecha:'2026-05-13', iaScore:72, estado:'pendiente', gps:'-17.3935, -66.1570', obs:'Cajas de cartón dobladas',                 cochapesos:150 },
  { id:4,  nombre:'Pedro Vargas',   email:'pvargas@gmail.com', tipo:'Vidrio',        peso:2.4,  barrio:'Sarco',        fecha:'2026-05-13', iaScore:91, estado:'aprobado',  gps:'-17.3870, -66.1640', obs:'Botellas de vidrio limpias',               cochapesos:72  },
  { id:5,  nombre:'Rosa Torrez',    email:'rtorrez@gmail.com', tipo:'Metal/Aluminio',peso:0.9,  barrio:'Tupuraya',     fecha:'2026-05-12', iaScore:85, estado:'aprobado',  gps:'-17.3960, -66.1470', obs:'Latas de aluminio compactadas',            cochapesos:27  },
  { id:6,  nombre:'Juan Condori',   email:'jcondori@gmail.com',tipo:'Orgánico',      peso:4.5,  barrio:'Muyurina',     fecha:'2026-05-12', iaScore:40, estado:'rechazado', gps:'-17.4010, -66.1590', obs:'Foto borrosa, no se puede verificar tipo', cochapesos:0   },
  { id:7,  nombre:'Maria Choque',   email:'mchoque@gmail.com', tipo:'Electrónico',   peso:1.2,  barrio:'Colcapirhua',  fecha:'2026-05-11', iaScore:96, estado:'pendiente', gps:'-17.3870, -66.1880', obs:'Celulares y cables electrónicos',          cochapesos:36  },
  { id:8,  nombre:'Diego Salinas',  email:'dsalinas@gmail.com',tipo:'Plástico PET',  peso:2.1,  barrio:'Cala Cala',    fecha:'2026-05-11', iaScore:79, estado:'aprobado',  gps:'-17.3891, -66.1520', obs:'Mix de botellas PET variadas',             cochapesos:63  },
  { id:9,  nombre:'Elena Rojas',    email:'erojas@gmail.com',  tipo:'Papel/Cartón',  peso:3.8,  barrio:'Quillacollo',  fecha:'2026-05-10', iaScore:88, estado:'pendiente', gps:'-17.4000, -66.1780', obs:'Periódicos y revistas',                    cochapesos:114 },
  { id:10, nombre:'Marco Perez',    email:'mperez@gmail.com',  tipo:'Orgánico',      peso:6.0,  barrio:'La Cancha',    fecha:'2026-05-10', iaScore:55, estado:'rechazado', gps:'-17.3935, -66.1570', obs:'Mezclado con residuos no orgánicos',       cochapesos:0   },
  { id:11, nombre:'Sofia Gutierrez',email:'sguti@gmail.com',   tipo:'Vidrio',        peso:3.3,  barrio:'Sarco',        fecha:'2026-05-09', iaScore:92, estado:'aprobado',  gps:'-17.3870, -66.1640', obs:'Vidrio separado por color',                cochapesos:99  },
  { id:12, nombre:'Luis Mendoza',   email:'lmendoza@gmail.com',tipo:'Metal/Aluminio',peso:1.5,  barrio:'Tupuraya',     fecha:'2026-05-09', iaScore:83, estado:'pendiente', gps:'-17.3960, -66.1470', obs:'Chatarra pequeña de electrodomésticos',    cochapesos:45  },
];

/* — Estado de la tabla — */
let regFiltrados  = [...REGISTROS_MOCK];
let regPagina     = 1;
const REG_POR_PAG = 8;
let seleccionados = new Set();

/* — Fotos placeholder por tipo (Unsplash) — */
const FOTOS = {
  'Orgánico':       'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
  'Plástico PET':   'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400&q=80',
  'Papel/Cartón':   'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80',
  'Vidrio':         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  'Metal/Aluminio': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=80',
  'Electrónico':    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
};

const TIPO_ICON = {
  'Orgánico':'🥦','Plástico PET':'♻️','Papel/Cartón':'📦',
  'Vidrio':'🍾','Metal/Aluminio':'🥫','Electrónico':'📱',
};

/* — Color barra IA — */
function iaColor(score) {
  if (score >= 80) return '#00C853';
  if (score >= 60) return '#ffa500';
  return '#E53935';
}

/* — Iniciales para avatar — */
function iniciales(nombre) {
  return nombre.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
}

/* — Renderizar tabla — */
function renderTabla() {
  const tbody = document.getElementById('regTbody');
  if (!tbody) return;

  const inicio = (regPagina - 1) * REG_POR_PAG;
  const pagina = regFiltrados.slice(inicio, inicio + REG_POR_PAG);
  const total  = regFiltrados.length;
  const totalPags = Math.max(1, Math.ceil(total / REG_POR_PAG));

  tbody.innerHTML = pagina.map(r => `
    <tr onclick="abrirModal(${r.id})">
      <td onclick="event.stopPropagation()">
        <input type="checkbox" class="reg-check" data-id="${r.id}"
          ${seleccionados.has(r.id) ? 'checked' : ''}
          onchange="toggleSel(${r.id}, this.checked)"/>
      </td>
      <td>
        <div class="ciu-wrap">
          <div class="ciu-avatar">${iniciales(r.nombre)}</div>
          <div>
            <div class="ciu-name">${r.nombre}</div>
            <div class="ciu-email">${r.email}</div>
          </div>
        </div>
      </td>
      <td><span class="tipo-badge">${TIPO_ICON[r.tipo]||'📦'} ${r.tipo}</span></td>
      <td><strong>${r.peso}</strong> kg</td>
      <td>${r.barrio}</td>
      <td>${r.fecha}</td>
      <td>
        <div class="ia-mini">
          <div class="ia-mini-bar">
            <div class="ia-mini-fill" style="width:${r.iaScore}%;background:${iaColor(r.iaScore)};"></div>
          </div>
          <span style="font-size:0.72rem;color:${iaColor(r.iaScore)};">${r.iaScore}%</span>
        </div>
      </td>
      <td>
        <span class="estado-badge ${r.estado}">
          ${r.estado==='pendiente'?'⏳':r.estado==='aprobado'?'✅':'✕'}
          ${r.estado.charAt(0).toUpperCase()+r.estado.slice(1)}
        </span>
      </td>
      <td onclick="event.stopPropagation()">
        <div class="acc-btns">
          <button class="acc-btn ver"      onclick="abrirModal(${r.id})"             title="Ver detalle">👁</button>
          <button class="acc-btn aprobar"  onclick="cambiarEstado(${r.id},'aprobado')"  title="Aprobar">✅</button>
          <button class="acc-btn rechazar" onclick="cambiarEstado(${r.id},'rechazado')" title="Rechazar">✕</button>
        </div>
      </td>
    </tr>
  `).join('');

  /* Paginación */
  document.getElementById('regCount').textContent =
    `Mostrando ${Math.min(inicio + REG_POR_PAG, total)} de ${total} registros`;
  document.getElementById('pagInfo').textContent =
    `Página ${regPagina} de ${totalPags}`;
  document.getElementById('pagPrev').disabled = regPagina <= 1;
  document.getElementById('pagNext').disabled = regPagina >= totalPags;
}

/* — Filtros — */
function aplicarFiltros() {
  const estado  = document.getElementById('filtroEstado')?.value  || 'todos';
  const tipo    = document.getElementById('filtroTipo')?.value    || 'todos';
  const buscar  = (document.getElementById('filtroBuscar')?.value || '').toLowerCase();

  regFiltrados = REGISTROS_MOCK.filter(r => {
    const okEstado = estado === 'todos' || r.estado === estado;
    const okTipo   = tipo   === 'todos' || r.tipo   === tipo;
    const okBuscar = !buscar ||
      r.nombre.toLowerCase().includes(buscar) ||
      r.barrio.toLowerCase().includes(buscar);
    return okEstado && okTipo && okBuscar;
  });

  regPagina = 1;
  renderTabla();
}

document.getElementById('filtroEstado')?.addEventListener('change', aplicarFiltros);
document.getElementById('filtroTipo')?.addEventListener('change',   aplicarFiltros);
document.getElementById('filtroBuscar')?.addEventListener('input',  aplicarFiltros);

/* — Paginación — */
document.getElementById('pagPrev')?.addEventListener('click', () => { regPagina--; renderTabla(); });
document.getElementById('pagNext')?.addEventListener('click', () => { regPagina++; renderTabla(); });

/* — Selección múltiple — */
function toggleSel(id, checked) {
  checked ? seleccionados.add(id) : seleccionados.delete(id);
  const btn = document.getElementById('btnAprobarSel');
  if (btn) btn.disabled = seleccionados.size === 0;
}

document.getElementById('checkAll')?.addEventListener('change', function() {
  const checks = document.querySelectorAll('.reg-check');
  checks.forEach(c => {
    c.checked = this.checked;
    toggleSel(Number(c.dataset.id), this.checked);
  });
});

document.getElementById('btnAprobarSel')?.addEventListener('click', () => {
  seleccionados.forEach(id => cambiarEstado(id, 'aprobado', false));
  seleccionados.clear();
  document.getElementById('btnAprobarSel').disabled = true;
  document.getElementById('checkAll').checked = false;
  renderTabla();
});

/* — Cambiar estado — */
function cambiarEstado(id, nuevoEstado, redibujar = true) {
  const reg = REGISTROS_MOCK.find(r => r.id === id);
  if (reg) reg.estado = nuevoEstado;
  aplicarFiltros();
  if (nuevoEstado === 'aprobado' || nuevoEstado === 'rechazado') {
    cerrarModal();
  }
}
window.cambiarEstado = cambiarEstado;

/* — Modal — */
function abrirModal(id) {
  const r = REGISTROS_MOCK.find(r => r.id === id);
  if (!r) return;

  document.getElementById('modalTitulo').textContent = `Registro #${r.id} · ${r.nombre}`;

  const badge = document.getElementById('modalBadge');
  badge.className = `modal-badge estado-badge ${r.estado}`;
  badge.textContent = r.estado.charAt(0).toUpperCase() + r.estado.slice(1);

  document.getElementById('modalFoto').src = FOTOS[r.tipo] || '';
  document.getElementById('modalIaBar').style.width      = r.iaScore + '%';
  document.getElementById('modalIaBar').style.background = iaColor(r.iaScore);
  document.getElementById('modalIaVal').textContent      = r.iaScore + '% confianza';

  document.getElementById('mfCiudadano').textContent = `${r.nombre} · ${r.email}`;
  document.getElementById('mfTipo').textContent      = `${TIPO_ICON[r.tipo]} ${r.tipo}`;
  document.getElementById('mfPeso').textContent      = `${r.peso} kg`;
  document.getElementById('mfBarrio').textContent    = r.barrio;
  document.getElementById('mfFecha').textContent     = r.fecha;
  document.getElementById('mfGps').textContent       = r.gps;
  document.getElementById('mfPuntos').textContent    = `${r.cochapesos} COCHAPESOS`;
  document.getElementById('mfObs').textContent       = r.obs;

  document.getElementById('btnModalAprobar').onclick  = () => cambiarEstado(r.id, 'aprobado');
  document.getElementById('btnModalRechazar').onclick = () => cambiarEstado(r.id, 'rechazado');
  document.getElementById('btnModalEditar').onclick   = () => {
    const nuevo = prompt(`Peso actual: ${r.peso} kg\nIngresá el nuevo peso (kg):`, r.peso);
    if (nuevo && !isNaN(nuevo) && Number(nuevo) > 0) {
      r.peso = parseFloat(Number(nuevo).toFixed(1));
      r.cochapesos = Math.round(r.peso * (r.tipo === 'Orgánico' ? 5 : 30));
      abrirModal(r.id);
      aplicarFiltros();
    }
  };

  document.getElementById('modalOverlay').classList.add('open');
}
window.abrirModal = abrirModal;

function cerrarModal() {
  document.getElementById('modalOverlay')?.classList.remove('open');
}

document.getElementById('modalClose')?.addEventListener('click', cerrarModal);
document.getElementById('modalOverlay')?.addEventListener('click', function(e) {
  if (e.target === this) cerrarModal();
});

/* — Exportar CSV registros — */
document.getElementById('btnExportRegistros')?.addEventListener('click', () => {
  const headers = 'ID,Ciudadano,Email,Tipo,Peso(kg),Barrio,Fecha,IA Score,Estado,COCHAPESOS';
  const rows = regFiltrados.map(r =>
    `${r.id},"${r.nombre}","${r.email}","${r.tipo}",${r.peso},"${r.barrio}",${r.fecha},${r.iaScore},${r.estado},${r.cochapesos}`
  );
  const csv  = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'ecollajta-registros.csv';
  a.click();
  URL.revokeObjectURL(url);
});

/* — Render inicial — */
aplicarFiltros();
/* ═══════════════════════════════════════
   SECCIÓN CAMPAÑAS Y RETOS
   ═══════════════════════════════════════ */

const CAMPANAS_MOCK = [
  {
    id: 1,
    nombre: 'Gran Limpieza La Cancha',
    distrito: 'Cercado',
    tipo: 'Orgánico',
    estado: 'activa',
    inicio: '2026-05-01',
    fin: '2026-05-31',
    desc: 'Reto mensual en el mercado más grande de Cochabamba. Meta: reducir residuos orgánicos en zonas de venta.',
    metaKg: 800,
    actualKg: 612,
    participantes: 184,
    bonus: 50,
    cochapesos: 18360,
  },
  {
    id: 2,
    nombre: 'PET Free Quillacollo',
    distrito: 'Quillacollo',
    tipo: 'Plástico PET',
    estado: 'activa',
    inicio: '2026-05-10',
    fin: '2026-06-10',
    desc: 'Campaña de recolección de botellas PET en plazas y mercados del municipio de Quillacollo.',
    metaKg: 400,
    actualKg: 287,
    participantes: 96,
    bonus: 30,
    cochapesos: 8610,
  },
  {
    id: 3,
    nombre: 'Reto Electrónico Sacaba',
    distrito: 'Sacaba',
    tipo: 'Electrónico',
    estado: 'proxima',
    inicio: '2026-06-01',
    fin: '2026-06-30',
    desc: 'Primera campaña de recolección de residuos electrónicos en Sacaba. En coordinación con R4S.',
    metaKg: 150,
    actualKg: 0,
    participantes: 0,
    bonus: 100,
    cochapesos: 0,
  },
  {
    id: 4,
    nombre: 'Colcapirhua Verde',
    distrito: 'Colcapirhua',
    tipo: 'Todos',
    estado: 'activa',
    inicio: '2026-04-15',
    fin: '2026-05-30',
    desc: 'Reto general de separación de residuos en hogares del municipio de Colcapirhua.',
    metaKg: 600,
    actualKg: 541,
    participantes: 213,
    bonus: 40,
    cochapesos: 21640,
  },
  {
    id: 5,
    nombre: 'Papel Limpio Tiquipaya',
    distrito: 'Tiquipaya',
    tipo: 'Papel/Cartón',
    estado: 'finalizada',
    inicio: '2026-03-01',
    fin: '2026-04-30',
    desc: 'Campaña finalizada. Se superó la meta en un 18%. Récord de participación en Tiquipaya.',
    metaKg: 300,
    actualKg: 354,
    participantes: 128,
    bonus: 25,
    cochapesos: 10620,
  },
  {
    id: 6,
    nombre: 'Vidrio Seguro Cercado',
    distrito: 'Cercado',
    tipo: 'Vidrio',
    estado: 'finalizada',
    inicio: '2026-02-01',
    fin: '2026-03-31',
    desc: 'Recolección segura de vidrio en el distrito Cercado. Coordinación con Planta Cotapachi.',
    metaKg: 250,
    actualKg: 231,
    participantes: 87,
    bonus: 35,
    cochapesos: 8085,
  },
];

const ESTADO_ICON = { activa:'🟢', proxima:'🟡', finalizada:'⚫' };
const ESTADO_LABEL = { activa:'Activa', proxima:'Próxima', finalizada:'Finalizada' };

let campFiltradas = [...CAMPANAS_MOCK];

/* — Render stats — */
function renderCampStats() {
  const activas = CAMPANAS_MOCK.filter(c => c.estado === 'activa');
  document.getElementById('csTotalActivas').textContent = activas.length;
  document.getElementById('csTotalPart').textContent    =
    CAMPANAS_MOCK.reduce((s,c) => s + c.participantes, 0).toLocaleString('es-BO');
  document.getElementById('csTotalKg').textContent      =
    CAMPANAS_MOCK.reduce((s,c) => s + c.actualKg, 0).toLocaleString('es-BO');
  document.getElementById('csTotalCP').textContent      =
    CAMPANAS_MOCK.reduce((s,c) => s + c.cochapesos, 0).toLocaleString('es-BO');
}

/* — Render grid — */
function renderCampGrid() {
  const grid = document.getElementById('campGrid');
  if (!grid) return;

  if (campFiltradas.length === 0) {
    grid.innerHTML = `<div class="camp-empty"><span>🎯</span>No hay campañas con esos filtros.</div>`;
    return;
  }

  grid.innerHTML = campFiltradas.map(c => {
    const pct     = c.metaKg > 0 ? Math.min(100, Math.round((c.actualKg / c.metaKg) * 100)) : 0;
    const avatares = ['AM','CQ','LF','PV','RT'].slice(0, Math.min(5, Math.ceil(c.participantes / 40)));

    return `
      <div class="camp-card ${c.estado}">
        <div class="camp-card-header">
          <div class="camp-card-titulo">${c.nombre}</div>
          <span class="camp-estado-badge ${c.estado}">
            ${ESTADO_ICON[c.estado]} ${ESTADO_LABEL[c.estado]}
          </span>
        </div>

        <p class="camp-desc">${c.desc}</p>

        <div class="camp-meta-row">
          <span class="camp-tag">📍 ${c.distrito}</span>
          <span class="camp-tag">♻️ ${c.tipo}</span>
          <span class="camp-tag">📅 ${c.inicio} → ${c.fin}</span>
        </div>

        <div class="camp-progreso-wrap">
          <div class="camp-prog-header">
            <span>${c.actualKg.toLocaleString('es-BO')} kg recolectados</span>
            <strong>${pct}% · meta ${c.metaKg.toLocaleString('es-BO')} kg</strong>
          </div>
          <div class="camp-prog-bar">
            <div class="camp-prog-fill" style="width:${pct}%"></div>
          </div>
        </div>

        <div class="camp-part-row">
          <div style="display:flex;align-items:center;gap:0.4rem;">
            <div class="camp-avatares">
              ${avatares.map(a => `<div class="camp-avatar-mini">${a}</div>`).join('')}
            </div>
            <span>${c.participantes.toLocaleString('es-BO')} participantes</span>
          </div>
          <div class="camp-bonus">🪙 +${c.bonus} CP bonus</div>
        </div>

        <div class="camp-card-footer">
          <button class="camp-btn ver">👁 Ver ranking</button>
          ${c.estado !== 'finalizada'
            ? `<button class="camp-btn editar" onclick="editarCamp(${c.id})">✏️ Editar</button>
               <button class="camp-btn finalizar" onclick="finalizarCamp(${c.id})">⏹ Finalizar</button>`
            : `<button class="camp-btn ver">📊 Ver resultados</button>`
          }
        </div>
      </div>
    `;
  }).join('');
}

/* — Filtros campañas — */
function aplicarFiltrosCamp() {
  const estado   = document.getElementById('filtroEstadoCamp')?.value  || 'todos';
  const distrito = document.getElementById('filtroDistrito')?.value    || 'todos';

  campFiltradas = CAMPANAS_MOCK.filter(c => {
    const okEstado   = estado   === 'todos' || c.estado   === estado;
    const okDistrito = distrito === 'todos' || c.distrito === distrito;
    return okEstado && okDistrito;
  });
  renderCampGrid();
}

document.getElementById('filtroEstadoCamp')?.addEventListener('change', aplicarFiltrosCamp);
document.getElementById('filtroDistrito')?.addEventListener('change',   aplicarFiltrosCamp);

/* — Acciones cards — */
window.finalizarCamp = function(id) {
  const c = CAMPANAS_MOCK.find(c => c.id === id);
  if (!c) return;
  if (confirm(`¿Finalizar la campaña "${c.nombre}"?`)) {
    c.estado = 'finalizada';
    aplicarFiltrosCamp();
    renderCampStats();
  }
};

window.editarCamp = function(id) {
  const c = CAMPANAS_MOCK.find(c => c.id === id);
  if (!c) return;
  document.getElementById('campNombre').value   = c.nombre;
  document.getElementById('campDistrito').value = c.distrito;
  document.getElementById('campTipo').value     = c.tipo;
  document.getElementById('campInicio').value   = c.inicio;
  document.getElementById('campFin').value      = c.fin;
  document.getElementById('campMeta').value     = c.metaKg;
  document.getElementById('campBonus').value    = c.bonus;
  document.getElementById('campDesc').value     = c.desc;
  document.getElementById('modalCampOverlay').classList.add('open');
};

/* — Modal nueva campaña — */
document.getElementById('btnNuevaCamp')?.addEventListener('click', () => {
  ['campNombre','campMeta','campBonus','campDesc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('modalCampOverlay')?.classList.add('open');
});

function cerrarModalCamp() {
  document.getElementById('modalCampOverlay')?.classList.remove('open');
}

document.getElementById('modalCampClose')?.addEventListener('click',   cerrarModalCamp);
document.getElementById('btnCampCancelar')?.addEventListener('click',  cerrarModalCamp);
document.getElementById('modalCampOverlay')?.addEventListener('click', function(e) {
  if (e.target === this) cerrarModalCamp();
});

document.getElementById('btnCampGuardar')?.addEventListener('click', () => {
  const nombre = document.getElementById('campNombre')?.value.trim();
  const meta   = Number(document.getElementById('campMeta')?.value);

  if (!nombre) { alert('Ingresá el nombre de la campaña.'); return; }
  if (!meta || meta <= 0) { alert('Ingresá una meta válida en kg.'); return; }

  const nueva = {
    id:           CAMPANAS_MOCK.length + 1,
    nombre,
    distrito:     document.getElementById('campDistrito')?.value || 'Cercado',
    tipo:         document.getElementById('campTipo')?.value     || 'Todos',
    estado:       'proxima',
    inicio:       document.getElementById('campInicio')?.value   || '2026-06-01',
    fin:          document.getElementById('campFin')?.value      || '2026-06-30',
    desc:         document.getElementById('campDesc')?.value     || '',
    metaKg:       meta,
    actualKg:     0,
    participantes:0,
    bonus:        Number(document.getElementById('campBonus')?.value) || 0,
    cochapesos:   0,
  };

  CAMPANAS_MOCK.push(nueva);
  cerrarModalCamp();
  aplicarFiltrosCamp();
  renderCampStats();
});

/* — Render inicial — */
renderCampStats();
renderCampGrid();
/* ═══════════════════════════════════════
   SECCIÓN PREDICCIÓN IA
   ═══════════════════════════════════════ */

const ZONAS_PRED = [
  { zona:'La Cancha',         distrito:'Cercado',     kgActual:680, kgProy:920, capacidad:800,  diasSat:3,  accion:'Recolección urgente' },
  { zona:'Mercado Campesino', distrito:'Cercado',     kgActual:410, kgProy:610, capacidad:600,  diasSat:5,  accion:'Programar recolección' },
  { zona:'Av. Blanco Galindo',distrito:'Quillacollo', kgActual:290, kgProy:420, capacidad:500,  diasSat:9,  accion:'Monitorear' },
  { zona:'Plaza Colcapirhua', distrito:'Colcapirhua', kgActual:180, kgProy:240, capacidad:400,  diasSat:14, accion:'Sin acción inmediata' },
  { zona:'Mercado Calatayud', distrito:'Cercado',     kgActual:520, kgProy:700, capacidad:650,  diasSat:4,  accion:'Recolección urgente' },
  { zona:'Zona Norte Sacaba', distrito:'Sacaba',      kgActual:140, kgProy:190, capacidad:350,  diasSat:18, accion:'Sin acción inmediata' },
  { zona:'Cala Cala',         distrito:'Cercado',     kgActual:310, kgProy:430, capacidad:500,  diasSat:11, accion:'Monitorear' },
  { zona:'Tupuraya',          distrito:'Cercado',     kgActual:220, kgProy:300, capacidad:450,  diasSat:15, accion:'Sin acción inmediata' },
];

function getRiesgo(kgProy, capacidad, dias) {
  const pct = kgProy / capacidad;
  if (pct >= 1.0 || dias <= 4)  return { nivel:'critico', label:'🔴 Crítico' };
  if (pct >= 0.85 || dias <= 7) return { nivel:'alto',    label:'🟠 Alto' };
  if (pct >= 0.65)              return { nivel:'medio',   label:'🟡 Medio' };
  return                               { nivel:'bajo',    label:'🟢 Bajo' };
}

function capColor(pct) {
  if (pct >= 1.0)  return '#E53935';
  if (pct >= 0.85) return '#ffa500';
  if (pct >= 0.65) return '#4FC3F7';
  return '#00C853';
}

/* — KPIs — */
function renderPredKpis() {
  const criticas = ZONAS_PRED.filter(z => getRiesgo(z.kgProy, z.capacidad, z.diasSat).nivel === 'critico').length;
  const kgTotal  = ZONAS_PRED.reduce((s,z) => s + z.kgProy, 0);

  document.getElementById('pkZonasCriticas').textContent  = criticas;
  document.getElementById('pkKgProyectados').textContent  = kgTotal.toLocaleString('es-BO');
  document.getElementById('pkPrecision').textContent      = '87%';
  document.getElementById('pkZonasMonit').textContent     = ZONAS_PRED.length;
}

/* — Tabla zonas — */
function renderTablaZonas() {
  const tbody = document.getElementById('zonasTbody');
  if (!tbody) return;

  const sorted = [...ZONAS_PRED].sort((a,b) => {
    const ra = getRiesgo(a.kgProy, a.capacidad, a.diasSat);
    const rb = getRiesgo(b.kgProy, b.capacidad, b.diasSat);
    const orden = { critico:0, alto:1, medio:2, bajo:3 };
    return orden[ra.nivel] - orden[rb.nivel];
  });

  tbody.innerHTML = sorted.map(z => {
    const r   = getRiesgo(z.kgProy, z.capacidad, z.diasSat);
    const pct = Math.min(1, z.kgProy / z.capacidad);
    return `
      <tr>
        <td><strong>${z.zona}</strong></td>
        <td>${z.distrito}</td>
        <td>${z.kgActual.toLocaleString('es-BO')} kg</td>
        <td><strong style="color:var(--celeste);">${z.kgProy.toLocaleString('es-BO')} kg</strong></td>
        <td>
          <div class="cap-wrap">
            <div class="cap-bar">
              <div class="cap-fill" style="width:${Math.round(pct*100)}%;background:${capColor(pct)};"></div>
            </div>
            <span class="cap-pct">${Math.round(pct*100)}%</span>
          </div>
        </td>
        <td><span class="riesgo-badge ${r.nivel}">${r.label}</span></td>
        <td style="color:${z.diasSat<=4?'#ef9a9a':z.diasSat<=7?'#ffb74d':'var(--muted)'};">
          ${z.diasSat} días
        </td>
        <td style="font-size:0.78rem;color:var(--muted);">${z.accion}</td>
      </tr>
    `;
  }).join('');
}

/* — Gráfico predicción — */
function initChartPrediccion() {
  const ctx = document.getElementById('chartPrediccion');
  if (!ctx) return;

  const hoy    = new Date();
  const labels = Array.from({length:21}, (_,i) => {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - 7 + i);
    return d.toLocaleDateString('es-BO', {day:'2-digit', month:'short'});
  });

  /* Datos reales (últimos 7 días) */
  const real = [1820,1950,2100,1880,2240,2380,2510,
                null,null,null,null,null,null,null,
                null,null,null,null,null,null,null];

  /* Predicción (días 7-20) — crece con variación */
  const pred = [null,null,null,null,null,null,2510,
                2680,2820,2750,2950,3100,3280,3420,
                3350,3580,3720,3850,4010,4180,4350];

  /* Límite crítico fijo */
  const limite = Array(21).fill(3800);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Real (kg)',
          data: real,
          borderColor: COLOR.verde,
          backgroundColor: COLOR.verde + '18',
          borderWidth: 2,
          pointBackgroundColor: COLOR.verde,
          pointRadius: 4,
          tension: 0.4,
          fill: true,
          spanGaps: false,
        },
        {
          label: 'Predicción (kg)',
          data: pred,
          borderColor: COLOR.celeste,
          backgroundColor: COLOR.celeste + '12',
          borderWidth: 2,
          borderDash: [6, 3],
          pointBackgroundColor: COLOR.celeste,
          pointRadius: 3,
          tension: 0.4,
          fill: true,
          spanGaps: false,
        },
        {
          label: 'Límite crítico',
          data: limite,
          borderColor: 'rgba(229,57,53,0.5)',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderDash: [4,4],
          pointRadius: 0,
          fill: false,
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
            label: ctx => ctx.parsed.y
              ? ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('es-BO')} kg`
              : null,
          },
        },
        annotation: {
          annotations: {
            hoy: {
              type: 'line',
              x: labels[6],
              borderColor: 'rgba(255,255,255,0.2)',
              borderWidth: 1,
              borderDash: [4,4],
              label: {
                content: 'Hoy',
                enabled: true,
                color: 'rgba(255,255,255,0.4)',
                font: { size: 10 },
              },
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: COLOR.muted, maxTicksLimit: 10 },
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

/* — Render inicial — */
renderPredKpis();
renderTablaZonas();

/* Esperar a que la sección sea visible para el gráfico */
const predSeccion = document.getElementById('prediccion');
if (predSeccion) {
  const predObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      initChartPrediccion();
      predObs.disconnect();
    }
  }, { threshold: 0.1 });
  predObs.observe(predSeccion);
}
/* ═══════════════════════════════════════
   SECCIÓN RUTAS ÓPTIMAS
   ═══════════════════════════════════════ */

const RUTAS_MOCK = [
  {
    id: 1,
    nombre: 'Ruta A · La Cancha',
    turno: 'manana',
    distrito: 'Cercado',
    vehiculo: 'Camión 01',
    km: 12.4,
    completado: 65,
    color: '#00C853',
    paradas: [
      { zona:'Mercado La Cancha Norte', hora:'06:30', kg:180, prioridad:'crítica',  estado:'completado' },
      { zona:'Mercado La Cancha Sur',   hora:'07:10', kg:210, prioridad:'crítica',  estado:'completado' },
      { zona:'Av. Aroma esq. Punata',   hora:'07:55', kg:95,  prioridad:'alta',     estado:'en camino'  },
      { zona:'Plaza Colón',             hora:'08:40', kg:70,  prioridad:'media',    estado:'pendiente'  },
      { zona:'Calle Sucre 400',         hora:'09:20', kg:55,  prioridad:'media',    estado:'pendiente'  },
      { zona:'Planta Cotapachi',        hora:'10:30', kg:0,   prioridad:'destino',  estado:'pendiente'  },
    ],
    coords: [
      [-17.3935, -66.1570],
      [-17.3960, -66.1540],
      [-17.3980, -66.1500],
      [-17.3910, -66.1460],
      [-17.3880, -66.1430],
      [-17.4200, -66.1950],
    ],
  },
  {
    id: 2,
    nombre: 'Ruta B · Calatayud',
    turno: 'manana',
    distrito: 'Cercado',
    vehiculo: 'Camión 02',
    km: 9.8,
    completado: 40,
    color: '#4FC3F7',
    paradas: [
      { zona:'Mercado Calatayud',       hora:'06:45', kg:150, prioridad:'crítica',  estado:'completado' },
      { zona:'Calle Bolivia 200',       hora:'07:30', kg:80,  prioridad:'alta',     estado:'en camino'  },
      { zona:'Barrio Temporal',         hora:'08:15', kg:60,  prioridad:'media',    estado:'pendiente'  },
      { zona:'Av. República',           hora:'09:00', kg:45,  prioridad:'baja',     estado:'pendiente'  },
      { zona:'Planta Cotapachi',        hora:'10:00', kg:0,   prioridad:'destino',  estado:'pendiente'  },
    ],
    coords: [
      [-17.3890, -66.1510],
      [-17.3870, -66.1480],
      [-17.3850, -66.1450],
      [-17.3830, -66.1490],
      [-17.4200, -66.1950],
    ],
  },
  {
    id: 3,
    nombre: 'Ruta C · Quillacollo',
    turno: 'tarde',
    distrito: 'Quillacollo',
    vehiculo: 'Camión 03',
    km: 15.2,
    completado: 0,
    color: '#ffa500',
    paradas: [
      { zona:'Plaza Quillacollo',       hora:'12:30', kg:120, prioridad:'alta',     estado:'pendiente'  },
      { zona:'Mercado Municipal Quilla', hora:'13:15', kg:190, prioridad:'crítica', estado:'pendiente'  },
      { zona:'Av. Blanco Galindo km3',  hora:'14:00', kg:85,  prioridad:'media',   estado:'pendiente'  },
      { zona:'Barrio Villa Urkupiña',   hora:'14:45', kg:65,  prioridad:'baja',    estado:'pendiente'  },
      { zona:'Planta Cotapachi',        hora:'16:30', kg:0,   prioridad:'destino', estado:'pendiente'  },
    ],
    coords: [
      [-17.3920, -66.1780],
      [-17.3940, -66.1820],
      [-17.3960, -66.1860],
      [-17.3870, -66.1880],
      [-17.4200, -66.1950],
    ],
  },
  {
    id: 4,
    nombre: 'Ruta D · Colcapirhua',
    turno: 'tarde',
    distrito: 'Colcapirhua',
    vehiculo: 'Camión 04',
    km: 11.6,
    completado: 0,
    color: '#69F0AE',
    paradas: [
      { zona:'Plaza Colcapirhua',       hora:'12:00', kg:90,  prioridad:'media',   estado:'pendiente'  },
      { zona:'Mercado 24 de Junio',     hora:'12:45', kg:130, prioridad:'alta',    estado:'pendiente'  },
      { zona:'Av. Capitán Ustariz',     hora:'13:30', kg:75,  prioridad:'media',   estado:'pendiente'  },
      { zona:'Zona Ind. Colcapirhua',   hora:'14:20', kg:110, prioridad:'alta',    estado:'pendiente'  },
      { zona:'Planta Cotapachi',        hora:'15:30', kg:0,   prioridad:'destino', estado:'pendiente'  },
    ],
    coords: [
      [-17.4000, -66.1780],
      [-17.4020, -66.1820],
      [-17.4040, -66.1860],
      [-17.4060, -66.1900],
      [-17.4200, -66.1950],
    ],
  },
];

const PRIORIDAD_COLOR = {
  'crítica': '#E53935',
  'alta':    '#ffa500',
  'media':   '#4FC3F7',
  'baja':    '#69F0AE',
  'destino': '#ffa500',
};

const ESTADO_RUT = {
  'completado': { label:'✅ Completado', color:'var(--verde-suave)' },
  'en camino':  { label:'🚛 En camino',  color:'var(--celeste)'     },
  'pendiente':  { label:'⏳ Pendiente',  color:'var(--muted)'       },
};

let rutSeleccionada  = null;
let mapaRutas        = null;
let rutasLayers      = [];

/* — KPIs — */
function renderRutKpis() {
  const kmTotal = RUTAS_MOCK.reduce((s,r) => s + r.km, 0);
  const paradas = RUTAS_MOCK.reduce((s,r) =>
    s + r.paradas.filter(p => p.prioridad !== 'destino').length, 0);

  document.getElementById('rkVehiculos').textContent = RUTAS_MOCK.length;
  document.getElementById('rkParadas').textContent   = paradas;
  document.getElementById('rkKm').textContent        = kmTotal.toFixed(1) + ' km';
  document.getElementById('rkAhorro').textContent    = '23%';

  /* Fecha actual */
  const hoy = new Date().toLocaleDateString('es-BO', {
    weekday:'long', day:'numeric', month:'long'
  });
  const el = document.getElementById('rutFecha');
  if (el) el.textContent = hoy;
}

/* — Lista de rutas — */
function renderRutLista() {
  const distFiltro  = document.getElementById('rutDistrito')?.value || 'todos';
  const turnFiltro  = document.getElementById('rutTurno')?.value   || 'todos';

  const filtradas = RUTAS_MOCK.filter(r => {
    const okDist  = distFiltro === 'todos' || r.distrito === distFiltro;
    const okTurno = turnFiltro === 'todos' || r.turno    === turnFiltro;
    return okDist && okTurno;
  });

  const lista = document.getElementById('rutLista');
  if (!lista) return;

  lista.innerHTML = filtradas.map(r => `
    <div class="rut-card ${rutSeleccionada?.id === r.id ? 'selected' : ''}"
         onclick="seleccionarRuta(${r.id})"
         style="border-left: 3px solid ${r.color};">
      <div class="rut-card-top">
        <span class="rut-card-nombre">${r.nombre}</span>
        <span class="rut-turno-badge ${r.turno}">
          ${r.turno === 'manana' ? '🌅 Mañana' : '🌇 Tarde'}
        </span>
      </div>
      <div class="rut-card-meta">
        <span>🚛 ${r.vehiculo}</span>
        <span>📍 ${r.paradas.length - 1} paradas</span>
        <span>🛣️ ${r.km} km</span>
      </div>
      <div class="rut-prog-bar">
        <div class="rut-prog-fill"
             style="width:${r.completado}%;background:${r.color};">
        </div>
      </div>
      <div style="font-size:0.68rem;color:var(--muted);margin-top:0.3rem;">
        ${r.completado}% completado
      </div>
    </div>
  `).join('');
}

/* — Seleccionar ruta — */
window.seleccionarRuta = function(id) {
  rutSeleccionada = RUTAS_MOCK.find(r => r.id === id);
  if (!rutSeleccionada) return;

  renderRutLista();
  renderParadas();
  dibujarRutaEnMapa(rutSeleccionada);

  document.getElementById('rutDetalleLabel').textContent =
    `${rutSeleccionada.nombre} · ${rutSeleccionada.vehiculo} · ${rutSeleccionada.km} km`;
};

/* — Tabla de paradas — */
function renderParadas() {
  const tbody = document.getElementById('paradasTbody');
  if (!tbody || !rutSeleccionada) return;

  tbody.innerHTML = rutSeleccionada.paradas.map((p, i) => {
    const est = ESTADO_RUT[p.estado] || ESTADO_RUT['pendiente'];
    return `
      <tr>
        <td style="color:var(--muted);font-weight:600;">${i + 1}</td>
        <td><strong>${p.zona}</strong></td>
        <td style="color:var(--celeste);">${p.hora}</td>
        <td>${p.prioridad === 'destino' ? '—' : p.kg + ' kg'}</td>
        <td>
          <span style="
            display:inline-flex;align-items:center;gap:0.3rem;
            padding:0.18rem 0.6rem;border-radius:20px;
            font-size:0.7rem;font-weight:600;
            background:${PRIORIDAD_COLOR[p.prioridad]}22;
            border:0.5px solid ${PRIORIDAD_COLOR[p.prioridad]}55;
            color:${PRIORIDAD_COLOR[p.prioridad]};
          ">${p.prioridad.charAt(0).toUpperCase()+p.prioridad.slice(1)}</span>
        </td>
        <td style="font-size:0.78rem;color:${est.color};">${est.label}</td>
      </tr>
    `;
  }).join('');
}

/* — Mapa de rutas — */
function initMapaRutas() {
  if (mapaRutas) {
    mapaRutas.invalidateSize();
    return;
  }

  const contenedor = document.getElementById('mapaRutas');
  if (!contenedor) return;

  contenedor.style.height = '460px';
  contenedor.style.width  = '100%';

  mapaRutas = L.map('mapaRutas', {
    center: [-17.3980, -66.1700],
    zoom: 13,
    zoomControl: true,
    attributionControl: false,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_matter/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(mapaRutas);

  const iconPlanta = L.divIcon({
    className: '',
    html: `<div style="
      width:32px;height:32px;background:#ffa500;
      border-radius:50%;border:2.5px solid #ffcc00;
      display:flex;align-items:center;justify-content:center;
      font-size:16px;box-shadow:0 2px 12px rgba(0,0,0,0.5);">🏭</div>`,
    iconSize: [32,32], iconAnchor: [16,16],
  });

  L.marker([-17.4200, -66.1950], { icon: iconPlanta })
   .bindPopup('<strong style="color:#ffa500;">Planta Cotapachi</strong><br/><span style="color:#A8C7E6;">Destino final de recolección</span>')
   .addTo(mapaRutas);

  RUTAS_MOCK.forEach(r => {
    L.polyline(r.coords, {
      color: r.color + '44',
      weight: 3,
      dashArray: '6 4',
    }).addTo(mapaRutas);
  });

  setTimeout(() => {
    mapaRutas.invalidateSize();
    seleccionarRuta(RUTAS_MOCK[0].id);
  }, 300);
}

function dibujarRutaEnMapa(ruta) {
  if (!mapaRutas) return;

  /* Limpiar capas anteriores */
  rutasLayers.forEach(l => mapaRutas.removeLayer(l));
  rutasLayers = [];

  /* Línea principal de la ruta */
  const linea = L.polyline(ruta.coords, {
    color: ruta.color,
    weight: 4,
    opacity: 0.9,
  }).addTo(mapaRutas);
  rutasLayers.push(linea);

  /* Markers de paradas */
  ruta.paradas.forEach((p, i) => {
    if (i >= ruta.coords.length) return;
    const esDestino = p.prioridad === 'destino';
    const color     = PRIORIDAD_COLOR[p.prioridad] || '#fff';

    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:${esDestino ? 32:26}px;
        height:${esDestino ? 32:26}px;
        background:${color};
        border-radius:50%;
        border:2px solid ${esDestino ? '#ffcc00':'rgba(255,255,255,0.4)'};
        display:flex;align-items:center;justify-content:center;
        font-size:${esDestino ? 16:11}px;
        font-weight:700;color:#0B1F3A;
        box-shadow:0 2px 10px rgba(0,0,0,0.5);">
        ${esDestino ? '🏭' : i+1}
      </div>`,
      iconSize:   [esDestino ? 32:26, esDestino ? 32:26],
      iconAnchor: [esDestino ? 16:13, esDestino ? 16:13],
    });

    const marker = L.marker(ruta.coords[i], { icon })
      .bindPopup(`
        <strong style="color:${color};">${p.zona}</strong><br/>
        <span style="color:#A8C7E6;">🕐 ${p.hora}</span><br/>
        <span style="color:#A8C7E6;">${p.prioridad !== 'destino' ? '📦 '+p.kg+' kg' : 'Destino final'}</span>
      `)
      .addTo(mapaRutas);
    rutasLayers.push(marker);
  });

  mapaRutas.fitBounds(linea.getBounds(), { padding: [30, 30] });
}

/* — Filtros — */
document.getElementById('rutDistrito')?.addEventListener('change', renderRutLista);
document.getElementById('rutTurno')?.addEventListener('change',   renderRutLista);

/* — Recalcular (simulado) — */
document.getElementById('btnRecalcular')?.addEventListener('click', function() {
  this.textContent = '⏳ Calculando...';
  this.classList.add('recalculando');
  setTimeout(() => {
    this.textContent = '🔄 Recalcular';
    this.classList.remove('recalculando');
    /* Simula pequeña variación en km */
    RUTAS_MOCK.forEach(r => {
      r.km = parseFloat((r.km * (0.95 + Math.random() * 0.1)).toFixed(1));
    });
    renderRutKpis();
    renderRutLista();
  }, 1800);
});

/* — Exportar rutas CSV — */
document.getElementById('btnExportRutas')?.addEventListener('click', () => {
  const headers = 'Ruta,Vehículo,Distrito,Turno,Parada,Hora,kg,Prioridad,Estado';
  const rows = [];
  RUTAS_MOCK.forEach(r => {
    r.paradas.forEach(p => {
      rows.push(`"${r.nombre}","${r.vehiculo}","${r.distrito}","${r.turno}","${p.zona}","${p.hora}",${p.kg},"${p.prioridad}","${p.estado}"`);
    });
  });
  const csv  = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'ecollajta-rutas.csv'; a.click();
  URL.revokeObjectURL(url);
});

/* — Render inicial — */
renderRutKpis();
renderRutLista();