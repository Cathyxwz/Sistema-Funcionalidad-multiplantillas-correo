# ✉️ Sistema funcional de plantillas para correos

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/apps-script) [![Gmail](https://img.shields.io/badge/Gmail-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](https://www.gmail.com/) [![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?style=for-the-badge&logo=googleworkspace&logoColor=white)](https://sheets.google.com) [![HTML Email](https://img.shields.io/badge/HTML%20Email-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)

Sistema para generar, personalizar y enviar correos HTML desde Google Sheets usando Google Apps Script.

El flujo actual del proyecto está basado en dos plantillas principales, variables dinámicas y un renderizado centralizado que reemplaza marcadores del HTML según la fila del registro que se está procesando.

---

## 📌 ¿Qué hace este proyecto?

- Lee una hoja de Google Sheets y procesa cada fila.
- Valida que la fila tenga una dirección de correo válida.
- Revisa si el registro ya fue marcado como enviado.
- Selecciona la plantilla activa configurada en `Configuracion.gs`.
- Inserta texto, logotipos, banners, y bloques dinámicos de datos.
- Envía el correo con Gmail.
- Actualiza la columna `Enviado` para evitar reenvíos.
- Registra eventos y errores para auditoría.

---

## 🧩 Plantillas disponibles

Actualmente el sistema cuenta con estas dos plantillas:

- `plantillaDestacados`
- `plantillaNotificacion`

Estas se configuran en `CONFIGURACION_BD.PLANTILLA_ACTIVA` dentro de `Configuracion.gs`.

Ejemplo:

```javascript
const CONFIGURACION_BD = {
  PLANTILLA_ACTIVA: "plantillaDestacados",
  ID_HOJA: "ID_DE_TU_HOJA",
  NOMBRE_HOJA: "Datos"
};
```

La estructura actual del proyecto usa los archivos HTML:

- `PlantillaDestacados.html`
- `PlantillaNotificacion.html`

---

## 🗂️ Estructura real del proyecto

```text
Plantillas/
├── .vscode/
│   └── launch.json
├── Configuracion.gs
├── LogicaPrincipal.gs
├── PlantillaDestacados.html
├── PlantillaNotificacion.html
├── README.md
└── .git/
```

> El repositorio ya no usa `ServiciosCorreo.gs` ni las plantillas antiguas `PlantillaFinanciacionCancelada.html` / `PlantillaNotifiacionGeneral.html` en la versión actual.

---

## ⚙️ Configuración base

> Importante: todas las imágenes deben ir en marca blanca, sin referencias a bancos ni marcas institucionales ajenas. Reemplaza los placeholders por tus imágenes reales del cliente y deja todo con un fondo blanco o transparente.

### 1. Crear el proyecto en Apps Script

1. Abre [Google Apps Script](https://script.google.com/).
2. Crea un proyecto nuevo.
3. Asegúrate de usar el motor **V8**.
4. Crea dos archivos `.gs` y dos archivos `.html`.

### 2. Copiar estos archivos

- `Configuracion.gs`
- `LogicaPrincipal.gs`
- `PlantillaDestacados.html`
- `PlantillaNotificacion.html`

No copies el archivo `.vscode/launch.json` ni rutas locales de tu equipo a Apps Script.

### 3. Configura la hoja de cálculo

En `Configuracion.gs` se encuentra la sección principal:

```javascript
const CONFIGURACION_BD = {
  PLANTILLA_ACTIVA: "plantillaDestacados",
  ID_HOJA: "1MnvFyInIvL0VI9x0R4sxfE0DTeG2FHuuQbIg0pDftEI",
  NOMBRE_HOJA: "Datos",

  CONFIGURACION_CORREO: {
    ASUNTO_CORREO: "Notificaciones Corporativas",
    NO_REPLY: false,
    REPLY_TO: ""
  },

  COLUMNAS: {
    NOMBRE: "Nombre",
    CORREO: "Correo",
    ENVIADO: "Enviado",
    URL_PAGO: "UrlPago"
  },

  ASSETS: {
    LOGO_BOLIVAR: "https://...",
    LOGO_DAVIVIENDA: "https://...",
    BANNER_DESTACADOS: "https://...",
    BANNER_NOTIFICACION: "https://...",
    ICON_CREDITO: "https://...",
    ICON_SALDO: "https://..."
  }
};
```

Debes reemplazar:

- `PLANTILLA_ACTIVA` por `plantillaDestacados` o `plantillaNotificacion`.
- `ID_HOJA` por el ID real del archivo de Sheets.
- `NOMBRE_HOJA` por la pestaña exacta.
- Las URLs de imágenes por URLs públicas y accesibles desde el cliente de correo.

---

## 🧱 Estructura de datos en Google Sheets

La hoja debe tener una fila de encabezados con columnas como estas:

| Encabezado | Descripción | Obligatorio |
|---|---|---:|
| `Nombre` | Nombre del destinatario | Recomendado |
| `Correo` | Correo del destinatario | Sí |
| `Enviado` | Estado del envío (`TRUE`, `FALSE`, `SI`, etc.) | Sí |
| `UrlPago` | Link del botón de acción | Recomendado |
| `Variable_1` | Valor configurable para bloque dinámico | Opcional |
| `Variable_2` | Valor configurable para bloque dinámico | Opcional |

Si tus columnas tienen otros nombres, actualizalas en `CONFIGURACION_BD.COLUMNAS`.

---

## 🔁 Variables dinámicas

La configuración ofrece un bloque visual de variables configurables por plantilla.

Ejemplo:

```javascript
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
]
```

Si dejas el arreglo vacío `[]`, este bloque no se renderiza.

---

## 📨 Cómo se envía el correo

La función principal es:

```javascript
ejecutarProcesoEnvioCorreos();
```

También puedes ejecutar con opciones personalizadas:

```javascript
ejecutarProcesoEnvioCorreos({
  plantillaClave: "plantillaDestacados",
  valorEstadoEnviado: "SI",
  cc: "supervisor@empresa.com",
  bcc: "auditoria@empresa.com",
  replyTo: "respuestas@empresa.com",
  noReply: false
});
```

Para probar sin enviar a toda la base:

```javascript
probarEnvioMasivoConPlantillaActiva();
```

---

## 🧪 Cómo probar renderizado

Ejecuta la siguiente función en Apps Script:

```javascript
probarRenderizado();
```

Esto toma el primer registro disponible, genera el HTML y registra la longitud final del contenido procesado.

---

## 🧠 Estructura lógica del código

### `Configuracion.gs`

Contiene la configuración editable del sistema:

- Plantilla activa.
- ID y nombre de la hoja.
- Mapeo de columnas.
- Activos visuales.
- Paleta de colores.
- Texto y contenido editable de cada plantilla.
- Arreglo de variables dinámicas.

### `LogicaPrincipal.gs`

Contiene el motor de render y envío:

- `obtenerRegistrosDesdeBD()`
- `resolverRegistroBD()`
- `obtenerPlantillaActiva()`
- `renderizarPlantillaHTML()`
- `registrarConfiguracionMapeadores()`
- `ejecutarProcesoEnvioCorreos()`
- `probarRenderizado()`
- `probarEnvioMasivoConPlantillaActiva()`

Además, define el objeto global `ComponenteCorreo` con:

- configuración base;
- logs;
- mapeadores de plantillas;
- servicio de inyección de contenido HTML;
- controlador de renderizado.

---

## 🧾 Variables que se inyectan en HTML

Las plantillas manejan campos como estos dentro del HTML:

```html
%%TITULO_PESTANA%%
%%URL_LOGO_PRIMARIO%%
%%ALT_LOGO_PRIMARIO%%
%%URL_LOGO_SECUNDARIO%%
%%ALT_LOGO_SECUNDARIO%%
%%URL_BANNER_HEADER%%
%%ALT_BANNER_HEADER%%
%%HERO_TITULO%%
%%HERO_SUBTITULO%%
%%SALUDO_NOMBRE%%
%%BLOQUE_PARRAFOS%%
%%BLOQUE_VARIABLES_DINAMICAS%%
%%TEXTO_PRE_BOTON%%
%%TEXTO_BOTON_PAGO%%
%%URL_BOTON_PAGO%%
%%FOOTER_SLOGAN_PARTE1%%
%%FOOTER_SLOGAN_PARTE2%%
```

Todos estos marcadores se reemplazan automáticamente durante el render.

---

## 🔐 Validaciones y seguridad

El sistema incluye:

- validación de la hoja de cálculo;
- validación de la pestaña y columnas obligatorias;
- validación del correo electrónic o;
- control para no reenviar filas ya marcadas como enviadas;
- escritura de estado solo cuando el correo fue exitoso;
- control de cuota diaria de Gmail;
- logging de errores por fila.

Recomendaciones:

- usar una hoja de prueba antes del envío real;
- mantener privadas las URLs de imágenes y el ID del archivo;
- verificar permisos de Gmail, Sheets y Drive;
- usar HTTPS en imágenes y logotipos.

---

## 🚀 Modo de uso recomendado

1. Define la plantilla en `CONFIGURACION_BD.PLANTILLA_ACTIVA`.
2. Ajusta los nombres de las columnas y los textos en `Configuracion.gs`.
3. Revisa que la hoja tenga `Correo` y `Enviado`.
4. Ejecuta `probarRenderizado()` para validar el HTML.
5. Ejecuta `probarEnvioMasivoConPlantillaActiva()` en pruebas.
6. Si todo funciona, ejecuta `ejecutarProcesoEnvioCorreos()` con la base real.

---

## 🔧 Tecnologías usadas

- Google Apps Script
- JavaScript ES6+
- Google Sheets
- GmailApp
- HtmlService
- HTML y CSS para correos
- Git y GitHub

---

## 📝 Nota importante

La versión actual del proyecto ya no corresponde a las plantillas y nombres antiguos del repositorio inicial. Esta documentación refleja el código que está en este workspace y la lógica que realmente está implementada en `Configuracion.gs` y `LogicaPrincipal.gs`.
