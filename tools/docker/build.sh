#!/usr/bin/env bash
# This file is part of MedShakeEHR.
#
# Copyright (c) 2026
# Michaël Val 
# MedShakeEHR is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# any later version.
#
# MedShakeEHR is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with MedShakeEHR.  If not, see <http://www.gnu.org/licenses/>.

# Installateur de base
#
# @author Michaël Val
#
# Équivalent buildah du fichier bake (docker-bake.hcl)
# Build amd64 et arm64 en parallèle (au lieu de séquentiel) par target.
# Usage: ./build.sh {production|development|all} [--push] [--layers]
#
set -euo pipefail

REGISTRY="marsante/msehr"
PUSH=false
LAYERS=false

for arg in "$@"; do
  case "$arg" in
    --push)
      PUSH=true
      ;;
    --layers)
      LAYERS=true
      ;;
  esac
done

build_target() {
  local name="$1"
  local php_version="$2"
  local phpstage="$3"
  local composer_version="$4"
  local vrelease="$5"
  shift 5
  local tags=("$@")

  local manifest="msehr-${name}-manifest"
  local img_amd64="localhost/msehr-${name}-amd64"
  local img_arm64="localhost/msehr-${name}-arm64"

  echo "==> Build target: ${name} (PHP ${php_version}, stage=${phpstage})"

  # Nettoyage des images/manifest d'un run précédent
  buildah rmi "$img_amd64" 2>/dev/null || true
  buildah rmi "$img_arm64" 2>/dev/null || true
  buildah manifest rm "$manifest" 2>/dev/null || true

  local common_args=(
    --file Dockerfile
    --build-arg PHP_VERSION="$php_version"
    --build-arg PHPSTAGE="$phpstage"
    --build-arg COMPOSER_VERSION="$composer_version"
    --build-arg VRELEASE="$vrelease"
  )
  if [ "$LAYERS" = true ]; then
    common_args+=(--layers)
  fi

  # Build amd64 et arm64 en parallèle (2 process buildah séparés)
  buildah build --platform linux/amd64 -t "$img_amd64" "${common_args[@]}" ./ \
    > "/tmp/build-${name}-amd64.log" 2>&1 &
  local pid_amd64=$!

  buildah build --platform linux/arm64 -t "$img_arm64" "${common_args[@]}" ./ \
    > "/tmp/build-${name}-arm64.log" 2>&1 &
  local pid_arm64=$!

  local fail=0
  if ! wait "$pid_amd64"; then
    echo "!! Échec build amd64 (${name}) -- voir /tmp/build-${name}-amd64.log"
    fail=1
  fi
  if ! wait "$pid_arm64"; then
    echo "!! Échec build arm64 (${name}) -- voir /tmp/build-${name}-arm64.log"
    fail=1
  fi
  [ "$fail" -eq 0 ] || { echo "==> Target ${name} interrompu."; return 1; }

  echo "==> Assemblage du manifest ${manifest}"
  buildah manifest create "$manifest"
  buildah manifest add "$manifest" "$img_amd64"
  buildah manifest add "$manifest" "$img_arm64"

  if [ "$PUSH" = true ]; then
    for tag in "${tags[@]}"; do
      echo "==> Push ${tag}"
      buildah manifest push --all "$manifest" "docker://docker.io/${tag}"
    done
  else
    echo "==> Manifest '${manifest}' créé localement (tags prévus: ${tags[*]})"
    echo "    Pour pousser: buildah manifest push --all ${manifest} docker://docker.io/<tag>"
  fi
}

run_production() {
  build_target production 8.4 production 2.8 master \
    "${REGISTRY}:master" \
    "${REGISTRY}:latest"
}

run_development() {
  build_target development 8.5 development 2.8 dev \
    "${REGISTRY}:dev"
}

case "${1:-all}" in
  production)
    run_production
    ;;
  development)
    run_development
    ;;
  all)
    run_production
    run_development
    ;;
  *)
    echo "Usage: $0 {production|development|all} [--push] [--layers]"
    exit 1
    ;;
esac