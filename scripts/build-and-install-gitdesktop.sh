#!/usr/bin/env bash

set -Eeuo pipefail

readonly REPOSITORY_DIR="/home/rezzt/repositorios/desktop-projects/gitdesktop-fork/gitdesktop-app"
readonly APPIMAGE_SOURCE="${REPOSITORY_DIR}/src-tauri/target/release/bundle/appimage/GitDesktop_0.13.5_amd64.AppImage"
readonly INSTALL_DIR="${HOME}/Applications"
readonly INSTALL_PATH="${INSTALL_DIR}/GitDesktop_0.13.5_amd64_localbuild.AppImage"
readonly COMMAND_PATH="${HOME}/.local/bin/gitdesktop"

log() {
  printf '[gitdesktop] %s\n' "$*"
}

fail() {
  printf '[gitdesktop] ERROR: %s\n' "$*" >&2
  exit 1
}

command -v pnpm >/dev/null 2>&1 || fail "No se encontró pnpm en PATH."
[[ -d "${REPOSITORY_DIR}" ]] || fail "No existe el repositorio: ${REPOSITORY_DIR}"

log "Instalando dependencias bloqueadas..."
cd "${REPOSITORY_DIR}"
pnpm install --frozen-lockfile

log "Compilando GitDesktop para Linux..."
build_status=0
pnpm tauri build --bundles appimage || build_status=$?

if (( build_status != 0 )); then
  if [[ -f "${APPIMAGE_SOURCE}" ]]; then
    log "El bundle se generó, pero Tauri devolvió ${build_status}."
    log "Esto suele deberse a que falta TAURI_SIGNING_PRIVATE_KEY para firmar el actualizador."
  else
    fail "La compilación falló y no se generó el AppImage."
  fi
fi

[[ -f "${APPIMAGE_SOURCE}" ]] || fail "No se encontró el AppImage compilado."

log "Instalando el AppImage..."
mkdir -p "${INSTALL_DIR}" "${HOME}/.local/bin"
temporary_install_path="${INSTALL_PATH}.tmp.$$"
trap 'rm -f "${temporary_install_path}"' EXIT
install -m 755 "${APPIMAGE_SOURCE}" "${temporary_install_path}"
mv -f "${temporary_install_path}" "${INSTALL_PATH}"
ln -sfn "${INSTALL_PATH}" "${COMMAND_PATH}"

log "Instalación terminada."
log "Ejecutable: $(readlink -f "${COMMAND_PATH}")"
log "Puedes ejecutar: gitdesktop"
