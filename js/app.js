/* DataForge · app.js — utilidades compartidas (Bootstrap + almacenamiento local) */
window.DF = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; },
  descargar(nombre, contenido, tipo = 'text/plain') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + contenido], { type: tipo + ';charset=utf-8' }));
    a.download = nombre; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
  toast(msg, tipo = 'success') {
    let c = document.getElementById('df-toasts');
    if (!c) { c = document.createElement('div'); c.id = 'df-toasts'; c.className = 'toast-container position-fixed bottom-0 end-0 p-3'; c.style.zIndex = 1100; document.body.appendChild(c); }
    const el = document.createElement('div');
    el.className = `toast align-items-center text-bg-${tipo} border-0`; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
    el.innerHTML = '<div class="d-flex"><div class="toast-body"></div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button></div>';
    el.querySelector('.toast-body').textContent = msg; c.appendChild(el);
    new bootstrap.Toast(el, { delay: 4500 }).show(); el.addEventListener('hidden.bs.toast', () => el.remove());
  }
};
document.querySelectorAll('[data-anio]').forEach(e => e.textContent = new Date().getFullYear());
const boletin = document.getElementById('form-boletin');
if (boletin) boletin.addEventListener('submit', e => {
  e.preventDefault();
  if (!boletin.checkValidity()) { boletin.classList.add('was-validated'); return; }
  const lista = DF.get('df_boletin', []), mail = boletin.email.value.trim().toLowerCase();
  if (!lista.includes(mail)) lista.push(mail);
  DF.set('df_boletin', lista); boletin.reset(); boletin.classList.remove('was-validated');
  DF.toast('¡Listo! Te suscribiste al boletín de DataForge.');
});
