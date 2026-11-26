export const exercises = {
  legs: ['Prensa de piernas', 'Piernas · Máquina', '10–12', 'v5fSebr6n_U', 'Ajusta el respaldo para que la cadera quede apoyada. Baja hasta donde puedas mantener la pelvis en el asiento y empuja con todo el pie. Mantén las rodillas alineadas con los pies.', 120],
  chest: ['Press de pecho', 'Pecho · Máquina', '8–12', 'n1Dyy3De1Rc', 'Ajusta el asiento para que las asas queden a media altura del pecho. Apoya la espalda y empuja con las muñecas rectas. Regresa despacio.', 120],
  pull: ['Jalón al pecho', 'Espalda · Polea', '8–12', 'JGeRYIZdojU', 'Ajusta la almohadilla sobre los muslos. Lleva los codos hacia abajo y la barra hacia el pecho alto. Regresa con control.', 120],
  curl: ['Curl femoral sentado', 'Piernas · Máquina', '10–12', 'IOufFLwNOTU', 'Alinea las rodillas con el eje de giro de la máquina. Asegura los muslos con la almohadilla y flexiona las rodillas sin despegar la cadera.', 90],
  plank: ['Plancha de antebrazos', 'Abdomen · Peso corporal', '15–25 s', 'mwlp75MS6Rg', 'Pon los codos debajo de los hombros. Mantén costillas y pelvis alineadas y respira durante la serie. Apoya las rodillas si necesitas una versión más fácil.', 60],
  row: ['Remo sentado', 'Espalda · Polea', '8–12', 'lJoozxC0Rns', 'Siéntate estable con las rodillas ligeramente flexionadas. Lleva el agarre hacia las costillas bajas manteniendo el torso quieto.', 120],
  shoulder: ['Press de hombros', 'Hombros · Máquina', '8–12', 'GcY6TZxfS0k', 'Ajusta las asas cerca de la altura de tus hombros. Mantén la espalda contra el respaldo y empuja en un recorrido cómodo.', 120],
  bridge: ['Puente de glúteos', 'Glúteos · Peso corporal', '10–15', 'tqp5XQPpTxY', 'Acuéstate boca arriba con los pies apoyados y las rodillas flexionadas. Eleva la cadera apretando los glúteos. Baja despacio.', 90],
};
const a = ['legs', 'chest', 'pull', 'curl', 'plank'];
const b = ['legs', 'row', 'shoulder', 'bridge', 'plank'];
export const phases = [
  ['Adaptación', 'Aprende los movimientos', 'Empieza con una carga ligera y deja 3–4 repeticiones en reserva. Ajusta cada máquina hasta encontrar un recorrido cómodo.'],
  ['Base', 'Repite con control', 'Deja unas 3 repeticiones en reserva. Si dos días te siguen dejando muy cansado, conserva la frecuencia de las semanas 1 y 2 hasta recuperarte bien.'],
  ['Construcción', 'Suma una serie', 'Pasa a 3 series en los primeros tres ejercicios si te has recuperado bien. Mantén unas 2–3 repeticiones en reserva. Si el volumen te cuesta, conserva 2 series.'],
  ['Consolidación', 'Progresa poco a poco', 'Cuando alcances el tope de repeticiones en todas las series de un ejercicio en dos sesiones, con buena técnica y 2–3 en reserva, prueba el siguiente incremento pequeño. Si no llegas al mínimo con control, vuelve a la carga anterior.'],
];
export const weeks = Array.from({ length: 8 }, (_, week) => {
  const days = week < 2 ? [0, 3] : [0, 2, 4];
  return days.map((day, index) => {
    const isB = (index + (week >= 2 ? week % 2 : 0)) % 2 === 1;
    return { key: `${week}-${day}`, day, title: `Full body ${isB ? 'B' : 'A'}`,
      exercises: isB ? b : a, minutes: week < 4 ? '35–45' : '40–55', week };
  });
});
export const series = (session, id) => session.week >= 4 && session.exercises.indexOf(id) < 3 ? 3 : 2;
export const guides = {
  warm: {
    title: 'Calentamiento', duration: '8–10 min', subtitle: 'Antes de entrenar',
    steps: [
      ['5 min · Cardio suave', 'Camina en la banda o pedalea a un ritmo que te permita conversar.'],
      ['2 min · Movilidad dinámica', 'Haz 8 sentadillas cortas sin peso, 8 bisagras de cadera y 8 círculos de brazos hacia cada lado. Usa un rango cómodo.'],
      ['Series de aproximación', 'Haz una serie ligera de 8–10 repeticiones antes de tu primer ejercicio de piernas y del primer empuje. Repite con carga ligera si todavía estás encontrando el ajuste de la máquina.'],
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
