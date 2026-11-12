/* DataForge · portal.js — portal del cliente (demostración): acceso, panel, gráficos, soporte y cuenta */
(() => {
  const MESES = ['Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov'];
  const serie = (base, tend, sem) => { let s = sem; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; return MESES.map((_, i) => Math.round(base * (1 + tend * i / 11) * (0.92 + 0.16 * r()))); };
  const CUENTAS = {
    verdeluz: { email: 'cliente@verdeluz.pe', empresa: 'VerdeLuz', rubro: 'Alimentos naturales', contacto: 'Lucía Paredes', cargo: 'Gerente comercial', telefono: '987 654 321', plan: 'Acompañamiento mensual', gestor: 'Juan José Soto',
      serie: serie(310, .55, 7), meta: 360, regiones: [['Lima', 112], ['Norte', 88], ['Sur', 104], ['Centro', 101]], sat: 4.7, margen: 24.8,
      proyectos: [['PR-101', 'Dashboard comercial', 'En curso', 72, 'Juan José Soto', '02/09/2026', '12/12/2026'], ['PR-102', 'Predicción de demanda', 'En revisión', 90, 'Anthony Cruces', '10/06/2026', '30/11/2026'], ['PR-097', 'Alertas de stock', 'Completado', 100, 'Christian Calle', '01/03/2026', '20/05/2026'], ['PR-110', 'Segmentación de clientes', 'Planificado', 0, 'Anthony Cruces', '10/01/2027', '15/03/2027']] },
    finova: { email: 'cliente@finova.pe', empresa: 'Finova', rubro: 'Asesoría financiera', contacto: 'Marco Salazar', cargo: 'Director de operaciones', telefono: '945 120 336', plan: 'Proyecto por hitos', gestor: 'Anthony Cruces',
      serie: serie(540, .35, 11), meta: 600, regiones: [['Lima', 108], ['Arequipa', 97], ['Trujillo', 91], ['Piura', 103]], sat: 4.5, margen: 31.2,
      proyectos: [['PR-120', 'Scoring de crédito', 'En curso', 58, 'Anthony Cruces', '15/08/2026', '20/12/2026'], ['PR-118', 'Tablero de cartera', 'Completado', 100, 'Juan José Soto', '02/04/2026', '30/06/2026'], ['PR-124', 'Gobierno de datos', 'Planificado', 0, 'Christian Calle', '08/01/2027', '30/04/2027']] },
    bienestar: { email: 'cliente@bienestar.pe', empresa: 'Bienestar+', rubro: 'Salud integral', contacto: 'Dra. Carmen Rojas', cargo: 'Gerenta médica', telefono: '956 778 201', plan: 'Acompañamiento mensual', gestor: 'Christian Calle',
      serie: serie(220, .7, 23), meta: 270, regiones: [['Sede Lima', 106], ['Sede Callao', 99], ['Sede Surco', 112], ['Telemedicina', 120]], sat: 4.8, margen: 18.6,
      proyectos: [['PR-131', 'Ocupación de consultorios', 'En curso', 81, 'Christian Calle', '20/07/2026', '15/12/2026'], ['PR-133', 'Predicción de inasistencias', 'En revisión', 94, 'Anthony Cruces', '05/05/2026', '25/11/2026'], ['PR-128', 'Panel de indicadores clínicos', 'Completado', 100, 'Juan José Soto', '10/02/2026', '30/04/2026']] }
  };
  const CLAVE = 'DataForge2026', BADGE = { 'En curso': 'primary', 'En revisión': 'warning', 'Completado': 'success', 'Planificado': 'secondary' };
  const $ = id => document.getElementById(id), fm = n => n.toLocaleString('es-PE');
  let sesion = sessionStorage.getItem('df_sesion'), graficos = {};
  const clave = k => DF.get('df_pass_' + k, CLAVE);

  /* ---------- acceso ---------- */
  const formLogin = $('form-login'), alerta = $('login-alerta');
  const recordado = DF.get('df_recordar', ''); if (recordado) { formLogin.email.value = recordado; formLogin.recordar.checked = true; }
  $('ver-clave').addEventListener('click', e => { const t = formLogin.password.type === 'password'; formLogin.password.type = t ? 'text' : 'password'; e.currentTarget.innerHTML = `<i class="bi bi-eye${t ? '-slash' : ''}"></i>`; e.currentTarget.setAttribute('aria-label', t ? 'Ocultar contraseña' : 'Mostrar contraseña'); });
  document.querySelectorAll('[data-cuenta]').forEach(b => b.addEventListener('click', () => { const c = CUENTAS[b.dataset.cuenta]; formLogin.email.value = c.email; formLogin.password.value = clave(b.dataset.cuenta); formLogin.password.focus(); }));
  let intentos = 0;
  formLogin.addEventListener('submit', e => {
    e.preventDefault(); alerta.className = 'd-none';
    if (!formLogin.checkValidity()) { formLogin.classList.add('was-validated'); return; }
    const btn = $('btn-login'); btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Verificando…';
    setTimeout(() => {
      const k = Object.keys(CUENTAS).find(k => CUENTAS[k].email === formLogin.email.value.trim().toLowerCase());
      btn.disabled = false; btn.textContent = 'Iniciar sesión';
      if (k && clave(k) === formLogin.password.value) {
        formLogin.recordar.checked ? DF.set('df_recordar', CUENTAS[k].email) : localStorage.removeItem('df_recordar');
        sessionStorage.setItem('df_sesion', k); sesion = k; formLogin.reset(); formLogin.classList.remove('was-validated'); intentos = 0; entrar();
      } else {
        intentos++; alerta.className = 'alert alert-danger mt-3'; alerta.textContent = intentos >= 3 ? 'Correo o contraseña incorrectos. Si no recuerdas tu clave, usa “Olvidé mi contraseña”.' : 'Correo o contraseña incorrectos. Inténtalo nuevamente.';
        $('login-tarjeta').classList.remove('temblor'); void $('login-tarjeta').offsetWidth; $('login-tarjeta').classList.add('temblor');
      }
    }, 700);
  });
  $('form-olvide').addEventListener('submit', e => {
    e.preventDefault(); const f = e.currentTarget; if (!f.checkValidity()) { f.classList.add('was-validated'); return; }
    $('olvide-ok').classList.remove('d-none'); $('olvide-ok').textContent = `Si ${f.correo.value.trim()} está registrado, recibirás un enlace para restablecer tu contraseña en unos minutos.`; f.reset(); f.classList.remove('was-validated');
  });

  /* ---------- panel ---------- */
  function entrar() { $('vista-login').classList.add('d-none'); $('vista-panel').classList.remove('d-none'); document.title = 'Mi panel | DataForge'; pintar(); window.scrollTo(0, 0); }
  function salir() { sessionStorage.removeItem('df_sesion'); sesion = null; Object.values(graficos).forEach(g => g.destroy()); graficos = {}; $('vista-panel').classList.add('d-none'); $('vista-login').classList.remove('d-none'); document.title = 'Portal del cliente | DataForge'; DF.toast('Sesión cerrada correctamente.', 'secondary'); }
  document.querySelectorAll('[data-salir]').forEach(b => b.addEventListener('click', salir));

  function pintar() {
    const c = CUENTAS[sesion], s = c.serie, ult = s[11], ant = s[10], perfil = DF.get('df_perfil_' + sesion, {});
    document.querySelectorAll('[data-empresa]').forEach(e => e.textContent = c.empresa);
    document.querySelectorAll('[data-contacto]').forEach(e => e.textContent = c.contacto);
    $('avatar').textContent = c.contacto.replace('Dra. ', '').split(' ').map(x => x[0]).join('').slice(0, 2);
    const kpis = [['Ventas del mes', `S/ ${fm(ult)} mil`, `${(ult / ant * 100 - 100).toFixed(1)}%`, 'bi-cash-coin', 'warning'], ['Pedidos', fm(Math.round(ult * 6.7)), '+6.1%', 'bi-bag-check', 'info'], ['Margen', c.margen + '%', '+1.2 pts', 'bi-graph-up-arrow', 'success'], ['Satisfacción', c.sat + ' / 5', '+0.2', 'bi-emoji-smile', 'primary']];
    $('kpis').innerHTML = kpis.map(k => `<div class="col-6 col-xl-3"><div class="card kpi h-100"><div class="card-body d-flex align-items-center gap-3"><span class="icono bg-${k[4]}-subtle text-${k[4]}-emphasis"><i class="bi ${k[3]}"></i></span><div><div class="small text-secondary">${k[0]}</div><div class="valor">${k[1]}</div><small class="text-success"><i class="bi bi-arrow-up-short"></i>${k[2]}</small></div></div></div></div>`).join('');
    const act = [['bi-file-earmark-bar-graph', 'Nuevo informe mensual disponible', 'Hace 2 h'], ['bi-check2-circle', `Hito completado en ${c.proyectos[0][1]}`, 'Ayer'], ['bi-chat-dots', `${c.gestor} respondió tu consulta`, 'Hace 2 días'], ['bi-bell', 'Alerta: la región ' + c.regiones.reduce((a, b) => a[1] < b[1] ? a : b)[0] + ' está bajo la meta', 'Hace 3 días']];
    const htmlAct = act.map(a => `<li class="d-flex gap-3"><i class="bi ${a[0]} text-info fs-5"></i><div><div>${DF.esc(a[1])}</div><small class="text-secondary">${a[2]}</small></div></li>`).join('');
    $('actividad').innerHTML = htmlAct; $('actividad-off').innerHTML = htmlAct;
    const estados = ['En curso', 'En revisión', 'Completado', 'Planificado'];
    $('proyectos-tabla').innerHTML = c.proyectos.map((p, i) => `<tr><td><strong>${p[0]}</strong></td><td>${DF.esc(p[1])}</td><td><span class="badge text-bg-${BADGE[p[2]]}">${p[2]}</span></td><td style="min-width:130px"><div class="progress" role="progressbar" aria-label="Avance de ${DF.esc(p[1])}" aria-valuenow="${p[3]}" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar bg-${p[3] == 100 ? 'success' : 'warning'}" style="width:${p[3]}%">${p[3]}%</div></div></td><td>${p[4]}</td><td>${p[6]}</td><td><button class="btn btn-sm btn-outline-primary" data-proyecto="${i}">Ver</button></td></tr>`).join('');
    $('proyectos-tabla').querySelectorAll('[data-proyecto]').forEach(b => b.addEventListener('click', () => detalle(c.proyectos[b.dataset.proyecto])));
    $('docs-lista').innerHTML = [['Informe mensual — Noviembre 2026', 'Informe', '05/11/2026'], ['Contrato de servicios 2026', 'Contrato', '12/01/2026'], ['Acuerdo de nivel de servicio (SLA)', 'Anexo', '12/01/2026'], ['Diccionario de datos', 'Técnico', '20/06/2026']].map((d, i) => `<li class="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2"><span><i class="bi bi-file-earmark-text text-info me-2"></i><strong>${d[0]}</strong><br><small class="text-secondary">${d[1]} · ${d[2]}</small></span><button class="btn btn-sm btn-outline-primary" data-doc="${i}"><i class="bi bi-download me-1"></i>Descargar</button></li>`).join('');
    $('docs-lista').querySelectorAll('[data-doc]').forEach(b => b.addEventListener('click', () => { const t = b.closest('li').querySelector('strong').textContent; DF.descargar(t.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.txt', `${t}\nCliente: ${c.empresa}\nPreparado por DataForge Analytics para ${c.contacto}.\n\n(Documento de demostración con datos ficticios.)`); DF.toast('Descarga iniciada: ' + t); }));
    $('tickets-gestor').textContent = c.gestor; ticketsPintar();
    $('perfil-empresa').value = c.empresa; $('perfil-rubro').value = c.rubro; $('perfil-contacto').value = c.contacto + ' — ' + c.cargo; $('perfil-correo').value = c.email; $('perfil-plan').value = c.plan; $('perfil-tel').value = perfil.tel || c.telefono;
    const notif = DF.get('df_notif_' + sesion, { informes: true, alertas: true, boletin: false }); ['informes', 'alertas', 'boletin'].forEach(n => $('notif-' + n).checked = notif[n]);
    dibujar();
  }
  function dibujar() {
    const c = CUENTAS[sesion], dias = +$('periodo').value, n = dias === 30 ? 3 : dias === 90 ? 6 : 12, etq = MESES.slice(12 - n), dat = c.serie.slice(12 - n);
    const base = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };
    const g = (id, cfg) => { graficos[id] && graficos[id].destroy(); graficos[id] = new Chart($(id), cfg); };
    g('g-ventas', { type: 'line', data: { labels: MESES, datasets: [{ label: 'Ventas (S/ miles)', data: c.serie, borderColor: '#ff9d18', backgroundColor: 'rgba(255,157,24,.15)', fill: true, tension: .35 }, { label: 'Meta', data: MESES.map(() => c.meta), borderColor: '#0c2060', borderDash: [6, 6], pointRadius: 0 }] }, options: base });
    const cont = { 'En curso': 0, 'En revisión': 0, 'Completado': 0, 'Planificado': 0 }; c.proyectos.forEach(p => cont[p[2]]++);
    g('g-estado', { type: 'doughnut', data: { labels: Object.keys(cont), datasets: [{ data: Object.values(cont), backgroundColor: ['#0c2060', '#ff9d18', '#198754', '#8b96a8'] }] }, options: { ...base, cutout: '62%' } });
    g('g-region', { type: 'bar', data: { labels: c.regiones.map(r => r[0]), datasets: [{ label: '% de la meta', data: c.regiones.map(r => r[1]), backgroundColor: c.regiones.map(r => r[1] < 100 ? '#c8283a' : '#007c91'), borderRadius: 8 }] }, options: { ...base, plugins: { legend: { display: false } }, scales: { y: { min: 60, max: 130 } } } });
    const proy = [...dat]; for (let i = 1; i <= 3; i++) proy.push(Math.round(dat[dat.length - 1] * (1 + .03 * i)));
    g('g-proyeccion', { type: 'line', data: { labels: [...etq, 'P1', 'P2', 'P3'], datasets: [{ label: 'Real', data: [...dat, null, null, null], borderColor: '#0c2060', tension: .3 }, { label: 'Proyección (ML)', data: [...dat.map((_, i) => i === dat.length - 1 ? dat[i] : null), ...proy.slice(dat.length)], borderColor: '#007c91', borderDash: [6, 6], tension: .3 }] }, options: base });
  }
  $('periodo').addEventListener('change', dibujar);
  $('exportar').addEventListener('click', () => { const c = CUENTAS[sesion]; DF.descargar(`ventas-${c.empresa.toLowerCase()}.csv`, 'Mes,Ventas (S/ miles),Meta\n' + MESES.map((m, i) => `${m},${c.serie[i]},${c.meta}`).join('\n'), 'text/csv'); DF.toast('CSV descargado.'); });
  function detalle(p) {
    $('det-titulo').textContent = `${p[0]} · ${p[1]}`;
    $('det-cuerpo').innerHTML = `<p class="mb-2"><span class="badge text-bg-${BADGE[p[2]]}">${p[2]}</span> · Responsable: <strong>${p[4]}</strong></p><p class="small text-secondary">Inicio ${p[5]} · Entrega ${p[6]}</p><ol class="list-group list-group-numbered">${['Diagnóstico y objetivos', 'Conexión de fuentes', 'Construcción y validación', 'Entrega y capacitación'].map((h, i) => `<li class="list-group-item d-flex justify-content-between"><span class="ms-2">${h}</span>${p[3] >= (i + 1) * 25 ? '<span class="badge text-bg-success">Listo</span>' : p[3] > i * 25 ? '<span class="badge text-bg-warning">En curso</span>' : '<span class="badge text-bg-light border">Pendiente</span>'}</li>`).join('')}</ol>`;
    bootstrap.Modal.getOrCreateInstance($('modal-detalle')).show();
  }
  /* ---------- soporte ---------- */
  const tk = () => DF.get('df_tickets_' + sesion, []);
  function ticketsPintar() {
    const t = tk(); $('tickets-tabla').innerHTML = t.length ? t.map(x => `<tr><td><strong>${x.id}</strong></td><td>${DF.esc(x.asunto)}</td><td>${x.prioridad}</td><td><span class="badge text-bg-${x.estado === 'Abierto' ? 'warning' : 'success'}">${x.estado}</span></td><td>${x.fecha}</td></tr>`).join('') : '<tr><td colspan="5" class="text-secondary">Aún no tienes tickets. Crea el primero con el formulario.</td></tr>';
  }
  $('form-ticket').addEventListener('submit', e => {
    e.preventDefault(); const f = e.currentTarget; if (!f.checkValidity()) { f.classList.add('was-validated'); return; }
    const t = tk(); const x = { id: 'TK-' + String(1040 + t.length + 1), asunto: f.asunto.value.trim(), prioridad: f.prioridad.value, estado: 'Abierto', fecha: new Date().toLocaleDateString('es-PE') };
    t.unshift(x); DF.set('df_tickets_' + sesion, t); f.reset(); f.classList.remove('was-validated'); ticketsPintar(); DF.toast(`Ticket ${x.id} creado. ${CUENTAS[sesion].gestor} te responderá pronto.`);
  });
  /* ---------- cuenta ---------- */
  $('form-perfil').addEventListener('submit', e => { e.preventDefault(); if (!/^[0-9 ]{9,11}$/.test($('perfil-tel').value.trim())) { $('perfil-tel').classList.add('is-invalid'); return; } $('perfil-tel').classList.remove('is-invalid'); DF.set('df_perfil_' + sesion, { tel: $('perfil-tel').value.trim() }); DF.toast('Datos de contacto actualizados.'); });
  ['informes', 'alertas', 'boletin'].forEach(n => $('notif-' + n).addEventListener('change', () => { DF.set('df_notif_' + sesion, Object.fromEntries(['informes', 'alertas', 'boletin'].map(m => [m, $('notif-' + m).checked]))); DF.toast('Preferencias guardadas.', 'secondary'); }));
  $('form-clave').addEventListener('submit', e => {
    e.preventDefault(); const f = e.currentTarget, a = $('clave-alerta'); a.className = 'alert mt-3';
    if (f.actual.value !== clave(sesion)) { a.classList.add('alert-danger'); a.textContent = 'La contraseña actual no es correcta.'; return; }
    if (!/^(?=.*\d).{8,}$/.test(f.nueva.value)) { a.classList.add('alert-danger'); a.textContent = 'La nueva contraseña debe tener al menos 8 caracteres e incluir un número.'; return; }
    if (f.nueva.value !== f.repetir.value) { a.classList.add('alert-danger'); a.textContent = 'Las contraseñas nuevas no coinciden.'; return; }
    DF.set('df_pass_' + sesion, f.nueva.value); f.reset(); a.classList.add('alert-success'); a.textContent = 'Contraseña actualizada. Úsala en tu próximo inicio de sesión.';
  });
  document.querySelectorAll('[data-bs-toggle="tab"]').forEach(b => b.addEventListener('shown.bs.tab', () => Object.values(graficos).forEach(g => g.resize())));
  if (sesion && CUENTAS[sesion]) entrar();
})();
