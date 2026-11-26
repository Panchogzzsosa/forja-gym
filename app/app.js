import { exercises, weeks, phases, series, guides } from './plan.js';

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
const sessions = weeks.flat();
const storageKey = 'forja-v1';
let data = {};
try { data = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { /* Start with an empty log. */ }

const entry = session => data[session.key] || {};
const count = session => session.exercises.filter(id => entry(session)[id]?.done).length;
const complete = session => count(session) === session.exercises.length;
const nextSession = () => sessions.find(session => !complete(session)) || sessions.at(-1);
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
const selectedSession = () => weeks[week].find(session => session.day === day);
const phase = () => phases[Math.floor(week / 2)];
const pad = value => String(value).padStart(2, '0');

function save(session, id, value) {
  data[session.key] = { ...entry(session), [id]: { ...entry(session)[id], ...value } };
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch {
    announce('El dispositivo no pudo guardar el registro. Los cambios siguen visibles mientras la app esté abierta.');
  }
}
function announce(message) {
  notice.textContent = message;
  notice.hidden = false;
  clearTimeout(noticeTimeout);
  noticeTimeout = setTimeout(() => { notice.hidden = true; }, 4000);
}
function lastWeight(session, id) {
  const earlier = sessions.slice(0, sessions.indexOf(session)).reverse();
  return earlier.map(item => entry(item)[id]?.weight).find(weight => Number.isFinite(weight));
}
function hero(session) {
  return `<section class="hero" aria-label="Sesión seleccionada">
    <div class="hero-content">
      <div class="tag"><span></span> SEMANA ${pad(week + 1)} / 08 · ${phase()[0].toUpperCase()}</div>
      <h1>${session ? session.title : 'Día de descanso'}</h1>
      <p>${session ? 'Tu entrenamiento de cuerpo completo.' : 'Deja que tus músculos se recuperen. Si te apetece, da una caminata suave.'}</p>
      ${session ? `<div class="hero-meta"><span>${icon('clock')} ${session.minutes} min</span><span>${icon('dumbbell')} ${session.exercises.length} ejercicios</span></div>
        <button class="primary" data-action="${complete(session) ? 'next' : 'start'}">${complete(session) ? (sessions.every(complete) ? 'Ver mi progreso' : 'Ir a la siguiente sesión') : count(session) ? 'Continuar rutina' : 'Empezar rutina'} ${icon('arrow')}</button>` : `<button class="primary" data-action="next">Ir a mi próxima sesión ${icon('arrow')}</button>`}
    </div>
  </section>`;
}
function calendar() {
  return `<section class="surface calendar" aria-label="Calendario de entrenamiento">
    <div class="calendar-top"><h2>Semana ${pad(week + 1)}</h2>
      <div class="week-controls"><button data-action="week" data-value="-1" aria-label="Semana anterior" ${week === 0 ? 'disabled' : ''}>${icon('left')}</button><button data-action="week" data-value="1" aria-label="Semana siguiente" ${week === 7 ? 'disabled' : ''}>${icon('right')}</button></div>
    </div>
    <div class="days">${dayNames.map((name, index) => {
      const session = weeks[week].find(item => item.day === index);
      const label = session ? (complete(session) ? 'Sesión completa' : session.title.at(-1)) : 'Descanso';
      return `<button class="day ${session ? 'training' : ''}" data-action="day" data-value="${index}" aria-pressed="${index === day}" aria-label="${name}, ${session && !complete(session) ? session.title : label}"><span>${name.slice(0, 3)}</span><strong>${label === 'Sesión completa' ? icon('check') : session ? label : '·'}</strong></button>`;
    }).join('')}</div>
    <div class="legend"><span><i></i> Entrenamiento</span><span><i></i> Descanso</span></div>
  </section>`;
}
function guideCard(key) {
  const guide = guides[key];
  return `<button class="guide surface" data-action="guide" data-value="${key}">
    <span class="tile ${key}">${icon(key === 'warm' ? 'flame' : 'leaf')}</span>
    <span><strong>${guide.title}</strong><small>${guide.subtitle} · ${guide.duration}</small></span>
    ${icon('right')}
  </button>`;
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
        <label class="check"><input type="checkbox" data-exercise="${id}" aria-label="Completar ${name}" ${record?.done ? 'checked' : ''}><span>${icon('check')}</span></label>
      </article>`;
    }).join('')}</div>
  </section>`;
}
function trainingView() {
  const session = selectedSession();
  return `<header class="page-top"><span>ENTRENAMIENTO PERSONAL</span><a href="#plan">${icon('target')} Fuerza y músculo</a></header>
    ${hero(session)}
    <div class="dashboard">
      <div class="workout-column">${session ? exerciseList(session) : `<section class="surface rest"><h2>Recuperación</h2><p>Si cambias tus días de entrenamiento, deja al menos un día entre sesiones de fuerza.</p></section>`}</div>
      <aside class="day-column" aria-label="Semana y guías">
        ${calendar()}
        <section class="guide-stack"><h2>Antes y después</h2>${guideCard('warm')}${guideCard('cool')}</section>
        <section class="surface tip"><span class="tile warm">${icon('target')}</span><div><h2>${phase()[1]}</h2><p>${phase()[2]}</p></div></section>
      </aside>
    </div>`;
}
function planView() {
  return `<header class="subpage"><h1>Mi plan</h1><p>Ocho semanas de cuerpo completo para ganar fuerza y músculo.</p></header>
  <div class="plan-layout"><div class="phase-list">${phases.map(([name, goal, description], index) => `<section class="surface phase"><span class="tag">SEMANAS ${index * 2 + 1}–${index * 2 + 2}</span><h2>${name}</h2><h3>${goal}</h3><p>${description}</p><div class="phase-actions">${[index * 2, index * 2 + 1].map(number => `<button class="secondary" data-action="open-week" data-value="${number}">Semana ${number + 1} ${icon('arrow')}</button>`).join('')}</div></section>`).join('')}</div>
  <aside class="surface notes"><h2>Cómo seguir tu plan</h2>
  <p><strong>Semanas 1–2.</strong> Lunes y jueves. Semanas 3–8, lunes, miércoles y viernes. Puedes mover los días dejando un día libre entre sesiones. Si faltas, retoma la sesión pendiente cuando puedas.</p>
  <p><strong>Repeticiones en reserva.</strong> Son las que estimas que aún podrías hacer con buena técnica al terminar una serie. Baja la carga si tu movimiento pierde control.</p>
  <p><strong>Ajuste para tu estatura (1.89 m).</strong> Ajusta asiento y respaldo antes de cargar. Pide al personal que te muestre cómo alinear la máquina si el recorrido se siente incómodo. Elige el peso inicial por control y esfuerzo.</p>
  <p><strong>Dolor.</strong> Detén el ejercicio si aparece dolor agudo o articular. Si persiste, consulta a un profesional de salud antes de retomarlo.</p>
  <p class="sources">Fuentes <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/" rel="noreferrer">ACSM</a> · <a href="https://www.heart.org/en/healthy-living/exercise-and-physical-activity/fitness-basics/warm-up-cool-down" rel="noreferrer">American Heart Association</a></p>
  </aside></div>`;
}
function progressView() {
  const done = sessions.filter(complete).length;
  const marks = sessions.reduce((sum, session) => sum + count(session), 0);
  const history = sessions.filter(session => session.exercises.some(id => entry(session)[id]?.done || Number.isFinite(entry(session)[id]?.weight))).reverse();
  return `<header class="subpage"><h1>Mi progreso</h1><p>Tu constancia y tus cargas, guardadas en este dispositivo.</p></header>
  <div class="metrics"><div class="surface metric"><strong>${done}<small> / ${sessions.length}</small></strong>Sesiones completas</div><div class="surface metric"><strong>${marks}</strong>Ejercicios marcados</div><div class="surface metric"><strong>${Math.round(done / sessions.length * 100)}%</strong>Del plan completo</div></div>
  <section class="surface history"><h2>Historial de entrenamiento</h2>
  ${history.length ? history.map(session => `<details><summary>Semana ${session.week + 1} · ${dayNames[session.day]} · ${session.title} <small>${count(session)}/5 completos</small></summary><ul>${session.exercises.map(id => {
    const record = entry(session)[id];
    return `<li>${exercises[id][0]} <span>${Number.isFinite(record?.weight) ? `${record.weight} kg · ` : ''}${record?.done ? 'Completo' : 'Pendiente'}</span></li>`;
  }).join('')}</ul></details>`).join('') : '<p>Aquí aparecerán tus sesiones cuando marques un ejercicio o guardes una carga.</p><a class="primary" href="#entrenar">Ir a entrenar</a>'}</section>`;
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
    ${id !== 'plank' && id !== 'bridge' ? `<form id="weight-form" data-id="${id}"><label for="weight">Carga usada (kg)</label><div><input id="weight" name="weight" type="number" min="0" max="999" step="any" inputmode="decimal" value="${weight ?? ''}" placeholder="${previous ?? '0'}"><button class="primary">Guardar carga</button></div>${previous !== undefined ? `<small>Última carga registrada: ${previous} kg</small>` : ''}</form>` : ''}
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
  day = (weeks[week].find(item => !complete(item)) || weeks[week][0]).day;
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
    if (action === 'next' && sessions.every(complete)) {
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
  if (event.target.id !== 'weight-form') return;
  event.preventDefault();
  const value = event.target.elements.weight.value;
  save(selectedSession(), event.target.dataset.id, { weight: value === '' ? null : Number(value) });
  modal.close();
  render();
  announce(value === '' ? 'Carga eliminada.' : 'Carga guardada.');
});
modal.addEventListener('close', () => { modal.replaceChildren(); });
window.addEventListener('hashchange', render);
render();
