/* DataForge · contacto.js — solicitud de diagnóstico: validación, registro local y seguimiento */
(() => {
  const f = document.getElementById('form-contacto'); if (!f) return;
  const iso = d => d.toISOString().slice(0, 10), hoy = new Date(), tope = new Date(); tope.setDate(hoy.getDate() + 60);
  f.fecha.min = iso(hoy); f.fecha.max = iso(tope);
  f.fecha.addEventListener('change', () => {
    const dia = new Date(f.fecha.value + 'T12:00:00').getDay();
    f.fecha.setCustomValidity(dia === 0 || dia === 6 ? 'Elige un día de lunes a viernes.' : '');
  });
  const ESTADOS = [[0, 'Recibida', 'secondary', 'Tu solicitud fue registrada.'], [20, 'En revisión', 'warning', 'Un especialista está revisando tu caso.'], [60, 'Agendada', 'success', 'Diagnóstico confirmado. Te enviaremos la invitación a tu correo.']];
  const estado = s => { const seg = (Date.now() - s.creado) / 1000; return [...ESTADOS].reverse().find(e => seg >= e[0]); };
  const fmt = s => new Date(s + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
  const modal = new bootstrap.Modal(document.getElementById('modal-confirmacion'));

  function resumen(s) {
    const cuerpo = `Hola DataForge, soy ${s.nombre} de ${s.empresa}. Solicito un diagnóstico gratuito (${s.codigo}) el ${fmt(s.fecha)} a las ${s.horario}. Interés: ${s.interes}. ${s.mensaje}`;
    document.getElementById('conf-codigo').textContent = s.codigo;
    document.getElementById('conf-detalle').textContent = `${fmt(s.fecha)} · ${s.horario} h`;
    document.getElementById('conf-correo').textContent = s.correo;
    document.getElementById('conf-mail').href = `mailto:contacto@dataforge.pe?subject=${encodeURIComponent('Solicitud ' + s.codigo)}&body=${encodeURIComponent(cuerpo)}`;
    document.getElementById('conf-wa').href = `https://wa.me/51987654321?text=${encodeURIComponent(cuerpo)}`;
    document.getElementById('conf-pdf').onclick = () => DF.descargar(`comprobante-${s.codigo}.txt`,
      `DATAFORGE ANALYTICS — COMPROBANTE DE SOLICITUD\nCódigo: ${s.codigo}\nNombre: ${s.nombre}\nEmpresa: ${s.empresa} (${s.rubro}, ${s.empleados} empleados)\nCorreo: ${s.correo} · Celular: ${s.telefono}\nServicio de interés: ${s.interes}\nDiagnóstico: ${fmt(s.fecha)}, ${s.horario} h\nMensaje: ${s.mensaje}\n\nGuarda este código para consultar el estado de tu solicitud.`);
    modal.show();
  }
  function lista() {
    const ul = document.getElementById('lista-solicitudes'), datos = DF.get('df_solicitudes', []);
    ul.innerHTML = datos.length ? '' : '<li class="text-secondary small">Aún no registraste solicitudes en este navegador.</li>';
    datos.slice(0, 4).forEach(s => { const e = estado(s); const li = document.createElement('li'); li.className = 'd-flex justify-content-between align-items-center py-2 border-bottom';
      li.innerHTML = `<span><strong>${DF.esc(s.codigo)}</strong><br><small class="text-secondary">${DF.esc(fmt(s.fecha))}</small></span><span class="badge text-bg-${e[2]}">${e[1]}</span>`; ul.appendChild(li); });
    document.getElementById('borrar-historial').classList.toggle('d-none', !datos.length);
  }
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (!f.checkValidity()) { f.classList.add('was-validated'); const p = f.querySelector(':invalid'); p && p.focus(); return; }
    const datos = DF.get('df_solicitudes', []);
    const s = { codigo: `DF-${hoy.getFullYear()}-${String(datos.length + 1).padStart(4, '0')}`, nombre: f.nombre.value.trim(), telefono: f.telefono.value, correo: f.correo.value.trim(), empresa: f.empresa.value.trim(),
      rubro: f.rubro.value, empleados: f.empleados.value, interes: f.interes.value, fecha: f.fecha.value, horario: f.horario.value, mensaje: f.mensaje.value.trim(), creado: Date.now() };
    datos.unshift(s); DF.set('df_solicitudes', datos); f.reset(); f.classList.remove('was-validated'); lista(); resumen(s);
  });
  const seg = document.getElementById('form-seguimiento'), res = document.getElementById('resultado-seguimiento');
  seg.addEventListener('submit', e => {
    e.preventDefault(); const cod = seg.codigo.value.trim().toUpperCase(); const s = DF.get('df_solicitudes', []).find(x => x.codigo === cod);
    if (!s) { res.className = 'alert alert-danger mt-3 mb-0'; res.textContent = 'No encontramos ese código en este navegador. Revisa que esté bien escrito.'; return; }
    const est = estado(s); res.className = 'alert alert-light border mt-3 mb-0';
    res.innerHTML = `<div class="estado-paso mb-1"><span class="badge text-bg-${est[2]}">${est[1]}</span> <strong>${DF.esc(s.codigo)}</strong></div><small>${est[3]}<br>Diagnóstico: ${DF.esc(fmt(s.fecha))}, ${s.horario} h</small>`;
  });
  document.getElementById('borrar-historial').addEventListener('click', () => { localStorage.removeItem('df_solicitudes'); lista(); res.className = 'd-none'; DF.toast('Historial borrado.', 'secondary'); });
  lista(); setInterval(lista, 15000);
})();
