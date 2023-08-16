---
sidebar_position: 1
---

# Standard

## Configuration

Our default configuration of Postgres. The following configurations scale based on the size of cpu, memory, and storage that is selected for the instance; `shared_buffers`, `max_connections`, `work_mem`, `bgwriter_delay`, `effective_cache_size`, `maintenance_work_mem`, and `max_wal_size`.

## Extensions

`pg_stat_statements` comes pre-installed and enabled. Extensions in [pgt.dev](https://pgt.dev) can be installed on-demand.
