/**
============================================================================
MÓDULO BACKEND - MICROSERVICIO DE ENVÍO DE CORREOS (MARCA BLANCA)
============================================================================
* Archivo: BE/ServiciosCorreo.gs
* Descripción: Servicio de envío masivo/unitario con idempotencia, procesamiento
*              batch en memoria, adjuntos, imágenes inline y noReply.
*/
/**
 * Tipo de Opciones avanzadas de envío de correo.
 * @typedef {Object} OpcionesEnvio
 * @property {string} [plantillaClave] - Clave opcional de la plantilla a enviar.
 * @property {string} [nombreRemitente] - Nombre visible del remitente ("Notificaciones Corporativas").
 * @property {string} [replyTo] - Dirección de respuesta opcional.
 * @property {string} [cc] - Correos en copia divididos por coma.
 * @property {string} [bcc] - Correos en copia oculta divididos por coma.
 * @property {string} [from] - Alias autorizado de envío.
 * @property {boolean} [noReply=false] - Indica si el correo debe ser enviado con flag noReply.
 * @property {string[]} [idsAdjuntosDrive] - Array de IDs de archivos en Drive a adjuntar.
 * @property {Object<string, string>} [idsImagenesInlineDrive] - Mapa de 'cidName' => 'idArchivoDrive'.
 * @property {string|boolean} [valorEstadoEnviado="SI"] - Valor a escribir en la columna ENVIADO al completar.
 */
/**
 * Procesa y envía los correos masivamente leyendo desde la BD en Google Sheets.
 * Implementa idempotencia, batching y reutilización de Blobs de Drive.
 *
 * @param {OpcionesEnvio} [opcionesPersonalizadas] - Configuraciones avanzadas del envío.
 * @returns {Object} Resumen con métricas de la operación (procesados, enviados, omitidos, errores).
 */
function ejecutarProcesoEnvioCorreos(opcionesPersonalizadas) {
  const opciones = opcionesPersonalizadas || {};
  const plantillaClave = opciones.plantillaClave || CONFIGURACION_BD.PLANTILLA_ACTIVA;
  const valorEstadoFinal = opciones.valorEstadoEnviado !== undefined ? opciones.valorEstadoEnviado : "SI";
  const resumen = {
    totalFilas: 0,
    enviadosExitosamente: 0,
    omitidosYaEnviados: 0,
    errores: 0,
    detallesErrores: []
  };

  try {
    // 1. Validar Cuota Diaria de Envío en Apps Script
    const cuotaRemanente = MailApp.getRemainingDailyQuota();
    globalThis.ComponenteCorreo.Logs.agregar(`Iniciando ejecucion de correos. Cuota remanente: ${cuotaRemanente}`);
    if (cuotaRemanente <= 0) {
      throw new Error("Límite diario de envíos de Gmail alcanzado para esta cuenta.");
    }

    // 2. Cargar Blobs de Drive UNA SOLA VEZ antes del bucle (Optimización de Tasa y Cuota)
    const adjuntosBlobs = (opciones.idsAdjuntosDrive || []).map(id => {
      return DriveApp.getFileById(id).getBlob();
    });
    const imagenesInlineBlobs = {};
    if (opciones.idsImagenesInlineDrive) {
      Object.keys(opciones.idsImagenesInlineDrive).forEach(cidKey => {
        const fileId = opciones.idsImagenesInlineDrive[cidKey];
        imagenesInlineBlobs[cidKey] = DriveApp.getFileById(fileId).getBlob();
      });
    }

    // 3. Lectura de Base de Datos en Modo BATCH (Evita peticiones repetitivas a la hoja)
    const sheet = SpreadsheetApp.openById(CONFIGURACION_BD.ID_HOJA).getSheetByName(CONFIGURACION_BD.NOMBRE_HOJA);
    if (!sheet) {
      throw new Error(`La pestaña '${CONFIGURACION_BD.NOMBRE_HOJA}' no existe en el documento.`);
    }
    const range = sheet.getDataRange();
    const matValores = range.getValues();
    if (matValores.length < 2) {
      globalThis.ComponenteCorreo.Logs.agregar("La hoja de cálculo no contiene filas de datos.");
      return resumen;
    }

    const encabezados = matValores[0];
    const colCorreoIdx = encabezados.indexOf(CONFIGURACION_BD.COLUMNAS.CORREO);
    const colEnviadoIdx = encabezados.indexOf(CONFIGURACION_BD.COLUMNAS.ENVIADO);

    if (colCorreoIdx === -1) {
      throw new Error(`La columna obligatoria '${CONFIGURACION_BD.COLUMNAS.CORREO}' no existe en los encabezados.`);
    }
    if (colEnviadoIdx === -1) {
      throw new Error(`La columna obligatoria '${CONFIGURACION_BD.COLUMNAS.ENVIADO}' no existe en los encabezados.`);
    }

    resumen.totalFilas = matValores.length - 1;
    let cambiosRealizados = false;

    // 4. Bucle principal de procesamiento idempotente
    for (let i = 1; i < matValores.length; i++) {
      const fila = matValores[i];
      const correoDestinatario = fila[colCorreoIdx];
      const estadoEnviadoActual = fila[colEnviadoIdx];

      // Verificación de Idempotencia: Omitir si ya fue enviado
      const esEnviado = estadoEnviadoActual === true ||
                        String(estadoEnviadoActual).trim().toUpperCase() === 'TRUE' ||
                        String(estadoEnviadoActual).trim().toUpperCase() === 'SI';

      if (esEnviado) {
        resumen.omitidosYaEnviados++;
        continue;
      }

      if (!correoDestinatario || String(correoDestinatario).trim() === '' || !String(correoDestinatario).includes('@')) {
        resumen.errores++;
        resumen.detallesErrores.push({ fila: i + 1, error: "Dirección de correo inválida o vacía." });
        continue;
      }

      try {
        // Mapear fila actual a objeto de registro BD
        const registroBD = {};
        encabezados.forEach((nombreCol, idx) => {
          registroBD[nombreCol] = fila[idx];
        });

        // Generar contenido HTML y extraer Asunto
        const htmlCuerpo = obtenerPlantillaActiva(registroBD, plantillaClave);
        const mapeador = globalThis.ComponenteCorreo.Mapeadores[plantillaClave];
        const vars = mapeador.plantilla.variables(registroBD, plantillaClave);
        const dest = mapeador.plantilla.destacados(vars, registroBD, plantillaClave);
        const asunto = dest.TITULO_PESTANA || "Notificación de Seguro";

        // Preparar opciones de GmailApp.sendEmail
        const gmailOptions = {
          htmlBody: htmlCuerpo,
          name: opciones.nombreRemitente || "Notificaciones Corporativas",
          attachments: adjuntosBlobs,
          inlineImages: imagenesInlineBlobs
        };

        if (opciones.bcc) gmailOptions.bcc = opciones.bcc;
        if (opciones.cc) gmailOptions.cc = opciones.cc;
        if (opciones.replyTo) gmailOptions.replyTo = opciones.replyTo;
        if (opciones.from) gmailOptions.from = opciones.from;
        if (opciones.noReply === true) gmailOptions.noReply = true;

        const cuerpoTextoPlano = "Su cliente de correo no soporta visualización HTML. Por favor use un cliente compatible.";

        // Despachar correo vía API de Gmail
        GmailApp.sendEmail(String(correoDestinatario).trim(), asunto, cuerpoTextoPlano, gmailOptions);

        // Actualizar el estado en memoria para idempotencia
        matValores[i][colEnviadoIdx] = valorEstadoFinal;
        cambiosRealizados = true;
        resumen.enviadosExitosamente++;
        globalThis.ComponenteCorreo.Logs.agregar(`Correo enviado exitosamente a: ${correoDestinatario} (Fila ${i + 1})`);
      } catch (errFila) {
        resumen.errores++;
        resumen.detallesErrores.push({ fila: i + 1, error: errFila.toString() });
        globalThis.ComponenteCorreo.Logs.agregar(`Error al enviar fila ${i + 1} (${correoDestinatario}): ${errFila.toString()}`);
      }
    }

    // 5. Escritura BATCH de actualización a Google Sheets (Solo 1 llamada I/O)
    if (cambiosRealizados) {
      range.setValues(matValores);
      SpreadsheetApp.flush();
      globalThis.ComponenteCorreo.Logs.agregar("Google Sheets actualizado con los nuevos estados de envío.");
    }
  } catch (errorGeneral) {
    globalThis.ComponenteCorreo.Logs.agregar(`CRÍTICO en ejecutarProcesoEnvioCorreos: ${errorGeneral.toString()}`);
    throw errorGeneral;
  }

  return resumen;
}

/**
 * Función wrapper conveniente de prueba rápida para ejecutar el envío desde la interfaz de desarrollador.
 */
function probarEnvioMasivoConPlantillaActiva() {
  const resultado = ejecutarProcesoEnvioCorreos({
    nombreRemitente: "Centro de Notificaciones",
    valorEstadoEnviado: "SI" // Puede ser "SI", true, "ENVIADO", etc.
  });
  Logger.log("================ RESUMEN DE PROCESAMIENTO ================");
  Logger.log(JSON.stringify(resultado, null, 2));
}