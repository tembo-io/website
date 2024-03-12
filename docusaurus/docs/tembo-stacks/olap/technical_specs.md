---
sidebar_position: 2
title: Technical Specs
---

## Configuration

The following configurations automatically scale based on the size of cpu, memory, and storage for the cluster:

- `shared_buffers`
- `max_connections`
- `work_mem`
- `bgwriter_delay`
- `effective_cache_size`
- `maintenance_work_mem`
- `max_wal_size`

## Extensions

- `pg_stat_statements` provides statistics on SQL statements executed by the database. It helps users analyze query performance and identify areas for optimization.
- [columnar](https://pgt.dev/extensions/hydra_columnar) - `hydra_columnar` is open source, column-oriented Postgres, designed for high-speed aggregate operations.
- [pg_partman](https://pgt.dev/extensions/pg_partman) - `pg_partman` - simplifies and automates partitioning of large database tables. It helps manage data efficiently by dividing it into smaller, more manageable partitions.
- [pg_cron](https://pgt.dev/extensions/pg_cron) - `pg_cron` automates database tasks within PostgreSQL, enabling scheduled maintenance, recurring tasks, and interval-based SQL queries.
- [postgres_fdw](https://pgt.dev/extensions/postgres_fdw) - `postgres_fdw` provides the foreign data wrapper necessary to access data stored in external Postgres servers.
- [redis_fdw](https://pgt.dev/extensions/redis_fdw) - `redis_fdw` provides the foreign data wrapper necessary to access data stored in external Redis servers.

Extensions from [Trunk](https://pgt.dev) can be installed on-demand.
