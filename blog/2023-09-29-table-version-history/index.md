---
slug: table-version-history
title: "Version History and Lifecycle Policies for Postgres Tables"
authors: [steven]
tags: [postgres, extensions, temporal_tables, pg_partman, trunk]
hide_reading_time: true
---

![back-in-time](./images/back-in-time.jpeg)

One of my favorite features of Amazon Web Services is S3 version history and lifecycle policies. When objects are updated or deleted, the old object version remains in the bucket, but it’s hidden. Old versions are deleted eventually by the lifecycle policy.

I would like something like that for my Postgres table data. **We can use the temporal_tables extension for version history, and combine it with pg_partman to partition by time, automatically expiring old versions.**

## Data model

Let's say we have a table **employees**, and it looks like this:
```
       name       |            department            |  salary
------------------+----------------------------------+----------
 Bernard Marx     | Hatchery and Conditioning Centre | 10000.00
 Lenina Crowne    | Hatchery and Conditioning Centre |  7000.00
 Helmholtz Watson | College of Emotional Engineering | 18500.00
```

When we enable version history, we will add one more column to this table that represents a time range. This time range represents "since when" is this row the current version. Notice that in the new column `sys_period`, it's a time range that is unbounded on the right side. That is because all the rows in the **employees** table are the present version.

```
       name       |            department            |  salary  |             sys_period
------------------+----------------------------------+----------+------------------------------------
 Helmholtz Watson | College of Emotional Engineering | 18500.00 | ["2023-09-28 13:30:19.24318+00",)
 Bernard Marx     | Hatchery and Conditioning Centre | 11600.00 | ["2023-09-28 13:33:58.735932+00",)
 Lenina Crowne    | Hatchery and Conditioning Centre | 11601.00 | ["2023-09-28 13:33:58.738827+00",)
```

To remember the previous versions, we will also make another table called **employees_history**. This will have the same columns as the **employees** table, and all the rows in `sys_period` are bounded on the the right and the left sides to indicate the period for which they are the current version. We will configure **temporal_tables** to automatically create these rows when anything changes in the **employees** table.

```
     name      |            department            |  salary  |                            sys_period
---------------+----------------------------------+----------+-------------------------------------------------------------------
 Bernard Marx  | Hatchery and Conditioning Centre | 10000.00 | ["2023-09-28 13:30:19.18544+00","2023-09-28 13:33:58.683279+00")
 Bernard Marx  | Hatchery and Conditioning Centre | 11200.00 | ["2023-09-28 13:33:58.683279+00","2023-09-28 13:33:58.731332+00")
 Bernard Marx  | Hatchery and Conditioning Centre | 11400.00 | ["2023-09-28 13:33:58.731332+00","2023-09-28 13:33:58.735932+00")
 Lenina Crowne | Hatchery and Conditioning Centre |  7000.00 | ["2023-09-28 13:30:19.239152+00","2023-09-28 13:33:58.738827+00")
```

Finally, to enable time-based partitioning and automatic deletion of old versions, we add one more column to the **employees_table**, `created_at`. This is used as the partition key, and we will configure **pg_partman** to delete old partitions.

## Getting set up

[This guide](https://tembo.io/docs/tembo-cloud/try-extensions-locally) covers in detail how to try out Postgres extensions locally. I've followed that guide to set up my environment with **temporal_tables** and **pg_partman**.

I have a Dockefile, two SQL scripts, and a Postgres configuration file.

```
.
├── Dockerfile
├── 0_startup.sql
├── 1_create_versioned_table.sql
└── custom.conf
```

**Dockerfile:** we use [Trunk](https://pgt.dev) to install pg_partman and temporal_tables. Then, we copy the three other files into the image.

```Dockerfile
FROM quay.io/tembo/tembo-local:latest

RUN trunk install pg_partman
RUN trunk install temporal_tables

COPY 0_startup.sql $PGDATA/startup-scripts

COPY 1_create_versioned_table.sql $PGDATA/startup-scripts

COPY custom.conf $PGDATA/extra-configs
```

**0_startup.sql:** enables temporal_tables and pg_partman when Postgres starts.

```sql
CREATE EXTENSION IF NOT EXISTS temporal_tables;
CREATE EXTENSION IF NOT EXISTS pg_partman;
```

**1_create_versioned_table.sql:** creates a sample table, and enables version history on it.
```sql
-- Sample: an existing table we want to enable versioning on
CREATE TABLE employees
(
  name text NOT NULL PRIMARY KEY,
  department text,
  salary numeric(20, 2)
);

/*
Adding version history to the table,
first we need to add a time range to the existing table.
This represents "since when" has this row been current.
*/
ALTER TABLE employees ADD COLUMN sys_period tstzrange NOT NULL;

/*
Creating a time-partitioned version table
each row has the range the data was valid for,
and also the time this version was created.
*/
CREATE TABLE employees_history (
    LIKE employees INCLUDING DEFAULTS EXCLUDING INDEXES EXCLUDING CONSTRAINTS,
    created_at timestamptz NOT NULL DEFAULT now())
    PARTITION BY RANGE (created_at);

-- Allow efficient querying of partition key and name
CREATE INDEX ON employees_history (created_at);

/*
Enable automatic partitioning with pg_partman, partitioning every 1 minute.

It's more realistic to partition daily or greater.
*/
SELECT create_parent('public.employees_history', 'created_at', 'native', '1 minute');

-- This connects employees table to employees_history
CREATE TRIGGER versioning_trigger
    BEFORE INSERT OR UPDATE OR DELETE ON employees
    FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period',
                                              'employees_history',
                                              true);

/*
Configure retention policy for employee history to keep old versions for 10 minutes.

It's more realistic to configure retention for 1 year.
*/
UPDATE part_config
    SET retention = '10 minutes',
        retention_keep_table = false,
        retention_keep_index = false,
        infinite_time_partitions = true
    WHERE parent_table = 'public.employees_history';

```

**custom.conf:** our additions to the Postgres configuration.

```
# Enable pg_partman background worker
shared_preload_libraries = 'pg_partman_bgw'

# How many seconds between pg_partman background worker runs
# It's more realistic to run every 3600 seconds, or longer
pg_partman_bgw.interval = 10

# Which database pg_partman should target
pg_partman_bgw.dbname = 'postgres'

# It's best practice to use limited permissions for the background worker
# pg_partman_bgw.role = 'limitedrole'

# This was helpful when I was working on getting the settings working
# log_min_messages = 'DEBUG1'
```

With those four files in place, we can run Postgres like this:

```bash
docker build -t example-local-image .
docker run -it -d --name local-tembo -p 5432:5432 --rm example-local-image
```

In a separate shell, I connect into the Postgres container.

```bash
psql postgres://postgres:postgres@localhost:5432
```

## Basic example of saving old versions

After we are set up, we have version history and retention policy configured on the **employees** table, but both the **employees** table and the **employees_history** table are empty.

```
SELECT * FROM employees;

 name | department | salary | sys_period
------+------------+--------+------------
(0 rows)

SELECT * FROM employees_history;

 name | department | salary | sys_period | created_at
------+------------+--------+------------+------------
(0 rows)
```

Adding data:

```sql
INSERT INTO employees (name, department, salary)
VALUES ('Bernard Marx', 'Hatchery and Conditioning Centre', 10000);

INSERT INTO employees (name, department, salary)
VALUES ('Lenina Crowne', 'Hatchery and Conditioning Centre', 7000);

INSERT INTO employees (name, department, salary)
VALUES ('Helmholtz Watson', 'College of Emotional Engineering', 18500);
```

Now, the **employees** has some data, and **employees_history** is still empty.
```
postgres=# SELECT * FROM employees;
       name       |            department            |  salary  |             sys_period
------------------+----------------------------------+----------+------------------------------------
 Bernard Marx     | Hatchery and Conditioning Centre | 10000.00 | ["2023-09-28 20:23:14.840624+00",)
 Lenina Crowne    | Hatchery and Conditioning Centre |  7000.00 | ["2023-09-28 20:23:14.911528+00",)
 Helmholtz Watson | College of Emotional Engineering | 18500.00 | ["2023-09-28 20:23:14.913555+00",)
(3 rows)

postgres=# SELECT * FROM employees_history;
 name | department | salary | sys_period | created_at
------+------------+--------+------------+------------
(0 rows)
```

Modifying data:

```sql
UPDATE employees SET salary = 11200 WHERE name = 'Bernard Marx';
UPDATE employees SET salary = 11400 WHERE name = 'Bernard Marx';
UPDATE employees SET salary = 11600 WHERE name = 'Bernard Marx';
UPDATE employees SET salary = 11601 WHERE name = 'Lenina Crowne';
```

Now, the **employees_history** table has past versions.

```
postgres=# SELECT name, salary, sys_period FROM employees;
       name       |  salary  |             sys_period
------------------+----------+------------------------------------
 Helmholtz Watson | 18500.00 | ["2023-09-28 20:23:14.913555+00",)
 Bernard Marx     | 11600.00 | ["2023-09-28 20:23:50.731597+00",)
 Lenina Crowne    | 11601.00 | ["2023-09-28 20:23:50.734214+00",)
(3 rows)

postgres=# SELECT name, salary, sys_period FROM employees_history;
     name      |  salary  |                            sys_period
---------------+----------+-------------------------------------------------------------------
 Bernard Marx  | 10000.00 | ["2023-09-28 20:23:14.840624+00","2023-09-28 20:23:50.684293+00")
 Bernard Marx  | 11200.00 | ["2023-09-28 20:23:50.684293+00","2023-09-28 20:23:50.727283+00")
 Bernard Marx  | 11400.00 | ["2023-09-28 20:23:50.727283+00","2023-09-28 20:23:50.731597+00")
 Lenina Crowne |  7000.00 | ["2023-09-28 20:23:14.911528+00","2023-09-28 20:23:50.734214+00")
(4 rows)
```

## Querying past versions

Let's say we want to look up Bernard's salary at a previous date. We can check the **employees_history** table to find the row where the time range matches our provided timestamp. However, this wouldn't find the correct salary if we provide a timestamp that is after the most recent update to Bernard's salary, since that row is in the **employees** table.

We can first create a [view](https://www.postgresql.org/docs/current/tutorial-views.html) for this purpose. We only need to do this once, then we can query this view like a table going forward.

```sql
CREATE VIEW employee_history_view AS

SELECT name, department, salary, sys_period
FROM employees

UNION ALL

SELECT name, department, salary, sys_period
FROM employees_history;
```

Then, we can use this query to find Bernard's salary at any given date.

```sql
SELECT salary
FROM employee_history_view
WHERE name = 'Bernard Marx'
AND sys_period @> TIMESTAMP WITH TIME ZONE '2023-09-28 20:23:30+00'
LIMIT 1;
```

`@>` Is a *containment operator* and you might recognize it if you have used [JSONB](https://tembo.io/docs/postgres_guides/postgres-basics/jsonb).

Comparing to the **employees_history** table shown above, it is returning the correct value.

```
  salary
----------
 10000.00
(1 row)
```

It also works to look up the current salary:
```sql
SELECT salary
FROM employee_history_view
WHERE name = 'Bernard Marx'
AND sys_period @> now()::TIMESTAMP WITH TIME ZONE
LIMIT 1;
```
```
  salary
----------
 11600.00
(1 row)
```
```sql
SELECT salary FROM employees WHERE name = 'Bernard Marx';
```
```
  salary
----------
 11600.00
(1 row)
```

If I try to query a salary from the future, it will return the current salary. If I try to query a salary from before Bernard is known in the **employees_history** table, then I get an empty result.

## Partitioning

**What is partitioning?** [Postgres documentation](https://www.postgresql.org/docs/current/ddl-partitioning.html) has detailed information on partitioning but just to summarize, partitioning is about splitting what is logically one large table into smaller tables. Typically, this is done for query performance. In our case, we are partitioning to enable expiring old versions.

Partitioning tables is something I’m familiar with from Tembo’s work in [PGMQ](https://github.com/tembo-io/pgmq), which is a queueing extension for Postgres.

## Performance

### Writes

We should expect write performance to be slower, since we are writing to two tables for every update.

I created a new table that does not have versioning enabled to compare write performance.
```sql
-- Create a table like employees
CREATE TABLE employees_write_test
AS TABLE employees
WITH NO DATA;

-- ...and insert one row
INSERT INTO employees_write_test (name, department, salary, sys_period)
VALUES ('Bernard Marx', 'Hatchery and Conditioning Centre', 11600.00, tstzrange(now(), null));
```

Then, I used `EXPLAIN ANALYZE` to compare the write performance. I ran the query a few times for each.

**Without the versioning:**
```
postgres=# EXPLAIN ANALYZE UPDATE employees_write_test SET salary = 11608 WHERE name = 'Bernard Marx';
                                                      QUERY PLAN
----------------------------------------------------------------------------------------------------------------------
 Update on employees_write_test  (cost=0.00..17.00 rows=0 width=0) (actual time=0.984..1.001 rows=0 loops=1)
   ->  Seq Scan on employees_write_test  (cost=0.00..17.00 rows=3 width=26) (actual time=0.361..0.384 rows=1 loops=1)
         Filter: (name = 'Bernard Marx'::text)
 Planning Time: 1.654 ms
 Execution Time: 1.540 ms
(5 rows)

postgres=# EXPLAIN ANALYZE UPDATE employees_write_test SET salary = 11608 WHERE name = 'Bernard Marx';
                                                      QUERY PLAN
----------------------------------------------------------------------------------------------------------------------
 Update on employees_write_test  (cost=0.00..17.00 rows=0 width=0) (actual time=0.450..0.457 rows=0 loops=1)
   ->  Seq Scan on employees_write_test  (cost=0.00..17.00 rows=3 width=26) (actual time=0.155..0.165 rows=1 loops=1)
         Filter: (name = 'Bernard Marx'::text)
 Planning Time: 0.760 ms
 Execution Time: 0.707 ms
(5 rows)

postgres=# EXPLAIN ANALYZE UPDATE employees_write_test SET salary = 11608 WHERE name = 'Bernard Marx';
                                                      QUERY PLAN
----------------------------------------------------------------------------------------------------------------------
 Update on employees_write_test  (cost=0.00..17.00 rows=0 width=0) (actual time=1.389..1.406 rows=0 loops=1)
   ->  Seq Scan on employees_write_test  (cost=0.00..17.00 rows=3 width=26) (actual time=0.652..0.678 rows=1 loops=1)
         Filter: (name = 'Bernard Marx'::text)
 Planning Time: 1.707 ms
 Execution Time: 2.079 ms
(5 rows)
```

**With versioning:**
```
postgres=# EXPLAIN ANALYZE UPDATE employees SET salary = 11610 WHERE name = 'Bernard Marx';
                                                           QUERY PLAN
---------------------------------------------------------------------------------------------------------------------------------
 Update on employees  (cost=0.15..8.17 rows=0 width=0) (actual time=16.634..16.638 rows=0 loops=1)
   ->  Index Scan using employees_pkey on employees  (cost=0.15..8.17 rows=1 width=26) (actual time=1.102..1.133 rows=1 loops=1)
         Index Cond: (name = 'Bernard Marx'::text)
 Planning Time: 2.203 ms
 Trigger versioning_trigger: time=14.441 calls=1
 Execution Time: 17.205 ms
(6 rows)

postgres=# EXPLAIN ANALYZE UPDATE employees SET salary = 11610 WHERE name = 'Bernard Marx';
                                                           QUERY PLAN
---------------------------------------------------------------------------------------------------------------------------------
 Update on employees  (cost=0.15..8.17 rows=0 width=0) (actual time=4.211..4.218 rows=0 loops=1)
   ->  Index Scan using employees_pkey on employees  (cost=0.15..8.17 rows=1 width=26) (actual time=0.753..0.796 rows=1 loops=1)
         Index Cond: (name = 'Bernard Marx'::text)
 Planning Time: 2.423 ms
 Trigger versioning_trigger: time=2.430 calls=1
 Execution Time: 4.783 ms
(6 rows)

postgres=# EXPLAIN ANALYZE UPDATE employees SET salary = 11610 WHERE name = 'Bernard Marx';
                                                           QUERY PLAN
---------------------------------------------------------------------------------------------------------------------------------
 Update on employees  (cost=0.15..8.17 rows=0 width=0) (actual time=2.447..2.453 rows=0 loops=1)
   ->  Index Scan using employees_pkey on employees  (cost=0.15..8.17 rows=1 width=26) (actual time=0.602..0.633 rows=1 loops=1)
         Index Cond: (name = 'Bernard Marx'::text)
 Planning Time: 2.311 ms
 Trigger versioning_trigger: time=1.091 calls=1
 Execution Time: 2.979 ms
(6 rows)

postgres=# EXPLAIN ANALYZE UPDATE employees SET salary = 11610 WHERE name = 'Bernard Marx';
                                                           QUERY PLAN
---------------------------------------------------------------------------------------------------------------------------------
 Update on employees  (cost=0.15..8.17 rows=0 width=0) (actual time=5.093..5.099 rows=0 loops=1)
   ->  Index Scan using employees_pkey on employees  (cost=0.15..8.17 rows=1 width=26) (actual time=2.323..2.363 rows=1 loops=1)
         Index Cond: (name = 'Bernard Marx'::text)
 Planning Time: 2.825 ms
 Trigger versioning_trigger: time=1.711 calls=1
 Execution Time: 5.686 ms
(6 rows)
```

It's important to note that writes are significantly slower if you enable versioning.

### Reads

We created a view which is a union between **employees** and **employees_history**, then we query the view to find an employee's salary at a given time. We should understand the performance implications of this query.

First, let's make a procedure to update a salary 100,000 times in a row. The below example uses [PL/pgSQL](https://www.postgresql.org/docs/current/plpgsql.html). By default, PL/pgSQL functions run as a single transaction, so it would only result in a single update to the **employees_history** table. For this reason, I am using a procedure with `COMMIT` so that each increment will be a separate transaction, this way we also get 100,000 updates to the **employees_history** table. I had to explain that nuance to chatGPT in order for this procedure to be produced properly.

```sql
-- Table name and employee name as inputs
CREATE OR REPLACE PROCEDURE increment_salary(p_name text, p_table_name text)
LANGUAGE plpgsql AS $$
DECLARE
    v_salary numeric(20,2);
    i integer;
    v_sql text;
BEGIN
    -- Dynamically construct the SQL to get the current salary
    v_sql := format('SELECT salary FROM %I WHERE name = $1', p_table_name);
    EXECUTE v_sql INTO v_salary USING p_name;

    -- Loop 100 thousand times
    FOR i IN 1..100000
    LOOP
        -- Increment the salary
        v_salary := v_salary + 1;

        -- Dynamically construct the SQL to update the salary
        v_sql := format('UPDATE %I SET salary = $2 WHERE name = $1', p_table_name);
        EXECUTE v_sql USING p_name, v_salary;

        COMMIT;  -- Commit the transaction, triggering the versioning procedure
    END LOOP;
END
$$;
```

Run the procedure:
```sql
CALL increment_salary('Bernard Marx', 'employees');
```

This took 55 seconds to run on my laptop. I also tried it on the table without versioning enabled, at in this case it took 38 seconds. I ran it a couple more times on the table with versioning enabled, so that the versions would be distributed across multiple partitions. Now we have an **employees_history** table that's populated with many rows for Bernard.

```
postgres=#  SELECT count(*) FROM employees_history WHERE name = 'Bernard Marx';
 count
--------
 300000
(1 row)
```

Let's run the same type of query command we ran before, with `EXPLAIN ANALYZE`. I picked a timestamp that will not be found to ensure it's as slow as possible.

```sql
EXPLAIN ANALYZE
SELECT salary
FROM employee_history_view
WHERE name = 'Bernard Marx'
AND sys_period @> TIMESTAMP WITH TIME ZONE '2023-09-28 15:28:25+00'
LIMIT 1;
```

```
                                                                            QUERY PLAN
-------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Limit  (cost=4.14..534.96 rows=1 width=16) (actual time=261.602..261.618 rows=0 loops=1)
   ->  Append  (cost=4.14..9028.12 rows=17 width=16) (actual time=261.572..261.586 rows=0 loops=1)
         ->  Bitmap Heap Scan on employees  (cost=4.14..8.15 rows=1 width=6) (actual time=0.383..0.387 rows=0 loops=1)
               Recheck Cond: (name = 'Bernard Marx'::text)
               Filter: (sys_period @> '2023-09-28 15:28:25+00'::timestamp with time zone)
               Rows Removed by Filter: 1
               Heap Blocks: exact=1
               ->  Bitmap Index Scan on employees_pkey  (cost=0.00..4.14 rows=1 width=0) (actual time=0.203..0.204 rows=1 loops=1)
                     Index Cond: (name = 'Bernard Marx'::text)
         ->  Seq Scan on employees_history_p2023_09_29_0028 employees_history  (cost=0.00..17.95 rows=1 width=20) (actual time=0.035..0.035 rows=0 loops=1)
               Filter: ((sys_period @> '2023-09-28 15:28:25+00'::timestamp with time zone) AND (name = 'Bernard Marx'::text))
         ->  Seq Scan on employees_history_p2023_09_29_0029 employees_history_1  (cost=0.00..17.95 rows=1 width=20) (actual time=0.012..0.012 rows=0 loops=1)
               Filter: ((sys_period @> '2023-09-28 15:28:25+00'::timestamp with time zone) AND (name = 'Bernard Marx'::text))
         ->  Seq Scan on employees_history_p2023_09_29_0030 employees_history_2  (cost=0.00..17.95 rows=1 width=20) (actual time=0.139..0.139 rows=0 loops=1)
               Filter: ((sys_period @> '2023-09-28 15:28:25+00'::timestamp with time zone) AND (name = 'Bernard Marx'::text))
               Rows Removed by Filter: 31
         ->  Seq Scan on employees_history_p2023_09_29_0031 employees_history_3  (cost=0.00..2928.53 rows=1 width=6) (actual time=107.100..107.100 rows=0 loops=1)
               Filter: ((sys_period @> '2023-09-28 15:28:25+00'::timestamp with time zone) AND (name = 'Bernard Marx'::text))
               Rows Removed by Filter: 99969
         ->  Seq Scan on employees_history_p2023_09_29_0032 employees_history_4  (cost=0.00..17.95 rows=1 width=20) (actual time=0.033..0.033 rows=0 loops=1)
               Filter: ((sys_period @> '2023-09-28 15:28:25+00'::timestamp with time zone) AND (name = 'Bernard Marx'::text))
         ->  Seq Scan on employees_history_p2023_09_29_0033 employees_history_5  (cost=0.00..17.95 rows=1 width=20) (actual time=0.004..0.004 rows=0 loops=1)
               Filter: ((sys_period @> '2023-09-28 15:28:25+00'::timestamp with time zone) AND (name = 'Bernard Marx'::text))
         ->  Seq Scan on employees_history_p2023_09_29_0034 employees_history_6  (cost=0.00..17.95 rows=1 width=20) (actual time=0.004..0.004 rows=0 loops=1)
               Filter: ((sys_period @> '2023-09-28 15:28:25+00'::timestamp with time zone) AND (name = 'Bernard Marx'::text))
         ->  Seq Scan on employees_history_p2023_09_29_0035 employees_history_7  (cost=0.00..2852.89 rows=1 width=6) (actual time=75.441..75.441 rows=0 loops=1)
               Filter: ((sys_period @> '2023-09-28 15:28:25+00'::timestamp with time zone) AND (name = 'Bernard Marx'::text))
               Rows Removed by Filter: 97393
         ->  Seq Scan on employees_history_p2023_09_29_0036 employees_history_8  (cost=0.00..3005.11 rows=1 width=6) (actual time=78.196..78.196 rows=0 loops=1)
               Filter: ((sys_period @> '2023-09-28 15:28:25+00'::timestamp with time zone) AND (name = 'Bernard Marx'::text))
               Rows Removed by Filter: 102607
         ->  Seq Scan on employees_history_p2023_09_29_0037 employees_history_9  (cost=0.00..17.95 rows=1 width=20) (actual time=0.011..0.011 rows=0 loops=1)
               Filter: ((sys_period @> '2023-09-28 15:28:25+00'::timestamp with time zone) AND (name = 'Bernard Marx'::text))
         ->  Seq Scan on employees_history_p2023_09_29_0038 employees_history_10  (cost=0.00..17.95 rows=1 width=20) (actual time=0.004..0.004 rows=0 loops=1)
               Filter: ((sys_period @> '2023-09-28 15:28:25+00'::timestamp with time zone) AND (name = 'Bernard Marx'::text))
         ->  Seq Scan on employees_history_p2023_09_29_0039 employees_history_11  (cost=0.00..17.95 rows=1 width=20) (actual time=0.003..0.003 rows=0 loops=1)
               Filter: ((sys_period @> '2023-09-28 15:28:25+00'::timestamp with time zone) AND (name = 'Bernard Marx'::text))
         ->  Seq Scan on employees_history_p2023_09_29_0040 employees_history_12  (cost=0.00..17.95 rows=1 width=20) (actual time=0.007..0.008 rows=0 loops=1)
               Filter: ((sys_period @> '2023-09-28 15:28:25+00'::timestamp with time zone) AND (name = 'Bernard Marx'::text))
         ->  Seq Scan on employees_history_p2023_09_29_0041 employees_history_13  (cost=0.00..17.95 rows=1 width=20) (actual time=0.004..0.004 rows=0 loops=1)
               Filter: ((sys_period @> '2023-09-28 15:28:25+00'::timestamp with time zone) AND (name = 'Bernard Marx'::text))
         ->  Seq Scan on employees_history_p2023_09_29_0042 employees_history_14  (cost=0.00..17.95 rows=1 width=20) (actual time=0.003..0.004 rows=0 loops=1)
               Filter: ((sys_period @> '2023-09-28 15:28:25+00'::timestamp with time zone) AND (name = 'Bernard Marx'::text))
         ->  Seq Scan on employees_history_default employees_history_15  (cost=0.00..17.95 rows=1 width=20) (actual time=0.003..0.003 rows=0 loops=1)
               Filter: ((sys_period @> '2023-09-28 15:28:25+00'::timestamp with time zone) AND (name = 'Bernard Marx'::text))
 Planning Time: 12.427 ms
 Execution Time: 262.706 ms
(47 rows)
```
This query took 263 milliseconds, and most of the time was spent scanning the the partitions with the most versions. It's notable that we have to scan all partitions, because we are partitioning by `created_at`, which means when the version was created, not partitioning by `sys_period`, which is what we are looking for.

If this was a real workload, I doubt that employees' salaries are being updated so frequently, or at least that's been the case in my personal experience. However, if it's a big company, then there could be a lot of employees. In that case, it would be best to add an index on the name (or more realistically, employee ID) in the **employees_history** table. Then, withing each partition it will find only rows for the employee being queryed using the index, then it would scan the remaining rows, probably typically zero, one, or two rows, to find the correct salary.

### Expiring old versions

Earlier in this blog, we configured **pg_partman** to partition in 1 minute increments, to expire partitions that are older than 15 minutes, and to check every 30 seconds. Every 30 seconds, any partition that is older that 15 minutes is deleted by the **pg_partman** background worker.

With this query, I can check how many rows and the total data size in each partition.
```sql
-- This query was produced by ChatGPT 4 with the prompt:
-- "How can I check the number of rows in each partition of employees_history?"
SELECT
    child.relname AS partition_name,
    pg_total_relation_size(child.oid) AS total_size,
    pg_relation_size(child.oid) AS data_size,
    pg_stat_user_tables.n_live_tup AS row_count
FROM
    pg_inherits
JOIN
    pg_class parent ON pg_inherits.inhparent = parent.oid
JOIN
    pg_class child ON pg_inherits.inhrelid = child.oid
LEFT JOIN
    pg_stat_user_tables ON child.oid = pg_stat_user_tables.relid
WHERE
    parent.relname='employees_history'
ORDER BY
    partition_name;
```

In order to check that old versions are being dropped, I ran the procedure to create a lot of salaray increments several times in a row.

Then, running the above query, I find an output like this:


```
           partition_name           | total_size | data_size | row_count
------------------------------------+------------+-----------+-----------
 employees_history_default          |      16384 |         0 |         0
 employees_history_p2023_09_28_2204 |      16384 |         0 |         0
 employees_history_p2023_09_28_2205 |      16384 |         0 |         0
 employees_history_p2023_09_28_2206 |      16384 |         0 |         0
 employees_history_p2023_09_28_2207 |      16384 |         0 |         0
 employees_history_p2023_09_28_2208 |      16384 |         0 |         0
 employees_history_p2023_09_28_2209 |      16384 |         0 |         0
 employees_history_p2023_09_28_2210 |      32768 |      8192 |         4
 employees_history_p2023_09_28_2211 |    9584640 |   7995392 |     68267
 employees_history_p2023_09_28_2212 |    4489216 |   3719168 |     31733
 employees_history_p2023_09_28_2213 |   13180928 |  11018240 |     94144
 employees_history_p2023_09_28_2214 |     868352 |    688128 |      5856
 employees_history_p2023_09_28_2215 |      16384 |         0 |         0
 employees_history_p2023_09_28_2216 |      16384 |         0 |         0
 employees_history_p2023_09_28_2217 |      16384 |         0 |         0
 employees_history_p2023_09_28_2218 |      16384 |         0 |         0
(16 rows)
```
In this output, we can see that we have 1 partition for every minute, and a total of 15 partitions. I have old versions expiring after 10 minutes. I thought it's interesting to note that **pg_partman** is preemptively creating partitions for the future, in this case 5 minutes into the future.

If you refer to the original set up steps, I have configured `infinite_time_partitions = true`, and this means we will generate partitions even when we are not generating any data for them. I think this is the proper configuration since we also have a retention policy that will drop the old partitions. The concern of making infinite partitions as time passes, even if no data is being generated, is not applicable because old tables are being dropped.

To confirm data was being deleted, I sampled the above query over time, and we can see the large body of inserts moving up into the oldest available partitions, then falling outside of the retention policy and being deleted.

```

           partition_name           | total_size | data_size | row_count
------------------------------------+------------+-----------+-----------
 employees_history_default          |      16384 |         0 |         0
 employees_history_p2023_09_28_2207 |      16384 |         0 |         0
 employees_history_p2023_09_28_2208 |      16384 |         0 |         0
 employees_history_p2023_09_28_2209 |      16384 |         0 |         0
 employees_history_p2023_09_28_2210 |      32768 |      8192 |         4
 employees_history_p2023_09_28_2211 |    9584640 |   7995392 |     68267
 employees_history_p2023_09_28_2212 |    4489216 |   3719168 |     31733
 employees_history_p2023_09_28_2213 |   13189120 |  11018240 |     94144
 employees_history_p2023_09_28_2214 |     876544 |    688128 |      5856
 employees_history_p2023_09_28_2215 |      16384 |         0 |         0
 employees_history_p2023_09_28_2216 |      16384 |         0 |         0
 employees_history_p2023_09_28_2217 |      16384 |         0 |         0
 employees_history_p2023_09_28_2218 |      16384 |         0 |         0
 employees_history_p2023_09_28_2219 |      16384 |         0 |         0
 employees_history_p2023_09_28_2220 |      16384 |         0 |         0
 employees_history_p2023_09_28_2221 |      16384 |         0 |         0
(16 rows)


           partition_name           | total_size | data_size | row_count
------------------------------------+------------+-----------+-----------
 employees_history_default          |      16384 |         0 |         0
 employees_history_p2023_09_28_2211 |    9584640 |   7995392 |     68267
 employees_history_p2023_09_28_2212 |    4489216 |   3719168 |     31733
 employees_history_p2023_09_28_2213 |   13189120 |  11018240 |     94144
 employees_history_p2023_09_28_2214 |     876544 |    688128 |      5856
 employees_history_p2023_09_28_2215 |      16384 |         0 |         0
 employees_history_p2023_09_28_2216 |      16384 |         0 |         0
 employees_history_p2023_09_28_2217 |      16384 |         0 |         0
 employees_history_p2023_09_28_2218 |      16384 |         0 |         0
 employees_history_p2023_09_28_2219 |      16384 |         0 |         0
 employees_history_p2023_09_28_2220 |      16384 |         0 |         0
 employees_history_p2023_09_28_2221 |      16384 |         0 |         0
 employees_history_p2023_09_28_2222 |      16384 |         0 |         0
 employees_history_p2023_09_28_2223 |      16384 |         0 |         0
 employees_history_p2023_09_28_2224 |      16384 |         0 |         0
 employees_history_p2023_09_28_2225 |      16384 |         0 |         0
(16 rows)


           partition_name           | total_size | data_size | row_count
------------------------------------+------------+-----------+-----------
 employees_history_default          |      16384 |         0 |         0
 employees_history_p2023_09_28_2212 |    4489216 |   3719168 |     31733
 employees_history_p2023_09_28_2213 |   13189120 |  11018240 |     94144
 employees_history_p2023_09_28_2214 |     876544 |    688128 |      5856
 employees_history_p2023_09_28_2215 |      16384 |         0 |         0
 employees_history_p2023_09_28_2216 |      16384 |         0 |         0
 employees_history_p2023_09_28_2217 |      16384 |         0 |         0
 employees_history_p2023_09_28_2218 |      16384 |         0 |         0
 employees_history_p2023_09_28_2219 |      16384 |         0 |         0
 employees_history_p2023_09_28_2220 |      16384 |         0 |         0
 employees_history_p2023_09_28_2221 |      16384 |         0 |         0
 employees_history_p2023_09_28_2222 |      16384 |         0 |         0
 employees_history_p2023_09_28_2223 |      16384 |         0 |         0
 employees_history_p2023_09_28_2224 |      16384 |         0 |         0
 employees_history_p2023_09_28_2225 |      16384 |         0 |         0
 employees_history_p2023_09_28_2226 |      16384 |         0 |         0
(16 rows)

postgres=# select count(*) from employees_history;
 count
--------
 131733
(1 row)

           partition_name           | total_size | data_size | row_count
------------------------------------+------------+-----------+-----------
 employees_history_default          |      16384 |         0 |         0
 employees_history_p2023_09_28_2214 |     876544 |    688128 |      5856
 employees_history_p2023_09_28_2215 |      16384 |         0 |         0
 employees_history_p2023_09_28_2216 |      16384 |         0 |         0
 employees_history_p2023_09_28_2217 |      16384 |         0 |         0
 employees_history_p2023_09_28_2218 |      16384 |         0 |         0
 employees_history_p2023_09_28_2219 |      16384 |         0 |         0
 employees_history_p2023_09_28_2220 |      16384 |         0 |         0
 employees_history_p2023_09_28_2221 |      16384 |         0 |         0
 employees_history_p2023_09_28_2222 |      16384 |         0 |         0
 employees_history_p2023_09_28_2223 |      16384 |         0 |         0
 employees_history_p2023_09_28_2224 |      16384 |         0 |         0
 employees_history_p2023_09_28_2225 |      16384 |         0 |         0
 employees_history_p2023_09_28_2226 |      16384 |         0 |         0
 employees_history_p2023_09_28_2227 |      16384 |         0 |         0
 employees_history_p2023_09_28_2228 |      16384 |         0 |         0
(16 rows)

postgres=# select count(*) from employees_history;
 count
-------
  5856
(1 row)

           partition_name           | total_size | data_size | row_count
------------------------------------+------------+-----------+-----------
 employees_history_default          |      16384 |         0 |         0
 employees_history_p2023_09_28_2215 |      16384 |         0 |         0
 employees_history_p2023_09_28_2216 |      16384 |         0 |         0
 employees_history_p2023_09_28_2217 |      16384 |         0 |         0
 employees_history_p2023_09_28_2218 |      16384 |         0 |         0
 employees_history_p2023_09_28_2219 |      16384 |         0 |         0
 employees_history_p2023_09_28_2220 |      16384 |         0 |         0
 employees_history_p2023_09_28_2221 |      16384 |         0 |         0
 employees_history_p2023_09_28_2222 |      16384 |         0 |         0
 employees_history_p2023_09_28_2223 |      16384 |         0 |         0
 employees_history_p2023_09_28_2224 |      16384 |         0 |         0
 employees_history_p2023_09_28_2225 |      16384 |         0 |         0
 employees_history_p2023_09_28_2226 |      16384 |         0 |         0
 employees_history_p2023_09_28_2227 |      16384 |         0 |         0
 employees_history_p2023_09_28_2228 |      16384 |         0 |         0
 employees_history_p2023_09_28_2229 |      16384 |         0 |         0
(16 rows)

postgres=# select count(*) from employees_history;
 count
-------
     0
(1 row)
```

## Thanks!

If you got this far, thank you for reading this! I hope that you are inspired to try out extensions on your own and see what they can do. The next time you have some problem to solve with your data, consider that maybe it could just be handled by a Postgres extension.

If you want to try extensions without any local setup, you should try Tembo Cloud at [cloud.tembo.io](https://cloud.tembo.io).

Just use Postgres!
