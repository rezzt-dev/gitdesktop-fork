# gitdesktop-fork — auditoría y corrección completa del repositorio

> fichero de trabajo para un agente de ia (claude code) que opera en el clon local del fork
> (`gitdesktop-fork/`, aplicación en `gitdesktop-app/`). contiene todo lo necesario para auditar y
> corregir la relación con el upstream, la documentación, los aspectos legales, la higiene del
> repositorio, la ci y la primera release en una sola pasada.
>
> cómo usarlo: abre claude code en la raíz de este repositorio y escribe
> `lee .docs/repo-audit-and-fix.md y ejecútalo de principio a fin`.

---

## 0. PROMPT DE LANZAMIENTO

```text
Eres el agente responsable de dejar el repositorio gitdesktop-fork (fork personal de GitDesktop,
cliente git de escritorio con Tauri 2 + React 19, upstream theBGuy/GitDesktop, Apache-2.0)
profesional, completo y consistente, en inglés y castellano, sin romper la atribución del upstream.
Sigue este documento fase por fase, en orden. No es asesoría legal: todo texto legal que redactes
se marca para revisión de un abogado.

Reglas de ejecución:
1. Fase 1 es de solo lectura. Al terminarla, haz TODAS las preguntas de la sección 3 en una sola
   interacción (AskUserQuestion, agrupadas) y espera. No preguntes nada más después, salvo bloqueo real.
   Lo que no se responda se resuelve con el valor "por defecto" de la sección 3 y se anota como
   TODO(owner) en el informe final.
2. Lee antes `claude.md`, `agents.md`, `.docs/manager.md` y `.docs/-github-guides/`. Son la fuente
   de verdad: si contradicen este documento, gana el repositorio y lo indicas en el informe.
   `gitdesktop-app/contributing.md` y `gitdesktop-app/.gitdesktop/instructions.md` son del upstream:
   sus convenciones (conventional commits) no se aplican a los commits del fork.
3. Nunca ejecutes sin confirmación expresa: push (menos aún forzado), reescritura de historial,
   mover o borrar tags, crear/editar/publicar releases, cambiar ajustes del repo en GitHub,
   cambiar la rama por defecto, añadir el remoto upstream o traer código de él.
   Prepara el comando exacto y lístalo en el informe final.
4. Verifica toda afirmación contra el código, contra GitHub (`gh`) y contra el upstream
   (`gh repo view theBGuy/GitDesktop`, solo lectura). No inventes datos legales, técnicos ni cifras.
   Si falta un dato: `TODO(owner): <qué falta>`.
5. Trabaja en una rama nueva `changes/repo-audit-and-fix` creada desde `main`.
   Commits pequeños y temáticos según la sección 6. Sin push ni PR hasta que yo lo apruebe.
6. Todo documento nuevo o modificado de la raíz debe existir en inglés y en castellano con paridad
   exacta. Los textos heredados del upstream dentro de `gitdesktop-app/` se dejan en inglés.
7. Termina con el informe de la sección 8.
```

---

## 1. CONTEXTO VERIFICADO (a 2026-11-06)

hechos comprobados con `git` y `gh`. el agente debe **re-verificarlos**, no darlos por buenos.

| tema | hallazgo |
|---|---|
| repositorio | `https://github.com/rezzt-dev/gitdesktop-fork`, **público**, `isFork: false` (no es un fork de github: es una importación). rama por defecto `main`. descripción en castellano y minúsculas ("fork del programa \"gitdesktop\", personalizado para el uso diario..."), sin homepage ni topics. |
| upstream | `https://github.com/theBGuy/GitDesktop` (público, rama `master`, licencia apache-2.0 detectada, homepage `https://gitdesktop.app`, última release `v0.13.8` del 2026-11-03). el fork parte de `0.13.5` (`gitdesktop-app/changelog.md`, `## [0.13.5] - 2026-10-15`). no hay remoto `upstream` configurado ni copia en `raw-project/` (ignorada en `.gitignore`). |
| ramas e historial | solo `main` (local y remota). 16 commits lineales y directos, sin merges, sin pr. el primer commit (`01b3fda`) importa todo el árbol del upstream junto con una funcionalidad nueva, sin preservar el historial del upstream. |
| tags / releases | ninguno (`git tag` y `gh release list` vacíos). |
| licencia | `license.md` (raíz, castellano) dice que el fork conserva apache 2.0 y remite a `gitdesktop-app/license` (texto íntegro apache 2.0) y a `gitdesktop-app/notice` ("GitDesktop / Copyright 2026 theBGuy"). github detecta `other` porque el texto completo no está en la raíz. `gitdesktop-app/package.json` declara `"license": "Apache-2.0"`. no hay aviso de modificaciones del fork (apache 2.0, sección 4.b exige indicar los ficheros modificados). |
| marca | el producto se sigue llamando `GitDesktop` (`productName`), con `identifier` `com.thebguy.gitdesktop`. apache 2.0 (sección 6) no concede uso de marcas: revisar nombre e identificador del binario del fork. |
| actualizador | **grave**: `gitdesktop-app/src-tauri/tauri.conf.json` → `plugins.updater.endpoints` apunta a `https://github.com/theBGuy/GitDesktop/releases/latest/download/latest.json` con la `pubkey` del upstream. un binario compilado del fork ofrecería actualizarse a la release del upstream (que reactiva la ia y deshace los cambios del fork). |
| telemetría | dependencia `posthog-js` y `src/lib/analytics/` activos si se define `VITE_POSTHOG_KEY` (`gitdesktop-app/.env.example`). `gitdesktop-app/privacy.md` es la política del upstream: nombra a theBGuy como responsable y su correo; no describe el fork. |
| ia | las funciones de ia están desactivadas (`hideAi: true` forzado en `src/lib/settings/api.ts`), pero siguen las dependencias `@ai-sdk/*`, `ai`, `ollama-ai-provider-v2`, `@openrouter/ai-sdk-provider` y el código de `src-tauri/src/agent.rs`. |
| ficheros de comunidad | raíz: `readme.md`, `license.md`, `security.md`. `.github/`: `support.md`, `pull_request_template.md` (del upstream: pide conventional commits y declarar el uso de ia), `ISSUE_TEMPLATE/`, `codeowners` (`* @theBGuy`), `funding.yml` (`github: [theBGuy]`, `buy_me_a_coffee: theBGuy`). `gitdesktop-app/`: `contributing.md`, `code_of_conduct.md` del upstream. github: salud 71 %, no detecta `code_of_conduct` ni `contributing` (no están en la raíz ni en `.github/`). |
| changelog | dos registros: `gitdesktop-app/changelog.md` (upstream, inglés, keep a changelog, generado por `pnpm release:prepare` desde `gitdesktop-app/changelog.d/`) y `changelog.md` en la raíz (bilingüe, creado con estas guías). el `## [Unreleased]` de `gitdesktop-app/changelog.md` se ha editado a mano: mezcla `### Added` con `### CHANGED`/`### FIXED`/`### REMOVED` y duplica fragmentos que siguen en `changelog.d/` (se duplicarán al ensamblar). varios fragmentos de `changelog.d/` están en castellano y la herramienta espera inglés. |
| versión | `0.13.5` en `gitdesktop-app/package.json` y `gitdesktop-app/src-tauri/Cargo.toml` (heredada); el fork no ha publicado ninguna. `scripts/build-and-install-gitdesktop.sh` fija `GitDesktop_0.13.5_amd64.AppImage` a mano. |
| ci | 10 workflows heredados en `.github/workflows/` (`quality`, `frontend`, `rust-tests`, `changelog`, `site`, `appimage-check`, `release`, `homebrew`, `site-rebuild`, `site-scheduled-publish`). escuchan `master`, esperan la app en la raíz (no en `gitdesktop-app/`) y `gh run list` está vacío. `site-scheduled-publish` tiene un `cron` diario y `homebrew`/`site-rebuild` publican fuera del repo con secretos del upstream. |
| `.docs/` versionado | `.docs/guidelines/markdown-guidelines.md`, las guías nuevas y `.docs/skills/` (214 ficheros de skills de terceros: `frontend-design`, `impeccable`, `shadcn`, `vercel-*`, `web-design-guidelines`, `writing-guidelines`). además, el upstream versiona sus propias skills en `gitdesktop-app/.claude/skills/` y `gitdesktop-app/.agents/skills/`. **revisar licencias** de esas skills; no se propone purga. |
| otros versionados | `.freebuff/project-id` (identificador de una herramienta local), `gitdesktop-app/.mcp.json` (servidores mcp del upstream), `gitdesktop-app/.claude/settings.json`. no se han visto secretos versionados; `.env*` está ignorado salvo `.env.example`. |
| enlaces externos | ningún enlace externo conocido depende de este repo; el código sí depende de recursos del upstream (actualizador, `gitdesktop.app`, `codeowners`, `funding.yml`). |

---

## 2. FASES

### Fase 1 — auditoría (solo lectura)

1. `git fetch --all --tags`; `git log --oneline --graph --decorate --all -n 40`; `gh repo view rezzt-dev/gitdesktop-fork --json visibility,description,homepageUrl,licenseInfo,isFork`.
2. upstream: `gh repo view theBGuy/GitDesktop --json licenseInfo,defaultBranchRef`, `gh release list -R theBGuy/GitDesktop -L 5`. calcula qué versiones del upstream faltan desde `0.13.5` y qué ficheros del fork divergen (sin añadir remotos: compara con un clon temporal fuera del repo si hace falta).
3. inventario de referencias al upstream: `git grep -nI 'theBGuy\|gitdesktop.app\|com.thebguy'` fuera de `pnpm-lock.yaml`; clasifícalas en atribución (se conservan), infraestructura (actualizador, workflows, `codeowners`, `funding.yml`: se adaptan) y contenido de la web `site/`.
4. licencias: dependencias de `gitdesktop-app/package.json` y `gitdesktop-app/src-tauri/Cargo.toml`, fuentes embebidas (`@fontsource-variable/jetbrains-mono`), iconos (`@phosphor-icons/react`), `src-tauri/vendor/`, `patches/`, skills de `.docs/skills/` y `gitdesktop-app/.{claude,agents}/skills/`.
5. privacidad: qué envía `src/lib/analytics/` con y sin `VITE_POSTHOG_KEY`; qué otros servicios contacta la app (`gh`, `glab`, jira, bitbucket, actualizador).
6. secretos y datos personales: `git grep -nIE '(api|secret|token|password)[_-]?key|BEGIN .*PRIVATE|@gmail\.com'`, revisa `.freebuff/`, `.mcp.json`, `.claude/settings.json`.
7. ci: para cada workflow, disparadores, rutas, `working-directory`, secretos que usa y si tiene sentido en el fork.
8. entrega el informe de hallazgos (confirmados / refutados / nuevos) y pasa a la sección 3.

### Fase 2 — relación con el upstream y licencia

- añadir en la raíz `NOTICE` (o completar `license.md`) con: nombre y url del upstream, copyright de theBGuy, texto apache 2.0 íntegro accesible desde la raíz (`LICENSE` copia de `gitdesktop-app/license`, para que github detecte apache-2.0) y aviso de modificaciones del fork con fecha (apache 2.0, 4.b y 4.d).
- decidir nombre del binario y `identifier` (sección 3) y prepararlo sin tocar marcas del upstream en la atribución.
- `codeowners` y `funding.yml`: sustituir por el propietario o eliminar (propuesta, sin ejecutar si se decide conservar).
- documentar en `readme.md` (en y es) qué es el fork, de qué versión parte, qué cambia (ia retirada, carpetas, sincronización masiva, zoom, temas) y cómo se sincroniza con el upstream (`changes/upstream-<version>`).

### Fase 3 — actualizador, telemetría y privacidad

- `plugins.updater`: proponer endpoint y `pubkey` propios (`tauri signer generate`, sin versionar la clave privada) o desactivar el actualizador hasta tener releases del fork. **no publicar ningún binario antes de resolverlo.**
- telemetría: decidir si el fork mantiene `posthog-js`; si no, proponer quitarlo; si sí, `privacy.md` propio del fork (en y es) con responsable, datos, base legal y contacto `contacto@rezzt.dev`.
- `gitdesktop-app/privacy.md` del upstream: conservar como referencia histórica o sustituir; no dejar al responsable del upstream como responsable de los datos del fork.

### Fase 4 — documentos de comunidad (EN + ES, paridad)

| fichero | contenido mínimo |
|---|---|
| `license.md` / `LICENSE` / `NOTICE` | ver fase 2. |
| `security.md` | versiones soportadas (tabla real cuando haya releases), canal privado (github private vulnerability reporting), plazos, alcance (comandos tauri, `gh`, actualizador), vulnerabilidades del upstream: avisar también a theBGuy. |
| `code_of_conduct.md` y `contributing.md` | versión del fork en `.github/` o en la raíz, con las convenciones de `.docs/-github-guides/` (no conventional commits) y el contacto `contacto@rezzt.dev`. |
| `.github/` | `pull_request_template.md` con el formato bilingüe de `pr-merge-guide.md` (sin sección de declaración de ia), plantillas de issue revisadas, `support.md` del fork. |

### Fase 5 — changelog

- limpiar `## [Unreleased]` de `gitdesktop-app/changelog.md`: devolver los items escritos a mano a fragmentos de `gitdesktop-app/changelog.d/` (o al revés) para que `pnpm release:prepare` no los duplique; unificar encabezados a `### Added`/`### Changed`/`### Fixed`/`### Removed`.
- traducir al inglés los fragmentos en castellano de `changelog.d/` y pasar `pnpm changelog:check`.
- completar `changelog.md` de la raíz con los cambios del fork ya hechos (carpetas, sincronización masiva, retirada de la ia, zoom, temas, icono, estructura), comprobando cada uno contra el código.

### Fase 6 — ci

- por cada workflow: adaptar (`branches: [main]`, `defaults.run.working-directory: gitdesktop-app`, rutas `gitdesktop-app/**`) o desactivar. los que publican fuera (`homebrew`, `site-rebuild`, `site-scheduled-publish`) se desactivan salvo decisión contraria.
- `release.yml`: adaptar a `gitdesktop-app/` y al actualizador del fork antes de empujar ningún tag `v*`.
- dependabot (`.github/dependabot.yml`): revisar directorios (`/gitdesktop-app`) y si se quiere mantener.

### Fase 7 — versión y primera release (solo preparar)

1. esquema de versión acordado (sección 3) aplicado en `gitdesktop-app/package.json`, `src-tauri/Cargo.toml`, `Cargo.lock` y `scripts/build-and-install-gitdesktop.sh` (que hoy fija `0.13.5`).
2. texto de release en inglés según `release-guide.md`, con `#### VERIFY`.
3. bundles: compilar con `scripts/build-and-install-gitdesktop.sh` o `pnpm tauri build`, generar `SHA256SUMS`.
4. comandos `gh release create` exactos, sin ejecutarlos.

### Fase 8 — metadatos de GitHub (lista para que los aplique el propietario)

descripción en inglés que diga que es un fork de theBGuy/GitDesktop, topics (`git`, `git-client`, `tauri`, `react`, `fork`), licencia detectable, rama por defecto `main`, private vulnerability reporting, protección de `main`, comandos `gh api` exactos.

---

## 3. DECISIONES A PREGUNTAR (una sola vez, tras la fase 1)

| # | pregunta | por defecto si no hay respuesta |
|---|---|---|
| 1 | esquema de versión del fork | semver propio a partir de `0.14.0`, documentando la versión base del upstream en cada release |
| 2 | nombre e `identifier` del binario | conservar `GitDesktop` en la atribución; binario `GitDesktop Fork` y `identifier` `dev.rezzt.gitdesktop` |
| 3 | actualizador | desactivado hasta tener clave y releases propias |
| 4 | telemetría `posthog-js` | quitarla del fork |
| 5 | workflows heredados | adaptar `quality`, `frontend`, `rust-tests`, `changelog`, `release`; desactivar `homebrew`, `site*`, `appimage-check` hasta revisarlos |
| 6 | `codeowners` y `funding.yml` | sustituir por `@rezzt-dev` y eliminar `funding.yml` |
| 7 | cómo seguir al upstream | sincronizaciones puntuales en `changes/upstream-<version>`, con merge commit, sin remoto permanente |
| 8 | idioma y formato de los docs raíz | `X.md` bilingüe (EN primero, ES después) |
| 9 | `LICENSE` en la raíz | sí: copia íntegra de `gitdesktop-app/license` para que github detecte apache-2.0 |
| 10 | skills de terceros versionadas | conservarlas y revisar su licencia; no purgar |

---

## 4. REGLAS DE ESTILO

- commits, changelog, PR y release: `.docs/-github-guides/`. changelog en minúsculas y sin acentos; fechas `aaaa-mm-dd`.
- documentación y readme de la raíz: castellano e inglés con acentos normales (`.docs/guidelines/markdown-guidelines.md`); mismo orden, mismos títulos traducidos, mismas tablas y cifras.
- nombres de ficheros, rutas, comandos e identificadores entre backticks.
- sin emojis decorativos, sin superlativos de marketing.
- la atribución al upstream no se elimina ni se diluye: el fork deriva de GitDesktop de theBGuy.

---

## 5. COMPROBACIONES (ejecutar y pegar resultados en el informe)

```bash
# enlaces relativos de los markdown de la raíz y de .github
git ls-files '*.md' ':!:**/skills/**' ':!:gitdesktop-app/site/**' | while read f; do grep -oE '\]\((\./|\.\./)?[^)#h][^)]*\)' "$f" \
  | sed -E 's/^\]\(|\)$//' | while read l; do
    [ -e "$(dirname "$f")/$l" ] || echo "ROTO: $f -> $l"; done; done

# acentos en items del changelog raíz (debe salir vacío)
grep -nP '^- .*[áéíóúÁÉÍÓÚ]' changelog.md

# referencias al upstream que no son atribución
git grep -nI 'theBGuy\|com.thebguy\|gitdesktop.app' -- ':!gitdesktop-app/pnpm-lock.yaml' ':!gitdesktop-app/changelog.md'

# verificación del proyecto (desde gitdesktop-app/)
cd gitdesktop-app && pnpm install --frozen-lockfile && pnpm lint && pnpm build && pnpm checks \
  && pnpm changelog:check && cargo test --manifest-path src-tauri/Cargo.toml

# bundle local de linux
./scripts/build-and-install-gitdesktop.sh
```

---

## 6. PLAN DE COMMITS (rama `changes/repo-audit-and-fix`)

orden sugerido; ajusta al estado real del repo.

1. `update | anadir la licencia apache en la raiz y el aviso de modificaciones del fork`
2. `changes | apuntar el actualizador al fork o desactivarlo`
3. `changes | retirar o documentar la telemetria y anadir la politica de privacidad del fork`
4. `update | completar security, code of conduct y contributing del fork en ingles y castellano`
5. `changes | sustituir codeowners, funding y la plantilla de pr del upstream`
6. `changes | adaptar los workflows heredados a main y a gitdesktop-app`
7. `fix | limpiar el changelog de la app y traducir los fragmentos de changelog.d`
8. `update | rehacer el readme bilingue con la relacion con el upstream`
9. `changelog | cerrar la seccion de changelog para la version <x.y.z>`

cada cuerpo: lista `-` de una línea por ítem, qué y por qué. sin líneas de atribución.

---

## 7. DEFINICIÓN DE HECHO

- [ ] ningún hallazgo de la sección 1 queda sin resolver, propuesto o anotado como `TODO(owner)`
- [ ] github detecta apache-2.0 y la raíz enlaza upstream, `NOTICE` y aviso de modificaciones
- [ ] el actualizador no apunta al upstream (o está desactivado)
- [ ] la telemetría y `privacy.md` describen el fork, no el upstream
- [ ] `codeowners`, `funding.yml` y la plantilla de pr son del fork
- [ ] cada workflow está adaptado o desactivado y la ci pasa en una pr de prueba
- [ ] `gitdesktop-app/changelog.md` no tiene items duplicados y `pnpm changelog:check` pasa
- [ ] las comprobaciones de la sección 5 pasan o sus fallos están explicados
- [ ] propuesta de primera release en inglés con bundles y `SHA256SUMS`
- [ ] ninguna acción prohibida de la sección 0 se ha ejecutado sin confirmación

---

## 8. INFORME FINAL (formato de entrega)

1. **resumen**: qué se hizo, en cinco líneas como máximo.
2. **hallazgos**: tabla confirmado / refutado / nuevo, con evidencia (comando o ruta).
3. **ficheros**: creados, modificados y eliminados del índice.
4. **decisiones aplicadas**: las respondidas y las resueltas por defecto.
5. **`TODO(owner)`**: lista numerada de datos que faltan.
6. **para revisión legal**: atribución apache 2.0, marca `GitDesktop`, privacidad y telemetría, licencias de skills.
7. **acciones pendientes de mi confirmación**: comandos exactos (push, PR, tag, release, ajustes de GitHub, workflows).
8. **título y descripción de la PR** en el formato del repositorio, en bloques de código separados.
9. **diferencias con el upstream**: versión base, versiones pendientes de traer y ficheros divergentes.
