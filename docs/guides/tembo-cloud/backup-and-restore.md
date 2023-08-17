---
sidebar_position: 1
tags:
  - backup
  - restore
  - recovery
---

# Backup and restore

## Backup system

Postgres backups and Write Ahead Log (WAL) archiving are performed using [Barman](https://pgbarman.org/), powered by the [Cloud Native Postgres Operator (CNPG)](https://cloudnative-pg.io/). Backups are saved to [Amazon S3](https://aws.amazon.com/s3/).

## Retention policies

- The retention policy for Barman is configured to 30 days
- The retention policy for AWS S3 is set to 40 days
- AWS S3 object versioning is enabled, and the retention policy for non-current versions is 30 days

In Tembo Cloud, we support Point In Time Recovery (PITR) to a new Tembo Cluster for the last 30 days. Backup data is saved an additional 30 days after deletion to protect against accidental deletion, so backup data in total is retained for 60 days.

## WAL archiving

Tembo sets `archive_timeout` to 5min, ensuring that WAL files are closed and archived to S3 at least every five minutes, providing a deterministic time-based value for your Recovery Point Objective (RPO)
