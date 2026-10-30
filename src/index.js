// Servidor de Alerta Migrante.
// Twilio reenvía cada mensaje de WhatsApp a POST /whatsapp y este servidor responde.

const express = require('express');
const { twiml } = require('twilio');
const { analizar, normalizar } = require('./analizador');
const { mensajeBienvenida, mensajeSoloImagen, armarRespuesta } = require('./respuestas');

const app = express();
app.use(express.urlencoded({ extended: false })); // Twilio envía los datos como formulario

const PUERTO = process.env.PORT || 3000;
const SALUDOS = /^(hola|buenas|buenos dias|buenas tardes|buenas noches|menu|ayuda|inicio|empezar)\W*$/;

// Decide qué contestar según lo que llegó.
function responderA(texto, numImagenes) {
  if (!texto && numImagenes > 0) return { tipo: 'imagen', mensaje: mensajeSoloImagen() };
  if (!texto || SALUDOS.test(normalizar(texto))) return { tipo: 'saludo', mensaje: mensajeBienvenida() };
  const analisis = analizar(texto);
  return { tipo: `riesgo-${analisis.nivel}`, mensaje: armarRespuesta(analisis) };
}

app.get('/', (req, res) => res.send('Alerta Migrante: bot activo ✅'));

app.post('/whatsapp', (req, res) => {
  const texto = (req.body.Body || '').trim();
  const numImagenes = parseInt(req.body.NumMedia || '0', 10);

  const { tipo, mensaje } = responderA(texto, numImagenes);

  // Privacidad: solo se registra el tipo de respuesta, nunca el contenido ni el número.
  console.log(`[${new Date().toISOString()}] consulta atendida: ${tipo}`);

  const respuesta = new twiml.MessagingResponse();
  respuesta.message(mensaje);
  res.type('text/xml').send(respuesta.toString());
});

app.listen(PUERTO, () => console.log(`Alerta Migrante escuchando en http://localhost:${PUERTO}`));
