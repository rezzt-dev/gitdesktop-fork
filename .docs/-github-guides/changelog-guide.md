# GUIA DEL CHANGELOG

> como se escribe y se cierra `changelog.md`. es la fuente de verdad
> de commits, pull requests, merges y releases: nada se redacta en paralelo,
> todo se extrae de aqui.
>
> este repositorio tiene dos registros de cambios con alcances distintos:
>
> - `changelog.md` (raiz, el de esta guia): bilingue y completo. recoge todos los
>   cambios del fork (app, documentacion, guias, `.github/`, `scripts/`, estructura)
>   y es la fuente de commits, pr, merges y releases.
> - `gitdesktop-app/changelog.md`: changelog heredado del upstream, en ingles y con
>   formato keep a changelog. viaja dentro de la app (cuerpo de la release y "what's
>   new" del actualizador) y no se edita a mano: cada cambio visible de la app anade
>   un fragmento en `gitdesktop-app/changelog.d/` y `pnpm release:prepare <x.y.z>`
>   los ensambla al cerrar la version.
>
> motivo: las herramientas heredadas (`pnpm changelog:check`, `release:prepare`,
> `scripts/changelog-extract.mjs` en `release.yml`) solo entienden el formato ingles
> de keep a changelog y solo cambios de la app; meter alli items bilingues o de
> gestion del repositorio romperia esas herramientas y los mostraria dentro de la app.

---

## 1. ESTRUCTURA

```
# CHANGELOG

## SIN PUBLICAR / UNRELEASED

## [x.y.z] - aaaa-mm-dd

### CASTELLANO

#### ANADIDO
- <cambio>

### ENGLISH

#### ADDED
- <change>
```

- la seccion `## SIN PUBLICAR / UNRELEASED` esta siempre arriba y recoge lo que aun no se ha publicado.
- las versiones cerradas van de la mas reciente a la mas antigua.
- cada version lleva `### CASTELLANO` y `### ENGLISH` con paridad exacta de items.

---

## 2. CATEGORIAS (CERRADAS Y EN ESTE ORDEN)

| castellano | english | que va |
|---|---|---|
| `ANADIDO` | `ADDED` | funcionalidades, ficheros o documentos nuevos |
| `CAMBIADO` | `CHANGED` | cambios en comportamiento, estructura o documentacion existente |
| `CORREGIDO` | `FIXED` | errores corregidos |
| `ELIMINADO` | `REMOVED` | codigo, ficheros o funciones retirados |
| `SEGURIDAD` | `SECURITY` | correcciones o endurecimiento con impacto de seguridad |

se omite la categoria que no tenga items. no se crean otras.

los fragmentos de `gitdesktop-app/changelog.d/` usan sus propias categorias (`added`, `changed`, `fixed`) y van en ingles; no se mezclan con estas.

---

## 3. REGLAS DE ESTILO

- minusculas y sin acentos en el contenido; titulos y encabezados en mayusculas.
- un item por linea, en imperativo ("anadir", "corregir", "mover"), empezando por `-`.
- ficheros, rutas, comandos e identificadores entre backticks.
- explica el efecto visible o el motivo, no el detalle de implementacion linea a linea.
- sin menciones a herramientas de ia ni a quien escribio el item.
- los fragmentos de `gitdesktop-app/changelog.d/` siguen `gitdesktop-app/changelog.d/readme.md` (ingles, frase completa para personas), no estas reglas.

---

## 4. CUANDO SE ACTUALIZA

1. **en cada commit** con cambios visibles: se anaden los items a `## SIN PUBLICAR / UNRELEASED`, en los dos idiomas, en el mismo commit.
2. **al preparar una pr o un merge**: se comprueba que el changelog cubre todo el diff; si falta algo, se anade antes de abrirla.
3. **al cerrar una version**: ver seccion 5.
4. **si el cambio es de la app** (`gitdesktop-app/src/`, `gitdesktop-app/src-tauri/`): ademas del item bilingue aqui, se anade su fragmento en `gitdesktop-app/changelog.d/` y se valida con `pnpm changelog:check` desde `gitdesktop-app/`.

---

## 5. CERRAR UNA VERSION

1. comprobar que `## SIN PUBLICAR / UNRELEASED` esta completo y con paridad entre idiomas.
2. renombrarlo a `## [x.y.z] - aaaa-mm-dd` (fecha de cierre) y dejar debajo una seccion `## SIN PUBLICAR / UNRELEASED` vacia.
3. subir la version con `pnpm release:prepare <x.y.z>` desde `gitdesktop-app/`: ensambla `gitdesktop-app/changelog.d/` en `gitdesktop-app/changelog.md`, sube `version` en `package.json` y `src-tauri/Cargo.toml` y borra los fragmentos consumidos (se revisa `Cargo.lock`). no se usa `pnpm release`, que ademas hace commit, tag y push.
4. commit con prefijo `changelog`, en la rama `changes/release-<x.y.z>`:

```
changelog | cerrar la seccion de changelog para la version <x.y.z>
```

5. abrir la pr de version (ver `pr-merge-guide.md`) y, al fusionar en `main`, crear la release (ver `release-guide.md`).

---

## 6. NUMERACION

- la version vive en `gitdesktop-app/package.json` (`version`) y `gitdesktop-app/src-tauri/Cargo.toml`; hoy vale `0.13.5`, heredada del upstream, y el fork no ha publicado ninguna.
- esquema semver `x.y.z` como el upstream: `x` cambia con rupturas grandes; `y` con funcionalidades nuevas; `z` con correcciones.
- como distinguir las versiones del fork de las del upstream (numeracion propia o sufijo) esta pendiente de decision del propietario (`repo-audit-and-fix.md`, seccion 3); hasta entonces no se cierra ninguna version.
- un numero de version publicado no se reutiliza.

---

## 7. LISTA DE COMPROBACION

- [ ] los dos idiomas tienen los mismos items.
- [ ] solo hay categorias de la lista cerrada.
- [ ] ningun item queda sin backticks en identificadores.
- [ ] la fecha de la version cerrada usa `aaaa-mm-dd`.
- [ ] no hay atribucion de ia.
