---
slug: table-version-history
title: "Version History and Lifecycle Policies for Postgres Tables"
authors: [steven]
tags: [postgres, extensions, temporal_tables, pg_partman, trunk]
---

*Forgot to include WHERE...*

![back-in-time](./images/back-in-time.jpeg)

One of my favorite features of Amazon Web Services is S3 version history and lifecycle policies. When objects are updated or deleted, the old object version remains in the bucket, but it’s hidden. Old versions are deleted eventually by the lifecycle policy.

I would like something like that for my Postgres table data. **We can use the temporal_tables extension for version history, and combine it with pg_partman to partition by time, automatically expiring old versions.** This can be useful when you want to have a queryable history for a table, but it's not the best choice for your disaster recovery.

### Let’s set it up

[This guide](https://tembo.io/docs/tembo-cloud/try-extensions-locally) covers how to get set up to try out Postgres extensions.

**I made a Dockerfile like this:**

```Dockerfile
FROM quay.io/tembo/tembo-local:latest

RUN trunk install temporal_tables

COPY startup.sql $PGDATA/startup-scripts
```

Above, this uses a Tembo base image, then installs temporal_tables with Trunk.


**The content of startup.sql:**

```sql
CREATE EXTENSION IF NOT EXISTS temporal_tables;
```

Above, this enables the extension when the database starts.


**I’m running this command to start a Postgres container with temporal_tables:**

```bash
docker build -t example-local-image .
docker run -it --name local-tembo -p 5432:5432 --rm example-local-image
```

Above, this command builds my container then runs it. I have a separate shell open to connect into the container and try things out.

**I connect into my container like this:**

```bash
psql postgres://postgres:postgres@localhost:5432
```

### temporal_tables

**I checked the extension is enabled like this:**

```
postgres=# \dx
                     List of installed extensions
      Name       | Version |   Schema   |         Description
-----------------+---------+------------+------------------------------
 plpgsql         | 1.0     | pg_catalog | PL/pgSQL procedural language
 temporal_tables | 1.2.1   | public     | temporal tables
(2 rows)

```

**I created a sample table like this:**


```sql
CREATE TABLE employees
(
  name text NOT NULL PRIMARY KEY,
  department text,
  salary numeric(20, 2)
);
```

**Then, to add version history, I ran these commands:**

```sql
ALTER TABLE employees ADD COLUMN sys_period tstzrange NOT NULL;

CREATE TABLE employees_history (LIKE employees);

CREATE TRIGGER versioning_trigger
BEFORE INSERT OR UPDATE OR DELETE ON employees
FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period',
                                          'employees_history',
                                          true);
```

**This example is directly copy / pasted from the temporal_tables README.** Reviewing how it works, we see that we add a column to the existing table called “sys_period” which is a time range. That will represent “since when” has this row been the current value. I like how this extension is designed, it’s easy to understand how it’s working. We have a separate table called employees_history and this contains rows just like in the employees table, except that the time periods are defined.

It’s using a Postgres feature `TRIGGER` to perform the update into the history table when the employees table is updated. These are all normal Postgres commands until we get to the function `versioning( ... )`. This function is extended SQL from the **temporal_tables** extension.

**Following along with the example in the README, I inserted some data to the employees table:**

```sql
INSERT INTO employees (name, department, salary)
VALUES ('Bernard Marx', 'Hatchery and Conditioning Centre', 10000);

INSERT INTO employees (name, department, salary)
VALUES ('Lenina Crowne', 'Hatchery and Conditioning Centre', 7000);

INSERT INTO employees (name, department, salary)
VALUES ('Helmholtz Watson', 'College of Emotional Engineering', 18500);
```

```
postgres=# select * from employees;
       name       |            department            |  salary  |             sys_period
------------------+----------------------------------+----------+------------------------------------
 Bernard Marx     | Hatchery and Conditioning Centre | 10000.00 | ["2023-09-13 15:44:13.764502+00",)
 Lenina Crowne    | Hatchery and Conditioning Centre |  7000.00 | ["2023-09-13 15:44:18.01873+00",)
 Helmholtz Watson | College of Emotional Engineering | 18500.00 | ["2023-09-13 15:44:21.665618+00",)
(3 rows)


postgres=# select * from employees_history;
 name | department | salary | sys_period
------+------------+--------+------------
(0 rows)
```

**Now, we do an update:**

```sql
UPDATE employees SET salary = 11200 WHERE name = 'Bernard Marx';
```

```
postgres=# select * from employees;
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

**Having performed 1 update, now we find one row in the employees history table!**

Hey alright! That was pretty easy to do, and the data is already in a format that I know how to work with. I really like how even if I don’t know what the extension is doing under the hood, the data ends up in a format that is normal. This leaves me with an option to just turn it off if it’s giving me any issues, and I already have a data format that would make sense for version history that could be handled by my application, or by a different extension.

**Next, I would like to also automatically delete old versions.** In the temporal_tables README, it’s recommending one thing to try is partitioned tables, so let’s give it a shot.

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

## Thanks!

If you got this far, thank you for reading this! I hope that you are inspired to try out extensions on your own and see what they can do. The next time you have some problem to solve with your data, consider that maybe it could just be handled by a Postgres extension.

If you want to try extensions without any local setup, you should try Tembo Cloud at [cloud.tembo.io](https://cloud.tembo.io).

Just use Postgres!
