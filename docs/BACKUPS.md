# Backups

Spec §102: "A backup is not considered working until restore has been tested." This document exists because of that line specifically — a backup script nobody has ever restored from is a false sense of security, not a real one.

## What exists

- `infrastructure/backups/backup.sh` — `pg_dump` in custom format, encrypted with AES-256-CBC (PBKDF2-derived key from `BACKUP_ENCRYPTION_KEY`), written to `infrastructure/backups/archive/`, with a configurable retention window that deletes local copies past `BACKUP_RETENTION_DAYS` (default 14). Optionally copies the encrypted archive to a second path via `BACKUP_SECOND_LOCATION`.
- `infrastructure/backups/restore.sh` — decrypts and restores a given backup file into a target database, gated behind an explicit `--yes` flag so a bad `RESTORE_TARGET_URL` can't silently clobber a real database.

## The actual proof run

Run for real against this build's dev database, not a synthetic example:

1. Recorded row counts in `keystone_dev` before backup: 2 tenants, 2 commitments, 5 commitment_changes, 3 source_events, 1 waiting_item.
2. Ran `backup.sh` — produced a 32,058-byte encrypted dump (`keystone-20260929T095213Z.dump.enc`).
3. Created a fresh, empty database (`keystone_restore_test`) — deliberately not the original, to prove this is a real restore and not just reading back the source database.
4. Ran `restore.sh` against it.
5. Re-ran the same row-count query against the restored database: **2 tenants, 2 commitments, 5 commitment_changes, 3 source_events, 1 waiting_item — identical.** Spot-checked actual commitment titles and statuses came back intact, not just matching counts.
6. Dropped the test database once the proof was recorded.

That's the whole point of this document: the numbers above are a real result from a real run, not a description of what the script is supposed to do.

## What's honest about the gaps

- **Second-location copy is implemented but not proven against a real remote.** This sandbox has no cloud storage or second machine to copy to — `BACKUP_SECOND_LOCATION` is a real, working parameter (it does a real file copy to wherever you point it), but this proof run only exercised the single-location path. Prove the second-location path for real once there's an actual second location.
- **No automation/scheduling yet.** These are scripts you run, not a cron job or systemd timer. Spec §102 says "implement automatic PostgreSQL backups" — the automatic part (a schedule) isn't built. Worth adding once this runs somewhere persistent, which this sandbox isn't.
- **The encryption passphrase used in the proof run is a throwaway dev value, visible in this very document.** Never do that with a real `BACKUP_ENCRYPTION_KEY` — it should come from a real secret store, not a shell history or a doc.

## Running it yourself

```bash
cd infrastructure/backups

DATABASE_URL="postgres://user:pass@localhost:5432/keystone_dev" \
BACKUP_ENCRYPTION_KEY="a-real-secret-not-this-one" \
./backup.sh

# restoring into a fresh/target database:
BACKUP_ENCRYPTION_KEY="a-real-secret-not-this-one" \
RESTORE_TARGET_URL="postgres://user:pass@localhost:5432/some_target_db" \
./restore.sh archive/keystone-<timestamp>.dump.enc --yes
```
