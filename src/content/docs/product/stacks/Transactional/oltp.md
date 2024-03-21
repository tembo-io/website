---
title: OLTP
sideBarTitle: OLTP
sideBarPosition: 102
---

The OLTP stack is a finely-tuned database cluster optimized for transactional workloads, designed to handle concurrency with ease. Built with optimized WAL and auto-vacuum settings, it also includes extensions for debugging and real-time metrics.

## Configuration

The following configurations automatically scale based on the size of cpu, memory, and storage for the cluster:

-   `shared_buffers`
-   `max_connections`
-   `work_mem`
-   `bgwriter_delay`
-   `effective_cache_size`
-   `maintenance_work_mem`
-   `max_wal_size`

## Extensions

-   `pg_stat_statements` comes pre-installed and enabled.
-   Extensions from [Trunk](https://pgt.dev) can be installed on-demand.
