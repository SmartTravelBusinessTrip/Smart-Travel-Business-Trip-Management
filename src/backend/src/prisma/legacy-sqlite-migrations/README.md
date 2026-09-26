# Legacy SQLite migrations

These migrations are retained for historical reference only. They are not part
of the PostgreSQL deployment chain because they contain SQLite-specific SQL
(including `PRAGMA`, `STRFTIME`, and SQLite table rebuilds).

The active PostgreSQL migration chain starts at:

`../migrations/20260927000000_postgresql_baseline`

This baseline is generated from the current Prisma schema and is intended for
new PostgreSQL databases. Existing SQLite data must be migrated separately;
this archive is not an automatic SQLite-to-PostgreSQL data migration.
