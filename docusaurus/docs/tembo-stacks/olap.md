---
sidebar_position: 4
---

# Tembo OLAP

Postgres tuned for online analytical processing. Deploy a stack that is optimized for large data sets, complex queries, and high throughput.

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

- `pg_stat_statements`
- `hydra_columnar`
- `pg_partman`
- `pg_cron`
- `postgres_fdw`
- `clerk_fdw`
- `redis_fdw`
- Extensions from [Trunk](https://pgt.dev) can be installed on-demand.
