# GITDESKTOP-FORK: REPOSITORY GUIDE

## ESPAÑOL DE ESPAÑA: USO OBLIGATORIO DE Ñ

- todo texto en castellano debe usar español de españa (`es-ES`) y su ortografia, tambien en titulos y cuerpos de commits, changelogs, pull requests, merges y documentacion
- escribir siempre `ñ` en las palabras que la llevan y `Ñ` cuando corresponda la mayuscula; nunca sustituirlas por `n` o `N`
- la `ñ` es una letra distinta de la `n`; las instrucciones «sin acentos» o «sin tildes» solo afectan a las tildes de las vocales y nunca permiten eliminar la eñe
- ejemplos correctos: `añadir`, `diseño`, `año`, `tamaño`, `contraseña`, `español`, `españa` y `AÑADIDO`; sus formas con `n` son incorrectas cuando se refieren a esas palabras españolas
- conservar literalmente rutas, urls, nombres de archivo, identificadores tecnicos y texto de otros idiomas; esta regla no autoriza renombrarlos ni aplicar sustituciones indiscriminadas
- antes de entregar o publicar texto en castellano, revisar que ninguna palabra haya perdido su `ñ` o `Ñ`; esta regla prevalece sobre cualquier normalizacion a ascii o instruccion generica de eliminar acentos


customized desktop git client based on github desktop. this guide covers the repository; nested agent instructions apply within their own folders.

## PROJECT OVERVIEW

| property | verified value |
| --- | --- |
| repository | `rezzt-dev/gitdesktop-fork` |
| active source | `gitdesktop-app/` |
| development base for this change | `main` |
| remote default branch | `main` |
| version source | `gitdesktop-app/package.json`: `0.13.5`; `gitdesktop-app/site/package.json`: `0.0.0` |
| continuous integration | `.github/workflows/appimage-check.yml`, `.github/workflows/changelog.yml`, `.github/workflows/frontend.yml`, `.github/workflows/homebrew.yml`, `.github/workflows/quality.yml`, `.github/workflows/release.yml`, `.github/workflows/rust-tests.yml`, `.github/workflows/site-rebuild.yml`, `.github/workflows/site-scheduled-publish.yml`, `.github/workflows/site.yml` |

## TECHNOLOGY STACK

- `gitdesktop-app/package.json`: `react` ^19.3.0, `tailwindcss` ^4.3.3, `typescript` ~6.0.3, `vite` ^8.3.1
- `gitdesktop-app/site/package.json`: `astro` ^7.3.5, `tailwindcss` ^4.3.3, `vite` ^8.2.1

## PROJECT STRUCTURE

- `changelog.md`
- `gitdesktop-app/`
- `license.md`
- `readme.md`
- `scripts/`
- `security.md`

management documentation lives in `.docs/manager.md`, `.docs/-github-guides/` and `.docs/repo-audit-and-fix.md`. keep this file and `claude.md` consistent.

## BUILD, RUN AND TEST COMMANDS

from `gitdesktop-app/`, the available package scripts are:

| command | implementation |
| --- | --- |
| `pnpm run dev` | `vite` |
| `pnpm run build` | `tsc -b && vite build` |
| `pnpm run lint` | `biome check --write ./src/ ./site/` |
| `pnpm run checks` | `node scripts/check-banned-patterns.mjs && node scripts/check-rust-invariants.mjs && node scripts/check-og-cards.mjs && node scripts/check-dead-surface.mjs && node scripts/check-rule-mirrors.mjs && node scripts/check-skill-mirrors.mjs && node scripts/check-tauri-plugin-parity.mjs && node scripts/check-lockfile-dedupe.mjs && node scripts/check-appimage-env-twins.mjs && node scripts/check-enforced-node-suites.mjs && node --test "scripts/*.test.mjs"` |
| `pnpm run preview` | `vite preview` |
| `pnpm run changelog` | `node scripts/changelog-draft.mjs` |
| `pnpm run changelog:preview` | `node scripts/changelog-draft.mjs --preview` |
| `pnpm run changelog:check` | `node scripts/changelog-draft.mjs --check` |
| `pnpm run cold-start` | `powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/cold-start.ps1` |
| `pnpm run cold-start-instance` | `powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/cold-start-instance.ps1` |
| `pnpm run tauri` | `tauri` |
| `pnpm run dev:site` | `pnpm --filter site dev` |
| `pnpm run build:site` | `pnpm --filter site build` |

from `gitdesktop-app/site/`, the available package scripts are:

| command | implementation |
| --- | --- |
| `npm run dev` | `astro dev` |
| `npm run build` | `astro build` |
| `npm run preview` | `astro preview` |

## CODE STYLE AND ARCHITECTURAL DECISIONS

preserve upstream licence and notices, packaging boundaries and credential handling; never use a real working repository as a destructive test fixture. follow the existing formatter and naming of the changed module. verify manifest versions when dependencies change.

## TESTING STRATEGY

documentation-only changes require `git diff --check`, existing-path checks and a review of the staged file list. run module checks for application changes, with disposable data. report unavailable tooling and failed checks; never claim a check passed without running it.

## SECURITY AND DEPLOYMENT

keep credentials, local configuration, signing material and user data out of commits. do not print secret values while auditing. inspect configuration names and code references instead.

existing legal and community files: `license.md`, `security.md`, `.github/support.md`. when changing dependencies, permissions, storage or network services, review those files against the implementation. record missing policies as audit work; do not invent licence terms or ownership decisions.

deployment, signing, store publication, migrations against hosted databases and repository settings require their own explicit request. this documentation task prepares management instructions and pull requests.

## COMMON TASKS

1. read the relevant module and its nearest agent instructions
2. inspect the working tree and choose the smallest change that solves the request
3. update the affected documentation and changelog with evidence from the diff
4. run checks appropriate to the changed module and report their actual results
5. for git operations, follow the manager and the digest below

## EXISTING PROJECT CONVENTIONS

the following project-specific context is retained from the previous guide. paths are relative to the active module when stated. for git operations, the manager and final digest supersede previous workflow examples.

## GITDESKTOP-FORK — AGENT GUIDE

> **gitdesktop-fork** is a personal fork of **gitdesktop** (<https://github.com/theBGuy/GitDesktop>, apache-2.0, by thebguy), a keyboard-first desktop git client built with tauri 2 + react 19. the fork keeps the upstream application, disables and hides every ai feature, and adds its own work: repository folders, batch repository sync, a configurable interface zoom, a refined theme and a local build-and-install script.
>
> **git workflow (commits, prs, merges, releases):** read `.docs/manager.md` first (it is versioned in this repository) and follow the last section of this file ("commit, pr, merge & release guidelines"). never add ai attribution of any kind.

---

## PROJECT OVERVIEW

| property | value |
|----------|-------|
| **repository** | `rezzt-dev/gitdesktop-fork` (public, default branch `main`; an import, not a github fork) |
| **upstream** | `theBGuy/GitDesktop` (`master`); fork based on upstream `0.13.5` (2026-10-15) |
| **app version** | `0.13.5` (`gitdesktop-app/package.json`, `gitdesktop-app/src-tauri/Cargo.toml`); the fork has no tags or releases yet |
| **product name / identifier** | `GitDesktop` / `com.thebguy.gitdesktop` (still the upstream's, see `.docs/repo-audit-and-fix.md`) |
| **licence** | apache-2.0 (`gitdesktop-app/license`, `gitdesktop-app/notice`; `license.md` at the root explains it in spanish) |
| **runtime requirements** | node `>=24`, pnpm `11.18.0` (pinned via `packageManager`), stable rust, tauri 2 platform dependencies, `git` and `gh` on `PATH` |

everything operational (sources, lockfiles, tooling, the app's technical docs) lives in `gitdesktop-app/`; the root only holds the fork's documentation, github configuration and helper scripts. all `pnpm` and `cargo` commands run from `gitdesktop-app/`.

---

## TECHNOLOGY STACK

### FRONTEND (`gitdesktop-app/src/`)
- **react 19** + **typescript ~6.0**, bundled by **vite 8** with the react compiler (`babel-plugin-react-compiler`).
- **tailwind css 4**, shadcn-style primitives in `src/components/ui/` (base ui), `motion`, `sonner`, `vaul`.
- **tanstack query / form / store / virtual**, **zustand** for state, **zod 4** for validation.
- editors and diffs: codemirror (`@uiw/react-codemirror`), `@git-diff-view/*` (patched in `patches/`), shiki and highlight.js, `marked` + `dompurify`, xterm.js for the terminal.
- icons: `@phosphor-icons/react`; font: `@fontsource-variable/jetbrains-mono`.
- still declared but disabled in this fork: `ai`, `@ai-sdk/*`, `@openrouter/ai-sdk-provider`, `ollama-ai-provider-v2`, and `posthog-js` analytics (active only if `VITE_POSTHOG_KEY` is set).

### NATIVE LAYER (`gitdesktop-app/src-tauri/`)
- **tauri 2** (rust 2021), plugins: dialog, http, notification, opener, process, store, updater.
- git runs through the system `git` binary (`src-tauri/src/git/`); github through `gh`, gitlab through `glab` (`src-tauri/src/forge/`, `src-tauri/src/github/`).
- `src-tauri/vendor/portable-pty` is a vendored crate.

### TOOLING
- **biome 2.5** (format + lint, no prettier/eslint), **knip** (dead code), **jscpd** (duplication).
- ten dependency-free node guard scripts in `scripts/check-*.mjs` plus `node --test` suites (`scripts/*.test.mjs`).
- marketing site: **astro 7** workspace package in `gitdesktop-app/site/` (upstream content for `gitdesktop.app`).

---

## PROJECT STRUCTURE

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

## BUILD / RUN / TEST COMMANDS

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

from the root: `./scripts/build-and-install-gitdesktop.sh` runs `pnpm install --frozen-lockfile` and `pnpm tauri build --bundles appimage`, then installs `~/Applications/GitDesktop_0.13.5_amd64_localbuild.AppImage` and links `~/.local/bin/gitdesktop`. without `TAURI_SIGNING_PRIVATE_KEY` tauri exits non-zero after bundling (updater signing); the script tolerates that when the appimage exists. the version in the appimage name is hard-coded: update it when the version changes.

`pnpm release` (interactive: commits, tags and pushes) and `pnpm cold-start*` (powershell) are upstream maintainer tools; do not run `pnpm release` — it pushes.

---

## CODE STYLE GUIDELINES

- **formatting and lint:** biome only (`biome.json`). run `pnpm lint` before committing frontend changes; it rewrites `./src/` and `./site/`.
- **comments:** constraint statements — the decision plus one sentence of why; no narration, no history (see `gitdesktop-app/contributing.md`, *code comments*).
- **frontend invariants** (excerpt of `gitdesktop-app/.claude/rules/frontend.md`, enforced in part by `pnpm checks`): every selectable list gets arrow-key navigation (`src/lib/list-keyboard-nav.ts`); every new action gets a hotkey registry entry (`src/lib/hotkeys/registry.ts`); destructive paths confirm through `useConfirm` / `ConfirmDialogHost`; disabled actions explain why (`DisabledReasonButton`); semantic state tokens, never hard-coded colours; never edit `src/components/ui/` (vendored primitives).
- **rust:** never run a repo-wide `cargo fmt` in `src-tauri`; format only new files with `rustfmt <file>` and never a `mod.rs`.
- **markdown in the fork's own files:** headings in uppercase without accents, content in lowercase with its spelling accents, paths/commands/identifiers literal (`.docs/guidelines/markdown-guidelines.md`). public file names at the root stay lowercase.
- **commit and pr text:** the fork uses the `<prefijo> | <resumen>` format of `.docs/-github-guides/`, not the conventional commits that `gitdesktop-app/contributing.md` and `gitdesktop-app/.gitdesktop/instructions.md` describe for the upstream.

---

## TESTING STRATEGY

| type | location | runner |
|------|----------|--------|
| node suites (pure logic, guards) | `gitdesktop-app/scripts/*.test.mjs` | `node --test` (part of `pnpm checks`) |
| convention guards | `gitdesktop-app/scripts/check-*.mjs` | `pnpm checks` |
| rust unit tests | `#[cfg(test)]` modules in `gitdesktop-app/src-tauri/src/` | `cargo test --manifest-path src-tauri/Cargo.toml` |
| type check | whole frontend | `pnpm build` (`tsc -b`) |
| manual onboarding | `gitdesktop-app/test/sandbox/` | windows sandbox |

- some node suites skip without `node_modules` (`GD_EXPECT_DEPS`); run them after `pnpm install`.
- ci does not run in the fork today (see *deployment notes*): the commands above, run locally, are the only verification. report results from command output, never from memory.

---

## KEY ARCHITECTURAL DECISIONS

1. **app in `gitdesktop-app/`, fork files at the root.** keeps the upstream tree recognisable for future syncs and separates the fork's documentation and automation. upstream references stay out of the operational tree (`raw-project/` is gitignored).
2. **ai disabled, not deleted.** `hideAi` is forced to `true` in `src/lib/settings/api.ts`, ai providers, slash commands, mcp server, automations and agent surfaces are removed from the ui, and the `mcp` command fails explicitly. the dependencies remain to keep upstream syncs small.
3. **git and forges through clis.** typed tauri commands shell out to `git`, `gh` and `glab`; the app never stores tokens (os keychain for secrets, `src-tauri/src/secrets.rs`).
4. **changelog fragments.** app changes add one file in `changelog.d/` so parallel branches never collide; `release:prepare` assembles them. the fork adds a bilingual root `changelog.md` for the full history of the fork (see `.docs/-github-guides/changelog-guide.md`).
5. **repository folders are on-disk folders.** import, move and delete operate on the real filesystem, refuse moves that break git (linked worktrees, submodules, external worktrees) and only delete empty folders (`src-tauri/src/repository_folders.rs`, `src/features/repository-folders/`).

---

## SECURITY CONSIDERATIONS

- **updater points at the upstream.** `src-tauri/tauri.conf.json` → `plugins.updater` uses `theBGuy/GitDesktop` releases and the upstream public key. do not publish fork binaries until it points at the fork (or is disabled).
- **secrets:** `.env` / `.env.*` are gitignored; only `gitdesktop-app/.env.example` (variable names for posthog) is tracked. never commit `TAURI_SIGNING_PRIVATE_KEY`, apple certificates or tokens.
- **git safety for agents:** use read-only git by default (`git --no-pager diff / status / log / show`, `git branch --list`). state-changing git (`add`, `commit`, `checkout`, `push`, `tag`, branch create/delete…) only when the user asks explicitly, as defined in `.docs/manager.md`. agent sessions launched from inside the app follow the stricter upstream whitelist in `gitdesktop-app/.claude/rules/git-safety.md`; `gd/session/*` branches are never deleted.
- **vulnerability reports:** `security.md` (github private advisory). issues that belong to the upstream are also reported to `theBGuy/GitDesktop`.
- never commit `raw-project/`, `node_modules/` or build output (`dist/`, `src-tauri/target/`, `.AppImage`).

---

## COMMON TASKS FOR AGENTS

### ADDING A USER-FACING APP CHANGE
1. implement in `src/` / `src-tauri/` following the frontend invariants above.
2. add `gitdesktop-app/changelog.d/<added|changed|fixed>-<slug>.md` in english (format in `changelog.d/readme.md`) and the bilingual item in the root `changelog.md`.
3. run `pnpm lint`, `pnpm build`, `pnpm checks`, `pnpm changelog:check` and, for rust, `cargo test`.

### ADDING A TAURI COMMAND
1. write it as an async `#[tauri::command]` in `src-tauri/src/` and register it; add the `invoke()` binding in `src/lib/`.
2. `pnpm checks` fails on an unregistered or uncalled command (`check-dead-surface`) and on sync commands (`check-rust-invariants`).

### SYNCING A NEW UPSTREAM VERSION
1. only on explicit request. work in `changes/upstream-<version>` from `main`.
2. keep the fork's changes (ai disabled, folders, sync, zoom, theme, root layout) and the upstream notices.
3. record what came from the upstream in `changelog.md`; merge with a merge commit.

---

## DEPLOYMENT NOTES

- no releases or tags exist yet; the only distribution is the local appimage built by `scripts/build-and-install-gitdesktop.sh`.
- version lives in `gitdesktop-app/package.json` and `gitdesktop-app/src-tauri/Cargo.toml` (`tauri.conf.json` reads it from `package.json`); `pnpm release:prepare <x.y.z>` bumps both.
- **ci:** the ten workflows in `.github/workflows/` are the upstream's: they trigger on `master`, expect the app at the repository root and use upstream secrets, so none has run in the fork. `release.yml` fires on any `v*` tag. adapt or disable them before relying on them (`.docs/repo-audit-and-fix.md`).
- **legal files to touch** when dependencies, stored data, telemetry, the updater or upstream code change: `license.md`, `gitdesktop-app/license`, `gitdesktop-app/notice` (keep the upstream copyright), `gitdesktop-app/privacy.md` (today the upstream's policy) and `security.md`. apache-2.0 requires keeping the upstream notices and stating the files the fork modified.
- `.github/codeowners` and `.github/funding.yml` still name thebguy; `.github/pull_request_template.md` is the upstream's and asks for conventional commits and an ai disclosure — pr text follows `.docs/-github-guides/pr-merge-guide.md` instead.

---

## ADDITIONAL ENTRY-POINT CONVENTIONS

## gitdesktop-fork — claude.md

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

## COMMIT, PR, MERGE & RELEASE GUIDELINES

read `.docs/manager.md` first, then the selected guide in `.docs/-github-guides/`. these files are versioned; this digest also works without opening them.

| request | guide |
| --- | --- |
| commit title, body and changelog | `commit-guide.md`, `changelog-guide.md` |
| pull request or merge | `pr-merge-guide.md`, `branching-guide.md` |
| version and release | `release-guide.md`, `changelog-guide.md` |
| permissions and sensitive data | `agent-rules.md` |

- inspect `git status`, both diffs and recent history before describing changes
- use `<prefix> | <imperative summary>` with `update`, `fix`, `hotfix`, `changes` or `changelog`; keep titles within 72 characters
- write commit bodies as 2 to 6 markdown bullets, one logical change per line, with literal paths in backticks
- never add authorship footers, automated attribution, signatures or generation notices; preserve the configured git identity
- update `changelog.md` under `## SIN PUBLICAR / UNRELEASED` in matching `### CASTELLANO` and `### ENGLISH` sections
- use the existing changelog category vocabulary and preserve language parity; describe only changes in the actual diff
- summarize pull requests in 1 to 3 bullets per category and language, at most 110 characters per bullet
- documentation and repository-management work targets `main`; the remote default is `main`; do not silently promote development work to the default branch
- the authorization for a requested action remains valid throughout that task; creating a pull request includes pushing its branch, but does not authorize merging or publishing
- use merge commits when a merge is requested; never force-push, rewrite published history or remove branches without an explicit instruction
- releases use the approved version and an immutable tag on the verified release commit, with english notes from the closed changelog; do not create a release for documentation work
- deliver requested titles, bodies and changelog fragments in separate code blocks; report executed actions with their commit hash or pull request link
