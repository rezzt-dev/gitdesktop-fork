#!/usr/bin/env bash

set -Eeuo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPOSITORY_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
readonly APP_DIR="${REPOSITORY_DIR}/gitdesktop-app"
readonly APP_VERSION="0.13.5"
readonly APPIMAGE_SOURCE="${APP_DIR}/src-tauri/target/release/bundle/appimage/GitDesktop_${APP_VERSION}_amd64.AppImage"
readonly INSTALL_DIR="${HOME}/Applications"
readonly INSTALL_PATH="${INSTALL_DIR}/GitDesktop_${APP_VERSION}_amd64_localbuild.AppImage"
readonly COMMAND_PATH="${HOME}/.local/bin/gitdesktop"
readonly CACHE_DIR="${XDG_CACHE_HOME:-${HOME}/.cache}/gitdesktop-fork"
readonly TOTAL_STEPS=5

WORK_DIR="$(mktemp -d)"
readonly WORK_DIR
readonly LOG_FILE="${WORK_DIR}/build.log"
readonly START_MARKER="${WORK_DIR}/start"
: >"${LOG_FILE}"
: >"${START_MARKER}"

INTERACTIVE=0
BOLD="" DIM="" RED="" GREEN="" YELLOW="" CYAN="" RESET=""
if [[ -t 1 ]]; then
  INTERACTIVE=1
  if [[ -z "${NO_COLOR:-}" ]]; then
    BOLD=$'\033[1m' DIM=$'\033[2m' RED=$'\033[31m' GREEN=$'\033[32m'
    YELLOW=$'\033[33m' CYAN=$'\033[36m' RESET=$'\033[0m'
  fi
fi
readonly INTERACTIVE BOLD DIM RED GREEN YELLOW CYAN RESET

readonly FRAMES=(⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏)
readonly CLEAR_LINE=$'\r\033[K'

CURRENT_PID=""
STEP_STATUS=0
STEP_ELAPSED=0
STEP_NUMBER=0
LABEL=""
KEEP_LOG=0
TMP_INSTALL=""

cleanup() {
  local code=$?
  [[ -n "${CURRENT_PID}" ]] && kill "${CURRENT_PID}" 2>/dev/null || true
  [[ -n "${TMP_INSTALL}" ]] && rm -f "${TMP_INSTALL}"
  (( INTERACTIVE )) && printf '\033[?25h'
  if (( code != 0 && KEEP_LOG )); then
    printf '  %sRegistro completo:%s %s\n\n' "${DIM}" "${RESET}" "${LOG_FILE}"
  else
    rm -rf "${WORK_DIR}"
  fi
}
trap cleanup EXIT
trap 'printf "\n  %s■ Cancelado%s\n" "${YELLOW}" "${RESET}"; exit 130' INT TERM

format_time() {
  local total=$1
  if (( total >= 60 )); then
    printf '%dm %02ds' $((total / 60)) $((total % 60))
  else
    printf '%ds' "${total}"
  fi
}

banner() {
  printf '\n  %s%s◆ GitDesktop%s %s· compilar e instalar v%s%s\n' \
    "${BOLD}" "${CYAN}" "${RESET}" "${DIM}" "${APP_VERSION}" "${RESET}"
  printf '  %s──────────────────────────────────────────%s\n\n' "${DIM}" "${RESET}"
  (( INTERACTIVE )) && printf '\033[?25l'
  return 0
}

next_step() {
  STEP_NUMBER=$((STEP_NUMBER + 1))
  LABEL="[${STEP_NUMBER}/${TOTAL_STEPS}] $1"
}

show_ok() {
  printf '%s  %s✔%s %s %s(%s)%s\n' "${CLEAR_LINE}" "${GREEN}" "${RESET}" "$1" "${DIM}" "$(format_time "$2")" "${RESET}"
}

show_warn() {
  printf '%s  %s▲%s %s\n' "${CLEAR_LINE}" "${YELLOW}" "${RESET}" "$1"
}

show_fail() {
  printf '%s  %s✘%s %s\n' "${CLEAR_LINE}" "${RED}" "${RESET}" "$1"
}

die() {
  KEEP_LOG=1
  printf '\n  %s%s%s\n' "${RED}" "$1" "${RESET}"
  if [[ -s "${LOG_FILE}" ]]; then
    printf '\n  %sÚltimas líneas:%s\n' "${DIM}" "${RESET}"
    tail -n 12 "${LOG_FILE}" | sed 's/^/    /'
    printf '\n'
  fi
  exit 1
}

run_step() {
  local label="$1"
  shift
  local start=${SECONDS} frame=0
  "$@" >>"${LOG_FILE}" 2>&1 </dev/null &
  CURRENT_PID=$!
  if (( INTERACTIVE )); then
    while kill -0 "${CURRENT_PID}" 2>/dev/null; do
      printf '%s  %s%s%s %s %s%s%s' "${CLEAR_LINE}" "${CYAN}" "${FRAMES[frame % ${#FRAMES[@]}]}" "${RESET}" \
        "${label}" "${DIM}" "$(format_time $((SECONDS - start)))" "${RESET}"
      frame=$((frame + 1))
      sleep 0.08
    done
  else
    printf '  … %s\n' "${label}"
  fi
  STEP_STATUS=0
  wait "${CURRENT_PID}" || STEP_STATUS=$?
  CURRENT_PID=""
  STEP_ELAPSED=$((SECONDS - start))
}

supports_symlinks() {
  local probe
  probe="$(mktemp -d "$1/.symlink-probe.XXXXXX" 2>/dev/null)" || return 1
  local result=1
  ln -s target "${probe}/link" 2>/dev/null && result=0
  rm -rf "${probe}"
  return "${result}"
}

bind_node_modules() {
  local target="$1" name="$2" backing="${CACHE_DIR}/node_modules-$2"
  mkdir -p "${backing}" "${target}"
  sudo mount --bind "${backing}" "${target}"
}

ensure_symlink_support() {
  next_step 'Comprobando el sistema de archivos'
  local -a targets=("${APP_DIR}/node_modules:app")
  [[ -d "${APP_DIR}/site" ]] && targets+=("${APP_DIR}/site/node_modules:site")

  local entry dir name fs_type needs_mount=0
  for entry in "${targets[@]}"; do
    dir="${entry%%:*}"
    mkdir -p "${dir}"
    supports_symlinks "${dir}" || needs_mount=1
  done

  if (( ! needs_mount )); then
    show_ok "${LABEL}" 0
    return
  fi

  fs_type="$(stat -f -c %T "${APP_DIR}")"
  show_warn "${LABEL}"
  printf '    %sEl disco del proyecto (%s) no admite enlaces simbólicos.%s\n' "${DIM}" "${fs_type}" "${RESET}"
  printf '    %sSe montará node_modules desde %s (pide sudo).%s\n' "${DIM}" "${CACHE_DIR}" "${RESET}"
  sudo -v || die "No se obtuvieron permisos de administrador."

  for entry in "${targets[@]}"; do
    dir="${entry%%:*}"
    name="${entry##*:}"
    supports_symlinks "${dir}" && continue
    bind_node_modules "${dir}" "${name}" || die "No se pudo montar ${dir}."
    supports_symlinks "${dir}" || die "El montaje de ${dir} sigue sin admitir enlaces simbólicos."
  done
  printf '    %s✔ node_modules montado en un disco compatible%s\n' "${GREEN}" "${RESET}"
}

banner

next_step 'Comprobando requisitos'
command -v pnpm >/dev/null 2>&1 || die "No se encontró pnpm en PATH."
[[ -d "${APP_DIR}" ]] || die "No existe el directorio de la app: ${APP_DIR}"
show_ok "${LABEL}" 0

ensure_symlink_support

cd "${APP_DIR}"

next_step 'Instalando dependencias'
run_step "${LABEL}" env CI=true pnpm install --frozen-lockfile
if (( STEP_STATUS != 0 )); then
  show_fail "${LABEL}"
  die "No se pudieron instalar las dependencias."
fi
show_ok "${LABEL}" "${STEP_ELAPSED}"

next_step 'Compilando GitDesktop'
run_step "${LABEL}" pnpm tauri build --bundles appimage
if (( STEP_STATUS == 0 )); then
  show_ok "${LABEL}" "${STEP_ELAPSED}"
elif [[ "${APPIMAGE_SOURCE}" -nt "${START_MARKER}" ]]; then
  show_warn "${LABEL} ${DIM}(AppImage generado; Tauri devolvió ${STEP_STATUS}, suele ser la clave de firma del actualizador)${RESET}"
else
  show_fail "${LABEL}"
  die "La compilación falló y no se generó el AppImage."
fi

next_step 'Instalando el AppImage'
install_start=${SECONDS}
mkdir -p "${INSTALL_DIR}" "${HOME}/.local/bin"
TMP_INSTALL="${INSTALL_PATH}.tmp.$$"
install -m 755 "${APPIMAGE_SOURCE}" "${TMP_INSTALL}"
mv -f "${TMP_INSTALL}" "${INSTALL_PATH}"
TMP_INSTALL=""
ln -sfn "${INSTALL_PATH}" "${COMMAND_PATH}"
show_ok "${LABEL}" $((SECONDS - install_start))

printf '\n  %s%s✔ Instalación terminada%s %s· %s%s\n\n' \
  "${BOLD}" "${GREEN}" "${RESET}" "${DIM}" "$(format_time "${SECONDS}")" "${RESET}"
printf '  %sEjecutable%s  %s\n' "${DIM}" "${RESET}" "${INSTALL_PATH}"
printf '  %sComando%s     %sgitdesktop%s\n\n' "${DIM}" "${RESET}" "${BOLD}" "${RESET}"
