---
title: OLTP
sideBarTitle: OLTP
tags: [postgres, oltp, transactional]
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

-   `pg_stat_statements` comes pre-installed and enabled. It provides statistics on SQL statements executed by the database, which helps users analyze query performance and identify areas for optimization.

-   Extensions from [Trunk](https://pgt.dev) can be installed on-demand.

## Getting started

This guide will walk through setting up a transactional workload on Postgres using [AdventureWorks-for-Postgres](https://github.com/lorint/AdventureWorks-for-Postgres), a free resource available from Microsoft that's recommended for use on the [Postgres wiki](https://wiki.postgresql.org/wiki/Sample_Databases).

This example was chosen as it has a wide variety of tables that are designed to imitate what you might actually need or encounter when working with an actual OLTP database. It's also been around long enough that there are a lot of online SQL tutorials that work with this dataset for emulating real-world situations to help with learning SQL.

### Create a Tembo OLTP Stack instance

Navigate to [cloud.tembo.io](https://cloud.tembo.io) and create a new stack. Select the "OLTP" Stack type and configure the name, Postgres version, cloud provider, region, instance type, and size. This guide will function on the hobby tier, but it is recommended to use a larger instance for production workloads.

### Setup

Once you've established a Tembo OLTP Stack instance, you can copy the connection string from the UI and execute it in your terminal.

Alternatively, you can fill in and run the following `psql` command:

```bash
psql 'postgresql://postgres:<your-password>@<your-host>:5432/postgres'
```

The `pg_stat_statements` and `plpgsql` extensions should be pre-installed and enabled on the `postgres` database.

```sql
postgres=# \dx
                                            List of installed extensions
        Name        | Version |   Schema   |                              Description                               
--------------------+---------+------------+------------------------------------------------------------------------
 pg_stat_statements | 1.10    | public     | track planning and execution statistics of all SQL statements executed
 plpgsql            | 1.0     | pg_catalog | PL/pgSQL procedural language
 (2 row)
```

While you're here, go ahead and create the Adventureworks database for us to load the sample dataset into.

```bash
CREATE DATABASE Adventureworks;
```

### Load a sample dataset

Next, let's set up the sample dataset. In this example, we'll be using [AdventureWorks-for-Postgres](https://github.com/lorint/AdventureWorks-for-Postgres).

#### Enable extensions

First, in your Tembo Cloud dashboard, navigate to your Instance, select Extensions in the menu on the left, and from there select the "Explore" tab. Here, you'll want to search for, install, and enable `uuid-ossp` and `tablefunc` as extensions to your instance.

#### Download resources

Once you're done, clone the original `AdventureWorks-for-Postgres` repository for the setup script, and then grab the sample dataset from Microsoft's servers.

```bash
git clone https://github.com/lorint/AdventureWorks-for-Postgres.git
cd AdventureWorks-for-Postgres
wget --no-verbose --continue 'https://github.com/Microsoft/sql-server-samples/releases/download/adventureworks/AdventureWorks-oltp-install-script.zip'
tar -xvf AdventureWorks-oltp-install-script.zip
```

#### Load CSV files

Next, you'll use Ruby to update the CSV files for use with Postgres and then apply the install script to the Adventureworks database we created earlier on your Postgres instance.
```bash
ruby update_csvs.rb
psql 'postgresql://postgres:<your-password>@<your-host>:5432/Adventureworks' < install.sql 
```

#### Verify schemas

Great! Let's connect to the Adventureworks database and verify the resources we created are there.
```bash
psql 'postgresql://postgres:<your-password>@<your-host>:5432/Adventureworks'
\dt (humanresources|person|production|purchasing|sales).*~
```

You're ready to go to start interacting with this example OLTP dataset.

### Execute transactional queries on the table

Transactions in SQL are simply sequences of CRUD (Create, Read, Update, Delete) operations that are performed on a database. So, you can test the OLTP stack by simply interacting with the database.

Here's a few examples of queries you can try.

#### Create a table record.

_Insert a new product review record into the ProductReview table wtihin the Production schema._ 

```sql
INSERT INTO Production.ProductReview (ProductReviewID, ProductID, ReviewerName, ReviewDate, EmailAddress, Rating, Comments, ModifiedDate) 
VALUES (5, 709, 'Jane Doe', '2024-06-05 00:00:00', 'user@test.com', 5, 'Test product review', '2024-06-06 00:00:00');
```

Result:

```text
INSERT 0 1
```

#### Read a table record.

_Let's view the table record we just created._

```sql
SELECT * FROM Production.ProductReview WHERE ProductReviewID = 5;
```

Result:

```text
-[ RECORD 1 ]---+--------------------
productreviewid | 5
productid       | 709
reviewername    | Jane Doe
reviewdate      | 2024-06-05 00:00:00
emailaddress    | user@test.com
rating          | 5
comments        | Test product review
modifieddate    | 2024-06-06 00:00:00
```

#### Alter a table record.

_Let's update the comment and modified date on this review._

```sql
UPDATE Production.ProductReview 
SET 
  comments = 'Updated product review!', 
  modifieddate = '2024-06-07 00:00:00' 
WHERE productreviewid = 5;
```

Result:

```text
UPDATE 1
```

If you re-run the same `SELECT` query from earlier, you'll notice the updated results:

```sql
SELECT * FROM Production.ProductReview 
WHERE ProductReviewID = 5;
```

Result:

```text
-[ RECORD 1 ]---+-----------------------
productreviewid | 5
productid       | 709
reviewername    | Jane Doe
reviewdate      | 2024-06-05 00:00:00
emailaddress    | user@test.com
rating          | 5
comments        | Updated product review!
modifieddate    | 2024-06-07 00:00:00
```

#### Delete a table record.

_After all that, let's delete the table record we created._

```sql
DELETE FROM Production.ProductReview WHERE ProductReviewId = 5;
```

Result:

```text
DELETE 1
```

## Support

Join the Tembo Community [in Slack](https://join.slack.com/t/tembocommunity/shared_invite/zt-293gc1k0k-3K8z~eKW1SEIfrqEI~5_yw) to ask a question or see how others are building on [https://cloud.tembo.io](Tembo).
