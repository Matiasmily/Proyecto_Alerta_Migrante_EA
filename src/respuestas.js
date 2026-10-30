// Arma los mensajes que el bot envía por WhatsApp.
// WhatsApp usa *texto* para negrita y _texto_ para cursiva.

const NOTA_ETICA =
  '_Esto es una orientación basada en señales, no una garantía de que el mensaje sea legítimo o falso. ' +
  'Su mensaje no se guarda._';

function mensajeBienvenida() {
  return [
    '🛡️ *¡Hola! Soy Alerta Migrante.*',
    '',
    'Le ayudo a revisar si un mensaje, enlace o número es sospechoso *antes* de que haga algo.',
    '',
    '👉 Reenvíe o pegue aquí el mensaje que le llegó y le digo qué señales de fraude encuentro.',
    '',
    NOTA_ETICA
  ].join('\n');
}

function mensajeSoloImagen() {
  return [
    '📷 Recibí una imagen, pero por ahora todavía no puedo leer capturas.',
    '',
    'Por favor *copie y pegue el texto* del mensaje, o reenvíelo directamente aquí.'
  ].join('\n');
}

const TITULOS = {
  alto: '🔴 *Riesgo ALTO: muy probable estafa*',
  medio: '🟠 *Riesgo MEDIO: tenga cuidado*',
  bajo: '🟢 *Riesgo BAJO: no vi señales claras*'
};

const ACCIONES = {
  alto: [
    '*No responda, no pague y no abra enlaces.*',
    'Bloquee y reporte el número en WhatsApp.',
    'Si ya dio datos o dinero, avise a su banco y pida orientación al Ministerio Público o a la PDH.'
  ],
  medio: [
    'No haga ningún pago ni comparta datos todavía.',
    'Confirme por otro medio (llame usted mismo al número oficial o al familiar).'
  ],
  bajo: ['Aun así, si le piden dinero o datos, vuelva a consultarme.']
};

function armarRespuesta(analisis) {
  const lineas = [TITULOS[analisis.nivel], ''];

  if (analisis.senales.length) {
    lineas.push('*Señales que encontré:*');
    analisis.senales.forEach((s) => lineas.push(`• ${s}`));
    lineas.push('');
  }

  lineas.push('*Qué hacer:*');
  ACCIONES[analisis.nivel].forEach((a) => lineas.push(`• ${a}`));
  analisis.consejos.slice(0, 3).forEach((c) => lineas.push(`• ${c}`));

  if (analisis.enlaces.length && analisis.nivel === 'bajo') {
    lineas.push('', 'Ojo: un enlace sin señales raras *no significa que sea seguro*. Si no lo esperaba, no lo abra.');
  }

  lineas.push('', NOTA_ETICA);
  return lineas.join('\n');
}

module.exports = { mensajeBienvenida, mensajeSoloImagen, armarRespuesta };
