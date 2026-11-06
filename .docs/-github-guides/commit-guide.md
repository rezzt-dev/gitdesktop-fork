# GUIA DE COMMITS

> como redactar el titulo y la descripcion de un commit. se aplica siempre que
> se pida algo equivalente a "sacame el titulo y la descripcion del commit con
> los cambios desde el ultimo commit" y cada vez que se vaya a crear un commit.
> lee antes `agent-rules.md`: el commit no lleva ningun rastro de ia.

---

## 1. TITULO

```
<prefijo> | <resumen corto en imperativo>
```

- separador fijo: espacio, barra vertical, espacio.
- maximo 72 caracteres; sin punto final; todo en minusculas y sin acentos.
- el resumen describe el conjunto del commit, no un fichero concreto.

### prefijos (cerrados, no se inventan otros)

| prefijo | cuando usarlo |
|---|---|
| `update` | trabajo normal hacia adelante: anade o mejora funcionalidad, contenido o documentacion. es el prefijo por defecto |
| `fix` | corrige un error detectado durante el desarrollo, sin urgencia de publicacion |
| `hotfix` | corrige algo urgente que afecta a una version ya publicada o bloquea el trabajo |
| `changes` | cambios estructurales o no funcionales: mover o renombrar ficheros, configuracion, tooling, dependencias |
| `changelog` | el unico proposito del commit es editar `changelog.md` |

si un commit mezcla un fix y una mejora, se divide en dos. si no es posible, gana el prefijo del cambio principal.

el historial del upstream usa conventional commits (`feat(scope): ...`); en este fork no se usan.

### ejemplos

```
update | anadir la sincronizacion masiva de repositorios
fix | aplicar y guardar el zoom de interfaz al instante
hotfix | evitar el cierre al abrir un repositorio sin rama actual
changes | mover la aplicacion a gitdesktop-app y dejar la documentacion en la raiz
changelog | cerrar la seccion de changelog para la version 0.14.0
```

---

## 2. DESCRIPCION

- lista de markdown no numerada: cada item empieza por `-`; nunca parrafos sueltos ni listas numeradas.
- cada item es una sola linea continua en imperativo, sin saltos internos y sin lineas en blanco entre items.
- explica el que y el por que, no el detalle linea a linea.
- entre 2 y 6 items; si hacen falta mas, el commit es demasiado grande.
- ficheros, rutas, comandos e identificadores siempre entre backticks.
- no termina con ninguna linea de atribucion, firma ni trailer de coautoria (ver `agent-rules.md`).

ejemplo:

```
- anadir `repository_folder_scan` para importar una jerarquia de carpetas sin copiar ni mover ficheros
- rechazar en `repository_folder_move` los movimientos que romperian worktrees o submodulos
- anadir el fragmento `gitdesktop-app/changelog.d/added-repository-folders.md` para las notas de la app
```

---

## 3. CHANGELOG

todo commit con cambios visibles para usuarios o desarrolladores actualiza `changelog.md` en el mismo commit, dentro de `## SIN PUBLICAR / UNRELEASED`, en castellano e ingles. las reglas estan en `changelog-guide.md`. solo se exceptuan los commits `changelog` (que ya son el cambio) y los que no tocan nada publicable (por ejemplo, ajustes de `.gitignore` locales).

si el commit cambia la app (`gitdesktop-app/src/`, `gitdesktop-app/src-tauri/`), ademas anade su fragmento en ingles en `gitdesktop-app/changelog.d/` (`<added|changed|fixed>-<slug>.md`, ver `gitdesktop-app/changelog.d/readme.md`); los cambios de documentacion, guias o `site/` no llevan fragmento.

---

## 4. COMO SE ENTREGA

tres bloques separados, en este orden:

1. titulo del commit.
2. descripcion del commit.
3. fragmento de changelog que se anade (bloque `### CASTELLANO` y bloque `### ENGLISH`, solo con los items nuevos).

nunca se juntan el titulo y la descripcion en el mismo bloque.

---

## 5. COMANDO

si se pide crear el commit, se usa un archivo temporal o dos `-m` (titulo y descripcion), sin plantillas ni pies automaticos:

```
git add <ficheros>
git commit -m "<titulo>" -m "<descripcion>"
```

se anaden los ficheros por nombre, nunca `git add -A` a ciegas; se comprueba antes con `git status` que no entran ficheros ignorados, claves ni artefactos de compilacion (`node_modules/`, `gitdesktop-app/dist/`, `gitdesktop-app/src-tauri/target/`, `.AppImage`).

---

## 6. LISTA DE COMPROBACION

- [ ] el prefijo es uno de los cinco.
- [ ] el titulo cabe en 72 caracteres y esta en imperativo.
- [ ] cada item ocupa una sola linea y empieza por `-`.
- [ ] el changelog esta actualizado en los dos idiomas.
- [ ] no hay atribucion de ia ni trailer de coautoria.
