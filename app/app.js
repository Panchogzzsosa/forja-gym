import { exercises, schedule, blocks, recommend, totalWeeks, legacySessions, series, guides } from './plan.js';

const icons = {
  bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z"/>',
  dumbbell: '<path d="m6.5 17.5 11-11M4 15l5 5m6-16 5 5M2 17l5 5M17 2l5 5M2 21l1 1M21 2l1 1"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 5h2m4 0h2"/>',
  chart: '<path d="M3 3v18h18M7 15l4-4 4 2 5-6"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  play: '<path d="m9 5 11 7-11 7V5Z"/>',
  flame: '<path d="M12 22a7 7 0 0 0 7-7c0-4-3-7-5-9 0 3-1 4-2 4 0-4-2-6-3-8 0 5-4 8-4 13a7 7 0 0 0 7 7Z"/><path d="M12 22c-3 0-4-5 0-8 4 3 3 8 0 8Z"/>',
  leaf: '<path d="M20 4c-7-1-14 1-14 8 0 4 2 6 6 6 7 0 9-7 8-14ZM4 20l10-10"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const storageKey = 'forja-v2';
function readLog(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}
const data = readLog(storageKey);
const legacy = readLog('forja-v1');
const reviews = data.reviews ??= {};
const weekSchedule = number => schedule(number, reviews[number]?.mode);
const planSessions = () => Array.from({ length: totalWeeks }, (_, number) => weekSchedule(number)).flat();

const entry = (session, log = data) => log[session.key] || {};
const count = (session, log = data) => session.exercises.filter(id => entry(session, log)[id]?.done).length;
const complete = session => count(session) === session.exercises.length;
function nextSession() {
  const sessions = planSessions();
  return sessions.find(session => !complete(session)) || sessions.at(-1);
}
const locked = number => weekSchedule(number).some(session => Object.values(entry(session)).some(record =>
  record.done || Number.isFinite(record.weight)));
const currentBlock = number => blocks.find(({ end }) => number <= end);
let week = nextSession().week;
let day = nextSession().day;
let currentPage;
let finishAt = 0;
let timerInterval;
let noticeTimeout;
const main = document.querySelector('#main');
const modal = document.querySelector('#dialog');
const notice = document.querySelector('#notice');
const timerBar = document.querySelector('#timer-bar');
const selectedSession = () => weekSchedule(week).find(session => session.day === day);
const pad = value => String(value).padStart(2, '0');

function save(session, id, value) {
  data[session.key] = { ...entry(session), [id]: { ...entry(session)[id], ...value } };
  return persist();
}
function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
    return true;
  } catch {
    announce('El dispositivo no pudo guardar el registro. Los cambios siguen visibles mientras la app esté abierta.');
    return false;
  }
}
function announce(message) {
  notice.textContent = message;
  notice.hidden = false;
  clearTimeout(noticeTimeout);
  noticeTimeout = setTimeout(() => { notice.hidden = true; }, 4000);
}
function lastWeight(session, id) {
  const sessions = planSessions();
  const earlier = sessions.slice(0, sessions.findIndex(item => item.key === session.key)).reverse();
  const recent = earlier.map(item => entry(item)[id]?.weight).find(Number.isFinite);
  return recent ?? [...legacySessions].reverse().map(item => entry(item, legacy)[id]?.weight).find(Number.isFinite);
}
function hero(session) {
  const finished = session && complete(session);
  const title = session?.title || 'Recuperación';
  const titleLines = session ? title.replace('Cuerpo ', 'Cuerpo<br>') : title;
  return `<section class="hero" aria-label="Sesión seleccionada">
    <div class="hero-content">
      <div class="tag">${dayNames[day]} <span> / </span> ${session ? currentBlock(week).label : 'Día libre'}</div>
      <h1 aria-label="${title}">${titleLines}</h1>
      ${session ? `<div class="hero-meta"><span>${icon('clock')} ${session.minutes} min</span><span>${session.reserve} reps en reserva</span></div>`
        : '<p>Una caminata suave es suficiente si te apetece moverte.</p>'}
      <button class="primary" data-action="${!session || finished ? 'next' : 'start'}">
        ${!session ? 'Ir a la siguiente sesión' : finished ? (planSessions().every(complete) ? 'Ver progreso' : 'Ir a la siguiente sesión') : count(session) ? 'Continuar rutina' : 'Empezar rutina'} ${icon('arrow')}
      </button>
    </div>
    <div class="plate" aria-hidden="true"><span>${session?.code ?? '—'}</span></div>
  </section>`;
}
function calendar() {
  const sessions = weekSchedule(week);
  return `<section class="calendar" aria-label="Calendario de entrenamiento">
    <div class="calendar-top"><h2>Semana ${pad(week + 1)}<small> / ${pad(totalWeeks)}</small></h2>
      <div class="week-controls"><button data-action="week" data-value="-1" aria-label="Semana anterior" ${week === 0 ? 'disabled' : ''}>${icon('left')}</button><button data-action="week" data-value="1" aria-label="Semana siguiente" ${week === totalWeeks - 1 ? 'disabled' : ''}>${icon('right')}</button></div>
    </div>
    <div class="days">${dayNames.map((name, index) => {
      const session = sessions.find(item => item.day === index);
      const done = session && complete(session);
      const label = session ? session.title + (done ? ', completa' : '') : 'Descanso';
      return `<button class="day ${session ? 'training' : ''}" data-action="day" data-value="${index}" aria-pressed="${index === day}" aria-label="${name}, ${label}"><span>${name.slice(0, 3)}</span><strong>${done ? icon('check') : session?.code ?? '–'}</strong></button>`;
    }).join('')}</div>
  </section>`;
}
function guideCard(key) {
  const guide = guides[key];
  return `<button class="guide" data-action="guide" data-value="${key}">
    <span class="tile ${key}">${icon(key === 'warm' ? 'flame' : 'leaf')}</span>
    <span><strong>${guide.title}</strong> <small>${guide.duration}</small></span>
    ${icon('right')}
  </button>`;
}
function reviewNote(number) {
  const review = reviews[number];
  if (review?.mode === 'light') return 'Tres sesiones más ligeras para retomar la técnica y recuperarte.';
  if (review?.mode === 'build') return 'Cuatro sesiones. Suma una serie a los dos primeros movimientos de cada día.';
  if (review?.mode === 'split') return 'Cuatro sesiones de torso y pierna con dos series por ejercicio.';
  if (review?.mode === 'base') return 'Tres sesiones de cuerpo completo. Mantén la frecuencia mientras consolidas técnica y constancia.';
  if (number === 0) return 'Tus primeras visitas fueron de adaptación. Esta semana usa cargas que puedas controlar y deja 3–4 repeticiones en reserva.';
  if (locked(number)) return 'Esta semana ya está en marcha con tres sesiones de cuerpo completo. Podrás ajustar la próxima antes de empezarla.';
  if (number === 1) return 'Revisa cómo te recuperaste para ajustar el esfuerzo de esta semana.';
  return 'Revisa la semana anterior para decidir si toca mantener tres sesiones o pasar a torso y pierna.';
}
function coach() {
  const review = reviews[week];
  return `<section class="coach">
    <div class="tag">AJUSTE SEMANAL</div>
    <h2>${review ? review.mode === 'light' ? 'Baja un cambio' : weekSchedule(week).length === 4 ? 'Torso y pierna' : 'Mantén la base' : currentBlock(week).title}</h2>
    <p>${reviewNote(week)}</p>
    ${week > 0 && !locked(week) ? `<button class="text-button" data-action="review">${review ? 'Editar revisión' : 'Revisar mi semana'} ${icon('arrow')}</button>` : ''}
  </section>`;
}
function exerciseList(session) {
  return `<section class="workout" id="workout" tabindex="-1">
    <div class="section-heading"><h2>Ejercicios de la sesión</h2><span class="counter">${count(session)} / ${session.exercises.length} completos</span></div>
    <progress aria-label="Ejercicios completados" max="${session.exercises.length}" value="${count(session)}"></progress>
    <div class="exercise-list">${session.exercises.map((id, index) => {
      const [name, group, reps] = exercises[id];
      const record = entry(session)[id];
      return `<article class="exercise surface ${record?.done ? 'done' : ''}">
        <span class="exercise-number">${pad(index + 1)}</span>
        <button class="exercise-info" data-action="exercise" data-value="${id}"><strong>${name}</strong><small>${group}</small></button>
        <span class="prescription">${series(session, id)} × ${reps}${Number.isFinite(record?.weight) ? `<small>${record.weight} kg</small>` : ''}</span>
        <button class="play" data-action="video" data-value="${id}" aria-label="Video de ${name}">${icon('play')}</button>
        <label class="check"><input type="checkbox" data-exercise="${id}" aria-label="Completar ${name}" ${record?.done ? 'checked' : ''}><span></span></label>
      </article>`;
    }).join('')}</div>
  </section>`;
}
function trainingView() {
  const session = selectedSession();
  return `<div class="dashboard">
    ${calendar()}
    ${hero(session)}
    ${coach()}
    <div class="workout-column">
      ${session ? `${guideCard('warm')}${exerciseList(session)}${guideCard('cool')}` :
        '<section class="rest"><h2>Día libre</h2><p>En torso y pierna puedes entrenar dos días seguidos alternando la zona. Con cuerpo completo, conserva un día libre entre sesiones.</p></section>'}
    </div>
  </div>`;
}
function planView() {
  return `<header class="subpage"><div class="tag">FUERZA Y MÚSCULO</div><h1>Mi plan</h1><p>Ocho semanas. Ajusta el siguiente paso según cómo vas entrenando.</p></header>
  <div class="plan-layout"><div class="phase-list">${blocks.map(({ start, end, title, description }) => `<section class="phase">
    <span class="phase-range">${pad(start + 1)}<small>—${pad(end + 1)}</small></span>
    <div><h2>${title}</h2><p>${description}</p><div class="phase-actions">${[start, end].map(number => `<button class="secondary" data-action="open-week" data-value="${number}">Semana ${number + 1} ${icon('arrow')}</button>`).join('')}</div></div>
  </section>`).join('')}</div>
  <aside class="notes"><h2>Cómo ajustar el esfuerzo</h2>
  <p><strong>Repeticiones en reserva.</strong> Son las repeticiones que estimas que podrías hacer con buena técnica al terminar una serie. Reduce la carga si pierdes control. Mantén margen antes del fallo durante todo el plan.</p>
  <p><strong>Tus días.</strong> Cuerpo completo: lunes, miércoles y viernes. Torso y pierna: lunes, martes, jueves y viernes. Si faltas, retoma la sesión pendiente cuando puedas.</p>
  <p><strong>Ajusta el equipo a tu estatura.</strong> Alinea asiento y respaldo antes de cargar. Si una máquina limita tu recorrido, pide al personal que te ayude a ajustarla.</p>
  <p><strong>Dolor.</strong> Detén el ejercicio si aparece dolor agudo o articular. Si persiste, consulta a un profesional de salud antes de retomarlo.</p>
  <p class="sources">Fuentes <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/">ACSM</a> · <a href="https://pubmed.ncbi.nlm.nih.gov/38595233/">Cuerpo completo y rutinas divididas</a> · <a href="https://www.heart.org/en/healthy-living/exercise-and-physical-activity/fitness-basics/warm-up-cool-down">AHA</a></p>
  </aside></div>`;
}
function historyRows(sessions, log) {
  return sessions.filter(session => session.exercises.some(id => {
    const record = entry(session, log)[id];
    return record?.done || Number.isFinite(record?.weight);
  })).reverse().map(session => `<details><summary>Semana ${session.week + 1} · ${dayNames[session.day]} · ${session.title} <small>${count(session, log)}/${session.exercises.length} completos</small></summary><ul>${session.exercises.map(id => {
    const record = entry(session, log)[id];
    return `<li>${exercises[id][0]} <span>${Number.isFinite(record?.weight) ? `${record.weight} kg · ` : ''}${record?.done ? 'Completo' : 'Pendiente'}</span></li>`;
  }).join('')}</ul></details>`).join('');
}
function progressView() {
  const sessions = planSessions();
  const done = sessions.filter(complete).length;
  const marks = sessions.reduce((sum, session) => sum + count(session), 0);
  const history = historyRows(sessions, data);
  const earlier = historyRows(legacySessions, legacy);
  return `<header class="subpage"><div class="tag">BITÁCORA</div><h1>Mi progreso</h1><p>Tus sesiones y cargas se guardan en este dispositivo.</p></header>
  <div class="metrics"><div class="metric"><strong>${pad(done)}</strong>Sesiones completas</div><div class="metric"><strong>${pad(marks)}</strong>Ejercicios marcados</div><div class="metric"><strong>${pad(Object.keys(reviews).length)}</strong>Revisiones semanales</div></div>
  <section class="history"><h2>Historial del plan actual</h2>
  ${history || '<p>Tus sesiones aparecerán al marcar un ejercicio o guardar una carga.</p><a class="text-button" href="#entrenar">Ir a entrenar →</a>'}</section>
  ${earlier ? `<section class="history"><h2>Historial del plan anterior</h2>${earlier}</section>` : ''}`;
}
function reviewDialog() {
  const previous = weekSchedule(week - 1);
  const finished = previous.filter(complete).length;
  const answers = reviews[week]?.answers || {};
  const questions = [
    ['recovered', '¿Llegaste recuperado a la siguiente sesión?'],
    ['technique', '¿Pudiste terminar con buena técnica y repeticiones en reserva?'],
  ];
  if (week >= 2) questions.push(['available', '¿Puedes entrenar cuatro días esta semana?']);
  dialog('Revisión semanal', `Semana ${pad(week + 1)}`, `
    <p>Semana anterior: ${finished} de ${previous.length} sesiones completas.</p>
    <form id="review-form">
      ${questions.map(([id, question]) => `<fieldset><legend>${question}</legend><div class="choices">
        <label><input type="radio" required name="${id}" value="yes" ${answers[id] === true ? 'checked' : ''}><span>Sí</span></label>
        <label><input type="radio" name="${id}" value="no" ${answers[id] === false ? 'checked' : ''}><span>No</span></label>
      </div></fieldset>`).join('')}
      <button class="primary">Ajustar mi semana ${icon('arrow')}</button>
    </form>`);
}
function render() {
  const locationPage = location.hash.slice(1);
  const page = ['entrenar', 'plan', 'progreso'].includes(locationPage) ? locationPage : 'entrenar';
  main.innerHTML = { entrenar: trainingView, plan: planView, progreso: progressView }[page]();
  document.querySelectorAll('[data-page]').forEach(link => {
    if (link.dataset.page === page) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (page !== currentPage) window.scrollTo(0, 0);
  currentPage = page;
}
function dialog(title, subtitle, content) {
  modal.innerHTML = `<header class="dialog-header"><div><span class="tag">${subtitle}</span><h1 id="dialog-title">${title}</h1></div><form method="dialog"><button class="square" aria-label="Cerrar" autofocus>${icon('close')}</button></form></header>${content}`;
  modal.showModal();
}
function exerciseDialog(id, showVideo) {
  const session = selectedSession();
  const [name, group, reps, video, instructions, seconds] = exercises[id];
  const weight = entry(session)[id]?.weight;
  const previous = lastWeight(session, id);
  dialog(name, group, `
    ${showVideo ? `<iframe title="Demostración de ${name}" src="https://www.youtube-nocookie.com/embed/${video}?playsinline=1" allow="fullscreen; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` : ''}
    <div class="dialog-meta"><span>${series(session, id)} series × ${reps}${id === 'plank' ? '' : ' reps'}</span><span>${seconds} s de descanso</span></div>
    <p>${instructions}</p>
    <div class="dialog-actions"><a class="secondary" href="https://www.youtube.com/watch?v=${video}" rel="noopener">${icon('play')} Abrir en YouTube</a><button class="secondary" data-action="timer" data-value="${seconds}">${icon('clock')} Iniciar descanso</button></div>
    ${!group.includes('Peso corporal') ? `<form id="weight-form" data-id="${id}"><label for="weight">Carga usada (kg)</label><div><input id="weight" name="weight" type="number" min="0" max="999" step="any" inputmode="decimal" value="${weight ?? ''}" placeholder="${previous ?? '0'}"><button class="primary">Guardar carga</button></div>${previous !== undefined ? `<small>Última carga registrada: ${previous} kg</small>` : ''}</form>` : ''}
  `);
}
function startTimer(seconds) {
  finishAt = Date.now() + seconds * 1000;
  clearInterval(timerInterval);
  timerBar.innerHTML = `<div>${icon('clock')} <span>Descanso</span> <strong id="timer-value" role="timer"></strong></div><button class="square" data-action="stop" aria-label="Cerrar temporizador">${icon('close')}</button>`;
  timerBar.hidden = false;
  updateTimer();
  timerInterval = setInterval(updateTimer, 250);
}
function updateTimer() {
  const seconds = Math.max(0, Math.ceil((finishAt - Date.now()) / 1000));
  document.querySelector('#timer-value').textContent = seconds ? `${Math.floor(seconds / 60)}:${pad(seconds % 60)}` : 'Tiempo cumplido';
  if (!seconds) {
    clearInterval(timerInterval);
    announce('Terminó tu descanso.');
    navigator.vibrate?.([110, 70, 110]);
  }
}
function selectWeek(number) {
  week = number;
  day = (weekSchedule(week).find(item => !complete(item)) || weekSchedule(week)[0]).day;
}
document.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { action, value } = button.dataset;
  if (action === 'week' || action === 'day') {
    if (action === 'week') selectWeek(week + Number(value));
    else day = Number(value);
    render();
    const replacement = [...main.querySelectorAll(`[data-action="${action}"]`)].find(control => control.dataset.value === value);
    (replacement?.disabled ? main.querySelector('.day[aria-pressed="true"]') : replacement)?.focus({ preventScroll: true });
  }
  if (action === 'open-week' || action === 'next') {
    if (action === 'next' && planSessions().every(complete)) {
      location.hash = 'progreso';
      return;
    }
    if (action === 'open-week') selectWeek(Number(value));
    else ({ week, day } = nextSession());
    location.hash = 'entrenar';
    render();
    window.scrollTo(0, 0);
  }
  if (action === 'start') {
    const session = selectedSession();
    if (count(session) === 0) openGuide('warm', true);
    else focusWorkout();
  }
  if (action === 'guide') openGuide(value);
  if (action === 'review' && week > 0 && !locked(week)) reviewDialog();
  if (action === 'workout') {
    modal.close();
    requestAnimationFrame(focusWorkout);
  }
  if (action === 'exercise' || action === 'video') exerciseDialog(value, action === 'video');
  if (action === 'timer') {
    modal.close();
    startTimer(Number(value));
  }
  if (action === 'stop') {
    clearInterval(timerInterval);
    timerBar.hidden = true;
  }
});
function focusWorkout() {
  document.querySelector('#workout')?.focus();
}
function openGuide(key, starting = false) {
  const guide = guides[key];
  dialog(guide.title, guide.duration, `<ol class="steps">${guide.steps.map(([title, description]) => `<li><strong>${title}</strong><p>${description}</p></li>`).join('')}</ol>${starting ? `<button class="primary" data-action="workout">Ver ejercicios ${icon('arrow')}</button>` : ''}`);
}
document.addEventListener('change', event => {
  const id = event.target.dataset.exercise;
  if (!id) return;
  const session = selectedSession();
  save(session, id, { done: event.target.checked });
  render();
  main.querySelector(`input[data-exercise="${id}"]`)?.focus({ preventScroll: true });
  if (complete(session)) announce('Sesión completa. Puedes hacer la vuelta a la calma.');
});
document.addEventListener('submit', event => {
  if (event.target.id === 'review-form') {
    event.preventDefault();
    if (week === 0 || locked(week)) return;
    const form = new FormData(event.target);
    const answers = Object.fromEntries([...form].map(([name, value]) => [name, value === 'yes']));
    const previous = weekSchedule(week - 1);
    reviews[week] = { answers, mode: recommend(week, answers, previous.every(complete), previous[0].mode) };
    const saved = persist();
    modal.close();
    selectWeek(week);
    render();
    main.querySelector('.text-button[data-action="review"]')?.focus({ preventScroll: true });
    if (saved) announce(reviewNote(week));
    return;
  }
  if (event.target.id !== 'weight-form') return;
  event.preventDefault();
  const value = event.target.elements.weight.value;
  const saved = save(selectedSession(), event.target.dataset.id, { weight: value === '' ? null : Number(value) });
  modal.close();
  render();
  if (saved) announce(value === '' ? 'Carga eliminada.' : 'Carga guardada.');
});
modal.addEventListener('close', () => { modal.replaceChildren(); });
window.addEventListener('hashchange', render);
render();
