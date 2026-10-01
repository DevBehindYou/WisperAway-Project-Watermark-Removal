#!/usr/bin/env bash
#
# Restore script — the other half of spec §102's requirement. Decrypts an
# encrypted backup and restores it into a TARGET database, which defaults
# to requiring explicit confirmation so this can't accidentally clobber a
# real database by a typo'd DATABASE_URL.
#
# Usage:
#   BACKUP_ENCRYPTION_KEY=... RESTORE_TARGET_URL=postgres://... ./restore.sh <backup-file.dump.enc> [--yes]

set -euo pipefail

ENC_FILE="${1:-}"
CONFIRM="${2:-}"

if [ -z "$ENC_FILE" ] || [ ! -f "$ENC_FILE" ]; then
  echo "Usage: BACKUP_ENCRYPTION_KEY=... RESTORE_TARGET_URL=... ./restore.sh <backup-file.dump.enc> [--yes]" >&2
  exit 1
fi
if [ -z "${BACKUP_ENCRYPTION_KEY:-}" ]; then
  echo "BACKUP_ENCRYPTION_KEY is required to decrypt this backup." >&2
  exit 1
fi
if [ -z "${RESTORE_TARGET_URL:-}" ]; then
  echo "RESTORE_TARGET_URL is required — the database to restore INTO. Be certain this is not a live database you meant to keep." >&2
  exit 1
fi
if [ "$CONFIRM" != "--yes" ]; then
  echo "This will restore into: $RESTORE_TARGET_URL"
  echo "Re-run with --yes to actually do it. Refusing to restore into a real target without explicit confirmation."
  exit 1
fi

TMP_DUMP="$(mktemp)"
trap 'rm -f "$TMP_DUMP"' EXIT

echo "==> Decrypting"
openssl enc -aes-256-cbc -pbkdf2 -d -salt -pass env:BACKUP_ENCRYPTION_KEY -in "$ENC_FILE" -out "$TMP_DUMP"

echo "==> Restoring into $RESTORE_TARGET_URL"
pg_restore --clean --if-exists --no-owner --no-privileges -d "$RESTORE_TARGET_URL" "$TMP_DUMP"

echo "==> Restore complete."
