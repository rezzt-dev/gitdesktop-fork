# GITDESKTOP FORK

un cliente de escritorio para git, basado en gitdesktop y preparado para una
experiencia de desarrollo más limpia, local y personalizable.

## SOBRE ESTE FORK

este repositorio mantiene la base funcional de gitdesktop y añade una
organización propia para facilitar el mantenimiento, la revisión y la
distribución del proyecto.

la aplicación funciona en windows, macos y linux. incluye integración con
repositorios git, ramas, cambios, historial y pull requests. las funciones de
inteligencia artificial están desactivadas y ocultas en este fork, incluidas las
automatizaciones basadas en IA.

## ESTRUCTURA

- `gitdesktop-app/src/` contiene la interfaz y la lógica de la aplicación.
- `gitdesktop-app/src-tauri/` contiene la capa nativa basada en tauri.
- `gitdesktop-app/site/` contiene el sitio web y su contenido público.
- `gitdesktop-app/scripts/` contiene comprobaciones, tareas de desarrollo y
  automatización.
- `.github/` contiene las plantillas y los flujos de trabajo del repositorio.
- `.docs/guidelines/` contiene las normas de documentación y colaboración.
- la referencia del proyecto base se mantiene separada del árbol operativo y
  de la instalación de dependencias.

## INSTALACION

necesitas node.js 24 o posterior, pnpm 11, git y las herramientas de tauri 2.

entra en la carpeta de la aplicación antes de instalar dependencias:

```sh
cd gitdesktop-app
pnpm install
pnpm dev
```

para generar una compilación de producción:

```sh
pnpm build
```

para ejecutar el sitio:

```sh
pnpm dev:site
```

## CALIDAD Y CONTRIBUCIONES

antes de enviar cambios, ejecuta las comprobaciones disponibles y revisa las
guías de [`.docs/guidelines/`](.docs/guidelines/). los cambios visibles para
usuarios deben incluir una entrada en `changelog.d/` siguiendo el formato del
proyecto.

las contribuciones deben ser pequeñas, trazables y enfocadas. usa la plantilla
de pull request de [`.github/pull_request_template.md`](.github/pull_request_template.md)
y consulta [`contributing.md`](gitdesktop-app/contributing.md).

## SEGURIDAD Y LICENCIA

consulta [`security.md`](security.md) para informar de vulnerabilidades y
[`license.md`](license.md) para conocer la licencia de este fork.

## AGRADECIMIENTOS

este trabajo parte del proyecto original gitdesktop. se mantienen sus avisos,
licencia y atribuciones, mientras que la estructura del repositorio y la
documentación pública se han adaptado para este fork.
