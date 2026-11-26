export const exercises = {
  legs: ['Prensa de piernas', 'Piernas · Máquina', '10–12', 'v5fSebr6n_U', 'Ajusta el respaldo para que la cadera quede apoyada. Baja hasta donde puedas mantener la pelvis en el asiento y empuja con todo el pie. Mantén las rodillas alineadas con los pies.', 120],
  chest: ['Press de pecho', 'Pecho · Máquina', '8–12', 'n1Dyy3De1Rc', 'Ajusta el asiento para que las asas queden a media altura del pecho. Apoya la espalda y empuja con las muñecas rectas. Regresa despacio.', 120],
  pull: ['Jalón al pecho', 'Espalda · Polea', '8–12', 'JGeRYIZdojU', 'Ajusta la almohadilla sobre los muslos. Lleva los codos hacia abajo y la barra hacia el pecho alto. Regresa con control.', 120],
  curl: ['Curl femoral sentado', 'Piernas · Máquina', '10–12', 'IOufFLwNOTU', 'Alinea las rodillas con el eje de giro de la máquina. Asegura los muslos con la almohadilla y flexiona las rodillas sin despegar la cadera.', 90],
  plank: ['Plancha de antebrazos', 'Abdomen · Peso corporal', '15–25 s', 'mwlp75MS6Rg', 'Pon los codos debajo de los hombros. Mantén costillas y pelvis alineadas y respira durante la serie. Apoya las rodillas si necesitas una versión más fácil.', 60],
  row: ['Remo sentado', 'Espalda · Polea', '8–12', 'lJoozxC0Rns', 'Siéntate estable con las rodillas ligeramente flexionadas. Lleva el agarre hacia las costillas bajas manteniendo el torso quieto.', 120],
  shoulder: ['Press de hombros', 'Hombros · Máquina', '8–12', 'GcY6TZxfS0k', 'Ajusta las asas cerca de la altura de tus hombros. Mantén la espalda contra el respaldo y empuja en un recorrido cómodo.', 120],
  bridge: ['Puente de glúteos', 'Glúteos · Peso corporal', '10–15', 'tqp5XQPpTxY', 'Acuéstate boca arriba con los pies apoyados y las rodillas flexionadas. Eleva la cadera apretando los glúteos. Baja despacio.', 90],
  rdl: ['Peso muerto rumano', 'Isquiotibiales · Mancuernas', '8–10', 'aa57T45iFSE', 'Practica primero la bisagra sin carga. Con las rodillas ligeramente flexionadas, lleva la cadera hacia atrás y acerca las mancuernas a tus piernas. Detén la bajada antes de perder la postura.', 120],
  lateral: ['Elevación lateral', 'Hombro · Mancuernas', '12–15', 'XPPfnSEATJA', 'Usa mancuernas ligeras. Con los codos un poco doblados, eleva los brazos a una altura cómoda cerca de los hombros. Baja sin balancearte.', 75],
  triceps: ['Extensión de tríceps', 'Tríceps · Polea', '10–15', 'LXkCrxn3caQ', 'Fija los codos junto al torso y extiende los antebrazos. Deja que la cuerda suba con control.', 75],
  calves: ['Elevación de talones', 'Pantorrilla · Peso corporal', '12–15', 'CtpPV2FBkG4', 'Sujétate a un apoyo firme. Sube con ambos pies, haz una pausa arriba y baja despacio. Mantén el recorrido cómodo.', 75],
  extension: ['Extensión de piernas', 'Cuádriceps · Máquina', '10–15', '4ZDm5EbiFI8', 'Alinea las rodillas con el eje de giro y coloca el rodillo encima de los tobillos. Extiende con control dentro de un recorrido cómodo.', 75],
};
const a = ['legs', 'chest', 'pull', 'curl', 'plank'];
const b = ['legs', 'row', 'shoulder', 'bridge', 'plank'];
const c = ['legs', 'chest', 'row', 'bridge', 'plank'];
const full = [
  [0, 'Cuerpo completo A', 'A', a],
  [2, 'Cuerpo completo B', 'B', b],
  [4, 'Cuerpo completo C', 'C', c],
];
const split = [
  [0, 'Torso A', 'TA', ['chest', 'row', 'pull', 'shoulder', 'lateral']],
  [1, 'Pierna A', 'PA', ['legs', 'curl', 'bridge', 'calves', 'plank']],
  [3, 'Torso B', 'TB', ['chest', 'pull', 'row', 'lateral', 'triceps']],
  [4, 'Pierna B', 'PB', ['rdl', 'legs', 'extension', 'calves', 'plank']],
];
export const blocks = [
  { start: 0, end: 1, title: 'Dominar la técnica', label: 'Base', description: 'Tres sesiones de cuerpo completo. Empieza con 3–4 repeticiones en reserva. En la segunda semana, acércate a 3 si terminas con buena técnica y llegas recuperado.' },
  { start: 2, end: 3, title: 'Probar torso y pierna', label: 'Transición', description: 'Pasa a cuatro días si completaste la semana anterior, te recuperaste bien, dominas los movimientos y tienes tiempo. Durante la primera semana de la división, mantén dos series por ejercicio.' },
  { start: 4, end: 5, title: 'Construir volumen', label: 'Construcción', description: 'Cuando ya tengas una semana de torso y pierna bien tolerada, añade una tercera serie a los dos primeros ejercicios. Conserva dos series en los demás.' },
  { start: 6, end: 7, title: 'Afianzar cargas', label: 'Consolidación', description: 'Cuando completes el máximo de repeticiones con buena técnica y 2–3 en reserva en dos sesiones, prueba el siguiente incremento pequeño. Si pierdes control o quedas por debajo del mínimo, vuelve a la carga anterior.' },
];
export const totalWeeks = 8;
export function schedule(week, mode = 'base') {
  const layout = mode === 'split' || mode === 'build' ? split : full;
  return layout.map(([day, title, code, exercises]) => ({
    key: `${week}-${day}`, week, day, title, code, exercises, mode,
    minutes: mode === 'light' ? '25–35' : mode === 'build' ? '40–55' : '35–45',
    reserve: mode === 'light' ? '4' : week === 0 ? '3–4' : mode === 'build' ? '2–3' : '3',
  }));
}
export function recommend(week, answers, previousComplete, previousMode) {
  if (!answers.recovered || !answers.technique) return 'light';
  if (week < 2 || !previousComplete || !answers.available || previousMode === 'light') return 'base';
  return week >= 4 && ['split', 'build'].includes(previousMode) ? 'build' : 'split';
}
export function series(session, id) {
  const index = session.exercises.indexOf(id);
  if (session.mode === 'light') return index === 0 ? 2 : 1;
  if (session.mode === 'build' && index < 2) return 3;
  return 2;
}
// The original schedule keeps older checkmarks and weights tied to their sessions.
export const legacySessions = Array.from({ length: totalWeeks }, (_, week) => {
  const days = week < 2 ? [0, 3] : [0, 2, 4];
  return days.map((day, index) => {
    const isB = (index + (week >= 2 ? week % 2 : 0)) % 2 === 1;
    return { key: `${week}-${day}`, day, title: `Cuerpo completo ${isB ? 'B' : 'A'}`, exercises: isB ? b : a, week };
  });
}).flat();

export const guides = {
  warm: {
    title: 'Calentamiento', duration: '8–10 min', subtitle: 'Antes de entrenar',
    steps: [
      ['5 min · Cardio suave', 'Camina en la banda o pedalea a un ritmo que te permita conversar.'],
      ['2 min · Movilidad dinámica', 'Haz 8 sentadillas cortas sin peso, 8 bisagras de cadera y 8 círculos de brazos hacia cada lado. Usa un rango cómodo.'],
      ['Series de aproximación', 'Haz 1–2 series ligeras de 8–10 repeticiones para practicar el primer ejercicio y cualquier movimiento nuevo. Ajusta la máquina antes de añadir carga.'],
    ],
  },
  cool: {
    title: 'Vuelta a la calma', duration: '5–8 min', subtitle: 'Después de entrenar',
    steps: [
      ['5 min · Baja el ritmo', 'Camina suavemente hasta que tu respiración vuelva a un ritmo cómodo.'],
      ['Estiramientos opcionales · 15–20 s por lado', 'Pecho: apoya el antebrazo en una pared y gira despacio. Cuádriceps: sujétate y acerca el talón al glúteo. Pantorrilla: da un paso atrás y mantén el talón en el suelo.'],
      ['Termina con calma', 'Estira hasta sentir tensión leve, sin rebotes ni dolor. Toma agua y anota la carga que usaste para la próxima sesión.'],
    ],
  },
};
