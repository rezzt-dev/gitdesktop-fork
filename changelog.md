# CHANGELOG

## SIN PUBLICAR / UNRELEASED

### CASTELLANO

#### AÑADIDO
- añadir `.docs/manager.md` y las guias de `.docs/-github-guides/` para commits, pr, merges, releases, changelog y ramas del fork
- añadir `.docs/repo-audit-and-fix.md` con el contexto verificado del fork y el plan de auditoria frente al upstream `theBGuy/GitDesktop`
- añadir `changelog.md` en la raiz como registro bilingue del fork; los cambios de la app siguen en `gitdesktop-app/changelog.d/`
- añadir la tipografia `Space Grotesk` (`@fontsource-variable/space-grotesk`) como fuente principal de la interfaz
- añadir `.docs/tema-diseno-estilo-enki.md` con el lenguaje visual de referencia y `.docs/agent-docs/ui-ux-audit.md` con la auditoria ui/ux en curso

#### CAMBIADO
- exigir español de españa y conservar `ñ` y `Ñ`, incluso en formatos que pidan escribir sin acentos

- aplicar el tema visual enki en `gitdesktop-app/src/App.css`: paleta monocroma, esquinas rectas y tinta sobre fondo en modo claro y oscuro
- renovar la navegacion lateral, la pantalla de bienvenida, los ajustes y el terminal con la regla de 3px en el elemento activo y los nuevos encabezados
- acortar la pantalla de arranque de `gitdesktop-app/index.html` y alinearla con el nuevo fondo
- rehacer `scripts/build-and-install-gitdesktop.sh` con pasos numerados, spinner, log temporal y montaje de `node_modules` en discos sin enlaces simbolicos
- completar las guías de gestión y el contexto específico del proyecto; conservar las reglas técnicas y verificar las rutas
- corregir el ejemplo de promociones entre ramas para evitar destinos idénticos al origen
- rehacer `claude.md` y `agents.md` con la estructura real del fork, la relacion con el upstream y el resumen de las guias
- compilar en `scripts/build-and-install-gitdesktop.sh` con `CARGO_TARGET_DIR` en `~/.cache/gitdesktop-fork/target`, sin artefactos del actualizador y con error si no se genera el AppImage
- pulir la interfaz: logotipo invertido en el tema claro, filas del árbol de carpetas alineadas, reintento ante errores de carga, motivo en los botones deshabilitados de sincronización y atajos reales en los tooltips
- unificar la acción de carpetas como `Import / manage repository folders` y alinear las animaciones con la curva y los 180 ms del tema
- rehacer `.docs/agent-docs/ui-ux-audit.md` con la auditoría real de esta app; la versión anterior describía otro proyecto

#### CORREGIDO
- corregir la `ñ` perdida en `AÑADIDO` y en los items de `changelog.md`
- corregir el recorte de las últimas filas de la lista de repositorios bajo la barra `Recent / Folders`
- restaurar el foco de teclado visible en los raíles de secciones y sustituir el anillo azul del navegador por el contorno de tinta del tema
- llevar el canal de números de los diffs oscuros a las superficies neutras del tema y ocultar el bot de revisiones con ia de gitlab
- igualar el alto de la columna de repositorios de la bienvenida con el de la columna de acciones y hacer que la lista desplace dentro de ella

#### ELIMINADO
- eliminar `gitdesktop-app/src/features/repository/repo-list-sizes.ts`, `gitdesktop-app/src/features/welcome/recent-repo-list-sizes.ts` y su test `gitdesktop-app/scripts/repo-list-sizes.test.mjs`, ya sin uso
- eliminar `.docs/guidelines/commit-guidelines.md` y `.docs/guidelines/pr-merge-release-guidelines.md`, sustituidas por las guias nuevas

### ENGLISH

#### ADDED
- add `.docs/manager.md` and the `.docs/-github-guides/` guides for the fork's commits, prs, merges, releases, changelog and branches
- add `.docs/repo-audit-and-fix.md` with the fork's verified context and the audit plan against the `theBGuy/GitDesktop` upstream
- add a root `changelog.md` as the fork's bilingual record; app changes stay in `gitdesktop-app/changelog.d/`
- add the `Space Grotesk` typeface (`@fontsource-variable/space-grotesk`) as the main interface font
- add `.docs/tema-diseno-estilo-enki.md` with the reference visual language and `.docs/agent-docs/ui-ux-audit.md` with the ongoing ui/ux audit

#### CHANGED
- require spanish from spain and preserve `ñ` and `Ñ`, including formats that omit vowel accents

- apply the enki visual theme in `gitdesktop-app/src/App.css`: monochrome palette, square corners and ink on background in light and dark modes
- renew the side navigation, welcome screen, settings and terminal with the 3px active rule and the new headings
- shorten the startup screen in `gitdesktop-app/index.html` and align it with the new background
- rewrite `scripts/build-and-install-gitdesktop.sh` with numbered steps, spinner, temporary log and `node_modules` mounting on disks without symlinks
- complete repository management guides and project-specific context; preserve technical rules and verify paths
- correct the branch promotion example to avoid destinations identical to the source
- rewrite `claude.md` and `agents.md` with the fork's real layout, the upstream relationship and the guides digest
- build in `scripts/build-and-install-gitdesktop.sh` with `CARGO_TARGET_DIR` at `~/.cache/gitdesktop-fork/target`, without updater artifacts and failing if no AppImage is produced
- polish the interface: inverted app mark in the light theme, aligned folder tree rows, retry on load errors, reasons on the disabled sync buttons and live shortcuts in the tooltips
- unify the folder action as `Import / manage repository folders` and align animations with the theme's curve and 180 ms
- rewrite `.docs/agent-docs/ui-ux-audit.md` with the real audit of this app; the previous version described another project

#### FIXED
- fix the lost `ñ` in `AÑADIDO` and in the items of `changelog.md`
- fix the last repository list rows being clipped under the `Recent / Folders` toolbar
- restore visible keyboard focus on the section rails and replace the browser's blue ring with the theme's ink outline
- move the dark diff gutter onto the theme's neutral surfaces and hide the gitlab ai review bot
- match the welcome repository column's height to the actions column and let the list scroll inside it

#### REMOVED
- remove `gitdesktop-app/src/features/repository/repo-list-sizes.ts`, `gitdesktop-app/src/features/welcome/recent-repo-list-sizes.ts` and their `gitdesktop-app/scripts/repo-list-sizes.test.mjs` test, now unused
- remove `.docs/guidelines/commit-guidelines.md` and `.docs/guidelines/pr-merge-release-guidelines.md`, replaced by the new guides
