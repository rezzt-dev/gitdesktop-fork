# GUIA DE RAMAS

> ramas del repositorio, flujo de versiones y que rama es la base de cada pull
> request. sirve para decidir el destino de una pr sin tener que preguntarlo.
> el modelo sale del estado real del repositorio (`git branch -a` solo muestra `main` y `origin/main`; `git log --graph` es lineal, con 16 commits directos en `main`, sin merges ni tags), no de las
> guias antiguas, que citaban ramas que aqui no existen.

---

## 1. RAMAS PERMANENTES

| rama | funcion |
|---|---|
| `main` | unica rama permanente y rama por defecto en github; recibe las ramas de trabajo con "create a merge commit"; de aqui salen los tags `v<x.y.z>` |

no hay ramas de integracion (`beta-*`, `version-*`, `develop`, `testing-branch`, `release-branch`). si algun dia se crean, esta guia se actualiza antes de usarlas.

---

## 2. RAMAS DE TRABAJO

nombre en minusculas, con barra y guiones:

| prefijo | uso | ejemplo |
|---|---|---|
| `feature/` | funcionalidad nueva | `feature/batch-sync` |
| `fix/` | correccion de error | `fix/interface-zoom` |
| `changes/` | estructura, tooling, documentacion y cierre de version (`changes/release-<x.y.z>`) | `changes/repo-management-guides` |
| `hotfix/` | urgencia sobre una version publicada | `hotfix/startup-crash` |

- se crean siempre desde `main` actualizada (`git checkout main`, `git pull --ff-only`, `git checkout -b <rama>`).
- una rama, un tema; si el tema crece, se divide.
- una rama de trabajo se borra (local y remota) en cuanto su pr esta fusionada.
- hasta ahora el trabajo se ha hecho con commits directos en `main`, sin pr; a partir de estas guias cada cambio pasa por una rama de trabajo y una pr.
- el upstream `theBGuy/GitDesktop` trabaja en `master` y no hay remoto `upstream` configurado. una actualizacion desde el upstream se hace en una rama `changes/upstream-<version>` hacia `main`, nunca directamente en `main`.

---

## 3. FLUJO DE UNA VERSION

```
feature/* , fix/* , changes/* , hotfix/*   →   main   →   tag v<x.y.z> + release
```

| paso | origen | destino | tipo de pr | titulo |
|---|---|---|---|---|
| 1 | `feature/*`, `fix/*`, `changes/*`, `hotfix/*` | `main` | trabajo normal | `<prefijo> \| <resumen>` |
| 2 | `changes/release-<x.y.z>` | `main` | version | `release version <x.y.z> - <resumen>` |
| 3 | `main` | — | release de github | `v<x.y.z> — <resumen en ingles>` |

- los `hotfix/` salen de `main`, vuelven a `main` y se publican como una version `z` nueva.
- todos los pasos se fusionan con "create a merge commit".
- antes de abrir una pr se comprueba que el destino no tiene commits que la rama no tenga: `git log <origen>..main`. si los tiene, se actualiza la rama primero (`git merge main`; nunca `rebase` sobre una rama ya subida sin orden expresa).
---

## 4. CI

- los workflows de `.github/workflows/` son los del upstream: `quality`, `frontend`, `rust-tests`, `changelog`, `site`, `appimage-check`, `release`, `homebrew`, `site-rebuild` y `site-scheduled-publish`.
- hoy no validan nada util en el fork: los `push` escuchan `master` (aqui es `main`), sus rutas y comandos esperan la app en la raiz (`src/`, `src-tauri/`, `package.json`) y no en `gitdesktop-app/`, y github no tiene ninguna ejecucion registrada.
- hasta que se adapten (ver `repo-audit-and-fix.md`), antes de fusionar se ejecutan en local, desde `gitdesktop-app/`: `pnpm lint` (reescribe con `biome --write`), `pnpm build`, `pnpm checks`, `pnpm changelog:check` y, si se toco rust, `cargo test --manifest-path src-tauri/Cargo.toml`.
- cuando esten adaptados, no se fusiona una pr con `quality`, `frontend`, `rust-tests` o `changelog` en rojo.

---

## 5. LIMPIEZA

tras fusionar una pr de trabajo:

```
git checkout main
git pull --ff-only
git branch -d <rama>
git push origin --delete <rama>
```

`main` nunca se borra.
