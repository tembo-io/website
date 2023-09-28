---
slug: table-version-history
title: "Version History and Lifecycle Policies for Postgres Tables"
authors: [steven]
tags: [postgres, extensions, temporal_tables, pg_partman, trunk]
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

-- Adding version history to the table,
-- first we need to add a time range to the existing table.
-- This represents "since when" has this row been current.
ALTER TABLE employees ADD COLUMN sys_period tstzrange NOT NULL;

-- Creating a time-partitioned version table
-- each row has the range the data was valid for,
-- and also the time this version was created.
CREATE TABLE employees_history (
    LIKE employees INCLUDING DEFAULTS EXCLUDING INDEXES EXCLUDING CONSTRAINTS,
    created_at timestamptz NOT NULL DEFAULT now())
    PARTITION BY RANGE (created_at);

-- Allow efficient querying of partition key
CREATE INDEX ON employees_history (created_at);

-- Enable automatic partitioning with pg_partman
SELECT create_parent('public.employees_history', 'created_at', 'native', 'daily');

-- This connects employees table to employees_history
CREATE TRIGGER versioning_trigger
    BEFORE INSERT OR UPDATE OR DELETE ON employees
    FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period',
                                              'employees_history',
                                              true);

-- Configure retention policy for employee history
UPDATE part_config
    SET retention = '365 days',
        retention_keep_table = false,
        retention_keep_index = false
    WHERE parent_table = 'public.employees_history';
```

**custom.conf:** our additions to the Postgres configuration.

```
# Enable pg_partman background worker
shared_preload_libraries = 'pg_partman_bgw'

# How many seconds between pg_partman background worker runs
pg_partman_bgw.interval = 3600

# Which database pg_partman should target
pg_partman_bgw.dbname = 'postgres'

# Can be further improved by using limited permissions
# pg_partman_bgw.role = 'limitedrole'

# This was helpful when I was working on getting the settings working
# log_min_messages = 'DEBUG1'
```

With those four files in place, we can run Postgres like this:

```bash
docker build -t example-local-image .
docker run -it --name local-tembo -p 5432:5432 --rm example-local-image
```

In a separate shell, I connect into the Postgres container.

```bash
psql postgres://postgres:postgres@localhost:5432
```

## temporal_tables

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

Now, the **employees** has some data, and employees_history is still empty.
```
SELECT * FROM employees;

       name       |            department            |  salary  |             sys_period
------------------+----------------------------------+----------+------------------------------------
 Bernard Marx     | Hatchery and Conditioning Centre | 10000.00 | ["2023-09-28 13:57:34.680654+00",)
 Lenina Crowne    | Hatchery and Conditioning Centre |  7000.00 | ["2023-09-28 13:57:34.734182+00",)
 Helmholtz Watson | College of Emotional Engineering | 18500.00 | ["2023-09-28 13:57:34.737762+00",)
(3 rows)

SELECT * FROM employees_history;

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
SELECT * FROM employees;

       name       |            department            |  salary  |             sys_period
------------------+----------------------------------+----------+------------------------------------
 Helmholtz Watson | College of Emotional Engineering | 18500.00 | ["2023-09-28 13:57:34.737762+00",)
 Bernard Marx     | Hatchery and Conditioning Centre | 11600.00 | ["2023-09-28 14:03:17.889818+00",)
 Lenina Crowne    | Hatchery and Conditioning Centre | 11601.00 | ["2023-09-28 14:03:17.892413+00",)
(3 rows)

SELECT * FROM employees_history;

     name      |            department            |  salary  |                            sys_period                             |          created_at
---------------+----------------------------------+----------+-------------------------------------------------------------------+-------------------------------
 Bernard Marx  | Hatchery and Conditioning Centre | 10000.00 | ["2023-09-28 13:57:34.680654+00","2023-09-28 14:03:17.842956+00") | 2023-09-28 14:03:17.842956+00
 Bernard Marx  | Hatchery and Conditioning Centre | 11200.00 | ["2023-09-28 14:03:17.842956+00","2023-09-28 14:03:17.885354+00") | 2023-09-28 14:03:17.885354+00
 Bernard Marx  | Hatchery and Conditioning Centre | 11400.00 | ["2023-09-28 14:03:17.885354+00","2023-09-28 14:03:17.889818+00") | 2023-09-28 14:03:17.889818+00
 Lenina Crowne | Hatchery and Conditioning Centre |  7000.00 | ["2023-09-28 13:57:34.734182+00","2023-09-28 14:03:17.892413+00") | 2023-09-28 14:03:17.892413+00
(4 rows)
```

### Querying past versions

Let's say we want to look up Bernard's salary at a previous date. We will likely want to check both the **employees** table and the **employees_history** table to find the row where the time range matches our provided timestamp.

```sql
SELECT salary
FROM employees_history
WHERE name = 'Bernard Marx'
AND sys_period @> TIMESTAMP WITH TIME ZONE '2023-09-28 13:58:00+00';
```

This output looks correct, comparing with the above **employees_history** table.
```
  salary
----------
 10000.00
(1 row)
```

`@>` Is a *containment operator* and you might recognize it if you have used [JSONB](https://tembo.io/docs/postgres_guides/postgres-basics/jsonb).


#### Querying from a table and its history

One problem with the above query is that we assume the provided timestamp is from a previous version. But what if we provided a timestamp for which the current version is valid? After all, that seems a more likely use case.

To simplify this, we can first create a [view](https://www.postgresql.org/docs/current/tutorial-views.html). We only need to do this once, then we can query this view like a table going forward.
```sql
CREATE VIEW employee_history_view AS

SELECT name, department, salary, sys_period
FROM employees

UNION ALL

SELECT name, department, salary, sys_period
FROM employees_history;
```

We can use this query instead to find Bernard's salary at any given date.

```sql
SELECT salary
FROM employee_history_view
WHERE name = 'Bernard Marx'
AND sys_period @> TIMESTAMP WITH TIME ZONE '2023-09-28 13:58:00+00'
LIMIT 1;
```

This still returns the correct result for the same timestamp we used in the previous example:
```
SELECT salary
FROM employee_history_view
WHERE name = 'Bernard Marx'
AND sys_period @> TIMESTAMP WITH TIME ZONE '2023-09-28 13:58:00+00'
LIMIT 1;

  salary
----------
 10000.00
(1 row)
```

But now, it also works to look up the current salary:

```
SELECT salary
FROM employee_history_view
WHERE name = 'Bernard Marx'
AND sys_period @> TIMESTAMP WITH TIME ZONE '2023-09-28 14:38:00+00'
LIMIT 1;

  salary
----------
 11600.00
(1 row)


SELECT salary FROM employees WHERE name = 'Bernard Marx';

  salary
----------
 11600.00
(1 row)
```

If I try to query a salary from the future, it will return the current salary. If I try to query a salary from before Bernard is known in the **employees_history** table, then I get an empty result.

-------------------

Perfoming an update:

```sql
UPDATE employees SET salary = 11200 WHERE name = 'Bernard Marx';
```

After performing an update, now the employees_history table has one previous version stored!

```
postgres=# SELECT * FROM employees;
       name       |            department            |  salary  |             sys_period
------------------+----------------------------------+----------+------------------------------------
 Lenina Crowne    | Hatchery and Conditioning Centre |  7000.00 | ["2023-09-13 15:44:18.01873+00",)
 Helmholtz Watson | College of Emotional Engineering | 18500.00 | ["2023-09-13 15:44:21.665618+00",)
 Bernard Marx     | Hatchery and Conditioning Centre | 11200.00 | ["2023-09-13 15:45:59.918723+00",)
(3 rows)

postgres=# select * from employees_history;
     name     |            department            |  salary  |                            sys_period
--------------+----------------------------------+----------+-------------------------------------------------------------------
 Bernard Marx | Hatchery and Conditioning Centre | 10000.00 | ["2023-09-13 15:44:13.764502+00","2023-09-13 15:45:59.918723+00")
(1 row)
```

**I would like to also automatically delete old versions.** For this, let's use pg_partman.

### Partitions and expiry

Partitioning tables is something I’m familiar with from Tembo’s work in [PGMQ](https://github.com/tembo-io/pgmq). PGMQ can optionally work with another extension, pg_partman, an extension which helps Postgres automatically manage a partitioned table. In this example, it can be a cool way to show how combining different extensions can solve specific problems.

**What is partitioning?** [Postgres documentation](https://www.postgresql.org/docs/current/ddl-partitioning.html) has detailed information on partitioning but just to summarize, partitioning is about splitting what is logically one large table into smaller tables. A typical example is event data where a table is updated with new rows that represent something that happened at a particular time. This can end up as a table with a lot of rows, so it can take a lot of time to scan the whole table, but maybe your application is mostly accessing recent rows. So, partitioning by time (splitting up the data into time chunks, each a different partition) helps improve query performance.

:::info
When using a time-partitioned table, querying recent events only needs to consider a small table, the most recent partition.
:::

Let’s add **pg_partman** to our database, configure our employees_history table to be time-partitioned, and configure it to expire old data.

### pg_partman

First, I’ll update my database to install pg_partman. **pg_partman requires both `CREATE EXTENSION` and `LOAD`** because it’s an extension with SQL that uses hooks. pg_partman hooks into Postgres' initialization to start a background worker. I think it can be confusing how different extensions are turned on in different ways, and that's why I wrote [this blog post](https://tembo.io/blog/four-types-of-extensions) to categorize how extensions are turned on.

**Dockerfile:**
```Dockerfile
FROM quay.io/tembo/tembo-local:latest

RUN trunk install pg_partman
RUN trunk install temporal_tables

COPY custom.conf $PGDATA/extra-configs
COPY startup.sql $PGDATA/startup-scripts
```

**custom.conf:**
```
shared_preload_libraries = 'pg_partman_bgw'
```

**startup.sql:**
```sql
CREATE EXTENSION IF NOT EXISTS temporal_tables;
CREATE EXTENSION IF NOT EXISTS pg_partman;
```

**Then, I start my database again:**
```bash
docker build -t example-local-image .
docker run -it --name local-tembo -p 5432:5432 --rm example-local-image
```

**Check the extensions are enabled:**
```
postgres=# \dx
                                 List of installed extensions
      Name       | Version |   Schema   |                     Description
-----------------+---------+------------+------------------------------------------------------
 pg_partman      | 4.7.3   | public     | Extension to manage partitioned tables by time or ID
 plpgsql         | 1.0     | pg_catalog | PL/pgSQL procedural language
 temporal_tables | 1.2.1   | public     | temporal tables
(3 rows)

postgres=# SHOW shared_preload_libraries;
 shared_preload_libraries
--------------------------
 pg_partman_bgw
(1 row)
```

**That only took me a few seconds to add in, and now I’m ready to start experimenting with pg_partman**. This allows me to focus my time on how this extension works and what I want to do with it, not on setup hassle. There is no other way to get up and running with extensions this fast.

### Making the version history partitioned

I need to combine the `pg_partman` process for creating a partitioned table with a retention policy with the `temporal_tables` process for creating versioned tables. After some tinkering, here is what I came up with:

**Dockerfile looks like this now:**
```Dockerfile
FROM quay.io/tembo/tembo-local:latest

RUN trunk install pg_partman
RUN trunk install temporal_tables

COPY custom.conf $PGDATA/extra-configs

# Note: now we have two startup sql scripts
COPY 0_startup.sql $PGDATA/startup-scripts
COPY 1_create_versioned_table.sql $PGDATA/startup-scripts
```
Above, now we have two sql scripts. I wanted to separate the `CREATE EXTENSION` part from my version history experiment.

**custom.conf needed one adjustment:**
```
shared_preload_libraries = 'pg_partman_bgw'

# New!
pg_partman_bgw.dbname = 'postgres'
```

**0_startup.sql is the same:**
```sql
CREATE EXTENSION IF NOT EXISTS temporal_tables;
CREATE EXTENSION IF NOT EXISTS pg_partman;
```

And here is my new script to create a versioned table, with a lifecycle policy!

**1_create_versioned_table.sql:**
```sql
-- Sample: an existing table we want to enable versioning on
CREATE TABLE employees
(
  name text NOT NULL PRIMARY KEY,
  department text,
  salary numeric(20, 2)
);

-- Adding version history to the table,
-- first we need to add a time range to the existing table.
-- This represents "since when" has this row been current.
ALTER TABLE employees ADD COLUMN sys_period tstzrange NOT NULL;

-- Creating a time-partitioned version table
-- each row has the range the data was valid for,
-- and also the time this version was created.
CREATE TABLE employees_history (
    LIKE employees INCLUDING DEFAULTS EXCLUDING INDEXES EXCLUDING CONSTRAINTS,
    created_at timestamptz NOT NULL DEFAULT now())
    PARTITION BY RANGE (created_at);

-- Allow efficient querying of partition key
CREATE INDEX ON employees_history (created_at);

-- Enable automatic partitioning with pg_partman
SELECT create_parent('public.employees_history', 'created_at', 'native', 'daily');

-- This connects employees table to employees_history
CREATE TRIGGER versioning_trigger
    BEFORE INSERT OR UPDATE OR DELETE ON employees
    FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period',
                                              'employees_history',
                                              true);

-- Configure retention policy for employee history
UPDATE part_config
    SET retention = '365 days',
        retention_keep_table = false,
        retention_keep_index = false
    WHERE parent_table = 'public.employees_history';
```

### Check if it works

To save myself 1 year, I reconfigured the retention to 5 minutes, and partitioning interval to 1 minute.

**Modified excerpt from  1_create_versioned_table.sql:**
```sql
 SELECT create_parent('public.employees_history', 'created_at', 'native', '1 minute');
…
UPDATE part_config
    SET retention = '5 minutes',
        retention_keep_table = false,
        retention_keep_index = false
    WHERE parent_table = 'public.employees_history';
```

:::note
I recommend you do not actually set this low of a partitioning interval, but I encourage you to do whatever you want.
:::

Also, I had to add one more configuration for pg_partman.

**custom.conf:**
```
shared_preload_libraries = 'pg_partman_bgw'
pg_partman_bgw.dbname = 'postgres'

# New! Run background worker every 30 seconds
pg_partman_bgw.interval = 30
```

I restarted my container, so I am on a fresh and empty database, other than my startup scripts.

**I added data to the table, just like I did before:**

```sql
INSERT INTO employees (name, department, salary)
VALUES ('Bernard Marx', 'Hatchery and Conditioning Centre', 10000);

INSERT INTO employees (name, department, salary)
VALUES ('Lenina Crowne', 'Hatchery and Conditioning Centre', 7000);

INSERT INTO employees (name, department, salary)
VALUES ('Helmholtz Watson', 'College of Emotional Engineering', 18500);
```

**Then, I modified a few of the rows:**
```sql
UPDATE employees SET salary = 11200 WHERE name = 'Bernard Marx';
UPDATE employees SET salary = 11400 WHERE name = 'Bernard Marx';
UPDATE employees SET salary = 11600 WHERE name = 'Bernard Marx';
UPDATE employees SET salary = 11601 WHERE name = 'Lenina Crowne';
```

**I waited a minute or so, then I did one more update:**
```sql
UPDATE employees SET salary = 11600 WHERE name = 'Helmholtz Watson';
```

**Checking what the data looks like shortly after updating:**
```
postgres=# select * from employees;
       name       |            department            |  salary  |             sys_period
------------------+----------------------------------+----------+------------------------------------
 Helmholtz Watson | College of Emotional Engineering | 18500.00 | ["2023-09-13 18:33:18.703002+00",)
 Bernard Marx     | Hatchery and Conditioning Centre | 11600.00 | ["2023-09-13 18:33:23.562748+00",)
 Lenina Crowne    | Hatchery and Conditioning Centre | 11601.00 | ["2023-09-13 18:33:23.565158+00",)
(3 rows)

postgres=# select * from employees_history;
     name      |            department            |  salary  |                            sys_period                             |          created_at
---------------+----------------------------------+----------+-------------------------------------------------------------------+-------------------------------
 Bernard Marx  | Hatchery and Conditioning Centre | 10000.00 | ["2023-09-13 18:33:18.613263+00","2023-09-13 18:33:23.480441+00") | 2023-09-13 18:33:23.480441+00
 Bernard Marx  | Hatchery and Conditioning Centre | 11200.00 | ["2023-09-13 18:33:23.480441+00","2023-09-13 18:33:23.55839+00")  | 2023-09-13 18:33:23.55839+00
 Bernard Marx  | Hatchery and Conditioning Centre | 11400.00 | ["2023-09-13 18:33:23.55839+00","2023-09-13 18:33:23.562748+00")  | 2023-09-13 18:33:23.562748+00
 Lenina Crowne | Hatchery and Conditioning Centre |  7000.00 | ["2023-09-13 18:33:18.700762+00","2023-09-13 18:33:23.565158+00") | 2023-09-13 18:33:23.565158+00
(4 rows)
```
Above, we see all versions are still retained.

Then, I tabbed over to Slack since I need to wait 5 minutes. 2 hours later...

**Now we see:**

```
postgres=# select * from employees_history;
 name | department | salary | sys_period | created_at
------+------------+--------+------------+------------
(0 rows)
```

That worked!

I took a video watching the extensions_history table to capture the moment the first batch of updates was deleted.

:::info
In psql, use `\watch` to re-run the last command you ran over and over
:::

**We see rows are deleted according to their retention policy:**

![auto-delete](./images/auto-delete.png)


--------

## Performance

We created a view which is a union between **employees** and **employees_history**, then we query the view to find an employee's salary at a given time.

### Writes

We should expect write performance to be slower, since we are writing to two tables for every update.

I created a new table that does not have versioning enabled to compare write performance.
```sql
CREATE TABLE employees_write_test
AS TABLE employees
WITH NO DATA;

INSERT INTO employees_write_test (name, department, salary, sys_period)
VALUES ('Bernard Marx', 'Hatchery and Conditioning Centre', 11600.00, tstzrange(now(), null));
```

Then, I used `EXPLAIN ANALYZE` to compare the write performance.
```
postgres=# explain analyze UPDATE employees SET salary = 11608 WHERE name = 'Bernard Marx';
                                                         QUERY PLAN
-----------------------------------------------------------------------------------------------------------------------------
 Update on employees  (cost=4.14..8.15 rows=0 width=0) (actual time=4.411..4.420 rows=0 loops=1)
   ->  Bitmap Heap Scan on employees  (cost=4.14..8.15 rows=1 width=26) (actual time=0.909..0.940 rows=1 loops=1)
         Recheck Cond: (name = 'Bernard Marx'::text)
         Heap Blocks: exact=1
         ->  Bitmap Index Scan on employees_pkey  (cost=0.00..4.14 rows=1 width=0) (actual time=0.647..0.650 rows=1 loops=1)
               Index Cond: (name = 'Bernard Marx'::text)
 Planning Time: 1.697 ms
 Trigger versioning_trigger: time=2.390 calls=1
 Execution Time: 4.889 ms
(9 rows)

postgres=# explain analyze UPDATE employees_write_test SET salary = 11608 WHERE name = 'Bernard Marx';
                                                      QUERY PLAN
----------------------------------------------------------------------------------------------------------------------
 Update on employees_write_test  (cost=0.00..10.01 rows=0 width=0) (actual time=1.523..1.540 rows=0 loops=1)
   ->  Seq Scan on employees_write_test  (cost=0.00..10.01 rows=1 width=26) (actual time=0.596..0.617 rows=1 loops=1)
         Filter: (name = 'Bernard Marx'::text)
 Planning Time: 3.502 ms
 Execution Time: 2.647 ms
(5 rows)
```
I found it's about twice as slow to write when versioning is enabled. That's expected because since are writing to two tables, both the primary table and the history table.

Read query performance is likely more important for most use cases.

### Reads

First, let's generate 100,000 changes to Bernard's salary. The below example uses [PL/pgSQL](https://www.postgresql.org/docs/current/plpgsql.html). By default, PL/pgSQL functions run as a single transaction, so it would only result in a single update to the **employees_history** table. For this reason, I am using a procedure with `COMMIT` so that each increment will be a separate transaction, this way we also get 100,000 updates to the **employees_history** table. I had to explain that nuance to chatGPT in order for this query to be produced properly.

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

This took 54 seconds to run on my laptop. Also, while working on this blog post, I ran that command several times. So, now I have an **employees_history** table that's populated with over half a million rows for Bernard.

```
SELECT count(*) FROM employees_history WHERE name = 'Bernard Marx';

 count
--------
 537793
(1 row)
```

Let's run the same type of query command we ran before, with `EXPLAIN ANALYZE`. I picked a timestamp from the middle of the **employees_history** table, so that it does not get lucky and return from scanning early, since we also have `LIMIT 1` in the query. If I use the same timestamp from the previous example, it's found early in the scan and the read only takes 1 or 2 milliseconds.

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
---------------------------------------------------------------------------------------------------------------------------------------------------------------
 Limit  (cost=4.14..1451.00 rows=1 width=18) (actual time=212.125..212.141 rows=1 loops=1)
   ->  Append  (cost=4.14..15919.67 rows=11 width=18) (actual time=212.090..212.101 rows=1 loops=1)
         ->  Bitmap Heap Scan on employees  (cost=4.14..8.15 rows=1 width=7) (actual time=0.852..0.854 rows=0 loops=1)
               Recheck Cond: (name = 'Bernard Marx'::text)
               Filter: (sys_period @> '2023-09-28 15:35:26+00'::timestamp with time zone)
               Rows Removed by Filter: 1
               Heap Blocks: exact=1
               ->  Bitmap Index Scan on employees_pkey  (cost=0.00..4.14 rows=1 width=0) (actual time=0.383..0.384 rows=6 loops=1)
                     Index Cond: (name = 'Bernard Marx'::text)

         ->  Seq Scan on employees_history_p2023_09_24 employees_history  (cost=0.00..17.95 rows=1 width=20) (actual time=0.034..0.035 rows=0 loops=1)
               Filter: ((sys_period @> '2023-09-28 15:35:26+00'::timestamp with time zone) AND (name = 'Bernard Marx'::text))

		 ... some partitions omitted here ...

         ->  Seq Scan on employees_history_p2023_09_28 employees_history_4  (cost=0.00..15749.91 rows=1 width=6) (actual time=210.503..210.503 rows=1 loops=1)
               Filter: ((sys_period @> '2023-09-28 15:35:26+00'::timestamp with time zone) AND (name = 'Bernard Marx'::text))
               Rows Removed by Filter: 173150

         ->  Seq Scan on employees_history_p2023_09_29 employees_history_5  (cost=0.00..17.95 rows=1 width=20) (never executed)
               Filter: ((sys_period @> '2023-09-28 15:35:26+00'::timestamp with time zone) AND (name = 'Bernard Marx'::text))

		 ... some partitions omitted here ...

 Planning Time: 8.394 ms
 Execution Time: 213.199 ms
(32 rows)
```
This query took 213 milliseconds, and most of the time was spent scanning the **employees_history** table, on one of the partitions. We see it scanned and filtered 173,150 rows in the partition before it found a matching row, then returned that value.

If this was a real workload, I doubt that employees' salaries are being updated so frequently, or at least that's been the case in my personal experience. However, if it's a big company, then there could be a lot of employees. In that case, it would be best to add an index on the name (or more realistically, employee ID) in the **employees_history** table. Then, they query plan can skip all partitions that cover time ranges not relevant to the query, then within a single partition it will find only rows for the employee being queryed using the index, then it would scan the remaining rows, probably always just one or two rows, to find the correct salary.

In this case, we are updating the salary over and over rapidly.

## Thanks!

If you got this far, thank you for reading this! I hope that you are inspired to try out extensions on your own and see what they can do. The next time you have some problem to solve with your data, consider that maybe it could just be handled by a Postgres extension.

If you want to try extensions without any local setup, you should try Tembo Cloud at [cloud.tembo.io](https://cloud.tembo.io).

Just use Postgres!
