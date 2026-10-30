# Alerta Migrante – Chatbot de WhatsApp

Chatbot de verificación y alerta temprana contra fraudes digitales dirigidos a personas migrantes guatemaltecas y sus familias.
Proyecto de Responsabilidad Social – Ética Aplicada, URL Quetzaltenango 2026.

## Cómo funciona
1. El usuario reenvía o pega un mensaje sospechoso al número de WhatsApp del bot.
2. Twilio envía el mensaje a este servidor (`POST /whatsapp`).
3. El analizador busca patrones de fraude (urgencia, cobros, códigos, maletas, empleos falsos, etc.) y revisa los enlaces.
4. El bot responde con el nivel de riesgo (bajo / medio / alto), las señales encontradas y qué hacer.

Privacidad: el servidor no guarda el contenido de los mensajes ni los números; solo registra el tipo de respuesta.

## Estructura
- `prototipo/index.html`: prototipo web del chatbot (se abre en cualquier navegador o celular)
- `src/index.js`: servidor que recibe los mensajes de WhatsApp
- `src/analizador.js`: reglas de detección y revisión de enlaces
- `src/respuestas.js`: textos que envía el bot
- `pruebas/casos.js`: casos de prueba (`npm run probar`)

## Instalación local
Requisitos: Node.js 18 o superior.
```
npm install
npm run probar   # corre los casos de prueba (deben salir 7/7)
npm start        # levanta el servidor en http://localhost:3000
```

## Conectar con WhatsApp (sandbox de Twilio)
1. Crear cuenta gratis en https://www.twilio.com
2. En la consola: Messaging → Try it out → Send a WhatsApp message.
3. Desde su celular, enviar el mensaje `join <código>` que indica la consola al número del sandbox.
4. Exponer el servidor local a internet con ngrok: `ngrok http 3000`
5. En "Sandbox settings", campo **When a message comes in**, pegar: `https://<su-url-de-ngrok>/whatsapp` (método POST) y guardar.
6. Escribirle "hola" al bot desde WhatsApp.

Nota: cada persona que quiera usar el bot de prueba debe enviar primero el mensaje `join <código>`.
