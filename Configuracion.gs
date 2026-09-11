/**
============================================================================
MÓDULO BACKEND - CONFIGURACIÓN DE PLANTILLAS Y BD (EDITABLE / MARCA BLANCA)
============================================================================
* Archivo: BE/Configuracion.gs
* Descripción: Módulo editable exclusivo para la parametrización de plantillas,
*              textos destacados, activos visuales y conexión a Google Sheets.
*
* NOTA: Este archivo NO contiene lógica ejecutable compleja. Modifique únicamente
* los valores de texto, rutas de assets o variables según sus necesidades de negocio.
*/
// ============================================================================
// 1. CONFIGURACIÓN CENTRAL Y CONEXIÓN A BASE DE DATOS
// ============================================================================
/**
 * CONFIGURACIÓN CENTRAL DE CONEXIÓN, PLANTILLA ACTIVA Y ESTRUCTURA DE COLUMNAS DE LA BD
 * ----------------------------------------------------------------------------
 * - PLANTILLA_ACTIVA: Elija la plantilla que desea activar cambiando el valor.
 *   Opciones válidas disponibles:
 *     - "financiacionVencimiento"  : Recordatorio para cuotas que vencen el día de hoy.
 *     - "financiacionPendientepago": Notificación para saldos pendientes.
 *     - "financiacionCancelada"    : Notificación formal de cancelación de financiación.
 *     - "evitePerdidaProteccion"   : Aviso preventivo para evitar pérdida de cobertura.
 *
 * - ID_HOJA: Asigne el ID de su hoja de cálculo de Google Sheets.
 * - NOMBRE_HOJA: Nombre de la pestaña que contiene los registros.
 * - COLUMNAS: Defina el mapeo de nombres de columnas tal cual aparecen en la fila 1 de su BD.
 */
const CONFIGURACION_BD = {
  PLANTILLA_ACTIVA: "evitePerdidaProteccion", // Cambiar plantilla con alguna opcion de arriba.
  ID_HOJA: "1MnvFyInIvL0VI9x0R4sxfE0DTeG2FHuuQbIg0pDftEI", // Ejemplo: "1A2b3C4d5E6f7G8h9I0j"
  NOMBRE_HOJA: "Datos",                     // Nombre de la pestaña en la hoja
  COLUMNAS: {
    NOMBRE: "Nombre",                       // Nombre del cliente
    TIPO_SEGURO: "Tipo_De_Seguro",          // Ej: Vida, Vehículo, Salud
    NUMERO_CREDITO: "Numero_Credito",       // Identificador único de crédito
    SALDO_FECHA: "Saldo_Fecha",             // Valor a pagar / saldo pendiente
    URL_PAGO: "UrlPago",                    // Link directo a la pasarela de pago
    CORREO: "Correo",                       // Correo electrónico de destino
    ENVIADO: "Enviado"                      // Estado de envío (TRUE / FALSE)
  }
};

/**
 * Helper único y centralizado para extraer y normalizar variables desde el registro de la BD.
 *
 * NOTA DE EXTENSIBILIDAD: Si agrega nuevos campos a CONFIGURACION_BD.COLUMNAS,
 * mapéelos en el objeto retornado a continuación para usarlos en sus plantillas.
 */
function extraerVariablesBase(registroBD, clavePlantilla) {
  const datos = registroBD || {};
  const plantillaActiva = clavePlantilla || CONFIGURACION_BD.PLANTILLA_ACTIVA;
 
  // Normalización y formateo de campos monetarios
  const rawSaldo = datos[CONFIGURACION_BD.COLUMNAS.SALDO_FECHA];
  const saldoFormateado = typeof rawSaldo === 'number'
    ? (globalThis.Utilidades?.FORMATEAR_MILES?.(rawSaldo) || `$ ${rawSaldo}`)
    : (rawSaldo !== undefined && rawSaldo !== null ? rawSaldo : '');

  // Mapeo dinámico de banners superiores según plantilla activa
  const MAPA_BANNERS = {
    'financiacionVencimiento': CONFIG.ASSETS.BANNER_HEADER,
    'financiacionPendientepago': CONFIG.ASSETS.BANNER_HEADER_2,
    'financiacionCancelada': CONFIG.ASSETS.BANNER_HEADER_3,
    'evitePerdidaProteccion': CONFIG.ASSETS.BANNER_HEADER_4
  };

  const bannerSeleccionado = MAPA_BANNERS[plantillaActiva] || CONFIG.ASSETS.BANNER_HEADER;

  return {
    nombre: datos[CONFIGURACION_BD.COLUMNAS.NOMBRE] || '',
    tipoSeguro: datos[CONFIGURACION_BD.COLUMNAS.TIPO_SEGURO] || '',
    numeroCredito: datos[CONFIGURACION_BD.COLUMNAS.NUMERO_CREDITO] || '',
    saldoFecha: saldoFormateado,
    urlPago: datos[CONFIGURACION_BD.COLUMNAS.URL_PAGO] || '',
    correo: datos[CONFIGURACION_BD.COLUMNAS.CORREO] || '',
    enviado: datos[CONFIGURACION_BD.COLUMNAS.ENVIADO] === true || String(datos[CONFIGURACION_BD.COLUMNAS.ENVIADO]).toUpperCase() === 'TRUE',
    iconCredito: CONFIG.ASSETS.ICON_CREDITO,
    iconSaldo: CONFIG.ASSETS.ICON_SALDO,
    logoEmpresaPrimario: CONFIG.ASSETS.LOGO_EMPRESA_PRIMARIO,
    logoEmpresaSecundario: CONFIG.ASSETS.LOGO_EMPRESA_SECUNDARIO,
    bannerHeader: bannerSeleccionado
  };
}

/**
 * ==========================================================================
 * PLANTILLAS PERSONALIZABLES (TEXTOS Y PÁRRAFOS EDITABLES)
 * ==========================================================================
 * INSTRUCCIONES DE EDICIÓN:
 * 1. Modifique los textos dentro de las comillas simples o invertidas.
 * 2. Puede usar etiquetas HTML como <strong>texto</strong> o <span style="...">.
 * 3. Use ${vars.tipoSeguro} para inyectar dinámicamente el tipo de seguro del cliente.
 * 4. Si no desea mostrar un párrafo opcional, déjelo en blanco: ""
 */
const PLANTILLAS_PERSONALIZABLES = {
  // ------------------------------------------------------------------------
  // PLANTILLA 1: financiacionVencimiento ("La tranquilidad también se cuida")
  // ------------------------------------------------------------------------
  financiacionVencimiento: function (vars) {
    return {
      TITULO_PESTANA: "Notificación de Pago de Seguro",
      HERO_TITULO: "La tranquilidad también",
      HERO_SUBTITULO: "se cuida",
      ALT_BANNER_HEADER: "Header Cuidado",
      // === PÁRRAFOS CONFIGURABLES ===
      PARRAFO_1: `Hay decisiones que se toman una sola vez, pero que lo acompañan todos los días. Su Seguro de <strong>${vars.tipoSeguro}</strong> es una de ellas.`,
      PARRAFO_2: `Queremos recordarle que hoy vence la cuota de la financiación de su Seguro <strong>${vars.tipoSeguro}</strong> con <span style="color: #000000; font-weight: bold;">su Entidad Financiera</span>. Al mantenerla al día, su protección continúa respaldándolo cuando más lo pueda necesitar.`,
      PARRAFO_3: "", // Párrafo opcional (dejar en "" para no mostrar)
      // === BOTONES Y LLAMADOS A LA ACCIÓN ===
      TEXTO_PRE_BOTON: "Realizar el pago es fácil y toma solo unos minutos",
      TEXTO_BOTON_PAGO: "Pagar mi cuota en línea"
    };
  },
  // ------------------------------------------------------------------------
  // PLANTILLA 2: financiacionPendientepago ("Continuemos juntos y protegidos")
  // ------------------------------------------------------------------------
  financiacionPendientepago: function (vars) {
    return {
      TITULO_PESTANA: "Recordatorio de Pago de Seguro",
      HERO_TITULO: "Continuemos juntos",
      HERO_SUBTITULO: "y protegidos",
      ALT_BANNER_HEADER: "Continuemos juntos y protegidos",
      // === PÁRRAFOS CONFIGURABLES ===
      PARRAFO_1: `Queremos seguir acompañándolo y ayudarle a mantener la protección que eligió para su Seguro de <strong>${vars.tipoSeguro}</strong>, financiada con <span style="color: #000000; font-weight: bold;">su Entidad Financiera</span>.`,
      PARRAFO_2: `Le recordamos que su financiación presenta un saldo pendiente de pago. Lo invitamos a realizar el pago lo antes posible para mantener vigente la cobertura de su seguro.`,
      PARRAFO_3: `Para facilitarle el proceso de pago, aquí encontrará la información de su financiación:`,
      // === BOTONES Y LLAMADOS A LA ACCIÓN ===
      TEXTO_PRE_BOTON: "¡Lo invitamos a realizar su pago ahora!",
      TEXTO_BOTON_PAGO: "Pagar saldo en línea"
    };
  },
  // ------------------------------------------------------------------------
  // PLANTILLA 3: financiacionCancelada ("Su Financiación ha sido cancelada")
  // ------------------------------------------------------------------------
  financiacionCancelada: function (vars) {
    return {
      TITULO_PESTANA: "Aviso de Cancelación de Financiación",
      HERO_TITULO: "Su Financiación",
      HERO_SUBTITULO: "ha sido cancelada",
      ALT_BANNER_HEADER: "Su Financiación ha sido cancelada",
      TEXTO_SIDEBAR_LEGAL: "",
      // === PÁRRAFOS CONFIGURABLES ===
      PARRAFO_1: `Queremos informarle que, conforme a la autorización otorgada al momento de adquirir la financiación de su Seguro de <strong>${vars.tipoSeguro}</strong> con <span style="color: #000000; font-weight: bold;">su Entidad Financiera</span>, y al no haberse registrado el pago dentro del plazo establecido, su financiación ha sido cancelada.`,
      PARRAFO_2: `Los imprevistos pueden ocurrir en cualquier momento. Queremos que usted y su familia sigan contando con la protección de su seguro. Realice el pago del saldo pendiente a través de nuestros canales y recupere el respaldo y la tranquilidad que le brinda <strong>su Compañía de Seguros</strong>.`,
      PARRAFO_3: "", // Párrafo opcional (dejar en "" para no mostrar)
      // === BOTONES Y LLAMADOS A LA ACCIÓN ===
      TEXTO_PRE_BOTON: "",
      TEXTO_BOTON_PAGO: "Pagos en línea"
    };
  },
  // ------------------------------------------------------------------------
  // PLANTILLA 4: evitePerdidaProteccion ("Evite la pérdida de su protección")
  // ------------------------------------------------------------------------
  evitePerdidaProteccion: function (vars) {
    return {
      TITULO_PESTANA: "Aviso Importante de Cobertura",
      HERO_TITULO: "Evite la pérdida",
      HERO_SUBTITULO: "de su protección",
      ALT_BANNER_HEADER: "Evite la pérdida de su protección",
      // === PÁRRAFOS CONFIGURABLES ===
      PARRAFO_1: `Cuando adquirió su Seguro de <strong>${vars.tipoSeguro}</strong> tomó una decisión pensando en estar preparado para los momentos que no se pueden anticipar.`,
      PARRAFO_2: `Hoy queremos ayudarle a que esa decisión siga protegiéndolo.`,
      PARRAFO_3: `Queremos evitar que el saldo pendiente de pago de su financiación con <span style="color: #000000; font-weight: bold;">su Entidad Financiera</span> deje sin el respaldo que hoy protege su patrimonio.<br><br>Para facilitarle el proceso de pago, aquí encontrará la información de su financiación:`,
      // === BOTONES Y LLAMADOS A LA ACCIÓN ===
      TEXTO_PRE_BOTON: "",
      TEXTO_BOTON_PAGO: "Realizar mi pago ahora"
    };
  }
};

/**
 * ==========================================================================
 * CONFIGURACIÓN UNIFICADA DE PLANTILLAS Y CONTENIDOS (MAPEO AUTOMÁTICO)
 * ==========================================================================
 * Vincula automáticamente la extracción de variables dinámicas desde la BD con
 * los contenidos editables definidos en PLANTILLAS_PERSONALIZABLES.
 */
const CONFIGURACION_PLANTILLAS = Object.keys(PLANTILLAS_PERSONALIZABLES).reduce(function (mapa, clave) {
  mapa[clave] = {
    variables: function (registroBD) {
      return extraerVariablesBase(registroBD, clave);
    },
    destacados: PLANTILLAS_PERSONALIZABLES[clave]
  };
  return mapa;
}, {});