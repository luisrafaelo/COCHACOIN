/* =========================================
   ECOLLAJTA – mapa.js
   Mapa en vivo · Cochabamba
   ========================================= */

/* ─── DATOS MOCK ─── */
const PUNTOS_LIMPIOS = [
  { id:1, lat:-17.3935, lng:-66.1570, nombre:'Mercado La Cancha',     tipo:'limpio',  residuos:['organico','plastico','papel'], kg:124, horario:'Lun–Sáb 7–13h',  operador:'R4S' },
  { id:2, lat:-17.3890, lng:-66.1510, nombre:'Mercado Calatayud',     tipo:'limpio',  residuos:['plastico','metal'],            kg:68,  horario:'Lun–Sáb 8–14h',  operador:'Eco-recolectoras' },
  { id:3, lat:-17.4020, lng:-66.1600, nombre:'Mercado Campesino',     tipo:'limpio',  residuos:['organico','papel','vidrio'],   kg:91,  horario:'Mar–Dom 7–12h',  operador:'R4S' },
  { id:4, lat:-17.3870, lng:-66.1640, nombre:'Mercado 25 de Mayo',    tipo:'limpio',  residuos:['organico','papel'],            kg:45,  horario:'Lun–Vie 8–13h',  operador:'Eco-recolectoras' },
  { id:5, lat:-17.4060, lng:-66.1510, nombre:'Mercado Fidel Aranibar',tipo:'limpio',  residuos:['plastico','metal','electronico'], kg:37, horario:'Lun–Sáb 9–15h', operador:'R4S' },
];

const REPORTES = [
  { id:1, lat:-17.3960, lng:-66.1470, nombre:'Av. Blanco Galindo',   tipo:'reporte', problema:'Basurero lleno',        hace:'Hace 2h',  fotos:3 },
  { id:2, lat:-17.3910, lng:-66.1750, nombre:'Plaza Colcapirhua',    tipo:'reporte', problema:'Acumulación en esquina', hace:'Hace 5h',  fotos:1 },
  { id:3, lat:-17.3980, lng:-66.1520, nombre:'Calle Sucre 400',      tipo:'reporte', problema:'Escombros en vía',       hace:'Hace 1h',  fotos:2 },
  { id:4, lat:-17.4030, lng:-66.1580, nombre:'Av. Ayacucho esq. Heroínas', tipo:'reporte', problema:'Quema de basura', hace:'Hace 30min', fotos:4 },
];

const HEATMAP_DATA = [
  [-17.3935, -66.1570, 0.95], [-17.3960, -66.1540, 0.88],
  [-17.3910, -66.1600, 0.82], [-17.3880, -66.1520, 0.65],
  [-17.4010, -66.1590, 0.72], [-17.3850, -66.1480, 0.60],
  [-17.4050, -66.1540, 0.45], [-17.3990, -66.1620, 0.55],
  [-17.3920, -66.1490, 0.40], [-17.4000, -66.1780, 0.68],
  [-17.3870, -66.1880, 0.52], [-17.4030, -66.2010, 0.47],
];

const RUTAS_COORDS = [
  { color:'#00C853', coords:[[-17.3935,-66.1570],[-17.3960,-66.1540],[-17.3980,-66.1500],[-17.3910,-66.1460],[-17.4200,-66.1950]] },
  { color:'#4FC3F7', coords:[[-17.3890,-66.1510],[-17.3870,-66.1480],[-17.3850,-66.1450],[-17.4200,-66.1950]] },
  { color:'#ffa500', coords:[[-17.3920,-66.1780],[-17.3940,-66.1820],[-17.3960,-66.1860],[-17.4200,-66.1950]] },
  { color:'#69F0AE', coords:[[-17.4000,-66.1780],[-17.4020,-66.1820],[-17.4040,-66.1860],[-17.4200,-66.1950]] },
];

const ALERTAS = [
  { icon:'🔴', titulo:'La Cancha · Crítico',      sub:'Capacidad al 115% · Recolección urgente' },
  { icon:'🟠', titulo:'Mercado Calatayud · Alto', sub:'Capacidad al 92% · Programar hoy' },
  { icon:'⚠️', titulo:'Av. Blanco Galindo',       sub:'Reporte de quema hace 30 min' },
];

/* ─── ESTADO ─── */
let mapa = null;
let capaActiva = 'heatmap';
let heatLayer = null;
let markersGroup = null;
let rutasGroup = null;

/* ─── INIT MAPA ─── */
function initMapa() {
  mapa = L.map('mapaVivo', {
    center: [-17.3960, -66.1650],
    zoom: 13,
    zoomControl: true,
    attributionControl: false,
  });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(mapa);

  markersGroup = L.layerGroup().addTo(mapa);
  rutasGroup   = L.layerGroup().addTo(mapa);

  /* Planta Cotapachi siempre visible */
  const iconPlanta = L.divIcon({
    className: '',
    html: `<div style="width:32px;height:32px;background:#ffa500;border-radius:50%;
      border:2.5px solid #ffcc00;display:flex;align-items:center;justify-content:center;
      font-size:16px;box-shadow:0 2px 12px rgba(0,0,0,0.5);">🏭</div>`,
    iconSize: [32,32], iconAnchor: [16,16],
  });
  L.marker([-17.4200, -66.1950], { icon: iconPlanta })
    .bindPopup('<strong style="color:#ffa500;">Planta Cotapachi</strong><br/><span style="color:#A8C7E6;">Destino final de recolección</span>')
    .addTo(mapa);

  setTimeout(() => {
    mapa.invalidateSize();
    renderCapa('heatmap');
  }, 200);
}

/* ─── RENDER CAPAS ─── */
function renderCapa(capa) {
  capaActiva = capa;
  markersGroup.clearLayers();
  rutasGroup.clearLayers();
  if (heatLayer) { mapa.removeLayer(heatLayer); heatLayer = null; }

  if (capa === 'heatmap') {
    heatLayer = L.heatLayer(HEATMAP_DATA, {
      radius: 40, blur: 28, maxZoom: 17,
      gradient: { 0.0:'#00C853', 0.4:'#4FC3F7', 0.7:'#ffa500', 1.0:'#ff2200' },
    }).addTo(mapa);
  }

  if (capa === 'puntos' || capa === 'heatmap') {
    PUNTOS_LIMPIOS.forEach(p => agregarMarker(p));
  }

  if (capa === 'reportes') {
    REPORTES.forEach(r => agregarMarker(r));
  }
if (capa === 'rutas') {
    PUNTOS_LIMPIOS.forEach(p => agregarMarker(p));

    RUTAS_COORDS.forEach(async r => {
      const waypoints = r.coords.map(c => `${c[1]},${c[0]}`).join(';');
      let coords = r.coords;

      try {
        const res  = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`
        );
        const data = await res.json();
        if (data.code === 'Ok') {
          coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        }
      } catch (e) {
        console.warn('OSRM no disponible, usando línea recta:', e);
      }

      L.polyline(coords, { color: r.color, weight: 4, opacity: 0.85 })
        .addTo(rutasGroup);
    });
  }

}

function agregarMarker(punto) {
  const isLimpio = punto.tipo === 'limpio';
  const color    = isLimpio ? '#00C853' : '#E53935';
  const borde    = isLimpio ? '#69F0AE' : '#b71c1c';
  const emoji    = isLimpio ? '♻️' : '⚠️';

  const icon = L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;background:${color};border-radius:50%;
      border:2.5px solid ${borde};display:flex;align-items:center;justify-content:center;
      font-size:13px;box-shadow:0 2px 10px rgba(0,0,0,0.4);cursor:pointer;">${emoji}</div>`,
    iconSize: [28,28], iconAnchor: [14,14],
  });

  const marker = L.marker([punto.lat, punto.lng], { icon });

  marker.on('click', () => mostrarInfoFloat(punto));
  markersGroup.addLayer(marker);
}

/* ─── INFO FLOTANTE ─── */
function mostrarInfoFloat(punto) {
  const box  = document.getElementById('mapaInfoFloat');
  const body = document.getElementById('infoFloatBody');
  if (!box || !body) return;

  const isLimpio = punto.tipo === 'limpio';

  if (isLimpio) {
    body.innerHTML = `
      <div class="info-float-nombre">♻️ ${punto.nombre}</div>
      <div class="info-float-row"><span>Kg hoy</span><strong>${punto.kg} kg</strong></div>
      <div class="info-float-row"><span>Horario</span><strong>${punto.horario}</strong></div>
      <div class="info-float-row"><span>Operador</span><strong>${punto.operador}</strong></div>
      <div class="info-float-row"><span>Acepta</span><strong>${punto.residuos.join(', ')}</strong></div>
      <span class="info-float-badge limpio">✅ Activo</span>
    `;
  } else {
    body.innerHTML = `
      <div class="info-float-nombre">⚠️ ${punto.nombre}</div>
      <div class="info-float-row"><span>Problema</span><strong>${punto.problema}</strong></div>
      <div class="info-float-row"><span>Reportado</span><strong>${punto.hace}</strong></div>
      <div class="info-float-row"><span>Fotos</span><strong>${punto.fotos} adjuntas</strong></div>
      <span class="info-float-badge reporte">🚨 Pendiente atención</span>
    `;
  }

  box.classList.add('visible');
}

document.getElementById('infoFloatClose')?.addEventListener('click', () => {
  document.getElementById('mapaInfoFloat')?.classList.remove('visible');
});

/* ─── BOTONES DE CAPA ─── */
document.querySelectorAll('.capa-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.capa-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCapa(btn.dataset.capa);
    document.getElementById('mapaInfoFloat')?.classList.remove('visible');
  });
});

/* ─── ALERTAS ─── */
function renderAlertas() {
  const lista = document.getElementById('alertasLista');
  if (!lista) return;
  lista.innerHTML = ALERTAS.map(a => `
    <div class="alerta-item">
      <span class="alerta-item-icon">${a.icon}</span>
      <div class="alerta-item-body">
        <span class="alerta-item-titulo">${a.titulo}</span>
        <span class="alerta-item-sub">${a.sub}</span>
      </div>
    </div>
  `).join('');
}

/* ─── MODAL REPORTE ─── */
const modalReporte = document.getElementById('modalReporte');

document.getElementById('btnReporte')?.addEventListener('click', () => {
  modalReporte?.classList.add('open');
  obtenerGPS();
});

function cerrarModalReporte() {
  modalReporte?.classList.remove('open');
}

document.getElementById('modalReporteClose')?.addEventListener('click', cerrarModalReporte);
document.getElementById('repCancelar')?.addEventListener('click', cerrarModalReporte);
modalReporte?.addEventListener('click', function(e) {
  if (e.target === this) cerrarModalReporte();
});

function obtenerGPS() {
  const textoGps = document.getElementById('repGpsTexto');
  if (!textoGps) return;

  if (!navigator.geolocation) {
    textoGps.textContent = 'GPS no disponible · usando ubicación de Cochabamba';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      textoGps.textContent = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)} · precisión ${Math.round(pos.coords.accuracy)}m`;
    },
    () => {
      textoGps.textContent = '-17.3935, -66.1570 · ubicación aproximada';
    },
    { timeout: 5000 }
  );
}

document.getElementById('repEnviar')?.addEventListener('click', () => {
  const barrio = document.getElementById('repBarrio')?.value.trim();
  const tipo   = document.getElementById('repTipo')?.value;

  if (!barrio) {
    document.getElementById('repBarrio')?.focus();
    return;
  }

  /* Simular agregar el reporte al mapa */
  const nuevoReporte = {
    id: REPORTES.length + 1,
    lat: -17.3935 + (Math.random() - 0.5) * 0.02,
    lng: -66.1570 + (Math.random() - 0.5) * 0.02,
    nombre: barrio,
    tipo: 'reporte',
    problema: document.getElementById('repTipo')?.options[document.getElementById('repTipo').selectedIndex].text,
    hace: 'Ahora mismo',
    fotos: 0,
  };

  REPORTES.push(nuevoReporte);
  cerrarModalReporte();
  mostrarToast('✅ Reporte enviado · El municipio fue notificado');

  /* Si la capa activa es reportes, refrescar */
  if (capaActiva === 'reportes') renderCapa('reportes');

  /* Limpiar formulario */
  ['repBarrio','repDesc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
});

/* ─── TOAST ─── */
function mostrarToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3500);
}

/* ─── BUSCADOR (filtro simple) ─── */
document.getElementById('buscadorInput')?.addEventListener('input', function() {
  const q = this.value.toLowerCase().trim();
  if (!q) return;

  const match = [...PUNTOS_LIMPIOS, ...REPORTES].find(p =>
    p.nombre.toLowerCase().includes(q)
  );

  if (match && mapa) {
    mapa.setView([match.lat, match.lng], 16, { animate: true });
    mostrarInfoFloat(match);
  }
});

/* ─── ARRANQUE ─── */
renderAlertas();
initMapa();

console.log('%c🗺️ ECOLLAJTA Mapa en vivo · Cochabamba', 'color:#69F0AE;font-weight:bold;');