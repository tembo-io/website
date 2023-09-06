---
sidebar_position: 2
---

# Tembo OLTP

Designed for low-latency, high-concurrency transactional applications. Includes optimized configs, extensions for simpler debugging and monitoring and balanced hardware profiles.

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

- `pg_stat_statements` comes pre-installed and enabled.
- Extensions from [Trunk](https://pgt.dev) can be installed on-demand.
