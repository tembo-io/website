---
title: How to upgrade an instance Postgres version.
description: This guide will walk you through the steps to upgrade an instance of Postgres to a newer version.
---

As Postgres publishes new releases, and previous releases are deprecated, you may find yourself needing to upgrade your instance to a newer version.

Before diving in, it's good to familiarize yourself with the methods presented the [official Postgres documentation on upgrading](https://www.postgresql.org/docs/current/upgrading.html), which this page is based on.

It's also important to note that, while this exercise utilizes Postgres versions 15 and 16, this workflow should apply to other versions.

## Method 1: Logical Backup

The `pg_dumpall` command works well for small data, or where cutover time isn't an issue. 

The following corresponds to [section 19.6.1](https://www.postgresql.org/docs/current/upgrading.html#UPGRADING-VIA-PGDUMPALL) in the above-mentioned docs. Further information can be found in our [how-to guide on backups and restores](https://tembo.io/docs/getting-started/postgres_guides/how-to-backup-and-restore-a-postgres-database).

Please note that it's recommended that you utilize the `pg_dumpall` program from the newer version of Postgres, to assure the most up-to-date features and compatibility.

### Orientation

Let's start with an instance of Postgres version 15, which we plan to upgrade to version 16. Right away, we can confirm the version of the Postgres instance, for example, via the following:

```sql
SELECT version();
```
```text
version
-----------------------------------------------------------------------
PostgreSQL 15.7 on x86_64-pc-linux-gnu, compiled by gcc (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0, 64-bit
(1 row)
```

For the purposes of this demonstration, we'll create an example table, `sample_table`, and insert some data into it:

```sql
CREATE TABLE sample_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sample_table (name, email) VALUES
('Alice', 'alice@example.com'),
('Bob', 'bob@example.com'),
('Charlie', 'charlie@example.com');
```

### Create a later version instance

Once complete, assure you either have an existing Postgres version 16 instance, or refer to our [getting started guide](https://tembo.io/docs/getting-started/getting_started) to create one.

For the purposes of this procedure, you'll need to [update the password](https://tembo.io/docs/product/cloud/security/update-postgres-password) of both instances to match one another, which is most straightforward via the [Tembo Cloud UI](https://tembo.io/docs/product/cloud/security/update-postgres-password#:~:text=specified%20security%20requirements.-,Through%20Tembo%20Cloud,-Navigate%20to%20the).

### Run pg_dumpall and Confirm Success

At this stage you're ready to update the following `pg_dumpall` command template to include your credentials and run from your terminal.

```bash
pg_dumpall -d 'postgresql://postgres:<your-password>@<your-current-host>:5432/postgres' | psql 'postgresql://postgres:<your-password>@<your-upgraded-host>:5432/postgres'
```

You'll be prompted to enter a password that will grant access to both databases.

You then then run the following in your higher version instance to confirm the data has been successfully migrated:

```sql
\dt

SELECT * FROM sample_table;
```

## Method 2: Logical Replication

Logical replication involves replicating changes at the statement or row level, allowing you to perform the upgrade with minimal downtime. This method is particularly useful for larger databases or when continuous availability is crucial. With logical replication there is a publisher and a subscriber, where the publisher sends changes to the subscriber.

The following corresponds to [section 19.6.3](https://www.postgresql.org/docs/current/upgrading.html#UPGRADING-VIA-REPLICATION) in the official Postgres documentation on upgrading. More information can be found in the extensive [logical replication](https://www.postgresql.org/docs/current/logical-replication.html) section.

### Configuring the Publisher

On your existing Postgres version 15 instance, you'll need to enable logical replication and create a publication. 

```sql
ALTER SYSTEM SET wal_level = logical;
SELECT pg_reload_conf();

CREATE PUBLICATION upgrade_pub FOR ALL TABLES;
```

You'll also need to create new table(s) in the higher version Postgres instance to recieve the data. 
If you need to revisit the table structure, you can do so with the following query:

```sql
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' and table_name = 'sample_table';
```
```text
    column_name    |          data_type          | character_maximum_length
-------------------+-----------------------------+--------------------------
 id                | integer                     |
 name              | character varying           |                      100
 email             | character varying           |                      100
 registration_date | timestamp without time zone |
(4 rows)
```

### Configuring the Subscriber

As mentioned in the previous step, you'll need to create a new table(s) in the higher version Postgres instance to receive the data:

```sql
CREATE TABLE sample_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Once complete, you can create a subscription using the credentials of the instance with the publication:

```sql
CREATE SUBSCRIPTION upgrade_sub
CONNECTION 'host=<host> port=5432 user=postgres password=<password> dbname=postgres'
PUBLICATION upgrade_pub;
```

### Confirmation and Clean up

One of the ways to confirm the success of the replication is to query the newly-created table in the higher version instance:

```sql
SELECT * FROM sample_table;
```
```text
 id |  name   |        email        |     registration_date
----+---------+---------------------+----------------------------
  1 | Alice   | alice@example.com   | 2024-07-18 10:29:29.211434
  2 | Bob     | bob@example.com     | 2024-07-18 10:29:29.211434
  3 | Charlie | charlie@example.com | 2024-07-18 10:29:29.211434
```

From there, you may want to clean up the publication and subscription. At any time, you can query the following to confirm the status of the publication and subscription:

```sql
SELECT * FROM pg_publication;
SELECT * FROM pg_subscription;
SELECT * FROM pg_stat_subscription;
```

To clean up, you can run the following:

```sql
DROP SUBSCRIPTION upgrade_sub;
DROP PUBLICATION upgrade_pub;
```