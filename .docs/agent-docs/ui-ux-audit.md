# Auditoría UI/UX

## Resumen

Última revisión: 2026-11-16 (quinta sesión). Auditoría en curso, no terminada.

Se conserva el sistema ya implementado de Enki / Better Dark Dev: geometría recta, tipografía editorial, tokens semánticos y paletas por tema. Consultados `.docs/manager.md`, las reglas de GitHub, `.docs/tema-diseno-estilo-enki.md`, `_palette.scss`, `_semantic.scss`, `_layout.scss`, la política de contraste de `src/common/customThemes.ts` y las guías locales `vue-expert` y `playwright-expert`. No se encontraron `agents.md`, `AGENTS.md`, `claude.md` ni `CLAUDE.md` en el repositorio.

Alcance cubierto hasta ahora:

- Sesión 1: controles compartidos (`FilePicker`, `ToggleFormArea`, `ErrorAlert`, `AppModal`) y contenedor de preferencias, con suite de navegador propia.
- Sesión 3: barra de pestañas (`CoreTabs`, `TabSearch`), a petición del usuario.
- Sesión 5: solo las interfaces tocadas por el commit `f85c421` (exploración de grafos) y por los cambios sin confirmar de motores compatibles, a petición del usuario: vista de grafo (`ResultsGraph`, nueva), selector de vistas de `ResultTable`, aviso de motor de `ConnectionInterface`, selector de autenticación de `MysqlForm`/`PostgresForm`, selector de `DatabaseTools` y `ExternalLink`. `CoreTabs` y `TableTable` solo cambiaron lógica (qué motores tienen herramientas o columnas editables), sin efecto visual.
- Sesión 2: dos tareas transversales —**botón de cierre de diálogos** y **suelo de contraste de texto en los 14 temas**— más `AppModal` (nombre accesible), `ColumnFilterModal`, `SidebarSortButtons`, `ExportModal`, `DetailViewSidebar` y los diálogos de estado de copia de seguridad y exportación masiva.

La aplicación es de escritorio; se revisa a 1440, 1024, 600 y 360 px de ancho (360 px solo como prueba de estrés). No se presume soporte móvil. El resto del inventario sigue sin revisión visual completa.

## Pendiente

### Interfaces de grafos y motores compatibles (sesión 5)

- **Alta.** Aviso de motor en `ConnectionInterface` (posición, enlaces y ajuste de URLs largas): **solo verificado por compilación y tipos**. La pantalla de conexión necesita el store completo y no tiene fixture. Revisar en la aplicación con Amazon RDS (nota más larga, con URL), DocumentDB, PlanetScale y Memgraph, a 1440 y 600 px, en claro y oscuro.
- **Media.** `ExternalLink` ahora tiene `href` (recibe foco). Comprobar en Electron, en sus 5 usos (SQLite, SSH en `CommonAdvanced`, `SnapExternalWarning` y el aviso de motor), que Enter y clic abren el navegador del sistema sin navegar dentro de la ventana.
- **Media.** `MysqlForm`/`PostgresForm`: el selector «Authentication Method» se oculta cuando solo hay una opción (motores sin IAM: PlanetScale, SingleStore, etc.). Verificar en la aplicación que el formulario no deja un hueco en la rejilla y que al cambiar de un motor RDS con IAM elegido a uno sin IAM vuelve a «Username / Password».
- **Media.** Contraste de los rellenos de nodo (`CHART_COLORS`) frente al fondo del lienzo en los 14 temas (criterio 1.4.11, 3:1) sin medir. Las etiquetas de texto del grafo usan tokens con suelo de contraste; los círculos no.
- **Baja.** Grafo: un clic en una zona vacía del lienzo no cierra el inspector (sí lo hacen Esc y el botón de cierre). Es habitual en herramientas de grafos; valorar añadirlo distinguiendo clic de arrastre.
- **Baja.** Grafo: el teclado permite recorrer elementos y hacer zoom (`+`, `−`, `0`), pero no desplazar el lienzo. Valorar flechas con el lienzo enfocado.
- **Baja.** Grafo: la leyenda no es interactiva. Filtrar por etiqueta desde la leyenda sería útil con resultados grandes.
- **Baja.** Mensajes de error de carga diferida distintos entre gráfico («Close and reopen this result tab to retry») y grafo («Reopen the application to retry»). Ambos son ciertos para su mecanismo de carga (Vue 2 frente a `defineAsyncComponent`, que no reintenta al volver a montarse tras fallar); unificar exige unificar el cargador.

### Entorno de escritorio (prioridad alta)

- La instalación inicial contenía Vue 2.7.16 y Electron 31.7.3 frente a Vue 3.5.45 y Electron 45.3.2 del manifiesto. `yarn install --frozen-lockfile --ignore-scripts` copió dependencias, pero terminó con `EPERM` al crear el enlace de workspace `node_modules/beekeeper-studio` en este volumen. No se cambió `yarn.lock`.
- El arranque posterior de Electron falla en `better-sqlite3`: `TypeError: addon.initialize is not a function`. Hace falta completar la instalación en un sistema de archivos que admita enlaces y reconstruir los módulos nativos para el Electron correspondiente antes de ejecutar la suite de escritorio. El renderer compila y las pruebas en Chromium funcionan. Sin aplicación de escritorio, los componentes que dependen del store o de una conexión solo se pueden verificar por compilación y revisión de código.

### Controles compartidos (prioridad media)

- `FilePicker`: quedan por verificar en Electron los diálogos de guardar, selección múltiple, cancelación y sus usos dentro de importación/exportación.
- `ToggleFormArea`: verificar SSL/SSH, IAM, importación y extensiones SQLite en sus formularios reales. El flujo de SQLite (`expanded`) sigue sin verificación visual.
- `AppModal`: el título se busca al abrir. Si un diálogo pinta su título de forma asíncrona después de abrirse, cae al `label` o, en último término, al identificador técnico; conviene pasar `label` en esos casos. Faltan pruebas de modales anidados y de los 34 consumidores reales.
- `ExportModal`: etiquetas, desplegable de opciones avanzadas, cierre y `ErrorAlert` corregidos, pero **solo verificados por compilación, tipos y lint**: el componente necesita el store de conexión, que la fixture no monta. Revisar visualmente el error con mensajes largos y el desplegable abierto.
- Diálogos de estado de `TabDatabaseBackup` e `ImportExportDatabase`: nombre accesible, botón de cierre y texto corregidos, **sin verificación visual** por el mismo motivo. Además, la estructura (círculo, mensaje, acción, cierre) está duplicada en dos componentes: extraer un componente común cuando se revisen esas pantallas.
- Botones de limpiar búsqueda (corregidos en la sesión 4): falta verificarlos visualmente y con teclado en la aplicación, porque `QuickSearch` y las barras laterales dependen del store. Los de las barras laterales siguen siendo `x-button` de Xel; queda comprobar que reciben foco por tabulador dentro de `x-buttons`.
- `SidebarSortButtons`: el nombre accesible ya está; queda verificar el foco y el menú desplegable de Xel dentro del árbol real de la barra lateral.

### Barra de pestañas (prioridad media)

- La fixture monta `CoreTabHeader` y `TabSearch` reales, pero el bloque de acciones reproduce el marcado de `CoreTabs.vue`, que necesita una conexión para montarse. Verificar en la aplicación de escritorio con conexión real, consultas en ejecución (`RunningQueriesIndicator`, ya con estilo `.header-action` desde la sesión 4, sin verificación visual), panel dividido y modo mínimo.
- Con muchas pestañas, estas se reducen al icono sin indicación de que hay más (no hay desplazamiento ni menú de desbordamiento). Ya existía; valorar un desplazamiento horizontal o un menú «más pestañas» además de la búsqueda.
- El «+» ya muestra su atajo en la ayuda (sesión 4). Queda decidir si `tabNew` (`mod+t`, `editable: false` en `src/lib/shortcuts/registry.ts`) debe poder editarse.

### Preferencias y contraste (prioridad media)

- Verificadas la sección Apariencia y el contenedor; faltan Editor, Datos, Conexiones, Atajos, Asistente y Avanzado en ventanas estrechas y con contenido real.
- El suelo de contraste cubre los tokens semánticos (`$text-secondary`, `$text-muted`, `$placeholder-text` y las variantes `*-text` de estado) y las utilidades `.text-*`. En la sesión 4 se pasaron a `*-text` las propiedades `color:` que pintan texto (ver «Hecho»). Siguen sin cubrir: los colores de sintaxis de `vendor/codemirror.scss` (paleta del editor; cambiarlos altera la identidad del tema), las referencias a esos tokens en otras propiedades o en `rgba()`/funciones, y los usos directos de `$text-lighter`, `$brand-*` o `$ink-50` en las hojas heredadas `themes/light`, `themes/solarized-*` y en `detail-view-sidebar.scss`. Revisarlos por pantalla y pasar a los tokens `*-text` donde pinten texto.
- Contraste de iconos y bordes de controles (criterio 1.4.11, 3:1) sin medir.

### Cobertura pendiente (prioridad alta)

- Recorrer conexiones de todos los motores, autenticación, SSL/SSH/IAM y errores de conexión.
- Recorrer editor, resultados, tablas editables, esquema, relaciones, índices, filtros y comparación con datos largos, vacíos, carga, cancelación y error.
- Recorrer importación/exportación, copia de seguridad/restauración y confirmaciones destructivas sin afectar bases reales.
- Recorrer herramientas Redis/documentales y administración con motores disponibles.
- Recorrer búsqueda, historial, consultas guardadas, asistente, atajos, menús, carpetas y gestión de espacios de trabajo.
- Navegación por teclado completa, lector de pantalla y escalado. No declarar conformidad WCAG a partir de revisión de código ni de la prueba de contraste, que mide una muestra de tokens.

## En duda

- **Capa bajo los diálogos.** `ModalOverlayBrush` es negro al 15 % por especificación de Enki (`.docs/tema-diseno-estilo-enki.md`). En `dark` casi no se percibe y el contenido de detrás compite con el diálogo. Recomendación: subir a 35–40 % en temas oscuros y 25 % en claros, como ya hacen las paletas del fork (Abyss, Daylight…). No se ha cambiado porque contradice la especificación escrita.
- **Texto de cuerpo de Solarized (claro).** El tema pinta el cuerpo con `base00` sobre `base2`: 3,64:1, por debajo de 4,5:1. Es el emparejamiento propio de Solarized. Recomendación: usar `base01` para el cuerpo (≈ 4,4:1) y aplicar `enki-readable()` para llegar a 4,5:1, aunque se aleje un poco de la paleta original.
- **Umbral del texto atenuado.** La política del proyecto pide 3:1 a pistas y marcadores de posición; WCAG 2.x pide 4,5:1 a cualquier texto que no esté deshabilitado. Recomendación: mantener 3:1 solo para estados deshabilitados y subir pistas y metadatos a 4,5:1 con un token propio. Afecta a la jerarquía visual de todos los temas, así que no se ha aplicado.
- **Iconos de tipo en los temas heredados.** En `light` las pestañas de consulta llevan el icono en magenta (`$brand-pink: #ff00f0`), y en Solarized en `$smagenta`; en los temas Enki ese token es el acento neutro. Es la codificación por color original de Beekeeper. Recomendación: en `light`, usar el acento del tema (`#0099ff`) o el texto secundario, para que la barra no tenga un único punto de color saturado. No se ha cambiado.
- **Inspector del grafo en lienzos estrechos.** Desde la sesión 5, abrir el inspector (al seleccionar o empezar a arrastrar) ya no reajusta el grafo: la vista queda fija para que nada se mueva bajo el puntero, y solo se desplaza si el nodo seleccionado quedaría tapado. A 600 px el inspector (mínimo 240 px) puede tapar otros nodos, que se recuperan con «Fit graph» o `0`. Recomendación: mantenerlo así. La alternativa (reajustar al abrir) recupera la vista completa pero hace saltar el grafo en cada selección, que era el defecto corregido.
- Ningún cambio de identidad o navegación principal propuesto. Unificar confirmaciones destructivas requiere revisar primero todos los flujos y sus posibilidades de deshacer.

## Hecho

### Sesión 5 — 2026-11-16 (interfaces de grafos y motores compatibles)

Alcance limitado por el usuario a lo modificado en `f85c421` y en el árbol sin confirmar. Criterio de referencia: `.docs/tema-diseno-estilo-enki.md` (esquinas rectas, rampa de tinta, foco distinto de selección, `MotionService`) y los patrones ya pulidos (`.header-action` de la sesión 3, `.segmented` de Preferencias).

**Tarea transversal: controles de las vistas nuevas fuera del sistema.** `ResultsGraph`, el selector de `ResultTable` y `DatabaseTools` introducían un lenguaje propio: radios de 4–20 px (pastillas, segmentado redondeado, caja de buscador), anillo de foco en color de acento y sombras. Además, sus estilos locales reescribían el *hover* de `.btn-flat` con el mismo `ink-05` que ya trae el sistema, así que el puntero no producía ningún cambio, y en `ResultTable` ese *hover* ganaba en especificidad a la pestaña seleccionada y le quitaba el fondo. Se sustituyó por los patrones existentes:

- Selectores de vista (Table / Chart / Graph) y de herramienta (Server activity / Roles and privileges) usan el `.segmented` global: contorno `border-popover`, separadores, selección invertida tinta/fondo y foco de tinta. Es el mismo control de Preferencias.
- «Row details» y las acciones del grafo siguen `.header-action`: transparentes, rectas, *hover* `ink-05`, pulsación y estado activo `ink-10`, foco de tinta a −1 px y transición de 150 ms con la curva del sistema.
- Buscador del grafo como campo del sistema: recto, borde `ink-10`/`ink-20` en *hover*/`ink-50` con foco, sin anillo de acento. Leyenda, estado vacío y aviso flotante «No matching elements» rectos; el aviso flotante usa el panel al 80 % y el borde de popover, como `GraphChipBackgroundBrush`.
- `DatabaseTools` marcaba la herramienta elegida con `inset 0 -2px var(--success)`: el verde de «éxito» como indicador de selección. Pasa a tinta, también en los conmutadores Tree / JSON de `DocumentEditor` que heredan la regla.

**Vista de grafo (`ResultsGraph.vue`, `lib/data/graph.ts`).**

- *Ajuste inicial pobre y etiquetas solapadas.* El layout se calcula en un espacio fijo y no se orientaba respecto al lienzo: la cadena de 4 nodos de la fixture quedaba en columna sobre un lienzo apaisado y se ajustaba al 45–52 %. Como las etiquetas se escalan a la inversa del zoom, se pisaban («FOLLOWS» sobre «KNOWS»). Nuevo `orientLayout`: gira el layout (sin deformarlo) para alinear su eje principal con el lado largo del lienzo; los layouts redondos no se tocan. Mismo caso, ahora al 131 % (900 px) y al 83 % (600 px).
- *Relaciones paralelas.* Se abren en abanico simétrico (antes una iba recta y la otra apenas curvada), con más separación, y su etiqueta sigue la dirección de la relación, nunca boca abajo.
- *El grafo saltaba al seleccionar.* El `ResizeObserver` reajustaba en cada cambio de tamaño, y el inspector lo provoca al abrirse, también al empezar a arrastrar un nodo, que se movía bajo el puntero. Ahora la vista sigue al lienzo solo hasta la primera interacción (zoom, desplazamiento, arrastre o selección). Después se conserva y solo se desplaza lo justo para que el nodo seleccionado no quede tapado.
- *Foco igual que la selección.* Ambos pintaban el mismo borde grueso y, además, el contorno global dibujaba un rectángulo. Ahora: *hover* = borde `ink-50`; foco de teclado = anillo discontinuo de tinta (halo en las relaciones); selección = borde grueso de texto principal.
- *Nodos no devueltos.* Contaban en la leyenda como «Node» y tomaban un color de etiqueta. Ahora son neutros con borde discontinuo y tienen su propia entrada, «Not returned», con explicación en la ayuda emergente.
- *Barra en paneles estrechos.* A 600 px ocupaba tres filas. Con una *container query* (el panel puede ser estrecho en vista dividida aunque la ventana no lo sea), por debajo de 640 px las acciones pasan a icono, conservan el nombre accesible y muestran el texto en `title`, igual que la barra de pestañas. Cabe en una fila.
- *Teclado.* `+`/`=`, `−` y `0` hacen zoom y ajuste con el lienzo enfocado; los botones lo anuncian en su `title`, igual que la línea de ayuda.
- *Microcopy.* Plurales correctos («1 node», «1 match»). La línea de ayuda pasa a lista con iconos y teclas, y deja de depender de separadores «·» que se pegaban al texto.
- `ResultTable`: el `title` de «Row details» explica también el caso sin filas («No rows to inspect»). Los mensajes de carga y error de gráfico y grafo tienen margen y color secundario; antes quedaban pegados al borde.

**Pantalla de conexión.**

- El aviso de requisitos del servicio (RDS, Aurora, DocumentDB, PlanetScale, SingleStore, FerretDB, Memgraph) aparecía debajo de «Environment», separado del selector de tipo que lo provoca. Ahora va justo debajo del tipo.
- Las URLs del aviso (paquete de CA de Amazon RDS) eran texto plano largo que no partía línea. Ahora son enlaces (`ExternalLink`) que pueden partirse (`overflow-wrap: anywhere`).
- `ExternalLink` (componente compartido, 5 usos) era un `<a>` sin `href`: no recibía foco y no se podía abrir con el teclado. Ahora pasa `href`; el clic sigue abriéndose fuera de la aplicación.
- `MysqlForm` y `PostgresForm`: la etiqueta «Authentication Method» apuntaba a `authenticationType`, pero el `select` tenía `id=""`, así que no tenía nombre accesible. Corregido.

### Sesión 4 — 2026-11-15

Solo verificado por compilación, tipos, lint y la suite existente (23 pruebas pasadas, sin pruebas nuevas): los componentes tocados necesitan el store o una conexión.

- **Botones de limpiar.** `QuickSearch`: el `<span>` pasa a botón nativo («Clear search»), visible solo con texto, con foco visible y que devuelve el foco al campo al limpiar. `ConnectionSidebar`, `FavoriteList` y `TableList`: el `x-button` recibe nombre («Clear filter») e icono oculto a lectores de pantalla. Sus campos tienen nombre propio («Filter connections», «Filter saved queries», «Filter tables»).
- **«+» de la barra de pestañas.** La ayuda incluye el atajo del registro («New query tab (Ctrl+T)»).
- **`RunningQueriesIndicator`.** Usa `.header-action` como el resto de herramientas de la barra. En barra estrecha no se compacta a icono: el contador es información de estado.
- **Colores de estado como texto.** Pasan a `$danger-text`, `$success-text` y `$highlight-text`: elementos destructivos del menú contextual y de Xel, fila fallida de la tabla de contraste de Preferencias, error de la barra de estado, `.btn-danger`, texto de las alertas, error de edición de Tabulator y estados de la exportación masiva. Los bordes, rellenos e iconos sueltos (tipos de tabla, clave primaria, icono grande de importación) conservan el color de estado, porque les basta 3:1.
- Sin cambiar (decisión pendiente): desbordamiento de pestañas y los puntos de «En duda».

### Sesión 3 — 2026-11-15

**Barra de pestañas (`CoreTabs.vue`, `TabSearch.vue`, `core-tabs.scss`).** Problemas observados en la captura del usuario:

- El buscador era un `btn` de solo icono que heredaba un ancho mínimo de 88 px y fondo gris, así que se veía como un bloque vacío.
- «SCHEMA» y «DATABASE TOOLS» usaban el estilo de botón (mayúsculas, espaciado ancho, negrita): pesaban más que las pestañas y se confundían con ellas.
- El «+» era un círculo relleno, ajeno al estilo de iconos de contorno. Era un `<a>` sin `href` ni nombre, inalcanzable por teclado, y estaba mezclado con las herramientas.

Cambios:

- **Disposición.** El «+» pasa a ir justo después de la última pestaña, como en los navegadores. Las herramientas globales (consultas en curso, búsqueda, esquema, herramientas de base de datos) se alinean a la derecha. Las pestañas encogen (`min-width: 0`) sin empujar las acciones fuera de la barra.
- **Un único estilo de acción, `.header-action`.** 28 px de alto y centrado vertical, fondo transparente, texto secundario con la tipografía de las pestañas (0,8 rem, peso 500, sin mayúsculas). *Hover* `$ink-05`, activo `$ink-10`, foco con anillo interior. La variante `.icon-only` es un cuadrado de 28 px.
- **Iconos.** Esquema (`account_tree`) y herramientas (`build`) tienen icono. El «+» usa `add` de contorno.
- **Accesibilidad.** Botones nativos. «+» con nombre «New query tab». Se quita el `aria-label` que no coincidía con el texto visible: el nombre es ahora el propio texto (criterio 2.5.3). `title` describe la acción.
- **Barra estrecha.** Mediante *container query* (≤ 640 px de barra, no de ventana, porque depende de la barra lateral y del panel dividido), las herramientas pasan a solo icono. El texto queda oculto visualmente pero sigue siendo el nombre accesible.
- Se conserva la franja de color de conexión (ED-06) bajo la barra; es intencionada.

### Sesión 2 — 2026-11-15

**Tarea transversal: botón de cierre de diálogos.** El mismo control estaba resuelto de tres formas en seis sitios: `<a href="#">` (Preferencias, Columnas, Entidades ocultas, Importar SQL), `<span>` con el clic en el icono —**inalcanzable por teclado**— (Exportar) y `<button>` sin nombre (panel de detalle). Nuevo `DialogCloseButton.vue`: botón nativo, `aria-label` («Close» por defecto, «Close preferences» en Preferencias), icono oculto a lectores de pantalla. Sustituye al control en los cinco diálogos. El panel de detalle conserva su botón, ahora con nombre («Close details»). Los botones de cierre de los diálogos de estado (copia de seguridad, exportación masiva) reciben `type`, nombre y anillo de foco.

**Tarea transversal: suelo de contraste de texto.** Medido en los 14 temas, sobre el fondo de la app y dentro de un diálogo. Antes: `light` —tema claro por defecto del modo sistema— con `.text-success` a 1,70:1, `.text-warning` 2,18, `.text-info` 2,82, `.text-danger` 2,84 y placeholders a 2,59; `solarized` con texto secundario a 2,58; `solarized-dark` con peligro a 2,81; `dark` con atenuado a 2,82 y placeholders a 2,75 (por debajo incluso del 3:1 de la política del proyecto). Solución: nueva función Sass `enki-readable()` (`app/_contrast.scss`) que deja el color intacto si ya cumple y, si no, lo desplaza lo mínimo hacia negro o blanco hasta cumplir sobre **todas** las superficies de texto (app, editor, paneles/diálogos, superficie y barra lateral). Se aplica en `_semantic.scss` a `$text-secondary` (4,5), `$text-muted` (3) y a nuevos tokens `$danger-text`, `$success-text`, `$highlight-text`, `$accent-text` (4,5) y `$placeholder-text` (3, medido sobre el fondo del campo). Las utilidades `.text-*` y los `.text-danger` de los temas heredados usan los tokens de texto. Los colores de estado se mantienen tal cual en rellenos, bordes e iconos. Los temas del fork que ya cumplían no cambian. Las plantillas de temas de usuario lo desactivan (`$enki-enforce-contrast: false`) para no romper la sustitución de la paleta centinela; comprobado en la compilación que conservan `#d93c3d` y `#737b88`. Después: todos los pares medidos ≥ 4,5:1 (texto) y ≥ 3:1 (atenuado y placeholder).

**`AppModal`.** El nombre accesible salía del identificador técnico (`aria-label="column-filter-modal"`). Ahora toma el título visible (`[data-dialog-title]`, `.dialog-c-title` o el primer `h1`–`h3`) mediante `aria-labelledby`; nueva prop `label` para diálogos sin título o cuyo título cambia (Preferencias usa `label="Preferences"`, porque su `h2` es el nombre de la sección activa). El identificador queda solo como último recurso.

**`ColumnFilterModal`.**
- **Fallo funcional:** la búsqueda pasaba el nombre de columna a minúsculas pero no la consulta, así que «ID» no encontraba `id`. Ahora no distingue mayúsculas y recorta espacios.
- El campo tenía como única etiqueta el placeholder «Filter». Ahora es `type="search"` con nombre «Filter columns».
- El «limpiar» era un `<span>` sin acceso por teclado y siempre visible. Ahora es un botón con nombre que solo aparece si hay texto, centrado verticalmente con estados de *hover* y foco.
- La casilla «All» muestra el estado indeterminado cuando hay una selección parcial.
- El estado vacío se anuncia (`role="status"`) y repite la búsqueda: «No columns match “…”».
- Eliminado un bloque comentado muerto.

**`SidebarSortButtons`.** Los dos botones de icono no tenían nombre. Ahora: «Sort order: Ascending/Descending. Toggle order» y «Sort by: <campo>»; iconos ocultos a lectores de pantalla.

**`ExportModal`.**
- Las etiquetas no estaban asociadas a sus campos (`for="fileName"` sin `id`; `for="connectionType"` frente a `id="export-format-select"`; directorio de salida y tamaño de bloque sin relación). Ahora cada etiqueta apunta a su campo.
- «Advanced Options» era un `<div>` clicable. Ahora es un botón con `aria-expanded`/`aria-controls` y foco visible.
- El error usaba una alerta propia. Ahora usa `ErrorAlert` («Export failed»), igual que el resto de la aplicación.

**`DetailViewSidebar`.** Nombres accesibles para cerrar, filtrar campos, limpiar el filtro y el menú de opciones.

**Diálogos de estado (copia de seguridad, exportación masiva).**
- Erratas y texto: «Backup Successful!!» → «Backup completed successfully»; «All Tables Have Been Successfully Exported» → «All tables exported successfully»; «Batch Export Failed.» → «Batch export failed»; «Ok» → «OK»; punto final en el mensaje de código de salida.
- El fallo de la exportación masiva mostraba un «!» de texto; ahora usa el mismo icono `error_outline` que la copia de seguridad.
- El mensaje hace de título accesible del diálogo.

### Sesión 1 — 2026-11-15 (bloque transversal verificado en navegador)

- `FilePicker` usa un botón nativo deshabilitable y permite abrir desde el campo con Enter.
- `ToggleFormArea` usa botón con estado expandido y relación con el contenido. Se sustituye la animación manual de altura por una transición breve de opacidad con altura natural y respeto a movimiento reducido.
- `ErrorAlert` anuncia errores, permite cerrar/copiar con teclado y adapta mensajes largos sin invadir el cierre. El cuerpo usa texto principal para mantener legibilidad en claro; el icono y el borde conservan el significado de error.
- Los modales adaptan su ancho mínimo al viewport, permiten desplazar el contenido y ajustan las filas de acciones.
- Las preferencias muestran navegación horizontal por debajo de 640 px; campos y controles segmentados se adaptan. Los errores de fuente y tamaño se asocian a sus campos y pueden mostrarse a la vez.
- Inventario inicial de componentes y revisión de la infraestructura de temas y pruebas.

## Verificación y evidencias

Sesión 5 (2026-11-16):

- `test:graphs` (`playwright.graphs.config.ts`): **13 pruebas pasadas** (11 anteriores + 2 nuevas). Las nuevas comprueban: zoom inicial ≥ 80 % en la cadena de la fixture; que seleccionar un nodo no mueve el grupo ni el centro del nodo (< 1 px); que el anillo de foco no se ve tras un clic y sí al volver con Esc; zoom con `+` y vuelta al ajuste con `0`; la entrada «Not returned» sin una «Node» espuria; el singular «1 match»; y que a 600 px la barra cabe en una fila, con botones de icono de ≤ 30 px que conservan nombre y `title`, y la ayuda de dirección oculta.
- `test:database-tools`: **7 pruebas pasadas** (6 + 1 nueva). La nueva comprueba que con una sola herramienta no hay selector y el encabezado es el nombre de la herramienta, y que la selección no usa `--success`.
- `test:ui`: **23 pruebas pasadas**, sin regresiones.
- Jest `tests/unit/lib/data/graph.spec.ts`: **12 pruebas pasadas** (10 + 2 nuevas para `orientLayout` y el ángulo legible de las etiquetas).
- `vue-tsc` estricto sin errores. ESLint: 0 errores; los 17 avisos están en líneas no tocadas de `ConnectionInterface.vue` y `PostgresForm.vue`. `git diff --check` señala una línea en blanco final en `src/shared/lib/dialects/nosql.ts` y en `tests/integration/lib/db/clients/compatibleEngines.spec.ts`, de los cambios de motores previos (fuera de esta auditoría).
- Una captura en claro mostraba «Table» en gris: era la transición de 150 ms de la selección invertida, capturada a mitad (`rgba(0,0,0,0.45)`), no un estado. La prueba espera a que termine antes de capturar.
- Sin verificación visual: aviso de motor, `ExternalLink` en Electron y selector de autenticación (ver «Pendiente»).

Capturas inspeccionadas y conservadas:

- [Grafo con inspector, oscuro, 900 px](../resources/ui-ux-audit/graph-dark-900-inspector.png).
- [Grafo con inspector y foco de teclado, oscuro, 600 px](../resources/ui-ux-audit/graph-dark-600-inspector.png).
- [Grafo en panel estrecho, claro, 600 px](../resources/ui-ux-audit/graph-light-600.png).
- [Herramientas de base de datos, oscuro, 1440 px](../resources/ui-ux-audit/database-tools-dark-1440.png).

Sesión 3 (2026-11-15):

- Suite completa: **23 pruebas pasadas**. Las 9 nuevas cubren la barra de pestañas en `dark`/`light` a 1440 px (1 pestaña), 1024 px (3 y 14) y 600 px (4). Comprueban: acciones de 28 px centradas, dentro de la barra y sin solaparse; «+» a ≤ 8 px de la última pestaña; herramientas alineadas a la derecha; paso a solo icono en barra estrecha, conservando el nombre accesible. Otra prueba crea una pestaña y abre la búsqueda solo con teclado.
- Fixture: vista `?view=tabs` (`tests/fixtures/TabHeaderAudit.vue`) con `CoreTabHeader` y `TabSearch` reales; registra el mixin global `ctrlOrCmd` igual que `src-commercial/entrypoints/renderer.ts`.
- ESLint sin errores; los 7 avisos de `CoreTabs.vue` son anteriores y están en líneas no tocadas. `vue-tsc` estricto, `git diff --check` y `vite build` correctos.
- Capturas inspeccionadas: 1 pestaña, 3 pestañas, 14 pestañas (el «+» sigue visible) y 600 px (las cuatro pestañas muestran su título completo al compactarse las herramientas).

Sesión 2 (2026-11-15):

- `yarn workspace beekeeper-studio test:ui` (o `node ../../node_modules/@playwright/test/cli.js test --config playwright.ui.config.ts` desde `apps/studio`): **14 pruebas pasadas** (10 anteriores + 4 nuevas).
- Pruebas nuevas:
  - Nombre accesible de diálogos a partir del título visible y de `label`.
  - Selector de columnas: cierre con Enter y devolución del foco, filtro sin distinción de mayúsculas, estado vacío anunciado, limpiar con teclado, casilla indeterminada y aplicación del cambio.
  - Nombres de los botones de ordenación.
  - **Suelo de contraste en los 14 temas** sobre la app y dentro de un diálogo. Se comprobó que la prueba falla con el suelo desactivado: detecta `light/app/text-success: 1.70`, entre otros.
- La matriz visual añade el selector de columnas filtrado en `dark`/`light` a 1440, 1024, 600 y 360 px, con comprobación de desbordamiento.
- La fixture carga ahora los elementos Xel reales (`@/lib/xelElements`) y el contenedor `#bks-modals`.
- `vue-tsc` (configuración estricta), ESLint de los archivos tocados, `git diff --check` y `vite build`: correctos. La compilación conserva las advertencias previas de `eval` en FlexSearch y de tamaño de chunks.
- Sin verificación visual: `ExportModal` y los diálogos de estado (ver «Pendiente»).

Sesión 1 (2026-11-15):

- Compilación del renderer, `vue-tsc` estricto, ESLint y `git diff --check` correctos; 10 pruebas pasadas.
- Escenarios: selección por Enter, botón deshabilitado, apertura/cierre por Espacio y Enter con movimiento normal/reducido, copia/cierre/reintento de error por teclado, validación simultánea de fuente y tamaño con descripciones accesibles, restitución del foco al cerrar preferencias y acceso a la acción final de un diálogo largo.
- La fixture monta los componentes de producción y sus hojas reales. Aísla portapapeles, diálogo nativo y persistencia de preferencias; no prueba el sistema operativo, una conexión real ni el lector de pantalla. La directiva `kbd-trap` está sustituida por una vacía.

Capturas inspeccionadas y conservadas:

- [Preferencias, oscuro, escritorio](../resources/ui-ux-audit/preferences-dark-1440.png).
- [Preferencias, oscuro, ventana estrecha](../resources/ui-ux-audit/preferences-dark-600.png).
- [Preferencias, claro, prueba de estrés](../resources/ui-ux-audit/preferences-light-360.png).
- [Controles y error legible, claro](../resources/ui-ux-audit/controls-light-600.png).
- [Selector de columnas filtrado, oscuro, 1024 px](../resources/ui-ux-audit/columns-dark-1024.png).
- [Selector de columnas filtrado, claro, prueba de estrés](../resources/ui-ux-audit/columns-light-360.png).
- [Barra de pestañas, oscuro, 760 px, con franja de conexión y *hover*](../resources/ui-ux-audit/tab-bar-dark-760.png). Capturada con el umbral inicial de 760 px; con el definitivo de 640 px, a este ancho las herramientas muestran texto.

Las demás capturas se generan en `apps/studio/test-results/ui-audit/`. No hay comparación automática contra capturas base aprobadas.

## Inventario de pantallas y componentes

Estado inicial al 2026-11-15; actualizado en la sesión 2 del mismo día. Cada componente incluye revisión pendiente de layout, tipografía, contraste, iconos, interacción, movimiento, adaptabilidad, accesibilidad, consistencia, contenido y carga. Los estados no aplicables se deben justificar durante su revisión.

| Componente (ruta desde `apps/studio`) | Estado | Cobertura |
| --- | --- | --- |
| `src/App.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/ConnectionInterface.vue` | Parcial | Aviso de motor recolocado, con enlaces y ajuste de URLs (sesión 5, compilación); resto sin verificación visual |
| `src/components/CoreInterface.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/CoreTabHeader.vue` | Parcial | Montado en la fixture de la barra; menú contextual y estados (sin guardar, error, fijada) sin revisar |
| `src/components/CoreTabs.vue` | Parcial | Barra de pestañas rediseñada y verificada en fixture; resto del componente sin revisar |
| `src/components/Dropzone.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/EmptyComponent.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/GroupedTables.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/LostConnectionModal.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/TabDatabaseBackup.vue` | Parcial | Diálogos de estado: nombre, cierre y texto corregidos; sin verificación visual |
| `src/components/TabImportTable.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/TabQueryEditor.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/TabTableBuilder.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/TabTableProperties.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/Titlebar.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/UtilDiedModal.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/backup/BackupObjects.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/backup/BackupProgress.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/backup/BackupReview.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/backup/BackupSettings.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/BinaryViewer.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/ContextMenu.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/EmptyState.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/ErrorAlert.vue` | Parcial | Bloque transversal verificado en navegador; límites y estados restantes arriba |
| `src/components/common/ExternalLink.vue` | Parcial | `href` para recibir foco (sesión 5, compilación); falta comprobar en Electron |
| `src/components/common/PendingChangesButton.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/SelectionStatistics.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/SettingsInput.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/Sidebar.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/SidebarFolder.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/SidebarLoading.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/SidebarSortButtons.vue` | Parcial | Nombres accesibles verificados en navegador; falta foco y menú en la barra lateral real |
| `src/components/common/StatelessSidebarFolder.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/StatusBar.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/TabWithTable.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/TableIcon.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/TableLength.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/ToggleFormArea.vue` | Parcial | Bloque transversal verificado en navegador; límites y estados restantes arriba |
| `src/components/common/VirtualList.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/WorkspaceAvatar.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/form/ColorPicker.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/form/FilePicker.vue` | Parcial | Bloque transversal verificado en navegador; límites y estados restantes arriba |
| `src/components/common/form/QueryRenameForm.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/loading/ContentPlaceholder.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/loading/ContentPlaceholderHeading.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/loading/ContentPlaceholderImg.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/loading/ContentPlaceholderText.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/loading/LoadingSpinner.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/modals/DialogCloseButton.vue` | Parcial | Nuevo (sesión 2); verificado en navegador en Preferencias y Columnas |
| `src/components/common/modals/AppModal.vue` | Parcial | Nombre accesible desde el título verificado en navegador; faltan modales anidados |
| `src/components/common/modals/ConfirmationModal.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/modals/ConfirmationModalManager.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/modals/LoadingSSOModal.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/modals/RenameDatabaseElementModal.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/modals/SqlFilesImportModal.vue` | Parcial | Cierre unificado (compilación); resto sin verificación visual |
| `src/components/common/texteditor/SQLTextEditor.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/common/texteditor/TextEditor.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/AddDatabaseForm.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/BigQueryForm.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/CassandraForm.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/ClickHouseForm.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/CommonAdvanced.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/CommonIam.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/CommonServerInputs.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/ConnectionFiles.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/DuckDbForm.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/FirebirdForm.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/ImportButton.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/LastSessionCard.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/LibSQLForm.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/MysqlForm.vue` | Parcial | Etiqueta del método de autenticación asociada; selector oculto con una sola opción (sesión 5, compilación) |
| `src/components/connection/NoSqlForm.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/OracleForm.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/PostgresForm.vue` | Parcial | Etiqueta del método de autenticación asociada; selector oculto con una sola opción (sesión 5, compilación) |
| `src/components/connection/RedshiftForm.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/SaveConnectionForm.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/SnapExternalWarning.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/SqlServerForm.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/connection/SqliteForm.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/data/DataManager.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/data/ImportConnectionsModal.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/data/ImportQueriesModal.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/data/WorkspaceSignInModal.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/databaseTools/DatabaseTools.vue` | Pulido | Selector `.segmented`, oculto con una sola herramienta, selección en tinta y motivo de deshabilitado (sesión 5, navegador) |
| `src/components/databaseTools/DocumentEditor.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/databaseTools/DocumentTree.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/databaseTools/RecordsTable.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/databaseTools/RedisBrowser.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/databaseTools/ServerAdministration.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/editor/DiffViewer.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/editor/ExplainViewer.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/editor/MergeManager.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/editor/ProgressBar.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/editor/QueryEditorStatusBar.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/editor/ResultTable.vue` | Parcial | Barra de vistas y «Row details» pulidas y verificadas en navegador (sesión 5); tabla, estadísticas y edición sin revisar |
| `src/components/editor/ResultsGraph.vue` | Pulido | Nuevo en `f85c421`; revisado entero en la sesión 5 (navegador, claro/oscuro, 900/600 px). Quedan mejoras de prioridad baja y el contraste de los rellenos |
| `src/components/editor/ResultsChart.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/editor/RunHistoryModal.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/editor/RunningQueriesIndicator.vue` | Parcial | Estilo `.header-action` (sesión 4, compilación); sin verificación visual |
| `src/components/editor/ShortcutHints.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/export/ExportManager.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/export/ExportModal.vue` | Parcial | Etiquetas, desplegable, cierre y error corregidos; solo compilación y lint |
| `src/components/export/ExportNotification.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/export/forms/ExportFormCSV.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/export/forms/ExportFormJSON.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/export/forms/ExportFormJSONLine.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/export/forms/ExportFormSQL.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/importexportdatabase/ExportConfirmation.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/importexportdatabase/ExportObjects.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/importexportdatabase/ExportOptions.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/importexportdatabase/ExportStatus.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/importexportdatabase/ImportExportDatabase.vue` | Parcial | Diálogos de estado: nombre, cierre y texto corregidos; sin verificación visual |
| `src/components/importtable/ImportFile.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/importtable/ImportMapper.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/importtable/ImportPreview.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/menu/NewAppMenu.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/menu/appmenu/HeaderButton.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/preferences/CustomThemeEditor.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/preferences/FontField.vue` | Parcial | Bloque transversal verificado en navegador; límites y estados restantes arriba |
| `src/components/preferences/PreferencesModal.vue` | Parcial | Bloque transversal verificado en navegador; límites y estados restantes arriba |
| `src/components/preferences/SnippetsEditor.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/preferences/ThemeCard.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/preferences/ThemePicker.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/preferences/sections/AdvancedSection.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/preferences/sections/AppearanceSection.vue` | Parcial | Bloque transversal verificado en navegador; límites y estados restantes arriba |
| `src/components/preferences/sections/AssistantSection.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/preferences/sections/ConnectionsSection.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/preferences/sections/DataSection.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/preferences/sections/EditorSection.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/preferences/sections/ShortcutsSection.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/productivity/AssistantModal.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/productivity/DataSearchModal.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/productivity/ProductivityHost.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/productivity/QueryHistoryModal.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/productivity/SavedQueriesModal.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/quicksearch/QuickSearch.vue` | Parcial | Botón de limpiar accesible (sesión 4, compilación); resto sin verificación visual |
| `src/components/quicksearch/StateManager.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/schema/SchemaCode.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/schema/SchemaDiagram.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/schema/SchemaDiff.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/schema/SchemaDocs.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/schema/SchemaIndexes.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/schema/TabSchema.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/shortcuts/ShortcutKeys.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/shortcuts/ShortcutsSheet.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/sidebar/ConnectionSidebar.vue` | Parcial | Filtro y botón de limpiar con nombre accesible (sesión 4, compilación); resto sin verificación visual |
| `src/components/sidebar/CoreSidebar.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/sidebar/DetailViewSidebar.vue` | Parcial | Nombres accesibles añadidos (compilación); sin verificación visual |
| `src/components/sidebar/GlobalSidebar.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/sidebar/WorkspaceSidebar.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/sidebar/connection/AccountStatusButton.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/sidebar/connection/ConnectionListItem.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/sidebar/connection/NewWorkspaceButton.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/sidebar/connection/StatusBadge.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/sidebar/core/ConnectionButton.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/sidebar/core/CoreAccountButton.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/sidebar/core/DatabaseDropdown.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/sidebar/core/FavoriteList.vue` | Parcial | Filtro y botón de limpiar con nombre accesible (sesión 4, compilación); resto sin verificación visual |
| `src/components/sidebar/core/HiddenEntitiesModal.vue` | Parcial | Cierre unificado (compilación); resto sin verificación visual |
| `src/components/sidebar/core/HistoryList.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/sidebar/core/PinnedTableList.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/sidebar/core/TableList.vue` | Parcial | Filtro y botón de limpiar con nombre accesible (sesión 4, compilación); resto sin verificación visual |
| `src/components/sidebar/core/favorite_list/FavoriteListItem.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/sidebar/core/table_list/Item.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/sidebar/core/table_list/RoutineListItem.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/sidebar/core/table_list/StatelessRoutineListItem.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/sidebar/core/table_list/StatelessTableListItem.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/sidebar/core/table_list/TableListItem.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/sidebar/core/table_list/VirtualTableList.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/stepper/Stepper.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/tab/TabIcon.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/tab/TabSearch.vue` | Parcial | Botón unificado y verificado con teclado; ventana emergente sin revisión visual completa |
| `src/components/tableinfo/TableIndexes.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/tableinfo/TablePartitions.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/tableinfo/TableRelations.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/tableinfo/TableSchema.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/tableinfo/TableTriggers.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/tableview/BatchEditPanel.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/tableview/ColumnFilterModal.vue` | Parcial | Verificado en navegador (teclado, filtro, vacío, selección parcial, 4 anchos × 2 temas); falta uso real desde la tabla |
| `src/components/tableview/DataComparisonModal.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/tableview/EditorModal.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/tableview/FilterPresets.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/tableview/RowFilterBuilder.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/components/tableview/TableTable.vue` | Pendiente | Sesión 5: solo cambió la lógica de columnas editables en grafos, sin efecto visual; sin verificación visual completa |
| `src/components/tableview/filter/BuilderFilter.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/shared/components/SchemaBuilder.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/shared/components/tabulator/CheckboxEditor.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/shared/components/tabulator/CheckboxFormatter.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/shared/components/tabulator/DateTimePickerEditor.vue` | Pendiente | Inventariado; sin verificación visual completa |
| `src/shared/components/tabulator/NullableInputEditor.vue` | Pendiente | Inventariado; sin verificación visual completa |
