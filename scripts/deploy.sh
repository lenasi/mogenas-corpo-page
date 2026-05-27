#!/usr/bin/env bash
# Upload static site to SiteGround via SSH (rsync).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

load_env() {
  local f
  for f in "${ROOT}/.env" "${ROOT}/.env.deploy"; do
    if [[ -f "$f" ]]; then
      set -a
      # shellcheck source=/dev/null
      source "$f"
      set +a
      return 0
    fi
  done
  return 1
}

load_env || true

: "${DEPLOY_PATH:?Set DEPLOY_PATH in .env}"

SSH_ALIAS="${DEPLOY_SSH_HOST:-mogenas-siteground}"
KEY_PATH="${DEPLOY_KEY_PATH:-${HOME}/.ssh/siteground_mogenas}"
KEY_PATH="${KEY_PATH/#\~/$HOME}"

# Load encrypted key into agent for this session
if [[ -f "$KEY_PATH" ]] && [[ -n "${DEPLOY_KEY_PASSPHRASE:-}" ]]; then
  ASKPASS="${ROOT}/.cache/ssh-askpass-mogenas.sh"
  mkdir -p "${ROOT}/.cache"
  printf '%s\n' '#!/bin/sh' "echo \"${DEPLOY_KEY_PASSPHRASE}\"" >"$ASKPASS"
  chmod 700 "$ASKPASS"
  DISPLAY="${DISPLAY:-:0}" SSH_ASKPASS="$ASKPASS" SSH_ASKPASS_REQUIRE=force \
    ssh-add "$KEY_PATH" </dev/null 2>/dev/null || true
fi

RSYNC_SSH="ssh -o BatchMode=yes"
DEPLOY_TARGET="${SSH_ALIAS}:${DEPLOY_PATH}/"

echo "→ Deploying to ${DEPLOY_TARGET}"
rsync -avz --delete \
  -e "$RSYNC_SSH" \
  --exclude '.git/' \
  --exclude '.cursor/' \
  --exclude '.cache/' \
  --exclude '.env' \
  --exclude '.env.deploy' \
  --exclude '.env.deploy.example' \
  --exclude 'node_modules/' \
  --exclude 'scripts/' \
  --exclude 'package.json' \
  --exclude 'package-lock.json' \
  --exclude '.DS_Store' \
  --exclude '.firecrawl/' \
  "${ROOT}/" "${DEPLOY_TARGET}"

bash "${ROOT}/scripts/purge-cache.sh"

echo "✓ Deploy finished: https://www.mogenas.com/"
