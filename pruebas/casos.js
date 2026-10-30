// Casos de prueba: corre el analizador sin necesidad de WhatsApp.
// Uso: npm run probar
const { analizar } = require('../src/analizador');
const { armarRespuesta } = require('../src/respuestas');

const CASOS = [
  { nombre: 'Maleta de familiar', esperado: 'alto', texto: 'Hola, soy de la aduana. Su familiar le envió una maleta desde EE.UU. Para liberarla debe depositar Q850 hoy mismo, es urgente. No le diga a nadie.' },
  { nombre: 'Oferta de trabajo', esperado: 'alto', texto: 'OFERTA DE TRABAJO en Texas, contrato garantizado, sin experiencia. Envíe foto de su DPI y pague $150 de gestión. https://empleo-usa-visa.top/registro' },
  { nombre: 'Código de WhatsApp', esperado: 'alto', texto: 'Hola, te envié por error un código de 6 dígitos a tu WhatsApp, ¿me lo puedes pasar? Es urgente.' },
  { nombre: 'Cita de asilo', esperado: 'alto', texto: 'Su cita en el consulado ya está disponible. Confirme aquí: http://bit.ly/cita-consulado-gob' },
  { nombre: 'Familiar con número nuevo', esperado: 'alto', texto: 'Mamá, este es mi nuevo número. Tuve un accidente y necesito que me mandes Q2000 por Western Union, no le digas a nadie.' },
  { nombre: 'Gestor con atajos', esperado: 'medio', texto: 'Buenas, soy gestor y le ayudo con su trámite de residencia en EE. UU., le salgo más rápido que en el consulado. Escríbame para darle información.' },
  { nombre: 'Mensaje normal', esperado: 'bajo', texto: 'Hola tía, ya llegué bien al trabajo. Más tarde te llamo para saber cómo está todo por allá.' }
];

let aciertos = 0;
CASOS.forEach((c, i) => {
  const a = analizar(c.texto);
  const ok = a.nivel === c.esperado;
  if (ok) aciertos++;
  console.log(`\n=== Caso ${i + 1}: ${c.nombre} | esperado: ${c.esperado} | obtenido: ${a.nivel} (${a.puntaje} pts) ${ok ? '✅' : '❌'}`);
  console.log(armarRespuesta(a));
});
console.log(`\nResultado: ${aciertos}/${CASOS.length} casos con el nivel esperado`);
