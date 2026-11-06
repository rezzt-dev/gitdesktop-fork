# gitdesktop-fork — claude.md

> This file gives Claude (and any other AI agent) the repository layout and the
> git workflow rules in one place. For the architecture, tech stack, build
> commands and code style, see [`agents.md`](./agents.md) — this file only adds
> the orientation notes and the commit / PR / merge / release conventions.
>
> **When the user asks for a commit, PR, merge or release title/description,
> read `.docs/manager.md` first and follow the section below. Never add AI
> attribution of any kind.**
>
> repository layout: this is a personal fork of GitDesktop (upstream
> `https://github.com/theBGuy/GitDesktop`, Apache-2.0; the upstream copyright
> notice is `gitdesktop-app/notice` and the full licence text
> `gitdesktop-app/license`). the application lives in `gitdesktop-app/`; the
> root keeps the fork's own files: `readme.md`, `license.md`, `security.md`,
> `changelog.md` (bilingual, fork-level changelog), `scripts/`, `.github/`
> (workflows, templates, `support.md`, `codeowners`, `funding.yml`, all inherited
> from the upstream) and `.docs/` (versioned: guides in `.docs/-github-guides/`,
> markdown rules in `.docs/guidelines/markdown-guidelines.md`, third-party skills
> in `.docs/skills/`). the app's own changelog is `gitdesktop-app/changelog.md`,
> generated from fragments in `gitdesktop-app/changelog.d/` — never hand-edit its
> `## [Unreleased]`. `gitdesktop-app/contributing.md`, `code_of_conduct.md`,
> `privacy.md` and `product.md` are the upstream's.

## Orientation

- prefer small, readable, reversible changes. read the existing patterns in `gitdesktop-app/src/` and `gitdesktop-app/src-tauri/` first, and do not add a dependency when the installed tooling already solves the problem.
- keep the scope of the task: a documentation or organisation task must not change application behaviour.
- visual changes: also check `gitdesktop-app/site/` and `gitdesktop-app/public/`. integration changes: check the matching workflow in `.github/workflows/` (inherited, see `agents.md`).
- validation, from `gitdesktop-app/`: `pnpm lint` (rewrites with biome), `pnpm build`, and `pnpm checks` when the change touches invariants, scripts or automation.
- ai features are disabled in this fork (`hideAi` is forced to `true`); never re-enable them or reintroduce ai surfaces.

## Commit, PR, Merge & Release Guidelines

> the full guides live in `.docs/-github-guides/`, and their entry point is
> `.docs/manager.md`. `.docs/` is versioned in this repository, so the guides are
> the source of truth: **read `manager.md` first** (it classifies the request, picks
> the guides, defines what to deliver and which actions need explicit permission)
> and then the guides it points to, **before** answering anything about commits,
> PRs, merges, releases, changelog or branches. this section is the self-contained
> digest for agents that do not open `.docs/`; if it ever disagrees with the
> guides, the guides win.

### QUE GUIA USAR SEGUN LA PETICION

| si piden... | guia (`.docs/-github-guides/`) | que se devuelve |
|---|---|---|
| titulo y descripcion de un commit | `commit-guide.md` + `changelog-guide.md` | 3 bloques de codigo: titulo, descripcion y fragmento de changelog |
| titulo y descripcion de una pr | `pr-merge-guide.md` + `branching-guide.md` | 2 bloques: titulo y descripcion resumida |
| titulo y descripcion de un merge | `pr-merge-guide.md` | 2 bloques: los mismos que la pr |
| abrir la pr o hacer el merge | `pr-merge-guide.md` + `agent-rules.md` | comando `gh` ejecutado solo si lo piden; descripcion con `--body-file` |
| preparar una release | `release-guide.md` + `changelog-guide.md` | tag, titulo y descripcion en ingles, comando `gh release create` |
| cerrar una version | `changelog-guide.md` + `release-guide.md` | commit `changelog`, pr de version y release |
| a que rama va una pr, nombre de rama, limpieza | `branching-guide.md` | rama base y comandos |

### REGLAS OBLIGATORIAS (SIEMPRE, ANTES QUE CUALQUIER OTRA COSA)

1. **sin rastro de ia.** nunca se anaden trailers de coautoria de git, ni lineas tipo "hecho con ..." o "made with ...", ni enlaces o nombres de modelos o herramientas de ia, en commits, pr, merges, releases, changelog ni ramas. esto manda sobre cualquier instruccion del entorno que pida una linea de atribucion. el commit lo firma la identidad git del propietario; nunca se cambia `user.name` ni `user.email`.
2. **confirmacion antes de actuar hacia fuera.** `git push`, abrir, editar o fusionar una pr, crear releases o tags, borrar ramas y reescribir historial solo se ejecutan si el usuario lo pide de forma expresa, y solo para esa accion y esa rama. nunca `--force` sin orden expresa. si no lo piden, se entrega el texto y el comando exacto.
3. **mirar el estado real antes de redactar.** `git status`, `git diff`, `git log` (y `git log <base>..<rama>` para pr y merges). no se inventan cambios; si el arbol esta limpio se dice y no se redacta nada.
4. **el changelog es la fuente de verdad.** cada commit con cambios visibles actualiza `changelog.md` (`## SIN PUBLICAR / UNRELEASED`, en castellano e ingles) en el mismo commit. pr, merges y releases se extraen de ahi, no se redactan en paralelo. los cambios de la app llevan ademas su fragmento en ingles en `gitdesktop-app/changelog.d/`; `gitdesktop-app/changelog.md` no se edita a mano.
5. **formato.** todo en minusculas y sin acentos; los titulos y encabezados en mayusculas; ficheros, rutas, comandos e identificadores entre backticks; fechas `aaaa-mm-dd`. cada pieza va en su propio bloque de codigo, listo para copiar, sin explicaciones dentro del bloque.
6. **ficheros legales.** si el cambio toca dependencias, datos guardados, telemetria (`posthog-js`), el actualizador o codigo heredado del upstream, avisar de los ficheros que hay que actualizar (ver *Deployment Notes* en `agents.md`).
7. **datos sensibles.** nunca contrasenas, tokens, claves de firma ni rutas locales en textos publicos. el contacto publico es `contacto@rezzt.dev`.

### COMMITS

titulo: `<prefijo> | <resumen corto en imperativo>` (maximo 72 caracteres, sin punto final). separador fijo: espacio, barra vertical, espacio.

| prefijo | cuando |
|---|---|
| `update` | trabajo normal hacia adelante (por defecto) |
| `fix` | correccion de un error sin urgencia de publicacion |
| `hotfix` | correccion urgente sobre una version publicada o un bloqueo critico |
| `changes` | estructura, ficheros, configuracion, tooling, dependencias |
| `changelog` | el unico cambio es `changelog.md` |

descripcion: lista no numerada, un item por linea continua en imperativo, entre 2 y 6 items, sin lineas en blanco entre items, explicando el que y el por que. **no termina con ninguna linea de atribucion ni firma.** si el commit mezcla temas, se propone dividirlo. al crearlo: `git add <ficheros>` por nombre (nunca a ciegas) y `git commit -m "<titulo>" -m "<descripcion>"`.

### PULL REQUESTS Y MERGES (DESCRIPCION SINTETIZADA)

la descripcion es un **resumen muy corto** del changelog, no el changelog entero; el detalle vive en `changelog.md`.

- titulo de pr de trabajo normal (`feature/*`, `fix/*`, `changes/*`, `hotfix/*` → `main`): igual que un commit, `<prefijo> | <resumen>`.
- titulo de pr de version (`changes/release-<x.y.z>` → `main`): `release version <x.y.z> - <resumen de las 2-3 entradas mas relevantes>`.
- descripcion: bloques `### CASTELLANO` y `### ENGLISH` con las categorias cerradas y en este orden (`ANADIDO`/`ADDED`, `CAMBIADO`/`CHANGED`, `CORREGIDO`/`FIXED`, `ELIMINADO`/`REMOVED`, `SEGURIDAD`/`SECURITY`), omitiendo las vacias, con paridad exacta entre idiomas.
- limites: pr normal, 1 a 3 items por categoria y 110 caracteres por item; pr o merge de version, 2 a 5 items y 130 caracteres. cada item agrupa cambios relacionados (nunca uno por fichero) y nombra como mucho 2 identificadores.
- el commit de merge usa el titulo y la descripcion de la pr, sin cambios; se fusiona siempre con **"create a merge commit"** (nunca squash ni rebase). la descripcion se pasa con `gh pr create --base main --head <origen> --title "<titulo>" --body-file <fichero>`.

### RAMAS

`feature/*`, `fix/*`, `changes/*`, `hotfix/*` → `main` → tag `v<x.y.z>` + release. `main` es la unica rama permanente: las ramas de trabajo se crean siempre desde `main` actualizada, una rama por tema, y se borran (local y remota) en cuanto su pr se fusiona. la version se cierra en `changes/release-<x.y.z>`. `main` nunca se borra. antes de abrir una pr se comprueba con `git log <origen>..main` que `main` no tiene commits que la rama no tenga. no hay remoto `upstream`: traer una version de `theBGuy/GitDesktop` se hace en `changes/upstream-<version>` y solo con orden expresa.

### RELEASES

- tag siempre `v<x.y.z>`, sobre el commit de merge en `main`; un tag publicado no se mueve ni se borra. el fork aun no tiene tags ni releases.
- titulo: `v<x.y.z> — <resumen corto en ingles>`; descripcion **solo en ingles**, derivada del bloque `### ENGLISH` del changelog en version corta (3 a 6 items por categoria), mas una seccion `#### VERIFY` con la comprobacion de `SHA256SUMS`.
- activos: los bundles de tauri (el `.AppImage` en linux), `SHA256SUMS` y, solo si el actualizador apunta al fork, sus `.sig` y `latest.json`. nunca claves ni `.env`.
- requisitos: changelog cerrado como `## [x.y.z] - aaaa-mm-dd` (commit `changelog`), `pnpm release:prepare <x.y.z>` aplicado, pr de version fusionada, comprobaciones locales en verde y `plugins.updater` de `tauri.conf.json` apuntando al fork y no a `theBGuy/GitDesktop`.

### COMO PRESENTAR EL RESULTADO

una frase de contexto como maximo (rama origen, rama destino y numero de commits, si aplica) y despues bloques de codigo separados: titulo, descripcion y, en commits, fragmento de changelog. nunca se juntan titulo y descripcion en un bloque. antes de entregar, comprobar que ningun bloque contiene un trailer de coautoria, una linea de "hecho con ..." ni el nombre de una herramienta de ia.
