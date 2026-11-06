# GUIA DE PULL REQUESTS Y MERGES

> como devolver el titulo y la descripcion de una pull request y de su commit
> de merge, en version sintetizada, para que solo haya que copiar, pegar y
> aceptar. se aplica cada vez que se pida el titulo y la descripcion de una pr
> o de un merge. lee antes `agent-rules.md`: nada de rastro de ia.

---

## 1. PRINCIPIO

la descripcion de una pr o de un merge es un **resumen muy corto** del
changelog, no el changelog entero. el detalle completo vive en
`changelog.md`; la pr solo orienta a quien revisa.

- la fuente es siempre `changelog.md` (seccion `## SIN PUBLICAR / UNRELEASED` o version ya cerrada) y el diff real de la rama.
- minusculas y sin acentos; los encabezados en mayusculas.
- categorias cerradas y en este orden: `ANADIDO`, `CAMBIADO`, `CORREGIDO`, `ELIMINADO`, `SEGURIDAD` (en ingles `ADDED`, `CHANGED`, `FIXED`, `REMOVED`, `SECURITY`). se omite la que no tenga items.
- sin lineas de atribucion ni pies de pagina (ver `agent-rules.md`).
- si la rama toca la app, se comprueba tambien que tiene sus fragmentos en `gitdesktop-app/changelog.d/` (`pnpm changelog:check` desde `gitdesktop-app/`).

---

## 2. LIMITES DE LONGITUD

| tipo | items por categoria | longitud maxima de item |
|---|---|---|
| pr de trabajo normal | 1 a 3 | 110 caracteres |
| pr / merge de version | 2 a 5 | 130 caracteres |

- cada item agrupa varios cambios relacionados en una sola linea ("anadir carpetas de repositorios con importacion y gestion en disco"), nunca uno por fichero.
- se nombran como mucho 2 identificadores por item; el resto se omite.
- los dos idiomas llevan los mismos items en el mismo orden (paridad exacta).

---

## 3. TITULO

### pr de trabajo normal

rama `feature/...`, `fix/...`, `changes/...` o `hotfix/...` hacia `main`. mismo formato que un commit (ver `commit-guide.md`):

```
<prefijo> | <resumen corto en imperativo>
```

si la pr agrupa varios commits, el resumen describe el conjunto.

### pr de version

la que cierra una version: rama `changes/release-<x.y.z>` hacia `main`, con el commit `changelog` y la subida de version (ver `changelog-guide.md`, seccion 5):

```
release version <x.y.z> - <resumen de las 2-3 entradas mas relevantes>
```

ejemplo:

```
release version 0.14.0 - carpetas de repositorios, sincronizacion masiva y retirada de la ia
```

solo hay una pr de version por version: no hay ramas intermedias entre las ramas de trabajo y `main` (ver `branching-guide.md`).

---

## 4. DESCRIPCION

plantilla:

```
### CASTELLANO

#### <categoria>
- <cambio agrupado en una linea>

### ENGLISH

#### <category>
- <same change, one line>
```

ejemplo de pr de version, ya sintetizada:

```
### CASTELLANO

#### ANADIDO
- anadir carpetas de repositorios con importacion, navegacion y gestion en disco
- anadir la sincronizacion masiva de repositorios con progreso por repositorio

#### CAMBIADO
- mover la aplicacion a `gitdesktop-app/` y dejar la documentacion y `.github/` en la raiz
- anadir el zoom de interfaz configurable y refinar el contraste de los temas

#### ELIMINADO
- retirar de la interfaz las funciones de ia, los servidores mcp y las automatizaciones

### ENGLISH

#### ADDED
- add repository folders with import, browsing and on-disk management
- add batch repository sync with per-repository progress

#### CHANGED
- move the application to `gitdesktop-app/` and keep the documentation and `.github/` at the root
- add a configurable interface zoom and refine theme contrast

#### REMOVED
- remove ai features, mcp servers and automations from the interface
```

si la pr solo aporta parte de `## SIN PUBLICAR / UNRELEASED`, la descripcion incluye solo esos items.

---

## 5. COMMIT DE MERGE

- se fusiona siempre con **"create a merge commit"**; nunca squash ni rebase, para conservar el historial de commits.
- github genera la primera linea (`merge pull request #<n> from <rama>`); el titulo y la descripcion del merge son los de la pr, sin cambios.
- si el merge se hace a mano con `git merge --no-ff`, el mensaje usa el mismo titulo y la misma descripcion, sin atribucion.
- el titulo y la descripcion del merge se entregan en dos bloques de codigo separados.

---

## 6. COMO SE ENTREGA

1. una linea de contexto: rama origen, rama destino y numero de commits.
2. bloque de codigo con el titulo.
3. bloque de codigo con la descripcion.
4. si la pr aun no existe y se pide abrirla, el comando exacto (ver abajo), sin ejecutarlo hasta que lo confirmen.

```
gh pr create --base main --head <origen> --title "<titulo>" --body-file <fichero>
```

la descripcion se pasa con `--body-file` para evitar problemas de comillas y saltos de linea.

`.github/pull_request_template.md` es la plantilla del upstream (conventional commits, declaracion de uso de ia); no se usa para el texto de la pr: manda esta guia.

---

## 7. LISTA DE COMPROBACION

- [ ] la rama base es la que indica `branching-guide.md`.
- [ ] se ha mirado `git log <base>..<rama>` y `git diff <base>...<rama>`.
- [ ] el changelog esta actualizado y la descripcion sale de el.
- [ ] ambos idiomas tienen los mismos items.
- [ ] ningun item supera el limite de longitud.
- [ ] no hay atribucion de ia en ningun bloque.
