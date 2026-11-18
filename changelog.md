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

#### CORREGIDO
- corregir la `ñ` perdida en `AÑADIDO` y en los items de `changelog.md`

#### ELIMINADO
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

#### FIXED
- fix the lost `ñ` in `AÑADIDO` and in the items of `changelog.md`

#### REMOVED
- remove `.docs/guidelines/commit-guidelines.md` and `.docs/guidelines/pr-merge-release-guidelines.md`, replaced by the new guides
