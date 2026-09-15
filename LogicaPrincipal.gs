/**
============================================================================
MÓDULO BACKEND - MOTOR CENTRAL, GLOBALES Y CORREOS (GAS)
============================================================================
* Archivo: BE/LogicaPrincipal.gs
* Descripción: Motor agnóstico de procesamiento, mapeadores, renderizado de plantillas HTML,
*              operaciones de acceso a datos y microservicio idempotente de envío de correos.
*/

/**
 * Helper interno para empaquetar la lista de párrafos en la estructura limpia de filas de tabla.
 */
function construirBloqueParrafos(listaParrafos) {
  return listaParrafos
    .filter(parrafo => parrafo && String(parrafo).trim() !== "")
    .map(parrafo => `
      <tr>
        <td align="center" style="font-size: 13.5px; color: #555555; line-height: 22px; padding-bottom: 20px; font-family: Arial, sans-serif;">
          ${parrafo}
        </td>
      </tr>
    `).join('');
}

/**
 * Helper dinámico para construir el bloque de variables (0, 1, 2, 3, 4, N variables).
 * Si no hay variables configuradas o están vacías, retorna una cadena vacía.
 */
function construirBloqueVariablesDinamicas(configVariables, registroBD) {
  if (!configVariables || !Array.isArray(configVariables) || configVariables.length === 0) {
    return '';
  }

  const filasHtml = configVariables.map(item => {
    const valorRaw = registroBD[item.claveColumna];
    if (valorRaw === undefined || valorRaw === null || String(valorRaw).trim() === '') {
      return '';
    }

    let valorFormateado = valorRaw;
    if (item.esMoneda || typeof valorRaw === 'number') {
      if (globalThis.AnulacionPagaresFinanseguros?.Utilidades?.FORMATEAR_MILES) {
        valorFormateado = `$ ${globalThis.AnulacionPagaresFinanseguros.Utilidades.FORMATEAR_MILES(valorRaw)}`;
      } else {
        valorFormateado = typeof valorRaw === 'number' ? `$ ${valorRaw.toLocaleString('es-CO')}` : valorRaw;
      }
    }

    const iconoUrl = item.icono || CONFIGURACION_BD.ASSETS.ICON_CREDITO;

    return `
      <tr>
        <td width="45" align="center" valign="middle" style="padding: 6px 0;">
          <img src="${iconoUrl}" alt="Icono" width="38" height="38" style="display: block; pointer-events: none; -webkit-user-select: none; user-select: none;" oncontextmenu="return false;" ondragstart="return false;" border="0" />
        </td>
        <td align="left" valign="middle" style="padding-left: 12px;">
          <span style="font-size: 13px; font-weight: bold; color: ${CONFIGURACION_BD.ESTILOS_UI.COLOR_PRIMARIO}; display: block; line-height: 16px; font-family: Arial, sans-serif;">${item.etiqueta}</span>
          <span style="font-size: 14px; color: ${CONFIGURACION_BD.ESTILOS_UI.TEXTO_PRINCIPAL}; font-weight: bold; line-height: 18px; font-family: Arial, sans-serif;">${valorFormateado}</span>
        </td>
      </tr>
    `;
  }).filter(fila => fila !== '').join('');

  if (!filasHtml) return '';

  return `
    <tr>
      <td style="padding: 10px 0 25px 0; border: 0;">
        <table border="0" cellpadding="0" cellspacing="0" align="center" style="width: 100%; max-width: 320px; margin: 0 20px 0 auto;">
          ${filasHtml}
        </table>
      </td>
    </tr>
  `;
}

/**
 * Registra formalmente los mapeadores unificados dentro de la arquitectura global.
 */
function registrarConfiguracionMapeadores() {
  if (!globalThis.ComponenteCorreo) return;
  if (!globalThis.ComponenteCorreo.Mapeadores) {
    globalThis.ComponenteCorreo.Mapeadores = {};
  }

  // MAPEADOR 1: PLANTILLA DESTACADOS
  const mapeadorPlantillaDestacados = {
    rutaHtml: "FE/PlantillaDestacados",
    plantilla: {
      variables: function (registroBD, clavePlantilla) {
        const config = CONFIGURACION_PLANTILLAS[clavePlantilla] || CONFIGURACION_PLANTILLAS.plantillaDestacados;
        return config.variables(registroBD);
      },
      destacados: function (vars, registroBD, clavePlantilla) {
        const config = CONFIGURACION_PLANTILLAS[clavePlantilla] || CONFIGURACION_PLANTILLAS.plantillaDestacados;
        const destacadosUser = config.destacados(vars, registroBD);
        const listaParrafos = [destacadosUser.PARRAFO_1, destacadosUser.PARRAFO_2, destacadosUser.PARRAFO_3];
        
        return {
          TITULO_PESTANA: destacadosUser.TITULO_PESTANA,
          URL_LOGO_PRIMARIO: vars.logoBolivar,
          ALT_LOGO_PRIMARIO: "Coloca tu imagen aquí",
          URL_LOGO_SECUNDARIO: vars.logoDavivienda,
          ALT_LOGO_SECUNDARIO: "Coloca tu imagen aquí",
          URL_BANNER_HEADER: vars.bannerHeader,
          ALT_BANNER_HEADER: destacadosUser.ALT_BANNER_HEADER,
          HERO_TITULO: destacadosUser.HERO_TITULO,
          HERO_SUBTITULO: destacadosUser.HERO_SUBTITULO,
          SALUDO_NOMBRE: `${destacadosUser.SALUDO_PREFIX || 'Hola'} ${vars.nombre}`,
          BLOQUE_PARRAFOS: construirBloqueParrafos(listaParrafos),
          BLOQUE_VARIABLES_DINAMICAS: construirBloqueVariablesDinamicas(destacadosUser.VARIABLES_DINAMICAS, registroBD),
          TEXTO_PRE_BOTON: destacadosUser.TEXTO_PRE_BOTON,
          TEXTO_BOTON_PAGO: destacadosUser.TEXTO_BOTON_PAGO,
          URL_BOTON_PAGO: vars.urlPago,
          FOOTER_SLOGAN_PARTE1: destacadosUser.FOOTER_SLOGAN_PARTE1 || "Tranquilo,",
          FOOTER_SLOGAN_PARTE2: destacadosUser.FOOTER_SLOGAN_PARTE2 || "nosotros respondemos"
        };
      }
    }
  };

  // MAPEADOR 2: PLANTILLA NOTIFICACIÓN
  const mapeadorPlantillaNotificacion = {
    rutaHtml: "FE/PlantillaNotificacion",
    plantilla: {
      variables: function (registroBD) {
        return CONFIGURACION_PLANTILLAS.plantillaNotificacion.variables(registroBD);
      },
      destacados: function (vars, registroBD) {
        const destacadosUser = CONFIGURACION_PLANTILLAS.plantillaNotificacion.destacados(vars, registroBD);
        const listaParrafos = [destacadosUser.PARRAFO_1, destacadosUser.PARRAFO_2, destacadosUser.PARRAFO_3];

        return {
          TITULO_PESTANA: destacadosUser.TITULO_PESTANA,
          URL_LOGO_PRIMARIO: vars.logoBolivar,
          ALT_LOGO_PRIMARIO: "Coloca tu imagen aquí",
          URL_LOGO_SECUNDARIO: vars.logoDavivienda,
          ALT_LOGO_SECUNDARIO: "Coloca tu imagen aquí",
          URL_BANNER_HEADER: vars.bannerHeader,
          ALT_BANNER_HEADER: destacadosUser.ALT_BANNER_HEADER,
          HERO_TITULO: destacadosUser.HERO_TITULO,
          HERO_SUBTITULO: destacadosUser.HERO_SUBTITULO,
          SALUDO_NOMBRE: `${destacadosUser.SALUDO_PREFIX || 'Hola'} ${vars.nombre}`,
          BLOQUE_PARRAFOS: construirBloqueParrafos(listaParrafos),
          BLOQUE_VARIABLES_DINAMICAS: construirBloqueVariablesDinamicas(destacadosUser.VARIABLES_DINAMICAS, registroBD),
          TEXTO_PRE_BOTON: destacadosUser.TEXTO_PRE_BOTON,
          TEXTO_BOTON_PAGO: destacadosUser.TEXTO_BOTON_PAGO,
          URL_BOTON_PAGO: vars.urlPago,
          FOOTER_SLOGAN_PARTE1: destacadosUser.FOOTER_SLOGAN_PARTE1 || "Tranquilo,",
          FOOTER_SLOGAN_PARTE2: destacadosUser.FOOTER_SLOGAN_PARTE2 || "nosotros respondemos"
        };
      }
    }
  };

  // ASIGNACIÓN DE MAPEADORES AL CONTENEDOR GLOBAL
  globalThis.ComponenteCorreo.Mapeadores.plantillaDestacados = mapeadorPlantillaDestacados;
  globalThis.ComponenteCorreo.Mapeadores.plantillaNotificacion = mapeadorPlantillaNotificacion;
}

/**
 * Inicialización del Espacio de Nombres Global para el Componente de Correos.
 */
(function inicializarGlobal() {
  if (globalThis.ComponenteCorreo) return;
  globalThis.ComponenteCorreo = {
    Configuracion: {
      EstilosBase: CONFIGURACION_BD.ESTILOS_UI
    },
    Logs: {
      lista: [],
      agregar: function (mensaje) {
        const marcaTemporal = Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd'T'HH:mm:ss");
        let usuarioActual = "Sistema";
        try {
          usuarioActual = Session.getActiveUser().getEmail() || "Sistema";
        } catch (e) {
          usuarioActual = "Anonimo";
        }
        console.log(`[LOG - ${marcaTemporal}] [${usuarioActual}]: ${mensaje}`);
        this.lista.push({ tiempo: marcaTemporal, usuario: usuarioActual, mensaje: mensaje });
      },
      obtenerTodo: function () {
        return this.lista;
      }
    },
    Mapeadores: {},
    Servicio: {
      inyectarDatos: function (html, objetoDatos) {
        if (!html) return '';
        return html.replace(/%%([a-zA-Z0-9_]+)%%/g, (coincidencia, variable) => {
          return objetoDatos[variable] !== undefined ? objetoDatos[variable] : '';
        });
      },
      obtenerPlantillaHtmlRaw: function (rutaArchivo) {
        return HtmlService.createHtmlOutputFromFile(rutaArchivo).getContent();
      }
    },
    Controlador: {
      renderizar: function (rutaPlantilla, registroBD, mapeadorClave) {
        if (typeof registrarConfiguracionMapeadores === 'function') {
          registrarConfiguracionMapeadores();
        }
        let datosFinales = {};
        if (mapeadorClave && globalThis.ComponenteCorreo.Mapeadores[mapeadorClave]) {
          const configMapeador = globalThis.ComponenteCorreo.Mapeadores[mapeadorClave];
          const vars = configMapeador.plantilla.variables(registroBD || {}, mapeadorClave);
          const dest = configMapeador.plantilla.destacados(vars, registroBD || {}, mapeadorClave);
          datosFinales = { ...vars, ...dest };
        } else {
          datosFinales = { ...registroBD };
        }
        const datosCombinados = {
          ...globalThis.ComponenteCorreo.Configuracion.EstilosBase,
          ...datosFinales
        };
        const htmlRaw = globalThis.ComponenteCorreo.Servicio.obtenerPlantillaHtmlRaw(rutaPlantilla);
        return globalThis.ComponenteCorreo.Servicio.inyectarDatos(htmlRaw, datosCombinados);
      }
    }
  };
})();

(function registrarConfiguracion() {
  registrarConfiguracionMapeadores();
})();

/**
============================================================================
FUNCIONES DE SELECCIÓN, RENDERIZADO Y LECTURA DE DATOS
============================================================================
*/
function obtenerRegistrosDesdeBD() {
  if (!CONFIGURACION_BD.ID_HOJA || CONFIGURACION_BD.ID_HOJA === "INGRESE_AQUI_EL_ID_DE_SU_HOJA_DE_CALCULO") {
    throw new Error("Debe ingresar un ID_HOJA válido en el objeto CONFIGURACION_BD.");
  }
  const hoja = SpreadsheetApp.openById(CONFIGURACION_BD.ID_HOJA).getSheetByName(CONFIGURACION_BD.NOMBRE_HOJA);
  if (!hoja) {
    throw new Error(`No se encontró la pestaña '${CONFIGURACION_BD.NOMBRE_HOJA}' en la hoja de cálculo especificada.`);
  }
  const datos = hoja.getDataRange().getValues();
  if (datos.length < 2) {
    return [];
  }
  const encabezados = datos[0];
  const filas = datos.slice(1);
  return filas.map((fila) => {
    const registro = {};
    encabezados.forEach((nombreEncabezado, indice) => {
      registro[nombreEncabezado] = fila[indice];
    });
    return registro;
  });
}

function resolverRegistroBD(registroBD) {
  if (registroBD && Object.keys(registroBD).length > 0) {
    return registroBD;
  }
  const registros = obtenerRegistrosDesdeBD();
  if (!registros || registros.length === 0) {
    throw new Error("La base de datos de Google Sheets no contiene registros para procesar.");
  }
  return registros[0];
}

function obtenerPlantillaActiva(registroBD, plantillaClave) {
  if (typeof registrarConfiguracionMapeadores === 'function') {
    registrarConfiguracionMapeadores();
  }
  const claveFinal = plantillaClave || (typeof CONFIGURACION_BD !== 'undefined' ? CONFIGURACION_BD.PLANTILLA_ACTIVA : 'plantillaDestacados');
  const mapeador = globalThis.ComponenteCorreo.Mapeadores[claveFinal];
  if (!mapeador) {
    throw new Error(`La plantilla solicitada '${claveFinal}' no está registrada en los mapeadores.`);
  }
  const registroAProcesar = resolverRegistroBD(registroBD);
  return globalThis.ComponenteCorreo.Controlador.renderizar(
    mapeador.rutaHtml,
    registroAProcesar,
    claveFinal
  );
}

function renderizarPlantillaHTML(plantillaClave, registroBD) {
  try {
    const claveFinal = plantillaClave || (typeof CONFIGURACION_BD !== 'undefined' ? CONFIGURACION_BD.PLANTILLA_ACTIVA : 'plantillaDestacados');
    const registroAProcesar = resolverRegistroBD(registroBD);
    if (typeof obtenerPlantillaActiva === 'function') {
      return obtenerPlantillaActiva(registroAProcesar, claveFinal);
    }
    const mapeador = globalThis.ComponenteCorreo.Mapeadores[claveFinal];
    const rutaHtml = mapeador ? mapeador.rutaHtml : 'FE/PlantillaDestacados';
    const htmlContent = globalThis.ComponenteCorreo.Controlador.renderizar(
      rutaHtml,
      registroAProcesar,
      claveFinal
    );
    Logger.log(`Plantilla HTML '${claveFinal}' renderizada con éxito.`);
    return htmlContent;
  } catch (e) {
    Logger.log('CRÍTICO: Error al renderizar la plantilla HTML: ' + e.toString());
    return '<div style="font-family:sans-serif; color:red; padding:20px;">' +
      '<h3>Error al generar la plantilla de correo</h3>' +
      '<p>' + e.toString() + '</p></div>';
  }
}

function probarRenderizado() {
  const registroPrueba = resolverRegistroBD();
  const htmlProcesado = renderizarPlantillaHTML(null, registroPrueba);
  Logger.log('Longitud del HTML generado: ' + htmlProcesado.length + ' caracteres.');
}

/**
============================================================================
MÓDULO DE SERVICIOS - ENVÍO MASIVO / UNITARIO DE CORREOS
============================================================================
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
    const cuotaRemanente = MailApp.getRemainingDailyQuota();
    globalThis.ComponenteCorreo.Logs.agregar(`Iniciando ejecucion de correos. Cuota remanente: ${cuotaRemanente}`);
    if (cuotaRemanente <= 0) {
      throw new Error("Límite diario de envíos de Gmail alcanzado para esta cuenta.");
    }

    const adjuntosBlobs = (opciones.idsAdjuntosDrive || []).map(id => DriveApp.getFileById(id).getBlob());
    const imagenesInlineBlobs = {};
    if (opciones.idsImagenesInlineDrive) {
      Object.keys(opciones.idsImagenesInlineDrive).forEach(cidKey => {
        const fileId = opciones.idsImagenesInlineDrive[cidKey];
        imagenesInlineBlobs[cidKey] = DriveApp.getFileById(fileId).getBlob();
      });
    }

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

    for (let i = 1; i < matValores.length; i++) {
      const fila = matValores[i];
      const correoDestinatario = fila[colCorreoIdx];
      const estadoEnviadoActual = fila[colEnviadoIdx];

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
        const registroBD = {};
        encabezados.forEach((nombreCol, idx) => {
          registroBD[nombreCol] = fila[idx];
        });

        const htmlCuerpo = obtenerPlantillaActiva(registroBD, plantillaClave);
        const mapeador = globalThis.ComponenteCorreo.Mapeadores[plantillaClave];
        const vars = mapeador.plantilla.variables(registroBD, plantillaClave);
        const dest = mapeador.plantilla.destacados(vars, registroBD, plantillaClave);
        const asunto = dest.TITULO_PESTANA || "Notificación importante";

        const configEnvio = CONFIGURACION_BD.CONFIGURACION_CORREO || {};
        const gmailOptions = {
          htmlBody: htmlCuerpo,
          name: opciones.asuntoCorreo || configEnvio.ASUNTO_CORREO || "Notificaciones",
          attachments: adjuntosBlobs,
          inlineImages: imagenesInlineBlobs
        };

        if (opciones.bcc) gmailOptions.bcc = opciones.bcc;
        if (opciones.cc) gmailOptions.cc = opciones.cc;
        if (opciones.replyTo || configEnvio.REPLY_TO) gmailOptions.replyTo = opciones.replyTo || configEnvio.REPLY_TO;
        if (opciones.from) gmailOptions.from = opciones.from;
        if (opciones.noReply === true || configEnvio.NO_REPLY === true) gmailOptions.noReply = true;

        const cuerpoTextoPlano = "Su cliente de correo no soporta visualización HTML. Por favor use un cliente compatible.";

        GmailApp.sendEmail(String(correoDestinatario).trim(), asunto, cuerpoTextoPlano, gmailOptions);

        matValores[i][colEnviadoIdx] = valorEstadoFinal;
        cambiosRealizados = true;
        resumen.enviadosExitosamente++;
        globalThis.ComponenteCorreo.Logs.agregar(`Correo enviado a: ${correoDestinatario} (Fila ${i + 1})`);
      } catch (errFila) {
        resumen.errores++;
        resumen.detallesErrores.push({ fila: i + 1, error: errFila.toString() });
        globalThis.ComponenteCorreo.Logs.agregar(`Error en fila ${i + 1} (${correoDestinatario}): ${errFila.toString()}`);
      }
    }

    if (cambiosRealizados) {
      range.setValues(matValores);
      SpreadsheetApp.flush();
      globalThis.ComponenteCorreo.Logs.agregar("Google Sheets actualizado exitosamente.");
    }
  } catch (errorGeneral) {
    globalThis.ComponenteCorreo.Logs.agregar(`CRÍTICO en ejecutarProcesoEnvioCorreos: ${errorGeneral.toString()}`);
    throw errorGeneral;
  }
  return resumen;
}

function probarEnvioMasivoConPlantillaActiva() {
  const resultado = ejecutarProcesoEnvioCorreos({
    valorEstadoEnviado: "SI"
  });
  Logger.log("================ RESUMEN DE PROCESAMIENTO ================");
  Logger.log(JSON.stringify(resultado, null, 2));
}