/* =========================================
   ECOLLAJTA – login.js
   ========================================= */

/* — Credenciales mock por rol — */
const CREDENCIALES = {
  municipio:  { usuario: 'admin',      password: 'eco2026', destino: 'dashboard.html' },
  ciudadano:  { usuario: 'ciudadano',  password: 'eco2026', destino: 'ciudadano.html' },
  reciclador: { usuario: 'reciclador', password: 'eco2026', destino: 'reciclador.html' },
};

const HINTS = {
  municipio:  'usuario: <strong>admin</strong> · contraseña: <strong>eco2026</strong>',
  ciudadano:  'usuario: <strong>ciudadano</strong> · contraseña: <strong>eco2026</strong>',
  reciclador: 'usuario: <strong>reciclador</strong> · contraseña: <strong>eco2026</strong>',
};

/* — Estado — */
let rolActivo = 'municipio';

/* — Selector de rol — */
const rolBtns = document.querySelectorAll('.rol-btn');
rolBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    rolBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    rolActivo = btn.dataset.rol;

    /* Actualizar hint */
    const hint = document.getElementById('demoHintText');
    if (hint) hint.innerHTML = HINTS[rolActivo];

    /* Limpiar error */
    document.getElementById('loginError').classList.remove('visible');
    document.getElementById('usuario').value  = '';
    document.getElementById('password').value = '';
  });
});

/* — Mostrar/ocultar contraseña — */
document.getElementById('passToggle')?.addEventListener('click', function () {
  const input = document.getElementById('password');
  if (input.type === 'password') {
    input.type      = 'text';
    this.textContent = '🙈';
  } else {
    input.type      = 'password';
    this.textContent = '👁';
  }
});

/* — Login — */
function intentarLogin() {
  const usuario  = document.getElementById('usuario').value.trim();
  const password = document.getElementById('password').value;
  const error    = document.getElementById('loginError');
  const btn      = document.getElementById('btnLogin');

  error.classList.remove('visible');

  const cred = CREDENCIALES[rolActivo];

  if (usuario === cred.usuario && password === cred.password) {
    /* Guardar sesión */
    sessionStorage.setItem('ecollajta_rol',     rolActivo);
    sessionStorage.setItem('ecollajta_usuario', usuario);
    sessionStorage.setItem('ecollajta_session', 'true');

    /* Feedback visual */
    btn.textContent = '✓ Ingresando...';
    btn.classList.add('loading');

    setTimeout(() => {
      window.location.href = cred.destino;
    }, 600);

  } else {
    error.classList.add('visible');
    /* Vibrar el input */
    const inputs = document.querySelectorAll('.form-group input');
    inputs.forEach(i => {
      i.style.borderColor = 'rgba(229,57,53,0.6)';
      setTimeout(() => i.style.borderColor = '', 1200);
    });
  }
}

document.getElementById('btnLogin')?.addEventListener('click', intentarLogin);

/* Enter también hace login */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') intentarLogin();
});