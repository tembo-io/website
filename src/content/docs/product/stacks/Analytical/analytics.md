---
title: Analytics
sideBarTitle: Analytics
sideBarPosition: 305
tags: [postgresql, paradedb, analytics]
---

Tembo's Analytics Stack provides a Postgres database which is tuned for efficient querying of large amounts of data stored locally in Postgres or on remote storage such as S3. The S3 querying functionality is powered by [pg_analytics](https://github.com/paradedb/paradedb/tree/dev/pg_analytics).

## Extensions

-   `pg_stat_statements` provides statistics on SQL statements executed by the database. It helps users analyze query performance and identify areas for optimization.
- [pg_analytics](https://github.com/paradedb/paradedb/tree/dev/pg_analytics) - provides implementations of various foreign data wrappers for querying diverse table formats (Iceberg, Delta lake, etc.) in S3 and other backing stores. DuckDB ensures efficient query plans
- [pg_partman](https://pgt.dev/extensions/pg_partman) - simplifies and automates partitioning of large database tables
- [pg_cron](https://pgt.dev/extensions/pg_cron) - for scheduling maintenance operations
- [hydra_columnar](https://pgt.dev/extensions/hydra_columnar) - `hydra_columnar` is open source, column-oriented Postgres, designed for high-speed aggregate operations.
- [postgres_fdw](https://pgt.dev/extensions/postgres_fdw) - `postgres_fdw` provides the foreign data wrapper necessary to access data stored in external Postgres servers.
- [wrappers](https://pgt.dev/extensions/wrappers) - `wrappers` is a development framework for Postgres Foreign Data Wrappers (FDW), written in Rust. It also comes with collection of FDWs built by Supabase.
- [pg_parquet](https://pgt.dev/extensions/pg_parquet) - `pg_parquet` is a PostgreSQL extension that allows you to read and write Parquet files, which are located in S3 or file system, from PostgreSQL via COPY TO/FROM commands.
- [pg_later](https://pgt.dev/extensions/pg_later) - `pg_later` is a PostgreSQL extension to execute queries asynchronously.
-   Extensions from [Trunk](https://pgt.dev) can be installed on-demand.

## Getting started

This guide will demonstrate how to query a parquet table stored in an S3 bucket. All actions in the [OLAP](/docs/product/stacks/analytical/olap) and [Data Warehouse](/docs/product/stacks/analytical/data-warehouse) guides can also be achieved with this stack.

## Preparing your database

Simply [launch](https://tembo.io/docs/product/cloud/configuration-and-management/create-instance) an Analytics stack in Tembo Cloud and wait for the database to be ready in the UI.

Once that's up and running, you'll need a client machine with `psql` (to connect to your database). Our parquet file is available in a public S3 bucket.

### Getting `psql`

If you need help installing `psql`, finding instructions for you platform should be relatively straightforward:

  * Mac — Homebrew's `libpq` package includes `psql`
  * Ubuntu/Debian — the `postgresql-client` apt package provides `psql`
  * Windows — [EDB's installers](https://www.postgresql.org/download/windows/) can help

### Create the foreign table

Foreign data wrappers can be a little verbose to use, but the gist is a wrapper must be declared first, then a server using that wrapper, then a table using that server:

```sql
CREATE FOREIGN DATA WRAPPER parquet_wrapper
  HANDLER parquet_fdw_handler
  VALIDATOR parquet_fdw_validator;

CREATE SERVER parquet_server
  FOREIGN DATA WRAPPER parquet_wrapper;

CREATE FOREIGN TABLE trips ()
  SERVER parquet_server
  OPTIONS (files 's3://tembo-demo-bucket/yellow_tripdata_2024-01.parquet');
```

After creating the table, querying can begin immediately. Note that the column names and types for this table have automatically been inferred from the parquet file itself.

```sql
SELECT vendorid, passenger_count, trip_distance FROM trips LIMIT 1;
```

```plaintext
 vendorid | passenger_count | trip_distance 
----------+-----------------+---------------
        2 |               1 |          1.72
(1 row)
```

```sql
SELECT COUNT(*) FROM trips;
```

```plaintext
  count  
---------
 2964624
(1 row)
```

## Executing Analytical Queries

Executing aggregates and analytics queries on the data that is in S3 works exactly the same as if that data were in Postgres.
 For example, the business time of time of day when the most trips are taken can be determined with a simple query:

```sql
SELECT 
  EXTRACT(HOUR FROM tpep_pickup_datetime) AS pickup_hour,
  COUNT(*) AS total_records
FROM trips
GROUP BY pickup_hour
ORDER BY pickup_hour;
```

```plaintext
 pickup_hour | total_records 
-------------+---------------
           0 |         79094
           1 |         53627
           2 |         37517
           3 |         24811
           4 |         16742
           5 |         18764
           6 |         41429
           7 |         83719
           8 |        117209
           9 |        128970
          10 |        138778
          11 |        150542
          12 |        164559
          13 |        169903
          14 |        182898
          15 |        189359
          16 |        190201
          17 |        206257
          18 |        212788
          19 |        184032
          20 |        159989
          21 |        160888
          22 |        143261
          23 |        109287
(24 rows)

Time: 694.308 ms
```

## Performance enabled by DuckDB

We can quickly compare this to running the same query but with the data locally in Postgres and without using ParadeDB's DuckDB powered extensions.

First, create a local table and populate it with the same data from S3.

```sql
CREATE TABLE local_trips (LIKE trips INCLUDING ALL);
INSERT INTO local_trips SELECT * FROM trips;
```

Then run the same query on the local Postgres table.
 Notice the execution time being nearly 5x faster it is enabled by DuckDB.

```sql
SELECT 
  EXTRACT(HOUR FROM tpep_pickup_datetime) AS pickup_hour,
  COUNT(*) AS total_records
FROM trips
GROUP BY pickup_hour
ORDER BY pickup_hour;
```

```plaintext
 pickup_hour | total_records 
-------------+---------------
           0 |         79094
           1 |         53627
           2 |         37517
           3 |         24811
           4 |         16742
           5 |         18764
           6 |         41429
           7 |         83719
           8 |        117209
           9 |        128970
          10 |        138778
          11 |        150542
          12 |        164559
          13 |        169903
          14 |        182898
          15 |        189359
          16 |        190201
          17 |        206257
          18 |        212788
          19 |        184032
          20 |        159989
          21 |        160888
          22 |        143261
          23 |        109287
(24 rows)

Time: 3317.911 ms (00:03.318)
```

## Other Formats

Though the above example specifies a [Parquet](https://docs.paradedb.com/ingest/import/parquet) file for use, `pg_analytics` supports several different formats, each with its own `FOREIGN DATA WRAPPER`:

- [CSV](https://docs.paradedb.com/ingest/import/csv) — comma-separated values, the classic
- [Delta](https://docs.paradedb.com/ingest/import/delta) — Delta tables, enhanced Parquet tables with transactional capabilities
- [Iceberg](https://docs.paradedb.com/ingest/import/iceberg) — from the Apache Iceberg project, designed for large analytic data sets
- [Spatial](https://docs.paradedb.com/ingest/import/spatial) — for querying `geojson` or similar

By varying the URI scheme in the `files` option provided when creating a `FOREIGN TABLE`, users can easily make use of alternate object stores. `s3` (AWS), `az` (Azure), `r2` (Cloudflare), `gs` (Google Cloud Storage), `https`, and `hf` (Hugging Face data sets) are all easily supported.

### Authentication

`pg_analytics` relies on the use of the SQL-standard [`CREATE USER MAPPING` command](https://www.postgresql.org/docs/current/sql-createusermapping.html) to specify credentials to be used when connecting to remote object stores. For instance, one might configure S3 credentials like so:

```sql
CREATE USER MAPPING FOR marketing_analytics
SERVER s3_foreign_server
OPTIONS (
  type 'S3',
  key_id 'AKIAIOSFODNN7EXAMPLE',
  secret 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  region 'us-east-1'
);
```

PostgreSQL has support for a special `PUBLIC` user, which will be the fallback if no specific user is found. See `pg_analytics`'s documentation for individual object stores (for instance, [S3's object store](https://docs.paradedb.com/ingest/object_stores/s3)) for full information about supported parameters.

## Additional Reading

ParadeDB's [data ingest documentation](https://docs.paradedb.com/ingest/quickstart) has complete information about the configuration and use of `pg_analytics`.
