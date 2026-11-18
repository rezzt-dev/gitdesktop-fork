# SEGURIDAD

la seguridad de gitdesktop fork es una prioridad. agradecemos los informes
responsables que ayuden a proteger a quienes usan el proyecto.

## INFORMAR DE UNA VULNERABILIDAD

no publiques vulnerabilidades en issues, discusiones ni pull requests.

abre un aviso privado desde la pestaña **security** de github mediante la opción
**report a vulnerability**. incluye, siempre que sea posible:

- una descripción clara del problema y del componente afectado;
- los pasos para reproducirlo o una prueba de concepto;
- la versión de la aplicación y el sistema operativo;
- el impacto previsto y una posible mitigación.

si el repositorio todavía no tiene habilitado el informe privado, contacta con
la persona mantenedora por un canal privado antes de divulgar el problema.

## ALCANCE

son especialmente relevantes los problemas relacionados con comandos de tauri,
gestión de secretos, actualización automática, invocaciones de `git` o `gh`,
permisos de repositorios y aislamiento de agentes.

las vulnerabilidades propias de una dependencia deben comunicarse también a su
proyecto upstream, indicando cómo afecta su uso dentro de este fork.

## RESPUESTA

intentaremos confirmar la recepción en un plazo de tres días laborables,
mantener la comunicación durante el análisis y coordinar la publicación de la
corrección. reconoceremos a las personas que informen de forma responsable,
salvo que prefieran permanecer en el anonimato.
