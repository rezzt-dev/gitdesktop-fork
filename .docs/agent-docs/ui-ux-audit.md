# AUDITORIA UI/UX DE GITDESKTOP-FORK

## RESUMEN

- **última revisión:** 2026-11-18 (sesión 1 de esta auditoría).
- **estado general:** la interfaz es sólida. el upstream trae contratos de accesibilidad, carga y error muy cuidados (guardas en `pnpm run checks`), y el tema enki del fork (`gitdesktop-app/src/App.css`) está bien tokenizado: no hay colores codificados en los componentes salvo los intencionados (estados de archivo, colores de lenguajes, terminal). los defectos encontrados se concentran en las costuras entre el reskin enki y el código existente: foco invisible, especificidad perdida frente a librerías y medidas espejo desactualizadas.
- **documento anterior:** la versión de este fichero introducida en `1e7487a` describía otro proyecto (vue, scss, `CoreTabs`, `ResultsGraph`) y no correspondía a esta app. se ha sustituido; sigue disponible en el historial de git.
- **referencias de diseño:** `.docs/tema-diseno-estilo-enki.md` (lenguaje visual), `gitdesktop-app/src/App.css` (tokens y utilidades `page-title`, `screen-title`, `eyebrow`, `section-title`, `micro-label`, `interactive-row`), `gitdesktop-app/.claude/rules/frontend.md` y la skill `gd-conventions`. la carpeta `.docs/agent-skills/` no existe; las skills de apoyo están en `.docs/skills/` y `gitdesktop-app/.claude/skills/`.

### ALCANCE CUBIERTO EN LA SESION 1

- bienvenida (vacía, con 15 repositorios, desplazada al final), en los temas oscuro, claro y slate y con zoom 100 %, 110 % y 120 %.
- ajustes de la app: las 11 secciones en tema oscuro.
- diálogos de clonar, crear repositorio y carpetas; paleta de comandos; hoja de atajos.
- guía de usuario, explorar repositorios y my work (estados vacíos).
- vista de repositorio: cambios, diff de un archivo (oscuro y claro), historial y popover de notificaciones.
- pantalla global de error (`ErrorBoundary`), vista de forma incidental.
- foco de teclado en la bienvenida y en el raíl de ajustes.

### METODO DE VERIFICACION

la ventana nativa de tauri no se puede manejar desde la sesión (kde wayland ignora la entrada sintética en webkitgtk), así que la verificación visual usa la app real de vite (`http://localhost:1420`) con un sustituto de la ipc de tauri:

- **firefox headless + webdriver bidi** para navegar con ratón y teclado reales.
- **webkitgtk 2.54 fuera de pantalla** (python + `gi`) para comprobar el motor que usa tauri en linux, incluido el zoom nativo con `set_zoom_level`.
- el sustituto de la ipc responde con fixtures (ajustes, repositorios recientes, estado git, diff, historial). los comandos sin fixture devuelven `null`; los estados que dependen de ellos (cuentas, componentes de *about*, lista de explorar) **no** se han evaluado y figuran en «pendiente».
- el arnés vive en el scratchpad de la sesión, no en el repositorio.

## PENDIENTE

### TRANSVERSAL

- **alta — barras de desplazamiento espurias con zoom fraccionario (webkitgtk).** con el zoom por defecto del fork (110 %) o a 120 %, webkit redondea `scrollWidth`/`scrollHeight` 1 px por encima de `clientWidth`/`clientHeight` y base ui (`getHiddenState`, sin tolerancia) muestra barras horizontal y vertical con el *thumb* a ancho completo. reproducido: lista vacía de repositorios a 120 %, `clientWidth` 373 / `scrollWidth` 374. no tiene arreglo solo con css (las variables de desbordamiento viven en el viewport, hermano de la barra). ver «en duda».
- **media — pantalla global de error.** «something went wrong» muestra el mensaje técnico en bruto y solo ofrece *try again* y *reload*; falta una salida a la bienvenida y un texto orientado a la persona usuaria. es código del upstream.
- **media — test de contraste roto por los tokens hex.** `scripts/theme-contrast.test.mjs` falla en 6 casos con «unsupported color --ink: #111111»: el parser no admite hex y los tokens enki lo usan desde `1e7487a`. hoy no protege nada; hay que enseñarle hex al parser y volver a pasarlo.
- **baja — microcopy «could not» frente a «couldn't».** quedan 16 «could not» del upstream frente a 166 «couldn't» (p. ej. `DiffPlaceholder` de stash, discusión, commit). se dejan para no ampliar la divergencia con el upstream; ver «en duda».
- **baja — anchura de los selectores en ajustes.** tema e intervalo de *fetch* usan `max-w-xs`, mientras editor externo y terminal ocupan todo el ancho de la columna.
- **baja — consultas de ia que siguen activas.** `forge_gitlab_review_token_status` se consulta aunque el bloque del bot de ia ya no se muestra; no tiene efecto visual.

### POR PANTALLA

- **media — vista de repositorio, raíl de iconos plegado.** recibe la misma corrección de foco que `NavRail` (`focus-visible:outline-solid` en `RepositoryView.tsx`), comprobada en el código pero sin captura del raíl plegado.
- **media — cuentas, explorar y *about* con datos reales.** sus estados (cuentas conectadas, lista de repositorios del forge, componentes del sistema) dependen de comandos sin fixture.
- **media — vistas sin recorrer.** pull requests, issues, discussions, actions, tags, insights, projects, code todos, findings, ajustes de repositorio, conflictos, rebase interactivo, stash, worktrees, terminal integrado y diálogos de commit. no se han inspeccionado en esta sesión.
- **baja — my work.** el estado vacío escribe `gh auth login` y `glab auth login` en tipografía de texto; ajustes → accounts los muestra en monoespaciada.
- **baja — bienvenida.** el encabezado «repositories» (sans, `text-sm`) no comparte la jerarquía de microetiqueta del «get started» de la columna izquierda; cambiarlo exige actualizar `recent-repo-list-sizes.ts` y su test espejo.
- **baja — terminal.** su paleta oscura es fija (`Terminal.tsx`) por decisión documentada; en slate no sigue el fondo azulado del tema.

## EN DUDA

- **arreglo de las barras espurias (requiere decisión).** opciones:
  1. **recomendada:** un delta sancionado en `src/components/ui/scroll-area.tsx`, inventariado en su `README.md`, en el que el propio `ScrollArea` mida su viewport y no pinte la barra de un eje cuando ese eje desborda 1 px o menos. corrige toda la app de una vez.
  2. bajar el zoom por defecto de 110 % a 100 % (`DEFAULT_SETTINGS.interfaceZoom`). evita el caso por defecto, pero no a quien elija 110 % o 120 %.
  la regla del repo es no editar `src/components/ui/`, así que la opción 1 necesita tu visto bueno.
- **actualizador apuntando al upstream (riesgo de producto).** ajustes → updates promete que la app «se actualiza desde github releases», y en la ventana nativa apareció el punto de actualización disponible en el engranaje. el actualizador apunta a las releases de `theBGuy/GitDesktop` (ver `agents.md`): aceptar la actualización sustituiría el fork por el upstream. recomendación: desactivar la comprobación automática o apuntarla al fork antes de distribuir binarios.
- **unificar microcopy en archivos del upstream.** recomendación: no hacerlo de forma masiva; corregir solo al tocar cada archivo por otro motivo, para no encarecer las sincronizaciones.
- **logotipo con esquinas redondeadas.** el icono de la app conserva su radio mientras toda la interfaz es recta. es un activo de marca y se mantiene; cambiarlo sería una decisión de identidad.

## HECHO

### SESION 1 — 2026-11-18

- **lista de repositorios recortada (bienvenida y selector).** la barra recent / folders que añadió el fork medía 37 px y no estaba en `REPO_LIST_MAX_HEIGHT_PX`, mientras `RepoList` seguía limitado a `max-h-[428px]` con `overflow-hidden`: con muchos repositorios, la última fila (`billing` en la prueba) quedaba inaccesible. la barra pasa a `TOOLBAR_CLASS` con `h-9` en `repo-list-sizes.ts`, se suma a la altura máxima, se quita el tope del contenedor (cada parte interna ya se limita) y `scripts/repo-list-sizes.test.mjs` refleja la barra (25/25). verificado: el borde inferior del viewport coincide con el de la caja (668 = 668) y `billing` es visible al final.
- **foco invisible en los raíles de secciones (accesibilidad).** con tailwind 4, `outline-none` fija `--tw-outline-style: none` y `focus-visible:outline-1` solo cambia el grosor: el foco computado era `outline-style: none`. se añade `focus-visible:outline-solid` en `NavRail.tsx` (ajustes, ajustes de repositorio, guía) y en el raíl de `RepositoryView.tsx`. verificado en `NavRail`: `outline-style` pasa de `none` a `solid`.
- **foco por defecto con la tinta del tema (transversal).** los elementos enfocables sin estilo propio (filas de repositorio, nodos del árbol) mostraban el anillo azul del navegador (`#0060df` en firefox). `App.css` define en `@layer base` un `:focus-visible` con contorno de tinta de 1 px hacia dentro; los componentes con foco propio lo siguen sustituyendo desde la capa de utilidades. verificado en oscuro y claro.
- **canal de números de los diffs en oscuro.** la regla del tema y la oscura de `@git-diff-view` empataban en especificidad (0,3,0) y la librería se importa después, así que en oscuro se veía `#161b22`, el gris azulado de github. el selector pasa a `:root .diff-tailwindcss-wrapper[data-theme] .diff-style-root`. verificado: contexto a `#0d0d0d` y contenido a `#0a0a0a` en oscuro; el claro no cambia (`#f1f1f1` / `#f8f8f8`).
- **bot de revisiones con ia visible con la ia desactivada.** ajustes → accounts → gitlab mostraba «ai review bot» con su formulario de token. se oculta con `useAiEnabled()`, como el resto de superficies de ia. verificado con una búsqueda de textos «ai» en jsx: no quedan otros.
- **logotipo invisible en el tema claro.** el icono es una baldosa clara que desaparecía sobre `#f4f4f4`. `BrandMark` lo invierte en claro (la misma inversión de tinta que la acción principal). verificado en claro, oscuro y slate.
- **iconos duplicados en la bienvenida.** «create repository» e «import / manage folders» compartían `FolderPlusIcon`; la segunda pasa a `FoldersIcon`.
- **atajos literales en tooltips.** «user guide (f1)» estaba escrito a mano; los tooltips de guía y ajustes usan ahora el atajo vigente con `formatBinding`, como exige la convención.
- **árbol de carpetas desalineado.** las filas de repositorio no reservaban el hueco del chevron y su icono y nombre quedaban desplazados respecto a las carpetas del mismo nivel. se reserva el hueco y los iconos decorativos pasan a `aria-hidden`.
- **error del árbol de carpetas sin salida.** «could not load your folders. try refreshing.» no ofrecía cómo refrescar; ahora dice «couldn't load your folders.» con un botón *retry*.
- **botones deshabilitados sin motivo.** *fetch all* y *pull all* usaban `disabled` sin explicación; pasan a `DisabledReasonButton` con el motivo «open or import a repository first», tamaño `icon-sm` cuadrado y el mismo texto en `title` y `aria-label`.
- **terminología de carpetas.** la acción se llamaba «manage repository folders / import folder» en la paleta y en keyboard; ahora es «import / manage repository folders», en línea con la bienvenida. verificado en la paleta.
- **mensajes de zoom.** los dos «could not … interface zoom» del fork pasan a «couldn't», el tono del resto de la app.
- **perfil de movimiento (transversal).** `lib/motion.ts` usaba 200 ms con `easeOut` genérico, mientras el css usa la curva `cubic-bezier(0.33, 1, 0.68, 1)` y 180 ms de entrada. ahora comparten curva y duración.

### COMPROBACIONES EJECUTADAS

- `tsc -b --noEmit`: sin errores.
- `biome check --vcs-enabled=false` sobre los 13 archivos tocados: sin errores. la forma normal falla por configuración: biome busca un `.gitignore` en `gitdesktop-app/` y el repositorio git empieza en la carpeta superior; es previo.
- guardas de `pnpm run checks` (ejecutadas con `node`): 9 de 10 pasan; `check-rule-mirrors` falla sobre `agents.md` (faltan dos centinelas), que no se ha tocado.
- `node --test scripts/*.test.mjs`: 1763 de 1769; los 6 fallos son los de `theme-contrast.test.mjs` descritos en «pendiente», previos a esta sesión.
- `changelog-draft.mjs --check`: 11 fragmentos válidos.

## INVENTARIO DE PANTALLAS Y COMPONENTES

| pantalla o componente | estado | nota |
| --- | --- | --- |
| bienvenida | pulido | lista, iconos, atajos y logotipo corregidos; queda el encabezado de la lista (baja) |
| lista de repositorios (`RepoList`) | pulido | recorte y botones deshabilitados corregidos; barras espurias en duda |
| árbol de carpetas (`FolderTree`) | pulido | alineación y error con reintento |
| diálogo de carpetas (`FolderManager`) | revisado | coherente con los demás diálogos |
| clonar / crear repositorio | revisado | sin defectos visibles con fixtures vacíos |
| paleta de comandos y hoja de atajos | revisado | etiqueta de carpetas unificada |
| ajustes (11 secciones) | revisado | bot de ia oculto y foco del raíl corregido; anchura de selectores pendiente |
| guía de usuario | revisado | raíl compartido, foco corregido |
| explorar / my work | en duda | solo estados vacíos; datos reales pendientes |
| vista de repositorio: cambios y diff | pulido | canal oscuro del diff corregido |
| vista de repositorio: historial | revisado | sin defectos visibles |
| raíl de iconos plegado | pendiente | foco corregido en código, sin captura |
| pantalla global de error | pendiente | copy técnico y sin salida a la bienvenida |
| pull requests, issues, discussions, actions, tags, insights, projects, todos, findings | pendiente | sin recorrer |
| ajustes de repositorio, conflictos, rebase, stash, worktrees, terminal, commit | pendiente | sin recorrer |
