---
description: Introduction to pg_stat_statements and EXPLAIN ANALYZE
---
Monitoring and profiling PostgreSQL is essential for identifying performance bottlenecks and optimizing your database for better efficiency. This guide provides a step-by-step approach to enable advanced monitoring and profiling, followed by best practices for performance gains.

### Enabling the pg_stat_statements Extension

This extension is crucial for query profiling.

```sql
-- Load the extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

```

### Configuring the Extension

Adjust the configuration to suit your monitoring needs.

```sql
-- Modify these settings in your PostgreSQL configuration file
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.max = 10000
pg_stat_statements.track = all
```

After modifying, restart PostgreSQL. On Tembo Cloud, pg_stat_statements is already enabled.

### Analyzing Workload

Use the collected data to analyze your database workload. Focus on queries with high execution time or frequency.

```sql
-- Query to find top queries by total time
SELECT query, total_time, calls, rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

Consult [Tembo Query Analysis](/docs/getting-started/postgres_guides/effective-query-optimization-technique) for in-depth analysis techniques, or see [this guide for more tips on using pg_stat_statements](/docs/getting-started/postgres_guides/advanced-postgres-queries-for-performance).

### Profiling Specific Queries

For problematic queries, use `EXPLAIN ANALYZE` to get detailed execution plans.

```sql
EXPLAIN ANALYZE
    SELECT * FROM your_table WHERE your_condition;
```
