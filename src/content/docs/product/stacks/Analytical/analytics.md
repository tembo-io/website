---
title: Analytics
sideBarTitle: Analytics
sideBarPosition: 305
tags: [postgresql, paradedb, analytics]
---

Tembo's Analytics stack enables you to efficiently query large amounts of "off-site" data (such as S3 parquet files) easily. The stack is tuned for analytics workloads.

## Extensions

- [pg_lakehouse](https://pgt.dev/extensions/pg_lakehouse) - provides implementations of various foreign data wrappers for querying diverse table formats (Iceberg, Delta lake, etc.) in S3 and other backing stores. DuckDB ensures efficient query plans
- [pg_partman](https://pgt.dev/extensions/pg_partman) - simplifies and automates partitioning of large database tables
- [pg_cron](https://pgt.dev/extensions/pg_cron) - for scheduling maintenance operations

## Getting started

This guide will demonstrate how to query a parquet table stored in an S3 bucket.

## Preparing your database

Simply launch an Analytics stack in Tembo Cloud and wait for the database to be ready in the UI.

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

After creating the table, querying can begin immediately. Note that the column names and types for this table have automatically been inferred from the parquet file itself…

```sql
SELECT vendorid, passenger_count, trip_distance FROM trips LIMIT 1;
```
```
┌──────────┬─────────────────┬───────────────┐
│ vendorid │ passenger_count │ trip_distance │
├──────────┼─────────────────┼───────────────┤
│        2 │               1 │          1.72 │
└──────────┴─────────────────┴───────────────┘
```

```sql
SELECT COUNT(*) FROM trips;
```
```
┌──────────┐
│  count   │
├──────────┤
│  2964624 │
└──────────┘
```

## Other Formats

Though the above example specifies a [Parquet](https://docs.paradedb.com/ingest/import/parquet) file for use, `pg_lakehouse` supports several different formats, each with its own `FOREIGN DATA WRAPPER`:

  - [CSV](https://docs.paradedb.com/ingest/import/csv) — comma-separated values, the classic
  - [Delta](https://docs.paradedb.com/ingest/import/delta) — Delta tables, enhanced Parquet tables with transactional capabilities
  - [Iceberg](https://docs.paradedb.com/ingest/import/iceberg) — from the Apache Iceberg project, designed for large analytic data sets
  - [Spatial](https://docs.paradedb.com/ingest/import/spatial) — for querying `geojson` or similar

## Other Stores

By varying the URI scheme in the `files` option provided when creating a `FOREIGN TABLE`, users can easily make use of alternate object stores. `s3` (AWS), `az` (Azure), `r2` (Cloudflare), `gs` (Google Cloud Storage), `https`, and `hf` (Hugging Face data sets) are all easily supported.

### Authentication

`pg_lakehouse` relies on the use of the SQL-standard [`CREATE USER MAPPING` command](https://www.postgresql.org/docs/current/sql-createusermapping.html) to specify credentials to be used when connecting to remote object stores. For instance, one might configure S3 credentials like so:

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

PostgreSQL has support for a special `PUBLIC` user, which will be the fallback if no specific user is found. See `pg_lakehouse`'s documentation for individual object stores (for instance, [S3's object store](https://docs.paradedb.com/ingest/object_stores/s3)) for full information about supported parameters.

## Additional Reading

ParadeDB's [data ingest documentation](https://docs.paradedb.com/ingest/quickstart) has complete information about the configuration and use of `pg_lakehouse`.
