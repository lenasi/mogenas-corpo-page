#!/usr/bin/env bash
# Save SiteGround SSH in ~/.ssh/config and load deploy key into agent.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing ${ENV_FILE}"
  exit 1
fi

set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

: "${DEPLOY_HOST:?}"
: "${DEPLOY_USER:?}"
DEPLOY_PORT="${DEPLOY_PORT:-18765}"
SSH_ALIAS="${DEPLOY_SSH_HOST:-mogenas-siteground}"
KEY_PATH="${DEPLOY_KEY_PATH/#\~/$HOME}"
KEY_PATH="${KEY_PATH:-${HOME}/.ssh/siteground_mogenas}"
CONFIG="${HOME}/.ssh/config"
MARKER="# mogenas-siteground (managed by scripts/setup-ssh.sh)"

mkdir -p "${HOME}/.ssh"
chmod 700 "${HOME}/.ssh"

if [[ ! -f "${KEY_PATH}" ]]; then
  echo "Missing key: ${KEY_PATH} (set DEPLOY_KEY_PATH in .env)"
  exit 1
fi
chmod 600 "${KEY_PATH}"

if grep -qF "$MARKER" "$CONFIG" 2>/dev/null; then
  # Update existing block: remove old block and re-append
  awk -v m="$MARKER" '
    $0 ~ m { skip=1; next }
    skip && /^Host / && $2 != "'"${SSH_ALIAS}"'" { skip=0 }
    skip && /^Host / { skip=0 }
  { if (!skip) print }
  ' "$CONFIG" > "${CONFIG}.tmp" && mv "${CONFIG}.tmp" "$CONFIG"
fi

if ! grep -qF "$MARKER" "$CONFIG" 2>/dev/null; then
  cat >>"$CONFIG" <<EOF

${MARKER}
Host ${SSH_ALIAS}
  HostName ${DEPLOY_HOST}
  User ${DEPLOY_USER}
  Port ${DEPLOY_PORT}
  IdentityFile ${KEY_PATH}
  IdentitiesOnly yes
  AddKeysToAgent yes
  UseKeychain yes
EOF
  chmod 600 "$CONFIG"
  echo "✓ SSH config: Host ${SSH_ALIAS}"
fi

load_key() {
  if [[ -n "${DEPLOY_KEY_PASSPHRASE:-}" ]]; then
    ASKPASS="${ROOT}/.cache/ssh-askpass-mogenas.sh"
    mkdir -p "${ROOT}/.cache"
    printf '%s\n' '#!/bin/sh' "echo \"${DEPLOY_KEY_PASSPHRASE}\"" >"$ASKPASS"
    chmod 700 "$ASKPASS"
    DISPLAY="${DISPLAY:-:0}" SSH_ASKPASS="$ASKPASS" SSH_ASKPASS_REQUIRE=force \
      ssh-add "$KEY_PATH" </dev/null 2>/dev/null || true
  else
    ssh-add --apple-use-keychain "$KEY_PATH" 2>/dev/null || ssh-add "$KEY_PATH" 2>/dev/null || true
  fi
}

load_key

if ssh -o BatchMode=yes -o ConnectTimeout=15 "${SSH_ALIAS}" 'echo ok' 2>/dev/null; then
  echo "✓ SSH connected: ${SSH_ALIAS}"
  ssh -o BatchMode=yes "${SSH_ALIAS}" 'for d in ~/www/mogenas.com/public_html ~/public_html; do [ -d "$d" ] && echo "DEPLOY_PATH=$d" && exit 0; done; ls -d ~/*/public_html 2>/dev/null | head -3'
else
  echo "✗ Could not connect. Confirm the public key is in SiteGround → SSH Keys Manager."
  exit 1
fi
