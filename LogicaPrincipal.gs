/**
============================================================================
MÓDULO BACKEND - MOTOR CENTRAL Y GLOBALES (GAS) (MARCA BLANCA)
============================================================================
* Archivo: BE/LogicaPrincipal.gs
* Descripción: Motor agnóstico de procesamiento, mapeadores, renderizado de plantillas HTML
*              y operaciones de acceso a datos.
* NOTA: Este archivo contiene la infraestructura del microservicio y NO requiere
* modificaciones operativas directas por parte del usuario final.
*/
/**
 * CENTRALIZACIÓN DE ACTIVOS GLOBALES Y RECURSOS MULTIMEDIA
 */
const CONFIG = {
  ASSETS: {
    // Logos institucionales compartidos para todas las plantillas
    LOGO_EMPRESA_PRIMARIO: 'https://via.placeholder.com/130x50?text=Logo+Empresa',
    LOGO_EMPRESA_SECUNDARIO: 'https://via.placeholder.com/130x50?text=Logo+Aliado',
    // Banners de cabecera específicos para cada plantilla
    BANNER_HEADER: 'https://via.placeholder.com/600x350?text=Banner+Header+1',   // Plantilla 1: financiacionVencimiento
    BANNER_HEADER_2: 'https://via.placeholder.com/600x350?text=Banner+Header+2', // Plantilla 2: financiacionPendientepago
    BANNER_HEADER_3: 'https://via.placeholder.com/600x380?text=Banner+Header+3', // Plantilla 3: financiacionCancelada
    BANNER_HEADER_4: 'https://via.placeholder.com/600x350?text=Banner+Header+4', // Plantilla 4: evitePerdidaProteccion
    // Íconos compartidos para detalles financieros
    ICON_CREDITO: 'https://via.placeholder.com/38x38?text=Credito',
    ICON_SALDO: 'https://via.placeholder.com/38x38?text=Saldo',
    ICON_VIGILADO: 'https://via.placeholder.com/140x40?text=Regulado'
  }
};

/**
 * Helper interno para construir el bloque de detalles de financiación en HTML.
 */
function construirBloqueDetalles(iconCredito, numeroCredito, iconSaldo, saldoFecha) {
  return `
    <table border="0" cellpadding="0" cellspacing="0" align="center" style="width: 100%; max-width: 320px; margin: 0 20px 0 auto;">
      <tr>
        <td width="45" align="center" valign="middle" style="padding: 6px 0;">
          <img src="${iconCredito}" alt="Icono Credito" width="38" height="38" style="display: block; pointer-events: none; -webkit-user-select: none; user-select: none;" oncontextmenu="return false;" ondragstart="return false;" border="0" />
        </td>
        <td align="left" valign="middle" style="padding-left: 12px;">
          <span style="font-size: 13px; font-weight: bold; color: #00A859; display: block; line-height: 16px; font-family: Arial, sans-serif;">Número de crédito:</span>
          <span style="font-size: 14px; color: #222222; font-weight: bold; line-height: 18px; font-family: Arial, sans-serif;">${numeroCredito}</span>
        </td>
      </tr>
      <tr>
        <td width="45" align="center" valign="middle" style="padding: 6px 0;">
          <img src="${iconSaldo}" alt="Icono Saldo" width="38" height="38" style="display: block; pointer-events: none; -webkit-user-select: none; user-select: none;" oncontextmenu="return false;" ondragstart="return false;" border="0" />
        </td>
        <td align="left" valign="middle" style="padding-left: 12px;">
          <span style="font-size: 13px; font-weight: bold; color: #00A859; display: block; line-height: 16px; font-family: Arial, sans-serif;">Saldo a la fecha:</span>
          <span style="font-size: 14px; color: #222222; font-weight: bold; line-height: 18px; font-family: Arial, sans-serif;">${saldoFecha}</span>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Helper interno para empaquetar la lista de párrafos en la estructura limpia de filas de tabla.
 */
function construirBloqueParrafos(listaParrafos) {
  return listaParrafos
    .filter(parrafo => parrafo && parrafo.trim() !== "")
    .map(parrafo => `
      <tr>
        <td align="center" style="font-size: 13.5px; color: #555555; line-height: 22px; padding-bottom: 20px; font-family: Arial, sans-serif;">
          ${parrafo}
        </td>
      </tr>
    `).join('');
}

/**
 * Registra formalmente los mapeadores unificados dentro de la arquitectura global.
 */
function registrarConfiguracionMapeadores() {
  if (!globalThis.ComponenteCorreo) return;
  if (!globalThis.ComponenteCorreo.Mapeadores) {
    globalThis.ComponenteCorreo.Mapeadores = {};
  }
  // MAPEADOR UNIFICADO 1: NOTIFICACIONES GENERALES (Plantillas 1, 2 y 4)
  const mapeadorNotificacionGeneral = {
    rutaHtml: "PlantillaNotifiacionGeneral",
    plantilla: {
      variables: function (registroBD, clavePlantilla) {
        const config = CONFIGURACION_PLANTILLAS[clavePlantilla] || CONFIGURACION_PLANTILLAS.financiacionVencimiento;
        return config.variables(registroBD);
      },
      destacados: function (vars, registroBD, clavePlantilla) {
        const config = CONFIGURACION_PLANTILLAS[clavePlantilla] || CONFIGURACION_PLANTILLAS.financiacionVencimiento;
        const destacadosUser = config.destacados(vars);
        const listaParrafos = [destacadosUser.PARRAFO_1, destacadosUser.PARRAFO_2, destacadosUser.PARRAFO_3];
        return {
          TITULO_PESTANA: destacadosUser.TITULO_PESTANA,
          URL_LOGO_PRIMARIO: vars.logoEmpresaPrimario,
          ALT_LOGO_PRIMARIO: "Empresa",
          URL_LOGO_SECUNDARIO: vars.logoEmpresaSecundario,
          ALT_LOGO_SECUNDARIO: "Entidad Financiera",
          URL_BANNER_HEADER: vars.bannerHeader,
          ALT_BANNER_HEADER: destacadosUser.ALT_BANNER_HEADER,
          HERO_TITULO: destacadosUser.HERO_TITULO,
          HERO_SUBTITULO: destacadosUser.HERO_SUBTITULO,
          SALUDO_NOMBRE: `Hola ${vars.nombre}`,
          BLOQUE_PARRAFOS: construirBloqueParrafos(listaParrafos),
          BLOQUE_DATOS_DETALLE: construirBloqueDetalles(vars.iconCredito, vars.numeroCredito, vars.iconSaldo, vars.saldoFecha),
          TEXTO_PRE_BOTON: destacadosUser.TEXTO_PRE_BOTON,
          TEXTO_BOTON_PAGO: destacadosUser.TEXTO_BOTON_PAGO,
          URL_BOTON_PAGO: vars.urlPago,
          URL_ICONO_VIGILADO: CONFIG.ASSETS.ICON_VIGILADO,
          FOOTER_SLOGAN_PARTE1: "Su tranquilidad,",
          FOOTER_SLOGAN_PARTE2: "nuestra prioridad"
        };
      }
    }
  };

  // MAPEADOR UNIFICADO 2: FINANCIACIÓN CANCELADA (Plantilla 3)
  const mapeadorFinanciacionCancelada = {
    rutaHtml: "PlantillaFinanciacionCancelada",
    plantilla: {
      variables: function (registroBD) {
        return CONFIGURACION_PLANTILLAS.financiacionCancelada.variables(registroBD);
      },
      destacados: function (vars, registroBD) {
        const destacadosUser = CONFIGURACION_PLANTILLAS.financiacionCancelada.destacados(vars);
        return {
          TITULO_PESTANA: destacadosUser.TITULO_PESTANA,
          URL_LOGO_PRIMARIO: vars.logoEmpresaPrimario,
          ALT_LOGO_PRIMARIO: "Empresa",
          URL_LOGO_SECUNDARIO: vars.logoEmpresaSecundario,
          ALT_LOGO_SECUNDARIO: "Entidad Financiera",
          URL_BANNER_HEADER: vars.bannerHeader,
          ALT_BANNER_HEADER: destacadosUser.ALT_BANNER_HEADER,
          HERO_TITULO: destacadosUser.HERO_TITULO,
          HERO_SUBTITULO: destacadosUser.HERO_SUBTITULO,
          SALUDO_NOMBRE: `Hola ${vars.nombre}`,
          TEXTO_SIDEBAR_LEGAL: destacadosUser.TEXTO_SIDEBAR_LEGAL || "",
          PARRAFO_1: destacadosUser.PARRAFO_1,
          PARRAFO_2: destacadosUser.PARRAFO_2,
          BLOQUE_DATOS_DETALLE: construirBloqueDetalles(vars.iconCredito, vars.numeroCredito, vars.iconSaldo, vars.saldoFecha),
          TEXTO_PRE_BOTON: destacadosUser.TEXTO_PRE_BOTON,
          TEXTO_BOTON_PAGO: destacadosUser.TEXTO_BOTON_PAGO,
          URL_BOTON_PAGO: vars.urlPago,
          URL_ICONO_VIGILADO: CONFIG.ASSETS.ICON_VIGILADO,
          FOOTER_SLOGAN_PARTE1: "Su tranquilidad,",
          FOOTER_SLOGAN_PARTE2: "nuestra prioridad"
        };
      }
    }
  };

  // ASIGNACIÓN DE MAPEADORES AL CONTENEDOR GLOBAL
  globalThis.ComponenteCorreo.Mapeadores.financiacionVencimiento = mapeadorNotificacionGeneral;
  globalThis.ComponenteCorreo.Mapeadores.financiacionPendientepago = mapeadorNotificacionGeneral;
  globalThis.ComponenteCorreo.Mapeadores.evitePerdidaProteccion = mapeadorNotificacionGeneral;
  globalThis.ComponenteCorreo.Mapeadores.financiacionCancelada = mapeadorFinanciacionCancelada;
}

/**
 * Inicialización del Espacio de Nombres Global para el Componente de Correos.
 */
(function inicializarGlobal() {
  if (globalThis.ComponenteCorreo) return;
  /**
   * Espacio de nombres global para la aplicación.
   * @namespace ComponenteCorreo
   */
  globalThis.ComponenteCorreo = {
    // 1. CONFIGURACIÓN CENTRAL Y VARIABLES DE ESTILO PREDETERMINADAS
    Configuracion: {
      EstilosBase: {
        COLOR_PRIMARIO: "#00A859",
        COLOR_SECUNDARIO: "#FFDE59",
        COLOR_TEXTO_BOTON: "#004D25",
        FONDO_CUERPO: "#f4f4f4",
        TEXTO_PRINCIPAL: "#2c3e50",
        TEXTO_MUTED: "#6c757d",
        COLOR_BORDE: "#e9ecef"
      }
    },
    // 2. SISTEMA DE LOGS Y AUDITORÍA
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
    // 3. REGISTRO DE MAPEADORES DINÁMICOS
    Mapeadores: {},
    // 4. SERVICIO DE LÓGICA DE NEGOCIO (Motor de inyección Regex)
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
    // 5. CONTROLADOR PRINCIPAL
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

// Ejecución inicial automática de mapeadores
(function registrarConfiguracion() {
  registrarConfiguracionMapeadores();
})();

/**
============================================================================
FUNCIONES DE SELECCIÓN, RENDERIZADO Y LECTURA DE DATOS
============================================================================
*/

/**
 * Lee la Hoja de Google Sheets configurada y mapea las filas a un arreglo de objetos dinámicos.
 * Operación optimizada en memoria (batch read).
 *
 * @returns {Array<Object>} Arreglo de registros mapeados desde la hoja de cálculo.
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

/**
 * Obtiene un registro válido de la BD de Sheets. Si se pasa uno por parámetro lo usa,
 * de lo contrario toma el primer registro disponible en la hoja de cálculo.
 *
 * @param {Object} [registroBD] Registro explícito opcional.
 * @returns {Object} Registro leído de la base de datos.
 */
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

/**
 * Renderiza el HTML dinámico activado según la clave de configuración dada o la global.
 *
 * @param {Object} [registroBD] Record o datos dinámicos a renderizar (opcional, lee de BD si se omite).
 * @param {string} [plantillaClave] Clave de la plantilla deseada ("financiacionVencimiento", "financiacionPendientepago", etc.).
 * @returns {string} HTML renderizado y procesado.
 */
function obtenerPlantillaActiva(registroBD, plantillaClave) {
  if (typeof registrarConfiguracionMapeadores === 'function') {
    registrarConfiguracionMapeadores();
  }
  const claveFinal = plantillaClave || (typeof CONFIGURACION_BD !== 'undefined' ? CONFIGURACION_BD.PLANTILLA_ACTIVA : 'financiacionVencimiento');
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

/**
 * Instancia y renderiza el HTML leyendo los datos de la BD real.
 */
function renderizarPlantillaHTML(plantillaClave, registroBD) {
  try {
    const claveFinal = plantillaClave || (typeof CONFIGURACION_BD !== 'undefined' ? CONFIGURACION_BD.PLANTILLA_ACTIVA : 'financiacionVencimiento');
    const registroAProcesar = resolverRegistroBD(registroBD);
    if (typeof obtenerPlantillaActiva === 'function') {
      return obtenerPlantillaActiva(registroAProcesar, claveFinal);
    }
    const mapeador = globalThis.ComponenteCorreo.Mapeadores[claveFinal];
    const rutaHtml = mapeador ? mapeador.rutaHtml : 'FE/PlantillaNotificacionGeneral';
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
      '├─ <p>' + e.toString() + '</p></div>';
  }
}

/**
 * Función de prueba para verificar el renderizado con datos reales de la BD.
 */
function probarRenderizado() {
  const registroPrueba = resolverRegistroBD();
  const htmlProcesado = renderizarPlantillaHTML(null, registroPrueba);
  Logger.log('Longitud del HTML generado: ' + htmlProcesado.length + ' caracteres.');
}