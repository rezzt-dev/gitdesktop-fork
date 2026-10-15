# CONTEXTO DEL PROYECTO

gitdesktop fork es una aplicación de escritorio multiplataforma para trabajar
con repositorios git. la interfaz usa react y la capa nativa usa tauri 2.

## ORIENTACION

prioriza cambios pequeños, legibles y reversibles. revisa primero los patrones
existentes en `src/` y `src-tauri/`, y no introduzcas una dependencia nueva si
la funcionalidad puede resolverse con las herramientas ya instaladas.

para cambios visuales revisa también `site/` y los recursos de `public/`. para
cambios de integración, comprueba los flujos correspondientes en `.github/`.

## VALIDACION

usa `pnpm lint` para el código, `pnpm build` para validar la aplicación y
`pnpm checks` cuando el cambio afecte a invariantes, scripts o automatizaciones.
