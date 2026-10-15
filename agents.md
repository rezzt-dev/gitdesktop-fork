# GUIA PARA AGENTES

este repositorio es un fork organizado de gitdesktop. conserva el alcance del
cambio y evita modificar el comportamiento de la aplicación cuando la tarea
solo pida documentación u organización.

## REGLAS DEL REPOSITORIO

- lee `.docs/guidelines/` antes de crear o modificar markdown;
- mantén los nombres de los ficheros públicos del repositorio en minúsculas;
- no incluyas `raw-project/.git/`, `raw-project/node_modules/` ni artefactos de
  compilación en cambios del proyecto;
- conserva la licencia apache 2.0 y los avisos de atribución del upstream;
- ejecuta las comprobaciones relevantes después de cada cambio funcional.

## DOCUMENTACION

los títulos markdown van en mayúsculas y sin acentos. el contenido va en
minúsculas, con sus acentos ortográficos. los nombres de rutas, comandos,
identificadores y urls se conservan literalmente.

## CAMBIOS

usa commits pequeños y descriptivos según `.docs/guidelines/commit-guidelines.md`.
los cambios de cara al usuario deben actualizar `gitdesktop-app/changelog.d/` y las pull
requests deben seguir `.docs/guidelines/pr-merge-release-guidelines.md`.

## SEGURIDAD DE GIT

usa `git --no-pager diff` y `git branch --list` para inspecciones de solo
lectura. se permite `git -C <path>` dentro del task worktree; cualquier
otra invocación de git que cambie estado está prohibida. every other git
invocation is forbidden.
