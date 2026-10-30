// Motor de análisis de Alerta Migrante.
// Revisa un mensaje con reglas de patrones de fraude y analiza los enlaces que contenga.
// Devuelve un puntaje de 0 a 100 y un nivel de riesgo (bajo, medio, alto).

// Quita tildes y pasa a minúsculas para que las reglas no fallen por acentos.
const normalizar = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Cada regla: nombre de la señal, puntos que suma, patrón a buscar y consejo para el usuario.
const REGLAS = [
  {
    nombre: 'Presiona con urgencia o amenazas de pérdida',
    puntos: 15,
    patron: /urgente|inmediat|ahora mismo|hoy mismo|ultimas horas|ultimo dia|24 horas|se vence|expira|de inmediato|bloquead|suspendid|cancelad|deportacion|multa/,
    consejo: 'Los estafadores usan la prisa para que no piense. Pare, respire y verifique antes de hacer nada.'
  },
  {
    nombre: 'Pide dinero, depósitos o pagos por adelantado',
    puntos: 25,
    patron: /deposit|transferen|western union|giro|adelanto|pago previo|pagar|cobro|tarifa|costo de (gestion|tramite)|\bq ?\d{2,}|\$ ?\d{2,}|\d+ ?(quetzales|dolares)/,
    consejo: 'Ningún trámite, empleo o premio legítimo se cobra por adelantado por WhatsApp. No envíe dinero.'
  },
  {
    nombre: 'Pide códigos, claves o contraseñas',
    puntos: 35,
    patron: /codigo de (verificacion|seguridad|6)|6 digitos|\bpin\b|contrasena|clave|\botp\b|codigo que (te |le )?(lleg|enviaron|mandaron)/,
    consejo: 'Nunca comparta el código de 6 dígitos de WhatsApp ni sus claves. Con eso le roban la cuenta.'
  },
  {
    nombre: 'Pide datos personales o fotos de documentos',
    puntos: 15,
    patron: /\bdpi\b|numero de (cuenta|tarjeta)|tarjeta|pasaporte|datos personales|foto de (su |tu )?(dpi|pasaporte)/,
    consejo: 'No mande fotos de documentos ni datos bancarios a quien no conoce o no ha verificado.'
  },
  {
    nombre: 'Habla de maletas, paquetes, premios o herencias',
    puntos: 30,
    patron: /maleta|paquete|aduana|encomienda|premio|ganaste|ganador|sorteo|herencia|regalo/,
    consejo: 'La estafa de la "maleta" o el "premio" pide pagos para liberar algo que no existe.'
  },
  {
    nombre: 'Ofrece empleo en el extranjero de forma sospechosa',
    puntos: 25,
    patron: /oferta (de )?(trabajo|empleo)|visa de trabajo|vacante|contrato (en|garantizado)|trabajo (en|garantizado)|sin experiencia|empleo (seguro|garantizado)|reclutamiento/,
    consejo: 'Desconfíe de ofertas "garantizadas". Busque la empresa por su cuenta y nunca pague por un contrato.'
  },
  {
    nombre: 'Menciona trámites migratorios o citas',
    puntos: 10,
    patron: /cita (en|con|para)|consulado|embajada|asilo|permiso de trabajo|gestor|tramite|residencia|parole|\bvisa\b/,
    consejo: 'Confirme los trámites solo en los sitios y teléfonos oficiales, que usted mismo busque.'
  },
  {
    nombre: 'Pide guardar el secreto',
    puntos: 15,
    patron: /no (le |les )?(digas|cuentes|compartas|avises) a nadie|confidencial|secreto/,
    consejo: 'Pedir secreto es señal clásica de engaño. Consulte con alguien de confianza.'
  },
  {
    nombre: 'Ofrece atajos o trámites más rápidos que lo oficial',
    puntos: 15,
    patron: /mas rapido|le salgo|te salgo|sin hacer (cola|fila)|sin cita|aprobacion (segura|garantizada)|tramite (rapido|express)|le ayudo con su tramite|conectes? en (inmigracion|migracion|el consulado)/,
    consejo: 'Los trámites migratorios se hacen solo por los canales oficiales. Desconfíe de gestores que prometen atajos.'
  },
  {
    nombre: 'Parece un familiar con número nuevo o en emergencia',
    puntos: 25,
    patron: /(nuevo|otro) numero|cambie de numero|tuve un accidente|estoy detenid|me detuvieron|me arrestaron|necesito (que me )?(ayudes|ayude|envies|mandes)/,
    consejo: 'Llame al familiar a su número de siempre antes de enviar dinero.'
  }
];

// Extrae los enlaces que aparezcan en el texto (ignora correos electrónicos).
function enlacesEn(texto) {
  const encontrados = texto.match(
    /(https?:\/\/[^\s]+|www\.[^\s]+|\b[a-z0-9-]+(\.[a-z0-9-]+)*\.(com|net|org|xyz|top|click|info|site|online|icu|live|link|co|gt|buzz)\b[^\s]*)/gi
  ) || [];
  return encontrados.filter((u) => !u.includes('@'));
}

// Obtiene solo el dominio de un enlace (ej. "bit.ly").
function dominioDe(url) {
  return url.replace(/^https?:\/\//i, '').split(/[\/?#]/)[0].toLowerCase();
}

// Revisa un enlace con señales técnicas típicas de sitios fraudulentos.
function revisarEnlace(url) {
  const senales = [];
  const dominio = dominioDe(url);
  let puntos = 0;

  if (/^http:\/\//i.test(url)) {
    puntos += 10;
    senales.push(`El enlace ${dominio} no usa conexión segura (http)`);
  }
  if (/(^|\.)(bit\.ly|tinyurl\.com|cutt\.ly|t\.co|is\.gd|rb\.gy|shorturl\.at)$/.test(dominio)) {
    puntos += 20;
    senales.push(`Enlace acortado (${dominio}): no se ve a dónde lo lleva`);
  }
  if (/\.(xyz|top|click|info|buzz|online|site|icu|live|link)$/.test(dominio)) {
    puntos += 20;
    senales.push(`El dominio ${dominio} termina en una extensión muy usada en fraudes`);
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(dominio)) {
    puntos += 25;
    senales.push('El enlace es una dirección numérica, no un sitio normal');
  }
  if ((dominio.match(/-/g) || []).length >= 2) {
    puntos += 10;
    senales.push(`El dominio ${dominio} tiene muchos guiones, típico de sitios falsos`);
  }
  // Se revisa el enlace completo (no solo el dominio) porque los acortadores esconden
  // palabras como "consulado" o "gob" en la ruta para parecer oficiales.
  if (/gob|migra|consulado|uscis|conamigua|banrural|banco|bantrab|remesa|visa/.test(url.toLowerCase()) &&
      !/(\.gob\.gt|\.gov|\.org\.gt)$/.test(dominio)) {
    puntos += 25;
    senales.push(`El enlace ${dominio} aparenta ser oficial o bancario, pero no es un dominio .gob.gt ni .gov`);
  }
  return { puntos, senales };
}

// Analiza el mensaje completo y calcula el nivel de riesgo.
function analizar(texto) {
  const t = normalizar(texto);
  const senales = [];
  const consejos = [];
  let puntaje = 0;

  REGLAS.forEach((regla) => {
    if (regla.patron.test(t)) {
      puntaje += regla.puntos;
      senales.push(regla.nombre);
      consejos.push(regla.consejo);
    }
  });

  const enlaces = enlacesEn(texto);
  enlaces.forEach((url) => {
    const r = revisarEnlace(url);
    puntaje += r.puntos;
    senales.push(...r.senales);
  });

  puntaje = Math.min(100, puntaje);
  const nivel = puntaje >= 50 ? 'alto' : puntaje >= 20 ? 'medio' : 'bajo';

  return { puntaje, nivel, senales, consejos: [...new Set(consejos)], enlaces };
}

module.exports = { analizar, normalizar, enlacesEn };
