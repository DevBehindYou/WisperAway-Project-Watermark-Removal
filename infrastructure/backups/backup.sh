#!/usr/bin/env bash
#
# Backup script — spec §102: "For self-hosted installation implement
# automatic PostgreSQL backups. Support: encrypted backup, retention,
# second-location copy, restore test."
#
# This script does the first two for real. Second-location copy is a
# parameter (BACKUP_SECOND_LOCATION), not proven against a real remote —
# this sandbox has no cloud/remote storage to prove it against honestly.
# Restore is proven separately, in restore.sh + docs/BACKUPS.md's recorded
# run — an unrestored backup isn't considered working per spec's own rule.
#
# Usage:
#   DATABASE_URL=postgres://... BACKUP_ENCRYPTION_KEY=... ./backup.sh
#
# Required env:
#   DATABASE_URL            - the Postgres connection string to back up
#   BACKUP_ENCRYPTION_KEY   - passphrase for the backup's encryption
# Optional env:
#   BACKUP_RETENTION_DAYS   - delete local backups older than this (default 14)
#   BACKUP_SECOND_LOCATION  - if set, the encrypted backup is also copied here
#   BACKUP_DIR              - where backups are written (default: ./archive, relative to this script)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$SCRIPT_DIR/archive}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required — refusing to silently back up nothing." >&2
  exit 1
fi
if [ -z "${BACKUP_ENCRYPTION_KEY:-}" ]; then
  echo "BACKUP_ENCRYPTION_KEY is required — spec §102 requires encrypted backups, not optional ones." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DUMP_FILE="$BACKUP_DIR/keystone-$TIMESTAMP.dump"
ENC_FILE="$DUMP_FILE.enc"

echo "==> Dumping database (custom format, so pg_restore can do selective/parallel restore later)"
pg_dump "$DATABASE_URL" -Fc -f "$DUMP_FILE"
DUMP_SIZE=$(stat -c%s "$DUMP_FILE" 2>/dev/null || stat -f%z "$DUMP_FILE")
echo "    $DUMP_FILE ($DUMP_SIZE bytes)"

echo "==> Encrypting (AES-256-CBC, PBKDF2)"
openssl enc -aes-256-cbc -pbkdf2 -salt -pass env:BACKUP_ENCRYPTION_KEY -in "$DUMP_FILE" -out "$ENC_FILE"
rm "$DUMP_FILE" # the unencrypted dump never stays on disk
echo "    $ENC_FILE"

if [ -n "${BACKUP_SECOND_LOCATION:-}" ]; then
  mkdir -p "$BACKUP_SECOND_LOCATION"
  cp "$ENC_FILE" "$BACKUP_SECOND_LOCATION/"
  echo "==> Copied to second location: $BACKUP_SECOND_LOCATION"
else
  echo "==> No BACKUP_SECOND_LOCATION set — this backup exists in exactly one place. Fine for a dev proof run, not fine for real use."
fi

echo "==> Applying retention (deleting local backups older than $RETENTION_DAYS days)"
find "$BACKUP_DIR" -maxdepth 1 -name "keystone-*.dump.enc" -mtime "+$RETENTION_DAYS" -print -delete

echo "==> Done: $ENC_FILE"
