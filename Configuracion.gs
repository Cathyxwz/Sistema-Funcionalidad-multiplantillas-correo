/**
============================================================================
MÓDULO BACKEND - CONFIGURACIÓN DE PLANTILLAS Y BD (EDITABLE)
============================================================================
* Archivo: BE/Configuracion.gs
* Descripción: Módulo editable exclusivo para la parametrización de plantillas,
*              textos destacados, activos visuales, asignación dinámica de 
*              variables (0, 1, 2, 3, N) y conexión a Google Sheets.
* 
* GUÍA DE USO Y PERSONALIZACIÓN:
* 1. PLANTILLA_ACTIVA: Cambie entre "plantillaDestacados" o "plantillaNotificacion".
* 2. COLUMNAS: Mapee aquí los nombres exactos de los encabezados en su Google Sheet.
* 3. VARIABLES_DINAMICAS (Dentro de cada plantilla):
*    - Puede definir 0, 1, 2, 3, 4 o N variables según su necesidad.
*    - Si la lista está vacía [], el bloque visual de datos en el correo NO se renderizará.
*    - Estructura de cada variable:
*      { 
*        etiqueta: "Nombre a mostrar:", 
*        claveColumna: "Nombre_Columna_En_Sheet", 
*        icono: "URL_DEL_ICONO",
*        esMoneda: true / false (opcional, para auto-formatear números)
*      }
============================================================================
*/

/**
 * CONFIGURACIÓN CENTRAL DE CONEXIÓN, PLANTILLA ACTIVA, ACTIVOS Y ESTRUCTURA DE COLUMNAS
 */
const CONFIGURACION_BD = {
  PLANTILLA_ACTIVA: "plantillaDestacados", // Opciones válidas: "plantillaDestacados" | "plantillaNotificacion"
  ID_HOJA: "1MnvFyInIvL0VI9x0R4sxfE0DTeG2FHuuQbIg0pDftEI",
  NOMBRE_HOJA: "Datos",

  // Opciones de envío de correo por defecto
  CONFIGURACION_CORREO: {
    ASUNTO_CORREO: "Notificaciones Corporativas",
    NO_REPLY: false,
    REPLY_TO: ""
  },

  // Mapeo dinámico y personalizable de columnas fijas de la Hoja de Cálculo
  //Para el envio de correos minimo tener columna de correo, y enviado.
  COLUMNAS: {
    NOMBRE: "Nombre",                       // Nombre del destinatario
    CORREO: "Correo",                       // Correo electrónico de destino
    ENVIADO: "Enviado",                     // Estado de envío (TRUE / FALSE / SI)
    URL_PAGO: "UrlPago"                     // Link de acción / botón
  },

  // Centralización de Estilos UI (Design Tokens corporativos)
  ESTILOS_UI: {
    COLOR_PRIMARIO: "#00A859",
    COLOR_SECUNDARIO: "#FFDE59",
    COLOR_TEXTO_BOTON: "#004D25",
    FONDO_CUERPO: "#ffffff",
    TEXTO_PRINCIPAL: "#222222",
    TEXTO_MUTED: "#555555"
  },

  // Centralización de Activos Visuales e Imágenes Corporativas
  // Mantener marca blanca: reemplaza las URLs por tus imágenes reales del cliente.
  ASSETS: {
    LOGO_BOLIVAR: 'https://placehold.co/260x90/FFFFFF/222222?text=Coloca+tu+imagen+aqui',
    LOGO_DAVIVIENDA: 'https://placehold.co/260x90/FFFFFF/222222?text=Coloca+tu+imagen+aqui',
    BANNER_DESTACADOS: 'https://placehold.co/1200x380/FFFFFF/222222?text=Coloca+tu+imagen+aqui',
    BANNER_NOTIFICACION: 'https://placehold.co/1200x380/FFFFFF/222222?text=Coloca+tu+imagen+aqui',
    ICON_CREDITO: 'https://placehold.co/60x60/FFFFFF/222222?text=Icono',
    ICON_SALDO: 'https://placehold.co/60x60/FFFFFF/222222?text=Icono',
    ICON_VIGILADO: 'https://placehold.co/180x70/FFFFFF/222222?text=Marca+blanca'
  }
};

/**
 * ==========================================================================
 * PLANTILLAS PERSONALIZABLES (TEXTOS, ETIQUETAS Y VARIABLES ADAPTABLES)
 * ==========================================================================
 */
const PLANTILLAS_PERSONALIZABLES = {

  // ------------------------------------------------------------------------
  // PLANTILLA 1: plantillaDestacados
  // ------------------------------------------------------------------------
  plantillaDestacados: function (registroBD) {
    return {
      TITULO_PESTANA: "Notificación importante",
      HERO_TITULO: "Tu información",
      HERO_SUBTITULO: "importante",
      ALT_BANNER_HEADER: "Coloca tu imagen aquí",
      SALUDO_PREFIX: "Hola",
      
      // === CONFIGURACIÓN DINÁMICA DE VARIABLES (0, 1, 2, 3, 4 o N) ===
      // Si elimina elementos o deja el arreglo vacío [], el bloque visual de datos se oculta automáticamente.
      VARIABLES_DINAMICAS: [
        {
          etiqueta: "Número de crédito:",
          claveColumna: "Variable_1",
          icono: CONFIGURACION_BD.ASSETS.ICON_CREDITO,
          esMoneda: false
        },
        {
          etiqueta: "Saldo a la fecha:",
          claveColumna: "Variable_2",
          icono: CONFIGURACION_BD.ASSETS.ICON_SALDO,
          esMoneda: true
        }
        /* EJEMPLO PARA AGREGAR VARIABLE 3 Y 4:
        ,{
          etiqueta: "Fecha de Vencimiento:",
          claveColumna: "Variable_3",
          icono: CONFIGURACION_BD.ASSETS.ICON_CREDITO,
          esMoneda: false
        },
        {
          etiqueta: "Valor Cuota:",
          claveColumna: "Variable_4",
          icono: CONFIGURACION_BD.ASSETS.ICON_SALDO,
          esMoneda: true
        }
        */
      ],

      // === PÁRRAFOS CONFIGURABLES ===
      PARRAFO_1: `Queremos recordarle que su información requiere atención oportuna para mantener el servicio activo y sin interrupciones.`,
      PARRAFO_2: `Le invitamos a revisar su estado y realizar la gestión correspondiente en el canal oficial designado por la organización.`,
      PARRAFO_3: "",

      // === BOTONES Y LLAMADOS A LA ACCIÓN ===
      TEXTO_PRE_BOTON: "Realizar el pago es fácil y toma solo unos minutos",
      TEXTO_BOTON_PAGO: "Pagar mi cuota en línea",

      // === SLOGAN FOOTER ===
      FOOTER_SLOGAN_PARTE1: "Tranquilo,",
      FOOTER_SLOGAN_PARTE2: "nosotros respondemos"
    };
  },

  // ------------------------------------------------------------------------
  // PLANTILLA 2: plantillaNotificacion
  // ------------------------------------------------------------------------
  plantillaNotificacion: function (registroBD) {
    return {
      TITULO_PESTANA: "Aviso de notificación",
      HERO_TITULO: "Notificación",
      HERO_SUBTITULO: "importante",
      ALT_BANNER_HEADER: "Coloca tu imagen aquí",
      SALUDO_PREFIX: "Estimado(a)",

      // Esta plantilla por defecto no requiere caja de variables (0 variables)
      VARIABLES_DINAMICAS: [],

      // === PÁRRAFOS CONFIGURABLES ===
      PARRAFO_1: `Queremos informarle el estado actual de su servicio contratado y la importancia de atender esta solicitud en el tiempo indicado.`,
      PARRAFO_2: `Los imprevistos pueden ocurrir en cualquier momento. Por eso, le pedimos revisar la información y seguir los canales oficiales establecidos por la organización.`,
      PARRAFO_3: "",

      // === BOTONES Y LLAMADOS A LA ACCIÓN ===
      TEXTO_PRE_BOTON: "",
      TEXTO_BOTON_PAGO: "Pagos en línea",

      // === SLOGAN FOOTER ===
      FOOTER_SLOGAN_PARTE1: "Tranquilo,",
      FOOTER_SLOGAN_PARTE2: "nosotros respondemos"
    };
  }
};

/**
 * Helper centralizado para extraer y normalizar variables desde el registro de la BD.
 */
function extraerVariablesBase(registroBD, clavePlantilla) {
  const datos = registroBD || {};
  const plantillaActiva = clavePlantilla || CONFIGURACION_BD.PLANTILLA_ACTIVA;

  const MAPA_BANNERS = {
    'plantillaDestacados': CONFIGURACION_BD.ASSETS.BANNER_DESTACADOS,
    'plantillaNotificacion': CONFIGURACION_BD.ASSETS.BANNER_NOTIFICACION
  };

  const bannerSeleccionado = MAPA_BANNERS[plantillaActiva] || CONFIGURACION_BD.ASSETS.BANNER_DESTACADOS;

  return {
    nombre: datos[CONFIGURACION_BD.COLUMNAS.NOMBRE] || '',
    correo: datos[CONFIGURACION_BD.COLUMNAS.CORREO] || '',
    enviado: datos[CONFIGURACION_BD.COLUMNAS.ENVIADO] === true || 
             String(datos[CONFIGURACION_BD.COLUMNAS.ENVIADO]).toUpperCase() === 'TRUE' || 
             String(datos[CONFIGURACION_BD.COLUMNAS.ENVIADO]).toUpperCase() === 'SI',
    urlPago: datos[CONFIGURACION_BD.COLUMNAS.URL_PAGO] || '',
    logoBolivar: CONFIGURACION_BD.ASSETS.LOGO_BOLIVAR,
    logoDavivienda: CONFIGURACION_BD.ASSETS.LOGO_DAVIVIENDA,
    bannerHeader: bannerSeleccionado
  };
}

/**
 * Mapeo de configuración unificada
 */
const CONFIGURACION_PLANTILLAS = Object.keys(PLANTILLAS_PERSONALIZABLES).reduce(function (mapa, clave) {
  mapa[clave] = {
    variables: function (registroBD) {
      return extraerVariablesBase(registroBD, clave);
    },
    destacados: function (vars, registroBD) {
      return PLANTILLAS_PERSONALIZABLES[clave](registroBD);
    }
  };
  return mapa;
}, {});