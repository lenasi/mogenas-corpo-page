#!/usr/bin/env bash
# Purge SiteGround Dynamic Cache via SSH (nginx PURGE on localhost).
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

SSH_ALIAS="${DEPLOY_SSH_HOST:-mogenas-siteground}"
# Space-separated hostnames served by this site (www + apex).
PURGE_HOSTS="${PURGE_CACHE_HOSTS:-www.mogenas.com mogenas.com}"

echo "→ Purging SiteGround Dynamic Cache (${PURGE_HOSTS})"

for host in ${PURGE_HOSTS}; do
  echo "  • ${host}"
  response="$(
    ssh -o BatchMode=yes "${SSH_ALIAS}" \
      "curl -D - -sSX PURGE 'http://127.0.0.1/*' -H 'Host: ${host}'" 2>&1
  )" || {
    echo "✗ SSH or purge failed for ${host}"
    exit 1
  }

  if ! grep -q "Successful purge" <<<"$response"; then
    echo "✗ Unexpected purge response for ${host}:"
    echo "$response"
    exit 1
  fi
done

echo "✓ Dynamic cache purged"
