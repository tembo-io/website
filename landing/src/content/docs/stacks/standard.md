---
sidebar_position: 2
---

# Tembo Standard Stack

The Tembo Standard Stack is a tuned Postgres instance balance for general purpose computing. You have full control over compute, configuration, and extension installation. 

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

- `pg_stat_statements` comes pre-installed and enabled. It provides statistics on SQL statements executed by the database, which helps users analyze query performance and identify areas for optimization.

- Extensions from [Trunk](https://pgt.dev) can be installed on-demand.
