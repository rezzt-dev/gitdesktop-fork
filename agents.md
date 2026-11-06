# gitdesktop-fork — Agent Guide

> **gitdesktop-fork** is a personal fork of **GitDesktop** (<https://github.com/theBGuy/GitDesktop>, Apache-2.0, by theBGuy), a keyboard-first desktop Git client built with Tauri 2 + React 19. The fork keeps the upstream application, disables and hides every AI feature, and adds its own work: repository folders, batch repository sync, a configurable interface zoom, a refined theme and a local build-and-install script.
>
> **Git workflow (commits, PRs, merges, releases):** read `.docs/manager.md` first (it is versioned in this repository) and follow the last section of this file ("Commit, PR, Merge & Release Guidelines"). Never add AI attribution of any kind.

---

## Project Overview

| Property | Value |
|----------|-------|
| **Repository** | `rezzt-dev/gitdesktop-fork` (public, default branch `main`; an import, not a GitHub fork) |
| **Upstream** | `theBGuy/GitDesktop` (`master`); fork based on upstream `0.13.5` (2026-10-15) |
| **App version** | `0.13.5` (`gitdesktop-app/package.json`, `gitdesktop-app/src-tauri/Cargo.toml`); the fork has no tags or releases yet |
| **Product name / identifier** | `GitDesktop` / `com.thebguy.gitdesktop` (still the upstream's, see `.docs/repo-audit-and-fix.md`) |
| **Licence** | Apache-2.0 (`gitdesktop-app/license`, `gitdesktop-app/notice`; `license.md` at the root explains it in Spanish) |
| **Runtime requirements** | Node `>=24`, pnpm `11.18.0` (pinned via `packageManager`), stable Rust, Tauri 2 platform dependencies, `git` and `gh` on `PATH` |

Everything operational (sources, lockfiles, tooling, the app's technical docs) lives in `gitdesktop-app/`; the root only holds the fork's documentation, GitHub configuration and helper scripts. All `pnpm` and `cargo` commands run from `gitdesktop-app/`.

---

## Technology Stack

### Frontend (`gitdesktop-app/src/`)
- **React 19** + **TypeScript ~6.0**, bundled by **Vite 8** with the React compiler (`babel-plugin-react-compiler`).
- **Tailwind CSS 4**, shadcn-style primitives in `src/components/ui/` (Base UI), `motion`, `sonner`, `vaul`.
- **TanStack Query / Form / Store / Virtual**, **Zustand** for state, **Zod 4** for validation.
- Editors and diffs: CodeMirror (`@uiw/react-codemirror`), `@git-diff-view/*` (patched in `patches/`), Shiki and highlight.js, `marked` + `dompurify`, xterm.js for the terminal.
- Icons: `@phosphor-icons/react`; font: `@fontsource-variable/jetbrains-mono`.
- Still declared but disabled in this fork: `ai`, `@ai-sdk/*`, `@openrouter/ai-sdk-provider`, `ollama-ai-provider-v2`, and `posthog-js` analytics (active only if `VITE_POSTHOG_KEY` is set).

### Native layer (`gitdesktop-app/src-tauri/`)
- **Tauri 2** (Rust 2021), plugins: dialog, http, notification, opener, process, store, updater.
- Git runs through the system `git` binary (`src-tauri/src/git/`); GitHub through `gh`, GitLab through `glab` (`src-tauri/src/forge/`, `src-tauri/src/github/`).
- `src-tauri/vendor/portable-pty` is a vendored crate.

### Tooling
- **Biome 2.5** (format + lint, no Prettier/ESLint), **knip** (dead code), **jscpd** (duplication).
- Ten dependency-free Node guard scripts in `scripts/check-*.mjs` plus `node --test` suites (`scripts/*.test.mjs`).
- Marketing site: **Astro 7** workspace package in `gitdesktop-app/site/` (upstream content for `gitdesktop.app`).

---

## Project Structure

```
gitdesktop-fork/
├── readme.md · license.md · security.md   # fork documentation (Spanish)
├── changelog.md                            # fork-level, bilingual changelog (source for PRs/releases)
├── claude.md · agents.md                   # agent guides (this file)
├── .docs/                                  # versioned
│   ├── manager.md                          # entry point for git/GitHub requests
│   ├── repo-audit-and-fix.md               # one-pass audit plan for this fork
│   ├── -github-guides/                     # commit, pr/merge, release, changelog, branching guides
│   ├── guidelines/markdown-guidelines.md   # markdown formatting rules
│   └── skills/                             # third-party agent skills (licences to review)
├── .github/                                # inherited from the upstream
│   ├── workflows/                          # quality, frontend, rust-tests, changelog, site, release, ...
│   ├── actions/ · scripts/                 # pin-linuxdeploy, AppImage guard/smoke, rust canonicalizer
│   ├── ISSUE_TEMPLATE/ · pull_request_template.md · support.md
│   └── codeowners · funding.yml · dependabot.yml   # still point at theBGuy
├── scripts/
│   └── build-and-install-gitdesktop.sh     # builds the Linux AppImage and installs ~/.local/bin/gitdesktop
├── .freebuff/project-id                    # local tool identifier
└── gitdesktop-app/                         # the application (upstream tree)
    ├── package.json · pnpm-lock.yaml · pnpm-workspace.yaml · patches/
    ├── biome.json · knip.jsonc · .jscpd.json · tsconfig*.json · vite.config.ts · index.html
    ├── changelog.md                        # in-app changelog (Keep a Changelog, generated)
    ├── changelog.d/                        # one fragment per app change, assembled at release
    ├── license · notice · privacy.md · product.md · contributing.md · code_of_conduct.md · troubleshooting.md
    ├── src/
    │   ├── main.tsx · App.tsx
    │   ├── components/                     # shared components; components/ui/ = vendored primitives (do not edit)
    │   ├── features/                       # screens: repository, commit, diff, history, pulls, issues, settings, repository-folders, ...
    │   └── lib/                            # invoke bindings + query hooks (git/, github/, gitlab/, bitbucket/, jira/), settings, hotkeys
    ├── src-tauri/
    │   ├── src/                            # commands: git/, github/, forge/, repository_folders.rs, secrets.rs, tray.rs, pty.rs, ...
    │   ├── capabilities/default.json · tauri.conf.json · Cargo.toml · Cargo.lock · icons/ · vendor/
    ├── scripts/                            # check-*.mjs guards, changelog-*.mjs, release.mjs, *.test.mjs, cold-start*.ps1
    ├── site/                               # Astro marketing site (pnpm workspace package)
    ├── public/                             # favicon.svg, icons.svg
    ├── test/sandbox/                       # Windows Sandbox onboarding (onboarding.wsb, setup.ps1)
    ├── .claude/ · .agents/                 # upstream agent rules and skills (mirrored; checked by check-skill-mirrors)
    └── .gitdesktop/                        # upstream repo instructions (Conventional Commits) and aiignore
```

---

## Build / Run / Test Commands

```bash
cd gitdesktop-app
pnpm install --frozen-lockfile   # install exactly what pnpm-lock.yaml says
pnpm tauri dev                   # run the app with hot reload
pnpm dev                         # frontend only (Vite)
pnpm build                       # tsc -b + vite build
pnpm lint                        # biome check --write ./src ./site  (REWRITES files)
pnpm exec biome check ./src/     # check-only form
pnpm checks                      # the ten guard scripts + node --test scripts/*.test.mjs
cargo test --manifest-path src-tauri/Cargo.toml   # Rust unit tests
pnpm tauri build --bundles appimage               # Linux AppImage
pnpm dev:site / pnpm build:site                   # Astro site
pnpm changelog:preview / changelog:check          # pending changelog fragments
pnpm release:prepare <x.y.z>     # assemble changelog.d/, bump package.json + Cargo.toml (maintainers)
```

From the root: `./scripts/build-and-install-gitdesktop.sh` runs `pnpm install --frozen-lockfile` and `pnpm tauri build --bundles appimage`, then installs `~/Applications/GitDesktop_0.13.5_amd64_localbuild.AppImage` and links `~/.local/bin/gitdesktop`. Without `TAURI_SIGNING_PRIVATE_KEY` Tauri exits non-zero after bundling (updater signing); the script tolerates that when the AppImage exists. The version in the AppImage name is hard-coded: update it when the version changes.

`pnpm release` (interactive: commits, tags and pushes) and `pnpm cold-start*` (PowerShell) are upstream maintainer tools; do not run `pnpm release` — it pushes.

---

## Code Style Guidelines

- **Formatting and lint:** Biome only (`biome.json`). Run `pnpm lint` before committing frontend changes; it rewrites `./src/` and `./site/`.
- **Comments:** constraint statements — the decision plus one sentence of why; no narration, no history (see `gitdesktop-app/contributing.md`, *Code comments*).
- **Frontend invariants** (excerpt of `gitdesktop-app/.claude/rules/frontend.md`, enforced in part by `pnpm checks`): every selectable list gets arrow-key navigation (`src/lib/list-keyboard-nav.ts`); every new action gets a hotkey registry entry (`src/lib/hotkeys/registry.ts`); destructive paths confirm through `useConfirm` / `ConfirmDialogHost`; disabled actions explain why (`DisabledReasonButton`); semantic state tokens, never hard-coded colours; never edit `src/components/ui/` (vendored primitives).
- **Rust:** never run a repo-wide `cargo fmt` in `src-tauri`; format only new files with `rustfmt <file>` and never a `mod.rs`.
- **Markdown in the fork's own files:** headings in uppercase without accents, content in lowercase with its spelling accents, paths/commands/identifiers literal (`.docs/guidelines/markdown-guidelines.md`). Public file names at the root stay lowercase.
- **Commit and PR text:** the fork uses the `<prefijo> | <resumen>` format of `.docs/-github-guides/`, not the Conventional Commits that `gitdesktop-app/contributing.md` and `gitdesktop-app/.gitdesktop/instructions.md` describe for the upstream.

---

## Testing Strategy

| Type | Location | Runner |
|------|----------|--------|
| Node suites (pure logic, guards) | `gitdesktop-app/scripts/*.test.mjs` | `node --test` (part of `pnpm checks`) |
| Convention guards | `gitdesktop-app/scripts/check-*.mjs` | `pnpm checks` |
| Rust unit tests | `#[cfg(test)]` modules in `gitdesktop-app/src-tauri/src/` | `cargo test --manifest-path src-tauri/Cargo.toml` |
| Type check | whole frontend | `pnpm build` (`tsc -b`) |
| Manual onboarding | `gitdesktop-app/test/sandbox/` | Windows Sandbox |

- Some node suites skip without `node_modules` (`GD_EXPECT_DEPS`); run them after `pnpm install`.
- CI does not run in the fork today (see *Deployment Notes*): the commands above, run locally, are the only verification. Report results from command output, never from memory.

---

## Key Architectural Decisions

1. **App in `gitdesktop-app/`, fork files at the root.** Keeps the upstream tree recognisable for future syncs and separates the fork's documentation and automation. Upstream references stay out of the operational tree (`raw-project/` is gitignored).
2. **AI disabled, not deleted.** `hideAi` is forced to `true` in `src/lib/settings/api.ts`, AI providers, slash commands, MCP server, automations and agent surfaces are removed from the UI, and the `mcp` command fails explicitly. The dependencies remain to keep upstream syncs small.
3. **Git and forges through CLIs.** Typed Tauri commands shell out to `git`, `gh` and `glab`; the app never stores tokens (OS keychain for secrets, `src-tauri/src/secrets.rs`).
4. **Changelog fragments.** App changes add one file in `changelog.d/` so parallel branches never collide; `release:prepare` assembles them. The fork adds a bilingual root `changelog.md` for the full history of the fork (see `.docs/-github-guides/changelog-guide.md`).
5. **Repository folders are on-disk folders.** Import, move and delete operate on the real filesystem, refuse moves that break Git (linked worktrees, submodules, external worktrees) and only delete empty folders (`src-tauri/src/repository_folders.rs`, `src/features/repository-folders/`).

---

## Security Considerations

- **Updater points at the upstream.** `src-tauri/tauri.conf.json` → `plugins.updater` uses `theBGuy/GitDesktop` releases and the upstream public key. Do not publish fork binaries until it points at the fork (or is disabled).
- **Secrets:** `.env` / `.env.*` are gitignored; only `gitdesktop-app/.env.example` (variable names for PostHog) is tracked. Never commit `TAURI_SIGNING_PRIVATE_KEY`, Apple certificates or tokens.
- **Git safety for agents:** use read-only git by default (`git --no-pager diff / status / log / show`, `git branch --list`). State-changing git (`add`, `commit`, `checkout`, `push`, `tag`, branch create/delete…) only when the user asks explicitly, as defined in `.docs/manager.md`. Agent sessions launched from inside the app follow the stricter upstream whitelist in `gitdesktop-app/.claude/rules/git-safety.md`; `gd/session/*` branches are never deleted.
- **Vulnerability reports:** `security.md` (GitHub private advisory). Issues that belong to the upstream are also reported to `theBGuy/GitDesktop`.
- Never commit `raw-project/`, `node_modules/` or build output (`dist/`, `src-tauri/target/`, `.AppImage`).

---

## Common Tasks for Agents

### Adding a user-facing app change
1. Implement in `src/` / `src-tauri/` following the frontend invariants above.
2. Add `gitdesktop-app/changelog.d/<added|changed|fixed>-<slug>.md` in English (format in `changelog.d/readme.md`) and the bilingual item in the root `changelog.md`.
3. Run `pnpm lint`, `pnpm build`, `pnpm checks`, `pnpm changelog:check` and, for Rust, `cargo test`.

### Adding a Tauri command
1. Write it as an async `#[tauri::command]` in `src-tauri/src/` and register it; add the `invoke()` binding in `src/lib/`.
2. `pnpm checks` fails on an unregistered or uncalled command (`check-dead-surface`) and on sync commands (`check-rust-invariants`).

### Syncing a new upstream version
1. Only on explicit request. Work in `changes/upstream-<version>` from `main`.
2. Keep the fork's changes (AI disabled, folders, sync, zoom, theme, root layout) and the upstream notices.
3. Record what came from the upstream in `changelog.md`; merge with a merge commit.

---

## Deployment Notes

- No releases or tags exist yet; the only distribution is the local AppImage built by `scripts/build-and-install-gitdesktop.sh`.
- Version lives in `gitdesktop-app/package.json` and `gitdesktop-app/src-tauri/Cargo.toml` (`tauri.conf.json` reads it from `package.json`); `pnpm release:prepare <x.y.z>` bumps both.
- **CI:** the ten workflows in `.github/workflows/` are the upstream's: they trigger on `master`, expect the app at the repository root and use upstream secrets, so none has run in the fork. `release.yml` fires on any `v*` tag. Adapt or disable them before relying on them (`.docs/repo-audit-and-fix.md`).
- **Legal files to touch** when dependencies, stored data, telemetry, the updater or upstream code change: `license.md`, `gitdesktop-app/license`, `gitdesktop-app/notice` (keep the upstream copyright), `gitdesktop-app/privacy.md` (today the upstream's policy) and `security.md`. Apache-2.0 requires keeping the upstream notices and stating the files the fork modified.
- `.github/codeowners` and `.github/funding.yml` still name theBGuy; `.github/pull_request_template.md` is the upstream's and asks for Conventional Commits and an AI disclosure — PR text follows `.docs/-github-guides/pr-merge-guide.md` instead.

---

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
