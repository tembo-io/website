---
title: How to upgrade an instance Postgres version.
description: This guide will walk you through the steps to upgrade an instance of Postgres to a newer version.
---

As Postgres continues to publish new releases, and previous iterations are deprecated, you may find yourself needing to upgrade your instance to a newer version. This guide will help you achieve that.

Before diving in, it's good to reference the [official Postgres documentation on upgrading](https://www.postgresql.org/docs/current/upgrading.html).

## pg_dump / pg_restore

Applying a `pg_dump / pg_restore` workflow works well for small instances, or where cut-over time isn't an issue.

This corresponds to [section 19.6.1](https://www.postgresql.org/docs/current/upgrading.html#UPGRADING-VIA-PGDUMPALL) in the above docs, and further details can be found on our [how-to guide on backups and restores](https://tembo.io/docs/getting-started/postgres_guides/how-to-backup-and-restore-a-postgres-database).

## Logical Replication

Use `logical replication` into a new cluster. Best for medium to large instances, or where downtime needs to be minimized.


