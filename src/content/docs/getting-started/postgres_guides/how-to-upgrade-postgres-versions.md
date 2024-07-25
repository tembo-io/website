---
title: How to upgrade an instance Postgres version.
description: This guide will walk you through the steps to upgrade an instance of Postgres to a newer version.
---

As Postgres continues to publish new releases, and previous iterations are deprecated, you may find yourself needing to upgrade your instance to a newer version. This guide will help you achieve that.

Before diving in, it's good to reference the [official Postgres documentation on upgrading](https://www.postgresql.org/docs/current/upgrading.html).

It's also important to note that, while this exercise utilizes Postgres versions 15 and 16, the same workflow applies to other versions.

## Table of Contents
- [pg_dumpall](#pg_dumpall)
- [Logical Replication](#logical-replication)

## `pg_dumpall`

Running the `pg_dumpall` command works well for small instances, or where cut-over time isn't an issue. The following corresponds to [section 19.6.1](https://www.postgresql.org/docs/current/upgrading.html#UPGRADING-VIA-PGDUMPALL) in the above-mentioned docs. Further information can be found in our [how-to guide on backups and restores](https://tembo.io/docs/getting-started/postgres_guides/how-to-backup-and-restore-a-postgres-database).

Please note that it's recommended that you utilize the `pg_dumpall` program from the newer version of Postgres, to assure the most up-to-date features and compatibility.

### Step 1: Orientation

Let's start with an instance of Postgres version 15, which we plan to upgrade to version 16. We can check the version via `psql` and later confirm the update by running the following command within Postgres:

```sql
SELECT version();
                                                version
-------------------------------------------------------------------------------------------------------
 PostgreSQL 15.7 on x86_64-pc-linux-gnu, compiled by gcc (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0, 64-bit
(1 row)
```

For the purposes of this demonstration, we'll create a simple table and insert some data into it.

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

### Step 2: Create / Assure Access to a Higher Version Instance

Once complete, assure you either have an existing Postgres version 16 instance, or refer to our [getting started guide](https://tembo.io/docs/getting-started/getting_started) to create one.

For the purposes of this migration, you'll need to [update the password](https://tembo.io/docs/product/cloud/security/update-postgres-password) of both instances to match one another, which is most straightforward via the [Tembo Cloud UI](https://tembo.io/docs/product/cloud/security/update-postgres-password#:~:text=specified%20security%20requirements.-,Through%20Tembo%20Cloud,-Navigate%20to%20the).

### Step 3: Run the pg_dumpall command and confirm the successful upgrade

At this stage you're ready to the simple `pg_dumpall` command from your terminal.

```bash
pg_dumpall -d 'postgresql://postgres:<your-password>@<your-current-host>:5432/postgres' | psql 'postgresql://postgres:<your-password>@<your-upgraded-host>:5432/postgres'
```

During this process, you'll be prompted to enter a password that will grant access to both databases.

If we then psql into the upgraded instance, we can confirm the data transfer.

## Logical Replication

Logical replication involves replicating changes at the statement or row level, allowing you to perform the upgrade with minimal downtime. This method is particularly useful for larger databases or when continuous availability is crucial. With logical replication there is a publisher and a subscriber, where the publisher sends changes to the subscriber.

### Configuring the Publisher

On your existing PostgreSQL 15 instance, configure it as the publisher (as superuser):

```sql
   -- Enable logical replication on the publisher
   ALTER SYSTEM SET wal_level = logical;
   SELECT pg_reload_conf();
```

```sql
CREATE PUBLICATION upgrade_pub FOR ALL TABLES;
```

we also want to see the information from our previously-created `sample_table`:

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

```sql
CREATE TABLE sample_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

```sql
select * from sample_table;
 id | name | email | registration_date
----+------+-------+-------------------
(0 rows)
```

```sql
-- Create a subscription
CREATE SUBSCRIPTION upgrade_sub
CONNECTION 'host=<host> port=5432 user=postgres password=<password> dbname=postgres'
PUBLICATION upgrade_pub;
```

```sql
postgres=# postgres=# select * from sample_table;
 id |  name   |        email        |     registration_date
----+---------+---------------------+----------------------------
  1 | Alice   | alice@example.com   | 2024-07-18 10:29:29.211434
  2 | Bob     | bob@example.com     | 2024-07-18 10:29:29.211434
  3 | Charlie | charlie@example.com | 2024-07-18 10:29:29.211434
(3 rows)
```

### Confirmation and Clean up

```sql
SELECT * FROM pg_publication;
```

```sql
SELECT * FROM pg_subscription;
```

```sql
SELECT * FROM pg_stat_subscription;
```

```sql
DROP SUBSCRIPTION upgrade_sub;
DROP PUBLICATION upgrade_pub;
```

## Support

If you have any questions related to your Postgres version, or suggestions to improve this guide, please reach out to us at either of the following:

- [Contact form](https://tembo.io/contact)
- [support@tembo.io](mailto:support@tembo.io)
