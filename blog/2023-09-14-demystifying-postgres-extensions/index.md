---
slug: demystifying-postgres-extensions
title: "Demystifying Postgres Extensions"
authors: [steven]
tags: [postgres, extensions, temporal_tables, pg_partman, trunk]
---

I’ve been a Postgres user for years, but before working at Tembo, I had never used Postgres extensions. Postgres has a ton of users, but I think most of them just don’t know about extensions or find them daunting. Let me share some of what I’ve learned about extensions and how we are simplifying the complexities involved.

These are the steps that are typically involved to get up and running with an extension:

- Find the extension you want
- Figure out how to build it
- Sometimes, installation of dependencies (for example with a package manager like apt)
- Sometimes, installation of other extensions that yours requires (goto ‘figure out how to build it’)
- Install your extension
- Sometimes, configure in shared_preload_libraries (more on this later)
- Sometimes, provide extension-specific configurations
- Sometimes, run `CREATE EXTENSION` to enable it

I think if it was easier to try out existing extensions, they would get a lot more use. They can be super useful and easy after being installed and enabled. Something I find particularly compelling is that unrelated extensions can be combined to solve different problems. **I’ll show an example later in this blog of enabling version history for a table by combining two extensions: temporal_tables, and pg_partman.**

## One does not simply turn on an extension

It can be tricky to turn on an extension, and that’s because different extensions have different parts. Extensions consist of SQL (either normal SQL or SQL including functionality provided by extensions) and libraries. A 'library' simply means code that should be accessible to Postgres. Also, to connect into Postgres' existing functionality, libraries can use a feature informally called 'hooks'. Hooks allow for overwriting default Postgres functionality, or calling back into an extension's code at the appropriate time (for example modifying Postgres start up behavior).

On the note of terminology, sometimes extensions are instead referred to as 'modules', but I like to simply refer to everything as an 'extension', but feel free to @ me on X to tell me I am wrong (@sjmiller609).

I believe that enabling an extension can be simplified by defining two categories: “requires load” true or false, and “create extension”, true or false.

:::info
Enabling an extension can be thought of like this:

|                             | Requires `CREATE EXTENSION`                                       | Does not require `CREATE EXTENSION`                           |
|-----------------------------|-------------------------------------------------------------------|---------------------------------------------------------------|
| **Requires `LOAD`**         | Extensions that use SQL and their libraries have hooks            | Extensions that do not use SQL                                |
| **Does not require `LOAD`** | SQL-only extensions, and SQL + libraries without hooks            | Not applicable                                                |
:::


## The files are *inside the computer!*

 `LOAD` is the command that tells Postgres to load a library. For example, if you installed the extension ‘auto explain’, then you will have a library file called ‘auto_explain.so’. It can be loaded into your session like `LOAD 'auto_explain';` meaning make the code accessible to Postgres by loading the compiled code on disk into memory. However this command is not typically used directly.

Extensions with libraries that do not use hooks do not need to be loaded because Postgres will automatically load the related libraries when `CREATE EXTENSION` is run. However, when hooks are used, an extension might require a `LOAD` at the appropriate time, for example on start up, before the extension can be considered ready. In this case the library should be configured in `shared_preload_libraries`, which Postgres uses for loading libraries on start up. Also, if `CREATE EXTENSION` is not required, since there is no SQL to use, then a load is needed, since otherwise the code is not in Postgres’ memory.

:::info
Extensions that require a `LOAD` can always be configured in `shared_preload_libraries`, but this configuration requires a restart to take effect. Some extensions can be loaded without a restart using `LOAD` directly, or using the `session_preload_libraries` configuration.
:::

## Uh, you forgot to mention installing the extension

Quick plug! You can just use the always free and open source [Trunk project](https://pgt.dev) to install over 150 different extensions, skipping the build process. Also, you can optionally start from one of Tembo’s container images to handle the system dependencies installation, which covers the most common dependencies of extensions. I wrote [this guide for trying out extensions locally](https://tembo.io/docs/tembo-cloud/try-extensions-locally). If you have any issues just reach out on our [community Slack channel](https://join.slack.com/t/tembocommunity/shared_invite/zt-20v3m8pwz-pPjeFaWSM~Bt3KUqDXff2A) and we can help.

If you don’t want to pull out your laptop and start hacking, just read along! I’ll show an example.

## Version history and lifecycle policies for your Postgres data

One of my favorite features of Amazon Web Services is S3 version history and lifecycle policies. When objects are updated or deleted, the old object version remains in the bucket, but it’s hidden. Old versions are deleted eventually by the lifecycle policy.

I would like something like that for my Postgres data. Let’s try with the temporal_tables extension.

### Let’s set it up

I made a Dockerfile like this:

```
FROM quay.io/tembo/tembo-local:latest

RUN trunk install temporal_tables

COPY startup.sql $PGDATA/startup-scripts
```

Above, this uses a Tembo base image, then installs temporal_tables with Trunk.


The content of startup.sql:

```sql
CREATE EXTENSION if not exists temporal_tables;
```

Above, this enables the extension when the database starts. `temporal_tables` requires CREATE EXTENSION, but does not require LOAD. I learned that by reading the documentation for this extension on the Trunk website.


I’m running this command to start a Postgres container:

```
docker build -t example-local-image . && docker run -it --name local-tembo -p 5432:5432 --rm example-local-image
```

Above, this command builds my container then runs it interactively. I have a separate shell open to connect into the container and try things out.

I connect into my container like this:

```
psql postgres://postgres:postgres@localhost:5432
```

### Version history with temporal_tables

I checked the extension is enabled like this

```
postgres=# \dx
                     List of installed extensions
      Name       | Version |   Schema   |         Description
-----------------+---------+------------+------------------------------
 plpgsql         | 1.0     | pg_catalog | PL/pgSQL procedural language
 temporal_tables | 1.2.1   | public     | temporal tables
(2 rows)

```

I created a sample table like this


```sql
CREATE TABLE employees
(
  name text NOT NULL PRIMARY KEY,
  department text,
  salary numeric(20, 2)
);
```

Then, to add version history, I ran these commands


```sql
ALTER TABLE employees ADD COLUMN sys_period tstzrange NOT NULL;

CREATE TABLE employees_history (LIKE employees);

CREATE TRIGGER versioning_trigger
BEFORE INSERT OR UPDATE OR DELETE ON employees
FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period',
                                          'employees_history',
                                          true);
```

This example is directly copy / pasted from the temporal_tables README. Reviewing how it works, we see that we add a column to the existing table called “sys_period” which is a time range. That will represent “since when” has this row been the current value. I like how this extension is designed, it’s easy to understand how it’s working. We have a separate table called employees_history and this contains rows just like in the employees table, except that the time periods are defined.

It’s using a Postgres feature “TRIGGER” to perform the update into the history table when the employees table is updated. These are all normal Postgres commands until we get to the function `versioning( ... )`. This function is extended SQL from the temporal_tables extension.

Following along with the example in the README, I inserted some data to the employees table.

```sql
INSERT INTO employees (name, department, salary)
VALUES ('Bernard Marx', 'Hatchery and Conditioning Centre', 10000);

INSERT INTO employees (name, department, salary)
VALUES ('Lenina Crowne', 'Hatchery and Conditioning Centre', 7000);

INSERT INTO employees (name, department, salary)
VALUES ('Helmholtz Watson', 'College of Emotional Engineering', 18500);
```

Checking the tables:
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

Now, we do an update!

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

Hey alright! That was pretty easy to do, and the data is already in a format that I already know how to work with. I really like how even if I don’t know what the extension is doing under the hood, the data ends up in a format that is normal. This leaves me with an option to just turn it off if it’s giving me any issues, and I already have a data format that would make sense for version history that could be handled by my application, or by a different extension.

I would like to also automatically delete old versions. In the temporal_tables README, it’s recommending one thing to try is partitioned tables, so let’s give it a shot.

### Partitions and expiry

Partitioning tables is something I’m familiar with from Tembo’s work in [PGMQ](https://github.com/tembo-io/pgmq). PGMQ can optionally work with another extension, pg_partman, an extension which helps Postgres automatically manage a partitioned table. In this example, it can be a cool way to show how combining different extensions can solve specific problems.

**What is partitioning?** [Postgres documentation](https://www.postgresql.org/docs/current/ddl-partitioning.html) has detailed information on partitioning but just to summarize, partitioning is about splitting what is logically one large table into smaller tables. A typical example is event data where a table is updated with new rows that represent something that happened at a particular time. This can end up as a table with a lot of rows, so it can take a lot of time to scan the whole table, but maybe your application is mostly accessing recent rows. So, partitioning by time (splitting up the data into time chunks, each a different partition) helps improve query performance. When time-partitioned, querying recent events only needs to look at a much smaller table, the most recent partition.

Let’s add pg_partman to our database, configure our employees_history table to be time-partitioned, and configure it to expire old data.

### Adding in pg_partman

First, I’ll update my database to install pg_partman. pg_partman requires both CREATE EXTENSION and LOAD because it’s an extension with SQL that uses hooks. I found that out by reading the README from the Trunk website.

Dockerfile
```
FROM quay.io/tembo/tembo-local:latest

RUN trunk install pg_partman
RUN trunk install temporal_tables

COPY custom.conf $PGDATA/extra-configs
COPY startup.sql $PGDATA/startup-scripts
```

Custom.conf
```
shared_preload_libraries = 'pg_partman_bgw'
```

Startup.sql
```
CREATE EXTENSION IF NOT EXISTS pg_partman CASCADE;
CREATE EXTENSION IF NOT EXISTS temporal_tables;
```

Then, I start my database again
```
docker build -t example-local-image . && docker run -it --name local-tembo -p 5432:5432 --rm example-local-image
```

To check the extensions are enabled
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

Not to pat ourselves on the back too much, but seriously this is the best way to try out Postgres extensions! That only took me a few seconds to set up and now I’m ready to start experimenting with pg_partman. This allows me to focus my time on how this extension works and what I want to do with it, not on setup hassle. There is no other way to get up and running with extensions this fast.

### Making the version history partitioned

Reading the pg_partman documentation, here is what I came up with:

Dockerfile looks like this now:
```
FROM quay.io/tembo/tembo-local:latest

RUN trunk install pg_partman
RUN trunk install temporal_tables

COPY custom.conf $PGDATA/extra-configs
COPY 0_startup.sql $PGDATA/startup-scripts
COPY 1_create_versioned_table.sql $PGDATA/startup-scripts
```
Above, now we have two sql scripts. I wanted to separate the `CREATE EXTENSION` part from my version history experiment.

custom.conf needed one adjustment:
```
shared_preload_libraries = 'pg_partman_bgw'
pg_partman_bgw.dbname = 'postgres'
```

0_startup.sql is the same:
```
CREATE EXTENSION IF NOT EXISTS temporal_tables;
CREATE EXTENSION IF NOT EXISTS pg_partman;
```

And here is my new script to create a versioned table, with a lifecycle policy!
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

### Testing version history and lifecycle policy

To save myself 1 year, I reconfigured the retention to 5 minutes, and partitioning interval to 1 minute. It’s little efficiency hacks like this that will keep your CEO happy with your release velocity.

Modified excerpt from  1_create_versioned_table.sql:
```sql
 SELECT create_parent('public.employees_history', 'created_at', 'native', '1 minute');
…
UPDATE part_config
    SET retention = '5 minutes',
        retention_keep_table = false,
        retention_keep_index = false
    WHERE parent_table = 'public.employees_history';
```
Note: I recommend you do not actually set this low of a partitioning interval, but I encourage you to do whatever you want.

Also, I had to add one more configuration for pg_partman.

custom.conf:
```
shared_preload_libraries = 'pg_partman_bgw'
pg_partman_bgw.dbname = 'postgres'

# Run background worker every 30 seconds
pg_partman_bgw.interval = 30
```

I restarted my container, so I am on a fresh and empty database, other than my startup scripts. I added data to the table, just like I did before:

```sql
INSERT INTO employees (name, department, salary)
VALUES ('Bernard Marx', 'Hatchery and Conditioning Centre', 10000);

INSERT INTO employees (name, department, salary)
VALUES ('Lenina Crowne', 'Hatchery and Conditioning Centre', 7000);

INSERT INTO employees (name, department, salary)
VALUES ('Helmholtz Watson', 'College of Emotional Engineering', 18500);
```

Then, I modified a few of the rows
```sql
UPDATE employees SET salary = 11200 WHERE name = 'Bernard Marx';
UPDATE employees SET salary = 11400 WHERE name = 'Bernard Marx';
UPDATE employees SET salary = 11600 WHERE name = 'Bernard Marx';
UPDATE employees SET salary = 11601 WHERE name = 'Lenina Crowne';
```

I waited a minute or so, then I did one more update:
```sql
UPDATE employees SET salary = 11600 WHERE name = 'Helmholtz Watson';
```

Checking what the data looks like shortly after updating:
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

Then, I tabbed over to Slack since I need to wait 5 minutes. 2 hours later, now we see:

```
postgres=# select * from employees_history;
 name | department | salary | sys_period | created_at
------+------------+--------+------------+------------
(0 rows)

```

I think that worked! Awesome!!

Here is a short, sped up video that shows the old versions expiring automatically.

TODO add embed link

Tip: use `\watch` to re-run the last command you ran over and over

## I don’t know… still seems too hard

If you want to try an extension without managing any of that, just use our cloud and you can flip a switch to turn on the extension you want.

[cloud.tembo.io](https://cloud.tembo.io)
