# GUIA DE RELEASES

> como preparar el titulo, la descripcion y el tag de una release de github.
> se aplica cuando una pr de version ya esta fusionada en `main`. lee antes
> `agent-rules.md`: la release no lleva ningun rastro de ia.
> el fork aun no ha publicado ninguna release ni tag (`gh release list` y
> `git tag` vacios); esta guia define como hacerlo la primera vez.

---

## 1. REQUISITOS PREVIOS

1. `changelog.md` tiene la version cerrada como `## [x.y.z] - aaaa-mm-dd` (ver `changelog-guide.md`) y `gitdesktop-app/changelog.md` tiene la misma version ensamblada con `pnpm release:prepare <x.y.z>`.
2. la pr de version (`changes/release-<x.y.z>` → `main`) esta fusionada con "create a merge commit".
3. `version` vale `x.y.z` en `gitdesktop-app/package.json` y en `gitdesktop-app/src-tauri/Cargo.toml` (y `Cargo.lock` esta sincronizado); `tauri.conf.json` lee la version de `package.json`.
4. `plugins.updater` de `gitdesktop-app/src-tauri/tauri.conf.json` (`endpoints` y `pubkey`) apunta a las releases del fork y a una clave del propietario, no a `theBGuy/GitDesktop`. si no, no se publica nada: los binarios del fork se actualizarian solos a los del upstream.
5. las comprobaciones de `branching-guide.md`, seccion 4, estan en verde sobre el commit que se va a etiquetar.

---

## 2. TAG

- siempre `v<x.y.z>`, mismo numero que la cabecera del changelog, sin sufijos extra (ejemplo: `v0.14.0`).
- se crea sobre el commit de merge en `main`, nunca sobre una rama de trabajo.
- no se mueve ni se borra un tag ya publicado; si hay un error, se publica una version nueva.

```
git tag -a v<x.y.z> -m "v<x.y.z>"
git push origin v<x.y.z>
```

el workflow heredado `release.yml` se dispara con cualquier tag `v*`; mientras no este adaptado al fork, empujar un tag lanza un build que fallara o usara secretos que no existen (ver `repo-audit-and-fix.md`).

---

## 3. TITULO

```
v<x.y.z> — <resumen corto en ingles>
```

- en ingles, minusculas y sin acentos; resume las 2-3 entradas mas relevantes.
- ejemplo: `v0.14.0 — repository folders, batch sync & ai features removed`.

---

## 4. DESCRIPCION

- **solo en ingles**: la release es la cara publica del proyecto.
- reutiliza el bloque `### ENGLISH` de la version cerrada, con sus encabezados `####` en mayusculas, pero en version corta: de 3 a 6 items por categoria, agrupando cambios relacionados (misma regla de sintesis que `pr-merge-guide.md`, seccion 2).
- se omite la categoria sin items; no se reordenan las categorias.
- cierra con una seccion de verificacion:

```
#### VERIFY

- download the bundle for your platform and `SHA256SUMS` from the assets
- check the checksum with `sha256sum -c SHA256SUMS`
```

- sin lineas de atribucion ni enlaces a herramientas de ia.

---

## 5. ACTIVOS

- los bundles que genera tauri (`bundle.targets: "all"`): en linux, el `.AppImage` (en local lo genera `scripts/build-and-install-gitdesktop.sh` en `gitdesktop-app/src-tauri/target/release/bundle/appimage/`), y los instaladores de windows y macos si se compilan; sus `.sig` y `latest.json` solo si el actualizador apunta al fork; y `SHA256SUMS`.
- nada mas: sin `TAURI_SIGNING_PRIVATE_KEY`, sin `.env`, sin certificados.
- no hay pre-releases definidas; una version de prueba se publica con `--prerelease`.

---

## 6. COMANDO

```
gh release create v<x.y.z> <bundles> SHA256SUMS --title "<titulo>" --notes-file <fichero>
```

se entrega el comando sin ejecutar; publicar una release es visible para todos y exige confirmacion (ver `agent-rules.md`).

---

## 7. LISTA DE COMPROBACION

- [ ] el tag coincide con la cabecera de `changelog.md` y con `version` de `gitdesktop-app/package.json`.
- [ ] titulo y descripcion estan en ingles.
- [ ] los items salen del bloque `### ENGLISH` del changelog.
- [ ] los bundles y `SHA256SUMS` corresponden a la misma compilacion.
- [ ] el actualizador apunta al fork, no al upstream.
- [ ] no hay atribucion de ia ni datos sensibles.
