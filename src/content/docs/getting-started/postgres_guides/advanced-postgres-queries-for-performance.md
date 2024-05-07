Understanding and optimizing the performance of your PostgreSQL database is crucial, especially when dealing with complex and data-intensive applications. Tembo, with its enhanced PostgreSQL platform, offers robust capabilities for performance analysis. Here are the top 5 advanced PostgreSQL queries essential for understanding and optimizing database performance, along with guidance on how to execute them on Tembo.

## **1. Query Execution Statistics**

```sql
-- Retrieve query execution statistics
SELECT query, calls, total_time, rows, 100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

- Regularly monitor the most time-consuming queries.
- Optimize queries with low hit percentages.

## **2. Index Usage Analysis**

Analyzing index usage is key for query optimization.

```sql
-- Analyze index usage
SELECT relname, seq_scan, idx_scan,
CASE WHEN seq_scan + idx_scan = 0 THEN 0 ELSE (idx_scan / (seq_scan + idx_scan)) * 100 END AS index_usage
FROM pg_stat_user_tables
ORDER BY index_usage;
```

- Focus on tables with low index usage for optimization.
- Consider adding or modifying indexes for frequently accessed tables.

## **3. Long Running Queries**

Identify and analyze long-running queries in your database.

```sql
-- Find long running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND (now() - pg_stat_activity.query_start) > interval '5 minutes';

```

- Regularly monitor and terminate long-running queries that might be stuck.
- Optimize or break down complex long-running queries.

## **4. Lock Monitoring**

```sql
-- Monitor database locks
SELECT relation::regclass, mode, locktype, page, virtualtransaction, pid, granted
FROM pg_locks
WHERE relation IS NOT NULL;

```

- Identify and resolve long-held locks promptly.
- Optimize transaction logic to prevent lock contention.

## **5. Dead Row Analysis**

```sql
-- Analyze dead rows
SELECT relname, n_live_tup, n_dead_tup, last_vacuum, last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000;
```

- Regularly vacuum tables with a high number of dead tuples.
- Monitor autovacuum activity and adjust settings if necessary.


## Summary

Using these advanced queries on Tembo can significantly aid in identifying performance issues and optimizing your PostgreSQL database. Always adapt these queries to suit your specific use case and continuously monitor their outcomes for a well-performing database environment.
