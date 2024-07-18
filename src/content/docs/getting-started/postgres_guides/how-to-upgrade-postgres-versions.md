---
title: How to upgrade an instance Postgres version.
description: This guide will walk you through the steps to upgrade an instance of Postgres to a newer version.
---

As Postgres continues to publish new releases, and previous iterations are deprecated, you may find yourself needing to upgrade your instance to a newer version. This guide will help you achieve that.

Before diving in, it's good to reference the [official Postgres documentation on upgrading](https://www.postgresql.org/docs/current/upgrading.html).

It's also important to note that while this exercise utilizes Postgres versions 15 and 16, the same workflow applies to other versions.

## pg_dumpall

Running the `pg_dumpall` command works well for small instances, or where cut-over time isn't an issue. The following corresponds to [section 19.6.1](https://www.postgresql.org/docs/current/upgrading.html#UPGRADING-VIA-PGDUMPALL) in the above-mentioned docs. Further information can be found in our [how-to guide on backups and restores](https://tembo.io/docs/getting-started/postgres_guides/how-to-backup-and-restore-a-postgres-database).

### Step 1: Orientation

Let's start with an instance of Postgres version 15, which we plan to upgrade to version 16. We can check the version via `psql` and later confirm the update by running the following command within Postgres:

```sql
SELECT version();
                                                version
-------------------------------------------------------------------------------------------------------
 PostgreSQL 15.7 on x86_64-pc-linux-gnu, compiled by gcc (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0, 64-bit
(1 row)
```
```sql
-- Create the table
CREATE TABLE sample_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data into the table
INSERT INTO sample_table (name, email) VALUES
('Alice', 'alice@example.com'),
('Bob', 'bob@example.com'),
('Charlie', 'charlie@example.com');
```

### Step 2: Create a new instance on Tembo Cloud and 

Set the passwords of each instance to be the same.

### Step 3: Run the pg_dumpall command and confirm the successful upgrade


```bash
pg_dumpall -d 'postgresql://postgres:<your-password>@<your-current-host>:5432/postgres' | psql 'postgresql://postgres:<your-password>@<your-upgraded-host>:5432/postgres'
```

If we then psql into the upgraded instance, we can confirm the data transfer.

## Logical Replication

Use `logical replication` into a new cluster. Best for medium to large instances, or where downtime needs to be minimized.

This corresponds to [section 19.6.3](https://www.postgresql.org/docs/current/upgrading.html#UPGRADING-VIA-REPLICATION) in the above docs.

## Support

If you have any questions related to your Postgres version, or suggestions to improve this guide, please reach out to us at either of the following:

- [Contact form](https://tembo.io/contact)
- [support@tembo.io](mailto:support@tembo.io)
