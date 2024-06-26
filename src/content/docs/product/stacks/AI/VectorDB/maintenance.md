---
title: Embedding Maintenance
sideBarTitle: Embedding Maintenance
sideBarPosition: 3
description: Keeping embeddings up-to-date with pg_vectorize
tags: [postgres, vectordb, ai]
---

Embeddings are immediately computed for your data when `vectorize.table()` is called.
 Inevitably, data changes and embeddings need to be updated.
 pg_vectorize automates two methods of keeping embeddings up-to-date; trigger-based and on a recurring interval.

The trigger-based method is just that - it creates [triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html) on the source table which handle generating embeddings for the raw text whenever a new row is inserted or an existing row is updated.

The interval-based method uses a cron-like syntax to check for updates on a recurring basis and is made possible by [pg_cron](https://github.com/citusdata/pg_cron).

In both cases, when there are new records without embeddings or existing records have been updated, jobs are enqueued to [pgmq](https://github.com/tembo-io/pgmq) to update the embeddings.
 A background worker handles the upsert of the embeddings accordingly, and all the compute of the transform of text to embeddings happens on separate compute infrastructure than Postgres,
 ensuring that your database resources are not consumed by the compute-intensive task of transforming text to embeddings.

## Updating embeddings with triggers

Setting the parameter `schedule => 'realtime'` will create triggers on the table to create embedding update jobs whenever a new row is inserted or an existing row is updated.

```sql
SELECT vectorize.table(
    job_name    => 'my_search_project',
    "table"     => 'products',
    primary_key => 'product_id',
    columns     => ARRAY['product_name', 'description'],
    transformer => 'sentence-transformers/all-MiniLM-L6-v2',
    schedule    => 'realtime'
);
```

## Interval updates with pg_cron

The schedule parameter accepts a cron-like syntax to check for updates on a recurring basis.

For example, to check for updates every hour, set the schedule parameter to `0 * * * *`.

Using this method, you will also be required to provide the column that contains the last updated timestamp.

`pg_vectorize` uses this column to determine which rows have been updated since the last time the embeddings were updated.

```sql
SELECT vectorize.table(
    job_name    => 'my_search_project',
    "table"     => 'products',
    primary_key => 'product_id',
    columns     => ARRAY['product_name', 'description'],
    transformer => 'sentence-transformers/all-MiniLM-L6-v2',
    update_col  => 'last_updated_at',
    schedule    => '0 * * * *'
);
```

The cron job can then be viewed by running the following SQL command.

```sql
select command, jobname from cron.job where jobname = 'my_search_project';
```

```text
                      command                      |      jobname
---------------------------------------------------+-------------------
 select vectorize.job_execute('my_search_project') | my_search_project
```

### On-demand updates

If you need to update the embeddings on an ad-hoc basis, you can do so by calling `vectorize.job_execute()`.

```sql
SELECT vectorize.job_execute('my_search_project');
```

## Summary

In both cases, pg_vectorize relies on existing features of Postgres (triggers) and existing extensions (pg_cron) to handle embedding maintenance.
 As a user of pg_vectorize, these are configured for you depending on how you've called `vectorize.table()`.
